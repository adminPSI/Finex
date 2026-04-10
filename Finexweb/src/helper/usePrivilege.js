import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../core/HttpInterceptor";
import { AuthenticationEndPoints } from "../EndPoints";

const usePrivilege = (functionGroupName) => {
    const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchPrivilegs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null)
            const response = await axiosInstance({
                method: "get",
                url:
                    AuthenticationEndPoints.getPrivilegesByResourceGroupName +
                    `?functionGroupName=${functionGroupName}`,
                withCredentials: false,
            })
            setPrivilegeResourceGroup(response.data);

        } catch (error) {
            setError(error.message || "Field to fetch privileges")
            console.log("Error fetching privileges:", error)
        } finally {
            setLoading(false)
        }
    }, [functionGroupName]);

    const checkPrivialgeGroup = useCallback((resourceName, privilegeId) => {
        return privilegeResourceGroup.some(
            item => item.resources_key == resourceName && item.privileges_id == privilegeId
        )
    }, [privilegeResourceGroup])

    const checkAnyPrivilege = useCallback((resourceName, privilegeIds = []) => {
        return privilegeResourceGroup.some(
            item => item.resources_key == resourceName && privilegeIds.includes(item.privileges_id)
        )
    }, [privilegeResourceGroup])

    useEffect(() => {
        fetchPrivilegs();
    }, [fetchPrivilegs]);

    return {
        privileges: privilegeResourceGroup,
        loading,
        error,
        checkPrivialgeGroup,
        checkAnyPrivilege,
        refetch: fetchPrivilegs
    }

}

export default usePrivilege;