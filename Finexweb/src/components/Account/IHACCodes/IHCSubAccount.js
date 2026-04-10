import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  GridColumn as Column,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import {
  ContextMenu,
  MenuItem
} from "@progress/kendo-react-layout";
import {
  eyeSlashIcon,
  eyedropperIcon
} from "@progress/kendo-svg-icons";
import React, { useState } from "react";
import {
  AuthenticationEndPoints,
  IHCSubAccountEndPoints,
} from "../../../EndPoints";
import Constants from "../../common/Constants";
import {
  ColumnDatePicker,
  FormCheckbox,
  FormDatePicker,
  FormInput,
  FormTextArea
} from "../../form-components";

import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input } from "@progress/kendo-react-inputs";

import axiosInstance from "../../../core/HttpInterceptor";
import { CheckBoxCell } from "../../cells/CheckBoxCell";
import { DropdownFilterCell } from "../../common/Filter/DropdownFilterCell";
import { showSuccessNotification } from "../../NotificationHandler/NotificationHandler";
import {
  activeDateValidator,
  descriptionValidator,
  subAccountCodeValidator
} from "../../validators";

const checkboxs = ["Yes", "No"];

const DropdownFilterCel = (props) => (
  <DropdownFilterCell {...props} data={checkboxs} defaultItem={"select"} />
);

