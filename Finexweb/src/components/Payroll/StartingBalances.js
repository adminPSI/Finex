import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import usePrivilege from "../../helper/usePrivilege";

const mockBalancesData = [
  {
    id: 1,

    startDate: "2023-12-29T13:00:00",
    endDate: "2024-12-29T13:00:00",
    vacationBalance: "000",
    sickBalance: "273",
    personalBalance: "000",
    compBalance: "000",
  },
  {
    id: 2,

    startDate: "2023-11-29T13:00:00",
    endDate: "2024-12-29T13:00:00",
    vacationBalance: "000",
    sickBalance: "273",
    personalBalance: "000",
    compBalance: "000",
  },
];

export default function StartingBalances() {
  const navigate = useNavigate();
  const [balancesData, setBalancesData] = useState(mockBalancesData);

  const [pageRateSizeValue, ] = useState();

  const [showDistributionContext, setShowDistributionContext] =
    React.useState(false);

  const [selectedRowId, setSelectedRowId] = React.useState(0);

  const [editID, setEditID] = React.useState(null);

  const [checkedSecond, setCheckedSecond] = useState(true);

  const offset = React.useRef({
    left: 0,
    top: 0,
  });

  const rowClick = (event) => {
    if (editID) {
      setEditID(null);
    } else {
      setEditID(event.dataItem.id);
    }
  };

  const handleCloseDistributionMenu = () => {
    setShowDistributionContext(false);
    setSelectedRowId(0);
  };

  const handleOnSelectDistribution = (e) => {
    let id = selectedRowId;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          navigate("/payroll/add-new-balances", { state: { id, action } });
          break;

        case "delete":
          setBalancesData((prev) => {
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

  const handleDistributionContextMenuOpen = (e) => {
    e.preventDefault();

    setSelectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShowDistributionContext(true);
  };

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

  const addNewBalance = () => {
    navigate("/payroll/add-new-balances");
  };

  const handleCheckBoxSecondClick = () => {
    setCheckedSecond(!checkedSecond);
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Starting Balances
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Your Starting Balances</h1>
        </div>
        <div>
          {checkPrivialgeGroup("Fund Grid", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg"
              themeColor={"primary"}
              onClick={addNewBalance}
            >
              Add New Balance
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

        <Checkbox
          label="Show Modified By"
          checked={checkedSecond}
          onChange={handleCheckBoxSecondClick}
        />
      </div>

      <div className="mt-3">
        <Grid
          sortable={true}
          pageable={{
            buttonCount: 4,
            pageSizes: [10, 15, "All"],
            pageSizeValue: pageRateSizeValue,
          }}
          data={balancesData}
          editField="inEdit"
          onRowClick={rowClick}
        >
          <GridColumn
            field="startDate"
            title="Start Date"
            cell={startDateCell}
          />
          <GridColumn field="endDate" title="End Date" cell={endDateCell} />
          <GridColumn field="vacationBalance" title="Vacation Balance" />
          <GridColumn field="sickBalance" title="Sick Balance" />
          <GridColumn field="personalBalance" title="Personal Balance" />
          <GridColumn field="compBalance" title="Comp Balance" />
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
    </>
  );
}
