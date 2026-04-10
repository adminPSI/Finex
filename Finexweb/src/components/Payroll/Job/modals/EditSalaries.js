import { Dialog } from "@progress/kendo-react-dialogs";
import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Form, FormElement, Field } from "@progress/kendo-react-form";
import {
  FormInput,
  FormDatePicker,
  FormTextArea,
} from "../../../form-components";

export const EditSalaries = ({ setEditSalariesMenuOpen }) => {
  // eslint-disable-next-line no-unused-vars
  const [formInit, setFormInit] = useState();

  const closeMenuHandler = () => {
    setEditSalariesMenuOpen(false);
  };

  const handleSubmit = () => {};
  return (
    <Dialog
      width={900}
      title={
        <i className="fa-solid fa-right-left d-flex justify-content-center">
          Add/Edit Salaries
        </i>
      }
      onClose={closeMenuHandler}
    >
      <Form
        onSubmit={handleSubmit}
        initialValues={formInit}
        render={(formRenderProps) => (
          <div>
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"employeeName"}
                    name={"employeeName"}
                    label={"Employee Name or ID*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"startDate"}
                    name={"startDate"}
                    label={"Start Date*"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"endDate"}
                    name={"endDate"}
                    label={"End Date*"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"jobDescription"}
                    name={"jobDescription"}
                    label={"Primary Job Description*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"positionStartDate"}
                    name={"positionStartDate"}
                    label={"Current Postion Start Date*"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"range"}
                    name={"range"}
                    label={"Range*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"longevity"}
                    name={"longevity"}
                    label={"Longevity*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"step"}
                    name={"step"}
                    label={"Step*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"contractDays"}
                    name={"contractDays"}
                    label={"Contract Days*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"paidHolidays"}
                    name={"paidHolidays"}
                    label={"Paid Holidays**"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"hoursPerDay"}
                    name={"hoursPerDay"}
                    label={"Hours per Day*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"hourlyRate"}
                    name={"hourlyRate"}
                    label={"Hourly Rate*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"personalStartDate"}
                    name={"personalStartDate"}
                    label={"Personal Start Date*"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"payEndDate"}
                    name={"payEndDate"}
                    label={"Personal Year End*"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"fundName"}
                    name={"fundName"}
                    label={"Description"}
                    placeholder={
                      "Based on the title given by the auditors office"
                    }
                    component={FormTextArea}
                    style={{
                      width: "18.5vw",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: 40,
                    gap: 20,
                  }}
                >
                  <Button
                    className="k-button k-button-sm k-rounded-lg k-w-full k-button-expanded-payroll-submit k-button-expanded-payroll-cancel"
                    themeColor={"bootstrap"}
                    type={"button"}
                    onClick={closeMenuHandler}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                    themeColor={"primary"}
                    disabled={!formRenderProps.allowSubmit}
                    type={"submit"}
                  >
                    Submit
                  </Button>
                </div>
              </fieldset>
            </FormElement>
          </div>
        )}
      />
    </Dialog>
  );
};
