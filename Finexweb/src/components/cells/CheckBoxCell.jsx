import * as React from "react";
import { Checkbox } from "@progress/kendo-react-inputs";

export const CheckBoxCell = (props) => {
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        dataIndex: props.dataIndex,
        dataItem: props.dataItem,
        field: props.field,
        value: e.value,
      });
    }
  };

  const { dataItem, showText } = props; 
  const field = props.field || "";
  let dataValue = dataItem[field] == null ? "" : dataItem[field];
  if (dataItem[field] == "Y" || dataItem[field] == true) {
    dataValue = true;
  } else if (dataItem[field] == "N" || dataItem[field] == false) {
    dataValue = false;
  } else {
    dataValue = false;
  }

  if (props.rowType == "groupHeader") {
    return null;
  }
  return (
    <td>
      <div className="d-flex justify-content-start">
        {dataItem.inEdit ? (
          <>
            <Checkbox checked={dataValue} onChange={handleChange} />
            {showText && (
              <span className="ms-1">{dataValue ? "Yes" : "No"}</span>
            )}
          </>
        ) : (
          <>
            <Checkbox checked={dataValue} disabled={true} />
            <span className="ms-1">{dataValue ? "Yes" : "No"}</span>
          </>
        )}
      </div>
    </td>
  );
};
