import { useEffect, useState } from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
  Form,
  FormElement,
  FieldWrapper,
  Field,
} from "@progress/kendo-react-form";
import { Button } from "@progress/kendo-react-buttons";
import { EmplTimecardEndPoints, PayrollEmployee } from "../../EndPoints";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { TimePicker } from "@progress/kendo-react-dateinputs";
import axiosInstance from "../../core/HttpInterceptor";
import { FormDropDownList, FormInput, FormTimePicker } from "../form-components";
import {
  scheduleNameForTimeValidator,
  scheduleTypeForTimeValidator,
  timeEntryEndTimeValidator,
  timeEntryJobValidator,
  timeEntryStartTimeValidator,
} from "../validators";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";

const CustomTitleBar = (props) => {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <span className="k-icon k-i-plus-outline" />
      <span className="ms-2">
        {props.type == "Add" ? "Add Schedule" : (props.type == "Delete" ? "Delete Schedule" : "Edit Schedule")}
      </span>
    </div>
  );
};

const WeekDays = [
  {
    text: "Sunday",
    id: 0,
  },
  {
    text: "Monday",
    id: 1,
  },
  {
    text: "Tuesday",
    id: 2,
  },
  {
    text: "Wednesday",
    id: 3,
  },
  {
    text: "Thursday",
    id: 4,
  },
  {
    text: "Friday",
    id: 5,
  },
  {
    text: "Saturday",
    id: 6,
  },
];

