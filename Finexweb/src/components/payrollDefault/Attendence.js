import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";

import axiosInstance from "../../core/HttpInterceptor";
import { ExpenseEndPoints } from "../../EndPoints";

import AttendanceProjectGrid from "./Attendance/AttendanceProjectGrid";
import BenefitAdjustment from "./Attendance/BenefitAdjustment";
import ProjectGrid from "./ProjectGrid";
import usePrivilege from "../../helper/usePrivilege";
const Attendance = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  
  const handleTabSelect = (event) => {
    setSelectedTab(event.selected);
  };
  useEffect(() => {
    axiosInstance({
      method: "GET",
      url: ExpenseEndPoints.GetExpenseCodeList,
      withCredentials: false,
    }).then((response) => {
      let data = response.data;

      let itemsData = [];
      data.forEach((data) => {
        let items = {
          desc: data.countyExpenseDescription,
          text: data.countyExpenseCode,
          id: data.id,
        };
        itemsData.push(items);
      });
    });
  }, []);
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollRun')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("PRAM", 1) &&
        <React.Fragment>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Payroll
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Payroll Details
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Attendance
              </li>
            </ol>
          </nav>

          <div className="d-flex">
            <div>
              <TabStrip
                selected={selectedTab}
                onSelect={handleTabSelect}
                tabPosition={"left"}
              >
                {checkPrivialgeGroup("PRAATab", 1) && <TabStripTab title={"Attendance"}>
                  <div>
                    <AttendanceProjectGrid />
                  </div>
                </TabStripTab>}
                {checkPrivialgeGroup("PRAPTab", 1) && <TabStripTab title={"Payroll"}>
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    <ProjectGrid />
                  </div>
                </TabStripTab>}

                {checkPrivialgeGroup("PRABATab", 1) && <TabStripTab title={"Benefit Adjustments"}>
                  <div
                    style={{
                      height: "70vh",
                      overflowY: "auto",
                    }}
                  >
                    <BenefitAdjustment />
                  </div>
                </TabStripTab>}
              </TabStrip>
            </div>

            <div></div>
          </div>
        </React.Fragment>
      }
    </>
  );
};

export default Attendance;
