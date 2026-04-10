import { useEffect, useRef, useState } from "react";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import supervisor from "../../json/supervisor.json";
import { process } from "@progress/kendo-data-query";
import { Input, Checkbox } from "@progress/kendo-react-inputs";
import DeleteModal from "../modal/DeleteModal";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { CheckBoxCell } from "../cells/CheckBoxCell";
import { AuthenticationEndPoints, SupervisorEndPoints } from "../../EndPoints";
import { useTimecardContext } from "../../contexts/timecardContext";
import { Button } from "@progress/kendo-react-buttons";
import axiosInstance from "../../core/HttpInterceptor";
import Constants from "../common/Constants";
import { DropdownFilterCell } from "../common/Filter/DropdownFilterCell";

const checkBoxes = ["True", "False"];

const DropdownFilterCel = (props) => (
  <DropdownFilterCell {...props} data={checkBoxes} defaultItem={"select"} />
);

export default function SupervisorSetup(props) {
  const initialSort = [
    {
      field: "supervisor.firstName",
      dir: "asc",
    },
  ];

  const [sort, setSort] = useState(initialSort);

  const { isFormSubmitted, formType, handleFormOpen, resetFormSubmit } =
    useTimecardContext();
  useEffect(() => {
    if (isFormSubmitted && formType == "supervisorSubSchedule") {
      BindDataGrid();
      resetFormSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormSubmitted]);

  useEffect(() => {
    handlePrivilegeByGroup();
  }, []);

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);
  const handlePrivilegeByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=HRSetup`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => { });
  };

  const checkPrivilegeGroup = (resourceName, privilegeId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourceName &&
        item.privileges_id == privilegeId
    );
  };
  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };
  const deleteSupervisor = () => {
    axiosInstance({
      method: "delete",
      url:
        SupervisorEndPoints.SupervisorSubSchedule +
        "/" +
        selectedRowId.supervisorSubScheduleId,
      withCredentials: false,
    })
      .then((response) => {
        BindDataGrid();
        toggleDialog();
      })
      .catch(() => { });
  };

  const [dataResult, setDataResult] = useState([]);
  const dataStateChange = (event) => {
    setDataResult(process(supervisor, event.dataState));
  };
  const expandChange = (event) => {
    const isExpanded =
      event.dataItem.expanded == undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;
    setDataResult({
      ...dataResult,
      data: [...dataResult.data],
    });
  };

  const toggleSupervisorModal = (supervisor) => {
    props.toggleDialog(1);
    let newSupervisor = Object.assign({}, supervisor);
    if (newSupervisor.supervisor !== null) {
      newSupervisor.supervisor.fullName =
        newSupervisor.supervisor.displayName;
    }
    newSupervisor.supId = newSupervisor.supervisor;
    if (newSupervisor.subSupervisor !== null) {
      newSupervisor.subSupervisor.fullName =
        newSupervisor.subSupervisor.displayName;
    }
    newSupervisor.supSubId = newSupervisor.subSupervisor;
    newSupervisor.startDate = new Date(newSupervisor.startDate);
    newSupervisor.endDate = new Date(newSupervisor.endDate);
    handleFormOpen({
      formType: "supervisorEmployee",
      formMethod: "put",
      formData: newSupervisor,
    });
  };

  const [columnShow, setColumnShow] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(0);
  const [show, setShow] = useState(false);
  const offset = useRef({
    left: 0,
    top: 0,
  });
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

  const handleContextMenu = (e, data) => {
    e.preventDefault();
    setSelectedRowId(data);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize || 10,
  };
  const ContextMenuCloseMenu = () => {
    setShow(false);
    setSelectedRowId({});
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const ContextMenuOnSelect = (e) => {
    let id = +selectedRowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          setShow(false);
          toggleSupervisorModal(selectedRowId);
          break;
        case "delete":
          setShow(false);
          toggleDialog();
          break;
        default:
          break;
      }
    }
  };

  const [filter, setFilter] = useState();
  const [showFilter, setShowFilter] = useState(false);
  const [pageSizeValue, setPageSizeValue] = useState();
  const [page, setPage] = useState(initialDataState);
  const [pageTotal, setPageTotal] = useState();

  const MoreFilter = () => {
    setShowFilter(!showFilter);
  };
  const filterData = (e) => {
    let value = e.target.value;
    setPage({
      skip: 0,
      take: 10,
    });
    setBindDataGrid({
      ...bindDataGrid,
      search: value,
      skip: 0,
      take: 10,
    });
  };

  useEffect(() => {
    BindDataGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        cTake: 0,
      });
      setPage({
        skip: 0,
        take: dataResult.length || 10,
      });
    }
  };

  const [bindDataGrid, setBindDataGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.supervisor,
          bindDataGrid.subSupervisor,
          bindDataGrid.startDate,
          bindDataGrid.endDate,
          bindDataGrid.approved,
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
    supervisor = "",
    subSupervisor = "",
    startDate = "",
    endDate = "",
    approved = "",
    search = "",
    cSkip = page.skip,
    cTake = page.take,
    desc = "false",
    sortKey = "supervisor.firstName"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        SupervisorEndPoints.SupervisorSubSchedule +
        "?supervisor=" +
        supervisor +
        "&&subSupervisor=" +
        subSupervisor +
        "&&startDate=" +
        startDate +
        "&&endDate=" +
        endDate +
        "&&approved=" +
        approved +
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
        setDataResult(data);
        setPageTotal(response.data.length);
      })
      .catch(() => { });
  };

  const filterChange = (event) => {
    var supervisor = "";
    var subSupervisor = "";
    var startDate = "";
    var endDate = "";
    var approved = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "supervisor.firstName") {
          supervisor = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "supSubId") {
          subSupervisor = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "startDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 10
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          startDate = date;
        }
        if (event.filter.filters[i].field == "endDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 10
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          endDate = date;
        }
        if (event.filter.filters[i].field == "isApproved") {
          approved =
            event.filter.filters[i].value == "True" ? "true" : "false";
        }
      }
    }
    setPage({
      skip: 0,
      take: 10,
    });
    setBindDataGrid({
      ...bindDataGrid,
      skip: 0,
      take: page.take,
      supervisor: supervisor,
      subSupervisor: subSupervisor,
      startDate: startDate,
      endDate: endDate,
      approved: approved,
    });
    setFilter(event.filter);
  };

  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindDataGrid({
      ...bindDataGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  return (
    <>
      <>
        <div className="mt-3">
          <Grid
            style={{
              height: "450px",
            }}
            data={dataResult}
            skip={page.skip}
            take={page.take}
            total={pageTotal}
            onDataStateChange={dataStateChange}
            expandField="expanded"
            onExpandChange={expandChange}
            pageable={{
              buttonCount: 4,
              pageSizes: [10, 15, "All"],
              pageSizeValue: pageSizeValue,
            }}
            onPageChange={pageChange}
            filterable={showFilter}
            filter={filter}
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
              field="supervisor.firstName"
              title="Supervisor"
              width="200px"
              cell={(props) => {
                let supervisor = props.dataItem.supervisor
                  ? props.dataItem.supervisor.displayName
                  : "";
                return <td>{supervisor}</td>;
              }}
            />
            <GridColumn
              field="supSubId"
              title="Supervisor Substitute"
              width="200px"
              cell={(props) => {
                let subSupervisor = props.dataItem.subSupervisor
                  ? props.dataItem.subSupervisor.displayName
                  : "";
                return <td>{subSupervisor}</td>;
              }}
            />
            <GridColumn
              field="startDate"
              title="Start Date"
              filter="date"
              cell={(props) => {
                const [year, month, day] = props.dataItem.startDate
                  .split("T")[0]
                  .split("-");
                return <td>{`${month}/${day}/${year}`}</td>;
              }}
              editor="date"
              format="{0:d}"
              k-format="MM/DD/yyyy"
            />
            <GridColumn
              field="endDate"
              title="End Date"
              filter="date"
              cell={(props) => {
                const [year, month, day] = props.dataItem.endDate
                  .split("T")[0]
                  .split("-");
                return <td>{`${month}/${day}/${year}`}</td>;
              }}
              editor="date"
              format="{0:d}"
              k-format="MM/DD/yyyy"
            />
            <GridColumn
              field="isApproved"
              title="Approved"
              filter="boolean"
              filterCell={DropdownFilterCel}
              cell={CheckBoxCell}
              sortable={false}
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
            {checkPrivilegeGroup("SsetupCC", 2) && (
              <GridColumn cell={GridCommandCell} filterable={false} />
            )}
          </Grid>
          <ContextMenu
            show={show}
            offset={offset.current}
            onSelect={ContextMenuOnSelect}
            onClose={ContextMenuCloseMenu}
          >
            <MenuItem
              text="Edit Record"
              data={{
                action: "edit",
              }}
              icon="edit"
            />
            <MenuItem
              text="Delete Record"
              data={{
                action: "delete",
              }}
              icon="delete"
            />
          </ContextMenu>
          {visible && (
            <DeleteModal
              toggleDialog={toggleDialog}
              title={"supervisor"}
              name={"Supervisor"}
              deleteSubmit={deleteSupervisor}
            />
          )}
        </div>
      </>
    </>
  );
}
