import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import axiosInstance from "../../../core/HttpInterceptor";
import { PayrollEndPoints } from "../../../EndPoints";
import { useStartEndDateValidatorForSingle } from "../../../helper/useStartEndDateValidatorForSingle";
import { FormDatePicker, FormNumericTextBox } from "../../form-components";
import {
  applyLeaveEndDateValidator,
  numbersOnlyValidator,
  startDateValidator,
} from "../../validators";
import { useEffect } from "react";

export const AddContractPopup = ({
  setContractPopupVisible,
  setcontractYear,
}) => {
  const {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
    resetDatesFun,
  } = useStartEndDateValidatorForSingle();

  const closeMenuHandler = () => {
    resetDatesFun();
    setContractPopupVisible(false);
  };

  const handleSubmit = (dataItem) => {
    const data = {
      id: 0,
      empYrStart: dataItem.empYrStart ? dataItem.empYrStart : null,
      empYrEnd: dataItem.empYrEnd ? dataItem.empYrEnd : null,
      months: dataItem.months,
    };

    axiosInstance({
      method: "POST",
      url: PayrollEndPoints.ContractYears,
      data: data,
      withCredentials: false,
    })
      .then((response) => {
        axiosInstance({
          method: "GET",
          url: PayrollEndPoints.ContractYears,
          withCredentials: false,
        })
          .then((response) => {
            setcontractYear(response.data);
          })
          .catch((e) => {
            console.log(e, "error");
          });
        setContractPopupVisible(false);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };

  const updateStartDate = (formRenderProps) =>
    updateStartDateFun({ formRenderProps, enddate: selectedEndDate });
  const updateEndDate = (formRenderProps) =>
    updateEndDateFun({ formRenderProps, startdate: selectedStartDate });

  useEffect(() => {
  }, [setContractPopupVisible]);

  return (
    <Dialog
      width={500}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-right-left "></i>{" "}
          <span className="ms-2">Add Contract</span>
        </div>
      }
      onClose={closeMenuHandler}
    >
      <Form
        onSubmit={handleSubmit}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"empYrStart"}
                name={"empYrStart"}
                label={"Contract Start Year*"}
                component={FormDatePicker}
                onChange={updateStartDate}
                value={selectedStartDate}
                wrapperstyle={{
                  width: "100%",
                }}
                validator={startDateValidator}
              />
              <div>
                <Field
                  id={"empYrEnd"}
                  name={"empYrEnd"}
                  label={"Contract End Year*"}
                  component={FormDatePicker}
                  onChange={updateEndDate}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  validator={applyLeaveEndDateValidator}
                />
                {endDateError && (
                  <p
                    className="text-danger mb-0 p-0"
                    style={{ fontSize: "12px" }}
                  >
                    {endDateError}
                  </p>
                )}
                <Field
                  id={"months"}
                  name={"months"}
                  label={"Months*"}
                  component={FormNumericTextBox}
                  spinners={false}
                  validator={numbersOnlyValidator}
                />
              </div>

              <div className="k-form-buttons">
                <Button
                  themeColor={"primary"}
                  className={"col-12"}
                  type={"submit"}
                  disabled={
                    !formRenderProps.allowSubmit ||
                    endDateError ||
                    !formRenderProps.valid
                  }
                >
                  Add Contract Years
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
};
