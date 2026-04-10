import React from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";

export default function DeleteModal(props) {
  return (
    <Dialog
      title={<span>Do you want to delete this {props.title}</span>}
      onClose={props.toggleDialog}
    >
      <p>
        Confirm that you want to delete {props.name} name. This action is not
        reversible
      </p>
      <DialogActionsBar>
        <div className="d-flex justify-content-end">
          <Button className="me-3" onClick={props.toggleDialog}>
            Cancel
          </Button>
          <Button themeColor={"primary"} onClick={props.deleteSubmit}>
            Delete
          </Button>
        </div>
      </DialogActionsBar>
    </Dialog>
  );
}
