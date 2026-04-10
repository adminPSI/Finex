import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useEffect, useState } from "react";

import {
  TimeCardProvider,
  useTimecardContext,
} from "../../contexts/timecardContext";
import usePrivilege from "../../helper/usePrivilege";
import CustomBreadScrum from "../Shared/CustomBreadScrum";
import CustomButton from "../Shared/CustomButton";
import AddLeaveType from "./AddLeaveType";
import HolidaySchedule from "./HolidaySchedule";
import VSPSetup from "./VSPSetup";

export default function HRSetup() {
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

  const btnTitle = ["", "Add Leave Type"];

  const breadScrumData = [
    {
      title: "HR",
      link: "",
    },
    {
      title: "Setup",
      link: "",
    },
    {
      title: "Setup",
      link: "",
    },
  ];

  const { checkPrivialgeGroup, loading, error } = usePrivilege('HRSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <TimeCardProvider>
      <>
        {checkPrivialgeGroup("HRSetup", 1) && (
          <div>
            <CustomBreadScrum data={breadScrumData} />
            <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
              <div className="d-flex k-flex-column">
                <h1>HR Setup</h1>
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

            <TabStrip
              className="app-tab"
              selected={selected}
              onSelect={handleSelect}
            >
              {checkPrivialgeGroup("Hschedule", 1) && (
                <TabStripTab title="Holiday Schedule">
                  <HolidaySchedule />
                </TabStripTab>
              )}
              {checkPrivialgeGroup("VSPSetupTab", 1) && (
                <TabStripTab title="VSP Setup">
                  <VSPSetup />
                </TabStripTab>
              )}
            </TabStrip>

            {visible && (
              <div>

                {selected == 1 && (
                  <AddLeaveType toggleDialog={toggleDialog} />
                )}

              </div>
            )}
          </div>
        )}
      </>
    </TimeCardProvider>
  );
}
