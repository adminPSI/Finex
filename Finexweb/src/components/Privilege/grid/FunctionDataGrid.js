import React, { useCallback } from "react";
import {
  Grid,
  GridColumn as Column,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { getter } from "@progress/kendo-react-common";

const FunctionDataGrid = ({
  selectedFunctionData,
  functionData,
  functionDataRowClick,
  selectedFunData,
  setSelectedFunData,
}) => {
  const DATA_ITEM_KEY = "functionS_ID";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);

  const rowClick = (event) => {
    functionDataRowClick(event);
  };

  const onSelectionChange = useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedFunctionData,
        dataItemKey: DATA_ITEM_KEY,
      });
      if (
        Object.keys(selectedFunctionData)[0] !==
        Object.keys(newSelectedState)[0]
      ) {
        setSelectedFunData(newSelectedState);
      } else {
        setSelectedFunData({});
      }
    },
    [selectedFunctionData, setSelectedFunData]
  );

  return (
    <div
      style={{
        border: "1px solid black",
        borderRadius: "15px",
        padding: "30px",
        margin: "30px",
        height: "80vh",
      }}
    >
      <h1>Function Data</h1>
      <Grid
        resizable={true}
        onRowClick={rowClick}

        data={
          Object.keys(selectedFunctionData) &&
          Object.keys(selectedFunctionData).length
            ? functionData
                .filter(
                  (item) =>
                    item.functionS_GROUPS_ID ==
                    parseInt(Object.keys(selectedFunctionData)[0])
                )
                .map((item) => ({
                  ...item,
                  [SELECTED_FIELD]: selectedFunData[idGetter(item)],
                }))
            : functionData
        }
        dataItemKey={DATA_ITEM_KEY}
        selectedField={SELECTED_FIELD}
        selectable={{
          enabled: true,
          drag: false,
          cell: false,
          mode: "multiple",
        }}
        onSelectionChange={onSelectionChange}
        scrollable="scrollable"
        style={{
          height: "90%",
        }}
      >
        <Column field="functionS_ID" title="functionS_ID" />
        <Column field="functionS_KEY" title="functionS_KEY" />
        <Column field="functionS_NAME" title="functionS_NAME" />
        <Column field="applicationS_ID" title="applicationS_ID" />
        <Column field="functionS_GROUPS_ID" title="functionS_GROUPS_ID" />
      </Grid>
    </div>
  );
};

export default FunctionDataGrid;
