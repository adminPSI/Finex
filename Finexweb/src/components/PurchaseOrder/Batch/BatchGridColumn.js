import React, { useMemo } from "react";
import { CustomDateGridColumn } from "../../Shared/CustomDateGridColumn";
import { BatchGridCommandCell } from "./BatchGridCommandCell";
import { GridColumn } from "@progress/kendo-react-grid";

function BatchGridColumn({
  batchColumnShow,
  setAddEditBatchData,
  batchOffset,
  setBatchShowContextMenu,
}) {
  const columns = useMemo(() => {
    return [
      {
        field: "id",
        title: "Batch Number",
        show: true,
      },
      {
        field: "dateWritten",
        title: "Written Date",
        filterable: false,
        filter: "date",
        editor: "date",
        format: "{0:MM/dd/yyyy}",
        cell: CustomDateGridColumn,
        show: true,
      },
      {
        field: "datePrinted",
        title: "Date Printed",
        filterable: false,
        filter: "date",
        editor: "date",
        format: "{0:MM/dd/yyyy}",
        cell: CustomDateGridColumn,
        show: true,
      },
      {
        field: "datePosted",
        title: "Date Posted",
        filterable: false,
        filter: "date",
        editor: "date",
        format: "{0:MM/dd/yyyy}",
        cell: CustomDateGridColumn,
        show: true,
      },
      {
        field: "createdBy",
        title: "Created By",
        show: batchColumnShow,
      },
      {
        field: "modifiedBy",
        title: "Modified By",
        filterable: false,
        show: batchColumnShow,
      },
      {
        field: "modifiedDate",
        title: "Modified Date",
        filterable: false,
        show: batchColumnShow,
        cell: CustomDateGridColumn,
      },
      {
        field: "createdDate",
        title: "Created Date",
        filterable: false,
        show: batchColumnShow,
        cell: CustomDateGridColumn,
      },
      {
        field: "",
        title: "",
        show: true,
        cell: (props) => (
          <BatchGridCommandCell
            props={props}
            setAddEditBatchData={setAddEditBatchData}
            batchOffset={batchOffset}
            setBatchShowContextMenu={setBatchShowContextMenu}
          />
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchColumnShow]);
  return columns.map(
    (column, i) => column.show && <GridColumn key={i} {...column} />
  );
}

export default BatchGridColumn;
