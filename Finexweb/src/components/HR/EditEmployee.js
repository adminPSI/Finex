import { Reveal } from "@progress/kendo-react-animation";
import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  ExpansionPanel,
  ExpansionPanelContent
} from "@progress/kendo-react-layout";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PayrollEndPoints } from "../../EndPoints";
import {
  DateValidator,
  emailValidator,
  firstNameValidator,
  genderValidator,
  lastNameValidator,
  phoneNumberVaidator,
  ssnValidator
} from "../validators";

import {
  FormDatePicker,
  FormDropDownList,
  FormInput
} from "../form-components";

import axiosInstance from "../../core/HttpInterceptor";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";

const genderList = [
  { id: 1, genderCode: 1, text: "Male" },
  { id: 2, genderCode: 0, text: "Female" },
];

export default function PayrollAddNewEmployee() {
  const location = useLocation();

  const [genderValue, setGenderValue] = useState();

  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);

  const [formInit, setFormInit] = useState();
  const [formKey, setFormKey] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const dataa = location?.state;
    console.log(dataa);
    if (dataa?.action == "edit" || dataa?.action == "view") {
      dataa?.action == "edit" ? setIsEdit(true) : setIsEdit(false);
      dataa?.action == "view" ? setIsView(true) : setIsView(false);

      const targetEmployee = dataa?.employeeData?.find(
        (employee) => employee?.id == dataa?.id
      );
      let genderIndex = genderList.findIndex(
        (gender) => gender.genderCode == targetEmployee.genderCode
      );

      setGenderValue(genderList[genderIndex]);
      targetEmployee.genderCode = genderList[genderIndex]
        ? genderList[genderIndex]
        : targetEmployee.genderCode;
      targetEmployee.createdDate = targetEmployee.createdDate
        ? new Date(targetEmployee.createdDate)
        : "";
      targetEmployee.dateOfBirth = targetEmployee.dateOfBirth
        ? new Date(targetEmployee.dateOfBirth)
        : "";
      targetEmployee.modifiedDate = targetEmployee.modifiedDate
        ? new Date(targetEmployee.modifiedDate)
        : "";

      setFormInit(targetEmployee);
      setFormKey(formKey + 1);
    }
  }, [location?.state]);

  const addNewEmployeeHandleSubmit = (dataItem) => {
    if (dataItem.id) {
      try {
        axiosInstance({
          method: "PUT",
          url: PayrollEndPoints.EmployeeById.replace("ID", dataItem.id),
          data: {
            ...dataItem,
            genderCode: Number(dataItem?.genderCode?.genderCode),
            modifiedDate: new Date(),
          },
          withCredentials: false,
        })
          .then((response) => {
            showSuccessNotification("Employee details updated successfully");
            setTimeout(() => navigate("/hr-employee"), 500);
          })
          .catch(() => { });
      } catch (error) { }
    } else {
      let employeeInfo = {
        alsoKnownAs: dataItem.alsoKnownAs,
        organizationId: 1,
        firstName: dataItem.firstName,
        lastName: dataItem.lastName,
        dateOfBirth: dataItem.dateOfBirth,
        genderCode: Number(dataItem?.genderCode?.genderCode),
        ssn: dataItem.ssn,
        raceCode: dataItem.raceCode,
        employee: "",
        mobilePhoneNumber: dataItem.mobilePhoneNumber,
        personalEmailAddress: dataItem.personalEmailAddress,
        spouseName: dataItem.spouseName,
        driverLicenseNumber: dataItem.driverLicenseNumber,
        emailAddress: dataItem.emailAddress,
        employeeNumber: "",
        groupNumber: dataItem.groupNumber | "",
        clockNumber: dataItem.clockNumber,
        autoRunPrimaryJonInd: "ST",
        activeInd: "Y",
        supervisorInd: "",
        homePhoneNumber: dataItem.homePhoneNumber,
      };

      try {
        axiosInstance({
          method: "POST",
          url: PayrollEndPoints.Employee,
          data: employeeInfo,
          withCredentials: false,
        })
          .then((response) => {
            showSuccessNotification("Employee details saved successfully");

            setTimeout(() => navigate("/hr-employee"), 500);
          })
          .catch(() => { });
      } catch (error) { }
    }
  };

  const [expanded, setExpanded] = React.useState("Employee Info");

  const handleCancelClick = () => {
    navigate("/hr-employee");
  };

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            HR
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Employee
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Employee
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>
            {" "}
            {isView
              ? "Employee Detail"
              : isEdit
                ? "Edit Employee Detail"
                : "Add Employee Detail"}
          </h1>
        </div>
      </div>

      <Form
        onSubmit={addNewEmployeeHandleSubmit}
        initialValues={formInit}
        key={formKey}
        ignoreModified={true}
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
                              label={"First Name*"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              placeholder={"Enter your First Name"}
                              validator={firstNameValidator}
                            />
                            <Field
                              id={"lastName"}
                              name={"lastName"}
                              label={"Last Name*"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              placeholder="Enter your Last Name"
                              validator={lastNameValidator}
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
                              id={"alsoKnownAs"}
                              name={"alsoKnownAs"}
                              label={"AKA (Also Known As)"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              placeholder="Enter your Also Known As"
                            />

                            <Field
                              id={"dateOfBirth"}
                              name={"dateOfBirth"}
                              max={new Date()}
                              label={"Date of Birth (DOB)*"}
                              component={FormDatePicker}
                              validator={DateValidator}
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
                              id={"genderCode"}
                              name={"genderCode"}
                              label={"Gender*"}
                              data={genderList}
                              value={genderValue}
                              textField="text"
                              dataItemKey="id"
                              component={FormDropDownList}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              validator={genderValidator}
                            />

                            <Field
                              id={"ssn"}
                              name={"ssn"}
                              label={"Social Security Number (SSN)*"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              maxlength={9}
                              validator={ssnValidator}
                              placeholder={"Enter your SSN(9 digits)"}
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
                              id={"raceCode"}
                              name={"raceCode"}
                              label={"EEO Race Classification"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              placeholder={"Enter Race Code"}
                            />
                            <Field
                              id={"mobilePhoneNumber"}
                              name={"mobilePhoneNumber"}
                              label={"Phone Number*"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              maxlength={10}
                              validator={phoneNumberVaidator}
                              placeholder={"Enter your Phone Number"}
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
                              id={"driverLicenseNumber"}
                              name={"driverLicenseNumber"}
                              label={"License Number"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              placeholder={"Enter License Number"}
                            />
                            <Field
                              id={"emailAddress"}
                              name={"emailAddress"}
                              label={"Email Address*"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              validator={emailValidator}
                              placeholder={"Enter your Email"}
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
                              id={"personalEmailAddress"}
                              name={"personalEmailAddress"}
                              label={"Personal Email Address"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "35%",
                              }}
                              placeholder={"Enter your Email"}
                            />
                            {isView && (
                              <Field
                                id={"userName"}
                                name={"userName"}
                                label={"User Name"}
                                component={FormInput}
                                wrapperstyle={{
                                  width: "35%",
                                }}
                                disabled={true}
                              />
                            )}
                          </div>
                        </div>
                      </ExpansionPanelContent>
                    )}
                  </Reveal>
                </ExpansionPanel>

                {!isView && (
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
                )}
              </fieldset>
            </FormElement>
          </div>
        )}
      />
    </>
  );
}
