import { useCallback, useEffect, useState } from "react";

import { getter } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import {
  Grid,
  GridColumn,
  GridToolbar,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  AuthenticationEndPoints,
  EmplTimecardEndPoints,
  TimecardEndPoints,
} from "../../../EndPoints";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../NotificationHandler/NotificationHandler";
import Constants from "../../common/Constants";
import RejectReason from "../../modal/RejectReason";

export default function LeaveApproval(props) {
  const [employeeData, setEmployeeData] = useState();
  const [currentEmployee, setCurrentEmployee] = useState({});
  const [employeeDetail, setEmployeeDetail] = useState({});
  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);

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
      .catch((err) => { });
  };

  const checkPrivilegeGroup = (resourceName, privilegeId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourceName &&
        item.privileges_id == privilegeId
    );
  };

  const [visibleReject, setVisibleReject] = useState(false);
  const toggleRejectReason = () => {
    setVisibleReject(!visibleReject);
  };

  const [pageSizeValue, setPageSizeValue] = useState();
  const [pageTotal, setPageTotal] = useState();
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = useState(initialDataState);
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
  const [checkboxData, setCheckboxData] = useState([]);
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const [bindLeaveApprovalData, setBindLeaveApprovalData] = useState({
    direction: true,
    sortKey: "modifiedDate",
    employeeId: "",
    fullName: "",
    lRDate: "",
    startDate: "",
    endDate: "",
    hours: "",
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

  const [selectedState, setSelectedState] = useState({});
  const [selectedPState, setSelectedPState] = useState({});

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
          if (event.dataItem.isSupervisorApproved) {
            if (checkPrivilegeGroup("AAApproveELRB", 2)) {
              if (!event.dataItem.isAAApproved) {
                currentCheckBoxList.push(event.dataItem);
                setSelectedState({
                  ...selectedState,
                  [event.dataItem.id]: true,
                });
              } else {
                showErrorNotification("Leave approved by AA.");
              }
            } else {
              showErrorNotification("Leave approved by supervisor.");
            }
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
            if (tmpData.isSupervisorApproved) {
              if (checkPrivilegeGroup("AAApproveELRB", 2)) {
                if (!tmpData.isAAApproved) {
                  currentCheckBoxList.push(tmpData);
                  setCheckboxData(currentCheckBoxList);
                  setSelectedState({ ...selectedState, ...newSelectedState });
                } else {
                  showErrorNotification("Leave approved by AA.");
                }
              } else {
                showErrorNotification("Leave approved by supervisor.");
              }
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
            if (tmpData.isSupervisorApproved) {
              if (checkPrivilegeGroup("AAApproveELRB", 2)) {
                if (!tmpData.isAAApproved) {
                  currentCheckBoxList.push(tmpData);
                  setCheckboxData(currentCheckBoxList);
                  setSelectedState(newSelectedState);
                } else {
                  showErrorNotification("Leave approved by AA.");
                }
              } else {
                showErrorNotification("Leave approved by supervisor.");
              }
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
        if (item.isSupervisorApproved) {
          if (checkPrivilegeGroup("AAApproveELRB", 2)) {
            if (!item.isAAApproved) {
              currentCheckBoxList.push({ ...item, [SELECTED_FIELD]: checked });
              newSelectedState[idGetter(item)] = checked;
            }
          } else {
            showMsg = true;
          }
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

  useEffect(() => {
    if (dataResult.length) {
      addRecord();
    }
    handlePrivilegeByGroup();
    getEmployeeData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { }, []);
  useEffect(() => {
    if (employeeData) {
      getEmployeeDetail();
    }
  }, [employeeData]);

  useEffect(() => {
    if (
      currentEmployee &&
      currentEmployee.empId &&
      privilegeResourceGroup &&
      privilegeResourceGroup.length
    ) {
      const getData = setTimeout(() => {
        getLeaveReqList();
      }, 1000);
      return () => clearTimeout(getData);
    }
  }, [currentEmployee, bindLeaveApprovalData, privilegeResourceGroup]);

  const handleEmployeeChange = (event) => {
    let empId = event.target.value?.empId;
    let index = employeeData.findIndex((emp) => emp.empId == empId);
    if (index > -1) {
      setCurrentEmployee(employeeData[index]);
    }
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
        const access = data?.isSupervisor ? { empId: "-1", fullName: 'All' } : employeeRecord;
        setCurrentEmployee(access);
      })
      .catch(() => { });
  };

  const getEmployeeData = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.ByGroupNumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        data.unshift({ empId: "-1", fullName: 'All' });
        setEmployeeData(data);
      })
      .catch((e) => {
        setEmployeeData([]);
      });
  };

  const getLeaveReqList = () => {
    axiosInstance({
      method: "GET",
      url:
        TimecardEndPoints.LeaveRequest +
        "?desc=" +
        bindLeaveApprovalData.direction +
        "&sortKey=" +
        bindLeaveApprovalData.sortKey +
        "&supervisor=" +
        true +
        `&isSupervisorApproved=${checkPrivilegeGroup("AAApproveELRB", 2)}` +
        "&empId=" +
        currentEmployee.empId +
        "&supervisor=" +
        false +
        "&employeeId=" +
        bindLeaveApprovalData.employeeId +
        "&fullName=" +
        bindLeaveApprovalData.fullName +
        "&lRDate=" +
        bindLeaveApprovalData.lRDate +
        "&startDate=" +
        bindLeaveApprovalData.startDate +
        "&endDate=" +
        bindLeaveApprovalData.endDate +
        "&hours=" +
        bindLeaveApprovalData.hours +
        "&employeeApprovedDate=" +
        bindLeaveApprovalData.employeeApprovedDate +
        "&supervisorApprovedDate=" +
        bindLeaveApprovalData.supervisorApprovedDate +
        "&fmlaType=" +
        bindLeaveApprovalData.fmlaType +
        "&leaveType=" +
        bindLeaveApprovalData.leaveType +
        "&reasonForLeave=" +
        bindLeaveApprovalData.reasonForLeave +
        "&reasonForDisApproval=" +
        bindLeaveApprovalData.reasonForDisApproval +
        "&status=" +
        bindLeaveApprovalData.status +
        "&skip=" +
        page.skip +
        "&take=" +
        page.take,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let employeeData = [];
        data.map((employee) => {
          employee.fullName =
            employee.employee.displayName;
          employeeData.push(employee);
          return employee;
        });
        setDataResult(employeeData);
        setPageTotal(response?.data?.total);
      })
      .catch(() => { });
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

  const getRejectReason = (reason) => {
    let Ids = checkboxData.map((element) => element.id);
    ApproveOrRejectLeave(Ids, "Rejected", reason);
    setCheckboxData([]);
    setSelectedState({});
  };

  const [loggedInUserRole, setLoggedInUserRole] = useState("");

  const setRejectStatus = (role) => {
    if (checkboxData.length) {
      setLoggedInUserRole(role);
      setVisibleReject(true);
    } else {
      showErrorNotification("No row is selected");
    }
  };
  const setApproveStatus = (role) => {
    if (checkboxData.length) {
      setLoggedInUserRole(role);

      let Ids = checkboxData.map((element) => element.id);
      ApproveOrRejectLeave(Ids, "Approved", "", role);
      setCheckboxData([]);
      setSelectedState({});
    } else {
      showErrorNotification("No row is selected");
    }
  };

  const ApproveOrRejectLeave = (data, status, message = "", role) => {
    axiosInstance({
      method: "POST",
      url:
        TimecardEndPoints.LeaveRequestOrReject +
        "?status=" +
        status +
        "&message=" +
        message +
        `&approveType=${role || loggedInUserRole}`,
      data: data,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification(`${status} successfully`);
        getLeaveReqList();
      })
      .catch(() => { });
  };

  const MoreFilter = () => {
    setShowFilter(!showFilter);
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

  const filterChange = (event) => {
    var employeeId = "";
    var fullName = "";
    var lRDate = "";
    var startDate = "";
    var endDate = "";
    var hours = "";
    var employeeApprovedDate = "";
    var supervisorApprovedDate = "";
    var fmlaType = "";
    var leaveType = "";
    var reasonForLeave = "";
    var reasonForDisApproval = "";
    var status = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "empId") {
          employeeId = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "employee.firstName") {
          fullName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "lRDate") {
          lRDate = dateFormate(event.filter.filters[i].value);
        }
        if (event.filter.filters[i].field == "beginDate") {
          startDate = dateFormate(event.filter.filters[i].value);
        }
        if (event.filter.filters[i].field == "endDate") {
          endDate = dateFormate(event.filter.filters[i].value);
        }
        if (event.filter.filters[i].field == "hours") {
          hours = event.filter.filters[i].value;
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
    setBindLeaveApprovalData({
      ...bindLeaveApprovalData,
      skip: 0,
      take: page.take,
      employeeId,
      fullName,
      lRDate,
      startDate,
      endDate,
      hours,
      employeeApprovedDate,
      supervisorApprovedDate,
      fmlaType,
      leaveType,
      reasonForLeave,
      reasonForDisApproval,
      status,
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
    bindLeaveApprovalData.direction = direction;
    bindLeaveApprovalData.sortKey = sortColumn;
    getLeaveReqList();
  };

  return (
    <>
      <div className="d-flex k-w-full ">
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
      </div>

      <h4 className="mt-4">Leave Approval</h4>

      <div className="mt-3">
        {checkPrivilegeGroup("ELAG", 1) && (
          <Grid
            sortable={true}
            data={dataResult.map((item) => ({
              ...item,
              [SELECTED_FIELD]: selectedState[idGetter(item)],
            }))}
            onDataStateChange={dataStateChange}
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
            filterable={showFilter}
            filter={filter}
            onFilterChange={filterChange}
            sort={detailSort}
            onSortChange={(e) => {
              onSortDetailChange(e);
            }}
            skip={page.skip}
            take={page.take}
            total={pageTotal}
            pageable={{
              buttonCount: 4,
              pageSizes: [10, 15, "All"],
              pageSizeValue: pageSizeValue,
            }}
            onPageChange={pageChange}
            onSelectionChange={onSelectionChange}
            onHeaderSelectionChange={onHeaderSelectionChange}
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
              width="50px"
              headerSelectionValue={
                dataResult.findIndex(
                  (item) => !selectedState[idGetter(item)]
                ) == -1
              }
            />
            <GridColumn
              field="employee.firstName"
              title="Employee Name"
              cell={(props) => {
                return (
                  <td onClick={() => onSelectionChange(props)}>
                    {props?.dataItem?.employee?.displayName}
                  </td>
                );
              }}
            />
            <GridColumn
              field="beginDate"
              title="Leave Start"
              filter="date"
              width={"170px"}
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
              width={"170px"}
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
            <GridColumn field="hours" title="Hours" width={"75px"} />
            {props.FMLADisplay && (
              <GridColumn
                field="fmlaType.value"
                title="FMLA Type"
                width={"100px"}
              />
            )}
            <GridColumn
              field="leaveType.description"
              title="Leave Type"
              width={"170px"}
            />
            <GridColumn
              field="reasonForLeave"
              title="Leave Reason"
              width={"170px"}
            />
            <GridColumn
              field="supervisorApprovedDate"
              title="Supervisor Date"
              filter="date"
              width={"170px"}
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
            <GridColumn field="status" title="Status" width={"180px"} />
          </Grid>
        )}
      </div>

      <div className="mt-3 d-flex justify-content-end">
        {checkPrivilegeGroup("AARejectELRB", 2) ? (
          <Button
            className="k-button k-button-lg k-rounded-lg ms-4 text-white"
            themeColor={"error"}
            onClick={() =>
              setRejectStatus(
                employeeDetail.isAppointingAuthorityEnabled
                  ? "aa"
                  : "supervisor"
              )
            }
          >
            Reject Request
          </Button>
        ) : (
          checkPrivilegeGroup("RejectELRB", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg ms-4 text-white "
              themeColor={"error"}
              onClick={() => setRejectStatus("supervisor")}
            >
              Reject Request
            </Button>
          )
        )}
        {checkPrivilegeGroup("AAApproveELRB", 2) ? (
          <Button
            className="k-button k-button-lg k-rounded-lg ms-4 "
            themeColor={"primary"}
            onClick={() =>
              setApproveStatus(
                employeeDetail.isAppointingAuthorityEnabled
                  ? "aa"
                  : "supervisor"
              )
            }
          >
            Approve Request
          </Button>
        ) : (
          checkPrivilegeGroup("ApproveELRB", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg ms-4 "
              themeColor={"primary"}
              onClick={() => setApproveStatus("supervisor")}
            >
              Approve Request
            </Button>
          )
        )}
      </div>
      {visibleReject && (
        <RejectReason
          toggleDialog={toggleRejectReason}
          getRejectReason={getRejectReason}
        ></RejectReason>
      )}
    </>
  );
}
