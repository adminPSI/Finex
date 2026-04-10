import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
} from "../form-components";

import { useState } from "react";

const mockDistributionData = [
  {
    id: 1,
    jobDescription: "Dir/Therapy Serv",
    startDate: new Date("2023-11-29T13:00:00"),
    endDate: new Date("2024-12-29T13:00:00"),
    hourlyRate: "$125.00",
    percentHours: "100.000%",
    countryCode: "080 0100 510000",
    accountCode: "75 01 04",
    houseAccountCode: "30 33 1001 0000",
    supervisor: "Hhontz, Shannon",
  },
  {
    id: 2,
    jobDescription: "Dir/Therapy ",
    startDate: new Date("2023-11-29T13:00:00"),
    endDate: new Date("2024-12-29T13:00:00"),
    hourlyRate: "$125.00",
    percentHours: "100.000%",
    countryCode: "080 0100 510000",
    accountCode: "75 01 04",
    houseAccountCode: "30 33 1001 0000",
    supervisor: "Hhontz, Shannon",
  },
];

export default function AddPayDistribution() {
  const navigate = useNavigate();

  const location = useLocation();
  const setInitValue = useCallback(() => {
    const dataa = location?.state;
    if (dataa?.action == "edit") {
      const targetDistribution = mockDistributionData.find(
        (distribution) => distribution.id == dataa?.id
      );
      return targetDistribution;
    }
  }, [location?.state]);

  const [formInit, ] = useState(setInitValue);

  const handleSubmit = () => {};

  const handleCancelClick = () => {
    navigate("/payroll/benefits");
  };
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Pay
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Pay Distribution
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Pay Distribution</h1>
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
                    id={"ssn"}
                    name={"ssn"}
                    label={"SSN*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"employeeNumber"}
                    name={"employeeNumber"}
                    label={"Employee No*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
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
                    label={"Job Description"}
                    dataItemKey="id"
                    component={FormDropDownList}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"houseAccountCode"}
                    name={"houseAccountCode"}
                    label={"In House Account Code*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"countryAccountCode"}
                    name={"countryAccountCode"}
                    label={"Country Account Code*"}
                    dataItemKey="id"
                    component={FormDropDownList}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"supervisor"}
                    name={"supervisor"}
                    label={"Supervisor*"}
                    dataItemKey="id"
                    component={FormDropDownList}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"accountCode"}
                    name={"accountCode"}
                    label={"State Account Code*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"department"}
                    name={"department"}
                    label={"Department*"}
                    dataItemKey="id"
                    component={FormDropDownList}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"hourlyRate"}
                    name={"hourlyRate"}
                    label={"Hourly Rate*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"percentHours"}
                    name={"percentHours"}
                    label={"Percent / Hours*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"costCountry"}
                    name={"costCountry"}
                    label={"Cost County*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"shiftDateStart"}
                    name={"shiftDateStart"}
                    label={"Shift Date Start*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"shiftDateEnd"}
                    name={"shiftDateEnd"}
                    label={"Shift Date End*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"vacationStartDate"}
                    name={"vacationStartDate"}
                    label={"Vacation Start Date*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
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
