import React, { useCallback } from "react";
import { getter } from "@progress/kendo-data-query";
import {
  Grid,
  GridColumn as Column,
  getSelectedState,
} from "@progress/kendo-react-grid";

const FunctionGroupExpandGrid = ({
  props,
  selectedFunctionData,
  setSelectedFunctionData,
}) => {
  const data = props.dataItem.expandData;

  const DATA_ITEM_KEY = "functionS_GROUPS_ID";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);

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
        setSelectedFunctionData(newSelectedState);
      } else {
        setSelectedFunctionData({});
      }
    },
    [selectedFunctionData, setSelectedFunctionData]
  );

  return (
    <>
      <Grid
        resizable={true}
        data={data.map((item) => ({
          ...item,
          [SELECTED_FIELD]: selectedFunctionData[idGetter(item)],
        }))}
        dataItemKey={DATA_ITEM_KEY}
        selectedField={SELECTED_FIELD}
        selectable={{
          enabled: true,
          drag: false,
          cell: false,
          mode: "multiple",
        }}
        onSelectionChange={onSelectionChange}
      >
        <Column field="applicationS_ID" title="applicationS_ID" />
        <Column field="functioN_GROUPS_NAME" title="functioN_GROUPS_NAME" />
        <Column field="functionS_GROUPS_ID" title="functionS_GROUPS_ID" />
        <Column
          field="parenT_FUNCTION_GROUPS_ID"
          title="parenT_FUNCTION_GROUPS_ID"
        />
      </Grid>
    </>
  );
};

export default FunctionGroupExpandGrid;
