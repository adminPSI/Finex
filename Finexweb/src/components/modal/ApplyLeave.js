import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  CommonEndPoints,
  ConfigurationEndPoints,
  EmplTimecardEndPoints,
  LeaveTypeEndPoints,
  TimecardEndPoints
} from "../../EndPoints";
import {
  FormDateTimePicker,
  FormDropDownList,
  FormTextArea
} from "../form-components";
import {
  applyLeaveEndDateValidator,
  applyLeaveReasonValidator,
  applyLeaveStartDateValidator,
  applyLeaveTypeValidator
} from "../validators";

import { useStartEndDateValidatorForSingle } from "../../helper/useStartEndDateValidatorForSingle";
import {
  showSuccessNotification
} from "../NotificationHandler/NotificationHandler";

export default function ApplyLeave(props) {
  const {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
  } = useStartEndDateValidatorForSingle();

  const [leaveType, setLeaveType] = useState([]);
  const [FMLAList, setFMLAList] = useState([]);
  let defaultFMLAItem = { id: null, value: "Select FMLA Type" };
  let TimecardLeaveBalance = props.TimecardLeaveBalance;
  const [, setIsSupervisor] = useState(false);
  const [, setconfigEmpAllowTimecardEntry] =
    useState(false);
  const [, setconfigSupAllowTimecardEntry] =
    useState(false);
  const [, setConfigAllowNegativeLeave] =
    useState(true);
  const [isLeaveType, setIsLeaveType] = useState(false)
  useEffect(() => {
    getEmployeeDetail();
    getconfigEmpAllowTimecardEntry();
    getconfigSupAllowTimecardEntry();
    getAllowNegativeLeaveConfig();
  }, []);

  useEffect(() => {
    getLeaveType();
    if (props.FMLADisplay && TimecardLeaveBalance.FMLAStartBox) {
      getFMLAList();
    }
  }, []);

  const getLeaveType = () => {
    axiosInstance({
      method: "GET",
      url:
        LeaveTypeEndPoints.getLeaveType +
        "?Allowemptoselect=true&sortKey=description&desc=false",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data?.data;
        console.log("data", data)
        setLeaveType(
          data
            .filter((item) => item.allowEmployeeSelect)
            .filter((item) => item.description !== "FMLA")
        );
      })
      .catch((error) => { });
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

  const getEmployeeDetail = () => {
    axiosInstance({
      method: "get",
      url: EmplTimecardEndPoints.EmployeeDetail,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setIsSupervisor(data.isSupervisor && props.currentEmployee.empId !== data.empId);
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

  const getAllowNegativeLeaveConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/62",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setConfigAllowNegativeLeave(value);
      })
      .catch(() => {
        setConfigAllowNegativeLeave(false);
      });
  };

  const allowTimecardEntry = (dataItem) => {
    return true;
  };

  const LeaveTimeCardHandleSubmit = (dataItem) => {
    let leaveTimeCardRequest = {
      id: dataItem.id,
      groupId: 0,
      leaveTypeID: dataItem?.leaveType?.id,
      beginDate: dataItem.beginDate.toLocaleString(),
      endDate: dataItem.endDate.toLocaleString(),
      reasonForLeave: dataItem.leaveReason || "",
      status: "pending",
      empId: props.currentEmployee.empId,
      lRDate: dataItem.lRDate,
      FMLAId: dataItem.fmlaType ? dataItem?.fmlaType?.id : null,
    };

    if (allowTimecardEntry(dataItem)) {
      if (dataItem.edit) {
        axiosInstance({
          method: "PUT",
          url: `${TimecardEndPoints.TimeCardLeaveRequest}/${dataItem.id}`,
          data: leaveTimeCardRequest,
          withCredentials: false,
        })
          .then((response) => {
            props.getTimecardLeaveBalance(response?.data.empId);
            props.toggleDialog();
            showSuccessNotification("Leave request updated successfully");
          })
          .catch((error) => { });
      } else {
        axiosInstance({
          method: "POST",
          url: TimecardEndPoints.TimeCardLeaveRequest,
          data: leaveTimeCardRequest,
          withCredentials: false,
        })
          .then((response) => {
            showSuccessNotification("Leave request created successfully");
            props.toggleDialog();
            props.getTimecardLeaveBalance(response?.data.empId);
          })
          .catch((error) => { });
      }
    }
  };
  const updateEndDate = (e) =>
    updateEndDateFun({
      formRenderProps: e,
      startdate: props.formInit?.beginDate || selectedStartDate,
    });
  const updateStartDate = (e) =>
    updateStartDateFun({
      formRenderProps: e,
      enddate: props.formInit?.endDate || selectedEndDate,
    });

  const formRef = useRef({});

  const leaveReasonValidation = (value) => {
    return isLeaveType ? applyLeaveReasonValidator(value) : null;
  };
  return (
    <>
      <Dialog
        title={<span>{props.formInit.id ? "Edit" : "Add"} Leave Request</span>}
        onClose={props.toggleDialog}
      >
        <Form
          onChange={(e) => {
            formRef.current = e.value;
          }}
          onSubmit={LeaveTimeCardHandleSubmit}
          initialValues={props.formInit}
          render={(formRenderProps) => {
            return (
              <FormElement>
                <fieldset className={"k-form-fieldset"}>
                  <div className="d-flex k-w-full">
                    <Field
                      id={"date"}
                      name={"beginDate"}
                      label={"Start Date*"}
                      wrapperstyle={{
                        width: "100%",
                        marginRight: "10px",
                      }}
                      className="me-2"
                      onChange={updateStartDate}
                      value={selectedStartDate}
                      component={FormDateTimePicker}
                      validator={applyLeaveStartDateValidator}
                    />
                    <div style={{ width: "100%" }}>
                      <Field
                        id={"dateEnd"}
                        name={"endDate"}
                        label={"End Date*"}
                        onChange={updateEndDate}
                        wrapperstyle={{ width: "100%" }}
                        component={FormDateTimePicker}
                        validator={applyLeaveEndDateValidator}
                        startDate={formRenderProps.valueGetter("beginDate")}
                      />
                      {endDateError && (
                        <p
                          className="text-danger mb-0 p-0"
                          style={{ fontSize: "12px" }}
                        >
                          {endDateError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="d-flex k-w-full">
                    <Field
                      id={"leaveType"}
                      name={"leaveType"}
                      label={"Leave Type*"}
                      wrapperstyle={{ width: "100%" }}
                      data={leaveType.filter((el) => el.description !== "LWOP")}
                      textField="description"
                      dataItemKey="id"
                      placeholder="Select Leave Type"
                      component={FormDropDownList}
                      validator={applyLeaveTypeValidator}
                      onChange={(e) => {
                        setIsLeaveType(e.value.isReasonRequired)
                      }
                      }
                    />
                    {props.FMLADisplay && TimecardLeaveBalance.FMLAStartBox && (
                      <Field
                        id={"fmlaType"}
                        name={"fmlaType"}
                        label={"FMLA Type"}
                        wrapperstyle={{ width: "100%", marginLeft: "10px" }}
                        data={FMLAList}
                        textField="value"
                        dataItemKey="id"
                        defaultItem={defaultFMLAItem}
                        component={FormDropDownList}
                      />
                    )}
                  </div>
                  <Field
                    id={"leaveReason"}
                    name={"leaveReason"}
                    label={`Leave Reason ${isLeaveType ? "*" : ""}`}
                    component={FormTextArea}
                    validator={leaveReasonValidation}
                  />
                  <div className="k-form-buttons">
                    <Button
                      className="k-button k-button-lg k-rounded-lg k-w-full"
                      themeColor={"primary"}
                      disabled={!formRenderProps.allowSubmit || endDateError}
                      type={"submit"}
                    >
                      Apply
                    </Button>
                  </div>
                </fieldset>
              </FormElement>
            );
          }}
        />
      </Dialog>
    </>
  );
}
