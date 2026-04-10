import React, { useMemo } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { CheckBoxCell } from "../../cells/CheckBoxCell";

const editField = "inEdit";

const PermissionExpandGrid = ({
  props,
  roleData,
  privilegeListData,
}) => {
  const data = useMemo(() => {
    const tmpData = props.dataItem.allowedPrivileges;
    if (tmpData && tmpData.length) {
      return tmpData.map((item) => {
        const tt = roleData.reduce((acc, role) => {
          const matchingRole = item.roles.find((r) =>
            r.roleName.toLowerCase().includes(role.toLowerCase())
          );
          acc[`${role}`] = matchingRole ? "Y" : "N";
          return acc;
        }, {});

        return {
          ...item,
          ...tt,
          inEdit: true,
        };
      });
    }

    return [];
  }, [props, roleData]);

  const columns = useMemo(() => {
    if (data && data.length) {
      return Object.keys(data[0]).filter((key) => {
        return key !== "privilegeId" && key !== "roles" && key !== "inEdit";
      });
    }
    return [];
  }, [data]);

  return (
    <>
      {data && (
        <div className="d-flex flex-column gap-3">
          <Grid resizable={true} data={data} editField={editField}>
            <Column
              field="privilegeId"
              title="Privilege"
              editable={false}
              cell={(props) => {
                if (privilegeListData && privilegeListData.length)
                  return (
                    <td>
                      {
                        privilegeListData.find(
                          (item) =>
                            item.privileges_id == props.dataItem.privilegeId
                        )?.privileges_name
                      }
                    </td>
                  );

                return <td>{props.dataItem.privilegeId}</td>;
              }}
            />
            {columns.map((key) => (
              <Column
                key={key}
                field={key}
                title={key}
                cell={(props) => <CheckBoxCell {...props} showText="true" />}
              />
            ))}
          </Grid>
        </div>
      )}
    </>
  );
};

export default PermissionExpandGrid;
