import { Button } from "@progress/kendo-react-buttons";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import jsonData from "../../json/Timecard";

import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { useNavigate } from "react-router-dom";
import usePrivilege from "../../helper/usePrivilege";

const mockRateData = [
  {
    id: 1,
    name: "Mary Lisa",
    stateDate: "Lorem Ipsum",
    endDate: "09/25/2023",
    salaryInformation: "1200 $",
    more: "More",
  },
];

const mockDateData = [
  {
    id: 1,
    name: "Mary Lisa",
    dateHired: "2023-11-29T13:00:00",
    fullTimeDateHired: "2023-11-29T13:00:00",
    rehireDate: "2023-11-29T13:00:00",
    employeeStep: "2023-11-29T13:00:00",
    lastDayWorked: "2023-11-29T13:00:00",
  },
  {
    id: 2,
    name: "Mar Lisa",
    dateHired: "2023-11-29T13:00:00",
    fullTimeDateHired: "2023-11-29T13:00:00",
    rehireDate: "2023-11-29T13:00:00",
    employeeStep: "2023-11-29T13:00:00",
    lastDayWorked: "2023-11-29T13:00:00",
  },
];

const mockSalariesData = [
  {
    id: 1,
    startDate: "2023-11-29T13:00:00",
    endDate: "2024-12-29T13:00:00",
    jobDescription: "Facilities Manager",
    salary: "$46,786.00",
    payDaySalary: "$1,760.46",
    personalStartDate: "2023-12-29T13:00:00",
    payEndDate: "2024-12-29T13:00:00",
    hourlyRate: "$24,2700",
  },
  {
    id: 2,
    startDate: "2023-11-29T13:00:00",
    endDate: "2024-12-29T13:00:00",
    jobDescription: "Manager",
    salary: "$46,786.00",
    payDaySalary: "$1,760.46",
    personalStartDate: "2023-12-29T13:00:00",
    payEndDate: "2024-12-29T13:00:00",
    hourlyRate: "$24,2700",
  },
];

