import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
  GridColumn as Column,
  Grid,
  GridToolbar
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  VendorEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";
import AddNewVendor from "../modal/AddNewVendor";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";

const Vendor = () => {
  const [VendorList, setVendorList] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [selectedRowId, setselectedRowId] = React.useState();
  const [show, setShow] = React.useState(false);
  const [showFilter, setshowFilter] = React.useState(false);
  const [filter, setFilter] = React.useState();
  const [searchText, setsearchText] = React.useState("");
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState(10);
  const [pageTotal, setPageTotal] = React.useState();
  const [columnShow, setColumnShow] = useState(false);
  const [showInactive, setshowInactive] = useState(false);

  const editField = "inEdit";
  const [bindVendorGrid, setBindVendorGrid] = useState({});

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindVendorGrid) {
        getVendorList(
          bindVendorGrid.name,
          bindVendorGrid.type,
          bindVendorGrid.accno,
          bindVendorGrid.search,
          bindVendorGrid.skip,
          bindVendorGrid.take == "All" ? 0 : bindVendorGrid.take,
          bindVendorGrid.desc,
          bindVendorGrid.sortKey,
          bindVendorGrid.isActive
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindVendorGrid]);
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
    setBindVendorGrid({
      ...bindVendorGrid,
      search: searchText,
      skip: page.skip,
      take: page.take,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const onInactiveCheckBox = (event) => {
    setshowInactive(!showInactive);
    let iactive = showInactive ? "Y" : "N";
    setBindVendorGrid({
      isActive: iactive,
      skip: 0,
      take: 10,
    });
  };

  const getVendorList = (
    name = "",
    type = "",
    accno = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate",
    isActive = "Y"
  ) => {
    axiosInstance({
      method: "POST",
      url:
        VendorEndPoints.VendorFilter +
        "?isActive=" +
        isActive +
        "&name=" +
        name +
        "&vendorType=" +
        type +
        "&accountNo=" +
        accno +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&desc=" +
        desc +
        "&sortKey=" +
        sortKey,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setPageTotal(response.data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: response.data.total,
          });
        }
        setVendorList(data);
      })
      .catch(() => { });
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

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };
  const toggleVendorFormDialog = () => {
    setShowVendorForm(!showVendorForm);
  };
  const handlevendorDetail = (vendor) => {
    setBindVendorGrid({ ...bindVendorGrid });
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const DeleteOnClick = (e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    if (selectedRowId) {
      axiosInstance({
        method: "DELETE",
        url: VendorEndPoints.DeleteVendor + "/" + selectedRowId,
        withCredentials: false,
      })
        .then((response) => {
          toggleDeleteDialog();
          let name = filter?.filters[0]?.value || "";
          setBindVendorGrid({ ...bindVendorGrid, name: name });
          showSuccessNotification("Vendor deleted successfully");
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    }
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
  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          toggleVendorFormDialog();
          break;

        case "delete":
          toggleDeleteDialog();
          break;
        default:
      }
    }

    setShow(false);
  };
  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  const filterData = (e) => {
    setshowFilter(false);
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindVendorGrid({
      ...bindVendorGrid,
      skip: 0,
      search: value,
      name: undefined,
      type: undefined,
      accno: undefined,
    });
  };
  const filterChange = (event) => {
    var name = "";
    var type = "";
    var accountNo = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "name") {
          name = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "vendorType.value") {
          type = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "accountNo") {
          accountNo = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindVendorGrid({
      ...bindVendorGrid,
      name: name,
      type: type,
      accno: accountNo,
      search: undefined,
      skip: 0,
    });
    setFilter(event.filter);
  };

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindVendorGrid({
        ...bindVendorGrid,
        skip: event.page.skip,
        take: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindVendorGrid({
        ...bindVendorGrid,
        skip: 0,
        take: 0,
      });
      setPage({
        skip: 0,
        take: VendorList.length,
      });
    }
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Vendor-CustomerList')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <>
      {checkPrivialgeGroup("VendorM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Vendor/Customer
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Vendor
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Vendor List
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>Vendor/Customer</h3>
            </div>
            <div className="col-sm-4 text-end">
              {checkPrivialgeGroup("AddVendorB", 2) && (
                <Button
                  style={{
                    margin: "5px",
                  }}
                  themeColor={"primary"}
                  onClick={() => {
                    setselectedRowId();
                    toggleVendorFormDialog();
                  }}
                >
                  <i className="fa-solid fa-plus"></i> Add Vendor/Customer
                </Button>
              )}
            </div>
          </div>
          <br />

          <div>
            {checkPrivialgeGroup("VendorG", 1) && (
              <Grid
                resizable={true}
                filterable={showFilter}
                filter={filter}
                data={VendorList}
                dataItemKey={"id"}
                editField={editField}
                onFilterChange={filterChange}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, 50, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                onPageChange={pageChange}
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
                        {checkPrivialgeGroup("VInactiveCB", 1) && (
                          <Checkbox
                            type="checkbox"
                            id="showInactive"
                            name="showInactive"
                            defaultChecked={showInactive}
                            value={showInactive}
                            onChange={onInactiveCheckBox}
                            label={"Show Inactive"}
                          />
                        )}
                        {checkPrivialgeGroup("VSMICB", 1) && (
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
                <Column field="name" title="Name" />
                <Column field="vendorType.value" title="Type" />
                <Column field="vendorNo" title="Vendor Number" />
                <Column field="accountNo" title="Account Number" />
                {columnShow && (
                  <Column
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
                {columnShow && <Column field="createdBy" title="Created By" />}
                {columnShow && (
                  <Column
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
                  <Column field="modifiedBy" title="Modified By" />
                )}
                {!showInactive && (
                  <Column cell={CommandCell} filterable={false} />
                )}
              </Grid>
            )}
            <ContextMenu
              show={show}
              offset={offset.current}
              onSelect={handleOnSelect}
              onClose={handleCloseMenu}
            >
              {checkPrivialgeGroup("EditVendorCM", 3) && (
                <MenuItem
                  text="Edit Vendor"
                  data={{
                    action: "edit",
                  }}
                  icon="edit"
                />
              )}
              {checkPrivialgeGroup("DeleteVendorCM", 4) && (
                <MenuItem
                  text="Delete Vendor"
                  data={{
                    action: "delete",
                  }}
                  icon="delete"
                />
              )}
            </ContextMenu>
          </div>
          {showVendorForm ? (
            <AddNewVendor
              handleVendorDialogClose={toggleVendorFormDialog}
              vendorId={selectedRowId}
              handlevendorDetail={handlevendorDetail}
            />
          ) : null}

          {deleteVisible && (
            <Dialog
              title={<span>Please confirm</span>}
              onClose={toggleDeleteDialog}
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
                  onClick={toggleDeleteDialog}
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
};

export default Vendor;
