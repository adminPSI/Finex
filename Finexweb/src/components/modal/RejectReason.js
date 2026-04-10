import React from "react";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Form, FormElement, Field } from "@progress/kendo-react-form";
import { Button } from "@progress/kendo-react-buttons";
import { rejectReasonValidator } from "../validators";
import { FormTextArea } from "../form-components";

const CustomTitleBar = () => {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <span className="k-icon k-i-plus-outline" />
      <span>Reject Reason</span>
    </div>
  );
};

export default function RejectReason(props) {
  const AddTimecardEntry = (dataItem) => {
    props.getRejectReason(dataItem.rejectReason);
    props.toggleDialog();
  };

  return (
    <Dialog
      width={"300px"}
      title={<CustomTitleBar />}
      onClose={props.toggleDialog}
    >
      <Form
        onSubmit={AddTimecardEntry}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"rejectReason"}
                name={"rejectReason"}
                label={"Reject Reason"}
                rows={4}
                component={FormTextArea}
                validator={rejectReasonValidator}
              />
              <div className="k-form-buttons">
                <Button
                  className="k-button k-button-lg k-rounded-lg k-w-full text-white"
                  themeColor={"error"}
                  disabled={!formRenderProps.allowSubmit}
                  type={"submit"}
                >
                  Reject Request
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
}
