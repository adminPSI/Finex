import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { eyedropperIcon } from "@progress/kendo-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { useTimecardContext } from "../../contexts/timecardContext";
import axiosInstance from "../../core/HttpInterceptor";
import { LeaveTypeEndPoints } from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import { CheckBoxCell } from "../cells/CheckBoxCell";
import Constants from "../common/Constants";
import { DropdownFilterCell } from "../common/Filter/DropdownFilterCell";

const MyCommandCell = (props) => {
  const { dataItem } = props;
  const isNewItem = dataItem.id == 0;

  let inEdit = dataItem.inEdit;

  const handleAddUpdate = useCallback(() => {
    isNewItem ? props.add(dataItem) : props.update(dataItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataItem, isNewItem]);

  const handleDiscardCancel = useCallback(() => {
    isNewItem ? props.discard(dataItem) : props.cancel(dataItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataItem, isNewItem]);

  const handleEdit = useCallback(() => {
    props.edit(dataItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataItem]);

  if (props.rowType == "groupHeader") return null;

  return inEdit ? (
    <td className="k-command-cell">
      <Button onClick={handleAddUpdate}>{isNewItem ? "Add" : "Save"}</Button>
      {!isNewItem && <Button onClick={handleDiscardCancel}>Cancel</Button>}
    </td>
  ) : (
    <td className="k-command-cell">
      <Button
        themeColor="primary"
        onClick={handleEdit}
        svgIcon={eyedropperIcon}
      />
    </td>
  );
};

const textCell = (props) => {
  const { dataItem } = props;
  return <td className="k-command-cell">{dataItem.description}</td>;
};

const checkBoxes = ["Yes", "No"];

const DropdownFilterCel = (props) => (
  <DropdownFilterCell {...props} data={checkBoxes} defaultItem={"select"} />
);

export default function VSPSetup() {
  const { isFormSubmitted, formType, resetFormSubmit } = useTimecardContext();
  useEffect(() => {
    if (isFormSubmitted && formType == "leaveType") {
      BindDataGrid();
      resetFormSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormSubmitted]);

  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [columnShow, setColumnShow] = useState(false);

  const editField = "inEdit";

  useEffect(() => {
    BindDataGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindDataGrid({
      ...bindDataGrid,
      search: searchText,
      cSkip: 0,
      cTake: 10,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindDataGrid, setBindDataGrid] = useState({});

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.Description,
          bindDataGrid.AllowEmpToSelect,
          bindDataGrid.RequireReason,
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

  const BindDataGrid = (
    Description = "",
    AllowEmpToSelect = "",
    RequireReason = "",
    search = "",
    cSkip = page.skip,
    cTake = page.take,
    desc = "true",
    sortKey = "modifiedDate"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        LeaveTypeEndPoints.getLeaveType +
        `?Description=${Description}&&Allowemptoselect=${AllowEmpToSelect}&&Requriereason=${RequireReason}` +
        "&&search=" +
        search +
        "&&skip=" +
        cSkip +
        "&&take=" +
        cTake +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setLeaveTypeList(data.data);
        setPageTotal(data.total);
      })
      .catch(() => { });
  };

  const EditLeaveType = (data) => {
    let leaveTypeData = {
      id: data.id,
      organizationId: data.organizationId,
      description: data.description,
      isActive: data.isActive == "true" ? "N" : "Y",
      allowEmployeeSelect: data.allowEmployeeSelect,
      isReasonRequired: data.isReasonRequired,
    };
    axiosInstance({
      method: "PUT",
      url: LeaveTypeEndPoints.LeaveType + "/" + data.id,
      data: leaveTypeData,
      withCredentials: false,
    })
      .then((response) => { })
      .catch(() => { });
  };

  const itemChange = (event) => {
    const field = event.field || "";

    const newData = leaveTypeList.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [field]: event.value,
        }
        : item
    );
    setLeaveTypeList(newData);
  };

  const enterEdit = (dataItem) => {
    let newData = leaveTypeList.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    setLeaveTypeList(newData);
  };

  const cancel = (dataItem) => {
    let newData = leaveTypeList.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: false,
        }
        : item
    );
    setLeaveTypeList(newData);
  };

  const update = (dataItem) => {
    dataItem.inEdit = false;
    let deepCopyObj = JSON.parse(JSON.stringify(leaveTypeList));
    let index = deepCopyObj.findIndex((record) => record.id == dataItem.id);
    deepCopyObj[index] = dataItem;
    setLeaveTypeList(deepCopyObj);
    EditLeaveType(dataItem);
  };

  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [filter, setFilter] = useState();
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pageSizeValue, setPageSizeValue] = useState();
  const [page, setPage] = useState(initialDataState);
  const [pageTotal, setPageTotal] = useState();
  const filterOperators = {
    text: [
      {
        text: "grid.filterContainsOperator",
        operator: "contains",
      },
    ],
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
    setBindDataGrid({
      ...bindDataGrid,
      search: searchText,
      cSkip: event.page.skip,
      cTake: take,
    });
  };
  const filterChange = (event) => {
    var AllowEmpToSelect = "";
    var description = "";
    var RequireReason = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "allowEmployeeSelect") {
          AllowEmpToSelect =
            event.filter.filters[i].value == "Yes"
              ? "true"
              : event.filter.filters[i].value == "No"
                ? "false"
                : "";
        }
        if (event.filter.filters[i].field == "description") {
          description = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "isReasonRequired") {
          RequireReason =
            event.filter.filters[i].value == "Yes"
              ? "true"
              : event.filter.filters[i].value == "No"
                ? "false"
                : "";
        }
      }
    }
    setPage({
      skip: 0,
      take: 10,
    });
    setBindDataGrid({
      ...bindDataGrid,
      Description: description,
      AllowEmpToSelect: AllowEmpToSelect,
      RequireReason: RequireReason,
      cSkip: 0,
      cTake: 10,
    });
    setFilter(event.filter);
  };
  const MoreFilter = () => {
    setShowFilter(!showFilter);
  };
  const filterData = (e) => {
    let searchText = e.target.value;
    setSearchText(searchText);
    setPage({
      skip: 0,
      take: 10,
    });
    setBindDataGrid({
      ...bindDataGrid,
      search: searchText,
      cSkip: 0,
      cTake: 10,
    });
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('HRSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("VSPSetupTab", 1) && (
        <>
          <div className="mt-3">
            {checkPrivialgeGroup("SSTG", 1) && (
              <Grid
                style={{
                  height: "450px",
                }}
                data={leaveTypeList}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                editField={editField}
                dataItemKey={"id"}
                onItemChange={itemChange}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                filterable={showFilter}
                filter={filter}
                filterOperators={filterOperators}
                onPageChange={pageChange}
                onFilterChange={filterChange}
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
                        <i className="fa-solid fa-arrow-down-wide-short" />
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
                            <i className="fa fa-search" />
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                </GridToolbar>
                <GridColumn
                  field="description"
                  title="Leave Type"
                  cell={textCell}
                />

                <GridColumn
                  field="allowEmployeeSelect"
                  title="Allow Employee Select"
                  width="300px"
                  cell={CheckBoxCell}
                  filterCell={DropdownFilterCel}
                />
                <GridColumn
                  field="isReasonRequired"
                  title="Require Reason"
                  width="300px"
                  filter="boolean"
                  cell={CheckBoxCell}
                  filterCell={DropdownFilterCel}
                />
                <GridColumn
                  field="isActive"
                  title="Active"
                  width="300px"
                  filter="boolean"
                  cell={CheckBoxCell}
                  filterCell={DropdownFilterCel}
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
                  <GridColumn field="createdBy" title="Created By" />
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
                  <GridColumn field="modifiedBy" title="Modified By" />
                )}
                {checkPrivialgeGroup("SsetupCC", 2) && (
                  <GridColumn
                    filterable={false}
                    cell={(props) => (
                      <MyCommandCell
                        {...props}
                        edit={enterEdit}
                        update={update}
                        cancel={cancel}
                        editField={editField}
                      />
                    )}
                  />
                )}
              </Grid>
            )}
          </div>
        </>
      )}
    </>
  );
}
