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
  FormNumericTextBox
} from "../form-components";
import {
  showSuccessNotification
} from "../NotificationHandler/NotificationHandler";
import {
  numbersOnlyValidator
} from "../validators";

export const RoundingForm = ({ formInit }) => {
  const handleSubmit = (dataItem) => {
    const init = formInit && formInit[0] ? formInit[0] : {};
    const data = {
      id: dataItem.id,
      orgAccountId: 0,
      defaultOtRates: dataItem.defaultOtRates,
      defaultHolidsayRate: init.defaultHolidsayRate,
      defaultVacationRate: 0,
      defaultVacationLimit: 0,
      defaultSickRate: init.defaultSickRate,
      defaultSickLimit: init.defaultSickLimit,
      defaultPersonal: 0,
      defaultCheck: true,
      overTime: true,
      payrollStartDate: init.payrollStartDate,
      firstPayDay: init.firstPayDay,
      vacaRounding: dataItem.vacaRounding,
      dateDiffStartPay: 0,
      firstand3rd: true,
      roundHourly: dataItem.roundHourly,
      roundBiWeekly: dataItem.roundBiWeekly,
      firstPay: true,
      secondPay: true,
      lastPay: true,
      minHrs: 0,
      perFiscalYear: true,
      perStart: "2024-02-07T23:42:05.321Z",
      perEnd: "2024-02-07T23:42:05.321Z",
      annDays: dataItem.annDays,
      stepDays: dataItem.stepDays,
      certDays: dataItem.certDays,
      secondand3rd: true,
      compearnedat15: true,
      firstand2nd: true,
      holidaySchedule1Name: "",
      holidaySchedule2Name: "",
      vacaSickLimitByRate: true,
      compTimeEarnedRate: init.compTimeEarnedRate,
      dutyFreeLunch: true,
      lunchMinutes: "s",
      minPersonalTime: init.minPersonalTime,
      minVacaTime: init.minVacaTime,
      minSickTime: init.minSickTime,
      numYearsMaxVacaccural: init.numYearsMaxVacaccural,
      minCompTime: init.minCompTime,
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
        onSubmit={handleSubmit}
        initialValues={formInit?.[0]}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <div onKeyDown={(e) => e.stopPropagation()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 20,
                  }}
                >
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    flexDirection: "column",
                  }}
                >
                  <Field
                    id={"vacaRounding"}
                    name={"vacaRounding"}
                    label={"Vaca Rounding*"}
                    component={FormNumericTextBox}
                    style={{ width: "29.5vw" }}
                    validator={numbersOnlyValidator}
                    spinners={false}
                  />

                  <Field
                    id={"roundBiWeekly"}
                    name={"roundBiWeekly"}
                    label={"Bi-Weekly Salary*"}
                    component={FormNumericTextBox}
                    spinners={false}
                    style={{ width: "29.5vw" }}
                    validator={numbersOnlyValidator}
                  />
                  <Field
                    id={"roundHourly"}
                    name={"roundHourly"}
                    label={"Hourly Rate*"}
                    component={FormNumericTextBox}
                    spinners={false}
                    style={{ width: "29.5vw" }}
                    validator={numbersOnlyValidator}
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
