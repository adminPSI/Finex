import React, { useEffect, useState } from "react";

import { Button } from "@progress/kendo-react-buttons";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useNavigate } from "react-router-dom";
import jsonData from "../../json/Timecard";

import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { MenuItem } from "@progress/kendo-react-layout";

import { Checkbox } from "@progress/kendo-react-inputs";

import { ContextMenu } from "@progress/kendo-react-layout";
import usePrivilege from "../../helper/usePrivilege";

const mockDistributionData = [
  {
    id: 1,
    jobDescription: "Dir/Therapy Serv",
    startDate: "2023-11-29T13:00:00",
    endDate: "2024-12-29T13:00:00",
    hourlyRate: "$125.00",
    percentHours: "100.000%",
    countryCode: "080 0100 510000",
    accountCode: "75 01 04",
    houseAccountCode: "30 33 1001 0000",
    supervisor: "Hhontz, Shannon",
  },
  {
    id: 2,
    jobDescription: "Dir/Therapy ",
    startDate: "2023-11-29T13:00:00",
    endDate: "2024-12-29T13:00:00",
    hourlyRate: "$125.00",
    percentHours: "100.000%",
    countryCode: "080 0100 510000",
    accountCode: "75 01 04",
    houseAccountCode: "30 33 1001 0000",
    supervisor: "Hhontz, Shannon",
  },
];

const mockBenefitsDistributionData = [
  {
    id: 1,
    benefits: "Dental Insurance",
    startDate: "2023-11-29T13:00:00",
    endDate: "2024-12-29T13:00:00",
    percent: "1.4000%",
    amount: "$22.74",
    countryExpense: "B50 11A 082 00",
    ihas: "06 15 0001 0014",
  },
  {
    id: 2,
    benefits: "Denal Insurance",
    startDate: "2023-11-29T13:00:00",
    endDate: "2024-12-29T13:00:00",
    percent: "1.4000%",
    amount: "$22.74",
    countryExpense: "B50 11A 082 00",
    ihas: "06 15 0001 0014",
  },
];

