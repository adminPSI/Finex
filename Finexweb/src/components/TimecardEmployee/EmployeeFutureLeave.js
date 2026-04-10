/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { formatDate } from "@progress/kendo-intl";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import {
  ConfigurationEndPoints,
  EmplTimecardEndPoints,
  TimecardEndPoints
} from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import CustomBreadScrum from "../Shared/CustomBreadScrum";
export default function EmployeeFutureLeave() {
  const [selected, setSelected] = useState(0);
  const handleSelect = (e) => {
    setSelected(e.selected);
  };
  const initialDataState = {
    skip: 0,
    take: 10,
  };
  const [dataResult, setDataResult] = useState();
  const [, setDataState] = useState();
  const [groupList, setGroupList] = useState();
  const [supervisorList, setSupervisorList] = useState([]);
  const [supervisorValue, setSupervisorValue] = useState({});
  const [startDateValue, setStartDateValue] = useState();
  const [endDateValue, setEndDateValue] = useState();
  const [groupValue, setGroupValue] = useState();
  const [leaveData, setLeaveData] = useState([]);
  const [sortData, setSortData] = useState({
    direction: true,
    sortKey: "modifiedDate",
  });
  let [employeeDetail, setEmployeeDetail] = useState({});
  const [groupNumberConfig, setGroupNumberConfig] = useState(false);
  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);
  const [page, setPage] = useState(initialDataState);
  const [pageTotal, setPageTotal] = useState();

  useEffect(() => {
    getGroup();
    getSupervisorData();
    getEmployeeDetail();
  }, []);
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];

  const [sort, setSort] = useState(initialSort);

  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setSortData({ direction: direction, sortKey: sortColumn });
  };

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setPage({
        skip: 0,
        take: pageTotal,
      });
    }
  };

  useEffect(() => {
    getEmployeeDayList();
  }, [startDateValue, endDateValue, groupValue, supervisorValue, sortData, page]);

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
  const handleStartDateChange = (event) => {
    setStartDateValue(event.value);
  };

  const handleEndDateChange = (event) => {
    setEndDateValue(event.value);
  };

  const handleGroupChange = (event) => {
    if (event.value == "Group No") {
      setGroupValue();
    } else {
      setGroupValue(event.value);
    }
  };

  const handleSupervisorChange = (event) => {
    let index = supervisorList.findIndex(
      (item) => item.fullName == event.value[0]
    );
    if (index >= 0) {
      setSupervisorValue(supervisorList[index].supervisorGroupNumber);
    } else {
      setSupervisorValue();
    }
  };

  const getGroup = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.GroupNumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setGroupList(data);
      })
      .catch(() => { });
  };

  const getSupervisorData = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.TCEmployee + "?supervisor=" + true,
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
        setSupervisorList(employeeData);
      })
      .catch(() => { });
  };

  const getEmployeeDayList = () => {
    let startDate;
    let endDate;
    if (startDateValue) {
      startDate = startDateValue.toISOString().split("T")[0];
    }
    if (endDateValue) {
      endDate = endDateValue.toISOString().split("T")[0];
    }
    axiosInstance({
      method: "GET",
      url: TimecardEndPoints.FutureLeave,
      withCredentials: false,
      params: {
        groupId: groupValue,
        startDate: startDate,
        endDate: endDate,
        supervisorId: supervisorValue,
        desc: sortData.direction,
        sortKey: sortData.sortKey || "modifiedDate",
        skip: page.skip,
        take: page.take == 'All' ? 0 : page.take
      },
    })
      .then((response) => {
        let data = response.data;
        setLeaveData(data.data);
        setPageTotal(data.total);
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
      title: "Employee Future Leave",
      link: "",
    },
  ];

  const getEmployeeDetail = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.EmployeeDetail,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        employeeDetail = data;
        setEmployeeDetail(data);
        getGroupNumberConfig();
      })
      .catch(() => { });
  };

  const getGroupNumberConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/88",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setGroupNumberConfig(value);
        if (value) {
          setGroupValue(employeeDetail.groupNumber);
        }
      })
      .catch(() => { });
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Employee Future Leave')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("EFLM", 1) && (
        <div>
          <CustomBreadScrum data={breadScrumData} />

          <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
            <div className="d-flex k-flex-column">
              <h1>Employee Future Leave</h1>
            </div>
          </div>

          <TabStrip
            className="app-tab"
            selected={selected}
            onSelect={handleSelect}
          >
            <TabStripTab title="Employee future leave">
              <div className="d-flex  k-justify-content-between">
                <div className="d-flex justify-content-between k-w-full">
                  {checkPrivialgeGroup("EFLSDF", 1) && (
                    <DatePicker
                      placeholder="Start Date"
                      size="medium"
                      width={250}
                      value={startDateValue}
                      onChange={handleStartDateChange}
                    />
                  )}
                  {checkPrivialgeGroup("EFLEDF", 1) && (
                    <DatePicker
                      placeholder="End Date"
                      size="medium"
                      width={250}
                      value={endDateValue}
                      onChange={handleEndDateChange}
                    />
                  )}
                  {checkPrivialgeGroup("EFLSGND", 1) && (
                    <DropDownList
                      style={{
                        width: "150px",
                      }}
                      defaultItem="Group No"
                      defaultValue={"Group No"}
                      className="app-dropdown "
                      data={groupList}
                      value={groupValue}
                      disabled={groupNumberConfig}
                      onChange={handleGroupChange}
                    />
                  )}
                  {checkPrivialgeGroup("EFLSupervisorD", 1) && (
                    <DropDownList
                      style={{
                        width: "250px",
                      }}
                      name="supervisorGroupNumber"
                      defaultItem="Supervisor"
                      className="app-dropdown"
                      data={supervisorList?.map((listData) => [
                        listData.fullName,
                      ])}
                      onChange={handleSupervisorChange}
                    />
                  )}
                </div>
              </div>

              <div className="mt-3">
                {checkPrivialgeGroup("EFLG", 1) && (
                  <Grid
                    sortable={true}
                    data={leaveData}
                    onDataStateChange={dataStateChange}
                    editField="inEdit"
                    onRowClick={rowClick}
                    onItemChange={itemChange}
                    sort={sort}
                    onSortChange={(e) => {
                      onSortChange(e);
                    }}
                    pageable={{
                      buttonCount: 4,
                      pageSizes: [10, 15, 50, "All"],
                      pageSizeValue: pageSizeValue,
                    }}
                    onPageChange={pageChange}
                    skip={page.skip}
                    take={page.take}
                    total={pageTotal}
                  >
                    <GridColumn
                      field="employee.firstName"
                      title="Name"
                      width="200px"
                      cell={(props) => {
                        const empName = props.dataItem.employee
                          ? props.dataItem.employee.displayName
                          : "";
                        return <td>{empName}</td>;
                      }}
                    />
                    <GridColumn
                      field="beginDate"
                      title="Start Date"
                      cell={(props) => {
                        return (
                          <td>
                            {formatDate(
                              new Date(props.dataItem.beginDate),
                              "MM/dd/yyyy hh:mm a"
                            )}
                          </td>
                        );
                      }}
                    />

                    <GridColumn
                      field="endDate"
                      title="End Date"
                      cell={(props) => {
                        return (
                          <td>
                            {formatDate(
                              new Date(props.dataItem.endDate),
                              "MM/dd/yyyy hh:mm a"
                            )}
                          </td>
                        );
                      }}
                    />

                    <GridColumn
                      field="jobDescription"
                      title="Job"
                      width="300px"
                    />
                    <GridColumn
                      field="supervisorApprovedDate"
                      title="Approval Date"
                      cell={(props) => {
                        return (
                          <td>
                            {props.dataItem.supervisorApprovedDate
                              ? formatDate(
                                new Date(
                                  props.dataItem.supervisorApprovedDate
                                ),
                                "MM/dd/yyyy hh:mm a"
                              )
                              : ""}
                          </td>
                        );
                      }}
                    />
                  </Grid>
                )}
              </div>
            </TabStripTab>
          </TabStrip>
        </div>
      )}
    </>
  );
}
