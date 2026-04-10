import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { ContextMenu, TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useCallback, useEffect, useRef, useState } from "react";
import { getter } from "@progress/kendo-data-query";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn, getSelectedState } from "@progress/kendo-react-grid";
import { MenuItem } from "@progress/kendo-react-layout";
import axiosInstance from "../../core/HttpInterceptor";
import {
  PayrollEndPoints,
  TimecardEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import AddTimecardEntry from "../modal/AddTimecardEntry";
import DeleteModal from "../modal/DeleteModal";
import ManualTimecardEntry from "../modal/ManualTimecardEntry";
import CustomBreadScrum from "../Shared/CustomBreadScrum";
import { ContractorTimecardCommandCell } from "./CommandCell/ContractorTimecardCommandCell";

export default function ContractorTimecard() {
  const [selected, setSelected] = useState(0);
  const editField = "inEdit";
  const handleSelect = (e) => {
    setSelected(e.selected);
  };

  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };
  const [visibleManual, setVisibleManual] = useState(false);
  const toggleManualDialog = () => {
    setVisibleManual(!visibleManual);
  };
  const enterEdit = (dataItem) => {
    let newData = dataResult.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    setDataResult(newData);
  };

  const update = (dataItem) => {
    dataItem.inEdit = false;
    let deepCopyObj = JSON.parse(JSON.stringify(dataResult));
    let index = deepCopyObj.findIndex((record) => record.id == dataItem.id);
    deepCopyObj[index] = dataItem;
    setDataResult(deepCopyObj);
    EditTimecardDetails(dataItem);
  };
  const cancel = (dataItem) => {
    let newData = dataResult.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: false,
        }
        : item
    );
    setDataResult(newData);
  };
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);

  const [dataResult, setDataResult] = useState([]);
  const [cardQuery] = useState({ id: 2 });
  const [reportData, setReportData] = useState([]);
  const [year, setYear] = useState();
  const [selectedRowId, setSelectedRowId] = useState(0);

  const [, setDataState] = useState({
    skip: 0,
    take: 20,
    sort: [
      {
        field: "orderDate",
        dir: "desc",
      },
    ],
  });

  useEffect(() => {
    setYearDropdownList(["2024", "2023", "2022", "2021", "2020"]);
    getEmployeeData();
  }, [year]);

  useEffect(() => {
    if (dataResult.length) {
      addRecord();
    }
    getListData();
    timeCardReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const dataStateChange = (event) => {
    setDataState(event.dataState);
  };
  const [selectedState, setSelectedState] = useState({});
  const [editID, setEditID] = useState(null);
  const [detailCheckbox, setDetailCheckbox] = useState();
  const [show, setShow] = useState(false);
  const [yearDropdownList, setYearDropdownList] = useState([]);
  const [selectedYearDropdown, setSelectedYearDropdown] = useState("2024");
  const [visibleDelete, setVisibleDelete] = useState(false);
  const offset = useRef({
    left: 0,
    top: 0,
  });
  const ContextMenuCloseMenu = () => {
    setShow(false);
    setSelectedRowId({});
  };
  const ContextMenuOnSelect = (e) => {
    let id = +selectedRowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "delete":
          setShow(false);
          toggleDeleteDialog();
          break;
        default:
          break;
      }
    }
  };
  const GridCommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <div className="d-flex justify-content-end align-items-center">
          <Button
            id={props.dataItem.poNumber}
            onClick={(event) => handleContextMenu(event, props.dataItem)}
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

  const handleContextMenu = (e, data) => {
    e.preventDefault();
    setSelectedRowId(data);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const rowClick = (event) => {
    setDetailCheckbox(event.dataItem);
    if (editID) {
      setEditID(null);
    } else {
      setEditID(event.dataItem.id);
    }
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
  const addRecord = () => {
    if (dataResult[dataResult.length - 1]?.holidayName) {
      const newRecord = {
        id: dataResult.length + 1,
      };
      setDataResult([...dataResult, newRecord]);
      setEditID(newRecord.id);
    }
  };

  const onTimeCardSelection = useCallback(
    (event) => {
      setDetailCheckbox(event.dataItem);
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });
      setSelectedState(newSelectedState);
    },
    [selectedState]
  );

  const onHeaderSelectionChange = useCallback((event) => {
    const checkboxElement = event.syntheticEvent.target;
    const checked = checkboxElement.checked;
    const newSelectedState = {};
    event.dataItems.forEach((item) => {
      newSelectedState[idGetter(item)] = checked;
    });
    setSelectedState(newSelectedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const toggleDeleteDialog = () => {
    setVisibleDelete(!visibleDelete);
    getListData();
  };

  const deleteTimeCardEntry = () => {
    axiosInstance({
      method: "delete",
      url: TimecardEndPoints.TimeCardEntry + "/" + selectedRowId.id,
      withCredentials: false,
    })
      .then((response) => {
        let filterData = dataResult.filter(
          (item) => item.id !== selectedRowId.id
        );
        setDataResult(filterData);
        toggleDeleteDialog();
      })
      .catch((error) => { });
  };

  const EditTimecardDetails = (data) => {
    let editableData = {
      id: data.id,
      empID: data.empID,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      leaveTypeID: data.leaveTypeID,
      leaveCodeID: data.leaveCodeID,
      timeCardHeaderID: data.timeCardHeaderID,
      hours: data.hours,
      hourTypeID: data.hourTypeID,
      jobID: data.jobID,
      memo: data.memo,
      isFMLA: data.isFMLA,
      ihac: data.ihac,
      supervisorID: data.supervisorID,
      modifiedUser: data.modifiedUser,
      modifiedDate: data.modifiedDate,
      createdUser: data.createdUser,
      createdDate: data.createdDate,
      deletedUser: data.deletedUser,
      deletedDate: data.deletedDate,
      supApproved: data.supApproved,
      supApprovedDate: data.supApprovedDate,
    };
    axiosInstance({
      method: "PUT",
      url: TimecardEndPoints.TimeCardEntry + "/" + data.id,
      data: editableData,
      withCredentials: false,
    })
      .then((response) => { })
      .catch((error) => { });
  };

  const timeCardReportData = () => {
    axiosInstance({
      method: "GET",
      url: TimecardEndPoints.TimeCardReport,
      withCredentials: false,
      params: {
        startYear: year,
        endYear: year,
      },
    })
      .then((response) => {
        let data = response.data.records;
        setReportData(data);
      })
      .catch((error) => { });
  };

  const getListData = () => {
    axiosInstance({
      method: "GET",
      url:
        TimecardEndPoints.TimecardList +
        "/" +
        cardQuery.id +
        "/Detail" +
        "?year",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setDataResult(data);
      })
      .catch((error) => { });
  };

  const ApproveTimesheet = () => {
    if (detailCheckbox !== undefined) {
      let TimeCardData = {
        id: detailCheckbox.id,
        empID: detailCheckbox.empID,
        startDateTime: detailCheckbox.startDateTime,
        endDateTime: detailCheckbox.endDateTime,
        leaveTypeID: detailCheckbox.leaveTypeID,
        leaveCodeID: detailCheckbox.leaveCodeID,
        timeCardHeaderID: detailCheckbox.timeCardHeaderID,
        hours: detailCheckbox.hours,
        hourTypeID: detailCheckbox.hourTypeID,
        jobID: detailCheckbox.jobID,
        memo: detailCheckbox.memo,
        isFMLA: detailCheckbox.isFMLA,
        ihac: detailCheckbox.ihac,
        supervisorID: detailCheckbox.supervisorID,
        modifiedUser: detailCheckbox.modifiedUser,
        modifiedDate: detailCheckbox.modifiedDate,
        createdUser: detailCheckbox.createdUser,
        createdDate: detailCheckbox.createdDate,
        deletedUser: detailCheckbox.deletedUser,
        deletedDate: detailCheckbox.deletedDate,
        supApproved: true,
        supApprovedDate: new Date().toISOString(),
      };
      axiosInstance({
        method: "PUT",
        url: TimecardEndPoints.TimeCardEntry + "/" + detailCheckbox.id,
        data: TimeCardData,
        withCredentials: false,
      })
        .then((response) => {
          getListData();
        })
        .catch((error) => { });
    }
  };
  const [employeeData, setEmployeeData] = useState();
  const initialSort = [
    {
      field: "createdDate",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    getEmployeeData("", direction, sortColumn);
  };
  const getEmployeeData = (
    search = "",
    desc = "true",
    sortKey = "createdDate"
  ) => {
    axiosInstance({
      method: "Post",
      url:
        PayrollEndPoints.EmployeeFilter +
        "?search=" +
        search +
        "&&skip=" +
        0 +
        "&&take=" +
        0 +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        data.map((employee) => {
          employee.fullName = employee.displayName;
          return employee;
        });
        setEmployeeData(data);
      })
      .catch((e) => { });
  };

  const handleDateChange = (event) => {
    setSelectedYearDropdown(event.target.value);
  };

  const handleEmployeeChange = (event) => { };

  const breadScrumData = [
    {
      title: "Timecard",
      link: "",
    },
    {
      title: "Timecard",
      link: "",
    },
    {
      title: " Contractor Timecard",
      link: "",
    },
  ];
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Fund')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div>
      <CustomBreadScrum data={breadScrumData} />

      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Timecard</h1>
        </div>
      </div>

      <TabStrip className="app-tab" selected={selected} onSelect={handleSelect}>
        <TabStripTab title="Employee Timecard">
          <div className="d-flex  k-justify-content-between">
            <div className="d-flex justify-content-between w-100">
              <DropDownList
                style={{
                  width: "250px",
                }}
                defaultItem="Year Range"
                value={selectedYearDropdown}
                className="app-dropdown"
                data={yearDropdownList}
                onChange={handleDateChange}
              />
              <DropDownList
                style={{
                  width: "250px",
                }}
                defaultItem="Select Contract"
                className="app-dropdown"
                onChange={handleEmployeeChange}
                data={employeeData}
                textField="fullName"
                popupSettings={{ width: "auto" }}
              />
              <div className="app-search-input  d-flex justify-content-end">
                <span className="k-icon k-i-search" />
                <Input
                  style={{
                    width: "300px",
                    height: "44px",
                  }}
                  placeholder="Search"
                  type="text"
                />
              </div>
            </div>
            <div>
            </div>
          </div>

          <div className="mt-3">
            <Grid
              data={dataResult.map((item) => ({
                ...item,
                [SELECTED_FIELD]: selectedState[idGetter(item)],
              }))}
              onDataStateChange={dataStateChange}
              editField="inEdit"
              onRowClick={rowClick}
              onItemChange={itemChange}
              dataItemKey={DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                drag: false,
                cell: false,
                mode: "multiple",
              }}
              onSelectionChange={onTimeCardSelection}
              onHeaderSelectionChange={onHeaderSelectionChange}
              sortable={true}
              sort={sort}
              onSortChange={(e) => {
                onSortChange(e);
              }}
            >
              <GridColumn
                field={SELECTED_FIELD}
                width="50px"
                headerSelectionValue={
                  dataResult.findIndex(
                    (item) => !selectedState[idGetter(item)]
                  ) == -1
                }
              />
              <GridColumn
                field="createdDate"
                title="Date"
                cell={(props) => {
                  const [year, month, day] = props.dataItem.createdDate
                    ? props.dataItem.createdDate.split("T")[0].split("-")
                    : "";
                  return <td>{`${month}/${day}/${year}`}</td>;
                }}
              />

              <GridColumn
                field="startDateTime"
                title="Start Time"
                width="100px"
                cell={(props) => {
                  const [hh, mm] = props.dataItem.startDateTime
                    ? props.dataItem.startDateTime.split("T")[1].split(":")
                    : "";
                  return <td>{`${hh}:${mm}`}</td>;
                }}
              />
              <GridColumn
                field="endDateTime"
                title="End Time"
                width="100px"
                cell={(props) => {
                  const [hh, mm] = props.dataItem.endDateTime
                    ? props.dataItem.endDateTime.split("T")[1].split(":")
                    : "";
                  return <td>{`${hh}:${mm}`}</td>;
                }}
              />
              <GridColumn field="isFMLA" title="FMLA" width="100px" />
              <GridColumn field="jobID" title="Job" width="100px" />
              <GridColumn field="hourTypeID" title="Hours Type" width="150px" />
              <GridColumn
                field="hours"
                title="Hours"
                width="100px"
                format="{0:0.##}"
              />
              <GridColumn field="memo" title="Memo" />
              <GridColumn
                filterable={false}
                cell={(props) => (
                  <ContractorTimecardCommandCell
                    {...props}
                    edit={enterEdit}
                    update={update}
                    cancel={cancel}
                    editField={editField}
                  />
                )}
              />
              <GridColumn cell={GridCommandCell} filterable={false} />
            </Grid>
            <ContextMenu
              show={show}
              offset={offset.current}
              onSelect={ContextMenuOnSelect}
              onClose={ContextMenuCloseMenu}
            >
              {checkPrivialgeGroup("Fund Grid", 3) && (
                <MenuItem
                  text="Delete Record"
                  data={{
                    action: "delete",
                  }}
                  icon="delete"
                />
              )}
            </ContextMenu>
          </div>
          <div className="mt-3 d-flex justify-content-end">
            {checkPrivialgeGroup("Fund Grid", 2) && (
              <Button
                className="k-button k-button-lg k-rounded-lg ms-4 "
                themeColor={"primary"}
                onClick={ApproveTimesheet}
              >
                Approve Timesheet
              </Button>
            )}
          </div>
          {visible && (
            <AddTimecardEntry toggleDialog={toggleDialog}></AddTimecardEntry>
          )}
          {visibleManual && (
            <ManualTimecardEntry
              toggleDialog={toggleManualDialog}
            ></ManualTimecardEntry>
          )}
          {visibleDelete && (
            <DeleteModal
              toggleDialog={toggleDeleteDialog}
              title={"Timecard Entry"}
              name={"timecard entry"}
              deleteSubmit={deleteTimeCardEntry}
            />
          )}
        </TabStripTab>
        <TabStripTab title="Timecard Report">
          <div className="d-flex k-w-full  k-justify-content-between">
            <div>
              <DropDownList
                style={{
                  width: "250px",
                }}
                defaultItem="Date Range"
                className="app-dropdown me-2"
                data={["2024", "2023"]}
                onChange={handleYearChange}
              />
            </div>

            <div className="d-flex ">
              <div className="app-search-input">
                <span className="k-icon k-i-search" />
                <Input
                  style={{
                    width: "300px",
                    height: "44px",
                  }}
                  placeholder="Search"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Grid
              sortable={true}
              data={reportData}
              onDataStateChange={dataStateChange}
              onRowClick={rowClick}
              onItemChange={itemChange}
            >
              <GridColumn
                field="startDate"
                title="Start Date"
                format="{0:d}"
                k-format="'MM-DD-yyyy'"
                cell={(props) => {
                  const [year, month, day] = props.dataItem?.startDate
                    ? props.dataItem?.startDate.split("T")[0].split("-")
                    : [null, null, null];

                  return (
                    <td>
                      {props.dataItem?.startDate
                        ? `${month}/${day}/${year}`
                        : null}
                    </td>
                  );
                }}
              />

              <GridColumn
                field="endDate"
                title="End Date"
                cell={(props) => {
                  const [year, month, day] = props.dataItem?.endDate
                    ? props.dataItem?.endDate.split("T")[0].split("-")
                    : [null, null, null];
                  return (
                    <td>
                      {props.dataItem?.endDate
                        ? `${month}/${day}/${year}`
                        : null}
                    </td>
                  );
                }}
              />
              <GridColumn
                field="empTimeStamp"
                title="Employee Date"
                cell={(props) => {
                  const [year, month, day] = props.dataItem?.empTimeStamp
                    ? props.dataItem.empTimeStamp.split("T")[0].split("-")
                    : [null, null, null];
                  return (
                    <td>
                      {props.dataItem?.empTimeStamp
                        ? `${month}/${day}/${year}`
                        : null}
                    </td>
                  );
                }}
              />
              <GridColumn
                field="supTimeStamp"
                title="Supervisor Date"
                cell={(props) => {
                  const [year, month, day] = props.dataItem.supTimeStamp
                    ? props.dataItem.supTimeStamp.split("T")[0].split("-")
                    : [null, null, null];
                  return (
                    <td>
                      {props.dataItem?.supTimeStamp
                        ? `${month}/${day}/${year}`
                        : null}
                    </td>
                  );
                }}
              />
              <GridColumn
                field="payRollDate"
                title="Payroll Date"
                cell={(props) => {
                  if (props.dataItem.payRollDate !== null) {
                    const [year, month, day] =
                      props.dataItem.payRollDate !== null
                        ? props.dataItem.payRollDate.split("T")[0].split("-")
                        : "";
                    return <td>{`${month}/${day}/${year}`}</td>;
                  } else {
                    return <td></td>;
                  }
                }}
              />
              <GridColumn
                field="empApprovalDate"
                title="Employee Approval Date"
                cell={(props) => {
                  if (props.dataItem.empApprovalDate !== null) {
                    const [year, month, day] =
                      props.dataItem.empApprovalDate !== null
                        ? props.dataItem.empApprovalDate
                          .split("T")[0]
                          .split("-")
                        : "";
                    return <td>{`${month}/${day}/${year}`}</td>;
                  } else {
                    return <td></td>;
                  }
                }}
              />
            </Grid>
          </div>
        </TabStripTab>
      </TabStrip>
    </div>
  );
}
