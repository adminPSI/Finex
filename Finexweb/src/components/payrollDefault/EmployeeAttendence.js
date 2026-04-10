import { getter } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { MultiViewCalendar } from "@progress/kendo-react-dateinputs";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { FieldWrapper } from "@progress/kendo-react-form";
import {
  Grid,
  GridColumn,
  GridToolbar,
  getSelectedState
} from "@progress/kendo-react-grid";
import { Checkbox, Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import React, { useEffect, useState } from "react";
import {
  ConfigurationEndPoints,
  LeaveTypeEndPoints,
  PayrollAttendance,
  PayrollEndPoints,
  TimeCardLeaveBalance
} from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import MyCommandCell from "../cells/CommandCell";
import {
  ColumnDatePicker,
  ColumnFormNumberInputForDecimal,
  ColumnFormTextArea,
} from "../form-components";
import HolidayHours from "./modals/HolidayHours";

export default function EmployeeAttendence({
  filterData,
  selectedProject,
  selectedPayrollDateRecord,
  setSelectedPayrollDateRecord,
  checkBoxFormData,
  TimecardLeaveBalanceData,
  getTimecardLeaveBalance,
}) {
  const initialDataState = {
    skip: 0,
    take: 10,
  };
  const [selectLeaveType, setSelectLeaveType] = useState();
  const [selectFamilyLeaveAct, setSelectFamilyLeaveAct] = useState(false);
  const [selectLeaveHours, setSelectLeaveHours] = useState();
  const [srNumber, setSRNumber] = useState();

  const [dropDownValue, setDropDownValue] = useState();
  const [payrollData, setPayrollData] = useState([]);
  const [editPayrollRowData, setEditPayrollRowData] = useState([]);
  const [newPayrollData, setNewPayrollData] = useState([]);
  const [dateSelectionPopup, setDateSelectionPopup] = useState(false);
  const [multiDate, setMultiDate] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const DATA_ITEM_KEY = "srNo";
  const idGetter = getter(DATA_ITEM_KEY);
  const SELECTED_FIELD = "selected";
  const [selectedState, setSelectedState] = useState({});
  const [showFilter, setshowFilter] = useState(false);
  const [filter, setFilter] = useState();
  const [page, setPage] = useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);
  const [pageTotal,] = useState();
  const [bindFundGrid, setBindFundGrid] = useState(null);
  const [, setsearchText] = useState("");
  const IsPostDate = Boolean(filterData.postDate);
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [isHolidayModelShow, setIsHolidayModelShow] = useState(false);
  const [configAllowNegativeLeave, setConfigAllowNegativeLeave] =
    useState(true);


  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindFundGrid) {
        getAttendanceDetails(
          true,
          bindFundGrid.search,
          bindFundGrid.attendanceDate,
          bindFundGrid.day,
          bindFundGrid.leaveType,
          bindFundGrid.leaveHours,
          bindFundGrid.notes,
          bindFundGrid.cskip,
          bindFundGrid.ctake == "All" ? 0 : bindFundGrid.ctake
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindFundGrid]);

  useEffect(() => {
    getLeaveTypeList();
  }, []);

  const getLeaveTypeList = () => {
    axiosInstance({
      method: "get",
      url: LeaveTypeEndPoints.LeaveType,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data?.map((element) => {
          return {
            id: element.id,
            label: element.description,
          };
        });
        setLeaveTypeList(data);
      })
      .catch(() => { });
  };

  const closeMenuHandler = () => {
    setDateSelectionPopup(!dateSelectionPopup);
    setSelectLeaveType(null);
    setSelectLeaveHours(0);
  };

  const editField = "inEdit";

  const enterEdit = (dataItem) => {
    if (IsPostDate) {
      return;
    }
    let newData = payrollData.map((item) =>
      item.srNo == dataItem.srNo
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    const editRowData = payrollData.filter(el => el.srNo == dataItem.srNo)[0];
    setEditPayrollRowData(editRowData);
    setPayrollData(newData);
    setSelectedPayrollDateRecord({ ...dataItem, inEdit: true });
    setSelectedState({ [dataItem.srNo]: true });
  };

  const getAllowNegativeLeaveConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/62",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        //for now return true to all -ve
        setConfigAllowNegativeLeave(true);
      })
      .catch(() => {
        setConfigAllowNegativeLeave(false);
      });
  };

  const discard = (dataItem) => {
    const newData = [...payrollData];
    newData.splice(0, 1);
    setPayrollData(newData);
  };

  const cancel = (dataItem) => {
    const findsrNumber = newPayrollData.filter(el => el.srNo == dataItem.srNo)
    if (findsrNumber.length == 0) {
      let newData = payrollData.map((item) =>
        item.srNo == dataItem.srNo
          ? {
            ...item,
            inEdit: false,
          }
          : item
      );
      if (dataItem.AttendanceId == 0) {
        newData = newData.filter((item) => item.srNo !== dataItem.srNo);
        setSelectedPayrollDateRecord(null);
        setSelectedState({});
      }
      setPayrollData(newData);
    } else {
      let newData = newPayrollData.map((item) =>
        item.srNo == dataItem.srNo
          ? {
            ...item,
            inEdit: false,
          }
          : item
      );
      if (dataItem.AttendanceId == 0) {
        newData = newData.filter((item) => item.srNo !== dataItem.srNo);
        setSelectedPayrollDateRecord(null);
        setSelectedState({});
      }
      setNewPayrollData(newData);
    }
  };

  const update = (dataItem) => {
    var leaveHrs = Number(dataItem?.LeaveHours);
    if (editPayrollRowData.leaveHours < leaveHrs) {
      if (!configAllowNegativeLeave) {
        switch (dataItem?.LeaveType) {
          case "Sick":
            if (
              Number(TimecardLeaveBalanceData["SickBalanceBox"]) < leaveHrs
            ) {
              showErrorNotification("Sick Leave Balance is not sufficient");
              return;
            }
            break;
          // eslint-disable-next-line no-fallthrough
          case "Vacation":
            if (
              Number(TimecardLeaveBalanceData["VacaBalanceBox"]) < leaveHrs
            ) {
              showErrorNotification("Vacation Leave Balance is not sufficient");
              return;
            }
            break;

          // eslint-disable-next-line no-fallthrough
          case "Parental Leave":
            if (
              Number(TimecardLeaveBalanceData["PersBalanceBox"]) < leaveHrs
            ) {
              showErrorNotification("Leave Balance is not sufficient");
              return;
            }

            break;
          // eslint-disable-next-line no-fallthrough
          case "Workers Comp":
            if (
              Number(TimecardLeaveBalanceData["CompBalanceBox"]) < leaveHrs
            ) {
              showErrorNotification("Leave Balance is not sufficient");
              return;
            }
            break;

          default:
        }
      }
    }
    if (typeof dataItem.LeaveType == "object") {
      dataItem.LeaveType = dataItem?.LeaveType?.label;
    }
    dataItem.LeaveHours = parseFloat(dataItem?.LeaveHours || 0);
    dataItem.FamilyLeaveAct = dataItem?.familyLeaveAct
    var payDataItems = payrollData.map((item) =>
      item.srNo == dataItem.srNo ? { ...dataItem, inEdit: false } : item
    );
    savePayrollData(dataItem);
    setPayrollData(payDataItems);
  };

  const savePayrollData = (data) => {
    axiosInstance({
      method: "POST",
      url: PayrollAttendance.UpdateAttendance,
      data: data,
      withCredentials: false,
    })
      .then((response) => {
        if (response.data) {
          let newData = payrollData.map((item) =>
            item.srNo == data.srNo
              ? { ...item, AttendanceId: response?.data?.id, inEdit: false }
              : item
          );
          setPayrollData(newData);
          if (selectedPayrollDateRecord) {
            selectedPayrollDateRecord = newData.find(
              (x) => x.AttendanceId == response?.data?.id
            );
            setSelectedPayrollDateRecord(selectedPayrollDateRecord);
          }
          showSuccessNotification(response?.data?.message);
          getAttendanceDetails(false);
        }
        getTimecardLeaveBalance(
          selectedProject?.empId,
          new Date().getFullYear()
        );
      })
      .catch(() => {
        setPayrollData((pre) =>
          pre.map((item) =>
            item.srNo == data.srNo && item.AttendanceId == 0
              ? { ...item, inEdit: false }
              : item
          )
        );
      });
  };

  useEffect(() => {
    if (selectedPayrollDateRecord) {
      setPayrollData((pre) =>
        pre.map((item) =>
          item.srNo == selectedPayrollDateRecord.srNo
            ? { ...item, ...checkBoxFormData }
            : item
        )
      );
    }
  }, [checkBoxFormData]);

  const add = (dataItem) => {
  };

  const remove = (dataItem) => {
    if (IsPostDate) {
      return;
    }
    setDeleteVisible(dataItem.AttendanceId);
  };

  const deleteAttendance = () => {
    axiosInstance({
      method: "Delete",
      url: PayrollAttendance.DeleteAttendance + "/" + deleteVisible,
      withCredentials: false,
    })
      .then((response) => {
        if (response.status == 200) {
          showSuccessNotification(response.data);
          const newData = payrollData.filter(
            (item) => item.AttendanceId !== deleteVisible
          );
          setPayrollData(newData);
          setDeleteVisible(null);
          if (selectedPayrollDateRecord?.AttendanceId == deleteVisible) {
            setSelectedPayrollDateRecord(null);
            setSelectedState({});
          }
          getTimecardLeaveBalance(
            selectedProject?.empId,
            new Date().getFullYear()
          );
        }
      })
      .catch(() => { });
  };

  const IsEditItemChange = (event) => {
    const newData = newPayrollData.map((item) => {
      if (item.srNo == event.dataItem.srNo) {
        return {
          ...item,
          [event.field || ""]: event.value,
        };
      } else {
        return item;
      }
    });

    setNewPayrollData(newData);
  };

  const itemChange = (event) => {
    const newData = payrollData.map((item) => {
      if (item.srNo == event.dataItem.srNo) {
        return {
          ...item,
          [event.field || ""]: event.value,
        };
      } else {
        return item;
      }
    });
    setPayrollData(newData);
  };

  const onSelectionChange = (event) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    let tmpId;
    let newData = payrollData.map((item) => {
      // eslint-disable-next-line eqeqeq
      if (item.srNo == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
        tmpId = item.AttendanceId;
        setSelectedPayrollDateRecord(item);
      } else {
        item.expanded = false;
      }
      return item;
    });
    if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
      setSelectedState(newSelectedState);
    } else {
      setSelectedState({});
      setSelectedPayrollDateRecord(null);
    }
    setPayrollData(newData);
  };

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      update={update}
      cancel={cancel}
      remove={remove}
      add={add}
      discard={discard}
      editField={editField}
    />
  );

  const DropDownCommandCell = (props) => {
    const { dataItem } = props;

    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value,
        });
      }
      setDropDownValue(e.target.value);
      setSRNumber(dataItem.srNo);
    };
    const field = props.field || "";
    let dataValue = dataItem[field] == null ? "" : dataItem[field];

    if (dataValue == "Other" && dataItem["LeaveDisplayType"]) {
      dataValue = dataItem["LeaveDisplayType"];
    }

    if (typeof dataValue == "string") {
      let index = leaveTypeList.findIndex((type) => type.label == dataValue);
      dataValue = leaveTypeList[index];
    }

    return dataItem.inEdit ? (
      <td>
        <DropDownList
          onChange={handleChange}
          id={"type"}
          name={"Type"}
          textField="label"
          dataItemKey="label"
          data={leaveTypeList}
          value={dataValue}
        />
      </td>
    ) : (
      <td data-grid-col-index={props.columnIndex}>{dataValue?.label}</td>
    );
  };

  const FMLADropDownCommandCell = (props) => {
    const { dataItem } = props;
    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value,
        });
      }
    };

    return dataItem.inEdit ? (
      <td>
        <Checkbox
          onChange={handleChange}
          id={"FamilyLeaveAct"}
          name={"FamilyLeaveAct"}
          checked={dataItem?.FamilyLeaveAct}
        />
      </td>
    ) : (
      <td data-grid-col-index={props.columnIndex}>
        <><Checkbox checked={dataItem?.FamilyLeaveAct} /></>
      </td>
    );
  };

  useEffect(() => {
    setMultiDate(
      payrollData.map((item) =>
        item.AttendanceDate ? new Date(item.AttendanceDate) : null
      )
    );
  }, [payrollData]);

  useEffect(() => {
    getAttendanceDetails();
  }, [selectedProject]);

  const getAttendanceDetails = (
    isSet = true,
    search = "",
    attendanceDate = "",
    day = "",
    leaveType = "",
    leaveHours = "",
    notes = "",
    cskip = page.skip,
    ctake = page.take
  ) => {
    let inputdata = {
      EmpId: selectedProject?.empId,
      FromDate: null,
      ToDate: null,
      skip: page.skip,
      take: page.take
    };
    if (selectedProject?.empId) {
      axiosInstance({
        method: "POST",
        url: TimeCardLeaveBalance.AttendanceDetails,
        data: inputdata,
        withCredentials: false,
      })
        .then((response) => {
          const data = response.data?.Data;
          if (isSet) {
            data?.forEach((x, i) => {
              x.AttendanceDate = x.AttendanceDate
                ? new Date(x.AttendanceDate)
                : null;
              x.srNo = i + 1;
            });
            setPayrollData(data);
            setPage({
              skip: 0,
              take: response.data?.totalCount,
            });
            if (data && data.length) {
              let firstRecord = data[0];
              setSelectedState({ [firstRecord.srNo]: true });
              setSelectedPayrollDateRecord(firstRecord);
            } else {
              setSelectedState({});
              setSelectedPayrollDateRecord(null);
            }
          }
        })
        .catch(() => { });
    }
  };

  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };

  const addAttendence = () => {
    let oldPayrollDates = payrollData.map((x) => x.AttendanceDate?.getTime());
    let newDates = multiDate.filter(
      (x) => !oldPayrollDates.includes(x.getTime())
    );
    const hours = newDates.length;
    const result = hours * selectLeaveHours;
    if (!configAllowNegativeLeave) {
      switch (selectLeaveType?.label) {
        case "Sick":
          if (Number(TimecardLeaveBalanceData["SickBalanceBox"]) < result) {
            showErrorNotification("Sick Leave Balance is not sufficient");
            return;
          }
          break;
        // eslint-disable-next-line no-fallthrough
        case "Vacation":
          if (Number(TimecardLeaveBalanceData["VacaBalanceBox"]) < result) {
            showErrorNotification("Vacation Leave Balance is not sufficient");
            return;
          }
          break;

        // eslint-disable-next-line no-fallthrough
        case "Parental Leave":
          if (Number(TimecardLeaveBalanceData["PersBalanceBox"]) < result) {
            showErrorNotification("Leave Balance is not sufficient");
            return;
          }

          break;
        // eslint-disable-next-line no-fallthrough
        case "Workers Comp":
          if (Number(TimecardLeaveBalanceData["CompBalanceBox"]) < result) {
            showErrorNotification(" 2 Leave Balance is not sufficient");
            return;
          }
          break;

        default:
      }
    }
    let newRecords = [];
    let srCount = payrollData.length;

    newDates.forEach((date) => {
      srCount++;
      let newRecord = {
        srNo: srCount,
        AttendanceId: 0,
        Empid: selectedProject?.empId,
        AttendanceDate: date,
        FamilyLeaveAct: selectFamilyLeaveAct,
        LeaveType: selectLeaveType ?? null,
        LeaveHours: selectLeaveHours ?? 0,
        Day: date.toLocaleDateString("en-US", { weekday: "long" }),
        Notes: "",
        inEdit: true,
      };
      newRecords.push(newRecord);
    });

    const finalArr = [...payrollData, ...newRecords];
    setNewPayrollData(newRecords);
    setPayrollData(payrollData);
    closeMenuHandler();
  };

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindFundGrid({
        ...bindFundGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindFundGrid({
        ...bindFundGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: payrollData.length,
      });
    }
  };

  const filterChange = (event) => {
    var attendanceDate = "";
    var day = "";
    var leaveType = "";
    var leaveHours = "";
    var notes = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "Day") {
          day = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "LeaveType") {
          leaveType = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "LeaveHours") {
          leaveHours = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "Notes") {
          notes = event.filter.filters[i].value;
        }

        if (event.filter.filters[i].field == "AttendanceDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          attendanceDate = date;
        }
      }
    }

    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindFundGrid({
      ...bindFundGrid,
      search: undefined,
      cskip: 0,
      attendanceDate,
      day,
      leaveType,
      leaveHours,
      notes,
    });
    setFilter(event.filter);
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };

  const handleSearch = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindFundGrid({
      ...bindFundGrid,
      search: value,
      cskip: 0,
      attendanceDate: undefined,
      day: undefined,
      leaveType: undefined,
      leaveHours: undefined,
      notes: undefined,
    });
  };

  const handleUpdateEmployeeAttendence = () => {
    const dataMap = newPayrollData.map((el) => {
      if (!configAllowNegativeLeave) {
        switch (el?.LeaveType?.label) {
          case "Sick":
            if (
              Number(TimecardLeaveBalanceData["SickBalanceBox"]) <
              Number(el?.LeaveHours)
            ) {
              showErrorNotification("Sick Leave Balance is not sufficient");
              return;
            }
            break;
          // eslint-disable-next-line no-fallthrough
          case "Vacation":
            if (
              Number(TimecardLeaveBalanceData["VacaBalanceBox"]) <
              Number(el?.LeaveHours)
            ) {
              showErrorNotification("Vacation Leave Balance is not sufficient");
              return;
            }
            break;

          // eslint-disable-next-line no-fallthrough
          case "Parental Leave":
            if (
              Number(TimecardLeaveBalanceData["PersBalanceBox"]) <
              Number(el?.LeaveHours)
            ) {
              showErrorNotification("Leave Balance is not sufficient");
              return;
            }

            break;
          // eslint-disable-next-line no-fallthrough
          case "Workers Comp":
            if (
              Number(TimecardLeaveBalanceData["CompBalanceBox"]) <
              Number(el?.LeaveHours)
            ) {
              showErrorNotification("Leave Balance is not sufficient");
              return;
            }
            break;

          default:
        }
      }
      return {
        attendanceID: el.AttendanceId,
        empid: el.Empid,
        attendanceDate: el?.AttendanceDate,
        leaveType: el?.LeaveType?.label,
        leaveTypeCheckBox: true,
        leaveHours: el?.LeaveHours,
        day: el.Day,
        notes: el.Notes,
        familyLeaveAct: el?.FamilyLeaveAct,
        noEmployeeRequest: true,
        wcTrack: true,
        lockedRecord: true,
      };
    });
    const findUndefined = dataMap?.filter((el) => el == undefined);
    if (findUndefined.length > 0) {
      showErrorNotification("Leave Balance is not sufficient");
      return;
    }

    try {
      axiosInstance({
        method: "POST",
        url: PayrollEndPoints.PostAttendanceBulk,
        data: dataMap,
        withCredentials: false,
      })
        .then((response) => {
          const data = response.message;
          setNewPayrollData([]);
          setBindFundGrid({
            ...bindFundGrid,
            search: undefined,
            cskip: 0,
            attendanceDate: undefined,
            day: undefined,
            leaveType: undefined,
            leaveHours: undefined,
            notes: undefined,
          });
          getTimecardLeaveBalance(
            selectedProject?.empId,
            new Date().getFullYear()
          );
        })
        .catch(() => { });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelEmployeeAttendence = () => {
    setNewPayrollData([]);
    setSelectLeaveType(null);
    setSelectLeaveHours(0);
  };
  useEffect(() => {
    if (srNumber !== undefined && dropDownValue !== undefined) {
      const addMapKey = newPayrollData?.map((item, index) =>
        item.srNo == srNumber
          ? {
            ...item,
            LeaveType: dropDownValue,
          }
          : item
      );
      setNewPayrollData(addMapKey);
    }
  }, [srNumber, dropDownValue]);

  const handleHolidayHours = async (dataIndex) => {
    const data = {
      groupNumber: dataIndex?.comboGroupNumber,
      scheduleId: dataIndex?.comboHolidaySchedule?.id,
      holidayType: dataIndex?.comboHolidayType == "Holiday",
      endDate: dataIndex?.endDate,
      endTime: dataIndex?.endDateTime,
      startDate: dataIndex?.startDate,
      startTime: dataIndex?.startDateTime,
    }

    await axiosInstance({
      method: "POST",
      url: TimeCardLeaveBalance.UpdateHolidayCalamityHours,
      withCredentials: false,
      data: data
    })
      .then((response) => {
        getAttendanceDetails()
        setIsHolidayModelShow(false)
      })
      .catch((error) => {
        console.log("error", error)
      });
  }
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollRun')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      <div className="w-100 mt-5">
        <div className="d-flex align-items-start mb-3 w-100">
          <div className=" me-3 mb-3">
            <div className="mb-3">
              {checkPrivialgeGroup("AddPRASB", 2) && <Button
                className="k-button k-button-lg k-rounded-lg  gap-10 me-2"
                themeColor={"primary"}
                style={{ width: "200px", height: "40px" }}
                onClick={closeMenuHandler}
              >
                Select Date
              </Button>}
              {checkPrivialgeGroup('PRAHolidayAB', 2) && <Button
                className="k-button k-button-lg k-rounded-lg  gap-10 me-2"
                themeColor={"primary"}
                style={{ width: "250px", height: "40px" }}
                disabled={IsPostDate}
                onClick={() => {
                  setIsHolidayModelShow(true)
                }}
              >
                Add Holiday Hours
              </Button>}
              <Button
                className="k-button k-button-lg k-rounded-lg d-none"
                themeColor={"primary"}
                style={{ width: "100px", height: "40px" }}
              >
                Save
              </Button>
            </div>
            {newPayrollData?.length !== 0 && newPayrollData !== undefined && (
              <div className="mb-4">
                <Grid
                  resizable={true}
                  data={newPayrollData?.map((item) => ({
                    ...item,
                    [SELECTED_FIELD]: selectedState[idGetter(item)],
                  }))}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    drag: false,
                    mode: "multiple",
                    cell: false,
                  }}
                  dataItemKey={DATA_ITEM_KEY}
                  editField={editField}
                  onItemChange={IsEditItemChange}
                  onSelectionChange={onSelectionChange}
                >
                  <GridToolbar>
                    <div className="row col-sm-12 d-flex justify-content-end mr-2">
                      <Button
                        className="k-button k-button-lg k-rounded-lg  gap-10 me-2"
                        themeColor={"primary"}
                        style={{ width: "100px", height: "40px" }}
                        onClick={handleUpdateEmployeeAttendence}
                      >
                        Update All
                      </Button>
                      <Button
                        className="k-button k-button-lg k-rounded-lg  gap-10 me-2"
                        themeColor={"primary"}
                        style={{ width: "100px", height: "40px" }}
                        onClick={handleCancelEmployeeAttendence}
                      >
                        Cancel All
                      </Button>
                    </div>
                  </GridToolbar>

                  <GridColumn
                    field="AttendanceDate"
                    format="{0:MM/dd/yyyy}"
                    filterCell={ColumnDatePicker}
                    title="Date"
                    cell={(props) => {
                      let date = props.dataItem?.AttendanceDate
                        ? new Date(props.dataItem?.AttendanceDate)
                        : null;
                      const dateString = date
                        ? date.toLocaleDateString()
                        : null;
                      return (
                        <td data-grid-col-index={props.columnIndex}>
                          {date ? dateString : null}
                        </td>
                      );
                    }}
                  />
                  <GridColumn
                    field="Day"
                    title="Day"
                    cell={(props) => {
                      return (
                        <td data-grid-col-index={props.columnIndex}>
                          {props.dataItem?.Day}
                        </td>
                      );
                    }}
                  />
                  <GridColumn
                    field="LeaveType"
                    title="Leave Type"
                    cell={DropDownCommandCell}
                  />

                  <GridColumn
                    field="FamilyLeaveAct"
                    title="Is FMLA"
                    cell={FMLADropDownCommandCell}
                  />
                  <GridColumn
                    field="LeaveHours"
                    title="Hours"
                    cell={ColumnFormNumberInputForDecimal}
                  />
                  <GridColumn
                    field="Notes"
                    title="Notes"
                    cell={ColumnFormTextArea}
                  />
                  <GridColumn
                    cell={(data) => {
                      return (
                        <td>
                          <Button
                            type="button"
                            onClick={() => cancel(data.dataItem)}
                          >
                            Cancel
                          </Button>
                        </td>
                      );
                    }}
                    width="150px"
                    filterable={false}
                  />
                </Grid>
              </div>
            )}
            <Grid
              resizable={true}
              data={payrollData.map((item) => ({
                ...item,
                [SELECTED_FIELD]: selectedState[idGetter(item)],
              }))}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                drag: false,
                mode: "multiple",
                cell: false,
              }}
              dataItemKey={DATA_ITEM_KEY}
              editField={editField}
              onItemChange={itemChange}
              onSelectionChange={onSelectionChange}
              filterable={showFilter}
              filter={filter}
              skip={page.skip}
              take={page.take}
              total={pageTotal}
              onFilterChange={filterChange}
              pageable={{
                buttonCount: 4,
                pageSizes: [10, 15, 50, "All"],
                pageSizeValue: pageSizeValue,
              }}
              onPageChange={pageChange}
            >
              <GridToolbar>
                <div className="row col-sm-12 d-flex justify-content-between">
                  <div className="col-sm-6 d-grid gap-3 d-md-block">
                    <Button
                      className="buttons-container-button"
                      fillMode="outline"
                      themeColor={"primary"}
                      onClick={MoreFilter}
                    >
                      <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                      &nbsp; More Filter
                    </Button>
                  </div>
                  <div className="col-sm-6 d-flex align-items-center justify-content-center">
                    <div className="input-group">
                      <Input
                        className="form-control border-end-0 border"
                        onChange={handleSearch}
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
                field="AttendanceDate"
                format="{0:MM/dd/yyyy}"
                filterCell={ColumnDatePicker}
                title="Date"
                cell={(props) => {
                  let date = props.dataItem?.AttendanceDate
                    ? new Date(props.dataItem?.AttendanceDate)
                    : null;
                  const dateString = date ? date.toLocaleDateString() : null;
                  return (
                    <td data-grid-col-index={props.columnIndex}>
                      {date ? dateString : null}
                    </td>
                  );
                }}
              />
              <GridColumn
                field="Day"
                title="Day"
                cell={(props) => {
                  return (
                    <td data-grid-col-index={props.columnIndex}>
                      {props.dataItem?.Day}
                    </td>
                  );
                }}
              />
              <GridColumn
                field="LeaveType"
                title="Leave Type"
                cell={DropDownCommandCell}
              />
              <GridColumn
                field="HourType"
                title="Hour Type"
                cell={(props) => {
                  return (
                    <td data-grid-col-index={props.columnIndex}>
                      {props.dataItem?.HourType}
                    </td>
                  );
                }}
              />
              <GridColumn
                field="FamilyLeaveAct"
                title="Is FMLA"
                cell={FMLADropDownCommandCell}
              />
              <GridColumn
                field="LeaveHours"
                title="Hours"
                cell={ColumnFormNumberInputForDecimal}
              />
              <GridColumn
                field="Notes"
                title="Notes"
                cell={ColumnFormTextArea}
              />
              {checkPrivialgeGroup("PRACC", 3) && <GridColumn cell={CommandCell} width="150px" filterable={false} />}
            </Grid>
          </div>
        </div>
      </div>

      {
        isHolidayModelShow && (
          <HolidayHours setIsHolidayModelShow={setIsHolidayModelShow} onSubmit={handleHolidayHours} />
        )
      }
      {dateSelectionPopup && (
        <Dialog width={600} title={"Add Date"} onClose={closeMenuHandler}>
          <div className="my-4">
            <MultiViewCalendar
              mode="multiple"
              value={multiDate}
              onChange={(event) => {
                setMultiDate(event.value);
              }}
              views={2}
              footer={false}
            />
          </div>
          <div style={{ marginTop: "15px" }}>
            <FieldWrapper style={{ marginBottom: "15px" }}>
              <Label htmlFor="type-label-input" style={{ marginBottom: "6px" }}>
                Leave Type
              </Label>
              <DropDownList
                onChange={(e) => {
                  setSelectLeaveType(e.value);
                }}
                id={"type"}
                name={"Type"}
                textField="label"
                dataItemKey="label"
                data={leaveTypeList}
                value={selectLeaveType}
              />
            </FieldWrapper>
          </div>
          <div style={{ marginTop: "15px" }}>
            <FieldWrapper style={{ marginBottom: "6px" }}>
              <Label htmlFor="type-label-input">Leave Hours Per Days</Label>
              <NumericTextBox
                type="text"
                onChange={(e) => setSelectLeaveHours(e.target.value)}
                value={selectLeaveHours}
                className="k-textbox"
                min={0}
                max={10000}
              />
            </FieldWrapper>
          </div>
          <div style={{ marginTop: "15px" }}>
            <Label htmlFor="type-label-input" style={{ marginBottom: "6px" }}>
              Is FMLA
            </Label>
            <Checkbox
              onChange={(e) => {
                setSelectFamilyLeaveAct(e.value);
              }}
              id={"fmlaType"}
              name={"fmlaType"}
              textField="label"
              dataItemKey="id"
              checked={selectFamilyLeaveAct}
              style={{ marginLeft: "6px" }}
            />
          </div>
          <Button
            className="k-button k-button-lg k-rounded-lg  gap-10 me-2 mt-1"
            themeColor={"primary"}
            style={{ width: "100%", height: "40px" }}
            onClick={addAttendence}
          >
            Add
          </Button>
        </Dialog>
      )}

      {deleteVisible && (
        <Dialog title={<span>Please confirm</span>} onClose={closeDeleteDialog}>
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
              onClick={closeDeleteDialog}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={deleteAttendance}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
}
