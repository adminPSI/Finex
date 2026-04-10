import * as React from "react";
import { DatePicker } from "@progress/kendo-react-dateinputs";

const CustomDatePicker = ({ onChange, onKeyUp, ...rest }) => {
  const datepickerRef = React.useRef(null);

  setTimeout(function () {
    if (datepickerRef.current) {
      const inptElement = datepickerRef.current.element;
      inptElement.addEventListener("keyup", onKeyUp);
      return () => {
        inptElement.removeEventListener("keyup", onKeyUp);
      };
    }
  }, 500);
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };
  return (
    <DatePicker
      ref={datepickerRef}
      onChange={handleChange}
      {...rest}
    ></DatePicker>
  );
};

export const DatePickerCell = (props) => {
  var compareDate = "MM/DD/YYYY";

  const handleOnChange = (e) => {
    if (props.onChange) {
      props.onChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value,
      });
    }
  };
  const handleOnKeyUp = (e) => {
    const value = e.target.value;
    const month = value.split("/")[0];
    const day = value.split("/")[1];
    const year = value.split("/")[2];
    const cmpmonth = compareDate.split("/")[0];
    const cmpday = compareDate.split("/")[1];
    const cmpyear = compareDate.split("/")[2];
    var Ischange = false;
    if (value !== compareDate) {
      if (year == cmpyear) {
        if (month !== cmpmonth) {
          if (!isNaN(month) && month >= 1 && month <= 12 && month !== "01") {
            if (
              (month.slice(1) !== cmpmonth.slice(1) &&
                month.slice(-1) !== cmpmonth.slice(-1)) ||
              (cmpmonth !== month && month == "11")
            ) {
              e.target.setSelectionRange(3, 5);
              Ischange = true;
            }
          } else if (cmpmonth == "0" && month == "01") {
            e.target.setSelectionRange(3, 5);
            Ischange = true;
          }
        }
        if (day !== cmpday && Ischange == false) {
          if (
            !isNaN(day) &&
            day >= 1 &&
            day <= 31 &&
            day !== "01" &&
            day !== "02" &&
            day !== "03"
          ) {
            if (
              (cmpday.slice(1) !== day.slice(1) &&
                cmpday.slice(-1) !== day.slice(-1)) ||
              day == "11" ||
              day == "22"
            ) {
              e.target.setSelectionRange(6, 10);
            }
          } else if (
            cmpday == "0" &&
            (day == "01" || day !== "02" || day !== "03")
          ) {
            e.target.setSelectionRange(6, 10);
          }
        }
      }
    }
    compareDate = value;
  };
  let data = props.dataItem;
  var myDate = data.date ? data.date.toISOString() : null;
  if (!data.inEdit) {
    const [year, month, day] = myDate.split("T")[0].split("-");
    return <td>{`${month}/${day}/${year} `}</td>;
  } else {
    return (
      <td>
        <div className={"k-form-field-wrap"}>
          <CustomDatePicker
            name="date"
            size="small"
            format="MM/dd/yyyy"
            formatPlaceholder={{ year: "YYYY", month: "MM", day: "DD" }}
            onChange={handleOnChange}
            value={props.dataItem.date}
            onKeyUp={handleOnKeyUp}
          ></CustomDatePicker>
        </div>
      </td>
    );
  }
};
