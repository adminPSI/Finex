import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React from "react";

const GridContextMenu = ({
  approveBatchDisplay,
  rowApprovalDate,
  rowPostedDate,
  batchShowContextMenu,
  batchOffset,
  batchContextMenuOnSelect,
  batchContextMenuCloseMenu,
  checkPrivilegeGroup,
}) => {
  return approveBatchDisplay && !rowApprovalDate ? (
    <ContextMenu
      show={batchShowContextMenu}
      offset={batchOffset.current}
      onSelect={batchContextMenuOnSelect}
      onClose={batchContextMenuCloseMenu}
    >
      {checkPrivilegeGroup("DeleteBatchVoucherCM", 4) && (
        <MenuItem
          text="Delete Batch"
          data={{
            action: "delete",
          }}
          icon="delete"
        />
      )}
      {checkPrivilegeGroup("ApproveBatchVoucherCM", 2) && (
        <MenuItem
          text="Approve Batch"
          data={{
            action: "approveBatch",
          }}
          icon="post"
        />
      )}
    </ContextMenu>
  ) : (
    <ContextMenu
      show={batchShowContextMenu}
      offset={batchOffset.current}
      onSelect={batchContextMenuOnSelect}
      onClose={batchContextMenuCloseMenu}
    >
      {checkPrivilegeGroup("PrintBatchVoucherCM", 2) && (
        <MenuItem
          text="Print Batch"
          data={{
            action: "print",
          }}
          icon="print"
        />
      )}
      {checkPrivilegeGroup("PostBatchVoucherCM", 2) && (
        !rowPostedDate && (
          <MenuItem
            text="Post Batch"
            data={{
              action: "post",
            }}
            icon="post"
          />
        )
      )}
      {checkPrivilegeGroup("PrintPostBatchVoucherCM", 2) && (
        <MenuItem
          text="Print & Post Batch"
          data={{
            action: "post",
          }}
          icon="post"
        />
      )}

      {checkPrivilegeGroup("ViewBatchVoucherCM", 1) && (
        <MenuItem
          text="Vouchers"
          data={{
            action: "view",
          }}
          icon="view"
        />
      )}
      {checkPrivilegeGroup("DeleteBatchVoucherCM", 4) && (
        !rowPostedDate && (
          <MenuItem
            text="Delete Batch"
            data={{
              action: "delete",
            }}
            icon="delete"
          />
        )
      )}
    </ContextMenu>
  );
};

export default GridContextMenu;
