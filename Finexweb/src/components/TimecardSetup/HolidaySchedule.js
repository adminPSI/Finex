import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { HolidayEndPoints } from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import MyCommandCell from "../cells/CommandCell";
import Constants from "../common/Constants";
import { DatePickerCell } from "../DatePickerCell";
import DeleteModal from "../modal/DeleteModal";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import AddNewHolidaySchedule from "./AddNewHolidaySchedule";
import DuplicateHoliday from "./DuplicateHoliday";

export default function HolidaySchedule() {
  const [holidayScheduleList, setHolidayScheduleList] = useState([]);
  const [holidayYearList, setHolidayYearList] = useState([]);
  const [holidayScheduleHeader, setHolidayScheduleHeader] = useState({
    holidayScheduleName: "Schedule",
  });
  const [holidayYear, setHolidayYear] = useState();
  const [holidayData, setHolidayData] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [deleteType, setDeleteType] = useState();
  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };
  const [deleteVisible, setDeleteVisible] = useState(false);
  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };
  const [showDuplicate, setShowDuplicate] = useState(false);
  const toggleDuplicateDialog = () => {
    setShowDuplicate(!showDuplicate);
  };
  const [columnShow, setColumnShow] = useState(false);
  const editField = "inEdit";

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

  useEffect(() => {
    getHolidayYear();
    getHolidayScheduleHeader();
  }, []);

  const getHolidayYear = () => {
    axiosInstance({
      method: "GET",
      url: HolidayEndPoints.HolidayScheduleYear,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.reverse();
        setHolidayYear(data[0]);
        setHolidayScheduleHeader({});
        getHolidayScheduleHeader(data[0]);
        setHolidayYearList(data);
      })
      .catch(() => { });
  };

  const getHolidayScheduleHeader = (year) => {
    if (year !== undefined) {
      axiosInstance({
        method: "GET",
        url: HolidayEndPoints.HolidaySchedule + "/ByYear/?year=" + year,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setHolidayScheduleList(data);
          if (data[0]?.id) {
            setHolidayScheduleHeader(data[0]);
            setBindDataGrid({
              id: data[0].id,
            });
          }
        })
        .catch(() => { });
    }
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const AddHolidayDate = (data) => {
    let holidayDataReq = {
      holidayScheduleId: holidayScheduleHeader.id,
      holidayName: data.holidayName,
      date: data.date,
      calculateVacationSick: true,
    };
    if (data.id > 0) {
      holidayDataReq.id = data.id;
    }
    axiosInstance({
      method: "POST",
      url: HolidayEndPoints.Holiday,
      data: holidayDataReq,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        let index = holidayData.findIndex((date) => date.id == 0);
        if (index >= 0) {
          holidayData[index].id = data.id;
          holidayData[index].calculateVacationSick = data.calculateVacationSick;
          holidayData[index].holidayScheduleId = data.holidayScheduleId;
          addRecord();
        }
        setBindDataGrid({ ...bindDataGrid });
      })
      .catch(() => { });
  };

  const editHolidaySchedule = (data) => {
    let holidayData = {
      id: data.id,
      holidayScheduleId: data.holidayScheduleId,
      holidayName: data.holidayName,
      date: data.date,
      calculateVacationSick: data.calculateVacationSick,
    };
    axiosInstance({
      method: "PUT",
      url: HolidayEndPoints.Holiday,
      data: holidayData,
      withCredentials: false,
    })
      .then((response) => { })
      .catch(() => { });
  };

  const [bindDataGrid, setBindDataGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.id,
          bindDataGrid.date,
          bindDataGrid.holidayName,
          bindDataGrid.search,
          bindDataGrid.cSkip,
          bindDataGrid.cTake,
          bindDataGrid.desc,
          bindDataGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindDataGrid]);

  const initialHolidaySort = [
    {
      field: "date",
      dir: "asc",
    },
  ];
  const [holidaySort, setHolidaySort] = useState(initialHolidaySort);
  const onSortHolidayChange = (event) => {
    setHolidaySort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindDataGrid({ ...bindDataGrid, desc: direction, sortKey: sortColumn });
  };

  const BindDataGrid = (
    id,
    date = "",
    holidayName = "",
    search = "",
    cSkip = page.skip,
    cTake = page.take,
    direction = false,
    sortKey = "date"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        HolidayEndPoints.HolidayScheduleDate +
        "/" +
        id +
        "/Date" +
        "?date=" +
        date +
        "&&holidayName=" +
        holidayName +
        "&&search=" +
        search +
        "&&skip=" +
        cSkip +
        "&&take=" +
        cTake +
        "&&desc=" +
        direction +
        "&&sortKey=" +
        sortKey,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setPageTotal(response.data.total);
        let deepCopyObj = JSON.parse(JSON.stringify(data));
        deepCopyObj.map((item) => {
          if (item.date) {
            item.date = new Date(item.date);
          }
          return item;
        });
        const newDataItem = {
          inEdit: true,
          id: 0,
        };
        deepCopyObj = [...deepCopyObj, newDataItem];
        setHolidayData(deepCopyObj);
      })
      .catch(() => { });
  };

  const HandleNewHolidaySchedule = () => {
    getHolidayScheduleHeader(holidayYear);
  };

  const handleDuplicate = (year) => {
    getHolidayScheduleHeader(holidayYear);
    getHolidayYear();
  };

  const handleDelete = () => {
    if (deleteType == "schedule") {
      deleteHolidaySchedule();
    } else {
      deleteHolidayDate();
    }
  };

  const deleteHolidayDate = () => {
    const updateItem = holidayData.filter(
      (item) => item.id !== selectedItem.id
    );
    setHolidayData(updateItem);
    axiosInstance({
      method: "delete",
      url: HolidayEndPoints.DeleteHolidayScheduleDate + "/" + selectedItem.id,
      withCredentials: false,
    })
      .then((response) => {
        setBindDataGrid({ ...bindDataGrid });
      })
      .catch(() => { });
    toggleDeleteDialog();
  };

  const deleteHolidaySchedule = () => {
    const updateItem = holidayScheduleList.filter(
      (schedule) => schedule.id !== holidayScheduleHeader.id
    );
    setHolidayScheduleList(updateItem);
    axiosInstance({
      method: "delete",
      url: HolidayEndPoints.HolidaySchedule + "/" + holidayScheduleHeader.id,
      withCredentials: false,
    })
      .then((response) => {
        setHolidayScheduleHeader({});
        setHolidayData([]);
        getHolidayYear();
        getHolidayScheduleHeader(holidayYear);
        showSuccessNotification("Holiday schedule is deleted successfully");
      })
      .catch(() => { });
    toggleDeleteDialog();
  };

  const handleHolidayYear = (event) => {
    if (event.target.value !== "Year") {
      setHolidayYear(event.target.value);
      setHolidayScheduleHeader({});
      getHolidayScheduleHeader(event.target.value);
    } else {
      setHolidayYear(null);
      setHolidayScheduleHeader({});
      setHolidayScheduleList([]);
      setHolidayData([]);
    }
  };

  const handleHolidayScheduleHeader = (event) => {
    let selectedHolidayHeader = event.target.value;
    setHolidayScheduleHeader(event.target.value);
    setPage({
      skip: 0,
      take: 10,
    });
    setBindDataGrid({
      id: selectedHolidayHeader.id,
      cSkip: 0,
      cTake: 10,
    });
  };

  const itemChange = (event) => {
    const newData = holidayData.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [event.field || ""]: event.value,
        }
        : item
    );
    setHolidayData(newData);
  };

  const addRecord = () => {
    if (
      holidayData[holidayData.length - 1]?.holidayName ||
      !holidayData.length
    ) {
      let index = holidayData.findIndex(
        (date) => date.inEdit == true && date.id !== 0
      );
      if (index >= 0) {
        holidayData[index].inEdit = false;
      }

      const newDataItem = {
        inEdit: true,
        id: 0,
      };
      setHolidayData([...holidayData, newDataItem]);
    }
  };

  const remove = (dataItem) => {
    setDeleteType("date");
    toggleDeleteDialog();
    setSelectedItem(dataItem);
  };

  const add = (dataItem) => {
    if (!dataItem.holidayName) {
      return;
    }
    updateHolidayData(dataItem);
    AddHolidayDate(dataItem);
  };

  const updateHolidayData = (dataItem) => {
    dataItem.inEdit = false;
    let deepCopyObj = JSON.parse(JSON.stringify(holidayData));
    deepCopyObj.map((item) => {
      if (item.date) {
        item.date = new Date(item.date);
      }
      return item;
    });
    let index = deepCopyObj.findIndex((record) => record.id == dataItem.id);
    deepCopyObj[index] = dataItem;
    setHolidayData(deepCopyObj);
  };

  const updateItem = (item) => {
    let data = [...holidayData];
    let index = data.findIndex((record) => record.id == item.id);
    data[index] = item;
    return data;
  };

  const update = (dataItem) => {
    dataItem.inEdit = false;
    const newData = updateItem(dataItem);
    setHolidayData(newData);
    editHolidaySchedule(dataItem);
  };

  const discard = (dataItem) => {
    const newData = [...holidayData];
    newData.splice(0, 1);
    setHolidayData(newData);
  };

  const cancel = (dataItem) => {
    let newData = holidayData.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: false,
        }
        : item
    );
    setHolidayData(newData);
  };

  const enterEdit = (dataItem) => {
    let newData = holidayData.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    setHolidayData(newData);
  };

  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [filter, setFilter] = useState();
  const [showFilter, setShowFilter] = useState(false);
  const [, setSearchText] = useState("");
  const [pageSizeValue, setPageSizeValue] = useState();
  const [page, setPage] = useState(initialDataState);
  const [pageTotal, setPageTotal] = useState();

  const pageChange = (event) => {
    if (event.page.take <= 15) {
      setPageSizeValue(event.page.take);
      setBindDataGrid({
        ...bindDataGrid,
        cSkip: event.page.skip,
        cTake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindDataGrid({
        ...bindDataGrid,
        cSkip: 0,
        cTake: 10,
      });
      setPage({
        cSkip: 0,
        cTake: holidayData.length,
      });
    }
  };

  const filterChange = (event) => {
    var date = "";
    var holidayName = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "date") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 10
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let formatDate =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          date = formatDate;
        }
        if (event.filter.filters[i].field == "holidayName") {
          holidayName = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: 10,
    });
    setBindDataGrid({
      ...bindDataGrid,
      date: date,
      cSkip: 0,
      cTake: 10,
      holidayName: holidayName,
    });
    setFilter(event.filter);
  };

  const MoreFilter = () => {
    setShowFilter(!showFilter);
  };
  const filterData = (e) => {
    let value = e.target.value;
    setSearchText(value);
    setPage({
      skip: 0,
      take: 10,
    });
    setBindDataGrid({
      ...bindDataGrid,
      search: value,
      cSkip: 0,
      cTake: 10,
    });
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('HRSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("Hschedule", 1) && (
        <>
          <div className="d-flex  k-justify-content-between">
            <div>
              <Button
                className="k-button me-2"
                fillMode="flat"
                iconClass="fa fa-filter fa-fw"
                size={"large"}
              ></Button>
              {checkPrivialgeGroup("YearD", 1) && (
                <DropDownList
                  style={{
                    width: "150px",
                  }}
                  className="app-dropdown me-2"
                  data={holidayYearList}
                  value={holidayYear}
                  defaultItem="Year"
                  onChange={handleHolidayYear}
                />
              )}
              {checkPrivialgeGroup("HolidayND", 1) && (
                <DropDownList
                  style={{
                    width: "200px",
                  }}
                  className="app-dropdown me-2"
                  data={holidayScheduleList}
                  textField="holidayScheduleName"
                  value={holidayScheduleHeader}
                  defaultValue="Schedule"
                  onChange={handleHolidayScheduleHeader}
                />
              )}
            </div>

            <div className="d-flex">
              {checkPrivialgeGroup("HSADCO", 2) &&
                <Button className="k-button k-button-lg k-rounded-lg k-mr-2" themeColor={"primary"} onClick={() => toggleDuplicateDialog()}>Clone</Button>}
              {checkPrivialgeGroup("HSADDO", 2) &&
                <Button className="k-button k-button-lg k-rounded-lg k-mr-2" themeColor={"primary"} onClick={() => {
                  setDeleteType("schedule");
                  toggleDeleteDialog();
                }}>Delete</Button>}
              {checkPrivialgeGroup("AddNHSchedule", 2) && (
                <Button
                  className="k-button k-button-lg k-rounded-lg"
                  themeColor={"primary"}
                  onClick={toggleDialog}
                >
                  Add
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3">
            {checkPrivialgeGroup("HolidayG", 1) && (
              <Grid
                style={{
                  height: "450px",
                }}
                sortable={true}
                data={holidayData}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                editField={editField}
                dataItemKey={"id"}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                filterable={showFilter}
                onPageChange={pageChange}
                filter={filter}
                onItemChange={itemChange}
                onFilterChange={filterChange}
                sort={holidaySort}
                onSortChange={(e) => {
                  onSortHolidayChange(e);
                }}
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
                        <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                        &nbsp; More Filter
                      </Button>
                    </div>
                    <div className="col-sm-6 d-flex align-items-center justify-content-center">
                      <div className="col-3">
                        <Checkbox
                          type="checkbox"
                          id="modifiedBy"
                          name="modifiedBy"
                          defaultChecked={columnShow}
                          onChange={onCheckBox}
                          label={"Modified Info"}
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
                <GridColumn
                  field="date"
                  filter="date"
                  title="Holiday Date"
                  editor="date"
                  cell={DatePickerCell}
                  format="{0:MM/dd/yyyy}"
                />

                <GridColumn
                  field="holidayName"
                  title="Holiday Name"
                  width="300px"
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
                {columnShow && (
                  <GridColumn
                    field="createdBy"
                    title="Created By"
                    editable={false}
                  />
                )}
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
                {columnShow && (
                  <GridColumn
                    field="modifiedBy"
                    title="Modified By"
                    editable={false}
                  />
                )}
                {checkPrivialgeGroup("HolidayCC", 2) && (
                  <GridColumn filterable={false} cell={CommandCell} />
                )}
              </Grid>
            )}
            {visible && (
              <AddNewHolidaySchedule
                toggleDialog={toggleDialog}
                holidaySchedule={HandleNewHolidaySchedule}
                getHolidayYear={getHolidayYear}
              />
            )}
            {deleteVisible && (
              <DeleteModal
                toggleDialog={toggleDeleteDialog}
                title={"schedule"}
                name={"Schedule"}
                deleteSubmit={handleDelete}
              />
            )}
            {showDuplicate && (
              <DuplicateHoliday
                toggleDialog={toggleDuplicateDialog}
                handleDuplicate={handleDuplicate}
                holidayYear={holidayYearList}
                holidaySchedule={holidayScheduleList}
              />
            )}
          </div>
        </>
      )
      }
    </>
  );
}
