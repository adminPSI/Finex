import { Button } from "@progress/kendo-react-buttons";
import {
  DayView,
  MonthView,
  Scheduler,
  WeekView,
  WorkWeekView,
} from "@progress/kendo-react-scheduler";
import { useCallback, useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import {
  EmplTimecardEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import { displayDate, sampleData } from "../../json/schedule";
import AddNewTime from "./AddNewTime";


export default function EditEmployeeSchedule() {
  const navigate = useNavigate();
  const [view, setView] = useState("month");
  const [date, setDate] = useState(displayDate);
  const [scheduleData, setScheduleData] = useState([]);
  const { state } = useLocation();
  const [actionType, setActionType] = useState("Add");
  const handleViewChange = useCallback(
    (event) => {
      setView(event.value);
    },
    [setView]
  );
  const handleDateChange = useCallback(
    (event) => {
      setDate(event.value);
      getEmployeeSchedule(dateFormatChange(event.value));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setDate]
  );

  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    if (state) {
      getCurrentSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const getCurrentSchedule = () => {
    const currentDate = new Date();
    getEmployeeSchedule(dateFormatChange(currentDate));
  };
  const dateFormatChange = (date) => {
    // eslint-disable-next-line no-useless-concat
    let firstDy = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + "1";
    let nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    let lastDay = new Date(nextMonth - 1);
    let lastDy =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      lastDay.getDate();
    return { firstDy, lastDy };
  };

  const getEmployeeSchedule = (date) => {
    axiosInstance({
      method: "GET",
      url:
        EmplTimecardEndPoints.EmployeeSchedule +
        state.employeeId +
        `/${date.firstDy}/${date.lastDy}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setScheduleData(data);
      })
      .catch(() => { });
  };
  ;

  const openTimeDialog = (type) => {
    setActionType(type);
    toggleDialog();
  };

  const [empData, setEmpData] = useState()

  const employeeName = () => {
    axiosInstance({
      method: "get",
      url:
        EmplTimecardEndPoints.Employee,
      withCredentials: false,
    })
      .then((response) => {
        const getEmpDataById = response.data.filter(el => el.id == state?.employeeId)[0]
        setEmpData(getEmpDataById);
      })
      .catch(() => { });
  }

  useEffect(() => {
    employeeName()
  }, [])
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Employee Schedule Setup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Timecard
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Timecard
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Timecard Setup
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Edit Employee Schedule</h1>
        </div>
        <div>
          {checkPrivialgeGroup("ETASB", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg me-2"
              themeColor={"primary"}
              onClick={() => navigate("/timecard")}
            >
              Timecard Setup
            </Button>
          )}
        </div>
      </div>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h6>{empData?.firstName + " " + empData?.lastName}</h6>
        </div>
        <div>
          {checkPrivialgeGroup("ETASB", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg me-2"
              themeColor={"primary"}
              onClick={() => openTimeDialog("Add")}
            >
              Add Schedule
            </Button>
          )}
          {checkPrivialgeGroup("ETESB", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg me-2"
              themeColor={"primary"}
              onClick={() => openTimeDialog("Edit")}
            >
              Edit Schedule
            </Button>

          )}
          {checkPrivialgeGroup("ETESB", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg me-2"
              themeColor={"primary"}
              onClick={() => openTimeDialog("Delete")}
            >
              Delete Schedule
            </Button>

          )}
        </div>
      </div>

      <Scheduler
        data={sampleData(scheduleData)}
        view={view}
        onViewChange={handleViewChange}
        date={date}
        onDateChange={handleDateChange}
        showFullDay={true}
        editable={{
          remove: true,
          drag: true,
        }}
      >
        <DayView />
        <WeekView />
        <WorkWeekView />
        <MonthView />
      </Scheduler>

      {visible && (
        <AddNewTime
          toggleDialog={toggleDialog}
          getCurrentSchedule={getCurrentSchedule}
          employeeId={state.employeeId}
          type={actionType}
        />
      )}
    </div>
  );
}
