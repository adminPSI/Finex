import { Button } from "@progress/kendo-react-buttons";
import React from "react";

const PayrollGridCommandCell = ({ props, handleContextMenuOpen }) => {
  return (
    <td className="k-command-cell">
      <div className="d-flex align-items-center">
        <Button
          id={props.dataItem.poNumber}
          onClick={(event) => handleContextMenuOpen(event, props.dataItem)}
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </Button>
      </div>
    </td>
  );
};

export default PayrollGridCommandCell;
