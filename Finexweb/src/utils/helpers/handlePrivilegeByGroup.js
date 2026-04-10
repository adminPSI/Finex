import { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { AuthenticationEndPoints } from "../../EndPoints";

export const handlePrivilegeByGroup = async ({
  query,
  setPrivilegeResourceGroup,
}) => {
  return axiosInstance({
    method: "get",
    url:
      AuthenticationEndPoints.getPrivilegesByResourceGroupName +
      `?functionGroupName=${query}`,
    withCredentials: false,
  })
    .then((response) => {
      setPrivilegeResourceGroup(response.data);
    })
    .catch(() => {});
};

export const useHandlePrivilegeByGroup = (query) => {
  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);

  useEffect(() => {
    handlePrivilegeByGroup();
  }, []);

  const handlePrivilegeByGroup = async () => {
    return axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=${query}`,
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

  return {
    checkPrivialgeGroup,
  };
};
