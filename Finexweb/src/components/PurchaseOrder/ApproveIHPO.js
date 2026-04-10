import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridToolbar
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import {
  IHPOEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";

export default function ApproveIHPO() {
  const navigate = useNavigate();
  const initialVendorDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };

  const [IHPOshow, setIHPOShow] = React.useState(false);
  const [IHPOtoatlpage, setIHPOTotalpage] = React.useState(0);
  const [IHPOPageSizeValue,] = React.useState();
  const [IHPOGriddata, setIHPOGriddata] = useState([]);
  const [, setPageSizeValue] = React.useState();
  const [IHPOFilter, setIHPOFilter] = React.useState();

  const [IHPOpage, setIHPOpage] = React.useState(initialVendorDataState);
  const [IHPOshowFilter, setIHPOshowFilter] = React.useState(false);
  const [selectedIHPORowId, setselectedIHPORowId] = React.useState(0);
  const [columnShow, setColumnShow] = useState(false);

  const ihpooffset = React.useRef({
    left: 0,
    top: 0,
  });

  const [bindApprovelIHPOGrid, setBindApprovelIHPOGrid] = useState({
    cskip: 0,
    ctake: 10,
  });

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindApprovelIHPOGrid) {
        getIHPO(
          bindApprovelIHPOGrid.ihpoNo,
          bindApprovelIHPOGrid.vendor,
          bindApprovelIHPOGrid.description,
          bindApprovelIHPOGrid.total,
          bindApprovelIHPOGrid.balance,
          bindApprovelIHPOGrid.status,
          bindApprovelIHPOGrid.search,
          bindApprovelIHPOGrid.cskip,
          bindApprovelIHPOGrid.ctake == "All" ? 0 : bindApprovelIHPOGrid.ctake,
          bindApprovelIHPOGrid.desc,
          bindApprovelIHPOGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindApprovelIHPOGrid]);


  const IHPOFilterChange = (event) => {
    var ihpoNo = "";
    var vendor = "";
    var description = "";
    var total = "";
    var balance = "";
    var status = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "reqNumber") {
          ihpoNo = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "ihpoDetails.vendor.name") {
          vendor = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "reqDescription") {
          description = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "ihpoPricing.reqTotal") {
          total = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "ihpoPricing.reqBalance") {
          balance = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "codeValues.value") {
          let statusOption = event.filter.filters[i].value;
          status =
            statusOption == "Approved"
              ? "22"
              : statusOption == "Rejected"
                ? "23"
                : "";
        }
      }
    }
    setIHPOpage({
      skip: 0,
      take: IHPOPageSizeValue,
    });
    setBindApprovelIHPOGrid({
      ...bindApprovelIHPOGrid,
      ihpoNo: ihpoNo,
      vendor: vendor,
      description: description,
      total: total,
      balance: balance,
      status: status,
      cskip: 0,
    });
    setIHPOFilter(event.filter);
  };
  const IHPOFilterOperators = {
    text: [
      {
        text: "grid.filterContainsOperator",
        operator: "contains",
      },
    ],
  };
  const IHPOMoreFilter = () => {
    setIHPOshowFilter(!IHPOshowFilter);
  };
  const onCheckBox = (event) => {
    const field = event.target.name;
    setColumnShow(!columnShow);
  };
  const IHPOPageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindApprovelIHPOGrid({
        ...bindApprovelIHPOGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setIHPOpage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindApprovelIHPOGrid({
        ...bindApprovelIHPOGrid,
        cskip: 0,
        ctake: 0,
      });
      setIHPOpage({
        skip: 0,
        take: IHPOGriddata.length,
      });
    }
  };
  const IHPOFilterData = (e) => {
    let value = e.target.value;
    setIHPOpage({
      ...IHPOpage,
      skip: 0,
    });
    setBindApprovelIHPOGrid({
      ...bindApprovelIHPOGrid,
      search: value,
      cskip: 0,
    });
  };
  const IHPOGridCommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem}
          onClick={(event) => handleihpoContextMenu(event, props.dataItem)}
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
  const handleihpoContextMenu = (e, data) => {
    e.preventDefault();
    setselectedIHPORowId(data);
    ihpooffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setIHPOShow(true);
  };
  const IHPOContextMenuCloseMenu = () => {
    setIHPOShow(false);
    setselectedIHPORowId({});
  };
  const IHPOContextMenuOnSelect = (e) => {
    let id = +selectedIHPORowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          navigate("/requestIHPO", {
            state: {
              ihpoNumber: selectedIHPORowId.reqNumber,
              ihpoId: selectedIHPORowId.id,
              type: "edit",
            },
          });
          break;
        case "delete":
          axiosInstance({
            method: "delete",
            url: IHPOEndPoints.IHPO + "/" + id,
            withCredentials: false,
          })
            .then((response) => {
              setBindApprovelIHPOGrid({ ...bindApprovelIHPOGrid });
              setIHPOShow(false);
              showSuccessNotification("IHPO deleted successfully");
            })
            .catch(() => { });
          break;
        case "review":
          navigate("/reviewIHPO", {
            state: {
              IHPONumber: selectedIHPORowId.reqNumber,
              ihpoId: selectedIHPORowId.id,
            },
          });
          break;
      }
    }
  };

  const initialSort = [
    {
      field: "modifiedDate",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setSort(event.sort);
    setBindApprovelIHPOGrid({
      ...bindApprovelIHPOGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const getIHPO = (
    ihpoNo = "",
    vendor = "",
    description = "",
    total = "",
    balance = "",
    status = "",
    search = "",
    cskip = IHPOpage.skip,
    ctake = IHPOpage.take,
    desc = "true",
    sortKey = "modifiedDate"
  ) => {
    let url = `?ihpoNumber=${ihpoNo}&&vendorname=${vendor}&&description=${description}&&reTotal=${total}&&reBalance=${balance}&&status=${status}&&search=${search}&&skip=${cskip}&&take=${ctake}&&desc=${desc}&&sortKey=${sortKey}&&forApproval=true`;

    axiosInstance({
      method: "GET",
      url: IHPOEndPoints.GetIHPO + url,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setIHPOGriddata(data.data);
        setIHPOTotalpage(data.total);
        if (ctake == 0) {
          setIHPOpage({
            skip: 0,
            take: data.total,
          });
        }
      })
      .catch(() => { });
  };

  const { checkPrivialgeGroup, loading, error } = usePrivilege('Approve IHPOs')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {" "}
      {checkPrivialgeGroup("ApprovelIHPOM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Accounting
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Accounts Payable
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Approve IHPO
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>Approve IHPO</h3>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-sm-8">
              <figure>
                <h4>IHPO</h4>
              </figure>
            </div>
          </div>
          {checkPrivialgeGroup("ApprovelIHPOG", 1) && (
            <div>
              <Grid
                resizable={true}
                data={IHPOGriddata}
                filterable={IHPOshowFilter}
                filter={IHPOFilter}
                filterOperators={IHPOFilterOperators}
                onFilterChange={IHPOFilterChange}
                skip={IHPOpage.skip}
                take={IHPOpage.take}
                total={IHPOtoatlpage}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, 50, "All"],
                  pageSizeValue: IHPOPageSizeValue,
                }}
                onPageChange={IHPOPageChange}
                sortable={true}
                sort={sort}
                onSortChange={(e) => onSortChange(e)}
              >
                <GridToolbar>
                  <div className="row col-sm-12">
                    <div className="col-sm-6 d-grid gap-3 d-md-block">
                      <Button
                        className="buttons-container-button"
                        fillMode="outline"
                        themeColor={"primary"}
                        onClick={IHPOMoreFilter}
                      >
                        <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                        &nbsp; More Filter
                      </Button>
                    </div>
                    <div className="col-sm-6 d-flex align-items-center justify-content-center">
                      <div className="col-3">
                        {checkPrivialgeGroup("AIHPOSMICB", 1) && (
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
                      <div className="input-group">
                        <Input
                          className="form-control border-end-0 border"
                          onChange={IHPOFilterData}
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
                <GridColumn field="reqNumber" title="IHPO" />
                <GridColumn field="ihpoDetails.vendor.name" title="Vendor" />
                <GridColumn field="reqDescription" title="Description" />
                <GridColumn
                  field="ihpoPricing.reqTotal"
                  title="Total"
                  editor="numeric"
                  format="{0:c2}"
                  headerClassName="header-right-align"
                  cell={(props) => {
                    var amount = props.dataItem?.ihpoPricing?.reqTotal || 0;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <GridColumn
                  field="ihpoPricing.reqBalance"
                  title="Balance"
                  editor="numeric"
                  format="{0:c2}"
                  headerClassName="header-right-align"
                  cell={(props) => {
                    var amount = props.dataItem?.ihpoPricing?.reqBalance || 0;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <GridColumn field="statusMessage" title="Status" />
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
                <GridColumn cell={IHPOGridCommandCell} filterable={false} />
              </Grid>
              <ContextMenu
                show={IHPOshow}
                offset={ihpooffset.current}
                onSelect={IHPOContextMenuOnSelect}
                onClose={IHPOContextMenuCloseMenu}
              >
                {checkPrivialgeGroup("EditIHPOCM", 3) && (
                  <MenuItem
                    text="Edit IHPO"
                    data={{
                      action: "edit",
                    }}
                    icon="edit"
                  />
                )}
                {checkPrivialgeGroup("DeleteIHPOCM", 4) && (
                  <MenuItem
                    text="Delete IHPO"
                    data={{
                      action: "delete",
                    }}
                    icon="delete"
                  />
                )}
                {checkPrivialgeGroup("ReviewIHPOCM", 1) && (
                  <MenuItem
                    text="Review IHPO"
                    data={{
                      action: "review",
                    }}
                    icon="edit"
                  />
                )}
              </ContextMenu>
            </div>
          )}
        </>
      )}
    </>
  );
}
