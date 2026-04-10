import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import axiosInstance from "../../../core/HttpInterceptor";
import { PayrollEndPoints } from "../../../EndPoints";
import { FormNumericTextBox } from "../../form-components";
import {
  numbersOnlyValidator,
  numbersOnlyValidatorNotRequired,
  numbersWithDecimalValidator
} from "../../validators";

export const AddVacationPopup = ({ setVacationPopupVisible, setData }) => {
  const closeMenuHandler = () => {
    setVacationPopupVisible(false);
  };

  const handleSubmit = (dataItem) => {
    const data = {
      id: 0,
      orgAccountId: 0,
      yearsWorkedStart: +dataItem.yearsWorkedStart,
      yearsWorkedEnd: +dataItem.yearsWorkedEnd,
      vacationRate: dataItem.vacationRate,
      vacationLimit: dataItem.vacationLimit,
      maxAccrual: dataItem.maxAccrual,
      lumpsum: dataItem.lumpsum,
      vacation: 0,
    };
    axiosInstance({
      method: "POST",
      url: PayrollEndPoints.Vacation,
      data: data,
      withCredentials: false,
    })
      .then(async (response) => {
        const result = await axiosInstance({
          method: "GET",
          url: PayrollEndPoints.Vacation,
          withCredentials: false,
        });

        setData(() => {
          const newState = result?.data;
          newState.forEach((element) => {
            if (element) {
              element.modifiedDate = new Date(element.modifiedDate);
            }
          });

          return newState;
        });
        setVacationPopupVisible(false);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };

  return (
    <Dialog
      width={500}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-right-left "></i>{" "}
          <span className="ms-2">Add Vacation Rate</span>
        </div>
      }
      onClose={closeMenuHandler}
    >
      <Form
        onSubmit={handleSubmit}
        render={(formRenderProps) => {
          const { value, onChange } = formRenderProps;
          return (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                 <Field
                  id={"yearsWorkedStart"}
                  name={"yearsWorkedStart"}
                  label={"Years Start*"}
                  textField="text"
                  dataItemKey="id"
                  component={FormNumericTextBox}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  format="#"
                  validator={numbersOnlyValidator}
                  spinners={false}
                />
                <Field
                  id={"yearsWorkedEnd"}
                  name={"yearsWorkedEnd"}
                  label={"Years End*"}
                  textField="text"
                  dataItemKey="id"
                  component={FormNumericTextBox}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  format="#"
                  validator={numbersOnlyValidator}
                  spinners={false}
                />
                <Field
                  id={"vacationRate"}
                  name={"vacationRate"}
                  label={"Vacation Rate*"}
                  textField="text"
                  dataItemKey="id"
                  validator={numbersWithDecimalValidator}
                  component={FormNumericTextBox}
                  spinners={false}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  format="0.#####"
                />
                <Field
                  id={"vacationLimit"}
                  name={"vacationLimit"}
                  label={"Vacation Limit*"}
                  validator={numbersWithDecimalValidator}
                  component={FormNumericTextBox}
                  dataItemKey="id"
                  spinners={false}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  format="0.#####"
                />

                <Field
                  id={"lumpsum"}
                  name={"lumpsum"}
                  label={"Weeks Given"}
                  validator={numbersOnlyValidatorNotRequired}
                  dataItemKey="id"
                  component={FormNumericTextBox}
                  spinners={false}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  format="#"
                />

                <Field
                  id={"maxAccrual"}
                  name={"maxAccrual"}
                  label={"Max Accrual"}
                  validator={numbersOnlyValidatorNotRequired}
                  dataItemKey="id"
                  component={FormNumericTextBox}
                  spinners={false}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  format="#"
                /> 

                <div className="k-form-buttons">
                  <Button
                    themeColor={"primary"}
                    className={"col-12"}
                    type={"submit"}
                    disabled={!formRenderProps.allowSubmit}
                  >
                    Add Vacation Rate
                  </Button>
                </div>
              </fieldset>
            </FormElement>
          );
        }}
      />
    </Dialog>
  );
};
