import { getter } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { getSelectedState, Grid, GridColumn } from "@progress/kendo-react-grid";
import { eyeIcon, trashIcon } from "@progress/kendo-svg-icons";
import React, { useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { payrollEndpoints } from "../../../EndPoints";
import { CheckBoxCell } from "../../cells/CheckBoxCell";
import {
  ColumnFormCurrencyTextBox,
  ColumnFormTextArea,
} from "../../form-components";

const PayrollExpandRow = ({
  data,
  setRow,
  toggleDialog,
  handlePREmployeeDistributionData,
  selectedState,
  setSelectedState,
  setCACId,
  selectedRowId,
  setSelectedPayrollExpandData,
  handleCall,
  getPREmployeeList,
  datePaid,
  PayrollToatals,
  checkPrivialgeGroup,
  rowIndexData,
  setRowIndexData,
  deleteVisible,
  setDeleteVisible
}) => {
  const [, setSelectedRowData] = useState(null);
 
  const editField = "inEdit";
  
  const enterEdit = (dataItem) => {
    setRow(dataItem);
    toggleDialog();
    setSelectedPayrollExpandData(dataItem);
  };

  const remove = () => {
    axiosInstance({
      method: "delete",
      url: payrollEndpoints.PayrollTotals + "/" + rowIndexData?.payId,
      withCredentials: false,
    })
      .then((response) => {
        setRowIndexData({});
        setDeleteVisible(false)
        getPREmployeeList(datePaid, "", "", "", "", "", true, "", rowIndexData?.empId)
        PayrollToatals(datePaid, rowIndexData?.empId, rowIndexData?.cac)
      })
      .catch(() => { });
  };

  const itemChange = (event) => {};

  const CommandCell = (props) => {
    return (
      <>
        <td className="k-command-cell">
          <Button
            themeColor="primary"
            onClick={() => enterEdit(props.dataItem)}
            svgIcon={eyeIcon}
          ></Button>
          <Button
            svgIcon={trashIcon}
            onClick={() => {
              setDeleteVisible(true)
              setRowIndexData(props.dataItem);
            }}
          ></Button>
        </td>
      </>
    );
  };

  const toggleDeleteDialog = (dataItem) => {
    setDeleteVisible(!deleteVisible);
    setSelectedRowData(dataItem);
  };

  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);

  const onSelectionChange = React.useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
        const tmpData = data.find(
          (item) => item.id == parseInt(Object.keys(newSelectedState)[0])
        );
        setSelectedState(newSelectedState);
        handlePREmployeeDistributionData({
          selected: "selected",
          key: tmpData.jobDescriptionId,
          selectedRowId: selectedRowId,
        });
        setCACId(tmpData.cac);
        handleCall({ cacId: tmpData.cac, empId: tmpData.empId });
      } else {
        handlePREmployeeDistributionData({});

        setSelectedState({});
      }
    },
    [selectedState]
  );
  return (
    <>
      {data && Object.keys(data).length > 0 ? (
        <Grid
          data={data.map((item) => ({
            ...item,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          dataItemKey={"id"}
          editField={editField}
          onItemChange={itemChange}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "multiple",
          }}
          onSelectionChange={onSelectionChange}
          // scrollable="scrollable"
          // style={{
          //   height: "18vh",
          // }}
        >
          <GridColumn field="jobName" title="Job" />
          <GridColumn field="accountingCode" title="CAC" />
          <GridColumn field="ihac" title="IHAC" />
          <GridColumn field="sac" title="SAC" />
          <GridColumn field="payrollTotals.prSalary" title="Salary" />
          <GridColumn
            field="gross"
            title="Gross Pay"
            format="{0:c2}"
            headerCell={(props) => {
              return (
                <span className="k-cell-inner">
                  <span className="k-link !k-cursor-default d-flex justify-content-end">
                    <span className="k-column-title">{props.title}</span>
                    {props.children}
                  </span>
                </span>
              );
            }}
            cell={ColumnFormCurrencyTextBox}
          />
          <GridColumn field="nots" title="Notes" cell={ColumnFormTextArea} />
          <GridColumn
            field="primaryJob"
            title="Primary Jobs"
            cell={(props) => <CheckBoxCell {...props} showText="true" />}
          />
          {checkPrivialgeGroup("PRPCC", 3) && <GridColumn cell={CommandCell} width="150px" filterable={false} />}
        </Grid>
      ) : (
        <p style={{ textAlign: "center" }}>No Records Available</p>
      )}
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
};

export default PayrollExpandRow;
