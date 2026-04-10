import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { StartingBalanceEndPoints } from "../../../EndPoints";
import { useStartEndDateValidatorForSingle } from "../../../helper/useStartEndDateValidatorForSingle";
import { FormDatePicker, FormNumericTextBox } from "../../form-components";
import { showSuccessNotification } from "../../NotificationHandler/NotificationHandler";
import { startDateValidator } from "../../validators";

const AddEditStartingBalance = ({
  handleShowAddEditStartingBalancePopup,
  selectedEmployeeId,
  startingBalancedata,
  selectedRowId,
  getStartingBalanceData,
}) => {
  const {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
    resetDatesFun,
  } = useStartEndDateValidatorForSingle();

  const [formInit, setFormInit] = useState({});
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (selectedRowId) {
      const data = startingBalancedata.find((item) => item.id == selectedRowId);
      if (data) {
        setFormInit({
          ...data,
          startDate: new Date(data.date),
          endDate: data.endDate ? new Date(data.endDate) : null,
        });
        setFormKey(formKey + 1);
      }
    }
  }, [selectedRowId, startingBalancedata]);

  const formHandleSubmit = (dataItem) => {
    let apiRequest = {
      id: parseInt(selectedRowId) || 0,
      date: dataItem?.startDate,
      endDate: dataItem?.endDate,
      personalBalance: dataItem?.personalBalance,
      vacBal: dataItem?.vacBal,
      sickBal: dataItem?.sickBal,
      compBal: dataItem?.compBal,
      empId: selectedEmployeeId || null,
    };
    if (selectedRowId) {
      axiosInstance({
        method: "PUT",
        url:
          StartingBalanceEndPoints.PreYearStartingBalance + `/${selectedRowId}`,
        data: apiRequest,
        withCredentials: false,
      })
        .then((response) => {
          showSuccessNotification("Starting balance updated successfully");
          handleShowAddEditStartingBalancePopup();
          getStartingBalanceData();
          resetDatesFun();
        })
        .catch(() => { })
        .finally(() => { });
    } else {
      axiosInstance({
        method: "POST",
        url: StartingBalanceEndPoints.PreYearStartingBalance,
        data: apiRequest,
        withCredentials: false,
      })
        .then((response) => {
          showSuccessNotification("Starting balance added successfully");
          handleShowAddEditStartingBalancePopup();
          getStartingBalanceData();
          resetDatesFun();
        })
        .catch(() => { })
        .finally(() => { });
    }
  };

  const updateStartDate = (formRenderProps) =>
    updateStartDateFun({
      formRenderProps,
      enddate: formInit?.endDate || selectedEndDate,
    });
  const updateEndDate = (formRenderProps) =>
    updateEndDateFun({
      formRenderProps,
      startdate: formInit?.startDate || selectedStartDate,
    });

  return (
    <div>
      <Dialog
        width={650}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-right-left"></i>
            <span className="ms-2">
              {selectedRowId ? "Edi" : "Add"} Starting Balance
            </span>
          </div>
        }
        onClose={handleShowAddEditStartingBalancePopup}
      >
        <Form
          onSubmit={formHandleSubmit}
          initialValues={formInit}
          key={formKey}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"startDate"}
                    name={"startDate"}
                    label={"Start Date*"}
                    component={FormDatePicker}
                    onChange={updateStartDate}
                    validator={startDateValidator}
                    value={selectedStartDate}
                    wrapperstyle={{
                      width: "100%",
                      marginRight: "10px",
                    }}
                  />
                  <div style={{ width: "100%" }}>
                    <Field
                      id={"endDate"}
                      name={"endDate"}
                      label={"End Date"}
                      component={FormDatePicker}
                      onChange={updateEndDate}
                      wrapperstyle={{
                        width: "100%",
                      }}
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
                <Field
                  id={"vacBal"}
                  name={"vacBal"}
                  label={"Vacation Balance"}

                  placeholder={"Enter Vacation Balance"}
                  component={FormNumericTextBox}

                  step={0}
                  min={0}
                  spinners={false}
                />
                <Field
                  id={"sickBal"}
                  name={"sickBal"}
                  label={"Sick Balance"}

                  placeholder={"Enter Sick Balance"}
                  component={FormNumericTextBox}

                  step={0}
                  min={0}
                  spinners={false}
                />
                <Field
                  id={"personalBalance"}
                  name={"personalBalance"}
                  label={"Personal Balance"}

                  placeholder={"Enter Personal Balance"}
                  component={FormNumericTextBox}

                  step={0}
                  min={0}
                  spinners={false}
                />
                <Field
                  id={"compBal"}
                  name={"compBal"}
                  label={"Comp Balance"}

                  placeholder={"Enter Comp Balance"}
                  component={FormNumericTextBox}

                  step={0}
                  min={0}
                  spinners={false}
                />

                <div className="k-form-buttons">
                  <Button
                    themeColor={"primary"}
                    className={"col-12"}
                    type={"submit"}
                    disabled={!formRenderProps.allowSubmit || endDateError}
                  >
                    {selectedRowId ? "Update" : "Add"}
                  </Button>
                </div>
              </fieldset>
            </FormElement>
          )}
        />
      </Dialog>
    </div>
  );
};

export default AddEditStartingBalance;
