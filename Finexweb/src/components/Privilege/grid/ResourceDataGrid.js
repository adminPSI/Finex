import React from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";

const ResourceDataGrid = ({ resourceData, isNewData }) => {
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
      <h1>Resource Data</h1>
      <Grid
        resizable={true}
        data={resourceData}
        scrollable="scrollable"
        style={{
          height: "90%",
        }}
      >
        {isNewData && isNewData ? (
          <>
            <Column field="functionId" title="function_Id" />
            <Column field="functionName" title="function_Name" />
            <Column field="privilegeId" title="privilege_Id" />
            <Column field="privilegeName" title="privilege_Name" />
            <Column field="resourceId" title="resource_Id" />
            <Column field="resourceName" title="resource_Name" />
            <Column field="resourceS_KEY" title="resourceS_KEY" />
          </>
        ) : (
          <>
            <Column field="resourceS_ID" title="resourceS_ID" />
            <Column field="resourceS_TYPE" title="resourceS_TYPE" />
            <Column field="resourceS_KEY" title="resourceS_KEY" />
            <Column field="resourceS_NAME" title="resourceS_NAME" />
            <Column field="resourceS_URI" title="resourceS_URI" />
            <Column field="parenT_RESOURCES_ID" title="parenT_RESOURCES_ID" />
            <Column field="sorT_KEY" title="sorT_KEY" />
            <Column field="applicationS_ID" title="applicationS_ID" />
            <Column field="icon" title="icon" />
            <Column field="resourceS_LEVEL" title="resourceS_LEVEL" />
          </>
        )}
      </Grid>
    </div>
  );
};

export default ResourceDataGrid;
