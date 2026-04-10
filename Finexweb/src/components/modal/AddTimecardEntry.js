import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useEffect, useState } from "react";

import { Button } from "@progress/kendo-react-buttons";
import axiosInstance from "../../core/HttpInterceptor";
import {
  CommonEndPoints,
  ConfigurationEndPoints,
  EmplTimecardEndPoints,
  LeaveTypeEndPoints,
  PayrollEmployee,
  TimeCardLeaveBalance,
  TimecardEndPoints
} from "../../EndPoints";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormTimePicker,
} from "../form-components";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";
import {
  mamoValidator,
  timeEntryDateValidator,
  timeEntryEndTimeValidator,
  timeEntryJobValidator,
  timeEntryStartTimeValidator
} from "../validators";

export default function AddTimecardEntry(props) {
  const [leaveNameList, setLeaveNameList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [hourTypeList, setHourTypeList] = useState([]);
  const [formInit, setFormInit] = useState({});

  const [formKey, setFormKey] = useState(0);
  const [isSupervisor, setIsSupervisor] = useState(false);
  let defaultFMLAItem = { id: null, value: "Select FMLA Type" };
  const [FMLAList, setFMLAList] = useState([]);
  const [TimecardLeaveBalance, setTimecardLeaveBalance] = useState({});
  const [configEmpAllowTimecardEntry, setconfigEmpAllowTimecardEntry] =
    useState(false);
  const [configSupAllowTimecardEntry, setconfigSupAllowTimecardEntry] =
    useState(false);
  const [isLeaveTye, setIsLeaveType] = useState(false)

  useEffect(() => {
    getLeaveType();
    getHourType();
    getEmployeeDetail();
    getFMLAList();
    if (props?.addType == "add") {
      getTimecardLeaveBalance();
    }
    getconfigEmpAllowTimecardEntry();
    getconfigSupAllowTimecardEntry();
    if (props?.timecardHeaderId?.empID) {
      getJob(props?.timecardHeaderId?.empID);
    }
    if (props.selectedDetail) {
      let currentDetail = props.selectedDetail;
      currentDetail.startDate = new Date(currentDetail.startDateTime);
      currentDetail.startDateTime = new Date(currentDetail.startDateTime);
      currentDetail.endDateTime = currentDetail.endDateTime
        ? new Date(currentDetail.endDateTime)
        : null;
      currentDetail.Job = currentDetail.jobID
        ? { id: currentDetail?.jobID, description: currentDetail?.job }
        : null;
      currentDetail.LeaveType = currentDetail.leaveTypeID
        ? {
          id: currentDetail?.leaveTypeID,
          description: currentDetail?.leaveType,
        }
        : null;
      currentDetail.HourType = currentDetail.hourTypeID
        ? { id: currentDetail?.hourTypeID, value: currentDetail?.hourlyType }
        : null;
      console.log({ currentDetail, aa: props.selectedDetail });
      setFormInit(currentDetail);
      setFormKey(formKey + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const AddTimecardEntry = (dataItem) => {
    if (dataItem.startDate && dataItem.startDateTime) {
      let date = new Date(dataItem.startDate);
      let startDateTime = new Date(dataItem.startDateTime);
      let endDateTime = new Date(dataItem.endDateTime);
      startDateTime.setFullYear(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      endDateTime.setFullYear(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      let TimeCardData = {
        empID: props?.timecardHeaderId?.empID,
        startDateTime: startDateTime.toLocaleString(),
        endDateTime: endDateTime.toLocaleString(),
        leaveTypeID: dataItem?.LeaveType?.id,
        leaveCodeID: 0,
        timeCardHeaderID: props.timecardHeaderId.id,
        hours: 0,
        hourTypeID: dataItem?.HourType ? dataItem?.HourType?.id : hourTypeList.filter((item) => item.value == "Regular")[0].id,
        jobID: dataItem?.Job?.id,
        memo: dataItem.memo || "",
        isFMLA: true,
        ihac: "",
        supervisorID: 0,
        modifiedUser: "",
        modifiedDate: new Date(),
        createdUser: "",
        createdDate: new Date(),
        deletedUser: "",
        deletedDate: null,
        supApproved: null,
        supApprovedDate: null,
        FMLAId: dataItem.fmlaType ? dataItem?.fmlaType?.id : null,
      };
      if (dataItem?.id) {
        TimeCardData.id = dataItem.id;
        TimeCardData.createdDate = dataItem.createdDate;

        axiosInstance({
          method: "PUT",
          url: TimecardEndPoints.TimeCardEntry + "/" + dataItem?.id,
          data: TimeCardData,
          withCredentials: false,
        })
          .then((response) => {
            props.toggleDialog();
          })
          .catch(() => { });
      } else {
        axiosInstance({
          method: "POST",
          url: TimecardEndPoints.TimeCardEntry,
          data: TimeCardData,
          withCredentials: false,
        })
          .then((response) => {
            props.toggleDialog();
          })
          .catch(() => { });
      }
    }
  };

  const clockIn = (dataItem) => {
    let empId = props.timecardHeaderId.empID;
    let headerId = props.timecardHeaderId.id;
    let hourTypeId = 0;
    if (dataItem?.HourType)
      hourTypeId = dataItem?.HourType?.id

    axiosInstance({
      method: "POST",
      url:
        TimecardEndPoints.clockIn +
        `?empid=${empId}&headerId=${headerId}&hourTypeId=${hourTypeId}&JobId=${dataItem?.Job?.id ?? formInit?.Job?.id}&memo=${dataItem?.memo || ""}`,
      withCredentials: false,
    })
      .then((response) => {
        props.toggleDialog();
        if (props.getTimeCardStatus) {
          props.getTimeCardStatus(empId, headerId);
        }
      })
      .catch(() => { });
  };

  const handleFormSubmit = (dataItem) => {
    if (props?.addType == "add") {
      if (allowTimecardEntry(dataItem?.LeaveType)) {
        AddTimecardEntry(dataItem);
      }
    }
    if (props?.addType == "clock") {
      clockIn(dataItem);
    }
  };

  const getEmployeeDetail = () => {
    axiosInstance({
      method: "get",
      url: EmplTimecardEndPoints.EmployeeDetail,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setIsSupervisor(data.isSupervisor);
      })
      .catch(() => { });
  };

  const getLeaveType = () => {
    if (props?.addType == "add") {
      axiosInstance({
        method: "get",
        url: LeaveTypeEndPoints.LeaveType + "?empId=" + props.timecardHeaderId.empID,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setLeaveNameList(data);
        })
        .catch(() => { });
    }

  };

  const getHourType = () => {
    axiosInstance({
      method: "GET",
      url: CommonEndPoints.Getcommon + "?id=" + 11,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setHourTypeList(data);
      })
      .catch(() => { });
  };

  const getJob = async (id) => {
    try {
      const { data } = await axiosInstance({
        method: "GET",
        url: PayrollEmployee.EmployeeJobs + "/" + id + "?active=true",
        withCredentials: false,
      });

      data.map((job) => {
        job.description = job.jobDescription.empJobDescription;
        return job;
      });
      setJobList(data);
    } catch (e) { }
  };

  const handleForm = (e) => {
    setFormInit((preValue) => ({
      ...preValue,
      [e.target.name]: e.target.value,
    }));
  };

  const getFMLAList = () => {
    axiosInstance({
      method: "GET",
      url: CommonEndPoints.Getcommon + "?id=" + 16,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        if (data) {
          let filteredFMLAList = data?.map((x) => ({
            id: x.id,
            value: x.value,
          }));
          setFMLAList(filteredFMLAList);
        }
      })
      .catch(() => { });
  };

  const getconfigEmpAllowTimecardEntry = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/62",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setconfigEmpAllowTimecardEntry(value);
      })
      .catch(() => { });
  };

  const getconfigSupAllowTimecardEntry = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/84",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setconfigSupAllowTimecardEntry(value);
      })
      .catch(() => { });
  };

  const getTimecardLeaveBalance = () => {
    let empId = props.timecardHeaderId.empID;
    let inputdata = {
      EmpId: empId,
      iWhatYear: new Date().getFullYear(),
    };
    if (empId) {
      axiosInstance({
        method: "POST",
        url: TimeCardLeaveBalance.TimecardLeaveBalance,
        data: inputdata,
        withCredentials: false,
      })
        .then((response) => {
          setTimecardLeaveBalance(response.data);
        })
        .catch(() => { });
    }
  };

  const allowTimecardEntry = (selectedLeave) => {
    let isNagative = false;
    if (selectedLeave) {
      if (selectedLeave.description.toLowerCase().includes("sick")) {
        isNagative = Number(TimecardLeaveBalance?.SickBalanceBox) < 0;
      } else if (selectedLeave.description.toLowerCase().includes("Vacation")) {
        isNagative = Number(TimecardLeaveBalance?.VacaBalanceBox) < 0;
      } else if (selectedLeave.description.toLowerCase().includes("Personal")) {
        isNagative = Number(TimecardLeaveBalance?.PersBalanceBox) < 0;
      } else if (selectedLeave.description.toLowerCase().includes("Comp")) {
        isNagative = Number(TimecardLeaveBalance?.CompBalanceBox) < 0;
      } else if (selectedLeave.description.toLowerCase().includes("fed")) {
        isNagative = Number(TimecardLeaveBalance?.FedPaidSickBalanceBox) < 0;
      } else if (
        selectedLeave.description.toLowerCase().includes("Emergency FMLA")
      ) {
        isNagative = Number(TimecardLeaveBalance?.EmergencyFMLABalanceBox) < 0;
      }
      if (isSupervisor) {
        if (configSupAllowTimecardEntry) {
          if (isNagative) {
            showErrorNotification("Negative Leave Balance");
          } else {
            return true;
          }
        } else {
          if (isNagative) {
            showErrorNotification("Negative Leave Balance");
          }
          return true;
        }
      } else {
        if (configEmpAllowTimecardEntry || configSupAllowTimecardEntry) {
          if (isNagative) {
            showErrorNotification("Negative Leave Balance");
          } else {
            return true;
          }
        } else {
          if (isNagative) {
            showErrorNotification("Negative Leave Balance");
          }
          return true;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    if (!props.selectedDetail) {
      const result = jobList.find((item) => item.primaryJob);
      setFormInit({ ...formInit, Job: result });
      setFormKey(formKey + 1);
    }
  }, [jobList]);
  return (
    <Dialog
      width={"auto"}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <span className="ms-2">
            {formInit?.id ? "Edit" : "Add"} Timecard Entry
          </span>
        </div>
      }
      onClose={props.toggleDialog}
    >
      <Form
        onSubmit={handleFormSubmit}
        initialValues={formInit}
        key={formKey}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              {props?.addType == "add" && (
                <>
                  <div className="d-flex k-w-full">
                    <Field
                      id={"date"}
                      name={"startDate"}
                      label={"Date*"}
                      wrapperstyle={{ width: "100%" }}
                      component={FormDatePicker}
                      disabled={formInit.id}
                      validator={timeEntryDateValidator}
                    />
                  </div>
                  <div className="d-flex mt-3">
                    <div className="d-flex me-3 ">
                      {/* Kesava asked to keep it ediable always */}
                      <Field
                        name={"startDateTime"}
                        label={"Start Time*"}
                        component={FormTimePicker}
                        validator={timeEntryStartTimeValidator}
                      />
                    </div>
                    <div className="d-flex">
                      <Field
                        name={"endDateTime"}
                        label={"End Time*"}
                        component={FormTimePicker}
                        validator={timeEntryEndTimeValidator}
                        startTime={formRenderProps.valueGetter("startDateTime")}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="d-flex flex-wrap mt-3 gap-3">
                <div className="w-100 w-md-50">
                  <Field
                    id={"job"}
                    name={"Job"}
                    label={"Job*"}
                    wrapperstyle={{ width: "100%" }}
                    data={jobList}
                    textField="description"
                    dataItemKey="id"
                    component={FormDropDownList}
                    validator={timeEntryJobValidator}
                  />
                </div>
                {props?.addType == "add" && isSupervisor && (
                  <div className="w-100 w-md-50">
                    <Field
                      id={"LeaveType"}
                      name={"LeaveType"}
                      label={"LeaveType"}
                      wrapperstyle={{ width: "100%" }}
                      data={leaveNameList.filter((el) => el.description !== "LWOP")}
                      textField="description"
                      dataItemKey="id"
                      placeholder="Select Leave Type"
                      component={FormDropDownList}
                      onChange={(e) => {
                        handleForm(e)
                        setIsLeaveType(e?.value?.isReasonRequired)
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="d-flex mt-3">
                {props?.addType == "add" && isSupervisor && (
                  <Field
                    id={"fmlaType"}
                    name={"fmlaType"}
                    label={"FMLA Type"}
                    wrapperstyle={{ width: "100%", marginRight: "10px" }}
                    data={FMLAList}
                    textField="value"
                    dataItemKey="id"
                    defaultItem={defaultFMLAItem}
                    component={FormDropDownList}
                  />
                )}
                <Field
                  id={"HourType"}
                  name={"HourType"}
                  label={"HourType"}
                  wrapperstyle={{ width: "100%" }}
                  data={hourTypeList}
                  textField="value"
                  dataItemKey="id"
                  defaultValue={hourTypeList.filter((item) => item.value == "Regular")[0]}
                  placeholder="Select Hour Type"
                  component={FormDropDownList}
                  onChange={handleForm}
                />
              </div>
              <div>
                <Field
                  id={"memo"}
                  name={"memo"}
                  label={props?.addType == "clock" ? "Memo" : !isLeaveTye ? "Memo" : "Memo*"}
                  component={FormInput}
                  validator={props?.addType == "clock" ? "" : !isLeaveTye ? "" : mamoValidator}
                />
              </div>
              <div className="k-form-buttons">
                <Button
                  className="k-button k-button-lg k-rounded-lg k-w-full"
                  themeColor={"primary"}
                  onClick={!formRenderProps.allowSubmit && handleFormSubmit}
                  type={"submit"}
                >
                  {formInit?.id ? "Update" : "Add To"} Timecard
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
}
