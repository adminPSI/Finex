import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTimecardContext } from "../../contexts/timecardContext";
import axiosInstance from "../../core/HttpInterceptor";
import {
  EmplTimecardEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";
import { DropdownFilterCell } from "../common/Filter/DropdownFilterCell";
import DeleteModal from "../modal/DeleteModal";

const DetailComponent = (props) => {
  const dataItem = props.dataItem;
  return (
    <div>
      <div className="d-flex k-justify-content-between">
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Group Number</div>
          <div className="col-3">{dataItem?.groupNumber || ""}</div>
        </div>
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">True Hour</div>
          <div className="col-3">
            {dataItem?.isTrueHourEnabled ? "Yes" : "No"}
          </div>
        </div>
      </div>
      <div className="d-flex k-justify-content-between">
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Supervisor</div>
          <div className="col-3">{dataItem?.isSupervisor ? "Yes" : "No"}</div>
        </div>
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Non-Paid</div>
          <div className="col-3">
            {dataItem?.isNonPaidLunchEnabled ? "Yes" : "No"}
          </div>
        </div>
      </div>
      <div className="d-flex k-justify-content-between">
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Suppress</div>
          <div className="col-3">
            {dataItem?.isTimecardSuppresed ? "Yes" : "No"}
          </div>
        </div>
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Alloted Leave</div>
          <div className="col-3">
            {dataItem?.isAllotedLeaveEnabled ? "Yes" : "No"}
          </div>
        </div>
      </div>
      <div className="d-flex k-justify-content-between">
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Appointing Authority</div>
          <div className="col-3">
            {dataItem?.isAppointingAuthorityEnabled ? "Yes" : "No"}
          </div>
        </div>
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Run Payroll</div>
          <div className="col-3">
            {dataItem?.isRunPayrollEnabled ? "Yes" : "No"}
          </div>
        </div>
      </div>
    </div>
  );
};

const checkBoxes = ["True", "False"];

const DropdownFilterCel = (props) => (
  <DropdownFilterCell {...props} data={checkBoxes} defaultItem={"select"} />
);

export default function EmployeeSetup(props) {
  const { isFormSubmitted, formType, handleFormOpen, resetFormSubmit } =
    useTimecardContext();

  const initialSort = [
    {
      field: "employee.firstName",
      dir: "asc",
    },
  ];

  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    if (isFormSubmitted && formType == "tcEmployee") {
      resetFormSubmit();
      BindDataGrid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormSubmitted]);

  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };

  const [tcEmployeeList, setTCEmployeeList] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState({});
  const [groupList, setGroupList] = useState(["Group Number"]);
  const [supervisorGroupList, setSupervisorGroupList] = useState([
    "Supervisor Group Number",
  ]);
  const [groupNumber, setGroupNumber] = useState();
  const [supervisorGroupNumber, setSupervisorGroupNumber] = useState();
  const [page, setPage] = useState(initialDataState);
  const [columnShow, setColumnShow] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [filterActiveInd, setFilterActiveInd] = useState(false)
  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };

  const toggleEmployeeModal = (currentEmployee) => {
    props.toggleDialog(0);
    currentEmployee.employeeId = currentEmployee.employeeDetails;
    handleFormOpen({
      formType: "tcEmployee",
      formMethod: "put",
      formData: currentEmployee,
    });
  };

  const handleGroupNumber = (event) => {
    if (event.target.value == "Group Number") {
      setGroupNumber();
    } else {
      setGroupNumber(event.target.value);
    }
  };

  const handleMeChange = (event) => {
    setSupervisorGroupNumber(
      isNaN(event.target.value) ? undefined : event.target.value
    );
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const expandChange = (event) => {
    let newData = tcEmployeeList.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setTCEmployeeList(newData);
    event.dataItem.expanded = event.value;
    setTCEmployeeList([...tcEmployeeList]);
  };
  useEffect(() => {
    getGroup();
    getSupervisorGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    BindDataGrid();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supervisorGroupNumber, groupNumber]);

  const [bindDataGrid, setBindDataGrid] = useState({});

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.empName,
          bindDataGrid.isSupervisor,
          bindDataGrid.groupNum,
          bindDataGrid.supervisorNumber,
          bindDataGrid.search,
          bindDataGrid.cSkip,
          bindDataGrid.cTake,
          bindDataGrid.desc,
          bindDataGrid.sortKey,
          bindDataGrid.activeInd
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindDataGrid]);

  const BindDataGrid = (
    empName = "",
    isSupervisor = "",
    groupNum = "",
    supervisorNumber = "",
    search = "",
    cSkip = page.skip,
    cTake = page.take,
    desc = "false",
    sortKey = "employee.lastName",
    activeInd = filterActiveInd
  ) => {
    const activeInds = !activeInd ? "Y" : "N";
    let groupNumValue = groupNumber ? groupNumber : groupNum ? groupNum : "";
    let supervisorGroupNumValue =
      supervisorGroupNumber !== null && supervisorGroupNumber !== undefined
        ? supervisorGroupNumber
        : supervisorNumber
          ? supervisorNumber
          : "";
    axiosInstance({
      method: "GET",
      url:
        EmplTimecardEndPoints.TCEmployee +
        "?employeeName=" +
        empName +
        "&&supervisor=" +
        isSupervisor +
        "&&groupNumber=" +
        groupNumValue +
        "&&supGroupNumber=" +
        supervisorGroupNumValue +
        "&&search=" +
        search +
        "&&skip=" +
        cSkip +
        "&&take=" +
        cTake +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey +
        "&&activeInd=" +
        activeInds,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setTCEmployeeList(data.data);
        setSelectedEmp({});
        setPageTotal(data.total);
      })
      .catch(() => { });
  };

  const filterChange = (event) => {
    var name = "";
    var supervisor = "";
    var groupNum = "";
    var supervisorNumber = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "employee.lastName") {
          name = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "groupNumber") {
          groupNum = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "supervisorGroupNumber") {
          supervisorNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "isSupervisor") {
          supervisor =
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
      empName: name,
      isSupervisor: supervisor,
      groupNum: groupNum,
      supervisorNumber: supervisorNumber,
      search: "",
    });
    setFilter(event.filter);
  };

  const getGroup = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.GroupNumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = ["Group Number", ...response.data];
        setGroupList(data);
      })
      .catch(() => { });
  };

  const getSupervisorGroup = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.SupervisorGroupNumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = ["Supervisor Group Number", ...response.data];
        setSupervisorGroupList(data);
      })
      .catch(() => { });
  };

  const deleteTCEmployee = () => {
    axiosInstance({
      method: "delete",
      url: EmplTimecardEndPoints.TCEmployee + "/" + selectedEmp.id,
      withCredentials: false,
    })
      .then((response) => {
        setBindDataGrid({});
        toggleDeleteDialog();
      })
      .catch(() => { });
  };

  const navigate = useNavigate();

  const handleClick = (employee) => {
    navigate("/timecard/employee-schedule", {
      state: { employeeId: employee.empId },
    });
  };

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

  const ContextMenuCloseMenu = () => {
    setShow(false);
    setSelectedRowId({});
  };
  const ContextMenuOnSelect = (e) => {
    let id = +selectedRowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "timecard":
          setShow(false);
          toggleEmployeeModal(selectedRowId);
          break;
        case "schedule":
          setShow(false);
          handleClick(selectedRowId);
          break;
        default:
          break;
      }
    }
  };

  const [filter, setFilter] = useState();
  const [showFilter, setShowFilter] = useState(false);
  const [pageSizeValue, setPageSizeValue] = useState();

  const [pageTotal, setPageTotal] = useState();

  //Set filter operator for Funds Grid Data
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
      cskip: event.page.skip,
      ctake: take,
    });
  };
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

  const DATA_ITEM_KEY = "id";
  const onSelectionChange = (event) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: {},
      dataItemKey: DATA_ITEM_KEY,
    });

    let newData = tcEmployeeList.map((item) => {
      if (item.id == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
      } else {
        item.expanded = false;
      }
      return item;
    });
    setTCEmployeeList(newData);
  };

  const handleCheckBox = (e) => {
    setFilterActiveInd(!e.value)
    setBindDataGrid({
      ...bindDataGrid,
      activeInd: e.value
    });
  }
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Add Employee to Timecard Module')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("ESetupTab", 1) && (
        <>
          <div className="d-flex relative" style={{ position: "relative" }}>
            {checkPrivialgeGroup("ESTGND", 1) && (
              <DropDownList
                style={{
                  width: "300px",
                }}
                className="app-dropdown me-3"
                data={groupList}
                defaultValue="Group Number"
                onChange={handleGroupNumber}
              />
            )}

            {checkPrivialgeGroup("ESTSD", 1) && (
              <DropDownList
                style={{
                  width: "300px",
                }}
                className="app-dropdown"
                data={supervisorGroupList}
                defaultValue="Supervisor Group Number"
                onChange={handleMeChange}
              />
            )}
          </div>

          <div className="mt-3">
            {checkPrivialgeGroup("ESTG", 1) && (
              <Grid
                data={tcEmployeeList}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                detail={DetailComponent}
                expandField="expanded"
                onExpandChange={expandChange}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                filterable={showFilter}
                filter={filter}
                filterOperators={filterOperators}
                onFilterChange={filterChange}
                onPageChange={pageChange}
                onSelectionChange={onSelectionChange}
                selectable={{
                  enabled: true,
                  drag: false,
                  mode: "multiple",
                  cell: false,
                }}
                dataItemKey={"id"}
                sortable={true}
                sort={sort}
                onSortChange={(e) => {
                  onSortChange(e);
                }}
                scrollable='none'
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
                        {checkPrivialgeGroup("TCSetupSMICB", 1) && (
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
                      <div className="col-3">
                        <Checkbox
                          type="checkbox"
                          id="setInactive"
                          name="setInactive"
                          defaultChecked={filterActiveInd}
                          onChange={handleCheckBox}
                          label={"Show Inactive"}
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
                  field="employee.lastName"
                  title="Employee Name"
                  minResizableWidth={50}
                  cell={(props) => (
                    <td>
                      {props.dataItem.employee.displayName}
                    </td>
                  )}
                />
                <GridColumn
                  field="groupNumber"
                  headerCell={() => {
                    return <span style={{ whiteSpace: "pre-line", textAlign: "center", fontSize: '14px', fontWeight: "bold", color: "#475467", lineHeight: "18px" }}>{"Group\nNumber"}</span>
                  }}
                  title=""
                  minResizableWidth="80px"
                />
                <GridColumn
                  field="supervisorGroupNumber"
                  headerCell={() => {
                    return <span style={{ whiteSpace: "pre-line", textAlign: "center", fontSize: '14px', fontWeight: "bold", color: "#475467", lineHeight: "18px" }}>{"Supervisor\nGroup Number"}</span>
                  }}
                  minResizableWidth="20px"
                />
                <GridColumn
                  field="isSupervisor"
                  title="Supervisor"
                  filter="boolean"
                  filterCell={DropdownFilterCel}
                  cell={(props) => (
                    <td>
                      {props.dataItem?.isSupervisor && (
                        <div
                          style={{
                            background: "#e4e1e191",
                            borderRadius: 50,
                            textAlign: "center",
                            fontSize: "12px",
                            padding: "3px",
                            width: "90px",
                          }}
                        >
                          Supervisor
                        </div>
                      )}
                    </td>
                  )}
                  width="100px"
                />
                <GridColumn
                  field="isPayrollSpecialist"
                  title="Payroll Specialist"
                  filter="boolean"
                  filterCell={DropdownFilterCel}
                  cell={(props) => (
                    <td>
                      {props.dataItem?.isPayrollSpecialist && (
                        <div
                          style={{
                            background: "#e4e1e191",
                            borderRadius: 50,
                            textAlign: "center",
                            fontSize: "12px",
                            padding: "3px",
                            width: "80px",
                          }}
                        >
                          Yes
                        </div>
                      )}
                    </td>
                  )}
                  width="100px"
                />
                <GridColumn
                  field="isTimecardSuppresed"
                  headerCell={() => {
                    return <span style={{ whiteSpace: "pre-line", textAlign: "center", fontSize: '14px', fontWeight: "bold", color: "#475467", lineHeight: "18px" }}>{"Suppress\nTimecard"}</span>
                  }}
                  width="100px"
                  cell={(props) => (
                    <td>

                      {props.dataItem?.isTimecardSuppresed ? "Yes" : "No"}

                    </td>
                  )}
                />
                <GridColumn
                  field="isAppointingAuthorityEnabled"
                  headerCell={() => {
                    return <span style={{ whiteSpace: "pre-line", textAlign: "center", fontSize: '14px', fontWeight: "bold", color: "#475467", lineHeight: "18px" }}>{"2nd Level\nApproval\nRequired"}</span>
                  }}
                  width="100px"
                  cell={(props) => (
                    <td>

                      {props.dataItem?.isAppointingAuthorityEnabled ? "Yes" : "No"}
                    </td>
                  )}
                />
                <GridColumn
                  field="autoPopulatedSchedule"
                  headerCell={() => {
                    return <span style={{ whiteSpace: "pre-line", textAlign: "center", fontSize: '14px', fontWeight: "bold", color: "#475467", lineHeight: "18px" }}>{"Auto\nPopulated\nSchedule"}</span>
                  }}
                  width="100px"
                  cell={(props) => (
                    <td>

                      {props.dataItem?.autoPopulatedSchedule ? "Yes" : "No"}
                    </td>
                  )}
                />
                <GridColumn
                  field="isNonPaidLunchEnabled"
                  headerCell={() => {
                    return <span style={{ whiteSpace: "pre-line", textAlign: "center", fontSize: '14px', fontWeight: "bold", color: "#475467", lineHeight: "18px" }}>{"Has\nnon-paid\nlunch"}</span>
                  }}
                  width="100px"
                  cell={(props) => (
                    <td>
                      {props.dataItem?.isNonPaidLunchEnabled ? "Yes" : "No"}
                    </td>
                  )}
                />
                <GridColumn
                  field="maxLunchTime"
                  headerCell={() => {
                    return <span style={{ whiteSpace: "pre-line", textAlign: "center", fontSize: '14px', fontWeight: "bold", color: "#475467", lineHeight: "18px" }}>{"Max\nLunch\nHrs"}</span>
                  }}
                  width="100px"
                  cell={(props) => (
                    <td>
                      {props.dataItem?.maxLunchTime}
                    </td>
                  )}
                />
                <GridColumn
                  field="isRunPayrollEnabled"
                  headerCell={() => {
                    return <span style={{ whiteSpace: "pre-line", textAlign: "center", fontSize: '14px', fontWeight: "bold", color: "#475467", lineHeight: "18px" }}>{"Run Payroll\nfrom\nTime Card"}</span>
                  }}
                  width="100px"
                  cell={(props) => (
                    <td>
                      {props.dataItem?.isRunPayrollEnabled ? "Yes" : "No"}
                    </td>
                  )}
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
                {checkPrivialgeGroup("EsetupCC", 2) && (
                  <GridColumn cell={GridCommandCell}
                    width="50px"
                    filterable={false} />
                )}
              </Grid>
            )}
            {checkPrivialgeGroup("EsetupCC", 2) && (
              <ContextMenu
                show={show}
                offset={offset.current}
                onSelect={ContextMenuOnSelect}
                onClose={ContextMenuCloseMenu}
              >
                {checkPrivialgeGroup("EditTimecardCM", 3) && (
                  <MenuItem
                    text="Edit Employee"
                    data={{
                      action: "timecard",
                    }}
                    icon="edit"
                  />
                )}
                {checkPrivialgeGroup("EditScheduleCM", 3) && (
                  <MenuItem
                    text="Edit Schedule"
                    data={{
                      action: "schedule",
                    }}
                    icon="edit"
                  />
                )}
              </ContextMenu>
            )}
            {deleteVisible && (
              <DeleteModal
                toggleDialog={toggleDeleteDialog}
                title={"employee"}
                name={"Employee"}
                deleteSubmit={deleteTCEmployee}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
