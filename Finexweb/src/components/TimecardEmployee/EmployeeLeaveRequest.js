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
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { Input } from "@progress/kendo-react-inputs";
import { Grid, GridColumn, getSelectedState } from "@progress/kendo-react-grid";
import ApplyLeave from "../modal/ApplyLeave";
import RejectReason from "../modal/RejectReason";
import { TimecardEndPoints, AuthenticationEndPoints } from "../../EndPoints";
import { getter } from "@progress/kendo-data-query";
import axiosInstance from "../../core/HttpInterceptor";
import CustomBreadScrum from "../Shared/CustomBreadScrum";
import CustomNotification from "../Shared/CustomNotification";

export default function EmployeeLeaveRequest() {
  const [selected, setSelected] = useState(0);
  const handleSelect = (e) => {
    setSelected(e.selected);
  };

  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
    getLeaveReqList();
  };
  const [visibleReject, setVisibleReject] = useState(false);
  const [visibleLeaveReason, setVisibleLeaveReason] = useState(false);
  const toggleRejectReason = () => {
    setVisibleReject(!visibleReject);
  };

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
  const [checkboxData, setCheckboxData] = useState([]);
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);

  const [selectedState, setSelectedState] = useState({});
  const [selectedRowId, setSelectedRowId] = useState(0);
  const offset = useRef({
    left: 0,
    top: 0,
  });
  const [show, setShow] = useState(false);

  const onSelectionChange = useCallback(
    (event) => {
      let currentCheckBoxList = [...checkboxData];
      if (event.dataItem.selected) {
        currentCheckBoxList = currentCheckBoxList.filter(
          (p) => p.id !== event.dataItem.id
        );
      } else {
        currentCheckBoxList.push(event.dataItem);
      }
      setCheckboxData(currentCheckBoxList);
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });
      setSelectedState(newSelectedState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedState]
  );
  const onHeaderSelectionChange = useCallback((event) => {
    const checkboxElement = event.syntheticEvent.target;
    const checked = checkboxElement.checked;
    const newSelectedState = {};
    let currentCheckBoxList = [...checkboxData];
    event.dataItems.forEach((item) => {
      currentCheckBoxList.push(item);
      newSelectedState[idGetter(item)] = checked;
    });
    setCheckboxData(currentCheckBoxList);
    setSelectedState(newSelectedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getLeaveReqList();
    if (dataResult.length) {
      addRecord();
    }
    handlePrivilegeByGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [, setPrivilegeResourceGroup] = useState([]);

  const handlePrivilegeByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=EmployeeLeaveRequest`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch((err) => { });
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
    getLeaveReqList(direction, sortColumn);
  };

  const checkPrivilegeGroup = (resourceName, privilegeId) => {
    return true;
  };
  const getLeaveReqList = (direction = true, sortKey = "modifiedDate") => {
    axiosInstance({
      method: "GET",
      url:
        TimecardEndPoints.LeaveRequest +
        "?desc=" +
        direction +
        "&&sortKey=" +
        sortKey,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setDataResult(data);
      })
      .catch((error) => { });
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
  const [notificationState, setNotificationState] = useState({
    none: false,
    success: false,
    error: false,
    warning: false,
    info: false,
    notificationMessage: "",
  });
  const onToggle = (flag, notificationMessage) =>
    setNotificationState({
      ...notificationState,
      [flag]: !notificationState[flag],
      notificationMessage: notificationMessage,
    });

  const getRejectReason = (reason) => {
    checkboxData.forEach((element) => {
      if (element.id) {
        element.isSupervisorApproved = false;
        element.reasonForDisApproval = reason;
        element.status = "rejected";

        LeaveRequestStatus(element);
      }
    });
    setCheckboxData([]);
    setSelectedState({});
  };

  const setRejectStatus = () => {
    if (checkboxData.length) {
      setVisibleReject(true);
    } else {
      onToggle("error", "No row is selected");
      setTimeout(
        () =>
          setNotificationState({
            ...notificationState,
            error: false,
            notificationMessage: "",
          }),
        3000
      );
    }
  };
  const setApproveStatus = () => {
    if (checkboxData.length) {
      checkboxData.forEach((element) => {
        if (element.id) {
          element.isSupervisorApproved = true;
          element.reasonForDisApproval = "";
          element.status = "approved";
          LeaveRequestStatus(element);
        }
      });
      setCheckboxData([]);
      setSelectedState({});
    } else {
      onToggle("error", "No row is selected");
      setTimeout(
        () =>
          setNotificationState({
            ...notificationState,
            error: false,
            notificationMessage: "",
          }),
        3000
      );
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
        getLeaveReqList();
      })
      .catch((error) => { });
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
      title: "Leave Request",
      link: "",
    },
  ];
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

  return (
    <>
      {checkPrivilegeGroup("ELRM", 1) && (
        <div>
          <CustomBreadScrum data={breadScrumData} />

          <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
            <div className="d-flex k-flex-column">
              <h1>Leave Request</h1>
            </div>
          </div>

          <TabStrip
            className="app-tab"
            selected={selected}
            onSelect={handleSelect}
          >
            {checkPrivilegeGroup("ELRM", 1) && (
              <TabStripTab title="Leave Request">
                <div>
                  <h4>Leave Balance</h4>

                  <div className="k-card-deck">
                    <Card>
                      <CardBody>
                        <CardSubtitle>Sick Balance (Hours)</CardSubtitle>
                        <CardTitle>1342.76</CardTitle>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <CardSubtitle>Vaca Balance (Hours)</CardSubtitle>
                        <CardTitle>263.00</CardTitle>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <CardSubtitle>Pers Balance (Hours)</CardSubtitle>
                        <CardTitle>123.00</CardTitle>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <CardSubtitle>Comp Balance (Hours)</CardSubtitle>
                        <CardTitle>456.00</CardTitle>
                      </CardBody>
                    </Card>
                  </div>
                </div>

                <div className="app-search-input mb-3 d-flex justify-content-end">
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

                <div className="d-flex justify-content-between mt-4">
                  <h4>Leave History</h4>

                  {checkPrivilegeGroup("AddELRB", 2) && (
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
                      }))}
                      onDataStateChange={dataStateChange}
                      onRowClick={rowClick}
                      onItemChange={itemChange}
                      sort={detailSort}
                      onSortChange={(e) => {
                        onSortDetailChange(e);
                      }}
                    >
                      <GridColumn
                        field="lRDate"
                        title="Request Date"
                        cell={(props) => {
                          const dateTime = props.dataItem.lRDate
                            ? new Date(props.dataItem.lRDate)
                            : null;

                          if (dateTime) {
                            const year = dateTime.getFullYear();
                            const month = String(
                              dateTime.getMonth() + 1
                            ).padStart(2, "0");
                            const day = String(dateTime.getDate()).padStart(
                              2,
                              "0"
                            );
                            const hours = String(dateTime.getHours()).padStart(
                              2,
                              "0"
                            );
                            const minutes = String(
                              dateTime.getMinutes()
                            ).padStart(2, "0");

                            return (
                              <td>
                                {`${month}/${day}/${year} ${hours}:${minutes}`}
                              </td>
                            );
                          }

                          return <td></td>;
                        }}
                      />

                      <GridColumn
                        field="beginDate"
                        title="Start Date"
                        cell={(props) => {
                          const dateTime = props.dataItem.beginDate
                            ? new Date(props.dataItem.beginDate)
                            : null;

                          if (dateTime) {
                            const year = dateTime.getFullYear();
                            const month = String(
                              dateTime.getMonth() + 1
                            ).padStart(2, "0");
                            const day = String(dateTime.getDate()).padStart(
                              2,
                              "0"
                            );
                            const hours = String(dateTime.getHours()).padStart(
                              2,
                              "0"
                            );
                            const minutes = String(
                              dateTime.getMinutes()
                            ).padStart(2, "0");

                            return (
                              <td>
                                {`${month}/${day}/${year} ${hours}:${minutes}`}
                              </td>
                            );
                          }

                          return <td></td>;
                        }}
                      />
                      <GridColumn
                        field="endDate"
                        title="End Date"
                        cell={(props) => {
                          const dateTime = props.dataItem.endDate
                            ? new Date(props.dataItem.endDate)
                            : null;

                          if (dateTime) {
                            const year = dateTime.getFullYear();
                            const month = String(
                              dateTime.getMonth() + 1
                            ).padStart(2, "0");
                            const day = String(dateTime.getDate()).padStart(
                              2,
                              "0"
                            );
                            const hours = String(dateTime.getHours()).padStart(
                              2,
                              "0"
                            );
                            const minutes = String(
                              dateTime.getMinutes()
                            ).padStart(2, "0");

                            return (
                              <td>
                                {`${month}/${day}/${year} ${hours}:${minutes}`}
                              </td>
                            );
                          }

                          return <td></td>;
                        }}
                      />
                      <GridColumn
                        field="supervisorApprovedDate"
                        title="Supervisor Date"
                        cell={(props) => {
                          const dateTime = props.dataItem.supervisorApprovedDate
                            ? new Date(props.dataItem.supervisorApprovedDate)
                            : null;

                          if (dateTime) {
                            const year = dateTime.getFullYear();
                            const month = String(
                              dateTime.getMonth() + 1
                            ).padStart(2, "0");
                            const day = String(dateTime.getDate()).padStart(
                              2,
                              "0"
                            );
                            const hours = String(dateTime.getHours()).padStart(
                              2,
                              "0"
                            );
                            const minutes = String(
                              dateTime.getMinutes()
                            ).padStart(2, "0");

                            return (
                              <td>
                                {`${month}/${day}/${year} ${hours}:${minutes}`}
                              </td>
                            );
                          }

                          return <td></td>;
                        }}
                      />
                      <GridColumn field="status" title="Status" />
                      <GridColumn cell={GridCommandCell} filterable={false} />
                    </Grid>
                  )}

                  <ContextMenu
                    show={show}
                    offset={offset.current}
                    onSelect={ContextMenuOnSelect}
                    onClose={ContextMenuCloseMenu}
                  >
                    <MenuItem
                      text="Reject leave"
                      data={{
                        action: "reject",
                      }}
                      icon="edit"
                    />
                    <MenuItem
                      text="Approve leave"
                      data={{
                        action: "approve",
                      }}
                      icon="edit"
                    />
                  </ContextMenu>
                </div>

                {visible && (
                  <ApplyLeave toggleDialog={toggleDialog}></ApplyLeave>
                )}
                {visibleLeaveReason && (
                  <RejectReason
                    toggleDialog={toggleLeaveRejectReason}
                    getRejectReason={callRejectReason}
                  ></RejectReason>
                )}
              </TabStripTab>
            )}
            {checkPrivilegeGroup("ELRTab", 1) && (
              <TabStripTab title="Leave Approval">
                <div className="d-flex k-w-full  k-justify-content-end">
                </div>

                <h4>Leave Approval</h4>

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
                      onSelectionChange={onSelectionChange}
                      onHeaderSelectionChange={onHeaderSelectionChange}
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
                        field="beginDate"
                        title="Start Date"
                        width={"150px"}
                        format="{0:d}"
                        k-format="'MM-DD-yyyy'"
                        cell={(props) => {
                          const [year, month, day] = props.dataItem.beginDate
                            .split("T")[0]
                            .split("-");
                          return <td>{`${month}/${day}/${year}`}</td>;
                        }}
                      />
                      <GridColumn
                        field="beginDate"
                        title="Start"
                        width={"100px"}
                        cell={(props) => {
                          let startTime = props.dataItem.beginDate
                            ? new Date(props.dataItem.beginDate + "Z")
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
                          return (
                            <td>
                              {props.dataItem.beginDate
                                ? `${hour}:${min}`
                                : null}
                            </td>
                          );
                        }}
                      />
                      <GridColumn
                        field="beginDate"
                        title="Start"
                        width={"60px"}
                        cell={(props) => {
                          let startTime = props.dataItem.beginDate
                            ? new Date(props.dataItem.beginDate + "Z")
                            : null;
                          let hour;
                          let AM_PM;
                          if (startTime) {
                            hour = startTime.getHours();
                            if (hour > 12) {
                              AM_PM = "PM";
                            } else {
                              AM_PM = "AM";
                            }
                          }
                          return (
                            <td>
                              {props.dataItem.beginDate ? `${AM_PM}` : null}
                            </td>
                          );
                        }}
                      />
                      <GridColumn
                        field="endDate"
                        title="End Date"
                        width={"150px"}
                        cell={(props) => {
                          const [year, month, day] = props.dataItem.endDate
                            .split("T")[0]
                            .split("-");
                          return <td>{`${month}/${day}/${year}`}</td>;
                        }}
                      />
                      <GridColumn
                        field="endDate"
                        title="End"
                        width={"100px"}
                        cell={(props) => {
                          let endTime = props.dataItem.endDate
                            ? new Date(props.dataItem.endDate + "Z")
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
                          return (
                            <td>
                              {props.dataItem.endDate ? `${hour}:${min}` : null}
                            </td>
                          );
                        }}
                      />
                      <GridColumn
                        field="endDate"
                        title="End"
                        width={"60px"}
                        cell={(props) => {
                          let endTime = props.dataItem.endDate
                            ? new Date(props.dataItem.endDate + "Z")
                            : null;
                          let hour;
                          let AM_PM;
                          if (endTime) {
                            hour = endTime.getHours();
                            if (hour > 12) {
                              AM_PM = "PM";
                            } else {
                              AM_PM = "AM";
                            }
                          }
                          return (
                            <td>
                              {props.dataItem.endDate ? `${AM_PM}` : null}
                            </td>
                          );
                        }}
                      />
                      <GridColumn field="hours" title="Hours" width={"100px"} />
                      <GridColumn
                        field="leaveType.description"
                        title="Leave Type"
                      />
                      <GridColumn field="reasonForLeave" title="Leave Reason" />
                    </Grid>
                  )}
                </div>

                <div className="mt-3 d-flex justify-content-end">
                  {checkPrivilegeGroup("ApproveELRB", 2) && (
                    <Button
                      className="k-button k-button-lg k-rounded-lg "
                      themeColor={"error"}
                      onClick={() => setRejectStatus()}
                    >
                      Reject Request
                    </Button>
                  )}
                  {checkPrivilegeGroup("RejectELRB", 2) && (
                    <Button
                      className="k-button k-button-lg k-rounded-lg ms-4 "
                      themeColor={"primary"}
                      onClick={() => setApproveStatus()}
                    >
                      Approve Request
                    </Button>
                  )}
                </div>
                {visibleReject && (
                  <RejectReason
                    toggleDialog={toggleRejectReason}
                    getRejectReason={getRejectReason}
                  ></RejectReason>
                )}
              </TabStripTab>
            )}
          </TabStrip>
          <CustomNotification
            notificationState={notificationState}
            setNotificationState={setNotificationState}
          />
        </div>
      )}
    </>
  );
}
