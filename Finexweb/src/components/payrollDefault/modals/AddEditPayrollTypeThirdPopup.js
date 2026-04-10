import { toString as kendoToString } from "@progress/kendo-intl";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { payrollEndpoints } from "../../../EndPoints";
import { ColumnFormNumericTextBox } from "../../form-components";

function AddEditPayrollTypeThirdPopup({ data, onClose, setData, payrollGridDataList }) {
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [gridData, setGridData] = useState(data);
  const [lastChangeValue, setLastChangeValue] = useState();
  const [changeType, setChangeType] = useState("");

  const timeRef = React.useRef(null);

  const [key, ] = useState(0);
  const remove = () => {
    let newGridData = gridData.filter((item) => item.id !== selectedId);
    let newData = data.filter((item) => item.id !== selectedId);
    setData(newData);
    setGridData(newGridData);
    toggleDeleteDialog();
  };

  const itemChange = (event) => {
    setChangeType(event.field);
    if (event.value != null && !isNaN(event.value)) {
      const newData = gridData.map((item) =>
        item.id == event.dataItem.id
          ? {
            ...item,
            [event.field || ""]: event.value || 0,
          }
          : item
      );

      const tmpData = gridData.find((item) => item.id == event.dataItem.id);

      tmpData[event.field || ""] = event.value;
      clearTimeout(timeRef.current);
      timeRef.current = setTimeout(() => {
        setData(newData);
        setLastChangeValue(tmpData);
      }, 1000);
    }
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      if (lastChangeValue) {
        handleSaveData();
      }
    }, 300);

    return () => clearTimeout(getData);
  }, [lastChangeValue]);

  const toggleDeleteDialog = (dataItem) => {
    setDeleteVisible(!deleteVisible);
    setSelectedId(selectedId ? null : dataItem.id);
  };

  const handleSaveData = () => {
    if (lastChangeValue && payrollGridDataList) {
      axiosInstance({
        method: "POST",
        url:
          payrollEndpoints.CalcHoursAndDollars +
          `?type=${lastChangeValue.type}` +
          `&inputHrs=${lastChangeValue.hours}` +
          `&inputAmt=${lastChangeValue?.amount || 0}` +
          `&isAmtUpdate=${changeType == 'amount'}` +
          `&datePaid=${kendoToString(payrollGridDataList.prDatePaid, "MM/dd/yyyy").split("T")[0]}` +
          `&PayPeriodStart=${kendoToString(payrollGridDataList.prStartDate, "MM/dd/yyyy").split("T")[0]}` +
          `&PayPeriodEnd=${kendoToString(payrollGridDataList.prEndDate, "MM/dd/yyyy").split("T")[0]}` +
          `&EmpId=${payrollGridDataList.empId}` +
          `&jobDescriptionId=${payrollGridDataList.jobDescriptionId}`,
      })
        .then((response) => {
          setData(gridData);
          onClose();
        })
        .catch((e) => {
          console.log(e, "error");
        });
    }
  };

  return (
    <>
      <Dialog
        width={700}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <span className="ms-2">Add/Edit</span>
          </div>
        }
        onClose={onClose}
      >
        <div className="d-flex justify-content align-items-end mb-3 mt-3">
          <Grid
            data={gridData}
            dataItemKey={"id"}
            onItemChange={itemChange}
            key={key}
          >
            <GridColumn field="type" title="Type" />
            <GridColumn
              field="hours"
              title="Hours"
              cell={ColumnFormNumericTextBox}
            />
          </Grid>
        </div>
        <div className="d-flex justify-content-end align-items-center gap-2">
          <Button
            className="k-button k-button-lg k-rounded-lg"
            themeColor={"primary"}
            style={{ height: "70%" }}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </Dialog>

      {deleteVisible && (
        <Dialog
          title={<span>Please confirm</span>}
          onClose={toggleDeleteDialog}
        >
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure you want to Delete?
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={toggleDeleteDialog}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={remove}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
}

export default AddEditPayrollTypeThirdPopup;
