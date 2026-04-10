import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthenticationEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import Logo from "../../img/logo.jpg";
import { FormInput } from "../form-components";
import { emailValidator, passwordValidator } from "../validators";

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate();
  const handleSubmit = async (dataItem) => {
    await handleResetPassword(dataItem);
  };
  const token = searchParams.get("token");
  const handleResetPassword = async (dataItem) => {
    try {
      let apirequest = {
        email: dataItem.email,
        newPassword: dataItem.newPassword,
        resetCode: token,
      };
      await axiosInstance({
        method: "POST",
        url: AuthenticationEndPoints.resetPassword,
        withCredentials: false,
        data: apirequest,
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="app-wrapper content-wrapper w-100">
      <header className="header-wrapper">
        <div className="container">
          <div className="logo">
            <img
              src={Logo}
              width={200}
              alt="logo"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                navigate("/");
              }}
            />
          </div>
        </div>
      </header>
      <section
        className="heroScreen"
        style={{ maxHeight: "calc(100vh - 100px)" }}
      >
        <div className="container ">
          <div className="row d-flex justify-content-center h-100">
            <div className="col-12 col-md-5">
              <div className="hero-form">
                <h3 className="form-heading">Reset Password</h3>
                <Form
                  onSubmit={handleSubmit}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <Field
                          id={"email"}
                          name={"email"}
                          label={"Email*"}
                          type={"text"}
                          component={FormInput}
                          validator={emailValidator}
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
                            if (
                              e !== formRenderProps.valueGetter("newPassword")
                            ) {
                              return "password does not match.";
                            }
                          }}
                        />

                        <div className="k-form-buttons k-w-full mt-3">
                          <Button
                            type={"submit"}
                            className="k-w-full"
                            themeColor={"primary"}
                          >
                            Reset Password
                          </Button>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;
