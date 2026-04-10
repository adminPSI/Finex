import React from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import PermissionExpandGrid from "./PermissionExpandGrid";

const SubParentExpandGrid = ({
  props,
  setPrivilegeData,
  privilegeData,
  propsDataIndex,
  roleData,
  privilegeListData,
}) => {
  const data = props.dataItem.functions;

  const expandChange = (event) => {
    event.dataItem.expanded = event.value;

    setPrivilegeData((prev) => {
      const subParentData = prev[propsDataIndex].childFunctionGroups;
      subParentData[props.dataIndex].functions[event.dataIndex] =
        event.dataItem;

      prev[propsDataIndex].childFunctionGroups = subParentData;

      return [...prev];
    });
  };

  return (
    <>
      {data && (
        <div className="d-flex flex-column gap-3">
          <Grid
            resizable={true}
            data={data}
            detail={(props) => (
              <PermissionExpandGrid
                props={props}
                setPrivilegeData={setPrivilegeData}
                privilegeData={privilegeData}
                propsDataIndex={propsDataIndex}
                roleData={roleData}
                privilegeListData={privilegeListData}
              />
            )}
            expandField="expanded"
            onExpandChange={expandChange}
          >
            <Column field="functionName" title="Function Name" />
          </Grid>
        </div>
      )}
    </>
  );
};

export default SubParentExpandGrid;
