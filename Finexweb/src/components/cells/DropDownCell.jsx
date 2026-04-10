import * as React from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
const categoryData = [
  {
    categoryID: 1,
    categoryName: "Beverages",
  },
  {
    categoryID: 2,
    categoryName: "Condiments",
  },
  {
    categoryID: 6,
    categoryName: "Meat/Poultry",
  },
  {
    categoryID: 7,
    categoryName: "Produce",
  },
  {
    categoryID: 8,
    categoryName: "Seafood",
  },
];

function DropDownCell(props) {
  if (props.rowType == "groupHeader") return null;

  let fieldComplex = props.field.split(".");

  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: fieldComplex[0],
        syntheticEvent: e.syntheticEvent,
        value: e.value,
      });
    }
  };

  const { dataItem } = props;
  const dataValue =
    dataItem[fieldComplex[0]] == null ||
    dataItem[fieldComplex[0]][fieldComplex[1]] == null
      ? ""
      : dataItem[fieldComplex[0]][fieldComplex[1]];

  return (
    <td>
      {dataItem.inEdit ? (
        <DropDownList
          style={{ width: "100%" }}
          onChange={handleChange}
          value={dataItem[fieldComplex[0]]}
          data={categoryData.sort((a, b) => {
            const isANumber = /^\d/.test(a[fieldComplex[1]]);
            const isBNumber = /^\d/.test(b[fieldComplex[1]]);

            if (isANumber && !isBNumber) return -1;
            if (!isANumber && isBNumber) return 1;

            return a[fieldComplex[1]].localeCompare(b[fieldComplex[1]]);
          })}
          textField={fieldComplex[1]}
          defaultItem={{ categoryID: 0, categoryName: "Choose Category" }}
        />
      ) : (
        dataValue.toString()
      )}
    </td>
  );
}

export default DropDownCell;
