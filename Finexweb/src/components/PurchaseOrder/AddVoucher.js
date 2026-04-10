import React from "react";
import { Button } from "@progress/kendo-react-buttons";
import { useLocation, useNavigate } from "react-router-dom";
import VoucherPOForm from "./VoucherForm";

export default function AddVoucher() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [voucherId, setVoucherId] = React.useState();

  React.useEffect(() => {
    if (state?.voucherId) {
      let voucherId = state?.voucherId || "";
      setVoucherId(voucherId);
    }
  }, [state]);

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Accounting
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Accounts Payable
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Voucher
          </li>
        </ol>
      </nav>
      <div className="row mb-3">
        <div className="col-sm-8">
          <figure>
            <blockquote className="blockquote">
              <h1>
                {state?.type == "view"
                  ? "View Voucher"
                  : voucherId
                    ? "Edit Voucher"
                    : "Add Voucher"}
              </h1>
            </blockquote>
          </figure>
        </div>
        <div className="col-sm-4 text-end">
          <Button
            themeColor={"primary"}
            onClick={() => navigate("/purchaseorder")}
          >
            Accounts Payable Dashboard
          </Button>
        </div>
      </div>
      <div className="row">
        <VoucherPOForm type="screen"></VoucherPOForm>
      </div>
    </>
  );
}
