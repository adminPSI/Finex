import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FormDatePicker, FormInput, FormTextArea } from "../form-components";

const mockSalariesData = [
  {
    id: 1,
    startDate: new Date("2023-11-29T13:00:00"),
    endDate: new Date("2024-12-29T13:00:00"),
    jobDescription: "Facilities Manager",
    salary: "$46,786.00",
    payDaySalary: "$1,760.46",
    personalStartDate: new Date("2023-12-29T13:00:00"),
    payEndDate: new Date("2024-12-29T13:00:00"),
    hourlyRate: "$24,2700",
  },
  {
    id: 2,
    startDate: new Date("2023-11-29T13:00:00"),
    endDate: new Date("2024-12-29T13:00:00"),
    jobDescription: "Manager",
    salary: "$46,786.00",
    payDaySalary: "$1,760.46",
    personalStartDate: new Date("2023-12-29T13:00:00"),
    payEndDate: new Date("2024-12-29T13:00:00"),
    hourlyRate: "$24,2700",
  },
];

export default function AddSalaries() {
  const navigate = useNavigate();
  const handleSubmit = () => {};
  const handleCancelClick = () => {
    navigate("/payroll/significant-rates");
  };

  const location = useLocation();
  const setInitValue = useCallback(() => {
    const dataa = location?.state;
    if (dataa?.action == "edit") {
      const targetEmployee = mockSalariesData.find(
        (employee) => employee.id == dataa?.id
      );

      return targetEmployee;
    }
  }, [location?.state]);

  const [formInit, ] = useState(setInitValue);
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Salaries
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Salaries
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3"></div>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Salaries</h1>
        </div>
      </div>
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
                    format="MM/dd/yyyy"
                    formatPlaceholder={{
                      year: "YYYY",
                      month: "MM",
                      day: "DD",
                    }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"endDate"}
                    name={"endDate"}
                    label={"End Date*"}
                    format="MM/dd/yyyy"
                    formatPlaceholder={{
                      year: "YYYY",
                      month: "MM",
                      day: "DD",
                    }}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"jobDescription"}
                    name={"jobDescription"}
                    label={"Primary Job Description*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"positionStartDate"}
                    name={"positionStartDate"}
                    label={"Current Postion Start Date*"}
                    format="MM/dd/yyyy"
                    formatPlaceholder={{
                      year: "YYYY",
                      month: "MM",
                      day: "DD",
                    }}
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
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"contractDays"}
                    name={"contractDays"}
                    label={"Contract Days*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"paidHolidays"}
                    name={"paidHolidays"}
                    label={"Paid Holidays**"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
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
                    format="MM/dd/yyyy"
                    formatPlaceholder={{
                      year: "YYYY",
                      month: "MM",
                      day: "DD",
                    }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"payEndDate"}
                    name={"payEndDate"}
                    label={"Personal Year End*"}
                    component={FormDatePicker}
                    format="MM/dd/yyyy"
                    formatPlaceholder={{
                      year: "YYYY",
                      month: "MM",
                      day: "DD",
                    }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-center ">
                  <Field
                    id={"fundName"}
                    name={"fundName"}
                    label={"Description"}
                    placeholder={
                      "Based on the title given by the auditors office"
                    }
                    component={FormTextArea}
                    style={{
                      width: "60vw",
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
                    onClick={handleCancelClick}
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
    </>
  );
}
