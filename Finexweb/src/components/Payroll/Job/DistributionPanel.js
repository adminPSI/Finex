import { Reveal } from "@progress/kendo-react-animation";
import { Button } from "@progress/kendo-react-buttons";
import { Card } from "@progress/kendo-react-layout";
import React, { memo, useRef, useState } from "react";

import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  FormDatePicker,
  FormInput,
  FormNumericTextBox,
} from "../../form-components";
import { AllSalaries } from "./modals/AllSalaries";

import {
  ExpansionPanel,
  ExpansionPanelContent,
} from "@progress/kendo-react-layout";
import {
  PayrollEmployee,
  PayrollEndPoints,
  SignificantRates,
} from "../../../EndPoints";
import { useEmployeeContext } from "../../../contexts/payrollEmployeeCotext";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  salaryContractDaysValidator,
  salaryCurrentPositionDateValidator,
  salaryEndDateValidator,
  salaryHourlyRateValidator,
  salaryHoursPerYearValidator,
  salaryLongevityValidator,
  salaryPaidHolidaysValidator,
  salaryPersonalYearEndDateValidator,
  salaryPersonalYearStartDateValidator,
  salaryStartDateValidator,
} from "../../validators";
import { EditSalaries } from "./modals/EditSalaries";

const DistributionsPanel = ({ data }) => {
  const [salariesMenuOpen, setSalariesMenuOpen] = useState(false);
  const [editSalariesMenuOpen, setEditSalariesMenuOpen] = useState(false);

  let [expandedGrid, setExpandedGrid] = React.useState();
  let [formDataRate, setFormDataRate] = useState();
  const [formDate, setFormDate] = useState();
  const FormRef = useRef();
  const employeeContext = useEmployeeContext();

  const [formDataSalary, setFormDataSalary] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const handleSubmitRate = async (dataItem) => {
    let rateForm = {
      id: dataItem.id || 0,
      orgAccountId: dataItem.orgAccountId,
      payDistId: dataItem.payDistId,
      hoursWorked: dataItem.hoursWorked,
      hoursPaid: dataItem.hoursPaid,
      hoursPerDay: dataItem.hoursPerDay,
      overTimeRate: dataItem.overTimeRate,
      holidayRate: dataItem.holidayRate,
      vacationRate: dataItem.vacationRate,
      vacationLimit: dataItem.vacationLimit,
      sickRate: dataItem.sickRate,
      sickLimit: dataItem.sickLimit,
      personalRate: dataItem.personalRate,
      personalLimit: dataItem.personalLimit,
      vacationYears: dataItem.vacationYears,
      maxVacation: dataItem.maxVacation,
      lowRate: dataItem.lowRate,
    };
    rateForm.payDistId = data.id;
    if (dataItem.id > 0) {
      await axiosInstance({
        method: "PUT",
        url: `${SignificantRates.SignificantRatesByPayDistId}/${dataItem.id}`,
        data: rateForm,
        withCredentials: false,
      })
        .then(() => {
          getSignificantRates();
        })
        .catch((err) => {
          console.log(err, "err");
        });
    } else {
      await axiosInstance({
        method: "POST",
        url: `${SignificantRates.SignificantRatesByPayDistId}`,
        data: rateForm,
        withCredentials: false,
      })
        .then(() => {
          getSignificantRates();
        })
        .catch((err) => {
          console.log(err, "err");
        });
    }
  };

  const handleSubmitDate = async (dataItem) => {
    let dateForm = {
      id: dataItem.id,
      hiredDate: dataItem.hiredDate,
      fullTimeHire: dataItem.fullTimeHire,
      lastDate: dataItem.lastDate,
      years: dataItem.years,
      days: dataItem.days,
      countyDate: dataItem.countyDate,
      yearsDD: dataItem.yearsDD,
      daysDD: dataItem.daysDD,
      anniversaryDateDD: dataItem.anniversaryDateDD,
      empStepDate: dataItem.empStepDate,
      rehireDate: dataItem.rehireDate,
      empDateCurrentPos: dataItem.empDateCurrentPos,
      evalDate: dataItem.evalDate,
      evalNoticeSentDate: dataItem.evalNoticeSentDate,
      evalCompletionDate: dataItem.evalCompletionDate,
      orgAccountId: dataItem.orgAccountId,
    };
    dateForm.payDistId = data.id;
    if (dataItem.id > 0) {
      await axiosInstance({
        method: "PUT",
        url: `${SignificantRates.SignificantDatesByPayDistId}/${dataItem.id}`,
        data: dateForm,
        withCredentials: false,
      })
        .then(() => {
          getSignificantDates();
        })
        .catch((err) => {
          console.log(err, "err");
        });
    } else {
      await axiosInstance({
        method: "POST",
        url: `${SignificantRates.SignificantDatesByPayDistId}`,
        data: dateForm,
        withCredentials: false,
      })
        .then(() => {
          getSignificantDates();
        })
        .catch((err) => {
          console.log(err, "err");
        });
    }
  };

  const handleSubmitSalary = (dataItem) => {
    const dataForm = {
      id: dataItem.id,
      jobId: employeeContext.selectedJob.id,
      empId: employeeContext.selectedEmployee,
      startDate: dataItem.startDate ? new Date(dataItem.startDate) : null,
      endDate: dataItem.endDate ? new Date(dataItem.endDate) : null,
      hourlyRate: dataItem.hourlyRate,
      longevity: dataItem.longevity,
      step: dataItem.step,
      contractDays: dataItem.contractDays,
      paidHolidays: dataItem.paidHolidays,
      hoursPerYear: dataItem.hoursPerYear,
      currentPosStartDate: new Date(dataItem.currentPosStartDate),
      personalYearStartDate: new Date(dataItem.personalYearStartDate),
      personalYearEndDate: new Date(dataItem.personalYearEndDate),
      orG_ID: 0,
      salary: 0,
      payDaySalary: 0,
      hoursWorked: 0,
      memo: "",
      hoursPaid: 0,
      hoursPerDay: 0,
      overTimeRate: 0,
      holidayRate: 0,
      vacationRate: 0,
      vacationLimit: 0,
      sickRate: 0,
      sickLimit: 0,
      personalRate: 0,
      personalLimit: 0,
      vacationYears: 0,
      maxVacation: 0,
      lowRate: 0,
      baseRate: 0,
      payRateId: 0,
      nonStandardPerYear: true,
      payrollRangeId: 0,
      payDistId: data.id,
    };
    if (dataItem.id > 0) {
      axiosInstance({
        method: "PUT",
        url: `${PayrollEmployee.Salary}/${dataForm.id}`,
        data: dataForm,
        withCredentials: false,
      })
        .then(() => {
          getSalary();
        })
        .catch((err) => {
          console.log(err, "err");
        });
      return;
    } else {
      axiosInstance({
        method: "POST",
        url: PayrollEmployee.Salary,
        data: dataForm,
        withCredentials: false,
      })
        .then(() => {
          getSalary();
        })
        .catch((error) => {
          console.log(error, "error");
        });
    }
  };
  const PullFromOrganizationData = async () => {
    try {
      setExpandedGrid("Significant Rate");
      if (!formDataRate) {
        await getSignificantRates();
      }
      const result = await axiosInstance({
        method: "GET",
        url: `${PayrollEndPoints.Defaults}`,
        withCredentials: false,
      });
      let obj = {
        overTimeRate: result.data?.defaultOtRates,
        holidayRate: result.data?.defaultHolidsayRate,
        vacationRate: result.data?.defaultVacationRate,
        sickRate: result.data?.defaultSickRate,
      };
      if (formDataRate) {
        obj.id = formDataRate.id;
        obj.payDistId = data.id;
        obj.orgAccountId = formDataRate.orgAccountId;
        obj.payDistId = formDataRate.payDistId;
        obj.hoursWorked = formDataRate.hoursWorked;
        obj.hoursPaid = formDataRate.hoursPaid;
        obj.hoursPerDay = formDataRate.hoursPerDay;
        obj.vacationLimit = formDataRate.vacationLimit;
        obj.sickLimit = formDataRate.sickLimit;
        obj.personalRate = formDataRate.personalRate;
        obj.personalLimit = formDataRate.personalLimit;
        obj.vacationYears = formDataRate.vacationYears;
        obj.maxVacation = formDataRate.maxVacation;
        obj.lowRate = formDataRate.lowRate;
      }
      for (let key in obj) {
        if (FormRef.current) {
          FormRef.current.onChange(key, {
            name: key,
            touched: true,
            value: obj[key],
          });
        }
      }
    } catch (e) {
      console.log(e, "error");
    }
  };

  const getSignificantRates = async () => {
    try {
      const result = await axiosInstance({
        method: "GET",
        url: `${SignificantRates.SignificantRatesByPayDistId}/${data.id}`,
        withCredentials: false,
      });
      formDataRate = result.data;
      setFormDataRate({ ...result.data });
      setFormKey(formKey + 1);
      return result.data;
    } catch (e) {
      console.log(e, "error");
    }
  };

  const getSalary = async () => {
    try {
      const result = await axiosInstance({
        method: "GET",
        url: `${PayrollEmployee.getSalary}/${data.id}`,
        withCredentials: false,
      });
      let res = result.data;
      res = {
        ...res,
        startDate: result.data?.startDate
          ? new Date(result.data?.startDate)
          : null,
        endDate: result.data?.endDate ? new Date(result.data?.endDate) : null,
        currentPosStartDate: new Date(result.data?.currentPosStartDate),
        personalYearStartDate: new Date(result.data?.personalYearStartDate),
        personalYearEndDate: new Date(result.data?.personalYearEndDate),
      };
      setFormDataSalary(res);
      setFormKey(formKey + 1);
      return result.data;
    } catch (e) {
      console.log(e, "error");
    }
  };

  const getSignificantDates = async () => {
    try {
      const result = await axiosInstance({
        method: "GET",
        url: `${SignificantRates.SignificantDatesByPayDistId}/${data.id}`,
        withCredentials: false,
      });
      let obj = {
        id: result.data?.id,
        orgAccountId: result.data?.orgAccountId,
        payDistId: result.data?.payDistId,
        hiredDate: new Date(result.data?.hiredDate),
        fullTimeHire: new Date(result.data?.fullTimeHire),
        lastDate: new Date(result.data?.lastDate),
        years: result.data?.years,
        days: result.data?.days,
        countyDate: new Date(result.data?.countyDate),
        yearsDD: result.data?.yearsDD,
        daysDD: result.data?.daysDD,
        anniversaryDateDD: new Date(result.data?.anniversaryDateDD),
        empStepDate: new Date(result.data?.empStepDate),
        rehireDate: new Date(result.data?.rehireDate),
        empDateCurrentPos: new Date(result.data?.empDateCurrentPos),
        evalDate: new Date(result.data?.evalDate),
        evalNoticeSentDate: new Date(result.data?.evalNoticeSentDate),
        evalCompletionDate: new Date(result.data?.evalCompletionDate),
      };
      setFormDate(obj);
      setFormKey(formKey + 1);
    } catch (e) {
      console.log(e, "error");
    }
  };
  const handleApiCall = (panelKey) => {
    // eslint-disable-next-line eqeqeq
    const newExpandedPanel = panelKey == expandedGrid ? "" : panelKey;
    setExpandedGrid(newExpandedPanel);

    if (newExpandedPanel == "Significant Rate") {
      getSignificantRates();
    } else if (newExpandedPanel == "Significant Date") {
      getSignificantDates();
    } else if (newExpandedPanel == "Salary") {
      getSalary();
    }
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-end mb-2">
          <Button
            className="k-button k-button-lg k-rounded-lg"
            themeColor={"primary"}
            onClick={PullFromOrganizationData}
          >
            Pull from organization data
          </Button>
        </div>
        <ExpansionPanel
          className={"k-expanded-payroll"}
          title="Significant Rate"
          expanded={expandedGrid == "Significant Rate"}
          tabIndex={0}
          key="Significant Rate"
          onAction={(event) => {
            handleApiCall("Significant Rate");
          }}
        >
          <Reveal>
            {expandedGrid == "Significant Rate" && (
              <ExpansionPanelContent>
                <Form
                  ref={FormRef}
                  onSubmit={handleSubmitRate}
                  initialValues={formDataRate}
                  key={formKey}
                  render={(formRenderProps) => (
                    <>
                      <FormElement>
                        <fieldset className={"k-form-fieldset"}>
                          <Card className="">
                            <div style={{ padding: 15 }}>
                              <div className="d-flex justify-content-center gap-3 ">
                                <Field
                                  id={"hoursWorked"}
                                  name={"hoursWorked"}
                                  label={"Hours worked*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                                <Field
                                  id={"hoursPaid"}
                                  name={"hoursPaid"}
                                  label={"Hours Paid*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                              </div>

                              <div className="d-flex justify-content-center  gap-3">
                                <Field
                                  id={"hoursPerDay"}
                                  name={"hoursPerDay"}
                                  label={"Hours Per Day*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                                <Field
                                  id={"overTimeRate"}
                                  name={"overTimeRate"}
                                  label={"Overtime Rate*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                              </div>
                              <div className="d-flex justify-content-center  gap-3">
                                <Field
                                  id={"holidayRate"}
                                  name={"holidayRate"}
                                  label={"Holiday Rate*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                                <Field
                                  id={"vacationRate"}
                                  name={"vacationRate"}
                                  label={"Vacation Rate*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                              </div>
                              <div className="d-flex justify-content-center  gap-3">
                                <Field
                                  id={"vacationLimit"}
                                  name={"vacationLimit"}
                                  label={"Vacation Limit*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                                <Field
                                  id={"sickRate"}
                                  name={"sickRate"}
                                  label={"Sick Time Rate*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                              </div>
                              <div className="d-flex justify-content-center  gap-3">
                                <Field
                                  id={"sickLimit"}
                                  name={"sickLimit"}
                                  label={"Sick Time Limit*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                                <Field
                                  id={"personalRate"}
                                  name={"personalRate"}
                                  label={"Personal Rate*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                              </div>
                              <div className="d-flex justify-content-center  gap-3">
                                <Field
                                  id={"personalLimit"}
                                  name={"personalLimit"}
                                  label={"Personal Limit*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                                <Field
                                  id={"vacationYears"}
                                  name={"vacationYears"}
                                  label={"Vacation Rate Years*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                              </div>

                              <div className="d-flex justify-content-center  gap-3">
                                <Field
                                  id={"maxVacation"}
                                  name={"maxVacation"}
                                  label={"Max Vacation*"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                />
                                <Field
                                  id={"empTotalYears"}
                                  name={"empTotalYears"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "45%",
                                  }}
                                  type={"hidden"}
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  paddingTop: 40,
                                  gap: 20,
                                }}
                              >
                                <Button
                                  className="k-button k-button-sm k-rounded-lg k-w-full k-button-expanded-payroll-submit k-button-expanded-payroll-cancel"
                                  themeColor={"bootstrap"}
                                  type={"button"}
                                >
                                  Cancel
                                </Button>

                                <Button
                                  className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                                  themeColor={"primary"}
                                  type={"submit"}
                                  disabled={!formRenderProps.allowSubmit}
                                >
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </fieldset>
                      </FormElement>
                    </>
                  )}
                />
              </ExpansionPanelContent>
            )}
          </Reveal>
        </ExpansionPanel>
        <ExpansionPanel
          className={"k-expanded-payroll"}
          title="Salary"
          expanded={expandedGrid == "Salary"}
          tabIndex={0}
          key={formKey}
          onAction={(event) => {
            handleApiCall("Salary");
          }}
        >
          <Reveal>
            {expandedGrid == "Salary" && (
              <ExpansionPanelContent>
                <Form
                  onSubmit={handleSubmitSalary}
                  initialValues={formDataSalary}
                  render={(formRenderProps) => {
                    return (
                      <>
                        <FormElement>
                          <fieldset className={"k-form-fieldset"}>
                            <Card className="">
                              <div style={{ padding: 16 }}>
                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"startDate"}
                                    name={"startDate"}
                                    label={"Start Date*"}
                                    component={FormDatePicker}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={salaryStartDateValidator}
                                  />
                                  <Field
                                    id={"endDate"}
                                    name={"endDate"}
                                    label={"End Date*"}
                                    component={FormDatePicker}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    startDate={formRenderProps.valueGetter(
                                      "startDate"
                                    )}
                                    validator={salaryEndDateValidator}
                                  />
                                </div>

                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"currentPosStartDate"}
                                    name={"currentPosStartDate"}
                                    label={"Current Postion Start Date*"}
                                    component={FormDatePicker}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={
                                      salaryCurrentPositionDateValidator
                                    }
                                  />

                                  <Field
                                    id={"longevity"}
                                    name={"longevity"}
                                    label={"Longevity*"}
                                    component={FormInput}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={salaryLongevityValidator}
                                  />
                                </div>

                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"step"}
                                    name={"step"}
                                    label={"Step*"}
                                    component={FormNumericTextBox}
                                    spinners={false}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={salaryContractDaysValidator}
                                  />

                                  <Field
                                    id={"contractDays"}
                                    name={"contractDays"}
                                    label={"Contract Days*"}
                                    component={FormNumericTextBox}
                                    spinners={false}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={salaryContractDaysValidator}
                                  />
                                </div>
                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"paidHolidays"}
                                    name={"paidHolidays"}
                                    label={"Paid Holidays**"}
                                    component={FormNumericTextBox}
                                    spinners={false}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={salaryPaidHolidaysValidator}
                                  />

                                  <Field
                                    id={"hoursPerYear"}
                                    name={"hoursPerYear"}
                                    label={"Hours per Year*"}
                                    component={FormNumericTextBox}
                                    spinners={false}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={salaryHoursPerYearValidator}
                                  />
                                </div>
                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"hourlyRate"}
                                    name={"hourlyRate"}
                                    label={"Hourly Rate*"}
                                    component={FormNumericTextBox}
                                    spinners={false}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={salaryHourlyRateValidator}
                                  />

                                  <Field
                                    id={"personalYearStartDate"}
                                    name={"personalYearStartDate"}
                                    label={"Personal Year Start Date*"}
                                    component={FormDatePicker}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={
                                      salaryPersonalYearStartDateValidator
                                    }
                                  />
                                </div>
                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"personalYearEndDate"}
                                    name={"personalYearEndDate"}
                                    label={"Personal Year End*"}
                                    component={FormDatePicker}
                                    startDate={formRenderProps.valueGetter(
                                      "personalYearStartDate"
                                    )}
                                    wrapperstyle={{
                                      width: "44vw",
                                    }}
                                    validator={
                                      salaryPersonalYearEndDateValidator
                                    }
                                  />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    paddingTop: 40,
                                    gap: 20,
                                  }}
                                >
                                  <Button
                                    className="k-button k-button-sm k-rounded-lg k-w-full k-button-expanded-payroll-submit k-button-expanded-payroll-cancel"
                                    themeColor={"bootstrap"}
                                    type={"button"}
                                  >
                                    Cancel
                                  </Button>

                                  <Button
                                    className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                                    themeColor={"primary"}
                                    disabled={!formRenderProps.allowSubmit}
                                    type={"submit"}
                                  >
                                    Submit
                                  </Button>
                                </div>
                                <div className="mb-5"></div>
                              </div>
                            </Card>
                          </fieldset>
                        </FormElement>
                      </>
                    );
                  }}
                />
              </ExpansionPanelContent>
            )}
          </Reveal>
        </ExpansionPanel>
        <ExpansionPanel
          className={"k-expanded-payroll"}
          title="Significant Date"
          expanded={expandedGrid == "Significant Date"}
          tabIndex={0}
          key="Significant Date"
          onAction={(event) => {
            handleApiCall("Significant Date");
          }}
        >
          <Reveal>
            {expandedGrid == "Significant Date" && (
              <ExpansionPanelContent>
                <Form
                  onSubmit={handleSubmitDate}
                  initialValues={formDate}
                  key={formKey}
                  render={(formRenderProps) => (
                    <>
                      <FormElement>
                        <fieldset className={"k-form-fieldset"}>
                          <Card className="">
                            <div
                              style={{ padding: 16 }}
                              className="d-flex flex-column align-items-center"
                            >
                              <Field
                                id={"hiredDate"}
                                name={"hiredDate"}
                                label={"Date Hired*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"fullTimeHire"}
                                name={"fullTimeHire"}
                                label={"Full-Time Hire Date*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"years"}
                                name={"years"}
                                label={"Years*"}
                                component={FormInput}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />

                              <Field
                                id={"days"}
                                name={"days"}
                                label={"Days*"}
                                component={FormInput}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />

                              <Field
                                id={"yearsDD"}
                                name={"yearsDD"}
                                label={"Years DD*"}
                                component={FormInput}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"daysDD"}
                                name={"daysDD"}
                                label={"Days DD*"}
                                component={FormInput}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"countyDate"}
                                name={"countyDate"}
                                label={"Anniversary Date*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"anniversaryDateDD"}
                                name={"anniversaryDateDD"}
                                label={"Anniversary Date DD*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"empStepDate"}
                                name={"empStepDate"}
                                label={"Employee Step Date*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"rehireDate"}
                                name={"rehireDate"}
                                label={"Rehire Date*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"evalDate"}
                                name={"evalDate"}
                                label={"Evaluation Date*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"evalCompletionDate"}
                                name={"evalCompletionDate"}
                                label={"Eval Signing Date*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"evalNoticeSentDate"}
                                name={"evalNoticeSentDate"}
                                label={"Eval Notice Sent Date*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <Field
                                id={"lastDate"}
                                name={"lastDate"}
                                label={"Date Last*"}
                                component={FormDatePicker}
                                wrapperstyle={{
                                  width: "90%",
                                }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  paddingTop: 40,
                                  gap: 20,
                                }}
                              >
                                <Button
                                  className="k-button k-button-sm k-rounded-lg k-w-full k-button-expanded-payroll-submit k-button-expanded-payroll-cancel"
                                  themeColor={"bootstrap"}
                                  type={"button"}
                                >
                                  Cancel
                                </Button>

                                <Button
                                  className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                                  themeColor={"primary"}
                                  type={"submit"}
                                  disabled={!formRenderProps.allowSubmit}
                                >
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </fieldset>
                      </FormElement>
                    </>
                  )}
                />
              </ExpansionPanelContent>
            )}
          </Reveal>
        </ExpansionPanel>

        {editSalariesMenuOpen && (
          <EditSalaries setEditSalariesMenuOpen={setEditSalariesMenuOpen} />
        )}

        {salariesMenuOpen && (
          <AllSalaries
            setSalariesMenuOpen={setSalariesMenuOpen}
            setEditSalariesMenuOpen={setEditSalariesMenuOpen}
          />
        )}
      </div>
    </>
  );
};

export default memo(DistributionsPanel);
