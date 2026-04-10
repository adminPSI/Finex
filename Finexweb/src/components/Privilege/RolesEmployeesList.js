import { getter } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
  GridColumn as Column,
  getSelectedState,
  Grid,
} from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { trashIcon } from "@progress/kendo-svg-icons";
import React, { useState } from "react";
import { AuthenticationEndPoints, roleEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import { AddRole } from "./addRole";
import { CreateRole } from "./createRole";
export default function RolesEmployeesList() {
  const [addRolePopupVisible, setAddRolePopupVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [rolePopupVisible, setRolePopupVisible] = useState(false);

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);

  const handlePrivilageByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=Roles List`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => {});
  };

  const checkPrivialgeGroup = (resourcesKey, privilageId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilageId
    );
  };

  React.useEffect(() => {
    getRolesList();
    handlePrivilageByGroup();
  }, []);

  const [selectedRemoveEmp, setSelectedRemoveEmp] = useState([]);
  const [rolesList, setRolesList] = React.useState([]);
  const [selectedRole, setSelectedRole] = React.useState("");
  const [employeesList, setEmployeesList] = React.useState([]);
  const isAllSelected =
    employeesList.length > 0 &&
    employeesList.every((item) => selectedRemoveEmp.includes(item.name));
  const DATA_ITEM_KEY = "name";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const getRolesList = () => {
    axiosInstance({
      method: "get",
      url: roleEndPoints.getRoles,
      withCredentials: false,
    })
      .then((response) => {
        if (response.data.length) {
          let rolesList = response.data.map((role) => ({ name: role }));
          setRolesList(rolesList);
        }
      })
      .catch(() => {});
  };
  const getEmployeesListByRole = ({ dataItem }) => {
    setSelectedRole(dataItem.name);
    axiosInstance({
      method: "get",
      url: roleEndPoints.getUsersByRole.replace("#ROLE#", dataItem.name),
      withCredentials: false,
    })
      .then((response) => {
        var usersList = response.data;
        if (usersList && usersList.message) {
          setEmployeesList([]);
        } else {
          usersList = usersList.map((item) => {
            return { name: item, role: dataItem.name };
          });
          setEmployeesList(usersList);
        }
      })
      .catch(() => {});
  };
  const [selectedState, setSelectedState] = React.useState({});
  const onSelectionChange = React.useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });
      if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
        setSelectedState(newSelectedState);
      } else {
        setSelectedState({});
      }
    },
    [selectedState]
  );

  const handleDelete = (name) => {
    setSelectedRemoveEmp([name]);
    setDeleteVisible(true);
  };

  const toggleCheckBox = (name, checked) => {
    if (checked) {
      setSelectedRemoveEmp([...selectedRemoveEmp, name]);
    } else {
      setSelectedRemoveEmp(selectedRemoveEmp.filter((x) => x !== name));
    }
  };

  const toggleSelectAll = (checked) => {
    setSelectedRemoveEmp(
      checked ? employeesList.map((item) => item?.name) : []
    );
  };

  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };

  const CheckboxHeaderCell = () => {
    return (
      <td>
        <Checkbox
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => toggleSelectAll(e.target?.value)}
        />
      </td>
    );
  };

  const DeleteOnClick = () => {
    axiosInstance({
      method: "delete",
      data: selectedRemoveEmp,
      url: roleEndPoints.removeUsersFromRole.replace("#ROLE#", selectedRole),
      withCredentials: false,
    })
      .then((response) => {
        closeDeleteDialog(null);
        showSuccessNotification("Role added successfully");
        setSelectedRemoveEmp([]);
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

  const CheckboxCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <Checkbox
          type="checkbox"
          checked={selectedRemoveEmp.includes(dataItem?.name)}
          onChange={(e) => toggleCheckBox(dataItem?.name, e.target?.value)}
        />
      </td>
    );
  };

  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <Button
          style={{
            margin: "5px",
          }}
          themeColor={"error"}
          onClick={(e) => handleDelete(dataItem?.name)}
          svgIcon={trashIcon}
        ></Button>
      </td>
    );
  };
  return (
    <>
      {checkPrivialgeGroup("RolesListM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Privilege
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Role
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Roles List
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-6 d-flex align-items-center">
              <h3>Roles List</h3>
            </div>
            <div className="col-sm-6 text-end">
           
                  <Button
                    style={{
                      margin: "5px",
                    }}
                    themeColor={"primary"}
                    onClick={() => setRolePopupVisible(true)}
                  >
                    <i className="fa-solid fa-plus"></i> &nbsp; Create Role
                  </Button>
                
            </div>
          </div>
          <br />
          {checkPrivialgeGroup("RolesListG", 1) && (
            <>
              <Grid
                resizable={true}
                data={rolesList.map((item) => ({
                  ...item,
                  [SELECTED_FIELD]: selectedState[idGetter(item)],
                }))}
                onRowClick={getEmployeesListByRole}
                onSelectionChange={onSelectionChange}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  drag: false,
                  cell: false,
                  mode: "multiple",
                }}
              >
                <Column field="name" title="Roles" />
              </Grid>
            </>
          )}
          <br />

          <div className="row">
            <div className="col-sm-6 d-flex align-items-center">
              <h3>Employees List</h3>
            </div>
            <div className="col-sm-6 text-end d-flex gap-2 justify-content-end align-items-center">
              <div>
                {checkPrivialgeGroup("RolesListB", 2) && (
                  <>
                    <Button
                      disabled={selectedRemoveEmp.length == 0}
                      onClick={() => setDeleteVisible(true)}
                    >
                      Remove Employees from Role
                    </Button>
                  </>
                )}
              </div>

              {checkPrivialgeGroup("RolesListB", 2) && (
                <>
                  <Button
                    style={{
                      margin: "5px",
                    }}
                    themeColor={"primary"}
                    onClick={() => setAddRolePopupVisible(true)}
                    disabled={selectedRole == ""}
                  >
                    <i className="fa-solid fa-plus"></i> &nbsp; Add Employees to
                    Role
                  </Button>
                </>
              )}
              
            </div>
          </div>
          {checkPrivialgeGroup("SecurityEmployeeListG", 1) && (
            <>
              <Grid
                resizable={true}
                data={employeesList}
                onSelectionChange={getEmployeesListByRole}
              >
                <Column
                  title=""
                  width={"60px"}
                  headerCell={CheckboxHeaderCell}
                  cell={CheckboxCell}
                />
                <Column field="name" title="Name" />
                <Column field="role" title="Role" />
                {checkPrivialgeGroup("RolesListB", 2) && (
                  <>
                    <Column title="Action" width={"120px"} cell={ActionCell} />
                  </>
                )}
              </Grid>
            </>
          )}
          {rolePopupVisible && (
            <CreateRole setRolePopupVisible={setRolePopupVisible} getRolesList={getRolesList}/>
           )} 
          {addRolePopupVisible && (
            <AddRole
              setAddRolePopupVisible={setAddRolePopupVisible}
              role={selectedRole}
              setEmployeesList={setEmployeesList}
            />
          )}
        </>
      )}
      {deleteVisible && (
        <Dialog title={<span>Please confirm</span>} onClose={closeDeleteDialog}>
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure you want to Delete?
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={closeDeleteDialog}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={DeleteOnClick}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
}