export default function IHCSubAccountCode() {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageTotal, setPageTotal] = React.useState();
  const [, setsearchText] = React.useState("");
  const [filter, setFilter] = React.useState();
  const [showFilter, setshowFilter] = React.useState(false);
  const [inactiveVisible, setInactiveVisible] = React.useState(false);
  const [IHCSubAccountData, setIHCSubAccountData] = useState([]);
  const [addIHCSubAccountVisible, setAddIHCSubAccountVisible] = useState(false);
  const [formInit, setFormInit] = useState([]);
  const [, setIHCSubAccountDropdownData] = useState(
    []
  );
  const [show, setShow] = React.useState(false);
  const [inactiveFormInit, setInactiveFormInit] = useState([]);
  const [columnShow, setColumnShow] = useState(false);

  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = React.useState(0);
  const [, setDrawerExpanded] = React.useState(false);

  React.useEffect(() => {
    setBindIHCSubAccountGrid({
      isActive: "Y",
      cskip: 0,
      ctake: 10,
    });
    handlePrivilageByGroup();
  }, []);

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = React.useState(
    []
  );
  const handlePrivilageByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=SubAccount`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => { });
  };

  const checkPrivialgeGroup = (resourcesKey, privilageId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilageId
    );
  };
  // Sorting changes
  const initialSort = [
    {
      field: "code",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const [showInactive, setshowInactive] = useState(false);

  const onInactiveCheckBox = (event) => {
    setShow(false);
    let iactive = showInactive ? "Y" : "N";
    setBindIHCSubAccountGrid({
      ...bindIHCSubAccountGrid,
      isActive: iactive,
    });
  };
  // Sorting changes
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindIHCSubAccountGrid({
      ...bindIHCSubAccountGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindIHCSubAccountGrid, setBindIHCSubAccountGrid] = useState(null);

  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (bindIHCSubAccountGrid) {
        BindIHCSubAccountGrid(
          bindIHCSubAccountGrid.code,
          bindIHCSubAccountGrid.description,
          bindIHCSubAccountGrid.revenueCheck,
          bindIHCSubAccountGrid.expenseCheck,
          bindIHCSubAccountGrid.salaryBenefits,
          bindIHCSubAccountGrid.startDate,
          bindIHCSubAccountGrid.isActive,
          bindIHCSubAccountGrid.search,
          bindIHCSubAccountGrid.cskip,
          bindIHCSubAccountGrid.ctake == "All"
            ? 0
            : bindIHCSubAccountGrid.ctake,
          bindIHCSubAccountGrid.desc,
          bindIHCSubAccountGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindIHCSubAccountGrid]);

  const BindIHCSubAccountGrid = (
    code = "",
    description = "",
    revenueCheck = "",
    expenseCheck = "",
    salaryBenefits = "",
    startDate = "",
    isActive = "Y",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = false,
    sortKey = "code"
  ) => {
    axiosInstance({
      method: "Post",
      url:
        IHCSubAccountEndPoints.GetIHCSubAccountFilter +
        "code=" +
        code +
        "&&description=" +
        description +
        "&&revenueCheck=" +
        revenueCheck +
        "&&expenseCheck=" +
        expenseCheck +
        "&&salaryBenefit=" +
        salaryBenefits +
        "&&startDate=" +
        startDate +
        "&&isActive=" +
        isActive +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setPageTotal(response.data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: response.data.data.length,
          });
        }
        data = data.map((element) => {
          element.startDate = new Date(element.startDate);
          if (element.endDate) {
            element.endDate = new Date(element.endDate);
          }
          return element;
        });
        setIHCSubAccountData(data);

        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.IHCSubAccountCode,
            id: data.id,
          };
          itemsData.push(items);
        });
        setIHCSubAccountDropdownData(itemsData);
        if (
          bindIHCSubAccountGrid.isActive &&
          bindIHCSubAccountGrid.isActive == isActive
        ) {
          setshowInactive(isActive == "N" ? true : false);
        }
      })
      .catch(() => { });
  };

  // Event for Funds Grid Change Filters
  const filterChange = (event) => {
    var code = "";
    var description = "";
    var revenueCheck = "";
    var expenseCheck = "";
    var salaryBenefits = "";
    var startDate = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "code") {
          code = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "description") {
          description = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "revenueCheck") {
          revenueCheck =
            event.filter.filters[i].value == "Yes"
              ? "Y"
              : event.filter.filters[i].value == "No"
                ? "N"
                : "";
        }
        if (event.filter.filters[i].field == "expenseCheck") {
          expenseCheck =
            event.filter.filters[i].value == "Yes"
              ? "Y"
              : event.filter.filters[i].value == "No"
                ? "N"
                : "";
        }
        if (event.filter.filters[i].field == "salaryBenefits") {
          salaryBenefits =
            event.filter.filters[i].value == "Yes"
              ? "Y"
              : event.filter.filters[i].value == "No"
                ? "N"
                : "";
        }
        if (event.filter.filters[i].field == "startDate") {
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
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindIHCSubAccountGrid({
      ...bindIHCSubAccountGrid,
      search: undefined,
      code: code,
      description: description,
      revenueCheck: revenueCheck,
      expenseCheck: expenseCheck,
      salaryBenefits: salaryBenefits,
      startDate: startDate,
    });
    setFilter(event.filter);
  };
  // Set More Filters
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  //Event of grid page change
  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindIHCSubAccountGrid({
        ...bindIHCSubAccountGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindIHCSubAccountGrid({
        ...bindIHCSubAccountGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: IHCSubAccountData.length,
      });
    }
  };
  //Event of grid filter change
  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setBindIHCSubAccountGrid({
      ...bindIHCSubAccountGrid,
      code: undefined,
      description: undefined,
      revenueCheck: undefined,
      expenseCheck: undefined,
      salaryBenefits: undefined,
      startDate: undefined,
      search: value,
    });
  };
  const addIHCSubAccountToggleDialog = () => {
    setAddIHCSubAccountVisible(!addIHCSubAccountVisible);

    if (addIHCSubAccountVisible) {
      setFormInit([]);
    }
  };

  const addIHCSubAccountCodeHandleSubmit = async (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let apiRequest = {
      id: dataItem.id,
      orgAccountId: 7,
      code: dataItem.code,
      description: dataItem.description,
      revenueCheck: dataItem.revenueCheck ? "Y" : "N",
      expenseCheck: dataItem.expenseCheck ? "Y" : "N",
      salaryBenefits: dataItem.salaryBenefits ? "Y" : "N",
      startDate: dataItem.startDate,
      isActive: "Y",
    };
    if (dataItem.edit) {
      try {
        await axiosInstance({
          method: "PUT",
          url: IHCSubAccountEndPoints.AddIHCSubAccount + "?id=" + dataItem.id,
          data: apiRequest,
          withCredentials: false,
        });
        setshowInactive(false);
        setShow(false);
        setBindIHCSubAccountGrid({
          ...bindIHCSubAccountGrid,
        });
        addIHCSubAccountToggleDialog();
      } catch (error) { }
    } else {
      try {
        await axiosInstance({
          method: "POST",
          url: IHCSubAccountEndPoints.AddIHCSubAccount,
          data: apiRequest,
          withCredentials: false,
        });
        setshowInactive(false);
        setShow(false);
        setBindIHCSubAccountGrid({
          isActive: "Y",
          cskip: 0,
          ctake: 10,
        });
        addIHCSubAccountToggleDialog();
      } catch (error) {
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    }
  };

  //open ContextMenu for IHCSubAccount Grid
  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };
  //close ContextMenu for IHCSubAccount Grid
  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };

  //Click Method for View Modified History
  const drawerhandleClick = () => {
    setDrawerExpanded((prevState) => !prevState);
  };

  //Event for Select ContextMenu Item of Grid Data
  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          axiosInstance({
            method: "GET",
            url: IHCSubAccountEndPoints.GetIHCSubAccount + "/" + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.revenueCheck = data.revenueCheck == "Y" ? true : false;
              data.expenseCheck = data.expenseCheck == "Y" ? true : false;
              data.salaryBenefits = data.salaryBenefits == "Y" ? true : false;
              data.startDate = new Date(data.startDate);
              data.edit = true;
              setFormInit(data);
              addIHCSubAccountToggleDialog();
            })
            .catch(() => { });
          break;

        case "history":
          drawerhandleClick();
          break;

        case "inactive":
          axiosInstance({
            method: "GET",
            url: IHCSubAccountEndPoints.GetIHCSubAccount + "/" + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.edit = true;
              data.revenueCheck = data.revenueCheck == "Y" ? true : false;
              data.expenseCheck = data.expenseCheck == "Y" ? true : false;
              data.salaryBenefits = data.salaryBenefits == "Y" ? true : false;
              data.startDate = new Date(data.startDate);
              data.inactive = false;
              setInactiveFormInit(data);
              inactiveToggleDialog();
            })
            .catch(() => { });
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  //Click Event bind ContextMenu for IHCSubAccount Grid
  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };
  //Open Inactive Popup
  const inactiveToggleDialog = () => {
    setInactiveVisible(!inactiveVisible);

    if (inactiveVisible) {
      setInactiveFormInit([]);
    }
  };
  const addInactiveHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    axiosInstance({
      method: "GET",
      url: IHCSubAccountEndPoints.GetIHCSubAccount + "/" + dataItem.id,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        let convertDate = new Date(dataItem.EndDate);
        data.EndDate = convertDate;
        data.isActive = "N";

        axiosInstance({
          method: "PUT",
          url: IHCSubAccountEndPoints.AddIHCSubAccount + "?id=" + dataItem.id,
          data: data,
          withCredentials: false,
        })
          .then((response) => {
            setshowInactive(false);
            setShow(false);
            setBindIHCSubAccountGrid({
              ...bindIHCSubAccountGrid,
            });
            inactiveToggleDialog();
            showSuccessNotification("IHAC subAccount inactivated successfully");
          })
          .catch(() => { });
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  //Custom Cell to bind ContextMenu for IHCSubAccount Grid
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

  return (
    <>
      {checkPrivialgeGroup("SubAcctCodeM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Accounting
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                IHAC Codes
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Sub Account
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>SubAccount Codes</h3>
            </div>
            <div className="col-sm-4 text-end">
              {checkPrivialgeGroup("AddSubAccountCodeB", 2) && (
                <Button
                  themeColor={"primary"}
                  onClick={addIHCSubAccountToggleDialog}
                >
                  <i className="fa-solid fa-plus"></i> Add New SubAccount Code
                </Button>
              )}
            </div>
          </div>
          {checkPrivialgeGroup("SubAcctCodeG", 1) && (
            <div className="mt-3">
              <Grid
                resizable={true}
                data={IHCSubAccountData}
                filterable={showFilter}
                filter={filter}
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
                        {checkPrivialgeGroup("ShowSubAccountInactiveCB", 1) && (
                          <Checkbox
                            type="checkbox"
                            id="showInactive"
                            name="showInactive"
                            value={showInactive}
                            defaultChecked={showInactive}
                            onChange={onInactiveCheckBox}
                            label={"Show Inactive"}
                          />
                        )}
                        {checkPrivialgeGroup("SMISubAcctCodeCB", 1) && (
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

                <Column field="code" title="Sub-Account Code" />
                <Column field="description" title="Description" />
                <Column
                  field="revenueCheck"
                  title="Revenue"
                  cell={CheckBoxCell}
                  filterCell={DropdownFilterCel}
                />
                <Column
                  field="expenseCheck"
                  title="Expense"
                  cell={CheckBoxCell}
                  filterCell={DropdownFilterCel}
                />
                <Column
                  field="salaryBenefits"
                  title="Salary & Benefits"
                  cell={CheckBoxCell}
                  filterCell={DropdownFilterCel}
                />
                <Column
                  field="startDate"
                  title="Active Date"
                  format="{0:MM/dd/yyyy}"
                  filterCell={ColumnDatePicker}
                  filter="date"
                />
                {showInactive && (
                  <Column
                    field="endDate"
                    title="Inactive Date"
                    format="{0:MM/dd/yyyy}"
                    filterCell={ColumnDatePicker}
                    filter="date"
                  />
                )}
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

              <ContextMenu
                show={show}
                offset={offset.current}
                onSelect={handleOnSelect}
                onClose={handleCloseMenu}
              >
                {checkPrivialgeGroup("EditSubAccountCM", 3) &&
                  !showInactive && (
                    <MenuItem
                      text="Edit SubAccount Code"
                      data={{
                        action: "edit",
                      }}
                      svgIcon={eyedropperIcon}
                    />
                  )}

                {checkPrivialgeGroup("MakeSubAccountInactiveCM", 2) &&
                  !showInactive && (
                    <MenuItem
                      text="Make SubAccount Code Inactive"
                      data={{
                        action: "inactive",
                      }}
                      svgIcon={eyeSlashIcon}
                    />
                  )}
              </ContextMenu>
            </div>
          )}

          <div>
            {addIHCSubAccountVisible && (
              <Dialog
                width={500}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    {formInit?.id ? (
                      <>
                        <i className="fa-solid fa-edit"></i>
                        <span className="ms-2">Edit SubAccount</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus"></i>
                        <span className="ms-2">Add New SubAccount</span>
                      </>
                    )}
                  </div>
                }
                onClose={addIHCSubAccountToggleDialog}
              >
                <Form
                  onSubmit={addIHCSubAccountCodeHandleSubmit}
                  initialValues={formInit}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <Field
                          id="code"
                          name="code"
                          label="SubAccount Code*"
                          component={FormInput}
                          validator={subAccountCodeValidator}
                          disabled={formInit?.id}
                          spinners={false}
                        />

                        <Field
                          id="description"
                          name="description"
                          label="Description*"
                          component={FormTextArea}
                          validator={descriptionValidator}
                          maxLength={250}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id="revenueCheck"
                            name="revenueCheck"
                            label="Revenue"
                            component={FormCheckbox}
                          />

                          <Field
                            id="expenseCheck"
                            name="expenseCheck"
                            label="Expense"
                            component={FormCheckbox}
                          />

                          <Field
                            id="salaryBenefits"
                            name="salaryBenefits"
                            label="Salary Benefits"
                            component={FormCheckbox}
                          />
                        </div>

                        <Field
                          id="startDate"
                          name="startDate"
                          label="Active Date*"
                          component={FormDatePicker}
                          validator={activeDateValidator}
                        />

                        <div className="k-form-buttons">
                          <Button
                            themeColor={"primary"}
                            className={"col-12"}
                            type={"submit"}
                            disabled={!formRenderProps.allowSubmit}
                          >
                            Save
                          </Button>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </Dialog>
            )}
          </div>
          {inactiveVisible && (
            <Dialog
              width={500}
              title={
                <div className="flex justify-content-center align-items-center">
                  <i className="fa-solid fa-plus"></i>
                  <span>Inactive Sub Account</span>
                </div>
              }
              onClose={inactiveToggleDialog}
            >
              <Form
                onSubmit={addInactiveHandleSubmit}
                initialValues={inactiveFormInit}
                render={(formRenderProps) => (
                  <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                      <Field
                        id={"EndDate"}
                        name={"EndDate"}
                        label={"Date"}
                        component={FormDatePicker}
                        wrapperstyle={{
                          width: "50%",
                        }}
                      />
                      <div className="k-form-buttons">
                        <Button
                          themeColor={"secondary"}
                          className={"col-6"}
                          onClick={inactiveToggleDialog}
                        >
                          Cancel
                        </Button>
                        <Button
                          themeColor={"primary"}
                          className={"col-6"}
                          type={"submit"}
                          disabled={!formRenderProps.allowSubmit}
                        >
                          Inactive SubAccount
                        </Button>
                      </div>
                    </fieldset>
                  </FormElement>
                )}
              />
            </Dialog>
          )}
        </>
      )}
    </>
  );
}
