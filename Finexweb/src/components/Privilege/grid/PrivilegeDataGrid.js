import React from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";

const PrivilegeDataGrid = ({ privilegeData, isNewData }) => {
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
      <h1>Privileges Data</h1>
      <Grid
        resizable={true}
        data={privilegeData}
        scrollable="scrollable"
        style={{
          height: "90%",
        }}
      >
        {isNewData && isNewData ? (
          <>
            <Column field="privilegeId" title="privilege_Id" />
            <Column field="privilegeName" title="privileges_name" />
          </>
        ) : (
          <>
            <Column field="privileges_id" title="privileges_id" />
            <Column field="privileges_name" title="privileges_name" />
            <Column field="privileges_key" title="privileges_key" />
            <Column field="applications_id" title="applications_id" />
          </>
        )}
      </Grid>
    </div>
  );
};

export default PrivilegeDataGrid;
