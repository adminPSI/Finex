import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { BatchEndPoints, ConfigurationEndPoints } from "../../../EndPoints";
import { handlePrivilegeByGroup } from "../../../utils/helpers/handlePrivilegeByGroup";
import Constants from "../../common/Constants";
import {
  ColumnDatePicker,
} from "../../form-components";
import CustomBreadScrum from "../../Shared/CustomBreadScrum";
import CustomButton from "../../Shared/CustomButton";
import { CustomDateGridColumn } from "../../Shared/CustomDateGridColumn";
import CustomInput from "../../Shared/CustomInput";
import { AddEditBatchModal } from "../Modal/Batch/AddEditBatchModal";
import { BatchVoucherModal } from "../Modal/Batch/BatchVoucherModal";
import { DeleteBatchConfirmModal } from "../Modal/Batch/DeleteBatchConfirmModal";
import PostBatchConfirmModal from "../Modal/Batch/PostBatchConfirmModal";
import { BatchGridCommandCell } from "./BatchGridCommandCell";
import GridContextMenu from "./GridContextMenu";

const Batch = () => {
  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);
  const [batchGridData, setBatchGridData] = useState([]);
  const [page, setPage] = useState({
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  });
  const [batchTotalPage, setBatchTotalPage] = useState(0);
  const [batchFilter, setBatchFilter] = useState();
  const [batchShowFilter, setBatchShowFilter] = useState(false);
  const [batchPageSizeValue, setBatchPageSizeValue] = useState();
  const [approveBatchDisplay, setApproveBatchDisplay] = useState(false);
  const [rowApprovalDate, setRowApprovalDate] = useState(false);
  const [rowPostedDate, setRowPostedDate] = useState(false);
  const [batchSort, setBatchSort] = useState([
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ]);
  const [batchColumnShow, setBatchColumnShow] = useState(false);
  const batchOffset = useRef({
    left: 0,
    top: 0,
  });
  const [batchShowContextMenu, setBatchShowContextMenu] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [showAddEditBatch, setShowAddEditBatch] = useState(false);
  const [showPostBatch, setShowPostBatch] = useState(false);
  const [showBatchVoucher, setShowBatchVoucher] = useState(false);
  const [addEditBatchData, setAddEditBatchData] = useState();
  const [newBatchData, setNewBatchData] = useState(null);
  const [bindDataGrid, setBindDataGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.id,
          bindDataGrid.writtenDate,
          bindDataGrid.postdate,
          bindDataGrid.printDate,
          bindDataGrid.search,
          bindDataGrid.skip,
          bindDataGrid.take == "All" ? 0 : bindDataGrid.take
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindDataGrid]);

  const BindDataGrid = async (
    id = "",
    writtenDate = "",
    postdate = "",
    printDate = "",
    search = "",
    skip = page.skip,
    take = page.take
  ) => {
    return axiosInstance({
      method: "Get",
      url:
        BatchEndPoints.GetBatch +
        "id=" +
        id +
        "&&writtenDate=" +
        writtenDate +
        "&&postdate=" +
        postdate +
        "&&printDate=" +
        printDate +
        "&&search=" +
        search +
        "&&skip=" +
        skip +
        "&&take=" +
        take,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setBatchGridData(data);
        setBatchTotalPage(data.total);
      })
      .catch(() => { });
  };

  const batchFilterData = (event) => {
    var writtenDate = "",
      postdate = "",
      printDate = "",
      id = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "id") {
          id = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "dateWritten") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          writtenDate = date;
        }
        if (event.filter.filters[i].field == "datePosted") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          postdate = date;
        }
        if (event.filter.filters[i].field == "datePrinted") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          printDate = date;
        }
      }
    }
    setBindDataGrid({
      ...bindDataGrid,
      id,
      writtenDate,
      postdate,
      printDate,
      cSkip: 0,
      cTake: page.take,
    });
    setBatchFilter(event.filter);
  };

  const batchMoreFilter = () => {
    setBatchShowFilter(!batchShowFilter);
  };

  const batchPageChange = (event) => {
    if (event.page.take <= 50) {
      setBatchPageSizeValue(event.page.take);
      setBindDataGrid({
        cSkip: event.page.skip,
        cTake: event.page.take,
      });
    } else {
      setBatchPageSizeValue("All");
      setBindDataGrid({
        cSkip: page.skip,
        cTake: page.take,
        desc: "true",
        sortKey: "modifiedDate",
      });
    }
    setPage({
      ...event.page,
    });
  };

  const onBatchSortChange = (event) => { };

  const onBatchCheckBox = () => {
    setBatchColumnShow(!batchColumnShow);
  };

  const batchSearchData = (e) => {
    let value = e.target.value;
    setBindDataGrid({
      search: value,
    });
  };

  const batchContextMenuOnSelect = (e) => {
    let id = addEditBatchData.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "post":
          setShowPostBatch(true);
          break;
        case "view":
          setShowBatchVoucher(true);
          setBatchShowContextMenu(false);
          break;
        case "edit":
          setShowAddEditBatch(true);
          setBatchShowContextMenu(false);
          break;

        case "delete":
          setDeleteVisible(true);
          setBatchShowContextMenu(false);
          break;

        case "approveBatch":
          ApproveBatchVouchers(id);
          setBatchShowContextMenu(false);
          break;

        default:
          break;
      }
    }
  };

  useEffect(() => {
    handlePrivilegeByGroup({
      query: "Accounts Payable",
      setPrivilegeResourceGroup,
    });
    setBindDataGrid({
      cSkip: page.skip,
      cTake: page.take,
    });
    getConfigForApproveBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPrivilegeGroup = (resourcesKey, privilegeId) => {
    return true;
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilegeId
    );
  };

  const batchContextMenuCloseMenu = () => {
    setBatchShowContextMenu(false);
  };

  const closeDeleteDialog = () => {
    setDeleteVisible(false);
    setAddEditBatchData(null);
  };

  const closeBatch = () => {
    setShowAddEditBatch(false);
    setAddEditBatchData(null);
  };

  const closePostBatch = () => {
    setShowPostBatch(false);
  };

  const closeShowBatchVoucher = () => {
    setShowBatchVoucher(false);
    setAddEditBatchData(null);
  };

  const ApproveBatchVouchers = async (batchId) => {
    return axiosInstance({
      method: "Post",
      url: `${BatchEndPoints.ApproveBatchVouchers}/${batchId}`,
      withCredentials: false,
    })
      .then((response) => {
        setBindDataGrid({ ...bindDataGrid });
        setAddEditBatchData(null);
        setRowApprovalDate(null);
      })
      .catch(() => { });
  };

  const getConfigForApproveBatch = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/59",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setApproveBatchDisplay(value);
      })
      .catch(() => { });
  };

  const breadScrumData = [
    {
      title: "Accounting",
      link: "",
    },
    {
      title: "Account Payable",
      link: "/purchaseorder",
    },
    {
      title: "Batch",
      link: "",
    },
  ];

  const openContextMenu = (data) => {
    setRowPostedDate(data.datePosted)
    setRowApprovalDate(data.approvalDate);
    setAddEditBatchData(data);
  };

  return (
    <>
      {checkPrivilegeGroup("BatchVoucherM", 1) && (
        <>
          <CustomBreadScrum data={breadScrumData} />
          <div className="row">
            <div className="col-sm-12">
              <div className="p-3">
                <div className="row">
                  <div className="col-sm-6">
                    <figure>
                      <h4>Batch </h4>
                    </figure>
                  </div>

                  {checkPrivilegeGroup("AddBatchVoucherB", 2) && (
                    <div className="col-sm-6 text-end">
                      <Button
                        themeColor={"primary"}
                        className="k-button k-button-lg k-rounded-lg"
                        onClick={() => setShowAddEditBatch(true)}
                      >
                        <i className="fa-solid fa-plus"></i> Add Batch
                      </Button>
                    </div>
                  )}
                </div>
                <br></br>
                <div>
                  {checkPrivilegeGroup("BatchVoucherG", 1) && (
                    <Grid
                      resizable={true}
                      data={batchGridData}
                      filterable={batchShowFilter}
                      filter={batchFilter}
                      onFilterChange={batchFilterData}
                      skip={page.skip}
                      take={page.take}
                      total={batchTotalPage}
                      pageable={{
                        buttonCount: 4,
                        pageSizes: [10, 15, 50, "All"],
                        pageSizeValue: batchPageSizeValue,
                      }}
                      onPageChange={batchPageChange}
                      sortable={true}
                      sort={batchSort}
                      onSortChange={(e) => {
                        onBatchSortChange(e);
                      }}
                    >
                      <GridToolbar>
                        <div className="row col-sm-12">
                          <div className="col-sm-6 d-grid gap-3 d-md-block">
                            <CustomButton
                              onClick={batchMoreFilter}
                              text={
                                <>
                                  <i className="fa-solid fa-arrow-down-wide-short"></i>
                                  &nbsp; More Filter
                                </>
                              }
                            />
                          </div>
                          <div className="col-sm-6 d-flex align-items-center justify-content-center">
                            <div className="col-3">
                              {checkPrivilegeGroup("BVSMICB", 1) && (
                                <Checkbox
                                  type="checkbox"
                                  id="modifiedByBatch"
                                  name="modifiedByBatch"
                                  defaultChecked={batchColumnShow}
                                  onChange={onBatchCheckBox}
                                  label={"Modified Info"}
                                />
                              )}
                            </div>
                            <CustomInput
                              onChange={batchSearchData}
                              buttonText={<i className="fa fa-search"></i>}
                            />
                          </div>
                        </div>
                      </GridToolbar>
                      <GridColumn field="id" title="Batch Number" />
                      <GridColumn
                        field="dateWritten"
                        title="Written Date"
                        filterable={true}
                        filter="date"
                        editor="date"
                        format="{0:MM/dd/yyyy}"
                        filterCell={ColumnDatePicker}
                        cell={CustomDateGridColumn}
                      />
                      <GridColumn
                        field="datePrinted"
                        title="Date Printed"
                        filterable={true}
                        filter="date"
                        editor="date"
                        format="{0:MM/dd/yyyy}"
                        filterCell={ColumnDatePicker}
                        cell={CustomDateGridColumn}
                      />
                      <GridColumn
                        field="datePosted"
                        title="Date Posted"
                        filterable={true}
                        filter="date"
                        editor="date"
                        format="{0:MM/dd/yyyy}"
                        filterCell={ColumnDatePicker}
                        cell={CustomDateGridColumn}
                      />
                      <GridColumn
                        field="approvalDate"
                        title="Approval Date"
                        filterable={true}
                        filter="date"
                        editor="date"
                        format="{0:MM/dd/yyyy}"
                        cell={CustomDateGridColumn}
                      />

                      {batchColumnShow && (
                        <GridColumn field="createdBy" title="Created By" />
                      )}
                      {batchColumnShow && (
                        <GridColumn
                          field="modifiedBy"
                          title="Modified By"
                          filterable={false}
                        />
                      )}

                      {batchColumnShow && (
                        <GridColumn
                          field="modifiedDate"
                          title="Modified Date"
                          filterable={false}
                          cell={CustomDateGridColumn}
                        />
                      )}

                      {batchColumnShow && (
                        <GridColumn
                          field="createdDate"
                          title="Created Date"
                          filterable={false}
                          cell={CustomDateGridColumn}
                        />
                      )}

                      <GridColumn
                        cell={(props) => (
                          <BatchGridCommandCell
                            props={props}
                            setAddEditBatchData={openContextMenu}
                            batchOffset={batchOffset}
                            setBatchShowContextMenu={setBatchShowContextMenu}
                          />
                        )}
                        filterable={false}
                      />
                    </Grid>
                  )}
                  <GridContextMenu
                    approveBatchDisplay={approveBatchDisplay}
                    rowApprovalDate={rowApprovalDate}
                    rowPostedDate={rowPostedDate}
                    batchShowContextMenu={batchShowContextMenu}
                    batchOffset={batchOffset}
                    batchContextMenuOnSelect={batchContextMenuOnSelect}
                    batchContextMenuCloseMenu={batchContextMenuCloseMenu}
                    checkPrivilegeGroup={checkPrivilegeGroup}
                  />

                  {deleteVisible && (
                    <DeleteBatchConfirmModal
                      closeDeleteDialog={closeDeleteDialog}
                      addEditBatchData={addEditBatchData}
                      setBindDataGrid={setBindDataGrid}
                      bindDataGrid={bindDataGrid}
                      setAddEditBatchData={setAddEditBatchData}
                    />
                  )}

                  {showPostBatch && (
                    <PostBatchConfirmModal
                      closePostBatch={closePostBatch}
                      addEditBatchData={addEditBatchData}
                      setBindDataGrid={setBindDataGrid}
                    />
                  )}

                  {showAddEditBatch && (
                    <AddEditBatchModal
                      closeBatch={closeBatch}
                      BindDataGrid={BindDataGrid}
                      setShowAddEditBatch={setShowAddEditBatch}
                      addEditBatchData={addEditBatchData}
                      setNewBatchData={setNewBatchData}
                      setShowBatchVoucher={setShowBatchVoucher}
                    />
                  )}

                  {showBatchVoucher && (
                    <BatchVoucherModal
                      closeShowBatchVoucher={closeShowBatchVoucher}
                      addEditBatchData={addEditBatchData}
                      setNewBatchData={setNewBatchData}
                      newBatchData={newBatchData}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Batch;