export default function AddNewTime(props) {
  const [action, setAction] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [activeSchedule, setActiveSchedule] = useState({});
  const [formInit, setFormInit] = useState({
    timecardEmployeeScheduleName: "",
  });
  const [formKey, setFormKey] = useState(1);
  const [isScheduleType, setIsScheduleType] = useState(true);
  const [timecardEmployeeScheduleId, setTimecardEmployeeScheduleId] =
    useState("");
  const [jobList, setJobList] = useState([]);

  useEffect(() => {
    setActiveSchedule(
      schedules.find(
        (item) => item.timecardEmployeeScheduleId == timecardEmployeeScheduleId
      )
    );
  }, [schedules, timecardEmployeeScheduleId]);

  useEffect(() => {
    getJob();
  }, []);

  useEffect(() => {
    if (props.type == "Add") {
      setAction(1);
    } else if (props.type == "Delete") {
      setAction(2);
      axiosInstance({
        method: "GET",
        url: `${EmplTimecardEndPoints.TCEmployee}/${props.employeeId}`,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setSchedules(data);
          if (data[0]) {
            setTimecardEmployeeScheduleId(data[0].timecardEmployeeScheduleId);
          }
        })
        .catch(() => { });
    } else {
      setAction(0);
      axiosInstance({
        method: "GET",
        url: `${EmplTimecardEndPoints.TCEmployee}/${props.employeeId}`,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setSchedules(data);
          if (data[0]) {
            setTimecardEmployeeScheduleId(data[0].timecardEmployeeScheduleId);
          }
        })
        .catch(() => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.type]);

  const getJob = async (id) => {
    try {
      const { data } = await axiosInstance({
        method: "GET",
        url:
          PayrollEmployee.EmployeeJobs +
          "/" +
          props.employeeId +
          "?active=true",
        withCredentials: false,
      });
      const tmpData = data
        .filter((item) => item.jobDescription)
        .map((job) => {
          job.description = job.jobDescription?.empJobDescription ?? "";
          return job;
        });

      setJobList(tmpData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddSchedule = () => {
    let errorMsg = "";
    if (!formData.jobId) {
      errorMsg = "Job is Required.";
    } else if (selectedTab == 1 && dayWeek.length == 0) {
      errorMsg = "Week day is Required.";
    } else if (!formData.startTime) {
      errorMsg = "StartTime is Required.";
    } else if (!formData.endTime) {
      errorMsg = "EndTime is Required.";
    }
    if (errorMsg) {
      showErrorNotification(errorMsg);
      return;
    }
    let addTimeData = {
      employeeId: props.employeeId,
      dayOfWeek: null,
      dayOfMonth: null,
      jobDescriptionId: formData.jobId,
      startDateTime: formData.startTime,
      endDateTime: formData.endTime,
      timecardEmployeeScheduleId: timecardEmployeeScheduleId,
    };
    if (dayWeek.length) {
      let timeObj = [];

      dayWeek.map((day) => {
        let newSupervisor = Object.assign({}, addTimeData);
        newSupervisor.dayOfWeek = day.id;
        timeObj.push(newSupervisor);
        return day;
      });
      AddScheduleTime(timeObj);
    } else {
      let timeObj = [];
      let workweek = [1, 2, 3, 4, 5];

      workweek.map((day) => {
        let newSupervisor = Object.assign({}, addTimeData);
        newSupervisor.dayOfWeek = day;
        timeObj.push(newSupervisor);
        return day;
      });
      AddScheduleTime(timeObj);
    }
  };

  const AddScheduleTime = (timeData) => {
    axiosInstance({
      method: "POST",
      url: `${EmplTimecardEndPoints.EmployeeScheduleTime}?scheduleType=${selectedTab}`,
      data: timeData,
      withCredentials: false,
    })
      .then((response) => {
        props.getCurrentSchedule();
        props.toggleDialog();
      })
      .catch(() => { });
  };

  const timeTab = (index) => {
    setSelectedTab(index);
    setFormData({});
    setDayWeek([]);
  };

  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [dayWeek, setDayWeek] = useState([]);

  const isCustom = (item) => {
    return item.id == undefined;
  };
  const addKey = (item) => {
    item.id = new Date().getTime();
  };
  const onChange = (event) => {
    const values = event.target.value;
    const lastItem = values[values.length - 1];
    if (lastItem && isCustom(lastItem)) {
      values.pop();
      const sameItem = values.find((v) => v.text == lastItem.text);
      if (sameItem == undefined) {
        addKey(lastItem);
        values.push(lastItem);
      }
    }
    setDayWeek(values);
  };

  const handleTimePicker = (key, e) => {
    let dateTime = new Date(e.value);
    let hours = dateTime.getHours();
    let minutes = dateTime.getMinutes();
    let seconds = 0;

    let formattedTime =
      (hours < 10 ? "0" : "") +
      hours +
      ":" +
      (minutes < 10 ? "0" : "") +
      minutes +
      ":" +
      (seconds < 10 ? "0" : "") +
      seconds;
    let finialDateString = "0001-01-01T" + formattedTime + ".000Z";
    setFormData((prevData) => ({
      ...prevData,
      [key]: finialDateString,
    }));
  };

  const handleScheduleNameSubmit = (value) => {
    if (props.type == "Add") {
      if (action == 1) {
        if (!value.timecardEmployeeScheduleName || !props.employeeId) {
          return;
        }
        let req = {
          timecardEmployeeScheduleName: value.timecardEmployeeScheduleName,
          employeeId: props.employeeId,
        };
        axiosInstance({
          method: "POST",
          url: EmplTimecardEndPoints.EmpScheduleName,
          data: req,
          withCredentials: false,
        })
          .then((response) => {
            let data = response.data;
            setActiveSchedule(data);
            timeTab(0);
            setTimecardEmployeeScheduleId(data.timecardEmployeeScheduleId);
            setAction(action + 2);
            setFormData({});
          })
          .catch(() => { });
      }
    } else if (props.type == "Delete") {
      axiosInstance({
        method: "Delete",
        url: `${EmplTimecardEndPoints.ByScheduleId}empScheduleId=${timecardEmployeeScheduleId}`,
        withCredentials: false,
      })
        .then((response) => {
          props.getCurrentSchedule();
          props.toggleDialog();
        })
        .catch(() => { });
    }
    else {
      if (action == 0) {
        axiosInstance({
          method: "GET",
          url: `${EmplTimecardEndPoints.ByScheduleId}empScheduleId=${timecardEmployeeScheduleId}`,
          withCredentials: false,
        })
          .then((response) => {
            let data = response.data;
            timeTab(data.scheduleType || 0);
            setFormData({
              // startTime: new Date(data?.startDateTime?.replace("T", " ").replace("Z", "")) || null,
              // endTime: new Date(data?.endDateTime?.replace("T", " ").replace("Z", "")) || null,
              Job: jobList.find((x) => x.id == data.jobId),
              jobId: data.jobId,
            });
            setIsScheduleType(data.scheduleType != null ? true : false);
            if (data.scheduleType == 1) {
              setDayWeek(data.dayWeeks || []);
            }
            setAction(action + 3);
          })
          .catch(() => { });
      } else {
        handleEditNext();
      }
    }
  };

  const handleEditNext = () => {
    if (props.type !== "Add") {
      setTimecardEmployeeScheduleId(activeSchedule.timecardEmployeeScheduleId);
      setAction(action + 2);
    }
  };

  const selectJob = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      jobId: value.id,
    }));
  };

  return (
    <>
      <Dialog
        width={400}
        title={<CustomTitleBar type={props.type} />}
        onClose={props.toggleDialog}
      >
        {action == 0 ? (
          <div>
            <Form
              onSubmit={handleScheduleNameSubmit}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <Field
                      id={"timecardEmployeeScheduleId"}
                      name={"timecardEmployeeScheduleId"}
                      dataItemKey="timecardEmployeeScheduleId"
                      textField="timecardEmployeeScheduleName"
                      label={"Select Schedule*"}
                      data={schedules}
                      component={FormDropDownList}
                      validator={scheduleTypeForTimeValidator}
                      onChange={({ value }) => {
                        setFormInit({
                          timecardEmployeeScheduleName:
                            value.timecardEmployeeScheduleName,
                        });
                        setFormKey(formKey + 1);
                        setTimecardEmployeeScheduleId(
                          value.timecardEmployeeScheduleId
                        );
                      }}
                    />

                    <div className="k-form-buttons">
                      <Button
                        className="k-button k-button-lg k-rounded-lg k-w-full"
                        themeColor={"primary"}
                        type={"submit"}
                      >
                        Next
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </div>
        ) : action == 2 ? (
          <div>
            <Form
              onSubmit={handleScheduleNameSubmit}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <Field
                      id={"timecardEmployeeScheduleId"}
                      name={"timecardEmployeeScheduleId"}
                      dataItemKey="timecardEmployeeScheduleId"
                      textField="timecardEmployeeScheduleName"
                      label={"Select Schedule*"}
                      data={schedules}
                      component={FormDropDownList}
                      validator={scheduleTypeForTimeValidator}
                      onChange={({ value }) => {
                        setFormInit({
                          timecardEmployeeScheduleName:
                            value.timecardEmployeeScheduleName,
                        });
                        setFormKey(formKey + 1);
                        setTimecardEmployeeScheduleId(
                          value.timecardEmployeeScheduleId
                        );
                      }}
                    />

                    <div className="k-form-buttons">
                      <Button
                        className="k-button k-button-lg k-rounded-lg k-w-full"
                        themeColor={"primary"}
                        type={"submit"}
                      >
                        Delete Schedule
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </div>
        ) : action == 1 ? (
          <div>
            <Form
              onSubmit={handleScheduleNameSubmit}
              key={formKey}
              initialValues={formInit}
              ignoreModified={true}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <Field
                      id={"timecardEmployeeScheduleName"}
                      name={"timecardEmployeeScheduleName"}
                      label={"Schedule Name*"}
                      component={FormInput}
                      validator={scheduleNameForTimeValidator}
                    />
                    <div className="k-form-buttons">
                      <Button
                        className="k-button k-button-lg k-rounded-lg k-w-full"
                        themeColor={"primary"}
                        type={"submit"}
                      >
                        Next
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </div>
        ) : (
          <>
            {(props.type == "Add" || !isScheduleType) && (
              <div
                className="k-w-full d-flex justify-content-around align-items-center k-tab-container mt-4"
                style={{
                  height: "40px",
                  background: "#e4e1e191",
                  borderRadius: 8,
                  padding: "0 10px",
                }}
              >
                <div
                  className={`k-w-full d-flex justify-content-center align-items-center k-tab-item ${selectedTab == 0 ? "TimeScheduleTab" : ""}`}
                  onClick={() => timeTab(0)}
                >
                  Daily
                </div>
                <div
                  className={`k-w-full d-flex justify-content-center align-items-center k-tab-item ${selectedTab == 1 ? "TimeScheduleTab" : ""}`}
                  style={{ margin: "0 10px" }}
                  onClick={() => timeTab(1)}
                >
                  Weekly
                </div>
              </div>
            )}

            {selectedTab == 0 && (
              <div>
                <Form
                  initialValues={formData}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <FieldWrapper>
                          <Field
                            id={"job"}
                            name={"Job"}
                            label={"Job*"}
                            wrapperstyle={{
                              width: "100%",
                              marginRight: "10px",
                            }}
                            data={jobList}
                            textField="description"
                            dataItemKey="id"
                            component={FormDropDownList}
                            validator={timeEntryJobValidator}
                            onChange={(e) => selectJob(e.value)}
                          />
                          <div
                            className={"mt-4 mb-4 d-flex align-items-center"}
                          >
                            <div className="me-4">Every working day at</div>
                          </div>

                          <div className="mb-3 d-flex justify-content-center align-items-center">
                            <Field
                              name={"startTime"}
                              label={"Start Time*"}
                              component={FormTimePicker}
                              disabled={formInit.id}
                              validator={timeEntryStartTimeValidator}
                              onChange={(event) =>
                                handleTimePicker("startTime", event)
                              }
                            />
                          </div>

                          <div className="d-flex justify-content-center align-items-center">
                            <Field
                              name={"endTime"}
                              label={"End Time*"}
                              component={FormTimePicker}
                              validator={timeEntryEndTimeValidator}
                              startTime={formRenderProps.valueGetter("startTime")}
                              onChange={(event) =>
                                handleTimePicker("endTime", event)
                              }
                            />
                          </div>
                        </FieldWrapper>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </div>
            )}
            {selectedTab == 1 && (
              <div>
                <Form
                  initialValues={formData}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <FieldWrapper>
                          <Field
                            id={"job"}
                            name={"Job"}
                            label={"Job*"}
                            wrapperstyle={{
                              width: "100%",
                              marginRight: "10px",
                            }}
                            data={jobList}
                            textField="description"
                            dataItemKey="id"
                            component={FormDropDownList}
                            validator={timeEntryJobValidator}
                            onChange={(e) => selectJob(e.value)}
                          />
                          <div className="d-flex align-items-end mb-4">
                            <div className="mt-4 k-w-full">
                              <div className="mb-1">Select Day of Week*</div>
                              <div style={{ width: "350px" }}>
                                <MultiSelect
                                  data={WeekDays}
                                  onChange={onChange}
                                  value={dayWeek}
                                  placeholder="Select day of week"
                                  textField="text"
                                  dataItemKey="id"
                                  allowCustom={true}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mb-3 d-flex justify-content-center align-items-center">
                            <div className="me-2">Start time*:</div>
                            <TimePicker
                              width={200}
                              format="hh:mm a"
                              value={
                                formData.startTime
                                  ? new Date(
                                    formData.startTime
                                      .replace("T", " ")
                                      .replace("Z", "")
                                  )
                                  : null
                              }
                              onChange={(event) =>
                                handleTimePicker("startTime", event)
                              }
                            />
                          </div>

                          <div className="d-flex justify-content-center align-items-center">
                            <div className="me-2">End time*:</div>
                            <TimePicker
                              width={200}
                              format="hh:mm a"
                              value={
                                formData.endTime
                                  ? new Date(
                                    formData.endTime
                                      .replace("T", " ")
                                      .replace("Z", "")
                                  )
                                  : null
                              }
                              onChange={(event) =>
                                handleTimePicker("endTime", event)
                              }
                            />
                          </div>
                        </FieldWrapper>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </div>
            )}

            <DialogActionsBar>
              {(props.type == "Add") && (
                <Button
                  className="k-button k-button-lg k-rounded-lg"
                  themeColor={"primary"}
                  onClick={handleAddSchedule}
                >
                  Add to Schedule
                </Button>
              )}
              {(props.type == "Edit") && (
                <Button
                  className="k-button k-button-lg k-rounded-lg"
                  themeColor={"primary"}
                  onClick={handleAddSchedule}
                >
                  Update to Schedule
                </Button>
              )}
            </DialogActionsBar>
          </>
        )}
      </Dialog>
    </>
  );
}
