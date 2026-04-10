import { useEffect, useState } from "react";

import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import CustomBreadScrum from "../../Shared/CustomBreadScrum";
import LeaveRequest from "./LeaveRequest";
import LeaveApproval from "./LeaveApproval";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  AuthenticationEndPoints,
  ConfigurationEndPoints,
} from "../../../EndPoints";

export default function EmployeeLeaveRequest() {
  const [selected, setSelected] = useState(0);
  const [FMLADisplay, setFMLADisplay] = useState(false);
  const handleSelect = (e) => {
    setSelected(e.selected);
  };

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);

  useEffect(() => {
    handlePrivilegeByGroup();
    getFMLAConfig();
  }, []);

  const handlePrivilegeByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=Leave Management`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch((err) => {});
  };

  const checkPrivilegeGroup = (resourceName, privilegeId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourceName &&
        item.privileges_id == privilegeId
    );
  };

  const getFMLAConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/65",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setFMLADisplay(value);
      })
      .catch(() => {});
  };

  const breadScrumData = [
    {
      title: "Timecard",
      link: "",
    },
    {
      title: "Manage",
      link: "",
    },
    {
      title: "Leave Request",
      link: "",
    },
  ];

  return (
    <>
      {checkPrivilegeGroup("ELRM", 1) && (
        <div>
          <CustomBreadScrum data={breadScrumData} />

          <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
            <div className="d-flex k-flex-column">
              <h1>Leave Request</h1>
            </div>
          </div>

          <TabStrip
            className="app-tab"
            selected={selected}
            onSelect={handleSelect}
          >
            {checkPrivilegeGroup("ELRTab", 1) && (
              <TabStripTab title="Leave Request">
                <LeaveRequest FMLADisplay={FMLADisplay} />
              </TabStripTab>
            )}
            {checkPrivilegeGroup("ELATab", 1) && (
              <TabStripTab title="Leave Approval">
                <LeaveApproval FMLADisplay={FMLADisplay} />
              </TabStripTab>
            )}
          </TabStrip>
        </div>
      )}
    </>
  );
}
