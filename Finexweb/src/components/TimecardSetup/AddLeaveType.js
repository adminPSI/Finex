import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useEffect, useState } from "react";
import { CommonEndPoints, LeaveTypeEndPoints } from "../../EndPoints";
import { useTimecardContext } from "../../contexts/timecardContext";
import axiosInstance from "../../core/HttpInterceptor";
import { FormDropDownList, FormRadioGroup } from "../form-components";
import {
  allowEmployeeSelectValidator,
  leaveTypeValidator,
  requireReasonValidator,
} from "../validators";

const radioData = [
  {
    label: "Yes",
    value: "true",
  },
  {
    label: "No",
    value: "false",
  },
];

export default function AddLeaveType(props) {
  const [leaveNameList, setLeaveNameList] = useState([]);
  const { handleFormSubmit } = useTimecardContext();
  useEffect(() => {
    axiosInstance({
      method: "get",
      url: CommonEndPoints.Getcommon + "?id=15",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setLeaveNameList(data);
      })
      .catch(() => {});
  }, []);

  const AddLeaveType = (dataItem) => {
    if (dataItem.leaveName == "Select Leave Type") {
      return;
    }
    let leaveTypeData = {
      organizationId: 7,
      description: dataItem.leaveName.value,
      id: 0,
      isActive: "Y",
      allowEmployeeSelect: JSON.parse(dataItem.isAllowEmployee),
      isReasonRequired: JSON.parse(dataItem.isRequireReason),
    };
    axiosInstance({
      method: "POST",
      url: LeaveTypeEndPoints.LeaveType,
      data: leaveTypeData,
      withCredentials: false,
    })
      .then((response) => {
        handleFormSubmit("leaveType");
        props.toggleDialog();
      })
      .catch(() => {});
  };

  return (
    <>
      <Dialog
        width={600}
        title={"Add a leave type"}
        onClose={props.toggleDialog}
      >
        <Form
          onSubmit={AddLeaveType}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field
                  id={"leaveName"}
                  name={"leaveName"}
                  label={"Leave Type*"}
                  data={leaveNameList}
                  textField="value"
                  dataItemKey="id"
                  component={FormDropDownList}
                  validator={leaveTypeValidator}
                />
                <Field
                  id={"isAllowEmployee"}
                  name={"isAllowEmployee"}
                  label={"Allow employee to select*"}
                  placeholder={""}
                  data={radioData}
                  layout={"horizontal"}
                  validator={allowEmployeeSelectValidator}
                  component={FormRadioGroup}
                />
                <Field
                  id={"isRequireReason"}
                  name={"isRequireReason"}
                  label={"Require reason*"}
                  placeholder={""}
                  data={radioData}
                  layout={"horizontal"}
                  validator={requireReasonValidator}
                  component={FormRadioGroup}
                />

                <div className="k-form-buttons">
                  <Button
                    className="k-button k-button-lg k-rounded-lg k-w-full"
                    themeColor={"primary"}
                    disabled={!formRenderProps.allowSubmit}
                    type={"submit"}
                  >
                    Add Leave Type
                  </Button>
                </div>
              </fieldset>
            </FormElement>
          )}
        />
      </Dialog>
    </>
  );
}
