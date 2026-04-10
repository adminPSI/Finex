import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { LeaveTypeEndPoints, PayRoll } from "../../EndPoints";
import {
  FormDropDownList
} from "../form-components";

export default function ManualTimecardEntry(props) {
  const [, setleaveNameList] = React.useState([]);
  React.useEffect(() => {
    axiosInstance({
      method: "get",
      url: PayRoll.PRLeaveType + "/7",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setleaveNameList(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const AddTimecardEntry = (dataItem) => {
    let leaveTypeData = {
      organizationId: 7,
      description: dataItem.leaveName,
      isInactive: false,
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
        props.toggleDialog();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Dialog
      title={<span>Manual Timecard Entry</span>}
      onClose={props.toggleDialog}
    >
      <Form
        onSubmit={AddTimecardEntry}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
                <Field
                id={"job"}
                name={"job"}
                label={"Select a Job"}
                wrapperstyle={{ width: "100%" }}
                data={[]}
                defaultItem="Service"
                component={FormDropDownList}
              />
              <div className="k-form-buttons">
                <Button
                  className="k-button k-button-lg k-rounded-lg k-w-full"
                  themeColor={"primary"}
                  disabled={!formRenderProps.allowSubmit}
                  type={"submit"}
                >
                  Clock in
                </Button>
                <Button
                  className="k-button k-button-lg k-rounded-lg k-w-full"
                  themeColor={"primary"}
                  disabled={!formRenderProps.allowSubmit}
                  type={"submit"}
                >
                  Clock out
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
}
