import { getter } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import {
  Grid,
  GridColumn,
  GridToolbar,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountReceivable } from "../../../EndPoints";
import axiosInstance from "../../../core/HttpInterceptor";
import usePrivilege from "../../../helper/usePrivilege";
import Constants from "../../common/Constants";
export default function Receivable() {
  const navigate = useNavigate();
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [ReceivableFilter, setReceivableFilter] = React.useState("Select Year");
  const [ReceivableshowFilter, setReceivableshowFilter] = React.useState(false);
  const [ReceivableShow, setReceivableShow] = React.useState(false);
  const [selectedReceivableRowId, setselectedReceivableRowId] =
    React.useState(0);
  const ReceivableOffset = React.useRef({
    left: 0,
    top: 0,
  });
  const [AccountReceivabledata, setAccountReceivabledata] = useState([]);
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageTotal, setPageTotal] = React.useState();
  const [filter, setFilter] = React.useState();
  const [, setsearchText] = React.useState("");
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [columnShow, setColumnShow] = useState(false);

  const initialSort = [
    {
      field: "modifiedDate",
      dir: "asc",
    },
  ];

  const [sort, setSort] = useState(initialSort);

  React.useEffect(() => {
    setReceivableFilter(years[1]);
  }, []);

  React.useEffect(() => {
    BindAccountReceivableGrid();
  }, [ReceivableFilter]);

  

  // Sorting changes
  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setSort(event.sort);
    setAccountReceivableGrid({
      ...bindRevenueGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindRevenueGrid, setAccountReceivableGrid] = useState(null);

  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (bindRevenueGrid) {
        BindAccountReceivableGrid(
          bindRevenueGrid.invoiceNo,
          bindRevenueGrid.revenueContrip,
          bindRevenueGrid.arDate,
          bindRevenueGrid.amount,
          bindRevenueGrid.balance,
          bindRevenueGrid.search,
          bindRevenueGrid.cskip,
          bindRevenueGrid.ctake,
          bindRevenueGrid.desc,
          bindRevenueGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindRevenueGrid]);

  const BindAccountReceivableGrid = (
    invoiceNo = "",
    revenueContrip = "",
    arDate = "",
    amount = "",
    balance = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        AccountReceivable.getAccountReceivableFilter +
        `?invoiceNo=${invoiceNo}&revenueContrip=${revenueContrip}&arDate=${arDate}&amount=${amount}&balance=${balance}&search=${search}&skip=${cskip}&take=${ctake}&desc=${desc}&sortKey=${sortKey}&year=${ReceivableFilter}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPageTotal(response.data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: response.data.data.length,
          });
        }
        setAccountReceivabledata(data.data);
      })
      .catch(() => { });
  };

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const ReceivableMoreFilter = () => {
    setReceivableshowFilter(!ReceivableshowFilter);
  };

  const ReceivableFilterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({ ...page, skip: 0 });
    setAccountReceivableGrid({
      ...bindRevenueGrid,
      invoiceNo: undefined,
      revenueContrip: undefined,
      arDate: undefined,
      amount: undefined,
      balance: undefined,
      search: value,
      cskip: 0,
    });
  };

  const ReceivableFilterChange = (event) => {
    var invoiceNo = "";
    var revenueContrip = "";
    var arDate = "";
    var amount = "";
    var balance = "";
    let status = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "invoiceNo") {
          invoiceNo = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "countyRevenueContrib.name") {
          revenueContrip = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "arDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          arDate = date;
        }
        if (event.filter.filters[i].field == "amount") {
          amount = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "balance") {
          balance = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "statusMessage") {
          status = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setAccountReceivableGrid({
      ...bindRevenueGrid,
      invoiceNo: invoiceNo,
      revenueContrip: revenueContrip,
      arDate: arDate,
      amount: amount,
      balance: balance,
      cskip: 0,
    });
    setFilter(event.filter);
  };

  const ReceivablePageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setAccountReceivableGrid({
        ...bindRevenueGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setAccountReceivableGrid({
        ...bindRevenueGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: AccountReceivabledata.length,
      });
    }
  };

  const ReceivableGridCommandCell = (props) => {
    return (
      <>
        <td className="k-command-cell">
          <Button
            id={props.dataItem.ihpo?.id}
            onClick={(event) =>
              handleReceivableContextMenu(event, props.dataItem)
            }
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
  };

  const handleReceivableContextMenu = (e, data) => {
    e.preventDefault();
    setselectedReceivableRowId(data);
    ReceivableOffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setReceivableShow(true);
  };
  const ReceivableContextMenuCloseMenu = () => {
    setReceivableShow(false);
    setselectedReceivableRowId({});
  };
  const ReceivableContextMenuOnSelect = (e) => {
    let id = selectedReceivableRowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "view":
          navigate("/receivable-form", {
            state: { receivableId: selectedReceivableRowId.id, type: "view" },
          });
          break;
        case "edit":
          navigate("/receivable-form", {
            state: { receivableId: selectedReceivableRowId.id },
          });
          break;
        case "delete":
          openDeleteDialog(id);
          break;
      }
    }
  };

  // Receivable
  const Receivable_DATA_ITEM_KEY = "id";
  const Receivable_SELECTED_FIELD = "selected";
  const idGetter_Receivable = getter(Receivable_DATA_ITEM_KEY);

  const [ReceivableSelectedState, setReceivableSelectedState] = React.useState(
    {}
  );
  const onReceivableSelectionChange = React.useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        ReceivableSelectedState: ReceivableSelectedState,
        dataItemKey: Receivable_DATA_ITEM_KEY,
      });
      if (
        Object.keys(ReceivableSelectedState)[0] !==
        Object.keys(newSelectedState)[0]
      ) {
        setReceivableSelectedState(newSelectedState);
      } else {
        setReceivableSelectedState({});
      }
    },
    [ReceivableSelectedState]
  );
  const openDeleteDialog = (id) => {
    setDeleteVisible(id);
  };
  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };
  const DeleteOnClick = () => {
    axiosInstance({
      method: "delete",
      url: AccountReceivable.AccountReceivable + "/" + deleteVisible,
      withCredentials: false,
    })
      .then((response) => {
        closeDeleteDialog();
        BindAccountReceivableGrid();
        setReceivableShow(false);
      })
      .catch(() => { });
  };

  //Year filter
  const yearOptions = Array.from(
    { length: 
      new Date().getFullYear() - 2010 + 1 },
    (_, i) => 
    new Date().getFullYear() - i
  );
  const years = ["Select Year", ...yearOptions];
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Account Receivable')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("AccountReceivableM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Accounting
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Account Receivable
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Account Receivabledd
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>Account Receivable</h3>
            </div>
            {checkPrivialgeGroup("AddAccountReceivableB", 2) && (
              <div className="col-sm-4 text-end">
                <Button
                  themeColor={"primary"}
                  className="k-button k-button-lg k-rounded-lg"
                  onClick={() => navigate("/receivable-form")}
                >
                  <i className="fa-solid fa-plus"></i> Add AR/ Invoice
                </Button>
              </div>
            )}
          </div>
          {checkPrivialgeGroup("AccountReceivableG", 1) && (
            <div className="row">
              <div className="col-sm-12">
                <div className="mt-3">
                  <fieldset>
                    <Grid
                      resizable={true}
                      data={AccountReceivabledata.map((item) => ({
                        ...item,
                        [Receivable_SELECTED_FIELD]:
                          ReceivableSelectedState[idGetter_Receivable(item)],
                      }))}
                      filterable={ReceivableshowFilter}
                      filter={filter}
                      onFilterChange={ReceivableFilterChange}
                      skip={page.skip}
                      take={page.take}
                      total={pageTotal}
                      pageable={{
                        buttonCount: 4,
                        pageSizes: [10, 15, 50, "All"],
                        pageSizeValue: pageSizeValue,
                      }}
                      onPageChange={ReceivablePageChange}
                      dataItemKey={Receivable_DATA_ITEM_KEY}
                      selectedField={Receivable_SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        drag: false,
                        cell: false,
                        mode: "multiple",
                      }}
                      onSelectionChange={onReceivableSelectionChange}
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
                              onClick={ReceivableMoreFilter}
                            >
                              <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                              &nbsp; More Filter
                            </Button>
                          </div>
                          <div className="col-sm-6 d-flex align-items-center justify-content-center">
                            <div className="col-3">
                              {checkPrivialgeGroup("SMIARCB", 1) && (
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
                            <div className="col-2">
                              <DropDownList
                                data={years}
                                value={ReceivableFilter}
                                onChange={(e) => setReceivableFilter(e.value)}
                              />
                            </div>
                            <div className="input-group">
                              <Input
                                className="form-control border-end-0 border"
                                onChange={ReceivableFilterData}
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
                      <GridColumn field="invoiceNo" title="Invoice" />
                      <GridColumn
                        field="countyRevenueContrib.name"
                        title="Invoice To"
                      />
                      <GridColumn
                        field="arDate"
                        filter="date"
                        title="Date"
                        cell={(props) => {
                          const [year, month, day] = props.dataItem?.arDate
                            ? props.dataItem?.arDate.split("T")[0].split("-")
                            : [null, null, null];
                          return (
                            <td>
                              {props.dataItem?.arDate
                                ? `${month}/${day}/${year}`
                                : null}
                            </td>
                          );
                        }}
                        editor="date"
                      />

                      <GridColumn
                        field="amount"
                        title="Amount"
                        format="{0:c2}"
                        headerClassName="header-right-align"
                        cell={(props) => {
                          var amount = props.dataItem.amount;
                          amount =
                            "$" +
                            amount
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                          return (
                            <td className="!k-text-right">{`${amount}`}</td>
                          );
                        }}
                      />
                      <GridColumn
                        field="balance"
                        title="Balance"
                        format="{0:c2}"
                        headerClassName="header-right-align"
                        cell={(props) => {
                          var amount = props.dataItem?.balance || 0;
                          amount =
                            "$" +
                            amount
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                          return (
                            <td className="!k-text-right">{`${amount}`}</td>
                          );
                        }}
                      />
                      <GridColumn
                        cell={ReceivableGridCommandCell}
                        filterable={false}
                      />
                      {columnShow && (
                        <GridColumn
                          field="createdDate"
                          title="Created Date"
                          cell={(props) => {
                            const [year, month, day] = props.dataItem
                              ?.createdDate
                              ? props.dataItem?.createdDate
                                .split("T")[0]
                                .split("-")
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
                            const [year, month, day] = props.dataItem
                              ?.modifiedDate
                              ? props.dataItem?.modifiedDate
                                .split("T")[0]
                                .split("-")
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
                    </Grid>
                    <ContextMenu
                      show={ReceivableShow}
                      offset={ReceivableOffset.current}
                      onSelect={ReceivableContextMenuOnSelect}
                      onClose={ReceivableContextMenuCloseMenu}
                    >
                      <MenuItem
                        text="View "
                        data={{
                          action: "view",
                        }}
                        icon="post"
                      />
                      {checkPrivialgeGroup("EditAccountReceivableCM", 3) && (
                        <MenuItem
                          text="Edit "
                          data={{
                            action: "edit",
                          }}
                          icon="edit"
                        />
                      )}
                      {checkPrivialgeGroup("DeleteAccountReceivableCM", 4) && (
                        <MenuItem
                          text="Delete "
                          data={{
                            action: "delete",
                          }}
                          icon="delete"
                        />
                      )}
                    </ContextMenu>
                    <br></br>
                  </fieldset>
                </div>
              </div>
            </div>
          )}
          {deleteVisible && (
            <Dialog
              title={<span>Please confirm</span>}
              onClose={closeDeleteDialog}
            >
              <p
                style={{
                  margin: "25px",
                  textAlign: "center",
                }}
              >
                Are you sure you want to Delete?
              </p>
              <DialogActionsBar>
                <Button
                  themeColor={"secondary"}
                  className={"col-12"}
                  onClick={closeDeleteDialog}
                >
                  No
                </Button>
                <Button
                  themeColor={"primary"}
                  className={"col-12"}
                  onClick={DeleteOnClick}
                >
                  Yes
                </Button>
              </DialogActionsBar>
            </Dialog>
          )}
        </>
      )}
    </>
  );
}
