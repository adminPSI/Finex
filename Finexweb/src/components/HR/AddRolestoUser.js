import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { ListBox } from "@progress/kendo-react-listbox";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { roleEndPoints } from "../../EndPoints";
export const AddRoleToUser = ({
  setAddRoleToUserPopupVisible,
  selectedRowId,
  employeeData,
}) => {
  const [rolesList, setRolesList] = useState([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const SELECTED_FIELD = "selected";
  const closeMenuHandler = () => {
    setAddRoleToUserPopupVisible(false);
  };

  useEffect(() => {
    getRolesByUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getRolesByUser = () => {
    const selectedEmployee = employeeData.find((employee) => {
      return employee?.id == Number(selectedRowId);
    });
    setSelectedEmployeeName(selectedEmployee?.userName);
    axiosInstance({
      method: "POST",
      url:
        roleEndPoints.getRolesByUser +
        "?UserName=" +
        selectedEmployee?.userName,
      withCredentials: false,
    })
      .then((response) => {
        getRoles(response.data);
      })
      .catch(() => {});
  };

  const getRoles = (data) => {
    axiosInstance({
      method: "get",
      url: roleEndPoints.getRoles,
      withCredentials: false,
    })
      .then((response) => {
        let users = response.data;
        var selectedList = [];
        var availableList = [];
        users.map((e, index) => {
          if (data.indexOf(e) > -1) {
            selectedList.push({ name: e, id: index, selected: false });
          } else {
            availableList.push({ name: e, id: index, selected: false });
          }
          return { name: e, id: index, selected: false };
        });

        setRolesList(availableList);
        setSelectedRoles(selectedList);
      })
      .catch(() => {});
  };

  const handleItemClickOne = (event, data) => {
    var newData = rolesList;
    newData.map((e) => {
      if (e.id == event.dataItem.id) {
        if (e.selected) {
          e.selected = false;
        } else {
          e.selected = true;
        }
      }

      return e;
    });

    var selectedData = selectedRoles;
    selectedData.map((e) => {
      e.selected = false;
      return e;
    });
    setRolesList(() => [...newData]);
    setSelectedRoles(() => [...selectedData]);
  };
  const handleItemClickTwo = (event, data) => {
    var selectedData = selectedRoles;
    selectedData.map((e) => {
      if (e.id == event.dataItem.id) {
        if (e.selected) {
          e.selected = false;
        } else {
          e.selected = true;
        }
      }
      return e;
    });

    var newData = rolesList;
    newData.map((e) => {
      e.selected = false;
      return e;
    });
    setRolesList(() => [...newData]);
    setSelectedRoles(() => [...selectedData]);
  };
  const handleAdd = () => {
    var formateArray = [];
    rolesList.map((e) => {
      if (e.selected) {
        formateArray.push(e.name);
      }
      return e;
    });
    axiosInstance({
      method: "POST",
      data: formateArray,
      url: roleEndPoints.addRole + "?UserName=" + selectedEmployeeName,
      withCredentials: false,
    })
      .then(() => {
        getRolesByUser();
      })
      .catch(() => {});
  };
  const handleAddAll = () => {
    var formateArray = [];
    rolesList.map((e) => {
      formateArray.push(e.name);
      return e;
    });
    axiosInstance({
      method: "POST",
      data: formateArray,
      url: roleEndPoints.addRole + "?UserName=" + selectedEmployeeName,
      withCredentials: false,
    })
      .then(() => {
        getRolesByUser();
      })
      .catch(() => {});
  };
  const handleRemove = () => {
    var formateArray = [];
    selectedRoles.map((e) => {
      if (e.selected) {
        formateArray.push(e.name);
      }
      return e;
    });
    axiosInstance({
      method: "POST",
      data: formateArray,
      url: roleEndPoints.removeRoles + "?UserName=" + selectedEmployeeName,
      withCredentials: false,
    })
      .then(() => {
        getRolesByUser();
      })
      .catch(() => {});
  };
  const handleRemoveAll = () => {
    var formateArray = [];
    selectedRoles.map((e) => {
      formateArray.push(e.name);
      return e;
    });
    axiosInstance({
      method: "POST",
      data: formateArray,
      url: roleEndPoints.removeRoles + "?UserName=" + selectedEmployeeName,
      withCredentials: false,
    })
      .then(() => {
        getRolesByUser();
      })
      .catch(() => {});
  };

  const checkPrivialgeGroup = (resourceName, privilageId) => {
    return true
  };

  return (
    <>
      <Dialog
        width={650}
        height={600}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-right-left "></i>{" "}
            <span className="ms-2">Manage Roles</span>
          </div>
        }
        onClose={closeMenuHandler}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col">
              <h6>Available Roles</h6>
              <ListBox
                style={{
                  height: 400,
                  width: "100%",
                }}
                data={rolesList}
                textField="name"
                selectedField={SELECTED_FIELD}
                onItemClick={(e) => handleItemClickOne(e, "availableRoles")}
              />
            </div>
            <div className="col">
              <div className="d-flex flex-column item-align-center mt-5">
                {checkPrivialgeGroup("AddRoleHREmployeeB", 2) && (
                  <Button
                    themeColor={"primary"}
                    className="k-button k-button-lg k-rounded-lg"
                    onClick={handleAdd}
                  >
                    Add
                  </Button>
                )}

                <br />
                {checkPrivialgeGroup("AddRoleHREmployeeB", 2) && (
                  <Button
                    themeColor={"primary"}
                    className="k-button k-button-lg k-rounded-lg"
                    onClick={handleAddAll}
                  >
                    Add All
                  </Button>
                )}

                <br />
                {checkPrivialgeGroup("RemoveRoleHREmployeeB", 4) && (
                  <Button
                    themeColor={"primary"}
                    className="k-button k-button-lg k-rounded-lg"
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                )}
                <br />
                {checkPrivialgeGroup("RemoveRoleHREmployeeB", 4) && (
                  <Button
                    themeColor={"primary"}
                    className="k-button k-button-lg k-rounded-lg"
                    onClick={handleRemoveAll}
                  >
                    Remove All
                  </Button>
                )}
                <br />
              </div>
            </div>
            <div className="col">
              <h6>Current Roles</h6>
              <ListBox
                style={{
                  height: 400,
                  width: "100%",
                }}
                data={selectedRoles}
                textField="name"
                selectedField={SELECTED_FIELD}
                onItemClick={(e) => handleItemClickTwo(e, "currentRoles")}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
