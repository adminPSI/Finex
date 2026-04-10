
import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStartEndDatevalidator } from "../../helper/useStartEndDataValidator";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormTextArea,
} from "../form-components";
const mockBalancesData = [
  {
    id: 1,

    startDate: new Date("2023-12-29T13:00:00"),
    endDate: new Date("2024-12-29T13:00:00"),
    vacationBalance: "000",
    sickBalance: "273",
    personalBalance: "000",
    compBalance: "000",
  },
  {
    id: 2,

    startDate: new Date("2023-11-29T13:00:00"),
    endDate: new Date("2024-12-29T13:00:00"),
    vacationBalance: "000",
    sickBalance: "273",
    personalBalance: "000",
    compBalance: "000",
  },
];

export default function AddNewBalances() {
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
      const targetBalances = mockBalancesData.find(
        (distribution) => distribution.id == dataa?.id
      );

      return targetBalances;
    }
  }, [location?.state]);

  const [formInit, ] = useState(setInitValue);

  const handleSubmit = () => {};

  const handleCancelClick = () => {
    navigate("/payroll/starting-balances");
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
            Benefits Balances
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Benefits Balances</h1>
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
                    id={"sichBalance"}
                    name={"sichBalance"}
                    label={"Sick Hours*"}
                    dataItemKey="id"
                    component={FormDropDownList}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"vacationBalance"}
                    name={"vacationBalance"}
                    label={"Vacation*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Field
                    id={"personalBalance"}
                    name={"personalBalance"}
                    label={"Personal*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"compBalance"}
                    name={"compBalance"}
                    label={"Comp Hours*"}
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
