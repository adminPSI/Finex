import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import axiosInstance from "../../core/HttpInterceptor";
import { AuthenticationEndPoints } from "../../EndPoints";
import { FormInput } from "../form-components";
import {
  showSuccessNotification
} from "../NotificationHandler/NotificationHandler";
import { emailValidator, passwordValidator } from "../validators";

export default function SignIn() {
  const navigate = useNavigate();
  const { checkAuthUser } = useAuthContext();

  const [showEmailField, setShowEmailField] = React.useState(false);
  const [showErrorMassage, setShowErrorMassage] = React.useState(false);

  const handleSubmit = async (dataItem) => {
    let session = await signInAccount(dataItem);

    if (session?.token) {
      const isLoggedIn = await checkAuthUser(session);
      if (isLoggedIn) {
        navigate("/dashboard");
        window?.location?.reload()
      } else {
        showSuccessNotification("Login successfully");
      }
    } else {
      navigate("/");
      setShowErrorMassage(true)
    }
  };

  const signInAccount = async (dataItem) => {
    try {
      let apirequest = {
        username: dataItem.email,
        password: dataItem.password,
      };
      const response = await axiosInstance({
        method: "POST",
        url: AuthenticationEndPoints.signIn,
        withCredentials: false,
        data: apirequest,
      });
      let data = response.data;
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };
  const sendPasswordResetLink = (dataItem) => {
    try {
      axiosInstance({
        method: "POST",
        url: AuthenticationEndPoints.forgotPassword,
        withCredentials: false,
        data: dataItem.email,
      })
        .then((response) => {
          let data = response.data;
          if (data?.token) {
            encodeURIComponent(data.token);
          }
          setShowEmailField(false);
          showSuccessNotification("Reset password link sent to your email id");
        })
        .catch(() => { });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <h3 className="form-heading">Login to your Account</h3>
      <Form
        onSubmit={handleSubmit}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"email"}
                name={"email"}
                label={"Email"}
                type={"text"}
                component={FormInput}
              />
              <Field
                id={"password"}
                name={"password"}
                label={"Password"}
                type={"password"}
                component={FormInput}
                validator={passwordValidator}
              />

              <div className="k-form-buttons k-w-full mt-3">
                <Button
                  type={"submit"}
                  className="k-w-full"
                  themeColor={"primary"}
                >
                  Sign In
                </Button>
                <Button
                  className="k-w-full"
                  themeColor={"primary"}
                  type={"button"}
                  onClick={() => {
                    setShowEmailField(true);
                  }}
                >
                  Forgot Password
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
      {showEmailField && (
        <Dialog
          width={400}
          title={<span>Enter Registered Email </span>}
          onClose={() => {
            setShowEmailField(false);
          }}
        >
          <Form
            onSubmit={sendPasswordResetLink}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={"k-form-fieldset"}>
                  <Field
                    id={"email"}
                    name={"email"}
                    label={"Email*"}
                    component={FormInput}
                    validator={emailValidator}
                  />

                  <div className="k-form-buttons col d-flex justify-content-center mt-3">
                    <Button
                      themeColor={"secondary"}
                      onClick={() => setShowEmailField(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      themeColor={"primary"}
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
      )}
      {
        showErrorMassage && (
          <Dialog
            width={400}
            title={<span>Sign in error</span>}
            onClose={() => {
              setShowErrorMassage(false);
            }}
          >
            <div>
              <p>Please provide a valid email and password.</p>
            </div>
            <div className="k-form-buttons col d-flex justify-content-center mt-3">
              <Button
                themeColor={"secondary"}
                onClick={() => setShowErrorMassage(false)}
              >
                Close
              </Button>
            </div>
          </Dialog>
        )
      }
    </>
  );
}
