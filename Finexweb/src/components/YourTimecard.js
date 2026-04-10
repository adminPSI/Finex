import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect } from "react";
import jsonData from "../json/yourTimecard";

import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Menu, MenuItem } from "@progress/kendo-react-layout";
import { CheckBoxCell } from "./cells/CheckBoxCell";

const MyPager = (props) => {
  return (
    <div
      className={"k-pager k-pager-md k-grid-pager"}
      style={{
        borderTop: "1px solid",
        borderTopColor: "inherit",
      }}
    >
      <div className="col-6   ">0 days remaining of pay period</div>
      <div className="col-2 k-text-right ">78h total</div>
      <div className="col-2 k-text-right ">week 1:37h</div>
      <div className="col-2 k-text-right pe-5 ">week 2:41h</div>
    </div>
  );
};

export default function YourTimecard() {
  const [selected, setSelected] = React.useState(0);
  const handleSelect = (e) => {
    setSelected(e.selected);
  };

  const [visible, setVisible] = React.useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
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
    setDataResult(process(jsonData, event.dataState));
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
  const closeEdit = (event) => {};

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Timecard
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Timecard
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Your Timecard
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Your Timecard</h1>
        </div>
        <div>
          <Button
            className="k-button k-button-lg k-rounded-lg"
            themeColor={"primary"}
            onClick={toggleDialog}
          >
            Add Time
          </Button>
        </div>
      </div>

      <TabStrip className="app-tab" selected={selected} onSelect={handleSelect}>
        <TabStripTab title="Your Timecard">
          <div className="d-flex  k-justify-content-between">
            <div>
              <DropDownList
                style={{
                  width: "250px",
                }}
                defaultItem="View current Time Period"
                className="app-dropdown me-2"
                data={["2024", "2023"]}
              />

              <Button
                className="k-button k-button-lg k-rounded-lg"
                icon="calendar"
                onClick={toggleDialog}
              >
                Calendar View
              </Button>
            </div>

            <div className="d-flex ">
              <div className="app-search-input">
                <span className="k-icon k-i-search" />
                <Input
                  style={{
                    width: "300px",
                    height: "44px",
                  }}
                  placeholder="Search"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Grid
              resizable={true}
              sortable={true}
              pageable={{
                buttonCount: 0,
                info: true,
                pageSizes: false,
                previousNext: true,
              }}
              data={dataResult.map((item) => ({
                ...item,
                inEdit: item.id == editID,
              }))}
              {...dataState}
              onDataStateChange={dataStateChange}
              editField="inEdit"
              pager={MyPager}
              onRowClick={rowClick}
              onItemChange={itemChange}
            >
              <GridColumn
                field="date"
                title="Date"
                editor="date"
                format="{0:d}"
                k-format="'MM/DD/yyyy'"
              />

              <GridColumn field="stateTime" title="Start Time" width="100px" />
              <GridColumn field="endTime" title="End Time" width="100px" />
              <GridColumn
                field="hourTypes"
                title="Outside your hours?"
                width="150px"
                cell={(props) => <CheckBoxCell {...props} showText="true" />}
              />
              <GridColumn field="hours" title="Hours" width="100px" />
              <GridColumn field="memo" title="Notes" />

              <GridColumn
                width="50px"
                cell={(props) => (
                  <td>
                    {editID == props.id ? (
                      <Button
                        className="k-button k-button-sm k-rounded-sm"
                        themeColor={"primary"}
                        onClick={closeEdit}
                      >
                        save
                      </Button>
                    ) : (
                      <Menu openOnClick={true}>
                        <MenuItem icon="more-horizontal">
                          <MenuItem text="Edit Record" />
                          <MenuItem text="Delete Record" />
                        </MenuItem>
                      </Menu>
                    )}
                  </td>
                )}
              />
            </Grid>
          </div>
        </TabStripTab>
        <TabStripTab title="Request a Leave">
          <div className="d-flex k-w-full  k-justify-content-between">
            <div>
              <DropDownList
                style={{
                  width: "250px",
                }}
                defaultItem="Date Range"
                className="app-dropdown me-2"
                data={["2024", "2023"]}
              />
            </div>

            <div className="d-flex ">
              <div className="app-search-input">
                <span className="k-icon k-i-search" />
                <Input
                  style={{
                    width: "300px",
                    height: "44px",
                  }}
                  placeholder="Search"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Grid
              resizable={true}
              sortable={true}
              data={dataResult.map((item) => ({
                ...item,
                inEdit: item.id == editID,
              }))}
              {...dataState}
              onDataStateChange={dataStateChange}
              editField="inEdit"
              onRowClick={rowClick}
              onItemChange={itemChange}
            >
              <GridColumn
                field="date"
                title="Start Date"
                editor="date"
                format="{0:d}"
                k-format="'MM-DD-yyyy'"
              />

              <GridColumn field="stateTime" title="End Date" />
              <GridColumn field="endTime" title="Employee Date" />
              <GridColumn field="hourTypes" title="Supervisor Date" />
              <GridColumn field="hours" title="Payroll Date" />
              <GridColumn field="memo" title="Employee Approval Date" />
            </Grid>
          </div>
        </TabStripTab>
      </TabStrip>
    </div>
  );
}