export default function SignificantRates() {
  const [mockSignificantRate, setMockSignificantRate] =
    React.useState(mockRateData);
  const [mockSignificantDate, setMockSignificantDate] =
    React.useState(mockDateData);
  const [mockSignificantSalaries, setMockSignificantSalaries] =
    React.useState(mockSalariesData);

  const [selected, setSelected] = React.useState(0);

  const [pageRateSizeValue,] = React.useState();
  const [pageDateSizeValue,] = React.useState();
  const [pageSalarySizeValue,] = React.useState();

  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState("Significant Rates");
  const [showRate, setShowRate] = React.useState(false);
  const [showDate, setShowDate] = React.useState(false);
  const [showSalaries, setShowSalaries] = React.useState(false);
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = React.useState(0);

  const handleSelect = (e) => {
    setSelected(e.selected);

    switch (e.selected) {
      case 0:
        setPageTitle("Significant Rates");
        break;
      case 1:
        setPageTitle("Significant Dates");
        break;
      case 2:
        setPageTitle("Your Salaries");
        break;
      default:
        break;
    }
  };
  const myCustomDateCell = (props) => {
    var myDate = props.dataItem.dateHired;
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");

      return <td>{`${month}/${day}/${year}`}</td>;
    } else {
      return <td></td>;
    }
  };
  const startDateCell = (props) => {
    var myDate = props.dataItem.startDate;
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");
      return <td>{`${month}/${day}/${year}`}</td>;
    } else {
      return <td></td>;
    }
  };
  const endDateCell = (props) => {
    var myDate = props.dataItem.endDate;
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");
      return <td>{`${month}/${day}/${year}`}</td>;
    } else {
      return <td></td>;
    }
  };

  const personalDateCell = (props) => {
    var myDate = props.dataItem.personalStartDate;
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");

      return <td>{`${month}/${day}/${year}`}</td>;
    } else {
      return <td></td>;
    }
  };

  const payEndDateCell = (props) => {
    var myDate = props.dataItem.payEndDate;
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");
      return <td>{`${month}/${day}/${year}`}</td>;
    } else {
      return <td></td>;
    }
  };

  const CommandCellRate = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleContextMenuRate}
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </Button>
      </td>
    </>
  );

  const CommandCellDates = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleContextMenuDate}
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </Button>
      </td>
    </>
  );
  const CommandCellSalaries = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleContextMenuSalaries}
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </Button>
      </td>
    </>
  );

  const handleContextMenuRate = (props) => {
    handleContextMenuOpenRate(props);
  };

  const handleContextMenuOpenRate = (e) => {
    e.preventDefault();

    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShowRate(true);
  };

  const handleContextMenuDate = (props) => {
    handleContextMenuOpenDate(props);
  };

  const handleContextMenuOpenDate = (e) => {
    e.preventDefault();

    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShowDate(true);
  };
  const handleContextMenuSalaries = (props) => {
    handleContextMenuOpenSalaries(props);
  };

  const handleContextMenuOpenSalaries = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShowSalaries(true);
  };

  const addRateClickHandler = () => {
    navigate("/payroll/add-significant-rates");
  };

  const addDateClickHandler = () => {
    navigate("/payroll/add-significant-dates");
  };

  const duplicateJobClickHandler = () => {
    navigate("/salaries/add-salary");
  };

  const [dataState, setDataState] = React.useState({
    skip: 0,
    take: 20,
    sort: [
      {
        field: "orderDate",
        dir: "desc",
      },
    ],
  });
  const [dataResult, setDataResult] = React.useState(jsonData);

  useEffect(() => {
    setDataResult(jsonData);
    if (dataResult.length) {
      addRecord();
    }
  }, []);

  const dataStateChange = (event) => {
    setDataState(event.dataState);
  };
  const [editID, setEditID] = React.useState(null);
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

  const handleOnSelectRate = (e) => {
    let id = selectedRowId;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          navigate("/payroll/add-significant-rates", { state: { id, action } });
          break;

        case "delete":
          setMockSignificantRate((prev) => {
            const newCopy = prev.filter((item) => {
              return item.id !== id;
            });
            return newCopy;
          });
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShowRate(false);
  };

  const handleOnSelectDate = (e) => {
    let id = selectedRowId;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          navigate("/payroll/add-significant-dates", { state: { id, action } });
          break;

        case "delete":
          setMockSignificantDate((prev) => {
            const newCopy = prev.filter((item) => {
              return item.id !== id;
            });
            return newCopy;
          });
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShowDate(false);
  };
  const handleOnSelectSalaries = (e) => {
    let id = selectedRowId;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          navigate("/salaries/add-salary", { state: { id, action } });
          break;

        case "delete":
          setMockSignificantSalaries((prev) => {
            const newCopy = prev.filter((item) => {
              return item.id !== id;
            });
            return newCopy;
          });
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShowDate(false);
  };

  const handleCloseMenuRate = () => {
    setShowRate(false);
    setselectedRowId(0);
  };

  const handleCloseMenuDate = () => {
    setShowRate(false);
    setselectedRowId(0);
  };
  const handleCloseMenuSalaries = () => {
    setShowSalaries(false);
    setselectedRowId(0);
  };
  
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Significant Rates
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>{pageTitle}</h1>
        </div>
        <div>
          {selected == 0 && checkPrivialgeGroup("Fund Grid", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg"
              themeColor={"primary"}
              onClick={addRateClickHandler}
            >
              Add Significant Rate
            </Button>
          )}

          {selected == 1 && checkPrivialgeGroup("Fund Grid", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg"
              themeColor={"primary"}
              onClick={addDateClickHandler}
            >
              Add Significant Date
            </Button>
          )}

          {selected == 2 && (
            <div className="d-flex gap-3">
              {checkPrivialgeGroup("Fund Grid", 2) && (
                <Button
                  className="k-button k-button-lg k-rounded-lg"
                  themeColor={"primary"}
                  onClick={duplicateJobClickHandler}
                >
                  Duplicate Job
                </Button>
              )}

              {checkPrivialgeGroup("Fund Grid", 2) && (
                <Button
                  className="k-button k-button-lg k-rounded-lg"
                  themeColor={"primary"}
                  onClick={duplicateJobClickHandler}
                >
                  Duplicate without job title
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="d-flex  k-flex-row k-w-full gap-3 pt-3 pb-3">
        <DropDownList
          style={{ width: "35%" }}
          className="k-input"
          placeholder="Search"
        />
        <Button
          className="k-button k-button-lg k-rounded-lg"
          themeColor={"primary"}
        >
          Search
        </Button>
      </div>

      <TabStrip className="app-tab" selected={selected} onSelect={handleSelect}>
        <TabStripTab title="Significant Rates">
          <div className="mt-3">
            <Grid
              sortable={true}
              data={mockSignificantRate}
              onDataStateChange={dataStateChange}
              editField="inEdit"
              onRowClick={rowClick}
              onItemChange={itemChange}
              pageable={{
                buttonCount: 4,
                pageSizes: [10, 15, "All"],
                pageSizeValue: pageRateSizeValue,
              }}
            >
              <GridColumn field="name" title="Employee's" />
              <GridColumn field="stateDate" title="Significant Rates" />
              <GridColumn field="endDate" title="Significant Dates" />
              <GridColumn
                field="salaryInformation"
                title="Salary Information"
              />
              <GridColumn field="more" title="More" />
              <GridColumn cell={CommandCellRate} />
            </Grid>
            <ContextMenu
              show={showRate}
              offset={offset.current}
              onSelect={handleOnSelectRate}
              onClose={handleCloseMenuRate}
            >
              {checkPrivialgeGroup("Fund Grid", 3) && (
                <MenuItem
                  text="Edit Record"
                  data={{
                    action: "edit",
                  }}
                  icon="edit"
                />
              )}
              {checkPrivialgeGroup("Fund Grid", 3) && (
                <MenuItem
                  text="Delete Record"
                  data={{
                    action: "delete",
                  }}
                  icon="delete"
                />
              )}
            </ContextMenu>
          </div>
        </TabStripTab>
        <TabStripTab title="Significant Dates">
          <div className="mt-3">
            <Grid
              sortable={true}
              pageable={{
                buttonCount: 4,
                pageSizes: [10, 15, "All"],
                pageSizeValue: pageDateSizeValue,
              }}
              data={mockSignificantDate}
              {...dataState}
              onDataStateChange={dataStateChange}
              editField="inEdit"
              onRowClick={rowClick}
              onItemChange={itemChange}
            >
              <GridColumn field="name" title="Employee's" />
              <GridColumn
                field="dateHired"
                title="Date Hired"
                editor="date"
                format="{0:MM/dd/yyyy}"
                cell={myCustomDateCell}
              />
              <GridColumn
                field="fullTimeDateHired"
                title="Full-Time Hire Date"
                editor="date"
                format="{0:MM/dd/yyyy}"
                cell={myCustomDateCell}
              />
              <GridColumn
                field="rehireDate"
                title="Rehire Date"
                editor="date"
                format="{0:MM/dd/yyyy}"
                cell={myCustomDateCell}
              />
              <GridColumn
                field="employeeStep"
                title="Employee Step Date"
                editor="date"
                format="{0:MM/dd/yyyy}"
                cell={myCustomDateCell}
              />
              <GridColumn
                field="lastDayWorked"
                title="Last Day Worked"
                editor="date"
                format="{0:MM/dd/yyyy}"
                cell={myCustomDateCell}
              />
              <GridColumn cell={CommandCellDates} />
            </Grid>
            <ContextMenu
              show={showDate}
              offset={offset.current}
              onSelect={handleOnSelectDate}
              onClose={handleCloseMenuDate}
            >
              {checkPrivialgeGroup("Fund Grid", 3) && (
                <MenuItem
                  text="Edit Record"
                  data={{
                    action: "edit",
                  }}
                  icon="edit"
                />
              )}
              {checkPrivialgeGroup("Fund Grid", 3) && (
                <MenuItem
                  text="Delete Record"
                  data={{
                    action: "delete",
                  }}
                  icon="delete"
                />
              )}
            </ContextMenu>
          </div>
        </TabStripTab>
        <TabStripTab title="Salaries">
          <div className="mt-3">
            <Grid
              sortable={true}
              pageable={{
                buttonCount: 4,
                pageSizes: [10, 15, "All"],
                pageSizeValue: pageSalarySizeValue,
              }}
              data={mockSignificantSalaries}
              {...dataState}
              onDataStateChange={dataStateChange}
              editField="inEdit"
              onRowClick={rowClick}
              onItemChange={itemChange}
            >
              <GridColumn
                field="startDate"
                title="Start Date"
                editor="date"
                format="{0:MM/dd/yyyy}"
                cell={startDateCell}
              />
              <GridColumn field="endDate" title="End Date" cell={endDateCell} />
              <GridColumn field="jobDescription" title="Job Description" />
              <GridColumn field="salary" title="Salary" />
              <GridColumn field="payDaySalary" title="Pay Day Salary" />
              <GridColumn
                field="personalStartDate"
                title="Personal Start Date"
                cell={personalDateCell}
              />
              <GridColumn
                field="payEndDate"
                title="Pay End Date"
                cell={payEndDateCell}
              />
              <GridColumn field="hourlyRate" title="Hourly Rate" />
              <GridColumn cell={CommandCellSalaries} />
            </Grid>
            <ContextMenu
              show={showSalaries}
              offset={offset.current}
              onSelect={handleOnSelectSalaries}
              onClose={handleCloseMenuSalaries}
            >
              {checkPrivialgeGroup("Fund Grid", 3) && (
                <MenuItem
                  text="Edit Record"
                  data={{
                    action: "edit",
                  }}
                  icon="edit"
                />
              )}
              {checkPrivialgeGroup("Fund Grid", 3) && (
                <MenuItem
                  text="Delete Record"
                  data={{
                    action: "delete",
                  }}
                  icon="delete"
                />
              )}
            </ContextMenu>
          </div>
        </TabStripTab>
      </TabStrip>
    </div>
  );
}
