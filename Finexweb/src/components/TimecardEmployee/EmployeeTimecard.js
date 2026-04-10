import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn, getSelectedState } from "@progress/kendo-react-grid";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EmplTimecardEndPoints,
  TimecardEndPoints
} from "../../EndPoints";
import AddTimecardEntry from "../modal/AddTimecardEntry";
import ManualTimecardEntry from "../modal/ManualTimecardEntry";
import { eyedropperIcon, trashIcon } from "@progress/kendo-svg-icons";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import CustomBreadScrum from "../Shared/CustomBreadScrum";
import { CheckBoxCell } from "../cells/CheckBoxCell";
import Constants from "../common/Constants";
import DeleteModal from "../modal/DeleteModal";

const MyCommandCell = (props) => {
  const { dataItem } = props;
  const isNewItem = dataItem.id == 0;

  const inEdit = dataItem.inEdit;

  const handleAddUpdate = useCallback(() => {
    isNewItem ? props.add(dataItem) : props.update(dataItem);
  }, [dataItem, isNewItem]);

  const handleDiscardCancel = useCallback(() => {
    isNewItem ? props.discard(dataItem) : props.cancel(dataItem);
  }, [dataItem, isNewItem]);

  const handleRemove = useCallback(() => {
    props.remove(dataItem);
  }, [dataItem]);

  const handleEdit = useCallback(() => {
    props.edit(dataItem);
  }, [dataItem]);

  if (props.rowType == "groupHeader") return null;
  return inEdit ? (
    <td className="k-command-cell" style={{ width: "100px" }}>
      <Button onClick={handleAddUpdate}>{isNewItem ? "Add" : "Save"}</Button>
      {!isNewItem && <Button onClick={handleDiscardCancel}>Cancel</Button>}
    </td>
  ) : (
    <td className="k-command-cell" style={{ width: "100px" }}> 
      {(dataItem.hourlyType ||
        props.employeeDetail.isSupervisor) &&
        (props?.dataItem?.hourlyType !== "Holiday" || props?.dataItem?.leaveType) && (
          <>
            <Button
              themeColor="primary"
              onClick={handleEdit}
              svgIcon={eyedropperIcon}
            ></Button>
            <Button
              themeColor="primary"
              onClick={handleRemove}
              svgIcon={trashIcon}
            ></Button>
          </>
        )}
    </td>
  );
};

