import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useState } from "react";

import { PayrollEndPoints } from "../../EndPoints";

import { Dialog } from "@progress/kendo-react-dialogs";
import { Error } from "@progress/kendo-react-labels";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
} from "../form-components";
import {
  DOBValidator,
  emailValidator,
  firstNameValidator,
  genderValidator,
  lastNameValidator,
  phoneNumberVaidator
} from "../validators";

import { MaskedTextBox } from "@progress/kendo-react-inputs";
import axiosInstance from "../../core/HttpInterceptor";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";

const genderList = [
  { id: 1, genderCode: 1, text: "Male" },
  { id: 2, genderCode: 0, text: "Female" },
];

export default function EditEmployeePopup({
  addEmployeeVisibleToggle,
  id,
  employeeData,
  action,
}) {
  const [genderValue, setGenderValue] = useState();

  const [, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);

  const [formInit, setFormInit] = useState();
  const [formKey, setFormKey] = useState(0);
  const [SSNValue, setSSNValue] = useState();
  const [SSNvalidation, setSSNvalidation] = useState(true);
  const [SSNvalidationMsg, setSSNvalidationMsg] = useState("");
  const [isSSNValueChange, setIsSSNValueChange] = useState(false);
  const handleSSNChange = (event) => {
    setIsSSNValueChange(true);
    const { value } = event.target;
    const ssn = value.replace(/[^0-9]/g, "");
    setSSNValue(value);
    const isSSNError = ssn.length == 9 || ssn.length == 0 ? true : false;
    setSSNvalidation(isSSNError);
    setSSNvalidationMsg(isSSNError ? "" : "Required 9 digits");
  };

  const formatSSNNumberToMask = (num) => {
    return (num || "").toString().replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
  };

  React.useEffect(() => {
    if (action == "edit" || action == "view") {
      action == "edit" ? setIsEdit(true) : setIsEdit(false);
      action == "view" ? setIsView(true) : setIsView(false);

      const targetEmployee = employeeData?.find(
        (employee) => employee?.id == id
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

      targetEmployee.dateOfBirth =
        targetEmployee.dateOfBirth &&
          new Date(targetEmployee.dateOfBirth).getFullYear() !== 1
          ? new Date(targetEmployee.dateOfBirth)
          : null;
      targetEmployee.modifiedDate = targetEmployee.modifiedDate
        ? new Date(targetEmployee.modifiedDate)
        : "";
      const ssn = formatSSNNumberToMask(
        targetEmployee.ssn && targetEmployee.ssn !== ""
          ? targetEmployee.ssn
          : "___-__-____"
      );
      targetEmployee.ssn = ssn;
      setSSNValue(ssn);
      setFormInit(targetEmployee);
      setFormKey(formKey + 1);
      if (action == "edit") {
        setSSNValue(
          ssn && ssn !== "___-__-____"
            ? "xxx-xx-" + ssn?.toString().slice(-4)
            : ssn
        );
      }
    }
  }, [action]);

  const addNewEmployeeHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    const targetEmployee = employeeData?.find((employee) => employee?.id == id);
    if (dataItem.id) {
      try {
        axiosInstance({
          method: "PUT",
          url: PayrollEndPoints.EmployeeById.replace("ID", dataItem.id),
          data: {
            ...dataItem,
            ssn: isSSNValueChange
              ? SSNValue && SSNValue !== "___-__-____"
                ? SSNValue.split("-").join("")
                : ""
              : targetEmployee.ssn && targetEmployee.ssn !== "___-__-____"
                ? targetEmployee.ssn.split("-").join("")
                : "",
            genderCode: Number(dataItem?.genderCode?.genderCode),
            modifiedDate: new Date(),
          },
          withCredentials: false,
        })
          .then((response) => {
            showSuccessNotification("Employee details updated successfully");
            setTimeout(() => addEmployeeVisibleToggle(), 500);
          })
          .catch(() => { })
          .finally(() => {
            if (submitButton) {
              submitButton.disabled = false;
            }
          });
      } catch (error) {
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    } else {
      let employeeInfo = {
        alsoKnownAs: dataItem.alsoKnownAs,
        organizationId: 1,
        firstName: dataItem.firstName,
        lastName: dataItem.lastName,
        middleName: dataItem.middleName,
        homePhoneNumber: dataItem.homePhoneNumber,
        dateOfBirth: dataItem.dateOfBirth,
        genderCode: Number(dataItem?.genderCode?.genderCode),
        ssn: isSSNValueChange
          ? SSNValue && SSNValue !== "___-__-____"
            ? SSNValue?.split("-").join("")
            : ""
          : "",
        raceCode: dataItem.raceCode,
        employee: "",
        mobilePhoneNumber: dataItem.mobilePhoneNumber,
        personalEmailAddress: dataItem.personalEmailAddress,
        spouseName: dataItem.spouseName,
        driverLicenseNumber: dataItem.driverLicenseNumber,
        emailAddress: dataItem.emailAddress,
        employeeNumber: dataItem.employeeNumber || "",
        groupNumber: dataItem.groupNumber | "",
        clockNumber: dataItem.clockNumber,
        autoRunPrimaryJonInd: "ST",
        activeInd: "Y",
        supervisorInd: "",
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
            setTimeout(() => addEmployeeVisibleToggle(), 500);
          })
          .catch(() => { })
          .finally(() => {
            if (submitButton) {
              submitButton.disabled = false;
            }
          });
      } catch (error) {
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    }
  };

  const handleCancelClick = () => {
    addEmployeeVisibleToggle();
  };

  return (
    <>
      <Dialog
        width={600}
        maxHeight={"95vh"}
        title={
          <div className="d-flex align-items-center justify-content-center">
            {!isView && <i className="fa-solid fa-plus"></i>}
            <span className="ms-2">
              {action == "edit"
                ? "Edit Employee"
                : action == "add"
                  ? "Add Employee"
                  : "View Employee"}
            </span>
          </div>
        }
        onClose={addEmployeeVisibleToggle}
      >
        <Form
          onSubmit={addNewEmployeeHandleSubmit}
          initialValues={formInit}
          key={formKey}
          ignoreModified={true}
          render={(formRenderProps) => (
            <div
              style={{
                maxHeight: "80vh",
                overflow: 'auto'
              }}
            >
              <FormElement>
                <fieldset className={"k-form-fieldset"}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    <Field
                      id={"firstName"}
                      name={"firstName"}
                      label={"First Name*"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      placeholder={"Enter your First Name"}
                      validator={firstNameValidator}
                      disabled={isView}
                    />
                    <Field
                      id={"middleName"}
                      name={"middleName"}
                      label={"Middle Name"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      placeholder={"Enter your Middle Name"}
                      disabled={isView}
                    />
                    <Field
                      id={"lastName"}
                      name={"lastName"}
                      label={"Last Name*"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      placeholder={"Enter your Last Name"}
                      validator={lastNameValidator}
                      disabled={isView}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    <Field
                      id={"alsoKnownAs"}
                      name={"alsoKnownAs"}
                      label={"AKA (Also Known As)"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      placeholder={"Enter your Also Known As"}
                      disabled={isView}
                    />

                    <Field
                      id={"dateOfBirth"}
                      name={"dateOfBirth"}
                      label={"Date of Birth (DOB)*"}
                      max={new Date()}
                      component={FormDatePicker}
                      validator={DOBValidator}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      disabled={isView}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
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
                        width: "100%",
                      }}
                      validator={genderValidator}
                      disabled={isView}
                      className="mb-2"
                    />
                    <div
                      className="k-form-field hr-employee"
                      style={{ width: "100%" }}
                    >
                      <MaskedTextBox
                        style={{ marginTop: "7px" }}
                        id={"ssn"}
                        name={"ssn"}
                        label={"Social Security Number (SSN)"}
                        mask="000-00-0000"
                        placeholder={"Enter your SSN(9 digits)"}
                        disabled={isView}
                        wrapperstyle={{
                          width: "50%",
                        }}
                        value={
                          action == "view" &&
                            SSNValue &&
                            SSNValue !== "___-__-____"
                            ? "xxx-xx-" + SSNValue?.toString().slice(-4)
                            : SSNValue
                        }
                        onChange={handleSSNChange}
                        onFocus={() => {
                          if (SSNValue?.includes("x")) {
                            setSSNValue("___-__-____");
                          }
                        }}
                        valid={SSNvalidation}
                      />
                      {SSNvalidationMsg && <Error>{SSNvalidationMsg}</Error>}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    <Field
                      id={"mobilePhoneNumber"}
                      name={"mobilePhoneNumber"}
                      label={"Phone Number*"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      maxlength={10}
                      validator={phoneNumberVaidator}
                      placeholder={"Enter your Phone Number"}
                      disabled={isView}
                    />
                    <Field
                      id={"homePhoneNumber"}
                      name={"homePhoneNumber"}
                      label={"Home Phone Number"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      maxlength={10}
                      placeholder={"Enter your Home Phone Number"}
                      disabled={isView}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    <Field
                      id={"emailAddress"}
                      name={"emailAddress"}
                      label={"Email Address*"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      validator={emailValidator}
                      placeholder={"Enter your Email"}
                      disabled={isView}
                    />
                    <Field
                      id={"personalEmailAddress"}
                      name={"personalEmailAddress"}
                      label={"Personal Email Address"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      placeholder={"Enter your Email"}
                      disabled={isView}
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
                      id={"employeeNumber"}
                      name={"employeeNumber"}
                      label={"Employee Number"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      editorProps={{
                        type: "number",
                      }}
                      maxLength={10}
                      placeholder="Enter Employee Number"
                      disabled={isView}
                    />
                    <Field
                      id={"driverLicenseNumber"}
                      name={"driverLicenseNumber"}
                      label={"License Number"}
                      component={FormInput}
                      wrapperstyle={{
                        width: "100%",
                      }}
                      maxLength={15}
                      placeholder={"Enter License Number"}
                      disabled={isView}
                    />
                    {isView && (
                      <Field
                        id={"userName"}
                        name={"userName"}
                        label={"User Name"}
                        component={FormInput}
                        wrapperstyle={{
                          width: "100%",
                        }}
                        disabled={true}
                      />
                    )}
                  </div>

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
      </Dialog >
    </>
  );
}
