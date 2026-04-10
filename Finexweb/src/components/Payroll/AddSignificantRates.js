import { Button } from "@progress/kendo-react-buttons";
import { Form, FormElement, Field } from "@progress/kendo-react-form";
import { FormInput } from "../form-components";
import { useNavigate, useLocation } from "react-router-dom";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React from "react";

import { useState } from "react";
import { useCallback } from "react";

const mockRateData = [
  {
    id: 1,
    name: "Mary Lisa",
    stateDate: "Lorem Ipsum",
    endDate: "09/25/2023",
    salaryInformation: "1200 $",
    more: "More",
  },
];

export default function AddSignificantRates() {
  const navigate = useNavigate();

  const location = useLocation();
  const setInitValue = useCallback(() => {
    const dataa = location?.state;
    if (dataa?.action == "edit") {
      const targetEmployee = mockRateData.find(
        (employee) => employee.id == dataa?.id
      );

      return targetEmployee;
    }
  }, [location?.state]);

  const [formInit,] = useState(setInitValue);
  const [selectedNavigation, setSelectedNavigation] = React.useState(1);

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
      default:
        break;
    }
  };

  const handleSubmit = () => { };

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
            Add Significant Rates
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Add Significant Rate</h1>
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
                    id={"hoursWorked"}
                    name={"hoursWorked"}
                    label={"Hours worked*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"hoursPaid"}
                    name={"hoursPaid"}
                    label={"Hours Paid*"}
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
                    id={"overtimeRate"}
                    name={"overtimeRate"}
                    label={"Overtime Rate*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"holidayRate"}
                    name={"holidayRate"}
                    label={"Holiday Rate*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"vacationRate"}
                    name={"vacationRate"}
                    label={"Vacation Rate*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"vacationLimit"}
                    name={"vacationLimit"}
                    label={"Vacation Limit*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"sickTimeRate"}
                    name={"sickTimeRate"}
                    label={"Sick Time Rate*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"sickTimeLimit"}
                    name={"sickTimeLimit"}
                    label={"Sick Time Limit*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"personalRate"}
                    name={"personalRate"}
                    label={"Personal Rate*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"personalLimit"}
                    name={"personalLimit"}
                    label={"Personal Limit*"}
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
                  />
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"maxVacationGive"}
                    name={"maxVacationGive"}
                    label={"Max Vacation*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"vacationRateYears"}
                    name={"vacationRateYears"}
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
