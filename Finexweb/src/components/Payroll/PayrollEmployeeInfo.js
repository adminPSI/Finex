import { Button } from "@progress/kendo-react-buttons";
import React, { useEffect, useState } from "react";

import { Checkbox, Input } from "@progress/kendo-react-inputs";
import jsonData from "../../json/Timecard";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { useNavigate } from "react-router-dom";
import {
  EmplTimecardEndPoints,
  PayrollEmployeeSetup
} from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import {
  ColumnDatePicker,
} from "../form-components";
import AddEmployeeToPayroll from "./Job/modals/AddEmployeeToPayroll";

export default function PayrollEmployeeInfo() {
  const initialDataState = {
    skip: 0,
    take: 10,
  };

  const [employeeData, setEmployeeData] = useState();

  const [columnShow, setColumnShow] = useState(false);
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] =
    React.useState(false);

  const [dataResult, setDataResult] = React.useState(jsonData);
  const [page, setPage] = useState(initialDataState);

  const [bindEmployeeGrid, setBindEmployeeGrid] = useState(null);
  const [filter, setFilter] = useState();
  const [pageTotal, setPageTotal] = useState();
  const [filterInactiveInd, setFilterInactiveInd] = useState(false)
  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);

  useEffect(() => {
    setDataResult(jsonData);
    if (dataResult.length) {
      addRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  useEffect(() => {
    getEmployeeData();
  }, []);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindEmployeeGrid) {
        getEmployeeData(
          bindEmployeeGrid.firstNameFilter,
          bindEmployeeGrid.lastNameFilter,
          bindEmployeeGrid.employeeNumberFilter,
          bindEmployeeGrid.dateOfBirthFilter,
          bindEmployeeGrid.emailAddressFilter,
          bindEmployeeGrid.search,
          bindEmployeeGrid.cskip,
          bindEmployeeGrid.ctake == "All" ? 0 : bindEmployeeGrid.ctake,
          bindEmployeeGrid.sortKey,
          bindEmployeeGrid.inactiveDate
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindEmployeeGrid]);

  const filterChange = (event) => {
    var firstNameFilter = "";
    var lastNameFilter = "";
    var employeeNumberFilter = "";
    var dateOfBirthFilter = "";
    var emailAddressFilter = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "employee.firstName") {
          firstNameFilter = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "employee.lastName") {
          lastNameFilter = event.filter.filters[i].value;
        }

        if (event.filter.filters[i].field == "employee.employeeNumber") {
          employeeNumberFilter = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "employee.dateOfBirth") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          dateOfBirthFilter = date;
        }
        if (event.filter.filters[i].field == "employee.emailAddress") {
          emailAddressFilter = event.filter.filters[i].value;
        }
      }
    }

    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindEmployeeGrid({
      ...bindEmployeeGrid,
      search: undefined,
      cskip: 0,
      firstNameFilter,
      lastNameFilter,
      employeeNumberFilter,
      dateOfBirthFilter,
      emailAddressFilter,
    });
    setFilter(event.filter);
  };

  const onSuccess = () => {
    setOpenAddEmployeeDialog(false);
    getEmployeeData();
  };

  const getEmployeeData = (
    firstNameFilter = "",
    lastNameFilter = "",
    employeeNumberFilter = "",
    dateOfBirthFilter = "",
    emailAddressFilter = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    sortKey,
    inactiveDate
  ) => {
    axiosInstance({
      method: "GET",
      url:
        PayrollEmployeeSetup.getEmployeeGridData +
        `?search=${search}&skip=${cskip}&take=${ctake}&activeIND=${filterInactiveInd ? "N" : "Y"}&firstNameFilter=${firstNameFilter}&lastNameFilter=${lastNameFilter}&employeeNumberFilter=${employeeNumberFilter}&dateOfBirthFilter=${dateOfBirthFilter}&emailAddressFilter=${emailAddressFilter}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;

        setPageTotal(response.data.total);

        setEmployeeData(data.data);
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  const navigate = useNavigate();

  const dataStateChange = (event) => { };
  const [editID, setEditID] = React.useState(null);
  const [TCEmployee, setTCEmployee] = useState([]);

  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = React.useState(0);
  const [show, setShow] = React.useState(false);

  const [, setSearchInputValue] = useState();
  const [commandCellAction, setCommandCellAction] = React.useState("");
  const [EmpId, setEmpId] = useState("");

  const rowClick = (event) => {
    if (editID) {
      setEditID(null);
    } else {
      setEditID(event.dataItem.id);
    }
  };
  useEffect(() => {
    getEmployeeName();
  }, []);

  const getEmployeeName = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.Employee,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        data.forEach((element) => {
          element.empId = element.id;
          element.empName = element.displayName;
        });
        setTCEmployee(data);
      })
      .catch((error) => { });
  };

  const handleCheckBox = (e) => {
    setFilterInactiveInd(e.value)
    setBindEmployeeGrid({
      ...bindEmployeeGrid,
    });
  }

  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "setup":
          navigate("/payroll/setup", {
            state: {
              id: employeeData?.find((item) => item.id == id)?.empId,
              completeData: employeeData?.find((item) => item.id == id),
            },
          });
          break;

        case "edit":
          setCommandCellAction("edit");
          const empId = employeeData?.find((item) => item.id == selectedRowId);
          if (empId?.empId) {
            setEmpId(empId.empId);
            setOpenAddEmployeeDialog(true);
          }
          break;

        case "delete":
          setEmployeeData((prev) => {
            const newCopy = prev.filter((item) => {
              // eslint-disable-next-line eqeqeq
              return item.id != id;
            });
            return newCopy;
          });
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };

  const itemChange = (event) => {
    const inEditID = event.dataItem.id;
    const field = event.field || "";
    const newData = dataResult.map((item) =>
      item.id == inEditID
        ? {
          ...item,
          [field]: event.value,
        }
        : item
    );
    setDataResult(newData);
  };

  const customDateCell = (date) => {
    var myDate = date;
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");
      return <td>{`${month}/${day}/${year}`}</td>;
    } else {
      return <td></td>;
    }
  };

  const CommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <div className="d-flex justify-content-end align-items-center">
          <Button
            id={props.dataItem.id}
            onClick={handleContextMenu}
            style={{
              backgroundColor: "transparent",
              border: "none",
            }}
          >
            <i className="fa-solid fa-ellipsis"></i>
          </Button>
        </div>
      </td>
    </>
  );

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindEmployeeGrid({
        ...bindEmployeeGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindEmployeeGrid({
        ...bindEmployeeGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: pageTotal,
      });
    }
  };

  const addRecord = () => {
    if (dataResult[dataResult.length - 1]?.holidayName) {
      const newRecord = {
        id: dataResult.length + 1,
      };
      setDataResult([...dataResult, newRecord]);
      setEditID(newRecord.id);
    }
  };

  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };

  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const [showFilter, setshowFilter] = React.useState(false);

  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  const timeRef = React.useRef(null);
  const filterData = (e) => {
    let value = e.target.value;
    setSearchInputValue(value);
    clearTimeout(timeRef.current);
    timeRef.current = setTimeout(() => {
      setBindEmployeeGrid({
        ...bindEmployeeGrid,
        search: value,
        cskip: 0,
        firstNameFilter: undefined,
        lastNameFilter: undefined,
        employeeNumberFilter: undefined,
        dateOfBirthFilter: undefined,
        emailAddressFilter: undefined,
      });
    }, 1000);
  };

  const toggleAddEmployeeDialog = () => {
    setCommandCellAction("add");
    setOpenAddEmployeeDialog(!openAddEmployeeDialog);
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <React.Fragment>
      {checkPrivialgeGroup("PEIM", 1) && <div>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              Payroll
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Payroll
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Employee Info
            </li>
          </ol>
        </nav>
        <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
          <div className="d-flex k-flex-column">
            <h1>Payroll Employee Info</h1>
          </div>
          <div>
            {checkPrivialgeGroup("PayraiseB", 1) && (
              <Button
                className="k-button k-button-lg k-rounded-lg"
                themeColor={"primary"}
                style={{ marginRight: "20px" }}
                onClick={() => {
                  navigate("/payroll/pay-raise")
                }}
              >
                Pay Raise
              </Button>
            )}
            {checkPrivialgeGroup("AddEmployeeToPayrollB", 2) && (
              <Button
                className="k-button k-button-lg k-rounded-lg"
                themeColor={"primary"}
                onClick={toggleAddEmployeeDialog}
              >
                Add Employee to Payroll
              </Button>
            )}
          </div>
        </div>
        <div className="mt-3">
          {checkPrivialgeGroup("PEIG", 1) && <Grid
            resizable={true}
            sortable={true}
            data={employeeData}
            onDataStateChange={dataStateChange}
            editField="inEdit"
            filterable={showFilter}
            fixedScroll={true}
            onRowClick={rowClick}
            onItemChange={itemChange}
            filter={filter}
            onFilterChange={filterChange}
            skip={page.skip}
            take={page.take}
            total={pageTotal}
            pageable={{
              buttonCount: 4,
              pageSizes: [10, 15, 50, "All"],
              pageSizeValue: pageSizeValue,
            }}
            onPageChange={pageChange}
          >
            <GridToolbar>
              <div className="row col-sm-12">
                <div className="col-sm-3 d-grid gap-3 d-md-block">
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
                <div className="col-sm-9 d-flex align-items-center justify-content-center align-items-center">

                  <div className="col-3">
                    {checkPrivialgeGroup("PEISMICB", 1) && (
                      <Checkbox
                        type="checkbox"
                        id="modifiedBy"
                        name="modifiedBy"
                        defaultChecked={columnShow}
                        onChange={onCheckBox}
                        label={"Modified Info"}
                      />
                    )}
                  </div>
                  <div className="col-3">

                    <Checkbox
                      type="checkbox"
                      id="setInactive"
                      name="setInactive"
                      defaultChecked={filterInactiveInd}
                      onChange={handleCheckBox}
                      label={"Show Inactive"}
                    />

                  </div>
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
            <GridColumn field="employee.lastName" title="Last Name" />
            <GridColumn field="employee.firstName" title="First Name" />
            <GridColumn field="employee.employeeNumber" title="Employee Number" />

            <GridColumn
              field="createdDate"
              title="Created Date"
              filterCell={ColumnDatePicker}
              format="{0:MM/dd/yyyy}"
              cell={(props) => customDateCell(props.dataItem.createdDate)}
            />
            <GridColumn
              field="employee.dateOfBirth"
              title="Date Of Birth"
              format="{0:MM/dd/yyyy}"
              filterCell={ColumnDatePicker}
              cell={(props) =>
                customDateCell(props.dataItem.employee.dateOfBirth)
              }
            />
            <GridColumn field="employee.emailAddress" title="Email Address" />
            {columnShow && (
              <GridColumn
                field="createdDate"
                title="Created Date"
                filterCell={ColumnDatePicker}
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
                filterCell={ColumnDatePicker}
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
            {!filterInactiveInd && <GridColumn filterable={false} cell={CommandCell} />}
          </Grid>}
          <ContextMenu
            show={show && !filterInactiveInd}
            offset={offset.current}
            onSelect={handleOnSelect}
            onClose={handleCloseMenu}
          >
            {checkPrivialgeGroup("EditRecordPEICM", 3) && (
              <MenuItem
                text="Edit Record"
                data={{
                  action: "edit",
                }}
                icon="edit"
              />
            )}
            {checkPrivialgeGroup("DeleteRPEICM", 4) && (
              <MenuItem
                text="Delete Record"
                data={{
                  action: "delete",
                }}
                icon="delete"
              />
            )}
            {checkPrivialgeGroup("EditPEICM", 3) && (<MenuItem
              text="Edit"
              data={{
                action: "edit",
              }}
              icon="edit"
            />)}
            {checkPrivialgeGroup("SetupPEICM", 1) && (
              <MenuItem
                text="Setup"
                data={{
                  action: "setup",
                }}
                icon="setup"
              />)}
          </ContextMenu>
        </div>
        {
          openAddEmployeeDialog && (
            <AddEmployeeToPayroll
              toggleAddEmployeeDialog={toggleAddEmployeeDialog}
              action={commandCellAction}
              empId={EmpId}
              TCEmployee={TCEmployee}
              employeeData={employeeData}
              setOpenAddEmployeeDialog={setOpenAddEmployeeDialog}
              onSuccess={onSuccess}
              getDataList={getEmployeeData}
            />
          )
        }
      </div>}
    </React.Fragment>
  );
}
