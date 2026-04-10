import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  ExpansionPanelContent
} from "@progress/kendo-react-layout";
import React from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { PayrollEndPoints } from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import {
  FormDatePicker,
  FormNumericTextBox
} from "../form-components";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import {
  applyLeaveStartDateValidator,
  firstPayDayValidator,
  numberWithDotValidator
} from "../validators";

export const DefaultsForm = ({ formInit, setRecallApi }) => {
  const init = formInit && formInit[0] ? formInit[0] : {};
  const handleSubmit = (dataItem) => {
    const data = {
      id: dataItem.id,
      orgAccountId: 0,
      defaultOtRates: dataItem.defaultOtRates,
      defaultHolidsayRate: dataItem.defaultHolidsayRate,
      defaultVacationRate: 0,
      defaultVacationLimit: 0,
      defaultSickRate: dataItem.defaultSickRate,
      defaultSickLimit: dataItem.defaultSickLimit,
      defaultPersonal: 0,
      defaultCheck: true,
      overTime: true,
      payrollStartDate: dataItem.payrollStartDate,
      firstPayDay: dataItem.firstPayDay,
      vacaRounding: init.vacaRounding,
      dateDiffStartPay: 0,
      firstand3rd: true,
      roundHourly: 0,
      roundBiWeekly: init.roundBiWeekly,
      firstPay: true,
      secondPay: true,
      lastPay: true,
      minHrs: 0,
      perFiscalYear: true,
      perStart: "2024-02-07T23:42:05.321Z",
      perEnd: "2024-02-07T23:42:05.321Z",
      annDays: init.annDays,
      stepDays: init.stepDays,
      certDays: init.certDays,
      secondand3rd: true,
      compearnedat15: true,
      firstand2nd: true,
      holidaySchedule1Name: "",
      holidaySchedule2Name: "",
      vacaSickLimitByRate: true,
      compTimeEarnedRate: dataItem.compTimeEarnedRate,
      dutyFreeLunch: true,
      lunchMinutes: "s",
      minPersonalTime: dataItem.minPersonalTime,
      minVacaTime: dataItem.minVacaTime,
      minSickTime: dataItem.minSickTime,
      numYearsMaxVacaccural: dataItem.numYearsMaxVacaccural,
      minCompTime: dataItem.minCompTime,
    };

    axiosInstance({
      method: dataItem.id ? "PUT" : "POST",
      url: dataItem.id
        ? `${PayrollEndPoints.Defaults}/${dataItem.id}`
        : `${PayrollEndPoints.Defaults}`,
      data: data,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Success");
        setRecallApi(1 + 1);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollOrganizationDataSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <ExpansionPanelContent>
      <Form
        initialValues={formInit?.[0]}
        onSubmit={handleSubmit}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <div onKeyDown={(e) => e.stopPropagation()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",

                    gap: "20px",
                  }}
                >
                  <Field
                    id={"defaultOtRates"}
                    name={"defaultOtRates"}
                    label={"Overtime Rate*"}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    spinners={false}
                    wrapperstyle={{
                      width: "35%",
                    }}
                    validator={numberWithDotValidator}
                  />
                  <Field
                    id={"defaultHolidsayRate"}
                    name={"defaultHolidsayRate"}
                    label={"Holiday Rate*"}
                    validator={numberWithDotValidator}
                    spinners={false}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",

                    gap: "20px",
                  }}
                >
                  <Field
                    id={"defaultSickRate"}
                    name={"defaultSickRate"}
                    validator={numberWithDotValidator}
                    spinners={false}
                    label={"Sick Time Rate*"}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />

                  <Field
                    id={"compTimeEarnedRate"}
                    name={"compTimeEarnedRate"}
                    label={"Comp Time Earned Rate"}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    spinners={false}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",

                    gap: "20px",
                  }}
                >
                  <Field
                    id={"defaultSickLimit"}
                    name={"defaultSickLimit"}
                    label={"Sick Time Limit"}
                    spinners={false}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"numYearsMaxVacaccural"}
                    name={"numYearsMaxVacaccural"}
                    label={"Number of Years Max Vaca Accrual"}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                    spinners={false}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",

                    gap: "20px",
                  }}
                >
                  <Field
                    id={"payrollStartDate"}
                    name={"payrollStartDate"}
                    label={"Payroll Start Date*"}
                    wrapperstyle={{
                      width: "35%",
                    }}
                    validator={applyLeaveStartDateValidator}
                    component={FormDatePicker}
                    disabled={(init.payrollStartDate !== null && init.payrollStartDate !== undefined)}
                  />
                  <Field
                    id={"firstPayDay"}
                    name={"firstPayDay"}
                    label={"First Pay Day*"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "35%",
                    }}
                    validator={firstPayDayValidator}
                    disabled={(init?.firstPayDay !== null && init?.firstPayDay !== undefined)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",

                    gap: "20px",
                  }}
                >
                  <Field
                    id={"minSickTime"}
                    name={"minSickTime"}
                    label={"Min Sick(minutes)"}
                    spinners={false}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"minVacaTime"}
                    name={"minVacaTime"}
                    label={"Min Vaca(minutes)"}
                    spinners={false}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",

                    gap: "20px",
                  }}
                >
                  <Field
                    id={"minPersonalTime"}
                    name={"minPersonalTime"}
                    label={"Min Personal(minutes)"}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    spinners={false}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                  <Field
                    id={"minCompTime"}
                    name={"minCompTime"}
                    label={"Min Comp(minutes)"}
                    component={FormNumericTextBox}
                    format={{ style: "decimal", maximumFractionDigits: 4 }}
                    spinners={false}
                    wrapperstyle={{
                      width: "35%",
                    }}
                  />
                </div>
              </div>

              {checkPrivialgeGroup("PRDB", 3) && <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 40,
                  gap: 20,
                }}
              >
                <Button
                  className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                  themeColor={"primary"}
                  type={"submit"}
                >
                  Submit
                </Button>
              </div>}
            </fieldset>
          </FormElement>
        )}
      />
    </ExpansionPanelContent>
  );
};
