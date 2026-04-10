import React from "react";

import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { FormInput } from "../form-components";
import { passwordValidator } from "../validators";
import { Button } from "@progress/kendo-react-buttons";
import axiosInstance from "../../core/HttpInterceptor";
import { AuthenticationEndPoints } from "../../EndPoints";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";

const ChangePassword = ({ setShowResetPass }) => {
  const onSubmitResetPassword = (dataItem) => {
    axiosInstance({
      method: "POST",
      url:
        AuthenticationEndPoints.changePassword +
        `?oldPassword=${dataItem.oldPassword}` +
        `&newPassword=${dataItem.newPassword}`,
      withCredentials: false,
    })
      .then(() => {
        showSuccessNotification("Password changed successfully.");
        setShowResetPass(false);
      })
      .catch(() => {});
  };

  return (
    <Dialog
      width={400}
      title={<span>Change Password </span>}
      onClose={() => {
        setShowResetPass(false);
      }}
    >
      <Form
        onSubmit={onSubmitResetPassword}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"oldPassword"}
                name={"oldPassword"}
                label={"Current Password*"}
                type={"password"}
                component={FormInput}
                validator={passwordValidator}
              />
              <Field
                id={"newPassword"}
                name={"newPassword"}
                label={"New Password*"}
                type={"password"}
                component={FormInput}
                validator={passwordValidator}
              />

              <Field
                id={"confirmPassword"}
                name={"confirmPassword"}
                label={"Confirm New Password*"}
                type={"password"}
                component={FormInput}
                validator={(e) => {
                  if (e !== formRenderProps.valueGetter("newPassword")) {
                    return "password does not match.";
                  }
                }}
              />

              <div className="k-form-buttons d-flex justify-content-center">
                <Button
                  themeColor={"secondary"}
                  className={"col-5"}
                  onClick={() => setShowResetPass(false)}
                >
                  Cancel
                </Button>
                <Button
                  themeColor={"primary"}
                  className={"col-5"}
                  type={"submit"}
                  disabled={!formRenderProps.allowSubmit}
                >
                  Submit
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
};

export default ChangePassword;
