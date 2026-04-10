import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Tooltip } from "@progress/kendo-react-tooltip";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import { AuthenticationEndPoints } from "../../EndPoints";
import Logo from "../../img/logo.jpg";
import { FormInput } from "../form-components";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";
import {
  emailValidator,
  firstNameValidator,
  lastNameValidator,
  passwordValidator,
} from "../validators";

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  var token = location?.search?.substring(1)?.split("token=")[1];
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSubmit = async (dataItem) => {
    try {
      if (dataItem.password !== dataItem.confirmPassword) {
        showErrorNotification("Password is not matching");
      } else {
        let apiRequest = {
          userEmail: dataItem.userEmail,
          firstName: dataItem.firstName,
          lastName: dataItem.lastName,
          password: dataItem.password,
          confirmPassword: dataItem.confirmPassword,
          token: token,
        };

        axiosInstance({
          method: "Post",
          data: apiRequest,
          url: AuthenticationEndPoints.Register,
          withCredentials: false,
        })
          .then((response) => {
            setShowSuccessPopup(true);
          })
          .catch(() => {});
      }
    } catch (error) {}
  };
  const toggleDialog = () => {
    setShowSuccessPopup(false);
    navigate("/");
  };

  return (
    <div className="app-wrapper d-flex flex-column justify-content-center align-items-center">
      <img src={Logo} style={{ marginBottom: 50 }} width={200} alt="logo" />
      <h3>Registration Form</h3>
      <Form
        onSubmit={handleSubmit}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"userEmail"}
                name={"userEmail"}
                label={"Email"}
                type={"text"}
                validator={emailValidator}
                component={FormInput}
              />
              <Field
                id={"firstName"}
                name={"firstName"}
                label={"First Name"}
                type={"text"}
                component={FormInput}
                validator={firstNameValidator}
              />
              <Field
                id={"lastName"}
                name={"lastName"}
                label={"Last Name"}
                type={"text"}
                component={FormInput}
                validator={lastNameValidator}
              />
              <Tooltip anchorElement="target" parentTitle={true}>
                <Field
                  id={"password"}
                  name={"password"}
                  label={"Password"}
                  type={"password"}
                  component={FormInput}
                  validator={passwordValidator}
                  title={"dsfgsdf"}
                />
              </Tooltip>
              <Field
                id={"confirmPassword"}
                name={"confirmPassword"}
                label={"Confirm Password"}
                type={"password"}
                component={FormInput}
                validator={passwordValidator}
              />

              <div className="k-form-buttons k-w-full">
                <Button
                  type={"submit"}
                  className="k-w-full"
                  themeColor={"primary"}
                >
                  Submit
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
      {showSuccessPopup && (
        <Dialog
          title={<span>Successfully Registered</span>}
          onClose={toggleDialog}
        >
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Thanks for Providing Information.You will be notified after account
            is activated.
          </p>
          <DialogActionsBar>
            <div
              className={"col-6"}
              style={{
                textAlign: "center",
              }}
            >
              <Button themeColor={"primary"} onClick={toggleDialog}>
                Close
              </Button>
            </div>
          </DialogActionsBar>
        </Dialog>
      )}
    </div>
  );
}
