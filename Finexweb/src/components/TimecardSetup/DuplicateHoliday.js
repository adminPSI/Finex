import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import {
  Field,
  FieldWrapper,
  Form,
  FormElement,
} from "@progress/kendo-react-form";
import { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { HolidayEndPoints } from "../../EndPoints";
import { FormDropDownList, FormInput } from "../form-components";
import { scheduleNameValidator, yearValidator } from "../validators";

export default function DuplicateHoliday(props) {
  const [holidayYearList, setHolidayYearList] = useState([]);
  const [holidayScheduleList, setHolidayScheduleList] = useState([]);
  const [holidayYear, setHolidayYear] = useState("Year");
  const [yearToDuplicate, setYearToDuplicate] = useState("");
  const [holidayScheduleHeader, setHolidayScheduleHeader] = useState({
    holidayScheduleName: "Schedule",
  });

  useEffect(() => {
    setHolidayYearList(props.holidayYear);
  }, [props.holidayYear]);

  const handleHolidayYear = (event) => {
    setHolidayYear(event.target.value);

    setHolidayScheduleHeader({});
    getHolidayScheduleHeader(event.target.value);
  };

  const handleHolidayScheduleHeader = (event) => {
    setHolidayScheduleHeader(event.target.value);
  };

  const handleYearTo = (event) => {
    setYearToDuplicate(event.target.value);
  };

  const CloneHolidaySchedule = (data) => {
    axiosInstance({
      method: "POST",
      url:
        HolidayEndPoints.HolidayScheduleClone +
        `?holidayScheduleHeaderId=${holidayScheduleHeader.id}&toYear=${yearToDuplicate}`,
      withCredentials: false,
    })
      .then((response) => {
        props.handleDuplicate(holidayYear);
        props.toggleDialog();
      })
      .catch(() => {});
  };

  const getHolidayScheduleHeader = (year) => {
    axiosInstance({
      method: "GET",
      url: HolidayEndPoints.HolidaySchedule + "/ByYear/?year=" + year,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setHolidayScheduleList(data);
      })
      .catch(() => {});
  };
  return (
    <Dialog
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-plus"></i>
          <span className="ms-2">Clone Holiday Schedule</span>
        </div>
      }
      onClose={props.toggleDialog}
    >
      <Form
        onSubmit={CloneHolidaySchedule}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <FieldWrapper>
                <div className={"d-flex"}>
                  <div className={"w-100 pe-2"}>
                    <div className={"k-form-field-wrap"}>
                      <Field
                        id={"Yearfrom"}
                        name={"Yearfrom"}
                        label={"Year from*"}
                        wrapperstyle={{ width: "100%" }}
                        data={holidayYearList}
                        value={holidayYear}
                        onChange={handleHolidayYear}
                        component={FormDropDownList}
                        validator={yearValidator}
                      />
                    </div>
                  </div>
                  <div className={"w-100"}>
                    <div className={"k-form-field-wrap"}>
                      <Field
                        name={"YearTo"}
                        type={"YearTo"}
                        component={FormInput}
                        label={"Year to*"}
                        value={yearToDuplicate}
                        validator={yearValidator}
                        onChange={handleYearTo}
                      />
                    </div>
                  </div>
                </div>
              </FieldWrapper>

              <FieldWrapper>
                <Field
                  id={"holidayScheduleName"}
                  name={"holidayScheduleName"}
                  label={"Name of Holiday Schedule*"}
                  wrapperstyle={{ width: "100%" }}
                  data={holidayScheduleList}
                  value={holidayScheduleHeader}
                  textField="holidayScheduleName"
                  dataItemKey="id"
                  onChange={handleHolidayScheduleHeader}
                  component={FormDropDownList}
                  validator={scheduleNameValidator}
                />
              </FieldWrapper>
              <div className="k-form-buttons">
                <Button
                  className="k-button k-button-lg k-rounded-lg k-w-full"
                  themeColor={"primary"}
                  type="submit"
                >
                  Duplicate Schedule
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
}
