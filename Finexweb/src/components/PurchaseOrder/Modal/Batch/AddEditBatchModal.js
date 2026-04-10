import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useMemo, useState } from "react";
import axiosInstance from "../../../../core/HttpInterceptor";
import { BatchEndPoints } from "../../../../EndPoints";
import { FormDatePicker } from "../../../form-components";
import {
  startDateValidator
} from "../../../validators";

export const AddEditBatchModal = ({
  closeBatch,
  BindDataGrid,
  setShowAddEditBatch,
  addEditBatchData,
  setNewBatchData,
  setShowBatchVoucher,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [endDateError, setEndDateError] = useState("");

  const initialState = useMemo(() => {
    if (addEditBatchData) {
      return {
        startDate: addEditBatchData.startDate
          ? new Date(addEditBatchData.startDate)
          : null,
        endDate: addEditBatchData.startDate
          ? new Date(addEditBatchData.endDate)
          : null,
      };
    }
    return {
      startDate: null,
      endDate: null,
    };
  }, [addEditBatchData]);

  const postBatchHandleSubmit = async (dataItem) => {
    setLoading(true);
    let startDate = new Date(dataItem?.startDate);
    const startyear = startDate.getFullYear();
    const startmonth = String(startDate.getMonth() + 1).padStart(2, "0");
    const startday = String(startDate.getDate()).padStart(2, "0");
    const formaStartDate = `${startyear}-${startmonth}-${startday}`;

    let endDate = new Date(dataItem?.endDate);
    const endyear = endDate.getFullYear();
    const endmonth = String(endDate.getMonth() + 1).padStart(2, "0");
    const endday = String(endDate.getDate()).padStart(2, "0");
    const formatStartDate = `${endyear}-${endmonth}-${endday}`;

    let req = {
      startDate: formaStartDate,
      endDate: formatStartDate,
    };
    let url = `/`;
    let method = "POST";
    let data = req;

    await axiosInstance({
      method,
      url: BatchEndPoints.PostORUpdateBatch + url,
      withCredentials: false,
      data,
    })
      .then((response) => {
        BindDataGrid();
        setNewBatchData({ date: data, batchData: response.data });
        setShowAddEditBatch(false);
        setShowBatchVoucher(true);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        closeBatch();
      });
  };

  const updateStartDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedStartDate(date.toString());
    localEndDateValidator({ startdate: dateformat });
  };

  const localEndDateValidator = ({ enddate, startdate }) => {
    const startDate = new Date(startdate ?? selectedStartDate);
    const endDate = new Date(enddate ?? selectedEndDate);
    if (!startDate) {
      setEndDateError("Please select start date first");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setEndDateError("End date should be greater than start date");
    } else {
      setEndDateError("");
    }
  };

  const updateEndDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedEndDate(date.toString());
    localEndDateValidator({ enddate: dateformat });
  };

  return (
    <Dialog
      width={600}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-plus"></i>
          <span className="ms-2">Add Batch </span>
        </div>
      }
      onClose={closeBatch}
    >
      <Form
        onSubmit={postBatchHandleSubmit}
        initialValues={initialState}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <div>
                <Field
                  id={"startDate"}
                  name={"startDate"}
                  label={"Start Date*"}
                  component={FormDatePicker}
                  validator={startDateValidator}
                  onChange={updateStartDate}
                  value={selectedStartDate}
                />
                <div>
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

              <div className="k-form-buttons">
                <Button
                  className={"col-5 me-2"}
                  type={"button"}
                  onClick={closeBatch}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  themeColor={"primary"}
                  className={"col-5"}
                  type={"submit"}
                  disabled={
                    loading || !formRenderProps.allowSubmit || endDateError
                  }
                >
                  Create Batch
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
};
