import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import axiosInstance from "../../core/HttpInterceptor";
import { HolidayEndPoints } from "../../EndPoints";
import { FormInput } from "../form-components";
import { scheduleNameValidator } from "../validators";

export default function AddNewHolidaySchedule(props) {
  const AddHolidaySchedule = (dataItem) => {
    let holidayData = {
      organizationId: 7,
      year: dataItem.holidayYear,
      holidayScheduleName: dataItem.holidayScheduleName,
    };
    axiosInstance({
      method: "POST",
      url: HolidayEndPoints.HolidaySchedule,
      data: holidayData,
      withCredentials: false,
    })
      .then((response) => {
        props.holidaySchedule();
        props.toggleDialog();
        props.getHolidayYear();
      })
      .catch(() => {});
  };

  return (
    <Dialog
      title={"Add New Holiday Schedule"}
      onClose={props.toggleDialog}
      width={500}
    >
      <Form
        onSubmit={AddHolidaySchedule}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"holidayYear"}
                type="number"
                name={"holidayYear"}
                label={"Year of Holiday Schedule*"}
                placeholder={""}
                validator={(value) => {
                  if (value) {
                    if (value <= 0) {
                      return "Year should be in positive digits";
                    }
                    if (value.length !== 4) {
                      return "Year should be in four digits";
                    }
                  } else {
                    return "Year is required.";
                  }
                }}
                component={FormInput}
              />
              <Field
                id={"holidayScheduleName"}
                name={"holidayScheduleName"}
                label={"Name of Holiday Schedule*"}
                placeholder={""}
                validator={scheduleNameValidator}
                component={FormInput}
              />
              <div className="k-form-buttons">
                <Button
                  className="k-button k-button-lg k-rounded-lg k-w-full"
                  themeColor={"primary"}
                  disabled={!formRenderProps.allowSubmit}
                  type={"submit"}
                >
                  Add Schedule
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
}
