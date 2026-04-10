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

export const EditContractPopup = ({
  setEditContractPopupVisible,
  id,
  dataFilter,
  setcontractYear,
}) => {
  const {
    selectedStartDate,
    endDateError,
    resetDatesFun,
  } = useStartEndDateValidatorForSingle();

  const closeMenuHandler = () => {
    resetDatesFun();
    setEditContractPopupVisible(false);
  };

  const handleSubmit = (dataItem) => {
    const data = {
      id: id,
      empYrStart: dataItem.empYrStart ? dataItem.empYrStart : null,
      empYrEnd: dataItem.empYrEnd ? dataItem.empYrEnd : null,
      months: dataItem.months,
    };
    axiosInstance({
      method: "PUT",
      url: PayrollEndPoints.UpdateYearDeleteById.replace("#ID#", id),
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
            let data = response.data.map((item) => item.benefitsName);
            setcontractYear(response.data);
          })
          .catch((e) => {
            console.log(e, "error");
          });
        setEditContractPopupVisible(false);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };

  useEffect(() => {
  }, [setEditContractPopupVisible]);
  return (
    <Dialog
      width={500}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-right-left "></i>{" "}
          <span className="ms-2">Update Contract Years</span>
        </div>
      }
      onClose={closeMenuHandler}
    >
      <Form
        onSubmit={handleSubmit}
        initialValues={{
          empYrStart: new Date(dataFilter?.empYrStart),
          empYrEnd: new Date(dataFilter?.empYrEnd),
          months: dataFilter?.months,
        }}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"empYrStart"}
                name={"empYrStart"}
                label={"Contract Start Year*"}
                component={FormDatePicker}
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
                  Update
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
};
