import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";

import React from "react";
import SubParentExpandGrid from "./SubParentExpandGrid";

const subParentCell = (props) => {
  const data = props.dataItem.functionGroupName;
  return (
    <td>
      <div className="d-flex justify-content-between align-items-center gap-2 w-100">
        {data}
        <div>
        </div>
      </div>
    </td>
  );
};

const ParentExpandGrid = ({
  props,
  setPrivilegeData,
  privilegeData,
  roleData,
  privilegeListData,
}) => {
  const data = props.dataItem.childFunctionGroups;
  const propsDataIndex = props.dataIndex;

  const expandChange = (event) => {
    const dataIndex = event.dataIndex;

    event.dataItem.expanded = event.value;

    setPrivilegeData((prev) => {
      const data = prev[props.dataIndex];

      data.childFunctionGroups[dataIndex] = event.dataItem;
      prev[props.dataIndex] = data;

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
              <SubParentExpandGrid
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
            <Column
              field="functionGroupName"
              title="Sub Parent"
              cell={subParentCell}
            />
          </Grid>
        </div>
      )}
    </>
  );
};

export default ParentExpandGrid;
