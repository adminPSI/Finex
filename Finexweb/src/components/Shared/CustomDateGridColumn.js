import React from "react";

export const CustomDateGridColumn = (props) => {
  const [year, month, day] = props.dataItem?.[props.field]
    ? props.dataItem?.[props.field].split("T")[0].split("-")
    : [null, null, null];
  return (
    <td>{props.dataItem?.[props.field] ? `${month}/${day}/${year}` : null}</td>
  );
};
