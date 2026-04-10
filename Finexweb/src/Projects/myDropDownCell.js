import * as React from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
export const DropDownCell = (props) => {
  const localizedData = [
    {
      id: 2,
      orG_ID: 7,
      workType: "Type1",
      createdBy: 1,
      createdDate: "2023-09-25T14:27:12.8",
      modifiedBy: 1,
      modifiedDate: "2023-09-25T14:27:12.8",
    },
    {
      id: 3,
      orG_ID: 7,
      workType: "Type2",
      createdBy: 1,
      createdDate: "2023-09-25T14:33:48.423",
      modifiedBy: 1,
      modifiedDate: "2023-09-25T14:33:48.423",
    },
  ];
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value.id,
      });
    }
  };
  const { dataItem } = props;
  const field = props.field || "";
  const dataValue = dataItem[field] == null ? "" : dataItem[field];
  return (
    <td>
      {dataItem.inEdit ? (
        <DropDownList
          style={{
            width: "100px",
          }}
          onChange={handleChange}
          dataItemKey="id"
          value={localizedData.find((c) => c.id == dataValue)}
          data={localizedData}
          textField="workType"
        />
      ) : (
        localizedData.find((c) => c.id == dataValue)?.workType
      )}
    </td>
  );
};
