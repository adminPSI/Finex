import { orderBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import {
  GridColumn as Column,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { EmployeeEndPoints } from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import { projectService } from "../../services/ProjectServices";
import Constants from "../common/Constants";
import {
  ColumnFormCurrencyTextBox,
  ColumnFormNumericTextBox,
} from "../form-components";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";
import { DatePickerCell } from "./DatePickerCell";
import { MyCommandCell } from "./myCommandCell";
import { DropDownCell } from "./myDropDownCell";
const filterOperators = {
  text: [
    {
      text: "grid.filterContainsOperator",
      operator: "contains",
    },
  ],
};
const initialDataState = {
  skip: 0,
  take: Constants.KendoGrid.defaultPageSize,
};
const Labour = ({ project }) => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = React.useState();
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageTotal, setPageTotal] = React.useState();
  const [searchText, setsearchText] = React.useState("");
  const [showFilter, setshowFilter] = React.useState(false);
  const [typeOfWorkList, setTypeOfWorkList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [columnShow, setColumnShow] = useState(false);
  const [selectedRowObject, setSelectedRowObject] = useState(null);

  const DropDownCommandCell = (props) => {
    const localizedData = employeeList;
    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value.id,
        });
      }
    };
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];
    localizedData.sort((a, b) => a.firstName.localeCompare(b.firstName));
    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            onChange={handleChange}
            id={"firstName"}
            name={"firstName"}
            textField={"firstName"}
            itemRender={nameRender}
            valueRender={valueRender}
            dataItemKey="id"
            data={localizedData.sort((a, b) => {
              const isANumber = /^\d/.test(a["firstName"]);
              const isBNumber = /^\d/.test(b["firstName"]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a["firstName"].localeCompare(b["firstName"]);
            })}
            popupSettings={{ width: "auto" }}
            value={localizedData.find((c) => c.id == dataValue)}
          />
        ) : (
          localizedData.find((c) => c.id == dataValue)?.firstName +
          " " +
          localizedData.find((c) => c.id == dataValue)?.lastName
        )}
      </td>
    );
  };

  const [gridHourlyRate, setHourlyRate] = useState([]);

  const valueRender = (element, value) => {
    if (!value) {
      return element;
    }
    const children = [
      <span>
        {value.displayName}
      </span>,
    ];

    return React.cloneElement(element, { ...element.props }, children);
  };
  const nameRender = (li, itemProps) => {
    const itemChildren = (
      <span>
        {itemProps?.dataItem?.displayName}
      </span>
    );
    return React.cloneElement(li, li.props, itemChildren);
  };

  useEffect(() => {
    getEmployeeData();
    BindLabourGrid();
    projectService
      .fetchTypeOfWorkList()
      .then((data) => {
        setTypeOfWorkList([{ type: "Select Type of Work", id: null }, ...data]);
      })
      .catch(() => { });
  }, [project]);
  const getEmployeeData = () => {
    axiosInstance({
      method: "GET",
      url: EmployeeEndPoints.employeeByOrg,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;

        setEmployeeList(data);
      })
      .catch(() => { });
  };
  const initialSort = [
    {
      field: "empId",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onCheckBox = (event) => {
    const field = event.target.name;
    setColumnShow(!columnShow);
  };
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindLabourGrid({
      ...bindLabourGrid,
      hours: 0,
      hourlyRate: 0,
      totalCost: 0,
      search: searchText,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindLabourGrid, setBindLabourGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindLabourGrid) {
        BindLabourGrid(
          bindLabourGrid.empName,
          bindLabourGrid.workType,
          bindLabourGrid.hours,
          bindLabourGrid.hourlyRate,
          bindLabourGrid.totalCost,
          bindLabourGrid.search,
          bindLabourGrid.cskip,
          bindLabourGrid.ctake == "All" ? 0 : bindLabourGrid.ctake,
          bindLabourGrid.desc,
          bindLabourGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindLabourGrid]);

  const BindLabourGrid = (
    empName = "",
    workType = "",
    hours = 0,
    hourlyRate = 0,
    totalCost = 0,
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "empId"
  ) => {
    cskip = cskip ? cskip : 0;
    projectService
      .getLabourListWithFilter(
        project.id,
        empName,
        workType,
        hours,
        hourlyRate,
        totalCost,
        search,
        cskip,
        ctake,
        desc,
        sortKey
      )
      .then((labourResponce) => {
        setHourlyRate([]);
        let data = labourResponce.data;
        data = data.map((element) => {
          element.date = new Date(element.date);
          element.projectEnded = project.endDate ? true : false;
          return element;
        });
        setPageTotal(labourResponce.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: labourResponce.total,
          });
        }
        let HourlyRate = [];
        data.forEach((element) => {
          let obj = {
            dataItem: element,
            value: element.hourlyRate,
          };
          HourlyRate.push(obj);
        });

        if (!project.endDate) {
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            id: 0,
          };
          HourlyRate.push({ dataItem: newDataItem, value: null });
          setHourlyRate(HourlyRate);
          setData(orderBy([...data, newDataItem], sort));
        } else {
          setHourlyRate(HourlyRate);
          setData(orderBy(data, sort));
        }
      })
      .catch(() => { });
  };
  useEffect(() => {
    setData(orderBy(data, sort));
  }, [sort]);
  const editField = "inEdit";

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      remove={openDeleteConfirmDialog}
      discard={discard}
      update={update}
      cancel={cancel}
      editField={editField}
    />
  );
  const openDeleteConfirmDialog = (dataItem) => {
    setDeleteVisible(dataItem);
  };
  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };
  const remove = () => {
    projectService
      .deleteLabourList(deleteVisible.id)
      .then((data) => {
        setDeleteVisible(null);
        if (pageTotal != "All" && pageTotal - 1 == page.skip) {
          page.skip = page.skip - page.take;
          setPage({ page });
          setBindLabourGrid({
            hours: 0,
            hourlyRate: 0,
            totalCost: 0,
            cskip: page.skip,
            ctake: page.take,
          });
        } else {
          setBindLabourGrid({
            hours: 0,
            hourlyRate: 0,
            totalCost: 0,
            cskip: page.skip,
            ctake: page.take,
          });
        }
      })
      .catch(() => { });
  };
  const update = (dataItem) => {
    let index = gridHourlyRate.findIndex(
      (price) => price.dataItem.id == dataItem.id
    );

    if (
      !dataItem.date ||
      !dataItem.empId ||
      !dataItem.hours ||
      index == -1 ||
      !dataItem.totalCost
    ) {
      showErrorNotification("Please fill in all the fields");
    } else {
      dataItem.inEdit = false;
      if (dataItem.id != 0) {
        let newLabourData = {
          id: dataItem.id,
          orG_ID: 7,
          projectId: project.id,
          date: dataItem.date,
          empId: dataItem.empId,
          hours: dataItem.hours,
          hourlyRate: dataItem.hourlyRate,
          totalCost: dataItem.totalCost,
          workTypeId: dataItem.workTypeId,
        };
        projectService
          .editLabourList(project.id, newLabourData)
          .then((data) => {
            BindLabourGrid();
          })
          .catch(() => { });
      } else {
        let newLabourData = {
          id: 0,
          orG_ID: 7,
          projectId: project.id,
          date: dataItem.date,
          empId: dataItem.empId,
          hours: dataItem.hours,
          hourlyRate: dataItem.hourlyRate,
          totalCost: dataItem.totalCost,
          workTypeId: dataItem.workTypeId,
        };
        projectService
          .addLabourList(project.id, newLabourData)
          .then((data) => {
            BindLabourGrid();
          })
          .catch(() => { });
      }
    }
  };

  const discard = (dataItem) => {
    const newData = [...data];
    newData.splice(0, 1);
    setData(newData);
  };
  const cancel = (dataItem) => {
    let newData = data.map((item) =>
      item.id == dataItem.id
        ? {
          ...selectedRowObject,
          inEdit: false,
        }
        : item
    );
    setData(newData);
  };
  const enterEdit = (dataItem) => {
    let newData = data.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    const matchItem = data.find((item) => item.id == dataItem.id);
    setSelectedRowObject(matchItem);
    setData(newData);
  };
  const itemChange = (event) => {
    if (event.field == "hours" || event.field == "hourlyRate") {
      data.map((item) => {
        if (
          item.id == event.dataItem.id &&
          ((item.hours && event.value && event.field == "hourlyRate") ||
            (item.hourlyRate && event.value && event.field == "hours"))
        ) {
          item.totalCost =
            event.field == "hours"
              ? event.value * item.hourlyRate
              : item.hours * event.value;
        } else if (item.id == event.dataItem.id) {
          item.totalCost = 0;
        }
      });
    }
    const field = event.field || "";
    const newData = data.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [field]: event.value,
        }
        : item
    );
    setData(newData);
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindLabourGrid({
      ...bindLabourGrid,
      cskip: 0,
      search: value,
      empName: undefined,
      workType: undefined,
      hours: undefined,
      hourlyRate: undefined,
      totalCost: undefined,
    });
  };
  const filterChange = (event) => {
    var empName = "";
    var workType = "";
    var hours = 0;
    var hourlyRate = 0;
    var totalCost = 0;
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "empId") {
          empName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "workTypeId") {
          workType = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "hours") {
          hours = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "hourlyRate") {
          hourlyRate = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "totalCost") {
          totalCost = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindLabourGrid({
      empName: empName,
      workType: workType,
      hours: hours,
      hourlyRate: hourlyRate,
      totalCost: totalCost,
      search: undefined,
      cskip: 0,
    });
    setFilter(event.filter);
  };
  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindLabourGrid({
        ...bindLabourGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindLabourGrid({
        ...bindLabourGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: data.length,
      });
    }
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Project Costing')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("PCLG", 1) && (
        <>
          <Grid
            resizable={true}
            filterable={showFilter}
            expandField="expanded"
            filter={filter}
            filterOperators={filterOperators}
            onFilterChange={filterChange}
            skip={page.skip}
            take={page.take}
            total={pageTotal}
            pageable={{
              buttonCount: 4,
              pageSizes: [10, 15, 50, "All"],
              pageSizeValue: pageSizeValue,
            }}
            data={data}
            onPageChange={pageChange}
            editField={editField}
            dataItemKey={"id"}
            onItemChange={itemChange}
            sortable={true}
            sort={sort}
            onSortChange={(e) => {
              onSortChange(e);
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
                    <i className="fa-solid fa-arrow-down-wide-short"></i> &nbsp;
                    More Filter
                  </Button>
                </div>
                <div className="col-sm-6 d-flex align-items-center justify-content-center">
                  <div className="col-3">
                    {checkPrivialgeGroup("LSMICB", 1) && (
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
            <Column
              field="date"
              title="Date"
              format="{0:d}"
              cell={DatePickerCell}
              filterable={false}
            />
            <Column field="empId" title="Name" cell={DropDownCommandCell} />

            <Column
              field="workTypeId"
              title="Type Of Work"
              cell={(dataItem) => {
                const sortData = typeOfWorkList
                  .filter((item) => !!item.id)
                  .sort((a, b) => a.type.localeCompare(b.type));
                return DropDownCell(dataItem, sortData);
              }}
            />
            <Column
              field="hours"
              title="Hours"
              width={75}
              cell={ColumnFormNumericTextBox}
            />
            <Column
              field="hourlyRate"
              title="Hourly Rate"
              width={110}
              format="{0:c2}"
              cell={ColumnFormCurrencyTextBox}
              headerCell={(props) => {
                return (
                  <span className="k-cell-inner">
                    <span className="k-link !k-cursor-default d-flex justify-content-end">
                      <span className="k-column-title">{props.title}</span>
                      {props.children}
                    </span>
                  </span>
                );
              }}
            />
            <Column
              field="totalCost"
              title="Total Cost"
              width={150}
              editable={false}
              headerCell={(props) => {
                return (
                  <span className="k-cell-inner">
                    <span className="k-link !k-cursor-default d-flex justify-content-end">
                      <span className="k-column-title">{props.title}</span>
                      {props.children}
                    </span>
                  </span>
                );
              }}
              cell={(props) => {
                var amount = props.dataItem?.totalCost || 0;
                amount =
                  "$" +
                  amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                return <td className="!k-text-right">{`${amount}`}</td>;
              }}
            />
            {columnShow && (
              <Column
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
            {columnShow && <Column field="createdBy" title="Created By" />}
            {columnShow && (
              <Column
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
            {columnShow && <Column field="modifiedBy" title="Modified By" />}
            {checkPrivialgeGroup("PCLCC", 3) && (
              <Column cell={CommandCell} width="150px" filterable={false} />
            )}
          </Grid>
          {deleteVisible && (
            <Dialog
              title={<span>Please confirm</span>}
              onClose={closeDeleteDialog}
            >
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
                  onClick={remove}
                >
                  Yes
                </Button>
              </DialogActionsBar>
            </Dialog>
          )}
        </>
      )}
    </>
  );
};

export default Labour;
