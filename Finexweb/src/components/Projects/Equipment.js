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
import usePrivilege from "../../helper/usePrivilege";
import { equipmentService } from "../../services/EquipmentService";
import { projectService } from "../../services/ProjectServices";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import Constants from "../common/Constants";
import {
  ColumnFormNumericTextBox,
  ColumnDatePicker,
} from "../form-components";
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
const Equipment = ({ project }) => {
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
  const [equipmentSetupList, setEquipmentSetupList] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [columnShow, setColumnShow] = useState(false);
  const [selectedRowObject, setSelectedRowObject] = useState(null);

  const DropDownCommandCell = (props) => {
    const localizedData = equipmentSetupList;
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
    localizedData.sort((a, b) => a.name.localeCompare(b.name));
    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            style={{
              width: "138px",
            }}
            onChange={handleChange}
            id={"name"}
            name={"name"}
            textField="name"
            dataItemKey="id"
            data={localizedData.sort((a, b) => {
              const isANumber = /^\d/.test(a["name"]);
              const isBNumber = /^\d/.test(b["name"]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a["name"].localeCompare(b["name"]);
            })}
            popupSettings={{ width: "auto" }}
            value={localizedData.find((c) => c.id == dataValue)}
          />
        ) : (
          localizedData.find((c) => c.id == dataValue)?.name || ""
        )}
      </td>
    );
  };

  useEffect(() => {
    BindEquipmentGrid();
    equipmentService.getEquipmentSetupList().then((equipmentSetupList) => {
      setEquipmentSetupList(equipmentSetupList);
    });
    projectService.fetchTypeOfWorkList().then((data) => {
      setTypeOfWorkList([{ type: "Select Type of Work", id: null }, ...data]);
    });
  }, [project]);
  // Sorting changes
  const initialSort = [
    {
      field: "equipmentId",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onCheckBox = (event) => {
    const field = event.target.name;
    setColumnShow(!columnShow);
  };
  // Sorting changes
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindEquipmentGrid({
      ...bindEquipmentGrid,
      hours: 0,
      hourlyRate: 0,
      totalCost: 0,
      search: searchText,
      cskip: 0,
      ctake: 10,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindEquipmentGrid, setBindEquipmentGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindEquipmentGrid) {
        BindEquipmentGrid(
          bindEquipmentGrid.empName,
          bindEquipmentGrid.workType,
          bindEquipmentGrid.hours,
          bindEquipmentGrid.hourlyRate,
          bindEquipmentGrid.totalCost,
          bindEquipmentGrid.search,
          bindEquipmentGrid.cskip,
          bindEquipmentGrid.ctake == "All" ? 0 : bindEquipmentGrid.ctake,
          bindEquipmentGrid.desc,
          bindEquipmentGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindEquipmentGrid]);

  const BindEquipmentGrid = (
    equipmentName = "",
    workType = "",
    hours = 0,
    hourlyRate = 0,
    totalCost = 0,
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "equipmentId"
  ) => {
    cskip = cskip ? cskip : 0;
    projectService
      .GetEquipmentListWithFilter(
        project.id,
        equipmentName,
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
        let data = labourResponce.data;
        setPageTotal(labourResponce.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: labourResponce.total,
          });
        }
        data = data.map((element) => {
          element.date = new Date(element.date);
          element.projectEnded = project.endDate ? true : false;
          return element;
        });
        if (!project.endDate) {
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            id: 0,
          };
          setData(orderBy([...data, newDataItem], sort));
        } else {
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
  // modify the data in the store, db etc
  const remove = () => {
    projectService
      .deleteEquipmentList(deleteVisible.id)
      .then((data) => {
        setDeleteVisible(null);
        if (pageTotal != "All" && pageTotal - 1 == page.skip) {
          page.skip = page.skip - page.take;
          setPage({ page });
          setBindEquipmentGrid({
            hours: 0,
            hourlyRate: 0,
            totalCost: 0,
            search: searchText,
            cskip: page.skip,
            ctake: page.take,
          });
        } else {
          setBindEquipmentGrid({
            hours: 0,
            hourlyRate: 0,
            totalCost: 0,
            search: searchText,
            cskip: page.skip,
            ctake: page.take,
          });
        }
      })
      .catch(() => { });
  };
  const update = (dataItem) => {
    if (
      !dataItem.date ||
      !dataItem.equipmentId ||
      !dataItem.hours ||
      !dataItem.hourlyRate ||
      !dataItem.totalCost
    ) {
      showErrorNotification("Please fill in all the fields");
    } else {
      dataItem.inEdit = false;
      if (dataItem.id != 0) {
        let newEquipmentData = {
          id: dataItem.id,
          orG_ID: 7,
          projectId: project.id,
          date: dataItem.date,
          equipmentId: dataItem.equipmentId,
          hours: dataItem.hours,
          hourlyRate: dataItem.hourlyRate,
          totalCost: dataItem.totalCost,
          workTypeID: dataItem?.workTypeId,
        };
        projectService
          .editEquipmentList(project.id, newEquipmentData)
          .then((data) => {
            showSuccessNotification("Equipment updated successfully");
            BindEquipmentGrid();
          })
          .catch(() => { });
      } else {
        let newEquipmentData = {
          id: 0,
          orG_ID: 7,
          projectId: project.id,
          date: dataItem.date,
          equipmentId: dataItem.equipmentId,
          hours: dataItem.hours,
          hourlyRate: dataItem.hourlyRate,
          totalCost: dataItem.totalCost,
          workTypeID: dataItem.workTypeId,
        };
        projectService
          .addEquipmentList(project.id, newEquipmentData)
          .then((data) => {
            showSuccessNotification("Equipment added successfully");
            BindEquipmentGrid();
          })
          .catch(() => { });
      }
    }
  };

  // Local state operations

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
    if (event.field == "equipmentId" || event.field == "hours") {
      var id =
        event.field == "equipmentId" ? event.value : event.dataItem.equipmentId;
      var equipmentIndex = equipmentSetupList.findIndex((c) => c.id == id);
      data.map((item) => {
        if (
          item.id == event.dataItem.id &&
          (equipmentSetupList[equipmentIndex]?.id ||
            event.field == "equipmentId")
        ) {
          item.hourlyRate = item?.hourlyRate
            ? item.hourlyRate
            : equipmentSetupList[equipmentIndex].hourlyRate;
          if (event.field == "equipmentId") {
            item.hourlyRate = equipmentSetupList[equipmentIndex].hourlyRate;
          }
          if (event.field == "equipmentId") {
            item.totalCost = item.hours * item.hourlyRate;
          }
          if (event.field == "hours") {
            item.totalCost = event.value * item.hourlyRate;
          }
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
    setBindEquipmentGrid({
      equipmentName: undefined,
      workType: undefined,
      hours: undefined,
      hourlyRate: undefined,
      totalCost: undefined,
      search: value,
      cskip: 0,
    });
  };
  const filterChange = (event) => {
    var equipmentName = "";
    var workType = "";
    var hours = 0;
    var hourlyRate = 0;
    var totalCost = 0;
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "equipmentId") {
          equipmentName = event.filter.filters[i].value;
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

    setBindEquipmentGrid({
      equipmentName: equipmentName,
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

      setBindEquipmentGrid({
        ...bindEquipmentGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindEquipmentGrid({
        ...bindEquipmentGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: data.length,
      });
    }
  };

  var compareDate = "MM/DD/YYYY";
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Project Costing')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("PCEG", 1) && (
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
                    {checkPrivialgeGroup("ESMICB", 1) && (
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
              editor="date"
              format="{0:MM/dd/yyyy}"
              filterCell={ColumnDatePicker}
              cell={DatePickerCell}
              filterable={false}
            />
            <Column
              field="equipmentId"
              title="Name"
              cell={DropDownCommandCell}
              filterable={false}
              filter={false}
              headerClassName="no-sort-icon"
            />
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
              cell={ColumnFormNumericTextBox}
            />
            <Column
              field="hourlyRate"
              title="Hourly Rate"
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
                var amount = props.dataItem?.hourlyRate || 0;
                amount =
                  "$" +
                  amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                return <td className="!k-text-right">{`${amount}`}</td>;
              }}
            />
            <Column
              field="totalCost"
              title="Total Cost"
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
            {checkPrivialgeGroup("PCECC", 3) && (
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

export default Equipment;
