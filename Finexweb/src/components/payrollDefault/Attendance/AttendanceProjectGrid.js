import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
} from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  PayrollAttendance,
  PayrollEmployeeSetup,
  TimeCardLeaveBalance
} from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import { FormCheckbox, FormDatePicker, FormInput } from "../../form-components";
import EmployeeAttendence from "../EmployeeAttendence";
import PayrollEmployeeHistory from "../payroll/PayrollEmployeeHistoryModal";
import AttendanceFilter from "./AttendanceFilter";
import AttendanceGrid from "./AttendanceGrid";
const AttendanceProjectGrid = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  let [selectedPayrollDateRecord, setSelectedPayrollDateRecord] =
    useState(null);
  const [filterData, setFilterData] = useState({
    payStart: null,
    payEnd: null,
    postDate: null,
  });
  const [projectOptions, setProjectOptions] = useState([]);
  const [TimecardLeaveBalanceData, setTimecardLeaveBalanceData] = useState({});
  let [formData, setFormData] = useState({});
  const [formKey, setFormKey] = useState(1);
  let [checkBoxFormData, setCheckBoxFormData] = useState({});
  const [checkboxFormKey, setCheckboxFormKey] = useState(1);

  const [employeePopupHistoryVisible, setEmployeePopupHistoryVisible] =
    useState(false);
  const [pageTotal, setPageTotal] = useState();
  const [bindDataGrid, setBindDataGrid] = useState({
    employeeNumberFilter: "",
    fullName: "",
    desc: false,
    sortKey: "Employee.lastName",
    skip: 0,
    take: 10,
    filterInactiveInd: false
  });

  const viewEmployeeHistoryPopup = () => {
    setEmployeePopupHistoryVisible(!employeePopupHistoryVisible);
  };

  useEffect(() => {
    getEmployeeByPaidDate();
  }, []);

  useEffect(() => {
    const getData = setTimeout(() => {
      getEmployeeByPaidDate();
    }, 500);
    return () => clearTimeout(getData);
  }, [bindDataGrid]);

  useEffect(() => {
    if (filterData.datePaid && selectedProject) {
      let year = new Date(filterData.datePaid).getFullYear();
      setTimecardLeaveBalanceData({});
      getTimecardLeaveBalance(selectedProject?.empId, year);
    }
  }, [filterData.datePaid, selectedProject]);

  const getEmployeeByPaidDate = () => {
    axiosInstance({
      method: "GET",
      url:
        PayrollEmployeeSetup.getEmployeeGridData +
        `?skip=0&take=0&fullNameFilter=${bindDataGrid.fullName}&sortKey=${bindDataGrid.sortKey}&desc=${bindDataGrid.desc}&employeeNumberFilter=${bindDataGrid.employeeNumberFilter}&activeIND=${bindDataGrid.filterInactiveInd ? "N" : "Y"}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response?.data?.data || [];
        setProjectOptions([
          ...data.map((item) => ({
            ...item,
            employeeNumber: item.employee.employeeNumber,
            fullName: item.employee.displayName,
          })),
        ]);
        let firstRecord = data[0];
        setPageTotal(response?.data?.total);
        let record = {};
        if (selectedProject) {
          record = response?.data?.data?.find(
            (x) => x.empId == selectedProject.empId
          );
        } else {
          record = firstRecord;
          setSelectedProject({ ...record });
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.text,
          bindDataGrid.empNo,
          bindDataGrid.groupNo,
          bindDataGrid.search,
          bindDataGrid.cskip,
          bindDataGrid.ctake,
          bindDataGrid.desc,
          bindDataGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);
  }, [bindDataGrid]);

  const BindDataGrid = async () => { };

  const getTimecardLeaveBalance = (empId, year) => {
    if (empId && year) {
      let inputdata = {
        EmpId: empId,
        iWhatYear: year,
      };
      if (empId) {
        axiosInstance({
          method: "POST",
          url: TimeCardLeaveBalance.TimecardLeaveBalance,
          data: inputdata,
          withCredentials: false,
        })
          .then((response) => {
            setTimecardLeaveBalanceData(response.data);
            formData = {
              ...formData,
              fmlaHoursUsed: response.data?.FMLAUsedBox,
            };
            setFormData({ ...formData });
            GetAttendancePayrollFMLAandLWOP();
          })
          .catch(() => {
            formData = { ...formData, fmlaHoursUsed: 0 };
            setFormData({ ...formData });
          });
          axiosInstance({
            method: "GET",
            url: TimeCardLeaveBalance.GetVSP+"/"+empId,
            withCredentials: false,
          })
            .then((response) => {})
            .catch(() => {
              formData = { ...formData, fmlaHoursUsed: 0 };
              setFormData({ ...formData });
            });
      }
    }
  };

  useEffect(() => {
    setFormKey(formKey + 1);
  }, [formData]);

  useEffect(() => {
    if (selectedPayrollDateRecord) {
      setCheckBoxFormData({
        FamilyLeaveAct: selectedPayrollDateRecord.FamilyLeaveAct,
        WcTrack: selectedPayrollDateRecord.WcTrack,
      });
      setCheckboxFormKey(checkboxFormKey + 1);
    } else {
      setCheckBoxFormData({});
      setCheckboxFormKey(checkboxFormKey + 1);
    }
  }, [selectedPayrollDateRecord]);

  const getFieldData = (e) => {
    formData = { ...formData, [e.target.name]: e.target.value };
    setFormData({ ...formData });
    UpdatePayrollEmpSetup(formData);
  };

  const getCheckboxFieldData = (e) => {
    checkBoxFormData = {
      ...checkBoxFormData,
      WcTrack: false,
      FamilyLeaveAct: false,
      [e.target.name]: e.value,
    };
    setCheckBoxFormData({ ...checkBoxFormData });
    if (selectedPayrollDateRecord) {
      selectedPayrollDateRecord = {
        ...selectedPayrollDateRecord,
        ...checkBoxFormData,
      };
      setSelectedPayrollDateRecord({ ...selectedPayrollDateRecord });
      if (selectedPayrollDateRecord.AttendanceId) {
        savePayrollAttendanceDetail(selectedPayrollDateRecord);
      }
    }
  };

  const savePayrollAttendanceDetail = (data) => {
    axiosInstance({
      method: "POST",
      url: PayrollAttendance.UpdateAttendance,
      data: data,
      withCredentials: false,
    })
      .then((response) => {
        let year = new Date(filterData.datePaid).getFullYear();
        getTimecardLeaveBalance(selectedProject?.empId, year);
      })
      .catch(() => { });
  };

  const UpdatePayrollEmpSetup = ({ fmlaStartDate, lwopStartDate }) => {
    let payload = {
      fmlaStartDate: fmlaStartDate
        ? new Date(fmlaStartDate)?.toLocaleDateString()
        : "",
      lwopStartDate: lwopStartDate
        ? new Date(lwopStartDate)?.toLocaleDateString()
        : "",
      empId: selectedProject.empId,
    };
    axiosInstance({
      method: "POST",
      url: PayrollAttendance.UpdateAttendancePayrollFMLAandLWOP,
      data: payload,
      withCredentials: false,
    })
      .then(() => {
        let year = new Date(filterData.datePaid).getFullYear();
        getTimecardLeaveBalance(selectedProject?.empId, year);
      })
      .catch(() => {
        GetAttendancePayrollFMLAandLWOP();
      });
  };

  const GetAttendancePayrollFMLAandLWOP = () => {
    axiosInstance({
      method: "GET",
      url:
        PayrollAttendance.GetAttendancePayrollFMLAandLWOP +
        "?empId=" +
        selectedProject?.empId,
      withCredentials: false,
    })
      .then((response) => {
        let res = response.data;
        formData = {
          ...formData,
          fmlaStartDate: res?.fmlaStartDate ? new Date(res?.fmlaStartDate) : "",
          lwopStartDate: res?.lwopStartDate ? new Date(res?.lwopStartDate) : "",
          leaeWOPay: res?.leaeWOPay,
          fmlaHoursUsed: res?.fmlaHoursUsed,
        };
        setFormData({ ...formData });
      })
      .catch(() => {
        setFormData({});
      });
  };

  const IsPostDate = Boolean(filterData.postDate);
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollRun')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div>
      <div className="row" style={{ flexDirection: "row-reverse" }}>
        <div className="col-7 ms-auto">
          {checkPrivialgeGroup("PRAG", 1) && <AttendanceFilter
            filterData={filterData}
            setFilterData={setFilterData}
          />
          }
          <div className=" d-fex align-items-center p-0  my-4">
            <div className="k-card-deck attendanceBalanceCard">
              <Card>
                <CardBody>
                  <CardSubtitle>Sick Balance</CardSubtitle>
                  <CardTitle>
                    {Number(
                      TimecardLeaveBalanceData?.SickBalanceBox || 0
                    )?.toFixed(4)}
                  </CardTitle>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardSubtitle>Vaca Balance</CardSubtitle>
                  <CardTitle>
                    {Number(
                      TimecardLeaveBalanceData?.VacaBalanceBox || 0
                    )?.toFixed(4)}
                  </CardTitle>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardSubtitle>Pers Balance</CardSubtitle>
                  <CardTitle>
                    {Number(
                      TimecardLeaveBalanceData?.PersBalanceBox || 0
                    )?.toFixed(4)}
                  </CardTitle>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardSubtitle>Comp Balance</CardSubtitle>
                  <CardTitle>
                    {Number(
                      TimecardLeaveBalanceData?.CompBalanceBox || 0
                    )?.toFixed(4)}
                  </CardTitle>
                </CardBody>
              </Card>
            </div>
            {formData?.fmlaStartDate && (
              <div className="k-card-deck mt-3 attendanceBalanceCard">
                <Card>
                  <CardBody>
                    <CardSubtitle>FMLA Start</CardSubtitle>
                    <CardTitle>
                      {formData?.fmlaStartDate
                        ? formData?.fmlaStartDate?.toLocaleDateString()
                        : ""}
                    </CardTitle>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <CardSubtitle>FMLA Allowed</CardSubtitle>
                    <CardTitle>
                      {Number(
                        TimecardLeaveBalanceData?.FMLAAvaliableBox || 0
                      )?.toFixed(4)}
                    </CardTitle>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <CardSubtitle>FMLA Used</CardSubtitle>
                    <CardTitle>
                      {Number(
                        TimecardLeaveBalanceData?.FMLAUsedBox || 0
                      )?.toFixed(4)}
                    </CardTitle>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <CardSubtitle>FMLA Balance</CardSubtitle>
                    <CardTitle>
                      {Number(
                        TimecardLeaveBalanceData?.FMLABalance || 0
                      )?.toFixed(4)}
                    </CardTitle>
                  </CardBody>
                </Card>
              </div>
            )}
            <div className="d-flex">
              <div
                className="d-flex  k-flex-row gap-3 pb-3 align-items-end k-flex-wrap"
              >
                <Form
                  key={formKey}
                  initialValues={formData}
                  render={() => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <div
                          className="d-flex justify-content align-items-end k-w-full"
                          style={{
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Field
                            id={"fmlaStartDate"}
                            name={"fmlaStartDate"}
                            label={"FMLA Start Date"}
                            component={FormDatePicker}
                            disabled={IsPostDate}
                            onChange={getFieldData}
                            wrapperstyle={{
                              width: "200px",
                            }}
                          />
                          <Field
                            id={"lwopStartDate"}
                            name={"lwopStartDate"}
                            label={"LWOP Start Date"}
                            component={FormDatePicker}
                            onChange={getFieldData}
                            disabled={IsPostDate}
                            wrapperstyle={{
                              width: "200px",
                            }}
                          />
                        </div>
                        <div
                          className="d-flex justify-content align-items-end k-w-full"
                          style={{
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Field
                            id={"fmlaHoursUsed"}
                            name={"fmlaHoursUsed"}
                            label={"FMLA Hours Used"}
                            component={FormInput}
                            wrapperstyle={{
                              width: "200px",
                            }}
                            disabled={true}
                          />
                          <Field
                            id={"leaeWOPay"}
                            name={"leaeWOPay"}
                            label={"LWOP Days"}
                            component={FormInput}
                            wrapperstyle={{
                              width: "200px",
                            }}
                            disabled={true}
                          />
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </div>
              <div className="k-ml-10 k-mt-10">
                <Form
                  key={checkboxFormKey}
                  initialValues={checkBoxFormData}
                  render={() => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <div className="text-nowrap">
                          {checkPrivialgeGroup("PRATWCCB", 3) && <Field
                            id={"WcTrack"}
                            name={"WcTrack"}
                            label={"Track Workers Comp"}
                            component={FormCheckbox}
                            onChange={getCheckboxFieldData}
                            disabled={!selectedPayrollDateRecord || IsPostDate}
                            wrapperstyle={{
                              width: "200px",
                            }}
                          />}
                          {checkPrivialgeGroup("PRAFMLACB", 3) && <Field
                            id={"FamilyLeaveAct"}
                            name={"FamilyLeaveAct"}
                            label={"Family Medical Leave Act"}
                            component={FormCheckbox}
                            onChange={getCheckboxFieldData}
                            disabled={!selectedPayrollDateRecord || IsPostDate}
                            wrapperstyle={{
                              width: "200px",
                            }}
                          />}
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="col-5 mt-4"
        >
          <AttendanceGrid
            data={projectOptions}
            bindDataGrid={bindDataGrid}
            setBindDataGrid={setBindDataGrid}
            setData={setProjectOptions}
            setSelectedProject={setSelectedProject}
            selectedProject={selectedProject}
            pageTotal={pageTotal}
            setPageTotal={setPageTotal}
          />
        </div>
      </div>

      {selectedProject && checkPrivialgeGroup("PRAG", 1) && (
        <EmployeeAttendence
          projectOptions={projectOptions}
          filterData={filterData}
          checkBoxFormData={checkBoxFormData}
          selectedProject={selectedProject}
          selectedPayrollDateRecord={selectedPayrollDateRecord}
          setSelectedPayrollDateRecord={setSelectedPayrollDateRecord}
          TimecardLeaveBalanceData={TimecardLeaveBalanceData}
          getTimecardLeaveBalance={getTimecardLeaveBalance}
        />
      )}

      {employeePopupHistoryVisible && (
        <PayrollEmployeeHistory
          viewEmployeeHistoryPopup={viewEmployeeHistoryPopup}
          selectedProject={selectedProject}
        />
      )}
    </div>
  );
};

export default AttendanceProjectGrid;
