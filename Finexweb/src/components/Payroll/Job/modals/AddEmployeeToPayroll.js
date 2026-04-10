import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../../core/HttpInterceptor";
import {
  HolidayEndPoints,
  PayrollEmployee,
  PayrollEndPoints
} from "../../../../EndPoints";
import { useStartEndDatevalidator } from "../../../../helper/useStartEndDataValidator";
import { formatDate } from "../../../../utils/helpers/dateFormate";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormRadioGroup
} from "../../../form-components";
import { showSuccessNotification } from "../../../NotificationHandler/NotificationHandler";
import {
  employeeNameValidator,
  empSalaryHourly,
  noMonthsWorked,
  trueHourValidator
} from "../../../validators";

function AddEmployeeToPayroll({
  toggleAddEmployeeDialog,
  action,
  empId,
  TCEmployee,
  employeeData,
  onSuccess,
  getDataList,
}) {
  const {
    endDateError,
    selectedStartDate,
  } = useStartEndDatevalidator();
  const formRef = useRef();
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [formInit, setFormInit] = useState(null);

  const [formKey, setFormKey] = React.useState(1);
  const [jobClassList, setJobClassList] = useState([]);
  const [empWorkMonths, setEmpWorkMonths] = useState(null);
  const [unionData, setUnionData] = useState([]);

  const [salaryHourly, setSalaryHourly] = useState([]);
  const [holidayScheduleList, setHolidayScheduleList] = useState([]);
  const [isRangeShow, setIsRangeShow] = useState(false);
  const [contractYear, setcontractYear] = useState([]);
  const [contractYearList, setcontractYearList] = useState([]);

  const months = [9, 10, 11, 12];
  const fatchMonthData = async (month) => {
    await axiosInstance({
      method: "GET",
      url: PayrollEndPoints.ContractYearsList,
      withCredentials: false,
    })
      .then((response) => {
        setcontractYearList(response.data);
        if (month > 0) {
          let data = response.data.map((item) => {
            if (
              Number(item.months) == Number(month)
            ) {
              return {
                title: `${formatDate(item?.empYrStart)}-${formatDate(item?.empYrEnd)}`,
                value: {
                  startDate: item?.empYrStart,
                  endDate: item?.empYrEnd
                },
              }
            }
          }).filter(Boolean);

          setcontractYear(data);
        }
      })
      .catch((e) => {
        console.log(e, "error");
      });
  }
  useEffect(() => {
    if (action == "edit") {
      const data = employeeData?.find((item) => item.empId == empId);
      const findEmp = months.find((item) => item == data?.empWorkMonths) || months[0]
      fatchMonthData(findEmp)
      setFormInit({
        ...data,
        empId: empId,
        workYrStart: data.workYrStart ? new Date(data.workYrStart) : null,
        workYrStop: data.workYrStop ? new Date(data.workYrStop) : null,
        originalHiredDate: data.originalHiredDate
          ? new Date(data.originalHiredDate)
          : null,
        terminationDate: data.terminationDate
          ? new Date(data.terminationDate)
          : null,
        empMonthsWorked:
          months.find((item) => item == data?.empWorkMonths) || months[0],
        empName:
          TCEmployee.find((item) => item.id == data.empId) || TCEmployee[0],

        empSalaryHourly: salaryHourly.find(
          (item) => item.id == data.empPayType
        ),
        holidaySchedule:
          holidayScheduleList.find((item) => item.id == data.holidaysID) ||
          holidayScheduleList[0] ||
          null,

        county: TCEmployee?.find(
          (item) => item.id == data.empId
        )?.employeeAddresses?.find((item) => item.activeInd == "Y")?.county
          ?.countyName,
        ranges: {
          title: `${formatDate(data?.workYrStart)}-${formatDate(data?.workYrStop)}`,
          value: {
            startDate: data?.workYrStart,
            endDate: data?.workYrStop
          },
        }
      });
      setIsRangeShow(data?.empWorkMonths)
      setEmpWorkMonths(data?.empWorkMonths);
      setFormKey(formKey + 1);
    } else if (action == "add") {
      fatchMonthData(0)
      setFormKey(formKey + 1);
    }
  }, [salaryHourly]);

  useEffect(() => {
    if (action == "edit") {
      const data = employeeData?.find((item) => item.empId == empId);

      var holidayScheduleData = holidayScheduleList.find(
        (item) => item.id == data.holidaysID
      );

      setFormInit({
        ...data,
        empId: empId,
        workYrStart: data.workYrStart ? new Date(data.workYrStart) : null,
        workYrStop: data.workYrStop ? new Date(data.workYrStop) : null,
        originalHiredDate: data.originalHiredDate
          ? new Date(data.originalHiredDate)
          : null,
        terminationDate: data.terminationDate
          ? new Date(data.terminationDate)
          : null,
        empMonthsWorked:
          months.find((item) => item == data?.empWorkMonths) || months[0],
        empName:
          TCEmployee.find((item) => item.id == data.empId) || TCEmployee[0],

        empSalaryHourly: salaryHourly.find(
          (item) => item.id == data.empPayType
        ),
        holidaySchedule: holidayScheduleData || holidayScheduleList[0] || null,

        county: TCEmployee?.find(
          (item) => item.id == data.empId
        )?.employeeAddresses?.find((item) => item.activeInd == "Y")?.county
          ?.countyName,
        ranges: {
          title: `${formatDate(data?.workYrStart)}-${formatDate(data?.workYrStop)}`,
          value: {
            startDate: data?.workYrStart,
            endDate: data?.workYrStop
          },
        }
      });
      setEmpWorkMonths(data?.empWorkMonths);
      setFormKey(formKey + 1);
    } else if (action == "add") {
      setFormKey(formKey + 1);
    }
  }, [holidayScheduleList]);
  const fullTimeRadioData = [
    {
      label: "Yes",
      value: true,
    },
    {
      label: "No",
      value: false,
    },
  ];

  const onSubmit = async (dataItem) => {
    const apiRequest = {
      ...dataItem,
      jobClassification: dataItem?.jobClassification?.id,
      union: dataItem?.union?.id,
      empId: dataItem.empName.id,
      empPayType: dataItem.empSalaryHourly.id,
      empWorkMonths: dataItem.empMonthsWorked,
      holidaysID: dataItem.holidaySchedule.id,
    };

    delete apiRequest.empName;
    delete apiRequest.employee;
    delete apiRequest.empSalaryHourly;
    delete apiRequest.holidaysData;

    if (dataItem.empId !== undefined) {
      axiosInstance({
        method: "PUT",
        url: PayrollEmployee.EmployeePayrollSetup + "/" + dataItem.id,
        data: apiRequest,
        withCredentials: false,
      })
        .then((response) => {
          showSuccessNotification("Employee updated Successfully.");
          onSuccess();
          getDataList();
        })
        .catch(() => { });
    } else {
      axiosInstance({
        method: "POST",
        url: PayrollEmployee.EmployeePayrollSetup,
        data: apiRequest,
        withCredentials: false,
      })
        .then((response) => {
          showSuccessNotification("Employee successfully added to Payroll.");
          onSuccess();
          getDataList();
        })
        .catch(() => { });
    }
  };

  useEffect(() => {
    getJobClassList();
    getUnionList();
    getSalaryHourlyOptions();
    getHolidayScheduleHeader();
  }, []);

  const getJobClassList = async () => {
    axiosInstance({
      method: "get",
      url: PayrollEndPoints.PayrollJobClassification,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setJobClassList(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getHolidayScheduleHeader = () => {
    axiosInstance({
      method: "GET",
      url: HolidayEndPoints.HolidaySchedule + "/ByYear",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.map((x) => {
          return { id: x.id, holidayScheduleName: x.holidayScheduleName };
        });
        setHolidayScheduleList(data);
      })
      .catch(() => { });
  };
  const getUnionList = async () => {
    axiosInstance({
      method: "get",
      url: PayrollEndPoints.PayrollUnion,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setUnionData(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getSalaryHourlyOptions = async () => {
    axiosInstance({
      method: "GET",
      url: PayrollEmployee.Common + "?id=17",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setSalaryHourly(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEmpMonthWorked = (e) => {
    setEmpWorkMonths(e.value);
    setIsRangeShow(true)
    let data = contractYearList.map((item) => {
      if (
        Number(item.months) == Number(e.value)
      ) {
        return {
          title: `${formatDate(item?.empYrStart)}-${formatDate(item?.empYrEnd)}`,
          value: {
            startDate: item?.empYrStart,
            endDate: item?.empYrEnd
          }
        }
      }
    }).filter(Boolean);
    setcontractYear(data);
  };
  const salaryContracYearValidator = (value) => {
    if (empWorkMonths !== 12 && !value) {
      return "Contract year start is required.";
    }
  };
  const salaryContracEndYearValidator = (value) => {
    if (empWorkMonths !== 12 && !value) {
      return "Contract year end is required.";
    }
  };

  return (
    <Dialog
      width={650}
      height={"85vh"}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-plus"></i>
          <span className="ms-2">
            {action == "edit" ? "Edit" : "Add"} Employee to Payroll
          </span>
        </div>
      }
      onClose={toggleAddEmployeeDialog}
    >
      <Form
        onSubmit={onSubmit}
        initialValues={formInit}
        ref={formRef}
        key={formKey}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <div>
                <Field
                  id={"empName"}
                  name={"empName"}
                  dataItemKey="empId"
                  textField="empName"
                  label={"Employee Name*"}
                  data={TCEmployee}
                  value={selectedEmployee}
                  onChange={(event) => {
                    formRef.current.valueSetter(
                      "county",
                      event.value?.employeeAddresses?.find(
                        (item) => item.activeInd == "Y"
                      )?.county?.countyName
                    );
                    setSelectedEmployee(event.value);
                  }}
                  component={FormDropDownList}
                  validator={employeeNameValidator}
                  disabled={formInit?.id}
                />

                <div className="d-flex gap-2">
                  <Field
                    id={"empSalaryHourly"}
                    name={"empSalaryHourly"}
                    textField="value"
                    label={"Pay type*"}
                    data={salaryHourly}
                    component={FormDropDownList}
                    wrapperstyle={{ flex: "1" }}
                    validator={empSalaryHourly}
                  />
                </div>

                <Field
                  id={"empMonthsWorked"}
                  name={"empMonthsWorked"}
                  label={"No. of months worked*"}
                  data={months}
                  component={FormDropDownList}
                  onChange={handleEmpMonthWorked}
                  validator={noMonthsWorked}
                />
              </div>
              {
                isRangeShow && <Field
                  id={"ranges"}
                  name={"ranges"}
                  label={"Contract Years Range"}
                  dataItemKey="value"
                  textField="title"
                  data={contractYear}
                  component={FormDropDownList}
                  onChange={(el) => {
                    formRenderProps.onChange("workYrStart", {
                      value: new Date(el.value?.value?.startDate),
                    });
                    formRenderProps.onChange("workYrStop", {
                      value: new Date(el.value?.value?.endDate),
                    });
                  }}
                />
              }{
                !isRangeShow && <Field
                  id={"workYrStart"}
                  name={"workYrStart"}
                  label={`Contract Year Start${empWorkMonths !== 12 ? "*" : ""}`}
                  component={FormDatePicker}
                  value={selectedStartDate}
                  validator={salaryContracYearValidator}
                />
              }{
                !isRangeShow && <Field
                  id={"workYrStop"}
                  name={"workYrStop"}
                  label={`Contract Year End${empWorkMonths !== 12 ? "*" : ""}`}
                  component={FormDatePicker}
                  validator={salaryContracEndYearValidator}
                />
              }
              <Field
                id={"jobClassification"}
                name={"jobClassification"}
                label={"Job Classification"}
                textField="jobClassification"
                dataItemKey="id"
                component={FormDropDownList}
                data={jobClassList}
              />

              <Field
                id={"empDeptNo"}
                name={"empDeptNo"}
                label={"Employee Dept No"}
                component={FormInput}
              />

              <Field
                id={"originalHiredDate"}
                name={"originalHiredDate"}
                label={"Original hire date"}
                component={FormDatePicker}
              />

              <Field
                id={"county"}
                name={"county"}
                label={"County"}
                component={FormDropDownList}
                disabled
              />

              <Field
                id={"unionID"}
                name={"unionID"}
                label={"Union"}
                dataItemKey="id"
                textField="description"
                component={FormDropDownList}
                data={unionData}
              />
              <Field
                id={"terminationDate"}
                name={"terminationDate"}
                label={"Termination date"}
                component={FormDatePicker}
              />
              <Field
                id={"fullTime"}
                name={"fullTime"}
                label={"Fulltime"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
              />

              <Field
                id={"autoRun"}
                name={"autoRun"}
                label={"Auto Run"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
              />

              <Field
                id={"iSUnion"}
                name={"iSUnion"}
                label={"Union"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
              />

              <Field
                id={"classified"}
                name={"classified"}
                label={"Classified"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
              />

              <Field
                id={"exEmpt"}
                name={"exEmpt"}
                label={"Exempt"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
              />

              <Field
                id={"insurable"}
                name={"insurable"}
                label={"Insurable"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
              />

              <Field
                id={"seasonal"}
                name={"seasonal"}
                label={"Seasonal"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
              />
              <Field
                id={"isTrulyHourly"}
                name={"isTrulyHourly"}
                label={"True Hourly"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
                validator={trueHourValidator}
              />
              <Field
                id={"runPayrollFromTimecard"}
                name={"runPayrollFromTimecard"}
                label={"Run Payroll from Time Card*"}
                placeholder={""}
                data={fullTimeRadioData}
                layout={"horizontal"}
                component={FormRadioGroup}
              />

              <Field
                id={"holidaySchedule"}
                name={"holidaySchedule"}
                dataItemKey="id"
                textField="holidayScheduleName"
                label={"Holiday Schedule*"}
                data={holidayScheduleList}
                component={FormDropDownList}
              />

              <div className="k-form-buttons">
                <Button
                  themeColor={"primary"}
                  className={"col-12"}
                  type={"submit"}
                  disabled={!formRenderProps.allowSubmit || endDateError}
                >
                  Save
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
}

export default AddEmployeeToPayroll;
