import React, { useEffect, useState } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import {
  AuthenticationEndPoints,
  PrivilegeEndPoints,
  roleEndPoints,
} from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import ParentExpandGrid from "./grid/ParentExpandGrid";

export default function Privilege() {
  const [privilegeData, setPrivilegeData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [privilegeListData, setPrivilegeListData] = useState([]);
  const [privilegeResourceGroup, setPrivilegeResourceGroup] = React.useState(
    []
  );

  const handlePrivilageByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=Privilege`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => {});
  };

  const checkPrivialgeGroup = (resourcesKey, privilageId) => {
    return true;
  };

  const getRoles = () => {
    axiosInstance({
      method: "get",
      url: roleEndPoints.getRoles,
      withCredentials: false,
    })
      .then((response) => {
        let role = response.data;
        setRoleData(role);
        getPrivileges();
      })
      .catch(() => {});
  };

  const getPrivileges = () => {
    axiosInstance({
      method: "get",
      url: PrivilegeEndPoints.Privileges,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPrivilegeListData(data);
        GetFunctionGroupsTreeData();
      })
      .catch(() => {});
  };

  const GetFunctionGroupsTreeData = async () => {
    return axiosInstance({
      method: "GET",
      url: PrivilegeEndPoints.GetFunctionGroupsTree,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeData(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    getRoles();
    handlePrivilageByGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expandChange = (event) => {
    let newData = privilegeData.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setPrivilegeData(newData);

    event.dataItem.expanded = event.value;
    setPrivilegeData([...privilegeData]);
  };

  return (
    <>
      {checkPrivialgeGroup("PrivilegeM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Accounting
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                CAC Codes
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Permission
              </li>
            </ol>
          </nav>
          <div className="mt-3">
            {checkPrivialgeGroup("PrivilegeG", 1) && (
              <>
                <Grid
                  resizable={true}
                  data={privilegeData}
                  detail={(props) => (
                    <ParentExpandGrid
                      props={props}
                      setPrivilegeData={setPrivilegeData}
                      privilegeData={privilegeData}
                      roleData={roleData}
                      privilegeListData={privilegeListData}
                    />
                  )}
                  expandField="expanded"
                  onExpandChange={expandChange}
                >
                  <Column field="functionGroupName" title="Parent" />
                </Grid>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
