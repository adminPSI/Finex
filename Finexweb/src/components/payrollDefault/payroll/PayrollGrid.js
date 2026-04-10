import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";

import { toString as kendoToString } from "@progress/kendo-intl";
import { ColumnFormCurrencyTextBox } from "../../form-components";
import AddEmployeePopup from "../modals/AddEmployeePopup";
import AddPayrollExpandPopup from "../modals/AddPayrollExpandPopup";
import PayrollExpandRow from "../payroll/PayrollExpandRow";
import PayrollEmployeeHistory from "./PayrollEmployeeHistoryModal";
import PayrollGridContextMenu from "./PayrollGridContextMenu";

const PayrollGrid = ({
  setBindDataGrid,
  bindDataGrid,
  setPayrollGridData,
  datePaid,
  payrollGridData,
  PREmployeeDistributions,
  PayrollToatals,
  payrollTotalsData,
  setPayrollGridDataList,
  getEmployeeData,
  getPREmployeeList,
  employeePayrollDistribution,
  setEmployeePayrollDistribution,
  checkPrivialgeGroup
}) => {
  const [isExpand, setIsExpand] = useState()
  const [employeePopupHistoryVisible, setEmployeePopupHistoryVisible] =
    useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [, setSearchText] = useState("");
  const [filter, setFilter] = useState();
  const [openEmployeeDia, setOpenEmployeeDia] = useState(false);
  const [selectedPayrollExpandData, setSelectedPayrollExpandData] = useState(
    {}
  );
  const [rowIndexData, setRowIndexData] = useState({});
  const initialSort = [
    {
      field: "lastName",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const [show, setShow] = React.useState(false);
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, seSelectedRowId] = React.useState(0);
  const [selectedState, setSelectedState] = React.useState({});
  const [CACId, setCACId] = React.useState("");

  const [employeeId, setEmployeeId] = useState(null);
  const viewEmployeeHistoryPopup = (props) => {
    setEmployeeId(props && props.dataItem ? props.dataItem.id : null);
    setEmployeePopupHistoryVisible(!employeePopupHistoryVisible);
  };

  const MoreFilter = () => {
    setShowFilter(!showFilter);
  };

  const onCheckBox = () => {
    setColumnShow(!columnShow);
  };

  const filterData = (e) => {
    let value = e.target.value;
    setSearchText(value);
    setBindDataGrid({
      cSkip: 0,
      cTake: 10,
      search: value,
    });
  };

  const filterChange = (event) => {
    var groupNumber = "";
    var employeeNumber = "";
    var employeeName = "";
    var total = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "groupNumber") {
          groupNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "employeeNumber") {
          employeeNumber = event.filter.filters[i].value;
        }

        if (event.filter.filters[i].field == "firstName") {
          employeeName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "lastName") {
          employeeName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "total") {
          total = event.filter.filters[i].value;
        }
      }
    }
    setBindDataGrid({
      ...bindDataGrid,
      groupNumber,
      employeeNumber,
      employeeName,
      total,
      search: undefined,
      cSkip: 0,
      cTake: 10,
    });
    setFilter(event.filter);
  };

  const DATA_ITEM_KEY = "id";
  const onRowClick = (dataClick) => {
    setPayrollGridDataList([]);
    const { dataItem } = dataClick;
    setPayrollGridData(
      payrollGridData.map((item) => {
        if (item.id == dataItem.id) {
          return {
            ...item,
            expanded: !item.expanded,
          };
        }
        return {
          ...item,
          expanded: false,
        };
      })
    );
    seSelectedRowId(dataItem.id);
    setEmployeePayrollDistribution(dataItem.payrollTotalDistributions);
    if (
      dataItem.payrollTotalDistributions &&
      dataItem.payrollTotalDistributions.length
    ) {
      const primary = dataItem.payrollTotalDistributions.find(
        (item) => item.primaryJob
      );

      if (primary) {
        setSelectedState({ [primary.id]: true });

        handlePREmployeeDistributionData({
          selected: "selected",
          key: primary.jobDescriptionId,
          selectedRowId: primary.empId,
        });
        setEmployeeId(primary.empId);
        handleCall({ cacId: primary.cac, empId: primary.empId });
        setCACId(primary.cac);
      } else setSelectedState({});
    }
    setEmployeeId(dataItem.id);
  };

  const expandChange = (event) => {
    setIsExpand(event)
    let newData = payrollGridData.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setPayrollGridData(newData);
    seSelectedRowId(event.dataItem.id);
    setEmployeePayrollDistribution(event.dataItem.payrollTotalDistributions);
    if (
      event.dataItem.payrollTotalDistributions &&
      event.dataItem.payrollTotalDistributions.length
    ) {
      const primary = event.dataItem.payrollTotalDistributions.find(
        (item) => item.primaryJob
      );

      if (primary) {
        setSelectedState({ [primary.id]: true });

        handlePREmployeeDistributionData({
          selected: "selected",
          key: primary.jobDescriptionId,
          selectedRowId: primary.empId,
        });
        setCACId(primary.cac);
      } else setSelectedState({});
    }
    event.dataItem.expanded = event.value;
    setPayrollGridData([...payrollGridData]);
    setEmployeeId(event.dataItem.id);
    if (!event.value || event.dataItem.amountDetails) {
      return;
    }
  };

  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "desc" ? true : false;
    let sortColumn = sortDetail?.field ? sortDetail.field : "lastName";
    setBindDataGrid({
      ...bindDataGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  //close ContextMenu for fund Grid
  const handleCloseMenu = () => {
    setShow(false);
    seSelectedRowId(0);
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedEmployee, setselectedEmployee] = useState(null);

  const [empId, setEmpId] = useState(null);

  const toggleDialog = (props) => {
    if (props && props.id) {
      setEmpId(+props.id);
    }
    setOpenDialog(!openDialog);
    if (openDialog) {
      setSelectedRowData(null);
    }
  };

  //Event for Select ContextMenu Item of Grid Data
  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "employeeHistory":
          viewEmployeeHistoryPopup();
          break;
        case "add":
          toggleDialog();
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const toggleEmployeeDialog = (props) => {
    setselectedEmployee(props?.id ? props : null);
    setOpenEmployeeDia(!openEmployeeDia);
  };

  const handlePREmployeeDistributionData = ({
    selected,
    key,
    selectedRowId,
  }) => {
    PREmployeeDistributions({
      selected,
      key,
      selectedRowId,
      datePaid: kendoToString(datePaid, "MM/dd/yyyy"),
    });
  };

  const ActionButtons = (props) => {
    return (
      <td
        className="d-flex flex-wrap gap-1 w-auto"
      >
        {checkPrivialgeGroup('PRPEHB', 1) && <Button
          fillMode="outline"
          themeColor={"primary"}
          onClick={() => viewEmployeeHistoryPopup(props)}
          style={{
            textWrap: "auto",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              lineHeight: "normal",
            }}
          >
            EH
          </span>
        </Button>}
        {checkPrivialgeGroup('PRPAddB', 2) && <Button
          fillMode="outline"
          themeColor={"primary"}
          onClick={() => toggleEmployeeDialog(props.dataItem)}
        >
          <span
            style={{
              fontSize: "13px",
              lineHeight: "normal",
            }}
          >
            Add
          </span>
        </Button>}
      </td>
    );
  };

  useEffect(() => {
    if (CACId) {
      PayrollToatals(datePaid, employeeId, CACId);
    }
  }, [CACId]);

  const handleRefreshData = () => {
    PayrollToatals(datePaid, employeeId, CACId);
    setBindDataGrid((prev) => ({ ...prev }));
    setRowIndexData(rowIndexData)
  };

  const handleCall = ({ cacId, empId }) => {
    PayrollToatals(datePaid, empId, cacId);
    getEmployeeData(empId);
  };

  return (
    <div>
      {checkPrivialgeGroup("AddEmployeePRPB", 2) && <div className="d-flex justify-content-end mb-2 mt-2">
        <Button
          className="k-button k-button-lg k-rounded-lg"
          themeColor={"primary"}
          style={{ width: "20%", height: "5%" }}
          onClick={toggleEmployeeDialog}
        >
          Add Employee
        </Button>
        
      </div>}

      {checkPrivialgeGroup("PRPG", 1) && <Grid
        data={payrollGridData}
        filterable={showFilter}
        filter={filter}
        onFilterChange={filterChange}
        scrollable="scrollable"
        style={{
          height: "57vh",
        }}
        detail={() => (
          <PayrollExpandRow
            data={employeePayrollDistribution}
            handlePREmployeeDistributionData={handlePREmployeeDistributionData}
            setRow={setSelectedRowData}
            toggleDialog={toggleDialog}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            setCACId={setCACId}
            selectedRowId={selectedRowId}
            setSelectedPayrollExpandData={setSelectedPayrollExpandData}
            handleCall={handleCall}
            getPREmployeeList={getPREmployeeList}
            datePaid={datePaid}
            PayrollToatals={PayrollToatals}
            isExpand={isExpand}
            expandChange={expandChange}
            checkPrivialgeGroup={checkPrivialgeGroup}
            rowIndexData={rowIndexData}
            setRowIndexData={setRowIndexData}
            setDeleteVisible={setDeleteVisible}
            deleteVisible={deleteVisible}
          />
        )}
        expandField="expanded"
        onExpandChange={expandChange}
        dataItemKey={DATA_ITEM_KEY}
        onRowClick={onRowClick}
        selectable={{
          enabled: true,
          drag: false,
          mode: "multiple",
          cell: false,
        }}
        sortable={true}
        sort={sort}
        onSortChange={(e) => {
          onSortChange(e);
        }}
      >
        <GridToolbar>
          <div className="row col-sm-12">
            <div className="col-sm-5 d-grid gap-3 d-md-block">
              <Button
                className="buttons-container-button"
                fillMode="outline"
                themeColor={"primary"}
                onClick={MoreFilter}
              >
                <i className="fa-solid fa-arrow-down-wide-short"></i> &nbsp;
                More Filter
              </Button>
            </div>
            <div className="col-sm-7 d-flex align-items-center justify-content-center">
              {checkPrivialgeGroup("PRPSMICB", 1) && <div className="col-4">
                <Checkbox
                  type="checkbox"
                  id="modifiedBy"
                  name="modifiedBy"
                  defaultChecked={columnShow}
                  onChange={onCheckBox}
                  label={"Modified Info"}
                />
              </div>}
              <div className="input-group">
                <Input
                  className="form-control border-end-0 border"
                  onChange={filterData}
                />
                <span className="input-group-append">
                  <button
                    className="btn btn-outline-secondary bg-white rounded-0 border-start-0 rounded-end-2 border ms-n5"
                    type="button"
                  >
                    <i className="fa fa-search"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </GridToolbar>
        <GridColumn
          field="lastName"
          title="Last Name"
          cell={(props) => {
            return (
              <td>
                {props.dataItem.lastName}
              </td>
            );
          }}
        />
        <GridColumn
          field="firstName"
          title="First Name"
          cell={(props) => {
            return (
              <td>
                {props.dataItem.firstName}
              </td>
            );
          }}
        />
        <GridColumn field="employeeNumber" title="Emp No" width={120} />
        <GridColumn
          field="total"
          title="Employee Total"
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
        {columnShow && (
          <GridColumn
            field="createdDate"
            title="Created Date"
            cell={(props) => {
              const [year, month, day] = props.dataItem?.createdDate
                ? props.dataItem?.createdDate.split("T")[0].split("-")
                : [null, null, null];
              return (
                <td>
                  {props.dataItem?.createdDate
                    ? `${month}/${day}/${year}`
                    : null}
                </td>
              );
            }}
          />
        )}
        {columnShow && <GridColumn field="createdBy" title="Created By" />}
        {columnShow && (
          <GridColumn
            field="modifiedDate"
            title="Modified Date"
            cell={(props) => {
              const [year, month, day] = props.dataItem?.modifiedDate
                ? props.dataItem?.modifiedDate.split("T")[0].split("-")
                : [null, null, null];
              return (
                <td>
                  {props.dataItem?.modifiedDate
                    ? `${month}/${day}/${year}`
                    : null}
                </td>
              );
            }}
          />
        )}
        {columnShow && <GridColumn field="modifiedBy" title="Modified By" />}
        <GridColumn cell={ActionButtons} filterable={false} />
      </Grid>}
      <PayrollGridContextMenu
        show={show}
        offset={offset}
        onSelect={handleOnSelect}
        onClose={handleCloseMenu}
      />
      {employeePopupHistoryVisible && (
        <PayrollEmployeeHistory
          viewEmployeeHistoryPopup={viewEmployeeHistoryPopup}
          datePaid={datePaid}
          employeeId={employeeId}
        />
      )}
      {openDialog && (
        <AddPayrollExpandPopup
          toggleDialog={toggleDialog}
          data={employeePayrollDistribution}
          selectedRowData={selectedRowData}
          empId={empId}
          selectedPayrollExpandData={selectedPayrollExpandData}
        />
      )}

      {openEmployeeDia && (
        <AddEmployeePopup
          payrollTotalsData={payrollTotalsData}
          selectedEmployeeByRow={selectedEmployee}
          toggleDialog={toggleEmployeeDialog}
          handleRefreshData={handleRefreshData}
        />
      )}
    </div>
  );
};

export default PayrollGrid;
