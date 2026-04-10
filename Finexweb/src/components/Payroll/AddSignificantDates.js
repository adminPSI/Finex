import { Button } from "@progress/kendo-react-buttons";
import { Form, FormElement, Field } from "@progress/kendo-react-form";
import { FormInput, FormDatePicker } from "../form-components";
import { useNavigate, useLocation } from "react-router-dom";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React from "react";
import { useCallback, useState } from "react";

const mockDateData = [
  {
    id: 1,
    employeeName: "Mary Lisa",
    dateHired: new Date("2023-11-29T13:00:00"),
    fullTimeHired: new Date("2023-11-29T13:00:00"),
    rehireDate: new Date("2023-11-29T13:00:00"),
    employeeStep: new Date("2023-11-29T13:00:00"),
    lastDayWorked: new Date("2023-11-29T13:00:00"),
  },
  {
    id: 2,
    employeeName: "Mar Lisa",
    dateHired: new Date("2023-11-29T13:00:00"),
    fullTimeHired: new Date("2023-11-29T13:00:00"),
    rehireDate: new Date("2023-11-29T13:00:00"),
    employeeStep: new Date("2023-11-29T13:00:00"),
    lastDayWorked: new Date("2023-11-29T13:00:00"),
  },
];

export default function AddSignificantDates() {
  const navigate = useNavigate();
  const handleSubmit = () => {};
  const location = useLocation();
  const setInitValue = useCallback(() => {
    const dataa = location?.state;
    if (dataa?.action == "edit") {
      const targetEmployee = mockDateData.find(
        (employee) => employee.id == dataa?.id
      );
      return targetEmployee;
    }
  }, [location?.state]);

  const [selectedNavigation, setSelectedNavigation] = React.useState(2);
  const handleSelectNavigation = (e) => {
    setSelectedNavigation(e.selected);

    switch (e.selected) {
      case 0:
        navigate("/PayrollAddNewEmployee");
        break;
      case 1:
        navigate("/payroll/add-significant-rates");
        break;
      case 2:
        navigate("/payroll/add-significant-dates");
        break;
    }
  };

  const [formInit, ] = useState(setInitValue);

  const handleCancelClick = () => {
    navigate("/payroll/significant-rates");
  };
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Employee Info
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Add Significant Dates
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Add Significant Date</h1>
        </div>
      </div>

      <TabStrip
        style={{ boxShadow: "none" }}
        tabContentStyle={{ display: "none" }}
        className="app-tab"
        selected={selectedNavigation}
        onSelect={handleSelectNavigation}
      >
        <TabStripTab title="Employee Info"></TabStripTab>
        <TabStripTab title="Significant Rates"></TabStripTab>
        <TabStripTab title="Significant Dates"></TabStripTab>
      </TabStrip>

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
                    id={"dateHired"}
                    name={"dateHired"}
                    label={"Date Hired*"}
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
                    id={"fullTimeHired"}
                    name={"fullTimeHired"}
                    label={"Full-Time Hire Date*"}
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
                    id={"lastDayWorked"}
                    name={"lastDayWorked"}
                    label={"Last Day Worked*"}
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
                    id={"yearsOfService"}
                    name={"yearsOfService"}
                    label={"Years of Service*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"anniversaryDate"}
                    name={"anniversaryDate"}
                    label={"Anniversary Date*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"stepDate"}
                    name={"stepDate"}
                    label={"Employee Step Date*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"rehireDate"}
                    name={"rehireDate"}
                    label={"Rehire Date*"}
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
                    id={"evaluationDate"}
                    name={"evaluationDate"}
                    label={"Evaluation Date*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"signingDate"}
                    name={"signingDate"}
                    label={"Evaluation Signing Date*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"evalNoticeSentDate"}
                    name={"evalNoticeSentDate"}
                    label={"Eval Notice Sent Date*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"vacationRateYears"}
                    name={"vacationRateYears"}
                    label={"Vacation Rate Years*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                    type={"hidden"}
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
