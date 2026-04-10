import { formatDate } from "@progress/kendo-intl";
import Constants from "./Constants";

export const getCountyExpenseAmountType = (typeCode) => {
  let type = "";
  switch (typeCode) {
    case 3:
      type = Constants.CountyExpenseAmountTypeCode.Allocation.title;
      break;
    case 4:
      type = Constants.CountyExpenseAmountTypeCode.Transfer.title;
      break;
    case 5:
      type = Constants.CountyExpenseAmountTypeCode.Carryover.title;
        break;
    case 12:
        type = Constants.IHACExpenseAmountTypeCode.Allocation.title;
        break;
    case 13:
        type = Constants.IHACExpenseAmountTypeCode.Transfer.title;
        break;
    case 14:
        type = Constants.IHACExpenseAmountTypeCode.Carryover.title;
        break;
    case 32:
      type = Constants.CountyExpenseAmountTypeCode.AnticipatedRevenue.title;
      break;
    default:
      break;
  }
  return type;
};

export const handleDropdownSearch = (
  data = [],
  searchField = [],
  search = ""
) => {
  const result = data.filter((item) =>
    searchField.some((field) => {
      const value = item[field];
      if (Array.isArray(value)) {
        return value.some((element) =>
          element.toLowerCase().include(search.trim().toLocaleLowerCase())
        );
      }
      return (
        typeof value == "string" &&
        value.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      );
    })
  );
  return result;
};

export const myCustomFormateDateCell = (props) => {
  var myDate = props.dataItem[props.field];
  if (myDate) {
    return <td>{formatDate(new Date(myDate), "MM/dd/yyyy hh:mm a")}</td>;
  } else {
    return <td></td>;
  }
};
