import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  ContextMenu,
  MenuItem,
} from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import {
  Grid,
  GridColumn,
  GridToolbar,
  getSelectedState,
} from "@progress/kendo-react-grid";
import ApplyLeave from "../../modal/ApplyLeave";
import RejectReason from "../../modal/RejectReason";
import {
  TimecardEndPoints,
  AuthenticationEndPoints,
  ConfigurationEndPoints,
  EmplTimecardEndPoints,
  TimeCardLeaveBalance,
} from "../../../EndPoints";
import axiosInstance from "../../../core/HttpInterceptor";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { getter } from "@progress/kendo-data-query";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../NotificationHandler/NotificationHandler";
import Constants from "../../common/Constants";

export default function EmployeeLeaveRequest(props) {
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState({});
  const [selectedPState, setSelectedPState] = useState({});
  const [allowAddLeaveRequest, setAllowAddLeaveRequest] = useState(false);
  const [allowDeleteLeaveRequest, setAllowDeleteLeaveRequest] = useState(false);
  
  const [checkboxData, setCheckboxData] = useState([]);
  const [modifyApprovedLeave, setModifyApprovedLeave] = useState(false);
  const [pageSizeValue, setPageSizeValue] = useState();
  const [pageTotal, setPageTotal] = useState();
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = useState(initialDataState);
  const toggleDialog = () => {
    setVisible(!visible);
    if (visible) {
      setFormInit({});
    }
    setBindLeaveRequestData({ ...bindLeaveRequestData });
  };
  const [visibleLeaveReason, setVisibleLeaveReason] = useState(false);
  const [formInit, setFormInit] = useState({});

  const toggleLeaveRejectReason = () => {
    setVisibleLeaveReason(!visibleLeaveReason);
  };

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
  const [dataResult, setDataResult] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(0);
  const offset = useRef({
    left: 0,
    top: 0,
  });
  const [show, setShow] = useState(false);

  useEffect(() => {
    getModifyApprovedLeaveConfig();
    if (dataResult.length) {
      addRecord();
    }
    handlePrivilegeByGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [employeeData, setEmployeeData] = useState();
  
  const [currentEmployee, setCurrentEmployee] = useState({});
  const [employeeDetail, setEmployeeDetail] = useState({});
  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);
  const [TimecardLeaveBalance, setTimecardLeaveBalance] = useState({});
  const [bindLeaveRequestData, setBindLeaveRequestData] = useState({
    direction: true,
    sortKey: "lRDate",
    search: "",
    lRDate: "",
    startDate: "",
    endDate: "",
    employeeApprovedDate: "",
    supervisorApprovedDate: "",
    fmlaType: "",
    leaveType: "",
    reasonForLeave: "",
    reasonForDisApproval: "",
    status: "",
  });
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState();

  useEffect(() => {
    getEmployeeData();
  }, []);
  useEffect(() => {
    if (employeeData) {
      getEmployeeDetail();
    }
  }, [employeeData]);

  useEffect(() => {
    if (currentEmployee && currentEmployee.empId) {
      const getData = setTimeout(() => {
        getLeaveReqList();
      }, 1000);
      return () => clearTimeout(getData);
    }
  }, [currentEmployee, bindLeaveRequestData]);

  const handlePrivilegeByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=Leave Management`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch((err) => {});
  };

  const handleEmployeeChange = (event) => {

    let empId = event.target.value?.empId;
    let index = employeeData.findIndex((emp) => emp.empId == empId);
    if (index > -1) {
      setCurrentEmployee(employeeData[index]);
    }
    getTimecardLeaveBalance(empId);
    setPage({
      skip: 0,
      take: 10,
    });
    setPageSizeValue(10);
  };

  const getEmployeeDetail = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.EmployeeDetail,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setEmployeeDetail(data);
        let employeeRecord = employeeData.find((x) => x.empId == data.empId);
        setCurrentEmployee(employeeRecord);
        if (employeeRecord && employeeRecord.empId) {
          getTimecardLeaveBalance(employeeRecord.empId);
        }
      })
      .catch(() => {});
  };

  const getEmployeeData = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.ByGroupNumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        if (data) {
          setEmployeeData(data);
        }
      })
      .catch((e) => {
        setEmployeeData([]);
      });
  };

  const initialDetailSort = [
    {
      field: "modifiedDate",
      dir: "asc",
    },
  ];
  const [detailSort, setDetailSort] = useState(initialDetailSort);
  const onSortDetailChange = (event) => {
    setDetailSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    bindLeaveRequestData.direction = direction;
    bindLeaveRequestData.sortKey = sortColumn;
    getLeaveReqList();
  };

  const MoreFilter = () => {
    setShowFilter(!showFilter);
  };

  const filterData = (e) => {
    let value = e.target.value;
    setBindLeaveRequestData({
      ...bindLeaveRequestData,
      search: value,
    });
  };

  const pageChange = (event) => {
    const targetEvent = event.syntheticEvent;
    const take =
      targetEvent.value == "All"
        ? pageTotal
        : isNaN(event.page.take)
          ? pageTotal
          : event.page.take;
    if (event.page.take <= 15) {
      setPageSizeValue(event.page.take);
    } else {
      setPageSizeValue("All");
    }
    setPage({
      ...event.page,
      take,
    });
    page.skip = event.page.skip;
    page.take = take;
    getLeaveReqList();
  };

  const getModifyApprovedLeaveConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/63",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setModifyApprovedLeave(value);
      })
      .catch(() => {});
  };

  const checkPrivilegeGroup = (resourceName, privilegeId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourceName &&
        item.privileges_id == privilegeId
    );
  };
  const getLeaveReqList = () => {
    axiosInstance({
      method: "GET",
      url:
        TimecardEndPoints.LeaveRequest +
        "?desc=" +
        bindLeaveRequestData.direction +
        "&sortKey=" +
        bindLeaveRequestData.sortKey +
        "&supervisor=" +
        false +
        "&empId=" +
        currentEmployee.empId +
        "&search=" +
        bindLeaveRequestData.search +
        "&lRDate=" +
        bindLeaveRequestData.lRDate +
        "&startDate=" +
        bindLeaveRequestData.startDate +
        "&endDate=" +
        bindLeaveRequestData.endDate +
        "&employeeApprovedDate=" +
        bindLeaveRequestData.employeeApprovedDate +
        "&supervisorApprovedDate=" +
        bindLeaveRequestData.supervisorApprovedDate +
        "&fmlaType=" +
        bindLeaveRequestData.fmlaType +
        "&leaveType=" +
        bindLeaveRequestData.leaveType +
        "&reasonForLeave=" +
        bindLeaveRequestData.reasonForLeave +
        "&reasonForDisApproval=" +
        bindLeaveRequestData.reasonForDisApproval +
        "&status=" +
        bindLeaveRequestData.status +
        "&skip=" +
        page.skip +
        "&take=" +
        page.take,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setDataResult(data);
        setPageTotal(response?.data?.total);
        
        getTimecardLeaveBalance(currentEmployee.empId);
        setAllowAddLeaveRequest(employeeDetail.empId == currentEmployee.empId);
        setAllowDeleteLeaveRequest(employeeDetail.empId == currentEmployee.empId);

      })
      .catch(() => {});
  };

  const filterChange = (event) => {
    var lRDate = "";
    var startDate = "";
    var endDate = "";
    var employeeApprovedDate = "";
    var supervisorApprovedDate = "";
    var fmlaType = "";
    var leaveType = "";
    var reasonForLeave = "";
    var reasonForDisApproval = "";
    var status = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "lRDate") {
          lRDate = dateFormate(event.filter.filters[i].value);
        }
        if (event.filter.filters[i].field == "beginDate") {
          startDate = dateFormate(event.filter.filters[i].value);
        }
        if (event.filter.filters[i].field == "endDate") {
          endDate = dateFormate(event.filter.filters[i].value);
        }
        if (event.filter.filters[i].field == "employeeApprovedDate") {
          employeeApprovedDate = dateFormate(event.filter.filters[i].value);
        }
        if (event.filter.filters[i].field == "supervisorApprovedDate") {
          supervisorApprovedDate = dateFormate(event.filter.filters[i].value);
        }
        if (event.filter.filters[i].field == "fmlaType.value") {
          fmlaType = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "leaveType.description") {
          leaveType = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "reasonForLeave") {
          reasonForLeave = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "reasonForDisApproval") {
          reasonForDisApproval = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "status") {
          status = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: 10,
    });
    setBindLeaveRequestData({
      ...bindLeaveRequestData,
      skip: 0,
      take: page.take,
      lRDate,
      startDate,
      endDate,
      employeeApprovedDate,
      supervisorApprovedDate,
      fmlaType,
      leaveType,
      reasonForLeave,
      reasonForDisApproval,
      status,
      search: "",
    });
    setFilter(event.filter);
  };

  const dateFormate = (originalDate) => {
    let dateformat = new Date(originalDate);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
    return date;
  };

  const dataStateChange = (event) => {
    setDataState(event.dataState);
  };
  const [editID, setEditID] = useState(null);
  const rowClick = (event) => {
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

  const LeaveRequestStatus = (data) => {
    let leaveTypeData = {
      id: data.id,
      orgAccId: data.orgAccId,
      groupId: data.groupId,
      empId: data.empId,
      empApproved: data.empApproved,
      lrHeaderID: data.lrHeaderID,
      lrDate: data.lrDate,
      hours: data.hours,
      reasonForLeaveID: data.reasonForLeaveID,
      leaveTypeID: data.leaveTypeID,
      beginDate: data.beginDate,
      endDate: data.endDate,
      returnDate: data.returnDate,
      reasonForLeave: data.reasonForLeave,
      fmlaid: data.fmlaid,
      supervisorID: data.supervisorID,
      modifiedBy: data.modifiedBy,
      modifiedDate: new Date(),
      addedBy: data.addedBy,
      addedWhenDate: data.addedWhenDate,
      deletedDate: data.deletedDate,
      deletedByID: data.deletedByID,
      leaveCodeID: data.leaveCodeID,
      isSupervisorApproved: data.isSupervisorApproved,
      reasonForDisApproval: data.reasonForDisApproval,
      supervisorApprovedDate: new Date().toISOString(),
      status: data.status,
    };
    axiosInstance({
      method: "PUT",
      url: TimecardEndPoints.TimeCardLeaveRequest + "/" + data.id,
      data: leaveTypeData,
      withCredentials: false,
    })
      .then((response) => {
        setBindLeaveRequestData({ ...bindLeaveRequestData });
      })
      .catch(() => {});
  };

  const handleContextMenu = (e, data) => {
    e.preventDefault();
    setSelectedRowId(data);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const ContextMenuCloseMenu = () => {
    setShow(false);
    setSelectedRowId({});
  };
  const ContextMenuOnSelect = async (e) => {
    let id = +selectedRowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "reject":
          setShow(false);
          toggleLeaveRejectReason();
          break;
        case "approve":
          setShow(false);
          selectedRowId.empApproved = true;
          selectedRowId.reasonForDisApproval = "";
          LeaveRequestStatus(selectedRowId);
          break;
        case "edit":
          let data = Object.assign({}, selectedRowId);
          data.beginDate = new Date(data.beginDate);
          data.endDate = new Date(data.endDate);
          data.leaveReason = data.reasonForLeave;
          data.edit = true;
          setFormInit(data);
          toggleDialog();
          break;
        case "delete":
          openDeleteDialog(id);
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

  const callRejectReason = (reason) => {
    selectedRowId.empApproved = false;
    selectedRowId.reasonForDisApproval = reason;
    LeaveRequestStatus(selectedRowId);
  };

  const openDeleteDialog = (id) => {
    setDeleteVisible(id);
  };
  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };

  const deleteRequest = () => {
    axiosInstance({
      method: "DELETE",
      url: TimecardEndPoints.TimeCardLeaveRequest + "/" + deleteVisible,
      withCredentials: false,
    })
      .then((response) => {
        closeDeleteDialog();
        setBindLeaveRequestData({ ...bindLeaveRequestData });
        showSuccessNotification("Deleted Successfully");
      })
      .catch(() => {});
  };

  const setApproveStatus = () => {
    if (checkboxData.length) {
      let Ids = checkboxData.map((element) => element.id);
      employeeApproveLeave(Ids);
      setCheckboxData([]);
      setSelectedState({});
    } else {
      showErrorNotification("No row is selected");
    }
  };

  const onSelectionChange = useCallback(
    (event) => {
      if (event.dataItem) {
        let currentCheckBoxList = [...checkboxData];
        if (event.dataItem.selected) {
          currentCheckBoxList = currentCheckBoxList.filter(
            (p) => p.id !== event.dataItem.id
          );
          const data = { ...selectedState };
          delete data[event.dataItem.id];
          setSelectedState(data);
          event.dataItem.selected = false;
        } else {
          if (
            event.dataItem.isSupervisorApproved ||
            event.dataItem.isAAApproved
          ) {
            const msg = event.dataItem.isSupervisorApproved
              ? "supervisor"
              : event.dataItem.isAAApproved
                ? "AA"
                : "supervisor";
            showErrorNotification(`Leave approved by ${msg}.`);
          } else {
            setSelectedState({ ...selectedState, [event.dataItem.id]: true });
            currentCheckBoxList.push(event.dataItem);
          }
        }

        setCheckboxData(currentCheckBoxList);
      } else {
        const newSelectedState = getSelectedState({
          event,
          selectedState: selectedPState,
          dataItemKey: DATA_ITEM_KEY,
        });

        setSelectedPState(newSelectedState);

        if (selectedState && Object.keys(selectedState).length) {
          let currentCheckBoxList = [...checkboxData];

          const falseKey = Object.keys(newSelectedState)[0];

          const tmpData = event.dataItems.find(
            (item) => item.id.toString() == falseKey.toString()
          );

          if (selectedState[tmpData.id]) {
            const currentCheckBoxList = [...checkboxData];

            delete selectedState[tmpData.id];
            setSelectedState({ ...selectedState });
            setCheckboxData(
              currentCheckBoxList.filter((item) => item.id !== tmpData.id)
            );
          } else {
            if (tmpData.isSupervisorApproved || tmpData.isAAApproved) {
              const msg = tmpData.isSupervisorApproved
                ? "supervisor"
                : tmpData.isAAApproved
                  ? "AA"
                  : "supervisor";
              showErrorNotification(`Leave approved by ${msg}.`);
            } else {
              currentCheckBoxList.push(tmpData);
              setCheckboxData(currentCheckBoxList);
              setSelectedState({ ...selectedState, ...newSelectedState });
            }
          }
        } else {
          let currentCheckBoxList = [...checkboxData];

          const tmpData = event.dataItems.find(
            (item) =>
              item.id.toString() == Object.keys(newSelectedState)[0].toString()
          );
          if (tmpData) {
            if (tmpData.isSupervisorApproved || tmpData.isAAApproved) {
              const msg = tmpData.isSupervisorApproved
                ? "supervisor"
                : tmpData.isAAApproved
                  ? "AA"
                  : "supervisor";
              showErrorNotification(`Leave approved by ${msg}.`);
            } else {
              currentCheckBoxList.push(tmpData);
              setSelectedState(newSelectedState);
              setCheckboxData(currentCheckBoxList);
            }
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedState, privilegeResourceGroup, checkboxData]
  );

  const onHeaderSelectionChange = useCallback(
    (event) => {
      let showMsg = false;
      const checkboxElement = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState = {};
      let currentCheckBoxList = [...checkboxData];
      event.dataItems.forEach((item) => {
        if (item.isSupervisorApproved || item.isAAApproved) {
          showMsg = true;
        } else {
          currentCheckBoxList.push({ ...item, [SELECTED_FIELD]: checked });
          newSelectedState[idGetter(item)] = checked;
        }
      });

      if (showMsg) {
        showErrorNotification(
          `Selected only which were not approved by Supervisor/AA.`
        );
      }

      setCheckboxData(currentCheckBoxList);
      setSelectedState(newSelectedState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [privilegeResourceGroup]
  );

  const employeeApproveLeave = (data) => {
    axiosInstance({
      method: "POST",
      url: TimecardEndPoints.LeaveRequestOrReject + "?approveType=employee",
      data: data,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Approved successfully");
        setBindLeaveRequestData({ ...bindLeaveRequestData });
      })
      .catch(() => {});
  };

  const getTimecardLeaveBalance = (empId) => {
    let inputdata = {
      EmpId: empId,
      iWhatYear: new Date().getFullYear(),
    };
    if (empId) {
      axiosInstance({
        method: "POST",
        url: TimeCardLeaveBalance.TimecardLeaveBalance,
        data: inputdata,
        withCredentials: false,
      })
        .then((response) => {
          setTimecardLeaveBalance(response.data);
        })
        .catch(() => {});
    }
  };

  return (
    <>
      <div className="mb-3">
        <h4>Leave Balance</h4>

        <div className="k-card-deck">
          <Card>
            <CardBody>
              <CardSubtitle>Sick Balance (Hours)</CardSubtitle>
              <CardTitle>
                {Number(TimecardLeaveBalance?.SickBalanceBox || 0)?.toFixed(4)}
              </CardTitle>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardSubtitle>Vaca Balance (Hours)</CardSubtitle>
              <CardTitle>
                {Number(TimecardLeaveBalance?.VacaBalanceBox || 0)?.toFixed(4)}
              </CardTitle>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardSubtitle>Personal Balance (Hours)</CardSubtitle>
              <CardTitle>
                {Number(TimecardLeaveBalance?.PersBalanceBox || 0)?.toFixed(4)}
              </CardTitle>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardSubtitle>Comp Balance (Hours)</CardSubtitle>
              <CardTitle>
                {Number(TimecardLeaveBalance?.CompBalanceBox || 0)?.toFixed(4)}
              </CardTitle>
            </CardBody>
          </Card>
        </div>
      </div>
      {TimecardLeaveBalance?.FMLAStartBox && (
        <div className="k-card-deck mt-3 mb-3 attendanceBalanceCard">
          <Card>
            <CardBody>
              <CardSubtitle>FMLA Start</CardSubtitle>
              <CardTitle>
                {TimecardLeaveBalance?.FMLAStartBox
                  ? TimecardLeaveBalance?.FMLAStartBox
                  : ""}
              </CardTitle>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardSubtitle>FMLA Allowed</CardSubtitle>
              <CardTitle>
                {Number(TimecardLeaveBalance?.FMLAAvaliableBox || 0)?.toFixed(
                  4
                )}
              </CardTitle>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardSubtitle>FMLA Used</CardSubtitle>
              <CardTitle>
                {Number(TimecardLeaveBalance?.FMLAUsedBox || 0)?.toFixed(4)}
              </CardTitle>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardSubtitle>FMLA Balance</CardSubtitle>
              <CardTitle>
                {Number(TimecardLeaveBalance?.FMLABalance || 0)?.toFixed(4)}
              </CardTitle>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="app-search-input mb-3 d-flex justify-content-between mt-2">
        <div>
          {(employeeDetail.isSupervisor || employeeDetail.isPayrollSpecialist) ? (
            <DropDownList
              style={{
                width: "250px",
              }}
              className="app-dropdown"
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
        <div>
          <span className="k-icon k-i-search" />
          <Input
            style={{
              width: "300px",
              height: "44px",
            }}
            placeholder="Search"
            type="text"
            value={bindLeaveRequestData.search}
            onChange={filterData}
          />
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <h4>Leave History</h4>

        {checkPrivilegeGroup("AddELRB", 2) && allowAddLeaveRequest && (
          <Button
            className="k-button k-button-lg k-rounded-lg"
            themeColor={"primary"}
            onClick={toggleDialog}
          >
            Add Leave Request
          </Button>
        )}
      </div>

      <div className="mt-3">
        {checkPrivilegeGroup("ELRG", 1) && (
          <Grid
            sortable={true}
            data={dataResult.map((item) => ({
              ...item,
              inEdit: item.id == editID,
              [SELECTED_FIELD]: selectedState[idGetter(item)],
            }))}
            onDataStateChange={dataStateChange}
            onRowClick={rowClick}
            onItemChange={itemChange}
            sort={detailSort}
            onSortChange={(e) => {
              onSortDetailChange(e);
            }}
            filterable={showFilter}
            filter={filter}
            onFilterChange={filterChange}
            skip={page.skip}
            take={page.take}
            total={pageTotal}
            pageable={{
              buttonCount: 4,
              pageSizes: [10, 15, "All"],
              pageSizeValue: pageSizeValue,
            }}
            onPageChange={pageChange}
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              drag: false,
              cell: false,
              mode: "multiple",
            }}
            onSelectionChange={onSelectionChange}
            onHeaderSelectionChange={onHeaderSelectionChange}
            className="header-text-wrap"
          >
            <GridToolbar>
              <div className="row col-sm-12">
                <div className="col-sm-6 d-grid gap-3 d-md-block">
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
              </div>
            </GridToolbar>
            <GridColumn
              field={SELECTED_FIELD}
              filterable={false}
              width="40px"
              headerSelectionValue={
                dataResult.findIndex(
                  (item) => !selectedState[idGetter(item)]
                ) == -1
              }
            />
            <GridColumn
              field="lRDate"
              title="Request Date"
              filter="date"
              cell={(props) => {
                const dateTime = props.dataItem.lRDate
                  ? new Date(props.dataItem.lRDate)
                  : null;

                if (dateTime) {
                  const year = dateTime.getFullYear();
                  const month = String(dateTime.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(dateTime.getDate()).padStart(2, "0");
                  const hours = String(dateTime.getHours()).padStart(2, "0");
                  const minutes = String(dateTime.getMinutes()).padStart(
                    2,
                    "0"
                  );

                  return (
                    <td
                      onClick={() => onSelectionChange(props)}
                    >{`${month}/${day}/${year} ${hours}:${minutes}`}</td>
                  );
                }

                return <td onClick={() => onSelectionChange(props)}></td>;
              }}
            />

            <GridColumn
              field="beginDate"
              title="Leave Start"
              filter="date"
              format="{0:d}"
              k-format="'MM-DD-yyyy'"
              cell={(props) => {
                const [year, month, day] = props.dataItem.beginDate
                  .split("T")[0]
                  .split("-");

                let startTime = props.dataItem.beginDate
                  ? new Date(props.dataItem.beginDate)
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
                  <td onClick={() => onSelectionChange(props)}>
                    {`${month}/${day}/${year}`}{" "}
                    {props.dataItem.beginDate ? `${hour}:${min}` : null}{" "}
                    {props.dataItem.beginDate ? `${AM_PM}` : null}
                  </td>
                );
              }}
            />

            <GridColumn
              field="endDate"
              title="Leave End"
              filter="date"
              cell={(props) => {
                const [year, month, day] = props.dataItem.endDate
                  .split("T")[0]
                  .split("-");
                let endTime = props.dataItem.endDate
                  ? new Date(props.dataItem.endDate)
                  : null;
                let hour;
                let min;
                if (endTime) {
                  hour = endTime.getHours();
                  min = endTime.getMinutes();
                  if (hour > 12) {
                    hour = hour - 12;
                  }
                  if (min.toString().length == 1) {
                    min = "0" + min;
                  }
                }

                let hourAM;
                let AM_PM;
                if (endTime) {
                  hourAM = endTime.getHours();
                  if (hourAM >= 12) {
                    AM_PM = "PM";
                  } else {
                    AM_PM = "AM";
                  }
                }
                return (
                  <td onClick={() => onSelectionChange(props)}>
                    {`${month}/${day}/${year}`}{" "}
                    {props.dataItem.endDate ? `${hour}:${min}` : null}{" "}
                    {props.dataItem.endDate ? `${AM_PM}` : null}
                  </td>
                );
              }}
            />

            <GridColumn
              field="hours"
              title="Hours"
              width="100px"
              format="{0:0.##}"
            />

            <GridColumn
              field="leaveType.description"
              title="Leave Type"
              width={"125px"}
              cell={(props) => {
                return (
                  <td onClick={() => onSelectionChange(props)}>
                    {props.dataItem?.leaveType?.description}
                  </td>
                );
              }}
            />

            {props.FMLADisplay && (
              <GridColumn
                field="fmlaType.value"
                title="FMLA Type"
                width={"125px"}
              />
            )}

            <GridColumn
              field="reasonForLeave"
              title="Leave Reason"
              width={"200px"}
            />

            <GridColumn field="status" title="Status" width={"100px"} />

            <GridColumn
              field="reasonForDisApproval"
              title="Reason for Disapproval"
              width={"125px"}
            />

            <GridColumn
              field="employeeApprovedDate"
              title="Employee Approved"
              filter="date"
              width={"155px"}
              cell={(props) => {
                const dateTime = props.dataItem.employeeApprovedDate
                  ? new Date(props.dataItem.employeeApprovedDate)
                  : null;

                if (dateTime) {
                  const year = dateTime.getFullYear();
                  const month = String(dateTime.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(dateTime.getDate()).padStart(2, "0");
                  const hours = String(dateTime.getHours()).padStart(2, "0");
                  const minutes = String(dateTime.getMinutes()).padStart(
                    2,
                    "0"
                  );

                  return (
                    <td
                      onClick={() => onSelectionChange(props)}
                    >{`${month}/${day}/${year} ${hours}:${minutes}`}</td>
                  );
                }

                return <td onClick={() => onSelectionChange(props)}></td>;
              }}
            />
            <GridColumn
              field="supervisorApprovedDate"
              title="Supervisor Date"
              filter="date"
              width={"150px"}
              cell={(props) => {
                const dateTime = props.dataItem.supervisorApprovedDate
                  ? new Date(props.dataItem.supervisorApprovedDate)
                  : null;

                if (dateTime) {
                  const year = dateTime.getFullYear();
                  const month = String(dateTime.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(dateTime.getDate()).padStart(2, "0");
                  const hours = String(dateTime.getHours()).padStart(2, "0");
                  const minutes = String(dateTime.getMinutes()).padStart(
                    2,
                    "0"
                  );

                  return (
                    <td
                      onClick={() => onSelectionChange(props)}
                    >{`${month}/${day}/${year} ${hours}:${minutes}`}</td>
                  );
                }

                return <td onClick={() => onSelectionChange(props)}></td>;
              }}
            />
            {employeeDetail.isAppointingAuthorityEnabled && (
              <GridColumn
                field="aaApprovedDate"
                title="AA Approve Date"
                filter="date"
                width={"170px"}
                cell={(props) => {
                  const dateTime = props.dataItem.aaApprovedDate
                    ? new Date(props.dataItem.aaApprovedDate)
                    : null;

                  if (dateTime) {
                    const year = dateTime.getFullYear();
                    const month = String(dateTime.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(dateTime.getDate()).padStart(2, "0");
                    const hours = String(dateTime.getHours()).padStart(2, "0");
                    const minutes = String(dateTime.getMinutes()).padStart(
                      2,
                      "0"
                    );

                    return (
                      <td
                        onClick={() => onSelectionChange(props)}
                      >{`${month}/${day}/${year} ${hours}:${minutes}`}</td>
                    );
                  }

                  return <td onClick={() => onSelectionChange(props)}></td>;
                }}
              />
            )}
            {checkPrivilegeGroup("ELRCC", 2) && (
              <GridColumn
                cell={GridCommandCell}
                filterable={false}
                width={"50px"}
              />
            )}
          </Grid>
        )}
        {checkPrivilegeGroup("ELRCC", 2) && (
          <ContextMenu
            show={show}
            offset={offset.current}
            onSelect={ContextMenuOnSelect}
            onClose={ContextMenuCloseMenu}
          >
            {checkPrivilegeGroup("ELRELCM", 3) && (
              <MenuItem
                text="Edit leave"
                data={{
                  action: "edit",
                }}
                icon="edit"
                disabled={
                  (selectedRowId.status?.toLowerCase() == "approved" || selectedRowId.status?.toLowerCase() == "sup approved")
                }
              />
            )}
            {checkPrivilegeGroup("ELRDLCM", 4) && (
              <MenuItem
                text="Delete leave"
                data={{
                  action: "delete",
                }}
                icon="edit"
                disabled={!allowDeleteLeaveRequest || selectedRowId.status?.toLowerCase() == "approved" || selectedRowId.status?.toLowerCase() == "sup approved"}
              />
            )}
          </ContextMenu>
        )}
      </div>
      {checkPrivilegeGroup("ELREAB", 2) && allowAddLeaveRequest &&  (
        <div className="mt-3 d-flex justify-content-end">
          <Button
            className="k-button k-button-lg k-rounded-lg ms-4 "
            themeColor={"primary"}
            onClick={() => setApproveStatus()}
          >
            Employee Approve
          </Button>
        </div>
      )}

      {visible && (
        <ApplyLeave
          toggleDialog={toggleDialog}
          formInit={formInit}
          FMLADisplay={props.FMLADisplay}
          TimecardLeaveBalance={TimecardLeaveBalance}
          getTimecardLeaveBalance={getTimecardLeaveBalance}
          currentEmployee={currentEmployee}
        ></ApplyLeave>
      )}
      {visibleLeaveReason && (
        <RejectReason
          toggleDialog={toggleLeaveRejectReason}
          getRejectReason={callRejectReason}
        ></RejectReason>
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
              onClick={deleteRequest}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
}
