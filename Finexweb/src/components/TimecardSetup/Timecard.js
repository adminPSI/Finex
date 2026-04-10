import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useEffect, useState } from "react";

import { Button } from "@progress/kendo-react-buttons";
import {
  TimeCardProvider,
  useTimecardContext,
} from "../../contexts/timecardContext";
import axiosInstance from "../../core/HttpInterceptor";
import { TimecardEndPoints } from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import CustomBreadScrum from "../Shared/CustomBreadScrum";
import CustomButton from "../Shared/CustomButton";
import AddBackupSupervisor from "./AddBackupSupervisor";
import AddLeaveType from "./AddLeaveType";
import AddNewEmployee from "./AddNewEmployee";
import EmployeeSetup from "./EmployeeSetup";
import SupervisorSetup from "./SupervisorSetup";

export default function Timecard() {
  const [selected, setSelected] = useState(0);
  const handleSelect = (e) => {
    setSelected(e.selected);
  };

  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const isFormOpen = useTimecardContext();

  useEffect(() => {
    if (isFormOpen) {
      toggleDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormOpen]);

  const btnTitle = [
    "Add Employee to Timecard",
    "Create New Supervisor Backup",
    "",
    "Add Leave Type",
  ];

  const breadScrumData = [
    {
      title: "Timecard",
      link: "",
    },
    {
      title: "Timecard",
      link: "",
    },
    {
      title: "Timecard Setup",
      link: "",
    },
  ];

  const handleRunTimecard = async () => {
    await axiosInstance({
      method: "get",
      url: TimecardEndPoints.RunTimeCard,
      withCredentials: false,
    })
    showSuccessNotification("Process executed");
  };

  const handleRunInactive = () => {
    axiosInstance({
      method: "get",
      url: TimecardEndPoints.RunTimecardInactive,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Process executed");
      })
      .catch(() => { });
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Add Employee to Timecard Module')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <TimeCardProvider>
      <>
        {checkPrivialgeGroup("TCSM", 1) && (
          <div>
            <CustomBreadScrum data={breadScrumData} />
            <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
              <div className="d-flex k-flex-column">
                <h1>Timecard Setup</h1>
              </div>
              <div className="d-flex k-flex-row gap-2">
                <div>
                  <Button onClick={handleRunTimecard}>Run Timecard</Button>
                </div>
                <div>
                  <Button onClick={handleRunInactive}>Run Inactive</Button>
                </div>
                {btnTitle[selected] !== "" && (
                  <div>
                    {(checkPrivialgeGroup("AddETT", 2) ||
                      checkPrivialgeGroup("AddSBackup", 2) ||
                      checkPrivialgeGroup("AddLeaveType", 2)) && (
                        <CustomButton
                          className="k-button k-button-lg k-rounded-lg"
                          onClick={toggleDialog}
                          text={btnTitle[selected]}
                          themeColor="primary"
                          fillMode={"solid"}
                        />
                      )}
                  </div>
                )}
              </div>
            </div>

            <TabStrip
              className="app-tab"
              selected={selected}
              onSelect={handleSelect}
            >
              {checkPrivialgeGroup("ESetupTab", 1) && (
                <TabStripTab title="Employee Setup">
                  <EmployeeSetup toggleDialog={toggleDialog} />
                </TabStripTab>
              )}
              {checkPrivialgeGroup("SSetupTab", 1) && (
                <TabStripTab title="Substitute supervisor">
                  <SupervisorSetup toggleDialog={toggleDialog} />
                </TabStripTab>
              )}
            </TabStrip>

            {visible && (
              <div>
                {selected == 0 && (
                  <AddNewEmployee toggleDialog={toggleDialog} />
                )}
                {selected == 1 && (
                  <AddBackupSupervisor toggleDialog={toggleDialog} />
                )}
                {selected == 3 && <AddLeaveType toggleDialog={toggleDialog} />}
              </div>
            )}
          </div>
        )}
      </>
    </TimeCardProvider>
  );
}
