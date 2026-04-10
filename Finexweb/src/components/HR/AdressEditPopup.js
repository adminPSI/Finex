import { Form, Field, FormElement } from "@progress/kendo-react-form";
import { FormDropDownList, FormInput } from "../form-components";
import { Button } from "@progress/kendo-react-buttons";
import React, { useState, useCallback, useEffect } from "react";
import { Dialog } from "@progress/kendo-react-dialogs";
import { PayrollEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import {
  addressValidator,
  onlyCharactersAllowedRequired,
  zipValidator,
} from "../validators";

export const EditEmployeeAdress = ({
  EmployeeAddressList,
  setAdressPopupVisible,
  selectedRowId,
  selectedAddresRowId,
  employeeData,
  isAddressEditing,
  setIsAddressEditing,
  activeInd,
}) => {
  const [selectCounty, ] = useState({});
  const setInitValue = useCallback(() => {
    if (!isAddressEditing) {
      return [];
    }

    const targetEmployeeAddress = employeeData.find(
      // eslint-disable-next-line eqeqeq
      (employee) => employee?.id == selectedRowId
    );
    let currentAddress = targetEmployeeAddress.details.find(
      // eslint-disable-next-line eqeqeq
      (address) => address?.id == selectedAddresRowId
    );
    return currentAddress;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowId]);

  const [formInit, ] = useState(setInitValue);

  const [countyList, setCountyList] = useState([]);

  const getCountiesList = () => {
    axiosInstance({
      method: "GET",
      url: PayrollEndPoints.getCountyDate,
      withCredentials: false,
    })
      .then((response) => {
        setCountyList(response?.data);
      })
      .catch((error) => {
        console.log(error);
      })
  };
  const editAdressSubmitHandlers = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    const data = {
      activeInd: activeInd,
      id: dataItem.id,
      employeeId: selectedRowId,
      address: dataItem.address,
      poBox: dataItem.poBox,
      city: dataItem.city,
      state: dataItem.state,
      zipCode: dataItem.zipCode,
      countyId: dataItem.county?.id,
    };

    if (isAddressEditing) {
      axiosInstance({
        method: "PUT",
        url: PayrollEndPoints.PutEmployeesAddress.replace("#ID#", dataItem.id),
        data: data,
        withCredentials: false,
      })
        .then(() => {
          setAdressPopupVisible(false);
          setIsAddressEditing(false);
          EmployeeAddressList();
          showSuccessNotification("Address updated successfully");
        })
        .catch(() => {})
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
      return;
    }

    axiosInstance({
      method: "POST",
      url: PayrollEndPoints.AllEmployeesAddress,
      data: data,
      withCredentials: false,
    })
      .then(() => {
        setAdressPopupVisible(false);
        setIsAddressEditing(false);
        EmployeeAddressList();
        showSuccessNotification("Address added successfully");
      })
      .catch(() => {})
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const closeMenuHandler = () => {
    setAdressPopupVisible(false);
    setIsAddressEditing(false);
  };

  useEffect(() => {
    getCountiesList();
  }, []);

  return (
    <>
      <Dialog
        width={500}
        height={500}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <span className="ms-2">
              <i className="fa-solid fa-right-left "></i>{" "}
              {isAddressEditing ? "Edit" : "Add"} Address
            </span>
          </div>
        }
        onClose={closeMenuHandler}
      >
        <Form
          onSubmit={editAdressSubmitHandlers}
          initialValues={formInit}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field
                  id={"address"}
                  name={"address"}
                  label={"Address*"}
                  textField="text"
                  dataItemKey="id"
                  component={FormInput}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  validator={addressValidator}
                />

                <Field
                  id={"poBox"}
                  name={"poBox"}
                  label={"P.O. Box"}
                  component={FormInput}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  maxLength={6}
                />
                <Field
                  id={"city"}
                  name={"city"}
                  label={"City*"}
                  component={FormInput}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  validator={(value) => {
                    return onlyCharactersAllowedRequired(value, "City");
                  }}
                />
                <Field
                  id={"zipCode"}
                  name={"zipCode"}
                  label={"Zip Code*"}
                  textField="text"
                  dataItemKey="id"
                  component={FormInput}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  maxLength={5}
                  validator={zipValidator}
                />
                <Field
                  id={"state"}
                  name={"state"}
                  label={"State*"}
                  component={FormInput}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  validator={(value) => {
                    return onlyCharactersAllowedRequired(value, "State");
                  }}
                />
                <Field
                  id={"county"}
                  name={"county"}
                  label={"County"}
                  textField="countyName"
                  dataItemKey="id"
                  data={countyList}
                  component={FormDropDownList}
                  value={selectCounty}
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
                    {isAddressEditing ? "Edit" : "Add"} Address
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
