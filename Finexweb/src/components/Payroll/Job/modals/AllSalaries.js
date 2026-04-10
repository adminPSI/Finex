import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { useRef, useState } from "react";
import usePrivilege from "../../../../helper/usePrivilege";
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

export const AllSalaries = ({
  setSalariesMenuOpen,
  setEditSalariesMenuOpen,
}) => {
  const closeMenuHandler = () => {
    setSalariesMenuOpen(false);
  };

  const [showSalaries, setShowSalaries] = useState(false);

  const [mockSignificantSalaries, setMockSignificantSalaries] =
    useState(mockSalariesData);

  const offset = useRef({
    left: 0,
    top: 0,
  });

  const [editID, setEditID] = useState(null);

  const [dataResult, setDataResult] = useState();

  // eslint-disable-next-line no-unused-vars
  const [pageSalarySizeValue, setPageSalarySizeValue] = useState();

  const [selectedRowId, setselectedRowId] = useState(0);

  const [dataState, setDataState] = useState({
    skip: 0,
    take: 20,
    sort: [
      {
        field: "orderDate",
        dir: "desc",
      },
    ],
  });

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

  const dataStateChange = (event) => {
    // setDataResult(jsonData, event.dataState));
    setDataState(event.dataState);
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

  const payEndDateCell = (props) => {
    var myDate = props.dataItem.payEndDate;
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

  const handleOnSelectSalaries = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          setEditSalariesMenuOpen(true);
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
    setShowSalaries(false);
  };

  const handleCloseMenuSalaries = () => {
    setShowSalaries(false);
    setselectedRowId(0);
  };

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

  const rowClick = (event) => {
    if (editID) {
      setEditID(null);
    } else {
      setEditID(event.dataItem.id);
    }
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <Dialog
      width={900}
      title={
        <i className="fa-solid fa-right-left d-flex justify-content-center">
          All Salaries
        </i>
      }
      onClose={closeMenuHandler}
    >
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
    </Dialog>
  );
};
