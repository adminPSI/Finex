import { Field, Form, FormElement } from "@progress/kendo-react-form";

import {
  FormCheckbox,
  FormDatePicker,
  FormInput
} from "../form-components";
import React, { useCallback, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { PayrollEndPoints } from "../../EndPoints";
import { Dialog } from "@progress/kendo-react-dialogs";
import axiosInstance from "../../core/HttpInterceptor";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import {
  onlyCharAllowedReg
} from "../validators";


export const AddEmployeeDependent = ({
  EmployeeDependentList,
  setDependentPopupVisible,
  selectedRowId,
  selectedDependentRowId,
  employeeData,
  isDependentEditing,
  setIsDependentEditing,
}) => {
  const setInitValue = useCallback(() => {
    if (!isDependentEditing) {
      return [];
    }

    const targetEmployeeDependent = employeeData?.find(
      (employee) => employee?.id == selectedRowId
    );
    let employeeDependent = JSON.parse(JSON.stringify(targetEmployeeDependent));

    let currentDependent = employeeDependent.dependentDetails.find(
      (depend) => depend?.id == selectedDependentRowId
    );
    currentDependent.dateOfBirth = currentDependent.dateOfBirth
      ? new Date(currentDependent.dateOfBirth)
      : null;
    return currentDependent;
  }, [selectedRowId]);

  const [formInit, ] = useState(setInitValue);

  const addEmployeeDependent = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    const data = {
      id: dataItem.id | 0,
      employeeId: selectedRowId,
      name: dataItem.name,
      dateOfBirth: dataItem.dateOfBirth,
      relationship: dataItem.relationship,
      dependent: dataItem.dependent,
    };
    if (isDependentEditing) {
      axiosInstance({
        method: "PUT",
        url: PayrollEndPoints.PutEmployeeFamily.replace("#ID#", dataItem.id),
        data: data,
        withCredentials: false,
      })
        .then((response) => {
          setDependentPopupVisible(false);
          EmployeeDependentList();
          showSuccessNotification("Dependent updated successfully");
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
      return;
    }
    axiosInstance({
      method: "POST",
      url: PayrollEndPoints.EmployeesFamily,
      data: data,
      withCredentials: false,
    })
      .then((response) => {
        setDependentPopupVisible(false);
        EmployeeDependentList();
        showSuccessNotification("Dependent added successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const closeMenuHandler = () => {
    setDependentPopupVisible(false);
    setIsDependentEditing(false);
  };

  const onlyCharactersAllowedRequiredName = (value) => {
    return !value
      ? `Name Field is required.`
      : value &&
      (onlyCharAllowedReg.test(value) ? "" : "Only characters allowed");
  };

  const onlyCharactersAllowedRequiredRelationship = (value, field) => {
    return !value
      ? `Relationship is required.`
      : value &&
      (onlyCharAllowedReg.test(value) ? "" : "Only characters allowed");
  };
  return (
    <>
      <Dialog
        width={500}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <span className="ms-2">
              <i className="fa-solid fa-plus"></i>{" "}
              {isDependentEditing ? "Edit" : "Add"} Dependent
            </span>
          </div>
        }
        onClose={closeMenuHandler}
      >
        <Form
          onSubmit={addEmployeeDependent}
          initialValues={formInit}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field
                  id={"name"}
                  name={"name"}
                  label={"Name*"}
                  component={FormInput}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  validator={onlyCharactersAllowedRequiredName}
                />
                <Field
                  id={"relationship"}
                  name={"relationship"}
                  label={"Relationship*"}
                  component={FormInput}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  validator={onlyCharactersAllowedRequiredRelationship}
                />
                <Field
                  id={"dateOfBirth"}
                  name={"dateOfBirth"}
                  label={"Date Of Birth"}
                  max={new Date()}
                  component={FormDatePicker}
                  wrapperstyle={{
                    width: "100%",
                  }}
                />
                <Field
                  id={"dependent"}
                  name={"dependent"}
                  label={"Dependent"}
                  component={FormCheckbox}
                  wrapperstyle={{
                    width: "100%",
                  }}
                />
                <div className="k-form-buttons">
                  <Button
                    themeColor={"primary"}
                    className={"col-12"}
                    type={"submit"}
                    disabled={!formRenderProps.allowSubmit}
                  >
                    {isDependentEditing ? "Save" : "Add"} Dependent
                  </Button>
                </div>
              </fieldset>
            </FormElement>
          )}
        />
      </Dialog>
    </>
  );
};
