import React, { useRef, useState } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import PermissionExpandGrid from "./PermissionExpandGrid";
import { Button } from "@progress/kendo-react-buttons";

const SubParentExpandGrid = ({
  props,
  setPrivilegeData,
  privilegeData,
  propsDataIndex,
  roleData,
  privilegeListData,
}) => {
  const data = props.dataItem.functions;
  const [isChildRender, setIsChildRender] = useState(false);
  const childRef = useRef();
  const expandChange = (event) => {
    event.dataItem.expanded = event.value;

    setPrivilegeData((prev) => {
      const subParentData = prev[propsDataIndex].childFunctionGroups.map(
        (item, index) => {
          if (index == props.dataIndex) {
            return {
              ...item,
              functions: item.functions.map((item2, index2) => {
                if (index2 == event.dataIndex) {
                  return event.dataItem;
                } else {
                  return { ...item2, expanded: false };
                }
              }),
            };
          } else {
            return {
              ...item,
              expanded: false,
            };
          }
        }
      );

      prev[propsDataIndex].childFunctionGroups = subParentData;

      return [...prev];
    });
  };

  const handleSubmit = () => {
    if (childRef.current) {
      childRef.current.handleSubmit();
    }
  };

  const handleUpdate = ({ localRoleData, props }) => {
    setPrivilegeData((prev) => {
      const subParentData = prev[propsDataIndex].childFunctionGroups.map(
        (item, index) => {
          if (item?.expanded) {
            return {
              ...item,
              functions: item.functions.map((item2, index2) => {
                if (index2 == props.dataIndex) {
                  return {
                    ...props.dataItem,
                    allowedPrivileges: localRoleData,
                  };
                } else {
                  return { ...item2, expanded: false };
                }
              }),
            };
          } else {
            return {
              ...item,
            };
          }
        }
      );

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
            detail={(gridProps) => (
              <PermissionExpandGrid
                ref={childRef}
                props={gridProps}
                setPrivilegeData={setPrivilegeData}
                privilegeData={privilegeData}
                propsDataIndex={propsDataIndex}
                roleData={roleData}
                privilegeListData={privilegeListData}
                handleUpdate={handleUpdate}
              />
            )}
            expandField="expanded"
            onExpandChange={expandChange}
          >
            <Column
              field="functionName"
              title="Function Name"
              cell={(colProps) => {
                return (
                  <td>
                    <div className="row d-flex justify-content-space-between m-0 w-full align-items-center">
                      <p className="m-0 w-25">
                        {colProps.dataItem.functionName}
                      </p>
                      {colProps.expanded && (
                        <div className="m-0 w-75 row d-flex justify-content-end">
                          <Button
                            themeColor={"base"}
                            className={"col-1 me-2"}
                            onClick={() => setIsChildRender(!isChildRender)}
                          >
                            Cancel
                          </Button>
                          <Button
                            themeColor={"primary"}
                            type={"submit"}
                            className="w-auto"
                            onClick={(cc) => handleSubmit({ colProps, cc })}
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                );
              }}
            />
          </Grid>
        </div>
      )}
    </>
  );
};

export default SubParentExpandGrid;
