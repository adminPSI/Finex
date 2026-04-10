import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { roleEndPoints } from "../../EndPoints";
import { FormInput } from "../form-components";
export const CreateRole = ({ setRolePopupVisible, getRolesList }) => {
  const closeMenuHandler = () => {
    setRolePopupVisible(false);
  };

  const handleSubmit = (dataItem) => {

    axiosInstance({
      method: "POST",
      url: roleEndPoints.createRole + "?name=" + dataItem.roleName,
      withCredentials: false,
    })
      .then((response) => {
        setRolePopupVisible(false);
        getRolesList()
      })
      .catch(() => { });
  };

  return (
    <>
      <Dialog
        width={500}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-right-left "></i>{" "}
            <span className="ms-2">Create Role</span>
          </div>
        }
        onClose={closeMenuHandler}
      >
        <Form
          onSubmit={handleSubmit}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field
                  id={"roleName"}
                  name={"roleName"}
                  label={"Role Name"}
                  textField="text"
                  dataItemKey="roleName"
                  component={FormInput}
                  wrapperstyle={{
                    width: "100%",
                  }}
                />

                <div className="k-form-buttons">
                  <Button
                    themeColor={"secondary"}
                    className={"col-6"}
                    onClick={closeMenuHandler}
                  >
                    Cancel
                  </Button>
                  <Button
                    themeColor={"primary"}
                    className={"col-6"}
                    type={"submit"}
                    disabled={!formRenderProps.allowSubmit}
                  >
                    Create Role
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
