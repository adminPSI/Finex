import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Tooltip } from "@progress/kendo-react-tooltip";
import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  Payroll,
  PayrollAttendance,
  PayrollEmployee,
  PayrollEmployeeSetup,
  PayrollEndPoints,
  ReportsEndPoints,
  RevenueEndPoints
} from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import { useStartEndDateValidatorForSingle } from "../../../helper/useStartEndDateValidatorForSingle";
import Constants from "../../common/Constants";
import { handleDropdownSearch } from "../../common/Helper";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
} from "../../form-components";
import SacDialog from "../../modal/StateAccountCodeDialog";
import IHACDialog from "../../Payroll/Job/modals/IHACpopup";
import {
  benefitValidator,
  cacForValidator,
  DateValidator,
  startDateValidator,
  timeEntryJobValidator
} from "../../validators";

const employeeColumns = [
  {
    field: "fullName",
    header: "Name",
    width: "150px",
  },
  {
    field: "employee.employeeNumber",
    header: "Employee No",
    width: "150px",
  },
  {
    field: "employee.groupNumber",
    header: "Group No",
    width: "150px",
  },
];
const BenefitAdjustmentFilter = ({
  benefitList,
  setSelectedBenefit,
  selectedBenefit,
  getPayrollAdjustment,
  setDatePaid,
  total,
  isPostDate,
  fetchBenefit
}) => {
  const [paidDates, setPaidDates] = useState([]);
  const [paidDate, setPaidDate] = useState(null);
  const [selectedPaidDate, setSelectedPaidDate] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [postBenefitDialog, setPostBenefitDialog] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [benefitDetails, setBenefitDetails] = useState({});
  const [addBenefit, setAddBenefit] = useState(false);
  const [formInit,] = useState([]);
  const [visibleIHPO, setVisibleIHPO] = useState(false);
  const [visibleSAC, setVisibleSAC] = useState(false);
  const [benefitsName, setBenefitsName] = useState([]);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [FilterDropdownData, setFilterDropdownData] = useState("");
  const [TCEmployee, setTCEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [, setJobDescriptionList] = useState();
  const [jobList, setJobList] = useState();
  const formRef = useRef();
  const [CACDDList, setCACDDList] = useState([]);
  let [formData, setformData] = useState({});
  const CACVal = {
    value: {
      text: "Select County Expense Code",
      id: 0,
    },
  };
  const CACColumns = [
    {
      field: "countyExpenseCode",
      header: "Name",
      width: "300px",
    },
    {
      field: "countyExpenseDescription",
      header: "Description",
      width: "300px",
    },
  ];
  const getCAC = async () => {
    const accountingcode =
      Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code;

    axiosInstance({
      method: "Post",
      url:
        RevenueEndPoints.GetAccountingCodesFilter +
        `accountingcodetype=${accountingcode}` +
        "&&description=" +
        "" +
        "&&code=" +
        "" +
        "&&fundCode=" +
        "" +
        "&&isActive=" +
        "Y" +
        "&&search=" +
        "" +
        "&&skip=" +
        0 +
        "&&take=" +
        0,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setCACDDList(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
  } = useStartEndDateValidatorForSingle();

  const getPaidDates = () => {
    axiosInstance({
      method: "GET",
      url: PayrollAttendance.DatePaid,
      withCredentials: false,
    })
      .then((response) => {
        if (response?.data?.length) {
          setPaidDates(response.data);
        }
      })
      .catch(() => { });
  };

  const getPayrollDetails = async (date) => {
    const apiRequest = {
      DatePaid: date,
      mCustomPay: false,
    };
    return axiosInstance({
      method: "POST",
      url: PayrollAttendance.GetDatePaidDetailData,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setBenefitDetails(data);
      })
      .catch(() => { });
  };

  useEffect(() => {
    getPaidDates();
  }, []);

  useEffect(() => {
    getPayrollDetails(paidDate);
  }, [paidDate]);

  useEffect(() => {
    getCAC();
  }, []);

  useEffect(() => {
    if (paidDates.length > 0) {
      setPaidDate(paidDates[0]);
      setDatePaid(paidDates[0]);
      getPayrollAdjustment(paidDates[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidDates]);

  useEffect(() => {
    setFormKey((prev) => {
      return prev + 1;
    });
  }, [total]);

  const getFieldData = (e) => {
    setSelectedPaidDate(e.value);
    setPaidDate(e.value);
    setDatePaid(e.value);
    getPayrollAdjustment(e.value);
  };

  const handleBenefitChange = (event) => {
    setSelectedBenefit(event.value);
    if (paidDate) {
      getPayrollAdjustment(paidDate, event.value.id);
    }
  };

  const initialValues = useMemo(() => {
    setFormKey(Math.floor(Math.random() * 100001));
    if (paidDate) {
      return {
        datePaid: paidDate,
        payStart: new Date(benefitDetails.payStartDate),
        payEnd: new Date(benefitDetails.payEndDate),
        postDate:
          isPostDate
            ? new Date(benefitDetails.postDate)
            : null,
        benefit: selectedBenefit
          ? selectedBenefit
          : benefitList && benefitList.length
            ? benefitList[0]
            : "",
        total,
      };
    } 
    return {
      datePaid: null,
      benefit: selectedBenefit
        ? selectedBenefit
        : benefitList && benefitList.length
          ? benefitList[0]
          : "",
      total,
    };
  }, [benefitList, paidDate, selectedBenefit, total]);

  const formateDate = (initDate) => {
    const date = new Date(initDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formatDate = `${month < 9 ? "0" + month : month}/${day < 9 ? "0" + day : day}/${year}`;
    return formatDate;
  };

  const handlePostBenefit = (dataItem) => {
    const apiRequest = {
      datePaid: paidDate,
      startDate: benefitDetails.payStartDate,
      endDate: benefitDetails.payEndDate,
      postDate: formateDate(dataItem?.date),
      BenefitID: selectedBenefit?.id || 0,
    };
    axiosInstance({
      method: "POST",
      url: Payroll.PostBenefits,
      data: apiRequest,
    })
      .then((response) => {
        getPayrollDetails(paidDate);
        getPayrollAdjustment(paidDate);
        setPostBenefitDialog(false);
        fetchBenefit()
      })
      .catch(() => { });
  };

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };

  const handlePayrollUnPost = () => {
    toggleDeleteDialog();
    const apiRequest = {
      datePaid: paidDate,
      startDate: benefitDetails.payStartDate,
      endDate: benefitDetails.payEndDate,
      paidDate: null,
      BenefitID: selectedBenefit?.id || 0,
    };
    axiosInstance({
      method: "POST",
      url: Payroll.PostBenefits,
      data: apiRequest,
    })
      .then((response) => {
        getPayrollDetails(paidDate);
        getPayrollAdjustment(paidDate);
        setPostBenefitDialog(false);
        fetchBenefit()
      })
      .catch(() => { });
  };

  const addEditBenefitToggleDialog = () => {
    setAddBenefit(null);
  };

  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };

  const toggleDialogSAC = () => {
    setVisibleSAC(!visibleSAC);
  };

  const getSacCode = (sac) => {
    if (formRef.current) {
      formRef.current.onChange("sac", {
        name: "sac",
        touched: true,
        value: sac,
      });
    }
  };

  const getIHACCode = (ihac) => {
    formRef.current.valueSetter("ihac", ihac);
  };
  const onIhacChange = (e) => {
    setformData({ ...formData, [e.target.name]: e.target.value });
  };
  const updateStartDate = (formRenderProps) =>
    updateStartDateFun({
      formRenderProps,
      enddate: formInit?.endDate || selectedEndDate,
    });
  const updateEndDate = (formRenderProps) =>
    updateEndDateFun({
      formRenderProps,
      startdate: formInit?.startDate || selectedStartDate,
    });

  const amountPerValidation = () => {
    const amount = formRef.current.valueGetter("benefitAmount");
    const percentage = formRef.current.valueGetter("benefitRate");
    return !amount && !percentage ? "Field is Required" : "";
  };

  useEffect(() => {
    const getBenefitsName = () => {
      axiosInstance({
        method: "GET",
        url: PayrollEndPoints.Benefits + "?inActive=" + false,
        withCredentials: false,
      })
        .then((response) => {
          setBenefitsName(response.data.data);
        })
        .catch((e) => {
          console.log(e, "error");
        });
    };

    getBenefitsName();
  }, []);

  const getEmployeeData = () => {
    axiosInstance({
      method: "GET",
      url: PayrollEmployeeSetup.getEmployeeGridData + "?skip=0&take=0",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        data.map((employee) => {
          employee.fullName =
            employee.employee.displayName;
          return employee;
        });
        setTCEmployee(data);
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };
  const searchableField = ["fullName", "empId", "id"];

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value?.value?.empId);
    getJobDescriptions(value?.value?.empId);
  };

  useEffect(() => {
    getJobDescriptions();
  }, []);

  const getJobDescriptions = (empId) => {
    if (!empId) return;
    axiosInstance({
      method: "GET",
      url: PayrollEmployee.EmployeeJobs + "/" + empId + "?active=true",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        data.map((job) => {
          job.description = job.jobDescription.empJobDescription;
          return job;
        });
        setJobDescriptionList(data);
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  const onFilterChange = (event) => {
    let searchText = event.filter.value;
    setDropdownSearch(searchText);
  };

  const getJob = async (id) => {
    try {
      const { data } = await axiosInstance({
        method: "GET",
        url: PayrollEmployee.EmployeeJobs + "/" + id + "?active=true",
        withCredentials: false,
      });

      data.map((job) => {
        job.description = job.jobDescription.empJobDescription;
        return job;
      });
      setJobList(data);
    } catch (e) { }
  };

  useEffect(() => {
    const result = handleDropdownSearch(
      TCEmployee,
      searchableField,
      dropdownSearch
    );
    setFilterDropdownData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownSearch]);

  useEffect(() => {
    getEmployeeData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      getJob(selectedEmployee);
    }
  }, [selectedEmployee]);
  const addferBenefitHandleSubmit = async (dataItem) => {
    let req = {
      EmpID: dataItem?.empName?.empId,
      DatePaid: paidDate,
      PayPeriodStart: new Date(benefitDetails.payStartDate) ?? null,
      PayPeriodEnd: dataItem.endDate ?? null,
      JobId: dataItem?.Job?.id,
      BenefitId: dataItem.benefit ? dataItem.benefit.id : 0,
      CSO: "",
      PayrollGroup1: "",
      WhoID: "",
      RunTimeCardWithHAC: "",
      NoChangePostedBenefits: "",
      PayoutAmount: dataItem.benefitAmount,
    };
    try {
      await axiosInstance({
        method: "POST",
        url: `${ReportsEndPoints.AddSingleBenefitToPayroll}`,
        data: req,
        withCredentials: false,
      });
      setAddBenefit(false);
    } catch (error) {
      console.log(error);
    }
  };

  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollRun')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      <Form
        onSubmit={{}}
        initialValues={initialValues}
        key={formKey}
        render={(formRenderProps) => (
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
                  id={"datePaid"}
                  name={"datePaid"}
                  label={"Date Paid"}
                  component={FormDropDownList}
                  value={selectedPaidDate}
                  data={paidDates}
                  onChange={getFieldData}
                  wrapperstyle={{
                    width: "150px",
                  }}
                  filterable={false}
                />
                <Field
                  id={"payStart"}
                  name={"payStart"}
                  label={"Pay Start"}
                  component={FormDatePicker}
                  wrapperstyle={{
                    width: "150px",
                  }}
                  disabled={true}
                />
                <Field
                  id={"payEnd"}
                  name={"payEnd"}
                  label={"Pay End"}
                  component={FormDatePicker}
                  wrapperstyle={{
                    width: "150px",
                  }}
                  disabled={true}
                />
                <Field
                  id={"benefit"}
                  name={"benefit"}
                  label={"Benefit"}
                  textField="benefitsName"
                  dataItemKey="id"
                  component={FormDropDownList}
                  data={benefitList}
                  value={selectedBenefit}
                  onChange={handleBenefitChange}
                  wrapperstyle={{
                    width: "250px",
                  }}
                />
                <Field
                  id={"total"}
                  name={"total"}
                  label={"Total"}
                  component={FormNumericTextBox}
                  disabled={true}
                  spinners={false}
                />
                <Field
                  id={"postDate"}
                  name={"postDate"}
                  label={"Post Date"}
                  component={FormDatePicker}
                  wrapperstyle={{
                    width: "150px",
                  }}
                  disabled={true}
                />
                {initialValues.postDate ? (
                  <Tooltip anchorElement="target" parentTitle={true}>
                    {checkPrivialgeGroup("PRBAUPostBenefitB", 2) && <Button
                      className="k-button k-button-lg k-rounded-lg"
                      themeColor={"primary"}
                      title={"Un-post Benefit"}
                      onClick={toggleDeleteDialog}
                    >
                      Un-Post Benefit
                    </Button>}
                  </Tooltip>
                ) : (
                  <React.Fragment>
                    {checkPrivialgeGroup("PRBAPostBenefitB", 2) && <Tooltip anchorElement="target" parentTitle={true}>
                      <Button
                        className="k-button k-button-lg k-rounded-lg"
                        themeColor={"primary"}
                        title={"Post Benefit"}
                        onClick={() => setPostBenefitDialog(!postBenefitDialog)}
                      >
                        Post Benefit
                      </Button>
                    </Tooltip>}
                  </React.Fragment>
                )}
              </div>
            </fieldset>
          </FormElement>
        )}
      />
      <div>
        {postBenefitDialog && (
          <Dialog
            width={500}
            title={
              <div className="d-flex align-items-center justify-content-center">
                <i className="fa-solid fa-plus"></i>
                <span className="ms-2">
                  Post Benefit
                </span>
              </div>
            }
            onClose={() => setPostBenefitDialog(false)}
          >
            <Form
              onSubmit={handlePostBenefit}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Field
                        id={"date"}
                        name={"date"}
                        label={"Date*"}
                        component={FormDatePicker}
                        validator={DateValidator}
                        wrapperstyle={{
                          width: "100%",
                          marginRight: "10px",
                        }}
                      />
                    </div>

                    <div className="k-form-buttons">
                      <Button
                        themeColor={"primary"}
                        className={"col-12"}
                        type={"submit"}
                        disabled={!formRenderProps.allowSubmit}
                      >
                        Post Benefit
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </Dialog>
        )}
      </div>
      {addBenefit && (
        <Dialog
          width={600}
          title={
            <div className="d-flex align-items-center justify-content-center">
              <i className="fa-solid fa-plus"></i>
              <span className="ms-2">Add Benefit</span>
            </div>
          }
          onClose={addEditBenefitToggleDialog}
        >
          <Form
            onSubmit={addferBenefitHandleSubmit}
            initialValues={formInit}
            key={formKey}
            ref={formRef}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={"k-form-fieldset"}>
                  <div>
                    <div>
                      <Field
                        id={"id"}
                        name={"id"}
                        component={FormInput}
                        type={"hidden"}
                      />
                      <Field
                        id={"empName"}
                        name={"empName"}
                        label={"Select Employee"}
                        textField="fullName"
                        dataItemKey="id"
                        component={FormMultiColumnComboBox}
                        data={
                          dropdownSearch || FilterDropdownData.length
                            ? FilterDropdownData
                            : TCEmployee
                        }
                        columns={employeeColumns}
                        placeholder="Search Employee..."
                        className="m-0"
                        onChange={(event) => handleEmployeeChange(event)}
                        filterable={true}
                        onFilterChange={onFilterChange}
                      />
                    </div>

                    <div>
                      <Field
                        id={"job"}
                        name={"Job"}
                        label={"Job*"}
                        wrapperstyle={{ width: "100%" }}
                        data={jobList}
                        textField="description"
                        dataItemKey="id"
                        component={FormDropDownList}
                        validator={timeEntryJobValidator}
                      />
                    </div>
                    <div>
                      <Field
                        id={"id"}
                        name={"id"}
                        component={FormInput}
                        type={"hidden"}
                      />
                      <Field
                        id={"benefit"}
                        data={benefitsName}
                        name={"benefit"}
                        label={"Benefit*"}
                        textField="benefitsName"
                        dataItemKey="id"
                        component={FormDropDownList}
                        onChange={() => {
                          formRenderProps.onChange("benefitPachakeId", {
                            value: null,
                          });
                        }}
                        validator={
                          formRenderProps.valueGetter("benefitPachakeId")
                            ? null
                            : benefitValidator
                        }
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <Field
                      id={"startDate"}
                      name={"startDate"}
                      label={"Start Date*"}
                      component={FormDatePicker}
                      onChange={updateStartDate}
                      validator={startDateValidator}
                      value={selectedStartDate}
                    />
                    <div>
                      <Field
                        id={"endDate"}
                        name={"endDate"}
                        label={"End Date"}
                        component={FormDatePicker}
                        onChange={updateEndDate}
                        wrapperstyle={{ width: "100%" }}
                      />
                      {endDateError && (
                        <p
                          className="text-danger mb-0 p-0"
                          style={{ fontSize: "12px" }}
                        >
                          {endDateError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Field
                      id={"id"}
                      name={"id"}
                      component={FormInput}
                      type={"hidden"}
                    />
                    <Field
                      id={"cac"}
                      name={"cac"}
                      label={"CAC"}
                      textField="countyExpenseCode"
                      dataItemKey="id"
                      component={FormMultiColumnComboBox}
                      data={CACDDList}
                      value={CACVal}
                      columns={CACColumns}
                      onChange={onIhacChange}
                      placeholder="Search CAC..."
                      validator={cacForValidator}
                    />
                  </div>
                  <div
                    style={{ width: "100%", marginRight: "10px" }}
                    onClick={() => setVisibleSAC(true)}
                  >
                    <Field
                      id={"sac"}
                      name={"sac"}
                      label={"SAC"}
                      component={FormInput}
                    />
                  </div>
                  <div onClick={() => setVisibleIHPO(true)}>
                    <Field
                      id={"ihac"}
                      name={"ihac"}
                      label={"IHAC"}
                      component={FormInput}
                    />
                  </div>
                  <div
                  >
                    <Field
                      id={"benefitAmount"}
                      name={"benefitAmount"}
                      label={"Amount*"}
                      format="c2"
                      placeholder={"$ Enter Amount"}
                      component={FormNumericTextBox}
                      wrapperstyle={{
                        width: "60%",
                      }}
                      step={0}
                      min={0}
                      spinners={false}
                      onChange={() => {
                        formRenderProps.onChange("benefitRate", {
                          value: null,
                        });
                      }}
                      validator={amountPerValidation}
                    />
                  </div>
                  <div className="k-form-buttons">
                    <Button
                      themeColor={"primary"}
                      className={"col-12"}
                      type={"submit"}
                      disabled={!formRenderProps.allowSubmit || endDateError}
                    >
                      Save Benefit
                    </Button>
                  </div>
                </fieldset>
              </FormElement>
            )}
          />
        </Dialog>
      )}
      {visibleSAC && (
        <SacDialog
          toggleDialog={toggleDialogSAC}
          getSacCode={getSacCode}
          type={7}
        />
      )}
      {visibleIHPO && (
        <IHACDialog
          toggleIHPODialog={toggleIHPODialog}
          getIHACCode={getIHACCode}
          forihpo={false}
        />
      )}
      {deleteVisible && (
        <Dialog
          title={<span>Please confirm</span>}
          onClose={toggleDeleteDialog}
        >
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure you want to Un-Post?
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={toggleDeleteDialog}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={handlePayrollUnPost}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
};

export default BenefitAdjustmentFilter;
