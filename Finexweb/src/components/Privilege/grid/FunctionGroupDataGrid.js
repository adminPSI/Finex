import React from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import FunctionGroupExpandGrid from "./FunctionGroupExpandGrid";

const FunctionGroupDataGrid = ({
  selectedFunctionData,
  setSelectedFunctionData,
  functionGroupsData,
  setFunctionGroupsData,
}) => {
  const expandChangeFunctionGroup = (event) => {
    let newData = functionGroupsData.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setFunctionGroupsData(newData);

    event.dataItem.expanded = event.value;
    setFunctionGroupsData([...functionGroupsData]);
  };

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
      <h1>Function Groups Data</h1>
      <Grid
        resizable={true}
        data={functionGroupsData}
        detail={(props) => (
          <FunctionGroupExpandGrid
            props={props}
            selectedFunctionData={selectedFunctionData}
            setSelectedFunctionData={setSelectedFunctionData}
          />
        )}
        expandField="expanded"
        onExpandChange={expandChangeFunctionGroup}
        scrollable="scrollable"
        style={{
          height: "90%",
        }}
      >
        <Column field="applicationS_ID" title="applicationS_ID" />
        <Column field="functioN_GROUPS_NAME" title="functioN_GROUPS_NAME" />
        <Column field="functionS_GROUPS_ID" title="functionS_GROUPS_ID" />
        <Column
          field="parenT_FUNCTION_GROUPS_ID"
          title="parenT_FUNCTION_GROUPS_ID"
        />
      </Grid>
    </div>
  );
};

export default FunctionGroupDataGrid;
