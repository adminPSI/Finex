import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { StartingBalanceEndPoints } from "../../EndPoints";
import AddEditStartingBalance from "./modals/AddEditStartingBalance";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { eyedropperIcon } from "@progress/kendo-svg-icons";
import Constants from "../common/Constants";
import {
  ColumnDatePicker,
} from "../form-components";

const StartingBalance = ({ selectedEmployeeId }) => {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };

  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];

  const [sort, setSort] = useState(initialSort);
  const [filter, setFilter] = useState();
  const [showFilter, setshowFilter] = useState(false);
  const [gridData, setGridData] = useState([]);
  const [columnShow, setColumnShow] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [isShowAddEditPopup, setIsShowAddEditPopup] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedRowId, setselectedRowId] = useState(0);
  const offset = useRef({
    left: 0,
    top: 0,
  });
  const [page, setPage] = useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);
  const [pageTotal, setPageTotal] = useState();
  const [bindStartingBalanceGrid, setBindStartingBalanceGrid] = useState(null);

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindStartingBalanceGrid) {
        getStartingBalanceData(
          bindStartingBalanceGrid.startDate,
          bindStartingBalanceGrid.endDate,
          bindStartingBalanceGrid.vacBal,
          bindStartingBalanceGrid.sickBal,
          bindStartingBalanceGrid.personalBalance,
          bindStartingBalanceGrid.compBal,
          bindStartingBalanceGrid.search,
          bindStartingBalanceGrid.cskip,
          bindStartingBalanceGrid.ctake == "All"
            ? 0
            : bindStartingBalanceGrid.ctake,
          bindStartingBalanceGrid.desc,
          bindStartingBalanceGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindStartingBalanceGrid]);

  useEffect(() => {
    if (selectedEmployeeId) {
      getStartingBalanceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId, showInactive]);

  const onInactiveCheckBox = (event) => {
    setShowInactive(!showInactive);
  };

  const getStartingBalanceData = (
    startDate = "",
    endDate = "",
    vacBal = "",
    sickBal = "",
    personalBalance = "",
    compBal = "",
    search = "",
    skip = page.skip,
    take = page.take,
    desc = true,
    sortKey = "date"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        StartingBalanceEndPoints.PreYearStartingBalanceByEmpId +
        `/${selectedEmployeeId}?active=${showInactive}&&startDateFilter=${startDate}&endDateFilter=${endDate}&vacationBalanceFilter=${vacBal}&sickBalanceFilter=${sickBal}&personalBalanceFilter=${personalBalance}&compBalanceFilter=${compBal}&search=${search}&skip=${skip}&sortKey=${sortKey}&desc=${desc}&take=${take}`,
      withCredentials: false,
    })
      .then((response) => {
        setPageTotal(response.data.total);
        if (take == 0) {
          setPage({
            skip: 0,
            take: response.data.total,
          });
        }
        setGridData(response.data.data);
      })
      .catch(() => { });
  };

  const handleShowAddEditStartingBalancePopup = () => {
    setIsShowAddEditPopup(!isShowAddEditPopup);
  };

  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          setselectedRowId(id);
          handleShowAddEditStartingBalancePopup();
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };

  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };

  const CommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleContextMenu}
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

  const filterChange = (event) => {
    var startDate = "";
    var endDate = "";
    var vacBal = "";
    var sickBal = "";
    var personalBalance = "";
    var compBal = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "vacBal") {
          vacBal = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "sickBal") {
          sickBal = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "personalBalance") {
          personalBalance = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "compBal") {
          compBal = event.filter.filters[i].value;
        }

        if (event.filter.filters[i].field == "date") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
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
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          endDate = date;
        }
      }
    }

    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindStartingBalanceGrid({
      ...bindStartingBalanceGrid,
      search: undefined,
      cskip: 0,
      startDate,
      endDate,
      vacBal,
      sickBal,
      personalBalance,
      compBal,
    });
    setFilter(event.filter);
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindStartingBalanceGrid({
        ...bindStartingBalanceGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindStartingBalanceGrid({
        ...bindStartingBalanceGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: gridData.length,
      });
    }
  };

  const handleSearch = (e) => {
    let value = e.target.value;
    setPage({
      ...page,
      skip: 0,
    });
    setBindStartingBalanceGrid({
      ...bindStartingBalanceGrid,
      search: value,
      cskip: 0,
      startDate: undefined,
      endDate: undefined,
      vacBal: undefined,
      sickBal: undefined,
      personalBalance: undefined,
      compBal: undefined,
    });
  };

  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";

    setSort(event.sort);
    setBindStartingBalanceGrid({
      ...bindStartingBalanceGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  return (
    <>
      <div className="mb-3">
        <Button
          className="me-1 py-2 d-flex ms-auto mb-2"
          onClick={() => {
            handleShowAddEditStartingBalancePopup();
            setselectedRowId(0);
          }}
        >
          Add Starting Balance
        </Button>
        <div className="d-flex gap-2 flex-wrap justify-content-end">
          <Button className="me-1 py-2" themeColor={"primary"}>
            Calculate Vaca/Sick/Personal Starting Balance
          </Button>
        </div>
      </div>

      <Grid
        resizable={true}
        data={gridData}
        filterable={showFilter}
        pageable={{
          buttonCount: 4,
          pageSizes: [10, 15, "All"],
        }}
        skip={page.skip}
        take={page.take}
        total={pageTotal}
        onPageChange={pageChange}
        filter={filter}
        onFilterChange={filterChange}
        sortable={true}
        sort={sort}
        onSortChange={(e) => {
          onSortChange(e);
        }}
      >
        <GridToolbar>
          <div className="row col-sm-12 d-flex justify-content-between">
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
              <div className="col-sm-6 gap-5 d-flex align-items-end justify-content-end">
                <Checkbox
                  type="checkbox"
                  name="showInactive"
                  defaultChecked={showInactive}
                  value={showInactive}
                  onChange={onInactiveCheckBox}
                  label={"Show Inactive"}
                />

                <Checkbox
                  type="checkbox"
                  name="modifiedBy"
                  defaultChecked={columnShow}
                  onChange={onCheckBox}
                  label={"Modified Info"}
                />
              </div>
              <div className="input-group">
                <Input
                  className="form-control border-end-0 border ms-2"
                  onChange={handleSearch}
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
          field="date"
          title="Start Date"
          editor="date"
          format="{0:MM/dd/yyyy}"
          filterCell={ColumnDatePicker}
          cell={(props) => {
            if (props && props.dataItem && props.dataItem.date) {
              const [year, month, day] = props.dataItem.date
                ?.split("T")[0]
                ?.split("-");
              return <td>{`${month}/${day}/${year}`}</td>;
            }
            return <td></td>;
          }}
        />

        <GridColumn
          field="endDate"
          title="End Date"
          editor="date"
          format="{0:MM/dd/yyyy}"
          filterCell={ColumnDatePicker}
          cell={(props) => {
            if (props && props.dataItem && props.dataItem.endDate) {
              const [year, month, day] = props.dataItem.endDate
                ?.split("T")[0]
                ?.split("-");
              return <td>{`${month}/${day}/${year}`}</td>;
            }
            return <td></td>;
          }}
        />

        <GridColumn
          field="vacBal"
          title="Vacation Balance"
          cell={(props) => {
            const vacBal = props.dataItem.vacBal;
            const amount = Number.isInteger(vacBal)
              ? vacBal
              : parseFloat(vacBal.toFixed(4));
            return <td>{amount}</td>;
          }}
        />

        <GridColumn
          field="sickBal"
          title="Sick Balance"
          cell={(props) => {
            const sickBal = props.dataItem.sickBal;
            const amount = Number.isInteger(sickBal)
              ? sickBal
              : parseFloat(sickBal.toFixed(4));
            return <td>{amount}</td>;
          }}
        />

        <GridColumn
          field="personalBalance"
          title="Personal Balance"
          cell={(props) => {
            const personalBalance = props.dataItem.personalBalance;
            const amount = Number.isInteger(personalBalance)
              ? personalBalance
              : parseFloat(personalBalance.toFixed(4));
            return <td>{amount}</td>;
          }}
        />
        <GridColumn
          field="compBal"
          title="Comp Balance"
          cell={(props) => {
            const compBal = props.dataItem.compBal;
            const amount = Number.isInteger(compBal)
              ? compBal
              : parseFloat(compBal.toFixed(4));
            return <td>{amount}</td>;
          }}
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
        {columnShow && <GridColumn field="createdBy" title="Created By" />}
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
        {columnShow && <GridColumn field="modifiedBy" title="Modified By" />}
        <GridColumn cell={CommandCell} filterable={false} />
      </Grid>
      <ContextMenu
        show={show}
        offset={offset.current}
        onSelect={handleOnSelect}
        onClose={handleCloseMenu}
      >
        <MenuItem
          text="Edit Starting Balance"
          data={{
            action: "edit",
          }}
          svgIcon={eyedropperIcon}
        />
      </ContextMenu>

      {isShowAddEditPopup && (
        <AddEditStartingBalance
          handleShowAddEditStartingBalancePopup={
            handleShowAddEditStartingBalancePopup
          }
          startingBalancedata={gridData}
          selectedEmployeeId={selectedEmployeeId}
          selectedRowId={selectedRowId}
          getStartingBalanceData={getStartingBalanceData}
        />
      )}
    </>
  );
};

export default StartingBalance;