export default function EmployeeTimecard() {
  const initialDataState = {
    skip: 0,
    take: 5,
  };
  const initialSort = [
    {
      field: "startDateTime",
      dir: "asc",
    },
  ];

  const [sort, setSort] = useState(initialSort);

  const [selectedDetail, setSelectedDetail] = useState();
  const [addType, setAddType] = useState();
  const [visible, setVisible] = useState(false);
  const [isValidTimecardUser, setValidTimecardUser] = useState(true);
  const [employeeDetail, setEmployeeDetail] = useState({});
  const [isTimecardHeaderActive, setIsTimecardHeaderActive] = useState(true);
  const yearOptions = Array.from(
    { length: 
      new Date().getFullYear() - 2010 + 1 },
    (_, i) => 
    new Date().getFullYear() - i
  );
  const toggleDialog = (data) => {
    if (visible) {
      setSelectedDetail();
    }
    setAddType(data);
    setVisible(!visible);
    getListData();
  };
  const [visibleManual, setVisibleManual] = useState(false);
  const toggleManualDialog = () => {
    setVisibleManual(!visibleManual);
  };

  const [dataResult, setDataResult] = useState([]);
  const [page, setPage] = useState(initialDataState);
  const [timecardPages, setTimecardPages] = useState(initialDataState);
  const [pageTotal, setPageTotal] = useState();
  const [clockBtn, setClockBtn] = useState();
  const [currentEmployee, setCurrentEmployee] = useState({});

  const [editID, setEditID] = useState(null);

  const rowClick = (event) => {
    setDataResult([]);
    if (event.dataItem.id == checkboxData.id) {
      setSelectedState({});
      setCheckboxData({});
      if (reportData.length == 1) {
        setCheckboxData(event.dataItem);
        const newSelectedState = {};
        newSelectedState[idGetter(event.dataItem)] = true;
        setSelectedState(newSelectedState);
      }
    } else {
      setCheckboxData(event.dataItem);
      const newSelectedState = {};
      newSelectedState[idGetter(event.dataItem)] = true;
      setSelectedState(newSelectedState);
    }
    if (editID && editID == event.dataItem.id) {
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

  const [pageSizeValue, setPageSizeValue] = useState(5);
  const [reportData, setReportData] = useState([]);
  const [year, setYear] = useState("");
  const [selectEmployee, setSelectEmployee] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(0);
  const [show, setShow] = useState(false);
  const offset = useRef({
    left: 0,
    top: 0,
  });
  const [checkboxData, setCheckboxData] = useState({});
  const [detailCheckbox, setDetailCheckbox] = useState([]);
  const [bindDtailGridObj, setBindDtailGridObj] = useState({
    sortKey: "startDateTime",
    desc: true,
  });
  const editField = "inEdit";

  //Set filter operator for Funds Grid Data
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);

  const [selectedState, setSelectedState] = useState({});

  const [bindDataGrid, setBindDataGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        timeCardReportData(
          {
            direction: bindDataGrid.direction,
            sortColumn: bindDataGrid.sortColumn,
            skip: bindDataGrid.cskip,
            take: bindDataGrid.ctake,
          }
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindDataGrid]);


  const onSelectionChange = useCallback(
    (event) => {
      if (event.dataItem) {
        let currentCheckBoxList = [...detailCheckbox];
        if (event.dataItem.selected) {
          currentCheckBoxList = currentCheckBoxList.filter(
            (p) => p.id !== event.dataItem.id
          );
          const data = { ...selectedState };
          delete data[event.dataItem.id];
          setSelectedState(data);
          event.dataItem.selected = false;
        } else {
          if (event.dataItem && event.dataItem.endDateTime) {
            setSelectedState({ ...selectedState, [event.dataItem.id]: true });
            currentCheckBoxList.push(event.dataItem);
          } else {
            showErrorNotification("Please select record which have end date.");
          }
        }

        setDetailCheckbox(currentCheckBoxList);
      } else {
        const newSelectedState = getSelectedState({
          event,
          selectedState: selectedState,
          dataItemKey: DATA_ITEM_KEY,
        });

        if (selectedState && Object.keys(selectedState).length) {
          let currentCheckBoxList = [...detailCheckbox];

          const falseKey = Object.keys(newSelectedState)[0];

          const tmpData = event.dataItems.find(
            (item) => item.id.toString() == falseKey.toString()
          );

          if (selectedState[tmpData.id]) {
            const currentCheckBoxList = [...detailCheckbox];

            delete selectedState[tmpData.id];
            setSelectedState({ ...selectedState });
            setDetailCheckbox(
              currentCheckBoxList.filter((item) => item.id !== tmpData.id)
            );
          } else {
            if (tmpData && tmpData.endDateTime) {
              currentCheckBoxList.push(tmpData);
              setDetailCheckbox(currentCheckBoxList);
              setSelectedState({ ...selectedState, ...newSelectedState });
            } else {
              showErrorNotification(
                "Please select record which have end date."
              );
            }
          }
        } else {
          let currentCheckBoxList = [...detailCheckbox];

          const tmpData = event.dataItems.find(
            (item) =>
              item.id.toString() == Object.keys(newSelectedState)[0].toString()
          );
          if (tmpData) {
            if (tmpData && tmpData.endDateTime) {
              currentCheckBoxList.push(tmpData);
              setDetailCheckbox(currentCheckBoxList);
              setSelectedState(newSelectedState);
            } else {
              showErrorNotification("Please Select end date data");
            }
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedState, detailCheckbox]
  );

  const onHeaderSelectionChange = useCallback(
    (event) => {
      let showMsg = false;

      const checkboxElement = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState = {};
      let currentCheckBoxList = [...detailCheckbox];
      event.dataItems.forEach((item) => {
        if (item.endDateTime) {
          currentCheckBoxList.push({ ...item, [SELECTED_FIELD]: checked });
          newSelectedState[idGetter(item)] = checked;
        } else {
          showMsg = true;
        }
      });

      if (showMsg) {
        showErrorNotification(
          "There is some entry that don't have end time, those were not selected."
        );
      }
      setDetailCheckbox(currentCheckBoxList);
      setSelectedState(newSelectedState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataResult]
  );

  const onTimeCardSelection = useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });
      setSelectedState(newSelectedState);
    },
    [selectedState]
  );

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindDataGrid({
        ...bindDataGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindDataGrid({
        ...bindDataGrid,
        cskip: 0,
        ctake: pageTotal,
      });
      setPage({
        cskip: 0,
        ctake: pageTotal,
      });
    }
  };


  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "startDateTime";
    setBindDtailGridObj({
      ...bindDtailGridObj,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const update = (dataItem) => {
    dataItem.inEdit = false;
    let deepCopyObj = JSON.parse(JSON.stringify(dataResult));
    let index = deepCopyObj.findIndex((record) => record.id == dataItem.id);
    deepCopyObj[index] = dataItem;
    setDataResult(deepCopyObj);
    EditTimecardDetails(dataItem);
  };
  const remove = (dataItem) => {
    setSelectedRowId(dataItem);
    setShow(false);
    toggleDeleteDialog();
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

  const enterEdit = (dataItem) => {
    setSelectedDetail(dataItem);
    toggleDialog("add");
  };

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
  const [visibleDelete, setVisibleDelete] = useState(false);
  const toggleDeleteDialog = () => {
    setVisibleDelete(!visibleDelete);
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
      .catch(() => { });
  };

  const handleApprove = (type) => {
    const isApprove = detailCheckbox.find((item) => !item.endDateTime);
    if (isApprove) {
      return showErrorNotification("Please select record which have end date.");
    }
    if (!editID) {
      showErrorNotification("Please select header record");
      return;
    }

    if (detailCheckbox.length || type == "Employee") {
      let Ids = detailCheckbox.map((element) => element.id);
      ApproveTimeSheet(Ids, type);
    } else {
      showErrorNotification("No row is selected");
    }
  };

  const handleYearChange = (event) => {
    setDataResult([]);
    setReportData([]);
    setCheckboxData({});
    setSelectedState({});
    setYear(event.target.value);
  };

  const EditTimecardDetails = (data) => {
    let editableData = {
      id: data.id,
      empID: data.empID,
      startDateTime: data.formatedstartTime,
      endDateTime: data.formatedendTime,
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
      .then((response) => {
      })
      .catch(() => { });
  };

  useEffect(() => {
    setDataResult([]);
    setBindDataGrid({})

    // timeCardReportData();
    setDetailCheckbox([]);
    if (dataResult.length) {
      addRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, selectEmployee]);

  useEffect(() => {
    getEmployeeData();
  }, []);

  useEffect(() => {
    if (Object.keys(checkboxData).length !== 0) {
      getListData();
    } else {
      getFirstRowData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkboxData, reportData, bindDtailGridObj]);


  const timeCardReportData = ({ direction = true, sortColumn = "startDate", skip = 0, take = 5 }) => {
    const currentYear = new Date().getFullYear();

    if (selectEmployee && selectEmployee !== "") {
      axiosInstance({
        method: "GET",
        url: TimecardEndPoints.TimeCardReport,
        withCredentials: false,
        params: {
          startYear: year == "" ? currentYear : year,
          empId: selectEmployee,
          desc: direction ?? "",
          sortKey: sortColumn ?? "",
          skip: skip,
          pageCount: take
        },
      })
        .then((response) => {
          let data = response.data.records;
          if (response.data.records.length) {
            data[0].selected = true;
            getTimeCardStatus(selectEmployee, data[0]?.id);
            setCheckboxData(data[0]);
            setReportData(data);

            let firstData = data[0];
            if (firstData) {
              const newSelectedState = {};
              newSelectedState[idGetter(firstData)] = true;
              setSelectedState(newSelectedState);
              setEditID(firstData.id);
            }

            setPageTotal(response.data.total);
          } else {
            setReportData([]);
            setCheckboxData({});
            setDataResult([]);
            setClockBtn();
          }
        })
        .catch(() => { });
    }
  };

  const getFirstRowData = () => {
    if (reportData[0] !== undefined) {
      axiosInstance({
        method: "GET",
        url:
          TimecardEndPoints.TimecardList + "/" + reportData[0].id + "/Detail",
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setDataResult(data);
        })
        .catch(() => { });
    } else {
      setDataResult([]);
    }
  };

  const getListData = () => {
    if (checkboxData.id) {

      getTimeCardStatus(selectEmployee, checkboxData.id)
      axiosInstance({
        method: "GET",
        url:
          TimecardEndPoints.TimecardList +
          "/" +
          checkboxData.id +
          "/Detail?" +
          "sortKey=" +
          bindDtailGridObj.sortKey +
          "&desc=" +
          bindDtailGridObj.desc,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setDataResult(data);
        })
        .catch((error) => { });
    }
  };
  const getTimeCardStatus = (employeeId, headerId) => {
    if (headerId) {
      axiosInstance({
        method: "GET",
        url:
          TimecardEndPoints.TimeCardStatus +
          "/" +
          employeeId +
          "?headerId=" +
          headerId,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setIsTimecardHeaderActive(data.isTimecardHeaderActive);
          if (data.showButtons) {
            setAddType("add");
          } else {
            setAddType("clock");
          }
          setClockBtn(data);
        })
        .catch(() => { });
    }
  };

  const myCustomDateCell = (props) => {
    var myDate = props.dataItem[props.field];
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");
      return <td>{`${month}/${day}/${year} `}</td>;
    } else {
      return <td></td>;
    }
  };
  const [employeeData, setEmployeeData] = useState();
  const initialReportSort = [
    {
      field: "startDate",
      dir: "asc",
    },
  ];
  const [reportSort, setSportSort] = useState(initialReportSort);
  const onSortReportChange = (event) => {
    setSportSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "startDate";
    // timeCardReportData({ direction, sortColumn });
    setBindDataGrid({ ...bindDataGrid, direction, sortColumn })

  };
  const getEmployeeData = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.ByGroupNumber,
      withCredentials: false,
    })
      .then((response) => {
        if (response.data == "Timecard_Member_Not_Found") {
          setValidTimecardUser(false);
        }
        else {
          setValidTimecardUser(false);
          let data = response.data.data;
          setEmployeeData(data);
        }
      })
      .catch((e) => {
        setEmployeeData([]);
      });
  };

  const handleEmployeeChange = (event) => {
    let empId = event.target.value?.empId;
    setSelectEmployee(empId);
    setBindDataGrid({
      skip: initialDataState.skip,
      take: initialDataState.take,
    });

    setTimecardPages({
      skip: initialDataState.skip,
      take: initialDataState.take,
    })
    let index = employeeData.findIndex((emp) => emp.empId == empId);
    if (index > -1) {
      setCurrentEmployee(employeeData[index]);
    }
  };

  const handleClockOut = () => {
    axiosInstance({
      method: "POST",
      url:
        TimecardEndPoints.clockOut +
        `?empid=${checkboxData.empID}&headerId=${checkboxData.id}`,
      withCredentials: false,
    })
      .then((response) => {
        getListData();
        getTimeCardStatus(selectEmployee, checkboxData.id);
      })
      .catch(() => { });
  };

  const breadScrumData = [
    {
      title: "Timecard",
      link: "",
    },
    {
      title: "Manage",
      link: "",
    },
    {
      title: "Timecard",
      link: "",
    },
  ];

  let gridData2 = useMemo(() => {
    return dataResult.map((item) => ({
      ...item,
      [SELECTED_FIELD]: selectedState[idGetter(item)],
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataResult, selectedState, timecardPages]);

  const ApproveTimeSheet = (data, type) => {
    axiosInstance({
      method: "POST",
      url:
        TimecardEndPoints.TimeCardApprove +
        "?approvedBy=" +
        type +
        "&headerId=" +
        editID,
      data: data,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Approved successfully");
        setBindDataGrid({})
        // timeCardReportData();
        setDetailCheckbox([]);
        setSelectedState([]);
      })
      .catch(() => { });
  };

  useEffect(() => {
    if (employeeData) {
      getEmployeeDetail();
    }
  }, [employeeData]);

  const getEmployeeDetail = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.EmployeeDetail,
      withCredentials: false,
    })
      .then((response) => {
        if (response.data == "Timecard_Member_Not_Found") {
          setValidTimecardUser(false);
        } else {
          setValidTimecardUser(true);
          let data = response.data;
          setEmployeeDetail(data);
          let employeeRecord = employeeData.find((x) => x.empId == data.empId);
          setCurrentEmployee(employeeRecord);
          setSelectEmployee(data.empId);
        }
      })
      .catch(() => { });
  };

  const rowRender = (trElement, rowProps) => {
    const addedByOthers = rowProps?.dataItem?.addedByOthers ? { backgroundColor: "#c9ccf9" } : {}
    const style = checkboxData?.supApprovalDate
      ? { backgroundColor: "lightgreen" }
      : {};

    return cloneElement(trElement, {
      style: { ...trElement.props.style, ...style, ...addedByOthers },
    });
  };
  let isAllowEditAction = true;
  if (
    checkboxData?.payRollDate
    || (!employeeDetail?.isSupervisor && checkboxData?.supApprovalDate)
  ) {
    isAllowEditAction = false;
  } else if (employeeDetail?.empId == currentEmployee.empId) {
    isAllowEditAction = !employeeDetail.isTimecardSuppresed
  }
  else {
    isAllowEditAction = employeeDetail.isSupervisor
  }

  let isAllowAction = true;
  if (
    checkboxData?.payRollDate
    || (!employeeDetail?.isSupervisor && checkboxData?.supApprovalDate)
  ) {
    isAllowAction = false;
  }
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Timecard Management')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("TCM", 1) && isValidTimecardUser && (
        <div>
          <CustomBreadScrum data={breadScrumData} />
          <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
            <div className="d-flex k-flex-column">
              <h1>Timecard</h1>
            </div>
          </div>

          <div className="">
            <div className="d-flex k-justify-content-between k-align-items-between w-100 mb-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                {checkPrivialgeGroup("TYearD", 1) && (
                  <DropDownList
                    style={{
                      width: "250px",
                    }}
                    className="app-dropdown me-2 mb-2"
                    data={yearOptions}
                    defaultValue={new Date().getFullYear()}
                    onChange={handleYearChange}
                  />
                )}
                {checkPrivialgeGroup("TEmployeeD", 1) &&
                  (employeeDetail.isSupervisor || employeeDetail.isPayrollSpecialist) ? (
                  <DropDownList
                    style={{
                      width: "250px",
                    }}
                    className="app-dropdown mb-2"
                    onChange={handleEmployeeChange}
                    value={currentEmployee}
                    data={employeeData}
                    textField="fullName"
                    popupSettings={{ width: "auto" }}
                  />
                ) : (
                  <span
                    className="border border-2 px-2 rounded"
                    style={{ padding: "7px" }}
                  >
                    {currentEmployee.fullName}
                  </span>
                )}
              </div>
            </div>
            {checkPrivialgeGroup("TGOne", 1) && (
              <Grid
                data={reportData.map((item) => ({
                  ...item,
                  [SELECTED_FIELD]: selectedState[idGetter(item)],
                }))}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [5, 10, 15, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                onRowClick={rowClick}
                onPageChange={pageChange}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  drag: false,
                  cell: false,
                  mode: "multiple",
                }}
                onSelectionChange={onTimeCardSelection}
                sortable={true}
                sort={reportSort}
                onSortChange={(e) => {
                  onSortReportChange(e);
                }}
              >
                <GridColumn
                  field="startDate"
                  title="Start Date"
                  format="{0:MM/dd/yyyy}"
                  filter="date"
                  cell={myCustomDateCell}
                />
                <GridColumn
                  field="endDate"
                  title="End Date"
                  format="{0:MM/dd/yyyy}"
                  filter="date"
                  cell={myCustomDateCell}
                />
                <GridColumn
                  field="payRollDate"
                  title="Payroll Approval Date"
                  cell={myCustomDateCell}
                />
                <GridColumn
                  field="empApprovalDate"
                  title="Employee Approval Date"
                  cell={myCustomDateCell}
                />
                <GridColumn
                  field="supApprovalDate"
                  title="Supervisor Approval Date"
                  format="{0:MM/dd/yyyy}"
                  filter="date"
                  cell={myCustomDateCell}
                />
              </Grid>
            )}
          </div>

          <div className="d-flex mt-5 k-justify-content-between">
            <div className="k-w-full d-flex flex-column"></div>
            <div className="k-w-full">
              {isAllowAction && (
                <div className="d-flex justify-content-end">
                  {clockBtn?.showButtons ? (
                    <>
                      {checkPrivialgeGroup("AddTCEB", 2) && (
                        <Button
                          className="k-button k-button-lg k-rounded-lg ms-4 "
                          themeColor={"primary"}
                          onClick={() => toggleDialog("add")}
                          disabled={!checkboxData.id}
                        >
                          Add
                        </Button>
                      )}
                    </>
                  ) : clockBtn?.clockIn && isTimecardHeaderActive ? (
                    <>
                      {checkPrivialgeGroup("AddTCECIB", 2) && (
                        <Button
                          className="k-button k-button-lg k-rounded-lg ms-4 "
                          themeColor={"primary"}
                          onClick={() => toggleDialog("clock")}
                          disabled={!checkboxData.id}
                        >
                          Clock IN
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {checkPrivialgeGroup("AddTCECOB", 2) && isTimecardHeaderActive && (
                        <Button
                          className="k-button k-button-lg k-rounded-lg ms-4 "
                          themeColor={"primary"}
                          onClick={handleClockOut}
                          disabled={!checkboxData.id}
                        >
                          Clock Out
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3" style={{ overflow: "auto" }}>
            {checkPrivialgeGroup("TGTwo", 1) && (
              <Grid
                data={
                  gridData2
                }
                editField={editField}
                onItemChange={itemChange}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  drag: false,
                  cell: false,
                  mode: "multiple",
                }}
                rowRender={rowRender}
                onSelectionChange={onSelectionChange}
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
                  field="startDateTime"
                  title="Start Date"
                  editor="date"
                  width={"100px"}
                  cell={(props) => {
                    if (props.dataItem.startDateTime) {
                      const [year, month, day] = props.dataItem.startDateTime
                        .toString()
                        .split("T")[0]
                        .split("-");
                      let startTime = props.dataItem.startDateTime
                        ? new Date(props.dataItem.startDateTime)
                        : null;
                      let hour;
                      let min;
                      if (startTime) {
                        hour = startTime.getHours();
                        min = startTime.getMinutes();

                        if (hour > 12) {
                          hour = hour - 12;
                        }
                        if (min.toString().length == 1) {
                          min = "0" + min;
                        }
                      }
                      let hourAM;
                      let AM_PM;
                      if (startTime) {
                        hourAM = startTime.getHours();
                        if (hourAM >= 12) {
                          AM_PM = "PM";
                        } else {
                          AM_PM = "AM";
                        }
                      }
                      return (
                        <td
                          colspan="1"
                          class="k-table-td"
                          role="gridcell"
                          aria-colindex="2"
                          aria-selected="false"
                          data-grid-col-index="1"
                        >
                          {`${month}/${day}/${year}`}{" "}
                          {props.dataItem.startDateTime
                            ? `${hour}:${min}`
                            : null}{" "}
                          {props.dataItem.startDateTime ? `${AM_PM}` : null}
                        </td>
                      );
                    } else {
                      <td></td>;
                    }
                  }}
                />
                <GridColumn
                  field="endDateTime"
                  title="End Date"
                  width={"100px"}
                  cell={(props) => {
                    if (props.dataItem.endDateTime) {
                      const [year, month, day] = props.dataItem.endDateTime
                        .toString()
                        .split("T")[0]
                        .split("-");
                      let startTime = props.dataItem.endDateTime
                        ? new Date(props.dataItem.endDateTime)
                        : null;
                      let hour;
                      let min;
                      if (startTime) {
                        hour = startTime.getHours();
                        min = startTime.getMinutes();

                        if (hour > 12) {
                          hour = hour - 12;
                        }
                        if (min.toString().length == 1) {
                          min = "0" + min;
                        }
                      }
                      let hourAM;
                      let AM_PM;
                      if (startTime) {
                        hourAM = startTime.getHours();
                        if (hourAM >= 12) {
                          AM_PM = "PM";
                        } else {
                          AM_PM = "AM";
                        }
                      }
                      return (
                        <td
                          colspan="1"
                          class="k-table-td"
                          role="gridcell"
                          aria-colindex="2"
                          aria-selected="false"
                          data-grid-col-index="1"
                        >
                          {`${month}/${day}/${year}`}{" "}
                          {props.dataItem.endDateTime ? `${hour}:${min}` : null}{" "}
                          {props.dataItem.endDateTime ? `${AM_PM}` : null}
                        </td>
                      );
                    } else {
                      return <td> </td>;
                    }
                  }}
                />
                <GridColumn
                  field="fmlaType.value"
                  title="FMLA Type"
                  width={"100px"}
                />
                <GridColumn
                  field="leaveType"
                  title="Leave Type"
                  width="150px"
                />
                <GridColumn
                  field="job"
                  title="Job"
                  cell={(props) => {
                    return (
                      <td
                        style={{
                          height: "30px",
                        }}
                      >
                        {props.dataItem.job}
                      </td>
                    );
                  }}
                />
                <GridColumn
                  field="hourlyType"
                  title="Hour Type"
                  width="130px"
                  footerCell={() => {
                    return <td className="!k-text-right">Total Hours </td>;
                  }}
                />
                <GridColumn
                  field="hours"
                  title="Hours"
                  maxWidth="70px"
                  format="{0:0.##}"
                  footerCell={() => {
                    return (
                      <td>
                        {gridData2
                          ?.reduce((acc, item) => acc + item.hours, 0)
                          .toFixed(2)}
                      </td>
                    );
                  }}
                />
                <GridColumn
                  field="supApproved"
                  title="Approved"
                  filter="boolean"
                  editable={false}
                  cell={CheckBoxCell}
                  width={"100px"}
                />

                <GridColumn field="memo" title="Memo" width={"150px"} />
                {checkPrivialgeGroup("TGTwoCC", 2) && isAllowEditAction && (
                  <GridColumn
                    filterable={false}
                    width="120px"
                    cell={(props) => {

                      return (<MyCommandCell
                        {...props}
                        edit={enterEdit}
                        remove={remove}
                        update={update}
                        cancel={cancel}
                        editField={editField}
                        employeeDetail={employeeDetail}
                        checkboxData={checkboxData}
                      />)

                    }}
                  />
                )}
              </Grid>
            )}
            <ContextMenu
              show={show}
              offset={offset.current}
              onSelect={ContextMenuOnSelect}
              onClose={ContextMenuCloseMenu}
            >
              <MenuItem
                text="Delete Record"
                data={{
                  action: "delete",
                }}
                icon="delete"
              />
            </ContextMenu>
          </div>
          <div className="mt-3 d-flex flex-wrap justify-content-end">
            {checkPrivialgeGroup("TCEAB", 2) && isAllowAction && (
              <Button
                className="k-button k-button-lg k-rounded-lg ms-4"
                themeColor={"primary"}
                onClick={() => handleApprove("Employee")}
                disabled={!detailCheckbox.length}
              >
                Employee Approve
              </Button>
            )}
            {checkPrivialgeGroup("TCATB", 2) && isAllowAction && (
              <Button
                className="k-button k-button-lg k-rounded-lg ms-4 "
                themeColor={"primary"}
                onClick={() => handleApprove("Supervisor")}
                disabled={!detailCheckbox.length}
              >
                Approve Timesheet
              </Button>
            )}
          </div>
          {visible && (
            <AddTimecardEntry
              toggleDialog={toggleDialog}
              addType={addType}
              selectedDetail={selectedDetail}
              timecardHeaderId={checkboxData}
              getTimeCardStatus={getTimeCardStatus}
            ></AddTimecardEntry>
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
        </div>
      )}
      {!isValidTimecardUser && (
        <div
          style={{
            textAlign: "center",
            fontWeight: "600",
            fontSize: "30px",
            marginTop: "100px"
          }}
        >Timecard is not yet configured.</div>
      )}
    </>
  );
}
