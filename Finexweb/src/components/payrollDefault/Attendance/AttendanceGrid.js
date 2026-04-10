import { getter } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import PayrollGridContextMenu from "../payroll/PayrollGridContextMenu";
import { Checkbox } from "@progress/kendo-react-inputs";
const AttendanceGrid = ({
  data,
  bindDataGrid,
  setBindDataGrid,
  setData,
  setSelectedProject,
  selectedProject,
}) => {
  const [employeePopupHistoryVisible, setEmployeePopupHistoryVisible] =
    useState(false);
  const [showFilter, setshowFilter] = useState(false);
  const [filter, setFilter] = useState();

  const initialSort = [
    {
      field: "Employee.lastName",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const [show, setShow] = React.useState(false);
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = React.useState(0);

  const viewEmployeeHistoryPopup = () => {
    setEmployeePopupHistoryVisible(!employeePopupHistoryVisible);
  };

  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };

  useEffect(() => {
    if (selectedProject && selectedProject.id) {
      setSelectedState({ [selectedProject.id]: true });
      setselectedRowId(selectedProject.id);
    }
  }, [selectedProject]);

  const filterChange = (event) => {
    var employeeNumber = "";
    var fullName = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "employeeNumber") {
          employeeNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "Employee.firstName") {
          fullName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "Employee.lastName") {
          fullName = event.filter.filters[i].value;
        }
      }
    }
    setBindDataGrid({
      ...bindDataGrid,
      employeeNumberFilter: employeeNumber,
      fullName,
      skip: 0,
      take: 10,
    });
    setFilter(event.filter);
  };

  const DATA_ITEM_KEY = "id";
  const idGetter = getter(DATA_ITEM_KEY);
  const SELECTED_FIELD = "selected";
  const [selectedState, setSelectedState] = useState({});

  const onSelectionChange = (event) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    let tmpId;
    let newData = data.map((item) => {
      // eslint-disable-next-line eqeqeq
      if (item.id == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
        tmpId = item.id;
        setselectedRowId(tmpId);
        setSelectedProject(item);
      } else {
        item.expanded = false;
      }
      return item;
    });
    if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
      setSelectedState(newSelectedState);
    } else {
      setSelectedState({});
    }
    setData(newData);
  };

  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "Employee.lastName";

    setBindDataGrid({
      ...bindDataGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  //close ContextMenu for fund Grid
  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };

  const handleCheckBox = (e) => {
    setBindDataGrid({
      ...bindDataGrid,
      filterInactiveInd: e.value
    });
  }

  //Event for Select ContextMenu Item of Grid Data
  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "employeeHistory":
          viewEmployeeHistoryPopup();
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };
  return (
    <div>
      <Grid
        filterable={showFilter}
        filter={filter}
        data={data.map((item) => ({
          ...item,
          [SELECTED_FIELD]: selectedState[idGetter(item)],
        }))}
        onFilterChange={filterChange}
        dataItemKey={DATA_ITEM_KEY}
        onSelectionChange={onSelectionChange}
        selectedField={SELECTED_FIELD}
        selectable={{
          enabled: true,
          drag: false,
          mode: "multiple",
          cell: false,
        }}
        sortable={true}
        sort={sort}
        onSortChange={(e) => {
          onSortChange(e);
        }}
        style={{
          maxHeight: "600px",
        }}
      >
        <GridToolbar>
          <div className="row col-sm-12">
            <div className="col-sm-5 d-grid gap-3 d-md-block">
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
            <div className="col-4">
              <Checkbox
                type="checkbox"
                id="setInactive"
                name="setInactive"
                defaultChecked={bindDataGrid.filterInactiveInd}
                onChange={handleCheckBox}
                label={"Show Inactive"}
              />
            </div>
          </div>
        </GridToolbar>

        <GridColumn
          title="Last Name"
          field="Employee.lastName"
          cell={(props) => {
            return <td data-grid-col-index={props.columnIndex}>{props.dataItem.employee.lastName}</td>;
          }}
        />
        <GridColumn
          title="First Name"
          field="Employee.firstName"
          cell={(props) => {
            return <td data-grid-col-index={props.columnIndex}>{props.dataItem.employee.firstName}</td>;
          }}
        />
          <GridColumn field="Employee.employeeNumber" title="Emp No" width={"120px"}
          cell={(props) => {
            return <td data-grid-col-index={props.columnIndex}>{props.dataItem.employee.employeeNumber}</td>;
          }} />
      </Grid>

      <PayrollGridContextMenu
        show={show}
        offset={offset}
        onSelect={handleOnSelect}
        onClose={handleCloseMenu}
      />
    </div>
  );
};

export default AttendanceGrid;
