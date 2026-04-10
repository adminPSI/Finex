import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { roleEndPoints } from "../../EndPoints";
import { FormDropDownList } from "../form-components";

export const RemoveRole = ({ setRemoveRolePopupVisible }) => {
  const [rolesList, setRolesList] = React.useState([]);

  const closeMenuHandler = () => {
    setRemoveRolePopupVisible(false);
  };
  React.useEffect(() => {
    getRolesList();
  }, []);
  const getRolesList = () => {
    axiosInstance({
      method: "get",
      url: roleEndPoints.getRoles,
      withCredentials: false,
    })
      .then((response) => {
        setRolesList(response.data);
      })
      .catch(() => {});
  };
  const handleSubmit = (dataItem) => {
    axiosInstance({
      method: "Delete",
      url: roleEndPoints.removeRole.replace("#ROLE#", dataItem.roleName.name),
      withCredentials: false,
    })
      .then((response) => {
        setRemoveRolePopupVisible(false);
      })
      .catch(() => {});
  };

  return (
    <>
      <Dialog
        width={500}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-right-left "></i>{" "}
            <span className="ms-2">Remove Role</span>
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
                  label={"Select Role"}
                  textField="name"
                  dataItemKey="roleName"
                  component={FormDropDownList}
                  data={rolesList}
                  value={rolesList.name}
                  wrapperstyle={{
                    width: "50%",
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
                    Remove Role
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
