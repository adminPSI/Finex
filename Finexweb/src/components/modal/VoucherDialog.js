import React from "react";
import { Dialog } from "@progress/kendo-react-dialogs";
import VoucherPOForm from "../PurchaseOrder/VoucherForm";

export default function VoucherDialog(props) {
  return (
    <Dialog
      width={"75vw"}
      height={"95vh"}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <span className="ms-2">View Voucher</span>
        </div>
      }
      onClose={props.toggleVoucherDialog}
    >
      <VoucherPOForm voucherId={props.voucherId} type="model"></VoucherPOForm>
    </Dialog>
  );
}
