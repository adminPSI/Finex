import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { Form, FormElement } from "@progress/kendo-react-form";
import { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { roleEndPoints } from "../../EndPoints";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
export const AddRole = ({ setAddRolePopupVisible, role, setEmployeesList }) => {
  const [selectedRole, ] = useState(role);
  const [form, ] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [disableAddRole, setDisableAddRole] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const closeMenuHandler = () => {
    setAddRolePopupVisible(false);
  };
  useEffect(() => {
    getUsersList();
  }, []);
  const getUsersList = () => {
    axiosInstance({
      method: "get",
      url: roleEndPoints.getUsers,
      withCredentials: false,
    })
      .then((response) => {
        let users = response.data;

        users = users.map((e, index) => {
          return {
            text: e,
            id: index,
          };
        });
        setUsersList(users);
      })
      .catch(() => {});
  };
  const handleSubmit = () => {
    let finalUsers = selectedUsers.map((e) => {
      return e.text;
    });
    axiosInstance({
      method: "POST",
      data: finalUsers,
      url: roleEndPoints.addUsersToRole.replace("#ROLE#", selectedRole),
      withCredentials: false,
    })
      .then((response) => {
        setAddRolePopupVisible(false);
        showSuccessNotification("Role added successfully");

        axiosInstance({
          method: "get",
          url: roleEndPoints.getUsersByRole.replace("#ROLE#", selectedRole),
          withCredentials: false,
        })
          .then((response) => {
            var usersList = response.data;
            usersList = usersList.map((item) => {
              return { name: item, role: selectedRole };
            });
            setEmployeesList(usersList);
          })
          .catch(() => {});
      })
      .catch(() => {});
  };
  const isCustom = (item) => {
    return item.id == undefined;
  };
  const addKey = (item) => {
    item.id = new Date().getTime();
  };
  const onChange = (event) => {
    const values = event.target.value;
    const lastItem = values[values.length - 1];
    if (lastItem && isCustom(lastItem)) {
      values.pop();
      const sameItem = values.find((v) => v.text == lastItem.text);
      if (sameItem == undefined) {
        addKey(lastItem);
        values.push(lastItem);
      }
    }
    if (values.length > 0) {
      setDisableAddRole(false);
    } else {
      setDisableAddRole(true);
    }
    setSelectedUsers(values);
  };

  return (
    <Dialog
      width={500}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-right-left "></i>{" "}
          <span className="ms-2">Add Employees to Role</span>
        </div>
      }
      onClose={closeMenuHandler}
    >
      <Form
        onSubmit={handleSubmit}
        initialValues={form}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <MultiSelect
                data={usersList}
                value={selectedUsers}
                onChange={onChange}
                placeholder="Select Employees"
                textField="text"
                dataItemKey="id"
                allowCustom={true}
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
                  disabled={disableAddRole}
                  onClick={handleSubmit}
                >
                  Add Employees
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
};
