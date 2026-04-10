import { Reveal } from "@progress/kendo-react-animation";
import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  ExpansionPanel,
  ExpansionPanelContent
} from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { PayrollEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormTextArea
} from "../form-components";
import {
  activeDateValidator
} from "../validators";


export default function PayrollAddNewEmployee() {
  const [jobClassList, setJobClassList] = React.useState([]);
  const [selectedCJobClassVal, ] = React.useState({});

  const [employeeNumber, ] = useState("");
  const [formInit, ] = useState();
  const navigate = useNavigate();

  const [selectedNavigation, setSelectedNavigation] = React.useState(0);

  const handleSelectNavigation = (e) => {
    setSelectedNavigation(e.selected);

    switch (e.selected) {
      case 0:
        navigate("/PayrollAddNewEmployee");
        break;
      case 1:
        navigate("/payroll/add-significant-rates");
        break;
      case 2:
        navigate("/payroll/add-significant-dates");
        break;
      default:
        break;
    }
  };

  const addNewEmployeeHandleSubmit = () => {};

  const [expanded, setExpanded] = React.useState("Employee Info");

  const handleCancelClick = () => {
    navigate("/payroll/payroll-employee-info");
  };

  useEffect(() => {
    getJobClassList();
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

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Employee Info
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Add Employee Info
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Payroll Employee Info</h1>
        </div>
      </div>
      <TabStrip
        style={{ boxShadow: "none" }}
        tabContentStyle={{ display: "none" }}
        className="app-tab"
        selected={selectedNavigation}
        onSelect={handleSelectNavigation}
      >
        <TabStripTab title="Employee Info"></TabStripTab>
        <TabStripTab title="Significant Rates"></TabStripTab>
        <TabStripTab title="Significant Dates"></TabStripTab>
      </TabStrip>
      <Form
        onSubmit={addNewEmployeeHandleSubmit}
        initialValues={formInit}
        render={(formRenderProps) => (
          <div>
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <ExpansionPanel
                  className={"k-expanded-payroll"}
                  title="Employee personal info"
                  expanded={expanded == "Employee Info"}
                  tabIndex={0}
                  key="Employee Info"
                  onAction={(event) => {
                    setExpanded(event.expanded ? "" : "Employee Info");
                  }}
                >
                  <Reveal>
                    {expanded == "Employee Info" && (
                      <ExpansionPanelContent>
                        <div onKeyDown={(e) => e.stopPropagation()}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",

                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"firstName"}
                              name={"firstName"}
                              label={"First Name"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                            <Field
                              id={"lastName"}
                              name={"lastName"}
                              label={"Last Name"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",

                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"aka"}
                              name={"aka"}
                              label={"AKA (Also Known As)"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />

                            <Field
                              id={"dob"}
                              name={"dob"}
                              label={"Date of Birth (DOB)*"}
                              component={FormDatePicker}
                              format="MM/dd/yyyy"
                              formatPlaceholder={{
                                year: "YYYY",
                                month: "MM",
                                day: "DD",
                              }}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",

                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"gender"}
                              name={"gender"}
                              label={"Gender"}
                              textField="gender"
                              dataItemKey="id"
                              component={FormDropDownList}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />

                            <Field
                              id={"ssn"}
                              name={"ssn"}
                              label={"Social Security Number (SSN)*"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",

                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"eeo"}
                              name={"eeo"}
                              label={"EEO Race Classification"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                            <Field
                              id={"employeeNumber"}
                              name={"employeeNumber"}
                              label={"Phone Number"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              value={employeeNumber}
                            />
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",

                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"cellNumber"}
                              name={"cellNumber"}
                              label={"Cell Number"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                            <Field
                              id={"spouseNumber"}
                              name={"spouseNumber"}
                              label={"Spouse Name"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",

                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"licenseNumber"}
                              name={"licenseNumber"}
                              label={"License Number"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                            <Field
                              id={"emailAdress"}
                              name={"emailAdress"}
                              label={"Email Address"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",

                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"personalEmailAdress"}
                              name={"personalEmailAdress"}
                              label={"Personal Email Address"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                            />
                            <Field
                              id={"vacationRateYears"}
                              name={"vacationRateYears"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              type={"hidden"}
                            />
                          </div>
                        </div>
                      </ExpansionPanelContent>
                    )}
                  </Reveal>
                </ExpansionPanel>

                <ExpansionPanel
                  title="Employee address"
                  expanded={expanded == "Employee-Adress"}
                  onAction={(event) => {
                    setExpanded(event.expanded ? "" : "Employee-Adress");
                  }}
                >
                  <Reveal>
                    {expanded == "Employee-Adress" && (
                      <ExpansionPanelContent>
                        <div onKeyDown={(e) => e.stopPropagation()}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Field
                              id={"streetAdress"}
                              name={"streetAdress"}
                              label={"Street Adress"}
                              component={FormTextArea}
                              style={{ width: "60vw" }}
                              placeholder="Lorem Ipsum..."
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"poBox"}
                              name={"poBox"}
                              label={"P.O. Box"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                            <Field
                              id={"city"}
                              name={"city"}
                              label={"City"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"state"}
                              name={"state"}
                              label={"State"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                            <Field
                              id={"zipCode"}
                              name={"zipCode"}
                              label={"Zip Code"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: "20px",
                            }}
                          >
                            <Field
                              id={"country"}
                              name={"country"}
                              label={"Country"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                            <Field
                              id={"vacationRateYears"}
                              name={"vacationRateYears"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "29.5vw",
                              }}
                              type={"hidden"}
                            />
                          </div>
                        </div>
                      </ExpansionPanelContent>
                    )}
                  </Reveal>
                </ExpansionPanel>

                <ExpansionPanel
                  title="Employee Job Info"
                  expanded={expanded == "Employee-Job-Info"}
                  onAction={(event) => {
                    setExpanded(event.expanded ? "" : "Employee-Job-Info");
                  }}
                >
                  <Reveal>
                    {expanded == "Employee-Job-Info" && (
                      <ExpansionPanelContent>
                        <div onKeyDown={(e) => e.stopPropagation()}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 20,
                            }}
                          >
                            <Field
                              id={"primaryJobDescription"}
                              name={"primaryJobDescription"}
                              label={"Primary Job Description*"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />

                            <Field
                              id={"jobClassification"}
                              name={"jobClassification"}
                              label={"Job Classification"}
                              textField="jobClassification"
                              dataItemKey="id"
                              popupSettings={{ width: "auto" }}
                              component={FormDropDownList}
                              data={jobClassList}
                              value={selectedCJobClassVal}
                              wrapperstyle={{
                                width: "50%",
                                marginRight: "10px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 20,
                            }}
                          >
                            <Field
                              id={"employeeNumber"}
                              name={"employeeNumber"}
                              label={"Employee Number*"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                            <Field
                              id={"groupNumber"}
                              name={"groupNumber"}
                              label={"Group Number"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 20,
                            }}
                          >
                            <Field
                              id={"clockNumber"}
                              name={"clockNumber"}
                              label={"Clock Number"}
                              textField="gender"
                              dataItemKey="id"
                              component={FormDropDownList}
                              wrapperstyle={{
                                width: "29.5vw",
                              }}
                            />

                            <Field
                              id={"salaryHourly"}
                              name={"salaryHourly"}
                              label={"Salary/Hourly"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 20,
                            }}
                          >
                            <Field
                              id={"workedMonth"}
                              name={"workedMonth"}
                              label={"Number of Months Worked"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                            <Field
                              id={"startContractDatedob"}
                              name={"startContractDate"}
                              label={"Contract Start Date*"}
                              component={FormDatePicker}
                              format="MM/dd/yyyy"
                              formatPlaceholder={{
                                year: "YYYY",
                                month: "MM",
                                day: "DD",
                              }}
                              validator={activeDateValidator}
                              wrapperstyle={{ width: "29.5vw" }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 20,
                            }}
                          >
                            <Field
                              id={"contractEndDate"}
                              name={"contractEndDate"}
                              label={"Contract End Date"}
                              component={FormDatePicker}
                              format="MM/dd/yyyy"
                              formatPlaceholder={{
                                year: "YYYY",
                                month: "MM",
                                day: "DD",
                              }}
                              validator={activeDateValidator}
                              wrapperstyle={{ width: "29.5vw" }}
                            />
                            <Field
                              id={"originalHireDate"}
                              name={"originalHireDate"}
                              label={"Original Hire Date"}
                              component={FormDatePicker}
                              format="MM/dd/yyyy"
                              formatPlaceholder={{
                                year: "YYYY",
                                month: "MM",
                                day: "DD",
                              }}
                              validator={activeDateValidator}
                              wrapperstyle={{ width: "29.5vw" }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 20,
                            }}
                          >
                            <Field
                              id={"employeeDepartmentNumber"}
                              name={"employeeDepartmentNumber"}
                              label={"Employee Department Number"}
                              component={FormDatePicker}
                              format="MM/dd/yyyy"
                              formatPlaceholder={{
                                year: "YYYY",
                                month: "MM",
                                day: "DD",
                              }}
                              validator={activeDateValidator}
                              wrapperstyle={{ width: "29.5vw" }}
                            />
                            <Field
                              id={"supervisor"}
                              name={"supervisor"}
                              label={"Supervisor"}
                              component={FormDatePicker}
                              format="MM/dd/yyyy"
                              formatPlaceholder={{
                                year: "YYYY",
                                month: "MM",
                                day: "DD",
                              }}
                              validator={activeDateValidator}
                              wrapperstyle={{ width: "29.5vw" }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 20,
                            }}
                          >
                            <Field
                              id={"username"}
                              name={"username"}
                              label={"Username"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                            <Field
                              id={"holidaySchedule"}
                              name={"holidaySchedule"}
                              label={"Holiday Schedule"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 20,
                            }}
                          >
                            <Field
                              id={"terminationDate"}
                              name={"terminationDate"}
                              label={"Termination Date"}
                              component={FormInput}
                              style={{ width: "29.5vw" }}
                            />

                            <Field
                              id={"vacationRateYears"}
                              name={"vacationRateYears"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "29.5vw",
                              }}
                              type={"hidden"}
                            />
                          </div>
                        </div>
                      </ExpansionPanelContent>
                    )}
                  </Reveal>
                </ExpansionPanel>

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
                    themeColor={"primary"}
                    type={"button"}
                    onClick={handleCancelClick}
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
              </fieldset>
            </FormElement>
          </div>
        )}
      />
    </>
  );
}
