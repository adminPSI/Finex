import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useEffect, useState } from "react";
import {
  ConfigurationEndPoints,
  EmplTimecardEndPoints,
  TimecardEndPoints
} from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import CustomBreadScrum from "../Shared/CustomBreadScrum";

export default function EmployeeForDay() {
  const [selected, setSelected] = useState(0);
  const handleSelect = (e) => {
    setSelected(e.selected);
  };

  const [dataResult, setDataResult] = useState([]);
  const [groupList, setGroupList] = useState(["1"]);
  const [supervisorList, setSupervisorList] = useState([]);
  const [dateValue, setDateValue] = useState(new Date());
  const [groupValue, setGroupValue] = useState();
  const [supervisorValue, setSupervisorValue] = useState();
  let [employeeDetail, setEmployeeDetail] = useState({});
  const [groupNumberConfig, setGroupNumberConfig] = useState(false);

  useEffect(() => {
    getGroup();
    getSupervisorData();
    getEmployeeDetail();
    getEmployeeDayList();
    if (dataResult.length) {
      addRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getEmployeeDayList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue, groupValue, supervisorValue]);

  const handleDateChange = (event) => {
    let date = event.value;
    setDateValue(date);
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
    getEmployeeDayList(direction, sortColumn);
  };

  const getEmployeeDayList = (direction = true, sortKey = "modifiedDate") => {
    let date;
    if (dateValue) {
      date = dateValue.toISOString().split("T")[0];
    }
    axiosInstance({
      method: "GET",
      url: TimecardEndPoints.TimeCardEmployeeDay,
      withCredentials: false,
      params: {
        groupId: groupValue,
        date: date,
        supervisorGroupId: supervisorValue,
        desc: direction,
        sortKey: sortKey,
      },
    })
      .then((response) => {
        let data = response.data;
        setDataResult(data);
      })
      .catch(() => { });
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
  var compareDate = "MM/DD/YYYY";

  const onKeyUp = (e) => {
    const value = e.target.value;
    if (value !== compareDate) {
      const month = value.split("/")[0];
      const day = value.split("/")[1];
      const year = value.split("/")[2];
      const compareMonth = compareDate.split("/")[0];
      const compareDay = compareDate.split("/")[1];
      const compareYear = compareDate.split("/")[2];
      var IsChange = false;
      if (year == compareYear) {
        if (!isNaN(month) && month >= 1 && month <= 12 && month !== "01") {
          if (
            (month.slice(1) !== compareMonth.slice(1) &&
              month.slice(-1) !== compareMonth.slice(-1)) ||
            (compareMonth !== month && month == "11")
          ) {
            e.target.setSelectionRange(3, 5);
            IsChange = true;
          }
        } else if (compareMonth == "0" && month == "01") {
          e.target.setSelectionRange(3, 5);
          IsChange = true;
        }
        if (IsChange == false) {
          if (
            !isNaN(day) &&
            day >= 1 &&
            day <= 31 &&
            day !== "01" &&
            day !== "02" &&
            day !== "03"
          ) {
            if (
              (compareDay.slice(1) !== day.slice(1) &&
                compareDay.slice(-1) !== day.slice(-1)) ||
              day == "11" ||
              day == "22"
            ) {
              e.target.setSelectionRange(6, 10);
            }
          } else if (
            compareDay == "0" &&
            (day == "01" || day !== "02" || day !== "03")
          ) {
            e.target.setSelectionRange(6, 10);
          }
        }
      }
      compareDate = value;
    }
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
      title: "Employee For Day",
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
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Employee For The Day')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("EFTDM", 1) && (
        <div>
          <CustomBreadScrum data={breadScrumData} />

          <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
            <div className="d-flex k-flex-column">
              <h1>Employee For Day</h1>
            </div>
          </div>

          <TabStrip
            className="app-tab"
            selected={selected}
            onSelect={handleSelect}
          >
            <TabStripTab title="Employee for Day">
              <div className="d-flex  k-justify-content-between">
                <div className="d-flex justify-content-between k-w-full">
                  {checkPrivialgeGroup("EFTDF", 1) && (
                    <div className={"k-form-field-wrap"} onKeyUp={onKeyUp}>
                      <DatePicker
                        name="date"
                        size="medium"
                        width={250}
                        value={dateValue}
                        format="MM/dd/yyyy"
                        formatPlaceholder={{
                          year: "YYYY",
                          month: "MM",
                          day: "DD",
                        }}
                        onChange={handleDateChange}
                      />
                    </div>
                  )}
                  {checkPrivialgeGroup("SGND", 1) && (
                    <DropDownList
                      style={{
                        width: "250px",
                      }}
                      name="groupId"
                      data={groupList}
                      value={groupValue}
                      defaultItem="Group No"
                      defaultValue={"Group No"}
                      className="app-dropdown "
                      disabled={groupNumberConfig}
                      onChange={handleGroupChange}
                    />
                  )}
                  {checkPrivialgeGroup("SupervisorD", 1) && (
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
                {checkPrivialgeGroup("EFTDG", 1) && (
                  <Grid
                    sortable={true}
                    data={dataResult}
                    editField="inEdit"
                    onRowClick={rowClick}
                    onItemChange={itemChange}
                    sort={sort}
                    onSortChange={(e) => {
                      onSortChange(e);
                    }}
                  >
                    <GridColumn
                      field="employee.firstName"
                      title="Name"
                      width="200px"
                      cell={(props) => {
                        let employeeName = props.dataItem.employee
                          ? props.dataItem.employee.displayName
                          : "";
                        return <td>{employeeName}</td>;
                      }}
                    />
                    <GridColumn
                      field="startDateTime"
                      title="Start Date Time"
                      editor="date"
                      cell={(props) => {
                        const date = new Date(props.dataItem.startDateTime);
                        const month = (date.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const day = date.getDate().toString().padStart(2, "0");
                        const fullYear = date.getFullYear();

                        let hours = date.getHours();
                        const ampm = hours >= 12 ? "PM" : "AM";
                        hours = hours % 12;
                        hours = hours ? hours : 12;

                        const minutes = date
                          .getMinutes()
                          .toString()
                          .padStart(2, "0");
                        return (
                          <td>{`${month}/${day}/${fullYear} ${hours}:${minutes} ${ampm}`}</td>
                        );
                      }}
                    />
                    <GridColumn
                      field="EndDateTime"
                      title="End Date Time"
                      editor="date"
                      cell={(props) => {
                        const date = new Date(props.dataItem.endDateTime);
                        const month = (date.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const day = date.getDate().toString().padStart(2, "0");
                        const fullYear = date.getFullYear();

                        let hours = date.getHours();
                        const ampm = hours >= 12 ? "PM" : "AM";
                        hours = hours % 12;
                        hours = hours ? hours : 12;

                        const minutes = date
                          .getMinutes()
                          .toString()
                          .padStart(2, "0");
                        return (
                          <td>{`${month}/${day}/${fullYear} ${hours}:${minutes} ${ampm}`}</td>
                        );
                      }}
                    />
                    <GridColumn
                      field="leaveType"
                      title="LeaveType"
                      width="100px"
                    />
                    <GridColumn field="job" title="Job" width="100px" />
                    <GridColumn
                      field="hourlyType"
                      title="Hours Type"
                      width="150px"
                    />
                    <GridColumn field="hours" title="Hours" width="100px" />
                    <GridColumn field="memo" title="Notes" />
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
