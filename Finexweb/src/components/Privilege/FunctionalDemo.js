import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";

import Loading from "../Loading";
import FunctionGroupDataGrid from "./grid/FunctionGroupDataGrid";
import FunctionDataGrid from "./grid/FunctionDataGrid";
import PrivilegeDataGrid from "./grid/PrivilegeDataGrid";
import ResourceDataGrid from "./grid/ResourceDataGrid";
import { AuthenticationEndPoints, PrivilegeEndPoints } from "../../EndPoints";

const FunctionalDemo = () => {
  const [functionGroupsData, setFunctionGroupsData] = useState([]);
  const [functionData, setFunctionData] = useState([]);
  const [privilegeData, setPrivilegeData] = useState([]);
  const [resourceData, setResourceData] = useState([]);

  const [selectedFunctionData, setSelectedFunctionData] = useState({});
  const [selectedFunData, setSelectedFunData] = useState({});
  const [isNewData, setIsNewData] = React.useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);

  const handlePrivilegeByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=FunctionResourceGroup`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => {});
  };

  const checkPrivilegeGroup = (resourcesKey, privilegeId) => {
     //return true;
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilegeId
    );
  };

  useEffect(() => {
    handlePrivilegeByGroup();
  }, []);

  const getFunctionGroupsDataAPI = async () => {
    return await axiosInstance({
      method: "GET",
      url: PrivilegeEndPoints.FunctionGroups,
    });
  };

  const getFunctionDataAPI = async () => {
    return await axiosInstance({
      method: "GET",
      url: PrivilegeEndPoints.Functions,
    });
  };

  const getPrivilegeDataAPI = async () => {
    return await axiosInstance({
      method: "GET",
      url: PrivilegeEndPoints.Privileges,
    });
  };

  const getResourceDataAPI = async () => {
    return await axiosInstance({
      method: "GET",
      url: PrivilegeEndPoints.Resources,
    });
  };

  const FunctionWithAllowedPrivileges = async (id) => {
    return await axiosInstance({
      method: "GET",
      url: PrivilegeEndPoints.FunctionWithAllowedPrivileges + "/" + id,
    });
  };

  const FunctionsResources = async (id) => {
    return await axiosInstance({
      method: "GET",
      url: PrivilegeEndPoints.FunctionsResources + "/" + id,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const responses = await Promise.allSettled([
        getFunctionGroupsDataAPI(),
        getFunctionDataAPI(),
        getPrivilegeDataAPI(),
        getResourceDataAPI(),
      ]);

      const tmpFunctionGroupsData = responses[0].value.data;

      setFunctionGroupsData(
        tmpFunctionGroupsData
          .filter((item) => item.parenT_FUNCTION_GROUPS_ID == 0)
          .map((item) => {
            return {
              ...item,
              expandData: tmpFunctionGroupsData.filter(
                (item2) =>
                  item.functionS_GROUPS_ID == item2.parenT_FUNCTION_GROUPS_ID
              ),
            };
          })
      );
      setFunctionData(responses[1].value.data);
      setPrivilegeData(responses[2].value.data);
      setResourceData(responses[3].value.data);

      setIsLoading(false);
    };
    if (
      privilegeResourceGroup &&
      privilegeResourceGroup.length &&
      checkPrivilegeGroup("FunctionResource", 1)
    ) {
      fetchData();
    }
  }, [privilegeResourceGroup]);

  const functionDataRowClick = (event) => {
    const id = event.dataItem.functionS_ID;
    if (id) {
      fetchData(id);
    }
  };

  const fetchData = async (id) => {
    const responses = await Promise.allSettled([
      FunctionWithAllowedPrivileges(id),
      FunctionsResources(id),
    ]);
    setIsNewData(true);
    setPrivilegeData(responses[0].value.data.allowedPrivileges);
    setResourceData(responses[1].value.data);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      {checkPrivilegeGroup("FunctionResource", 1) && ( 
        <>
          <FunctionGroupDataGrid
            selectedFunctionData={selectedFunctionData}
            setSelectedFunctionData={setSelectedFunctionData}
            functionGroupsData={functionGroupsData}
            setFunctionGroupsData={setFunctionGroupsData}
          />
          <FunctionDataGrid
            functionData={functionData}
            selectedFunctionData={selectedFunctionData}
            functionDataRowClick={functionDataRowClick}
            setSelectedFunData={setSelectedFunData}
            selectedFunData={selectedFunData}
            isNewData={isNewData}
          />

          <PrivilegeDataGrid
            privilegeData={privilegeData}
            isNewData={isNewData}
          />

          <ResourceDataGrid resourceData={resourceData} isNewData={isNewData} />
        </>
       )} 
    </div>
  );
};

export default FunctionalDemo;
