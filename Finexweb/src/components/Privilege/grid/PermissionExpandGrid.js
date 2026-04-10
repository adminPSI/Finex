import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { CheckBoxCell } from "../../cells/CheckBoxCell";
import axiosInstance from "../../../core/HttpInterceptor";
import { PrivilegeEndPoints } from "../../../EndPoints";
import { showSuccessNotification } from "../../NotificationHandler/NotificationHandler";

const editField = "inEdit";

const PermissionExpandGrid = (
  { props, roleData, privilegeListData, handleUpdate },
  ref
) => {
  const [localRoleData, setLocalRoleData] = useState([]);

  useImperativeHandle(ref, () => ({
    handleSubmit() {
      const dataActive = [];
      const dataDeActive = [];
      localRoleData.map((item) => {
        return {
          privilegeS_ID: item.privilegeId,
          functioN_ID: props.dataItem.functionId,
          roles: roleData
            .map((roleItem) => {
              if (item[roleItem] == "Y") {
                dataActive.push({
                  privilegeS_ID: item.privilegeId,
                  functioN_ID: props.dataItem.functionId,
                  rolE_NAME: roleItem,
                });
                return {
                  roleName: roleItem,
                };
              } else {
                dataDeActive.push({
                  privilegeS_ID: item.privilegeId,
                  functioN_ID: props.dataItem.functionId,
                  rolE_NAME: roleItem,
                });
                return null;
              }
            })
            .filter((item) => item),
        };
      });

      axiosInstance({
        method: "PUT",
        url: `${PrivilegeEndPoints.FunctionResourcePrivilege}`,
        withCredentials: false,
        data: {
          functionPrivilegeRoles: dataActive,
          inactivefunctionPrivilegeRoles: dataDeActive,
        },
      })
        .then((response) => {
          const tmpData = [...localRoleData].map((item) => {
            const dd = [];

            roleData.map((roleItem) => {
              if (item[roleItem] == "Y") {
                dd.push({
                  roleId: 0,
                  roleName: roleItem,
                });
              }
              return null;
            });

            return {
              ...item,
              roles: dd,
            };
          });
          showSuccessNotification(response.data.message);
          handleUpdate({ localRoleData: tmpData, props });
        })
        .catch(() => {});
    },
  }));
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

  useEffect(() => {
    setLocalRoleData(data);
  }, [data]);

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
      {localRoleData && (
        <div className="d-flex flex-column gap-3">
          <Grid resizable={true} data={localRoleData} editField={editField}>
            <Column
              field="privilegeId"
              title="Privilege"
              editable={false}
              cell={(colProps) => {
                if (privilegeListData && privilegeListData.length)
                  return (
                    <td>
                      {
                        privilegeListData.find(
                          (item) =>
                            item.privileges_id == colProps.dataItem.privilegeId
                        )?.privileges_name
                      }
                    </td>
                  );

                return <td>{colProps.dataItem.privilegeId}</td>;
              }}
            />
            {columns.map((key) => (
              <Column
                key={key}
                field={key}
                title={key}
                cell={(colProps) => (
                  <CheckBoxCell
                    {...colProps}
                    showText="true"
                    onChange={(e) => {
                      const tmpData = [...localRoleData];
                      tmpData[e.dataIndex][e.field] = e.value ? "Y" : "N";
                      setLocalRoleData(tmpData);
                    }}
                  />
                )}
              />
            ))}
          </Grid>
        </div>
      )}
    </>
  );
};

export default forwardRef(PermissionExpandGrid);
