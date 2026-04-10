import * as React from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
export const DropDownCell = (props, dropdownItem) => {
  const dropdownList = dropdownItem || [];

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
  let dataValue = dataItem[field] == null ? "" : dataItem[field];
  return (
    <td>
      {dataItem.inEdit ? (
        <DropDownList
          onChange={handleChange}
          popupSettings={{ width: "auto" }}
          dataItemKey="id"
          value={dropdownList.find((c) => c.id == dataValue)}
          data={dropdownList.sort((a, b) => {
            const isANumber = /^\d/.test(a["type"]);
            const isBNumber = /^\d/.test(b["type"]);

            if (isANumber && !isBNumber) return -1;
            if (!isANumber && isBNumber) return 1;

            return a["type"].localeCompare(b["type"]);
          })}
          textField="type"
        />
      ) : (
        dropdownList.find((c) => c.id == dataValue)?.type || ""
      )}
    </td>
  );
};