export default function YourBenefits() {
  const navigate = useNavigate();

  const [mockDistribution, setMockDistribution] =
    useState(mockDistributionData);
  const [mockDistributionBenefits, setMockDistributionBenefits] = useState(
    mockBenefitsDistributionData
  );

  const [selected, setSelected] = React.useState(0);
  const [selectedRowId, setSelectedRowId] = React.useState(0);
  const [pageTitle, setPageTitle] = useState("Your Benefits");

  const [searchInputValue, ] = useState();
  const [, setSearchValue] = useState("");

  const [showDistributionContext, setShowDistributionContext] =
    React.useState(false);
  const [showDistributionBenefitsContext, setShowDistributionBenefitsContext] =
    React.useState(false);

  const [pageRateSizeValue, ] = React.useState();

  const [checked, setChecked] = useState(true);
  const [checkedSecond, setCheckedSecond] = useState(true);

  const handleCheckBoxClick = () => {
    setChecked(!checked);
  };

  const handleCheckBoxSecondClick = () => {
    setCheckedSecond(!checkedSecond);
  };

  const offset = React.useRef({
    left: 0,
    top: 0,
  });

  const handleSelect = (e) => {
    setSelected(e.selected);
    switch (e.selected) {
      case 0:
        setPageTitle("Your Benefits");
        break;
      case 1:
        setPageTitle("Your Benefits Distribution");
        break;
      default:
        return;
    }
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

  useEffect(() => {
    if (searchInputValue?.length == 0) {
      setSearchValue("");
    }
  }, [searchInputValue]);

  const CommandCellDistribution = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleDistributionContextMenuOpen}
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
  const CommandCellBenefitsDistribution = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleDistributionBenefitsContextMenuOpen}
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

  const handleDistributionContextMenuOpen = (e) => {
    e.preventDefault();

    setSelectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShowDistributionContext(true);
  };
  const handleDistributionBenefitsContextMenuOpen = (e) => {
    e.preventDefault();

    setSelectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShowDistributionBenefitsContext(true);
  };

  const handleOnSelectDistribution = (e) => {
    let id = selectedRowId;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          navigate("/payroll/add-pay-distribution", { state: { id, action } });
          break;

        case "delete":
          setMockDistribution((prev) => {
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
    setShowDistributionContext(false);
  };
  const handleOnSelectDistributionBenefits = (e) => {
    let id = selectedRowId;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          navigate("/payroll/add-benefits-distribution", {
            state: { id, action },
          });
          break;

        case "delete":
          setMockDistributionBenefits((prev) => {
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
    setShowDistributionBenefitsContext(false);
  };

  const handleCloseDistributionMenu = () => {
    setShowDistributionContext(false);
    setSelectedRowId(0);
  };

  const handleCloseDistributionBenefitsMenu = () => {
    setShowDistributionBenefitsContext(false);
    setSelectedRowId(0);
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

  const addPayDistributionClickHandler = () => {
    navigate("/payroll/add-pay-distribution");
  };

  const addBenefitsDistributionClickHandler = () => {
    navigate("/payroll/add-benefits-distribution");
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
            Benefits
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
              onClick={addPayDistributionClickHandler}
            >
              Add New Pay Distribution
            </Button>
          )}

          {selected == 1 && checkPrivialgeGroup("Fund Grid", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg"
              themeColor={"primary"}
              onClick={addBenefitsDistributionClickHandler}
            >
              Add Benefits Distribution
            </Button>
          )}
        </div>
      </div>
      <div className="d-flex k-flex-row k-align-items-center">
        <div className="d-flex  k-flex-row k-w-full gap-3 pt-3 pb-3">
          <DropDownList
            style={{ width: "30vw" }}
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
        <div className="d-flex  k-flex-row gap-2 pe-5">
          {selected == 0 && (
            <>
              <Checkbox
                label="Show Current Benefits Only"
                checked={checked}
                onChange={handleCheckBoxClick}
              />
            </>
          )}

          {selected == 1 && (
            <>
              <Checkbox
                label="Show Current Benefits Only"
                checked={checked}
                onChange={handleCheckBoxClick}
              />

              <Checkbox
                label="Show Modified By"
                checked={checkedSecond}
                onChange={handleCheckBoxSecondClick}
              />
            </>
          )}
        </div>
      </div>
      <TabStrip className="app-tab" selected={selected} onSelect={handleSelect}>
        <TabStripTab title="Pay Distribution">
          <div className="mt-3">
            <Grid
              sortable={true}
              pageable={{
                buttonCount: 4,
                pageSizes: [10, 15, "All"],
                pageSizeValue: pageRateSizeValue,
              }}
              data={mockDistribution}
              {...dataState}
              onDataStateChange={dataStateChange}
              editField="inEdit"
              onRowClick={rowClick}
              onItemChange={itemChange}
            >
              <GridColumn field="jobDescription" title="Job Description" />
              <GridColumn
                field="startDate"
                title="Start Date"
                cell={startDateCell}
              />
              <GridColumn field="endDate" title="End Date" cell={endDateCell} />
              <GridColumn field="hourlyRate" title="Rate" />
              <GridColumn field="percentHours" title="Percent" />
              <GridColumn field="countryCode" title="Country Code" />
              <GridColumn field="accountCode" title="SAC" />
              <GridColumn field="houseAccountCode" title="IHAC" />
              <GridColumn field="supervisor" title="Supervisor" />
              <GridColumn cell={CommandCellDistribution} />
            </Grid>

            <ContextMenu
              show={showDistributionContext}
              offset={offset.current}
              onSelect={handleOnSelectDistribution}
              onClose={handleCloseDistributionMenu}
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
        <TabStripTab title="Benefits Distribution">
          <div className="mt-3">
            <Grid
              sortable={true}
              pageable={{
                buttonCount: 4,
                pageSizes: [10, 15, "All"],
                pageSizeValue: pageRateSizeValue,
              }}
              data={mockDistributionBenefits}
              {...dataState}
              onDataStateChange={dataStateChange}
              editField="inEdit"
              onRowClick={rowClick}
              onItemChange={itemChange}
            >
              <GridColumn field="benefits" title="Benefits" />
              <GridColumn
                field="startDate"
                title="Start Date"
                cell={startDateCell}
              />
              <GridColumn field="endDate" title="End Date" cell={endDateCell} />
              <GridColumn field="percent" title="Percent" />
              <GridColumn field="amount" title="Amount" />
              <GridColumn field="countryExpense" title="Country Expense" />
              <GridColumn field="ihas" title="IHAC" />
              <GridColumn cell={CommandCellBenefitsDistribution} />
            </Grid>

            <ContextMenu
              show={showDistributionBenefitsContext}
              offset={offset.current}
              onSelect={handleOnSelectDistributionBenefits}
              onClose={handleCloseDistributionBenefitsMenu}
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
