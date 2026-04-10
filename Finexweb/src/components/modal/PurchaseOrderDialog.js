import React from "react";
import { Dialog } from "@progress/kendo-react-dialogs";

import PurchaseOrderForm from "../PurchaseOrder/PurchaseOrderForm";

export default function PurchaseOrderDialog(props) {
  return (
    <Dialog
      width={"75vw"}
      height={"95vh"}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <span className="ms-2">View Account Payable</span>
        </div>
      }
      onClose={props.togglePODialog}
    >
      <PurchaseOrderForm
        poNumber={props.poNumber}
        poId={props.poId}
        type="model"
      ></PurchaseOrderForm>
    </Dialog>
  );
}
