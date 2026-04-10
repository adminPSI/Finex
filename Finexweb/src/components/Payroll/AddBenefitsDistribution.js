import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStartEndDatevalidator } from "../../helper/useStartEndDataValidator";
import { FormDatePicker, FormInput, FormTextArea } from "../form-components";

const mockBenefitsDistributionData = [
  {
    id: 1,
    benefits: "Dental Insurance",
    startDate: new Date("2023-11-29T13:00:00"),
    endDate: new Date("2024-12-29T13:00:00"),
    percent: "1.4000%",
    amount: "$22.74",
    countryExpense: "B50 11A 082 00",
    ihas: "IHAC",
  },
  {
    id: 2,
    benefits: "Denal Insurance",
    startDate: new Date("2023-11-29T13:00:00"),
    endDate: new Date("2024-12-29T13:00:00"),
    percent: "1.4000%",
    amount: "$22.74",
    countryExpense: "B50 11A 082 00",
    ihas: "06 15 0001 0014",
  },
];

export default function AddBenefitsDistribution() {
  const {
    endDateError,
    updateEndDateFun,
    selectedStartDate,
    updateStartDateFun,
  } = useStartEndDatevalidator();

  const navigate = useNavigate();

  const location = useLocation();
  const setInitValue = useCallback(() => {
    const dataa = location?.state;
    if (dataa?.action == "edit") {
      const targetDistribution = mockBenefitsDistributionData.find(
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

  const updateEndDate = (e) => updateEndDateFun(e);
  const updateStartDate = (e) => updateStartDateFun(e);

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Benefits
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Benefits Distribution
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Benefits Distribution</h1>
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
                    id={"startDate"}
                    name={"startDate"}
                    label={"Start Date*"}
                    component={FormDatePicker}
                    onChange={updateStartDate}
                    value={selectedStartDate}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <div style={{ width: "35%" }}>
                    <Field
                      id={"endDate"}
                      name={"endDate"}
                      label={"End Date*"}
                      component={FormDatePicker}
                      onChange={updateEndDate}
                      wrapperstyle={{}}
                    />

                    {endDateError && (
                      <p
                        className="text-danger mb-0 p-0"
                        style={{ fontSize: "12px" }}
                      >
                        {endDateError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"countryCode"}
                    name={"countryCode"}
                    label={"County Account Code*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"houseAccountCode"}
                    name={"houseAccountCode"}
                    label={"In House Account Code"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"amount"}
                    name={"amount"}
                    label={"Amount*"}
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

                <div className="d-flex justify-content-center">
                  <Field
                    id={"memo"}
                    name={"memo"}
                    label={"Memo"}
                    component={FormTextArea}
                    style={{
                      width: "62vw",
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
                    disabled={!formRenderProps.allowSubmit || endDateError}
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
