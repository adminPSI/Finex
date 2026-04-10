import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React from "react";

const PayrollGridContextMenu = ({ show, offset, onSelect, onClose }) => {
  return (
    <ContextMenu
      show={show}
      offset={offset.current}
      onSelect={onSelect}
      onClose={onClose}
    >
      <MenuItem
        text="Employee History"
        data={{
          action: "employeeHistory",
        }}
      />
      <MenuItem
        text="Add"
        data={{
          action: "add",
        }}
      />
    </ContextMenu>
  );
};

export default PayrollGridContextMenu;
