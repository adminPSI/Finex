import { toString as kendoToString } from "@progress/kendo-intl";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import { payrollEndpoints } from "../../../EndPoints";
import axiosInstance from "../../../core/HttpInterceptor";
import { ColumnFormNumericTextBox } from "../../form-components";

function AddEditPayrollTypeSecondPopup({
  data,
  onClose,
  setData,
  handlePayrollTotalDetail,
  payrollGridDataList,
  getPREmployeeList,
  datePaid,
  payrollGridData,
  PayrollToatals
}) {
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [gridData, setGridData] = useState(data);
  const timeRef = React.useRef(null);
  const [changeType, setChangeType] = useState("");
  const [dataKey, setDataKey] = useState(0);
  const [lastChangeValue, setLastChangeValue] = useState();
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
      const tmpData = gridData.find((item) => item.id == event.dataItem.id);

      tmpData[event.field || ""] = event.value;

      clearTimeout(timeRef.current);
      timeRef.current = setTimeout(() => {
        setLastChangeValue(tmpData);
      }, 1000);
    }
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      if (lastChangeValue) {
        BindGrid();
      }
    }, 300);

    return () => clearTimeout(getData);
  }, [lastChangeValue]);

  const BindGrid = async () => {
    if (lastChangeValue && payrollGridDataList) {
      axiosInstance({
        method: "POST",
        url:
          payrollEndpoints.CalcHoursAndDollars +
          `?type=${lastChangeValue.type}` +
          `&inputHrs=${lastChangeValue.hours}` +
          `&inputAmt=${gridData?.amount || 0}` +
          `&isAmtUpdate=${changeType == 'amount'}` +
          `&datePaid=${kendoToString(payrollGridDataList.prDatePaid, "MM/dd/yyyy").split("T")[0]}` +
          `&PayPeriodStart=${kendoToString(payrollGridDataList.prStartDate, "MM/dd/yyyy").split("T")[0]}` +
          `&PayPeriodEnd=${kendoToString(payrollGridDataList.prEndDate, "MM/dd/yyyy").split("T")[0]}` +
          `&EmpId=${payrollGridDataList.empId}` +
          `&jobDescriptionId=${payrollGridDataList.jobDescriptionId}`,
      })
        .then((response) => {
          const data = gridData.map((item) => {
            return {
              ...item,
              amount:
                item.id == gridData.id && item.id !== 8
                  ? response.data.CalulatedAmt
                  : item.amount,
            };
          });
          const res = data.map((item) => {
            return {
              ...item,
              amount: item.id == 8 ? response.data.TotalAmt : item.amount,
              hours: item.id == 8 ? response.data.TotalHr : item.hours,
            };
          });

          const findRecord = payrollGridData.filter(el => el?.expanded)
          setGridData(res);
          setData(gridData);
          getPREmployeeList(datePaid, "", "", "", "", "", true, "", findRecord[0]?.id)
          PayrollToatals(datePaid, findRecord[0]?.id, findRecord[0]?.payrollTotalDistributions[0].cac)
          handlePayrollTotalDetail(gridData);
          setDataKey(dataKey + 1);
        })
        .catch(() => { });
    }
  };

  const toggleDeleteDialog = (dataItem) => {
    setDeleteVisible(!deleteVisible);
    setSelectedId(selectedId ? null : dataItem.id);
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

export default AddEditPayrollTypeSecondPopup;
