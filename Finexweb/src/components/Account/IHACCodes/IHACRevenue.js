import { orderBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  GridColumn as Column,
  Grid,
  GridToolbar,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import {
  eyeSlashIcon,
  eyedropperIcon,
  plusOutlineIcon,
  trashIcon
} from "@progress/kendo-svg-icons";
import React, { useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  ExpenseEndPoints,
  IHACExpenseCodeEndPoints,
  budgetamountEndPoints
} from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import Constants from "../../common/Constants";
import { getCountyExpenseAmountType } from "../../common/Helper";
import {
  ColumnDatePicker,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormInputWithClose,
  FormMultiColumnComboBox,
  FormNumericTextBox,
  FormTextArea,
} from "../../form-components";
import SacDialog from "../../modal/StateAccountCodeDialog";
import { showSuccessNotification } from "../../NotificationHandler/NotificationHandler";
import {
  AnticipatedRevenueValidator,
  accountDropdownValidator,
  activeDateValidator,
  departmentDropdownValidator,
  programDropdownValidator,
  startingBalanceValidator,
  subAccountDropdownValidator,
} from "../../validators";

export default function IHACRevenue() {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [filter, setFilter] = React.useState();
  const [showFilter, setshowFilter] = React.useState(false);
  const [addIHACVisible, setAddIHACVisible] = React.useState(false);
  const [addCashVisible, setAddCashVisible] = React.useState(false);
  const [inactiveVisible, setInactiveVisible] = React.useState(false);
  const [IHACData, setIHACData] = useState([]);
  const [formInit, setFormInit] = useState([]);
  const [cashFormInit, setCashFormInit] = useState([]);
  const [inactiveFormInit, setInactiveFormInit] = useState([]);
  const [programDropdownData, setProgramDropdownData] = useState([]);
  const [programCodeTxt,] = useState([]);
  const [departmentDropdownData, setDepartmentDropdownData] = useState([]);
  const [accountDropdownData, setAccountDropdownData] = useState([]);
  const [subaccountDropdownData, setSubAccountDropdownData] = useState([]);
  const [formKey, setFormKey] = React.useState(1);

  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState();
  const [pageTotal, setPageTotal] = React.useState();
  const [searchText, setsearchText] = React.useState("");
  const [show, setShow] = React.useState(false);
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = React.useState(0);
  const [CACDDList, setCACDDList] = React.useState([]);
  const [columnShow, setColumnShow] = useState(false);
  const [CACVal,] = React.useState({
    value: {
      text: "Select County Expense Code",
      id: 0,
    },
  });
  const CACColumns = [
    {
      field: "text",
      header: "CAC",
      width: "150px",
    },
    {
      field: "desc",
      header: "Description",
      width: "150px",
    },
  ];
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];
  const [sort, setSort] = useState(initialSort);

  const [InnerGridshow, setInnerGridShow] = React.useState(false);
  const [InnerGridformInit, setInnerGridformInit] = useState([]);
  const [innerCashBalncedialogVisible, setInnerCashBalncedialogVisible] =
    React.useState(false);
  const [selectedCashBalanceId, setselectedCashBalanceId] = React.useState(0);
  const offsetInnerGrid = React.useRef({
    left: 0,
    top: 0,
  });
  const [deleteVisible, setDeleteVisible] = useState(false);
  const InnerGridCashBalanceToggleDialog = () => {
    setInnerCashBalncedialogVisible(!innerCashBalncedialogVisible);
  };

  React.useEffect(() => {
    setshowInactive(false);
    setShow(false);
    setBindIHACRevenueGrid({
      ...bindIHACRevenueGrid,
      cskip: 0,
      ctake: page.take,
    });
    BindProgramDropdown();
    BindDepartmentDropdown();
    BindAccountDropdown();
    BindSubAccountDropdown();
    BindExpenseDropdown();
  }, []);
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const [showInactive, setshowInactive] = useState(false);

  const onInactiveCheckBox = (event) => {
    setShow(false);
    let iactive = showInactive ? "Y" : "N";
    setBindIHACRevenueGrid({
      ...bindIHACRevenueGrid,
      isActive: iactive,
      search: searchText,
    });
  };

  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    let iactive = !showInactive ? "Y" : "N";
    setSort(event.sort);
    setBindIHACRevenueGrid({
      ...bindIHACRevenueGrid,
      isActive: iactive,
      search: searchText,
      cskip: 0,
      ctake: page.take,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindIHACRevenueGrid, setBindIHACRevenueGrid] = useState(null);

  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (bindIHACRevenueGrid) {
        BindIHACRevenueGrid(
          bindIHACRevenueGrid.ihacCode,
          bindIHACRevenueGrid.description,
          bindIHACRevenueGrid.stateAccountCode,
          bindIHACRevenueGrid.program,
          bindIHACRevenueGrid.department,
          bindIHACRevenueGrid.account,
          bindIHACRevenueGrid.subAccount,
          bindIHACRevenueGrid.isActive,
          bindIHACRevenueGrid.startDate,
          bindIHACRevenueGrid.search,
          bindIHACRevenueGrid.cskip,
          bindIHACRevenueGrid.ctake,
          bindIHACRevenueGrid.desc,
          bindIHACRevenueGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindIHACRevenueGrid]);

  const BindIHACRevenueGrid = (
    ihacCode = "",
    description = "",
    stateAccountCode = "",
    program = "",
    department = "",
    account = "",
    subAccount = "",
    isActive = "Y",
    startDate = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate"
  ) => {
    const accountingTypeCode =
      Constants.ExpenseOrRevenueIndicatorTypeCode.RevenueIndicator.code;
    axiosInstance({
      method: "Post",
      url:
        IHACExpenseCodeEndPoints.GetIHACListWithFilter +
        "code=" +
        ihacCode +
        "&&description=" +
        description +
        "&&stateAccountCode=" +
        stateAccountCode +
        "&&programCode=" +
        program +
        "&&departmentCode=" +
        department +
        "&&AccountCode=" +
        account +
        "&&subAccountCode=" +
        subAccount +
        "&&isActive=" +
        isActive +
        "&&startDate=" +
        startDate +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        `&&typeCode=${accountingTypeCode}` +
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
          if (element.endDate) {
            element.endDate = new Date(element.endDate);
          }
          return element;
        });
        setIHACData(data);
        if (
          bindIHACRevenueGrid.isActive &&
          bindIHACRevenueGrid.isActive == isActive
        ) {
          setshowInactive(isActive == "N" ? true : false);
        }
      })
      .catch((error) => { });
  };
  const BindExpenseDropdown = () => {
    axiosInstance({
      method: "GET",
      url: ExpenseEndPoints.GetAccountingCodeDetailList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;

        let itemsData = [];
        data.forEach((data) => {
          let items = {
            desc: data.countyExpenseDescription,
            text: data.countyExpenseCode,
            id: data.id,
          };
          itemsData.push(items);
        });
        setCACDDList(itemsData);
      })
      .catch((error) => { });
  };
  const BindProgramDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCProgramList + "?forIhpo=false",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.filter((x) => x.revenueCheck == "Y");
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "00" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setProgramDropdownData(itemsData);
      })
      .catch((error) => { });
  };

  const BindDepartmentDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCDepartmentList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.filter((x) => x.revenueCheck == "Y");
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "00" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setDepartmentDropdownData(itemsData);
      })
      .catch((error) => { });
  };

  const BindAccountDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCAccountList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.filter((x) => x.revenueCheck == "Y");
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "0000" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setAccountDropdownData(itemsData);
      })
      .catch((error) => { });
  };

  const BindSubAccountDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCSubAccountList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.filter((x) => x.revenueCheck == "Y");
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "0000" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setSubAccountDropdownData(itemsData);
      })
      .catch((error) => { });
  };

  // Event for Funds Grid Change Filters
  const filterChange = (event) => {
    var ihacCode = "";
    var description = "";
    var stateAccountCode = "";
    var program = "";
    var department = "";
    var account = "";
    var subAccount = "";
    var startDate = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "ihacCode") {
          ihacCode = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "description") {
          description = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "stateAccountingCode") {
          stateAccountCode = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "ihacProgram.code") {
          program = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "ihacDepartment.code") {
          department = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "ihacAccount.code") {
          account = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "ihacSubAccount.code") {
          subAccount = event.filter.filters[i].value;
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
    let iactive = !showInactive ? "Y" : "N";
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindIHACRevenueGrid({
      ...bindIHACRevenueGrid,
      ihacCode: ihacCode,
      description: description,
      stateAccountCode: stateAccountCode,
      program: program,
      department: department,
      account: account,
      subAccount: subAccount,
      isActive: iactive,
      startDate: startDate,
      cskip: 0,
    });
    setFilter(event.filter);
  };
  // Set More Filters
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  //Event of grid page change
  const pageChange = (event) => {
    if (event.page.take <= 15) {
      setPageSizeValue(event.page.take);
      setBindIHACRevenueGrid({
        ...bindIHACRevenueGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindIHACRevenueGrid({
        ...bindIHACRevenueGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: IHACData.length,
      });
    }
  };
  //Event of grid filter change
  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({ ...page, skip: 0 });
    setBindIHACRevenueGrid({
      ...bindIHACRevenueGrid,
      cskip: 0,
      search: value,
    });
  };

  //Open Add funds Popup
  const addIAHCToggleDialog = () => {
    setAddIHACVisible(!addIHACVisible);
    if (addIHACVisible) {
      setFormInit([]);
    }
  };

  //Event to Submit add fund Popup Data change later
  const addferFundHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (dataItem.id !== undefined) {
      let apirequest = {
        id: dataItem.id,
        orgAccountId: 7,
        ihacCode:
          dataItem.ProgramCodeInput +
          "-" +
          dataItem.DepartmentCodeInput +
          "-" +
          dataItem.AccountCodeInput +
          "-" +
          dataItem.SubAccountCodeInput,
        description: dataItem.description,
        typeCode: dataItem.typeCode,
        countyAccountingCode: dataItem.countyAccountingCode?.id,
        stateAccountingCode: dataItem.stateAccountingCode || "",
        programAccountingCode: dataItem.ProgramDropdown.id,
        ihcAccountCode: dataItem.AccountDropdown.id,
        departmentAccountingCode: dataItem.DepartmentDropdown.id,
        subAccountAccountingCode: dataItem.SubAccountDropdown.id,
        startDate: dataItem.activeDate,
        isActive: "Y",
        revenueInd: "Y",
        expenseInd: "N",
        salaryInd: "N",
      };

      axiosInstance({
        method: "PUT",
        url: IHACExpenseCodeEndPoints.EditDeleteIAHCById + dataItem.id,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          showSuccessNotification(
            "IHAC Anticipated Revenue Modified Successfully"
          );
          setshowInactive(false);
          setShow(false);
          setBindIHACRevenueGrid({
            isActive: "Y",
            cskip: 0,
            ctake: 10,
            desc: "true",
            sortKey: "modifiedDate",
          });
        })
        .catch(() => { });
    } else {
      let apirequest = {
        id: dataItem.id,
        orgAccountId: 7,
        ihacCode:
          dataItem.ProgramCodeInput +
          "-" +
          dataItem.DepartmentCodeInput +
          "-" +
          dataItem.AccountCodeInput +
          "-" +
          dataItem.SubAccountCodeInput,
        description: dataItem.description || "",
        typeCode:
          Constants.ExpenseOrRevenueIndicatorTypeCode.RevenueIndicator.code,
        countyAccountingCode: dataItem.countyAccountingCode?.id,
        stateAccountingCode: dataItem.stateAccountingCode || "",
        programAccountingCode: dataItem.ProgramDropdown.id,
        ihcAccountCode: dataItem.AccountDropdown.id,
        departmentAccountingCode: dataItem.DepartmentDropdown.id,
        subAccountAccountingCode: dataItem.SubAccountDropdown.id,
        startDate: dataItem.activeDate,
        isActive: "Y",
        revenueInd: "Y",
        expenseInd: "N",
        salaryInd: "N",
      };

      axiosInstance({
        method: "POST",
        url: IHACExpenseCodeEndPoints.AddIHAC,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          showSuccessNotification(
            "IHAC Anticipated Revenue Added Successfully"
          );
          if (dataItem.startingBalance > 0) {
            let IHACAllocationRequest = {
              id: 0,
              ihacCodeId: response.data.id,
              amount: dataItem.startingBalance,
              typeCode: Constants.CountyExpenseAmountTypeCode.Allocation.code,
              startDate: dataItem.activeDate,
            };

            axiosInstance({
              method: "POST",
              url: IHACExpenseCodeEndPoints.AddIHACExpenseAmount,
              data: IHACAllocationRequest,
              withCredentials: false,
            }).then((response) => {
              setshowInactive(false);
              setShow(false);
              setBindIHACRevenueGrid({
                isActive: "Y",
                cskip: 0,
                ctake: 10,
                desc: "true",
                sortKey: "modifiedDate",
              });
            });
          } else {
            setshowInactive(false);
            setShow(false);
            setBindIHACRevenueGrid({
              isActive: "Y",
              cskip: 0,
              ctake: 10,
              desc: "true",
              sortKey: "modifiedDate",
            });
          }
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    }
    addIAHCToggleDialog();
  };
  //Event to Submit add CashBalace Popup Data
  const addCashBalHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let IHACAllocationRequest = {
      id: 0,
      ihacCodeId: dataItem.id,
      amount: dataItem.startingBalance,
      typeCode: Constants.CountyExpenseAmountTypeCode.Allocation.code,
      startDate: dataItem.activeDate,
      notes: dataItem.notes
    };
    axiosInstance({
      method: "POST",
      url: IHACExpenseCodeEndPoints.AddIHACExpenseAmount,
      data: IHACAllocationRequest,
      withCredentials: false,
    })
      .then((response) => {
        getCashBalance(IHACAllocationRequest.ihacCodeId);

        showSuccessNotification("Add Amount Successfully");
        addCashToggleDialog();
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const addInactiveHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    axiosInstance({
      method: "GET",
      url: IHACExpenseCodeEndPoints.EditDeleteIAHCById + dataItem.id,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        data.EndDate = dataItem.EndDate;
        data.isActive = "N";

        axiosInstance({
          method: "PUT",
          url: IHACExpenseCodeEndPoints.EditDeleteIAHCById + dataItem.id,
          data: data,
          withCredentials: false,
        })
          .then((response) => {
            setshowInactive(false);
            setShow(false);
            setBindIHACRevenueGrid({
              isActive: "Y",
              cskip: 0,
              ctake: 10,
            });
            inactiveToggleDialog();
            showSuccessNotification(
              "IHAC Anticipated Revenue Inactive Successfully"
            );
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
  //Change Event for Expand fund grid data
  const expandChange = (event) => {
    let newData = IHACData.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setIHACData(newData);
    setselectedRowId(event.dataItem.id);

    event.dataItem.expanded = event.value;
    setIHACData([...IHACData]);

    let id = event.dataItem.id;
    getCashBalance(id);
    if (!event.value || event.dataItem.amountDetails) {
      return;
    }
  };
  const [selectedState,] = useState({});
  const DATA_ITEM_KEY = "ihacCode";

  const onSelectionChange = (event) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    let expendId;
    let newData = IHACData.map((item) => {
      if (item.ihacCode == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
        expendId = item.id;
        setselectedRowId(expendId);
        getCashBalance(expendId);
      } else {
        item.expanded = false;
      }
      return item;
    });
    setIHACData(newData);
  };

  const getCashBalance = (id) => {
    axiosInstance({
      method: "GET",
      url: IHACExpenseCodeEndPoints.GetIHACDetailList.replace("#ID#", id),
      withCredentials: false,
    })
      .then((response) => {
        let revenueData = response.data;
        if (revenueData.length > 0) {
          revenueData.sort(
            (a, b) => new Date(b.startDate) - new Date(a.startDate)
          );
          let data = IHACData.slice();
          let index = data.findIndex((d) => d.id == id);
          if (index >= 0) {
            data[index].details = revenueData;
          }

          setIHACData(data);
        } else {
          let data = IHACData.slice();
          let index = data.findIndex((d) => d.id == id);
          if (index >= 0) {
            data[index].details = {};
          }

          setIHACData(data);
        }
      })
      .catch(() => { });
  };

  const ddlProgramhandleChange = (formRenderProps) => {
    let ProgramCodeInput = formRenderProps.valueGetter("ProgramDropdown")?.code;
    formInit.ProgramDropdown = formRenderProps.valueGetter("ProgramDropdown");
    let DepartmentCodeInput =
      formRenderProps.valueGetter("DepartmentDropdown")?.code;
    formInit.DepartmentDropdown =
      formRenderProps.valueGetter("DepartmentDropdown");
    let SubAccountCodeInput =
      formRenderProps.valueGetter("SubAccountDropdown")?.code;
    formInit.SubAccountDropdown =
      formRenderProps.valueGetter("SubAccountDropdown");
    let AccountCodeInput = formRenderProps.valueGetter("AccountDropdown")?.code;
    formInit.AccountDropdown = formRenderProps.valueGetter("AccountDropdown");
    formInit.ihacCode = formRenderProps.valueGetter("ihacCode");
    formInit.description = formRenderProps.valueGetter("description");
    formInit.startingBalance = formRenderProps.valueGetter("startingBalance");
    let activeDate = formRenderProps.valueGetter("activeDate");
    if (activeDate)
      formInit.activeDate = new Date(formRenderProps.valueGetter("activeDate"));

    formInit.ProgramCodeInput = ProgramCodeInput;
    formInit.DepartmentCodeInput = DepartmentCodeInput;
    formInit.SubAccountCodeInput = SubAccountCodeInput;
    formInit.AccountCodeInput = AccountCodeInput;
    formInit.countyAccountingCode = formRenderProps.valueGetter(
      "countyAccountingCode"
    );
    if (
      ProgramCodeInput &&
      DepartmentCodeInput &&
      SubAccountCodeInput &&
      AccountCodeInput
    ) {
      formInit.ihacCode =
        ProgramCodeInput +
        "-" +
        DepartmentCodeInput +
        "-" +
        AccountCodeInput +
        "-" +
        SubAccountCodeInput;
    }
    if (formRenderProps.valueGetter("countyAccountingCode")?.id) {
      axiosInstance({
        method: "Get",
        url: budgetamountEndPoints.TotalBudgetAmount.replace(
          "#AccountingCodeId#",
          formRenderProps.valueGetter("countyAccountingCode")?.id
        ),
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          formInit.balance = data.balance;
          formInit.CACAllocation = data.amount;
          setFormInit(formInit);
          setFormKey(formKey + 1);
        })
        .catch(() => { });
    } else {
      setFormInit(formInit);
      setFormKey(formKey + 1);
    }
  };

  // Custom Cell to bind fundgrid Date Column
  const myCustomDateCell = (props) => {
    var myDate = props.dataItem.startDate;
    const [year, month, day] = myDate.split("T")[0].split("-");
    return <td>{`${month}/${day}/${year} `}</td>;
  };

  // Custom Cell to bind fundgrid Amount Column
  const myCustomAmtCell = (props) => {
    var amount = props.dataItem.amount;
    amount = "$" + amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    if (amount.indexOf("-") == -1) {
      return <td className="!k-text-right">{`${amount}`}</td>;
    } else {
      return (
        <td className="!k-text-right">
          {`${"(" + amount.replace(/-/g, "") + ")"}`}
        </td>
      );
    }
  };
  const handleCloseMenuInnerGrid = () => {
    setInnerGridShow(false);
    setselectedCashBalanceId(0);
  };

  const handleOnSelectInnerGrid = (e) => {
    let id = selectedCashBalanceId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          let url = IHACExpenseCodeEndPoints.getIHACExpenseAmount + "/" + id;
          axiosInstance({
            method: "GET",
            url: url,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.startDate = new Date(data.startDate);
              setInnerGridformInit(data);
              InnerGridCashBalanceToggleDialog();
            })
            .catch(() => { });
          break;
        case "delete":
          toggleDeleteDialog();
          break;
        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setInnerGridShow(false);
  };
  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };
  const DeleteOnClick = () => {
    let id = selectedCashBalanceId;

    axiosInstance({
      method: "Delete",
      url: IHACExpenseCodeEndPoints.DeleteIHACExpenseAmount + "/" + id,
      withCredentials: false,
    })
      .then((response) => {
        getCashBalance(selectedRowId);
        toggleDeleteDialog();
      })
      .catch((error) => { });
  };

  const InnerGridCashBalanceHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let casebalanceRequest = {
      id: dataItem.id,
      ihacCodeId: dataItem.ihacCodeId,
      amount: dataItem.amount,
      typeCode: dataItem.typeCode,
      startDate: dataItem.startDate,
      notes:dataItem.notes
    };

    axiosInstance({
      method: "PUT",
      url:
        IHACExpenseCodeEndPoints.AddIHACExpenseAmount +
        "/" +
        casebalanceRequest.id,
      data: casebalanceRequest,
      withCredentials: false,
    })
      .then((response) => {
        setInnerGridformInit([]);
        getCashBalance(casebalanceRequest.ihacCodeId);
        InnerGridCashBalanceToggleDialog();
        showSuccessNotification("Add amount successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const InnerGridCommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onMouseDown={handleInnerGridContextMenu}
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

  const handleInnerGridContextMenu = (props) => {
    handleInnerGridContextMenuOpen(props);
  };
  const handleInnerGridContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedCashBalanceId(e.currentTarget.id);

    offsetInnerGrid.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setInnerGridShow(true);
  };

  //Event to Bind DetailComponent of fund grid
  const DetailComponent = (props) => {
    const data = props.dataItem.details;
    if (data && Object.keys(data).length > 0) {
      data.map((item) => {
        item["type"] = getCountyExpenseAmountType(item.typeCode);
      });
      return (
        <>
          {checkPrivialgeGroup("IHACRG", 1) && (
            <Grid
              resizable={true}
              data={data}
            >
              <Column
                field="startDate"
                title="Date"
                type="date"
                cell={myCustomDateCell}
              />
              <Column
                field="amount"
                className="!k-text-right"
                title="Amount"
                headerCell={(props) => {
                  return (
                    <span className="k-cell-inner">
                      <span className="k-link !k-cursor-default d-flex justify-content-end">
                        <span className="k-column-title">{props.title}</span>
                        {props.children}
                      </span>
                    </span>
                  );
                }}
                cell={myCustomAmtCell}
              />
              <Column
                field="type"
                title="Types"
                cell={(props) => {
                  return <td>{props.dataItem.type}</td>;
                }}
              />
              <Column
                field="notes"
                title="Notes"
                cell={(props) => {
                  return <td>{props.dataItem.notes}</td>;
                }}
              />
              {!showInactive && (
                <Column cell={InnerGridCommandCell} filterable={false} />
              )}
            </Grid>
          )}
          <ContextMenu
            show={InnerGridshow}
            offset={offsetInnerGrid.current}
            onSelect={handleOnSelectInnerGrid}
            onClose={handleCloseMenuInnerGrid}
          >
            {checkPrivialgeGroup("EditIHACRAmountCM", 3) && (
              <MenuItem
                text="Edit"
                data={{
                  action: "edit",
                }}
                svgIcon={eyedropperIcon}
              />
            )}
            {checkPrivialgeGroup("DeleteIHACRAmountCM", 4) && (
              <MenuItem
                text="Delete"
                data={{
                  action: "delete",
                }}
                svgIcon={trashIcon}
              />
            )}
          </ContextMenu>
        </>
      );
    } else {
      return (
        <>
          <p style={{ textAlign: "center" }}>No Records Available</p>
        </>
      );
    }
  };

  //Open Add Cash Balance Popup
  const addCashToggleDialog = () => {
    setAddCashVisible(!addCashVisible);

    if (addCashVisible) {
      setCashFormInit([]);
    }
  };
  //Open Inactive Popup
  const inactiveToggleDialog = () => {
    setInactiveVisible(!inactiveVisible);

    if (inactiveVisible) {
      setInactiveFormInit([]);
    }
  };
  //open ContextMenu for fund Grid
  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };
  //close ContextMenu for fund Grid
  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };

  //Event for Select ContextMenu Item of Grid Data
  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          axiosInstance({
            method: "GET",
            url: IHACExpenseCodeEndPoints.EditDeleteIAHCById + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.ProgramDropdown = data.programAccountingCode
                ? programDropdownData.find(
                  (c) => c.id == data.programAccountingCode
                )
                : 0;
              data.DepartmentDropdown = data.departmentAccountingCode
                ? departmentDropdownData.find(
                  (c) => c.id == data.departmentAccountingCode
                )
                : 0;
              data.AccountDropdown = data.ihcAccountCode
                ? accountDropdownData.find((c) => c.id == data.ihcAccountCode)
                : 0;
              data.SubAccountDropdown = data.subAccountAccountingCode
                ? subaccountDropdownData.find(
                  (c) => c.id == data.subAccountAccountingCode
                )
                : 0;
              data.countyAccountingCode = data.subAccountAccountingCode
                ? CACDDList.find((c) => c.id == data.countyAccountingCode)
                : 0;

              data.startingBalance = data.startingBalance;
              data.activeDate = new Date(data.startDate);

              data.ProgramCodeInput = data?.ProgramDropdown?.code;
              data.DepartmentCodeInput = data?.DepartmentDropdown?.code;
              data.SubAccountCodeInput = data?.SubAccountDropdown?.code;
              data.AccountCodeInput = data.SubAccountDropdown.code;
              data.edit = true;

              setFormInit(data);
              setFormKey(formKey + 1);

              setAddIHACVisible(!addIHACVisible);
            })
            .catch(() => { });
          break;
        case "inactive":
          axiosInstance({
            method: "GET",
            url: IHACExpenseCodeEndPoints.EditDeleteIAHCById + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              setInactiveFormInit(data);
              inactiveToggleDialog();
            })
            .catch(() => { });
          break;

        case "AddCashBalance":
          axiosInstance({
            method: "GET",
            url: IHACExpenseCodeEndPoints.EditDeleteIAHCById + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.amount = "";
              data.activeDate = "";
              data.startDate = new Date(response.data.startDate);
              data.modifiedDate = new Date(response.data.modifiedDate);
              setCashFormInit(data);
              addCashToggleDialog();
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

  //Click Event bind ContextMenu for fund Grid
  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };

  //Custom Cell to bind ContextMenu for fund Grid
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

  const [visible, setVisible] = React.useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const formRef = useRef();
  const [, setSacCode] = React.useState("");
  const getSacCode = (sac) => {
    formRef.current.valueSetter("stateAccountingCode", sac);
    setSacCode(sac);
    formInit.stateAccountingCode = sac;
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('IHAC Revenue')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("IHACRM", 1) && (
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
                IHAC Anticipated Revenue
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>IHAC Anticipated Revenue</h3>
            </div>
            <div className="col-sm-4 text-end">
              {checkPrivialgeGroup("AddIHACRevenueCodeB", 2) && (
                <Button themeColor={"primary"} onClick={addIAHCToggleDialog}>
                  <i className="fa-solid fa-plus"></i> Add IHAC Anticipated
                  Revenue Code
                </Button>
              )}
            </div>
          </div>

          {checkPrivialgeGroup("IHACRG", 1) && (
            <div className="mt-3">
              <Grid
                resizable={true}
                filterable={showFilter}
                detail={DetailComponent}
                expandField="expanded"
                onExpandChange={expandChange}
                filter={filter}
                onFilterChange={filterChange}
                data={orderBy(IHACData, sort)}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, 50, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                onPageChange={pageChange}
                onSelectionChange={onSelectionChange}
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
                        {checkPrivialgeGroup("SHOWIHACRINACTIVECB", 1) && (
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
                        {checkPrivialgeGroup("SMIIHACRCB", 1) && (
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

                <Column field="ihacCode" title="Code" width={150} />
                <Column field="description" title="Description" />
                <Column field="stateAccountingCode" title="SAC" />
                <Column field="ihacProgram.code" title="Program" />
                <Column field="ihacDepartment.code" title="Department" />
                <Column field="ihacAccount.code" title="Account" />
                <Column field="ihacSubAccount.code" title="Sub Account" />
                <Column
                  field="startDate"
                  title="Start Date"
                  format="{0:MM/dd/yyyy}"
                  filterCell={ColumnDatePicker}
                  filter="date"
                  cell={(props) => {
                    const [year, month, day] = props.dataItem?.startDate
                      ? props.dataItem?.startDate.split("T")[0].split("-")
                      : [null, null, null];
                    return (
                      <td>
                        {props.dataItem?.startDate
                          ? `${month}/${day}/${year}`
                          : null}
                      </td>
                    );
                  }}
                />
                {showInactive && (
                  <Column
                    field="endDate"
                    title="Inactive Date"
                    format="{0:MM/dd/yyyy}"
                    filter="date"
                    filterCell={ColumnDatePicker}
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
                {checkPrivialgeGroup("EditIHACRevenueCM", 3) &&
                  !showInactive && (
                    <MenuItem
                      text="Edit IHAC Anticipated Revenue Code"
                      data={{
                        action: "edit",
                      }}
                      svgIcon={eyedropperIcon}
                    />
                  )}
                {checkPrivialgeGroup("MakeIHACRInactiveCM", 2) &&
                  !showInactive && (
                    <MenuItem
                      text="Make IHAC Anticipated Revenue Code Inactive"
                      data={{
                        action: "inactive",
                      }}
                      svgIcon={eyeSlashIcon}
                    />
                  )}
                {checkPrivialgeGroup("AddIHACRAmountCM", 2) &&
                  !showInactive && (
                    <MenuItem
                      text="Add Amount"
                      data={{
                        action: "AddCashBalance",
                      }}
                      svgIcon={plusOutlineIcon}
                    />
                  )}
              </ContextMenu>
            </div>
          )}

          {addIHACVisible && (
            <Dialog
              width={600}
              height={600}
              title={
                <div className="d-flex align-items-center justify-content-center">
                  <i className="fa-solid fa-plus"></i>
                  <span className="ms-2">
                    {formInit.edit
                      ? "Edit IHAC Anticipated Revenue Code"
                      : "Add IHAC Anticipated Revenue Code"}
                  </span>
                </div>
              }
              onClose={addIAHCToggleDialog}
            >
              <Form
                onSubmit={addferFundHandleSubmit}
                initialValues={formInit}
                key={formKey}
                ref={formRef}
                ignoreModified={true}
                render={(formRenderProps) => (
                  <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Field
                          id={"ProgramDropdown"}
                          name={"ProgramDropdown"}
                          label={"Program*"}
                          textField="text"
                          dataItemKey="id"
                          component={FormDropDownList}
                          data={programDropdownData}
                          value={programDropdownData.id}
                          onChange={() =>
                            ddlProgramhandleChange(formRenderProps)
                          }
                          wrapperstyle={{
                            width: "60%",
                            marginRight: "10px",
                          }}
                          validator={programDropdownValidator}
                        />
                        <Field
                          id={"ProgramCodeInput"}
                          name={"ProgramCodeInput"}
                          label={"Code"}
                          component={FormInput}
                          value={programCodeTxt}
                          disabled={true}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Field
                          id={"DepartmentDropdown"}
                          name={"DepartmentDropdown"}
                          label={"Department*"}
                          textField="text"
                          dataItemKey="id"
                          component={FormDropDownList}
                          data={departmentDropdownData}
                          onChange={() =>
                            ddlProgramhandleChange(formRenderProps)
                          }
                          wrapperstyle={{
                            width: "60%",
                            marginRight: "10px",
                          }}
                          validator={departmentDropdownValidator}
                        />

                        <Field
                          id={"DepartmentCodeInput"}
                          name={"DepartmentCodeInput"}
                          label={"Code"}
                          component={FormInput}
                          disabled={true}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Field
                          id={"AccountDropdown"}
                          name={"AccountDropdown"}
                          label={"Account*"}
                          textField="text"
                          dataItemKey="id"
                          component={FormDropDownList}
                          data={accountDropdownData}
                          onChange={() =>
                            ddlProgramhandleChange(formRenderProps)
                          }
                          wrapperstyle={{
                            width: "60%",
                            marginRight: "10px",
                          }}
                          validator={accountDropdownValidator}
                        />

                        <Field
                          id={"AccountCodeInput"}
                          name={"AccountCodeInput"}
                          label={"Code"}
                          component={FormInput}
                          disabled={true}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Field
                          id={"SubAccountDropdown"}
                          name={"SubAccountDropdown"}
                          label={"SubAccount*"}
                          textField="text"
                          dataItemKey="id"
                          component={FormDropDownList}
                          data={subaccountDropdownData}
                          onChange={() =>
                            ddlProgramhandleChange(formRenderProps)
                          }
                          wrapperstyle={{
                            width: "60%",
                            marginRight: "10px",
                          }}
                          validator={subAccountDropdownValidator}
                        />

                        <Field
                          id={"SubAccountCodeInput"}
                          name={"SubAccountCodeInput"}
                          label={"Code"}
                          component={FormInput}
                          disabled={true}
                        />
                      </div>
                      <Field
                        id={"ihacCode"}
                        name={"ihacCode"}
                        label={"IHAC Anticipated Revenue"}
                        placeholder={"Create Based on combination of the codes"}
                        component={FormInput}
                        disabled={true}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Field
                          id={"countyAccountingCode"}
                          name={"countyAccountingCode"}
                          label={"County Revenue Code"}
                          textField="text"
                          dataItemKey="id"
                          component={FormMultiColumnComboBox}
                          data={CACDDList}
                          value={CACVal}
                          columns={CACColumns}
                          placeholder="Search CAC..."
                          onChange={() =>
                            ddlProgramhandleChange(formRenderProps)
                          }
                          wrapperstyle={{
                            width: "100%",
                          }}
                        />
                      </div>
                      <Field
                        id={"stateAccountingCode"}
                        name={"stateAccountingCode"}
                        label={"SAC Code"}
                        placeholder={"SAC Code"}
                        component={FormInputWithClose}
                        onInputClick={() => setVisible(true)}
                        onRemoveValue={() => {
                          formRenderProps.onChange("stateAccountingCode", {
                            value: "",
                          });
                        }}
                      />

                      {!formRenderProps.valueGetter("edit") && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"startingBalance"}
                            name={"startingBalance"}
                            label={"Anticipated Revenue"}
                            format={"c"}
                            placeholder={"$ Enter Amount"}
                            component={FormNumericTextBox}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                            step={0}
                            spinners={false}
                          />
                          <Field
                            id={"activeDate"}
                            name={"activeDate"}
                            label={"Date*"}
                            component={FormDatePicker}
                            validator={activeDateValidator}
                          />
                        </div>
                      )}

                      {formRenderProps.valueGetter("edit") && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"activeDate"}
                            name={"activeDate"}
                            label={"Date*"}
                            component={FormDatePicker}
                            validator={activeDateValidator}
                            wrapperstyle={{
                              width: "50%",
                            }}
                          />
                        </div>
                      )}
                      <Field
                        id={"description"}
                        name={"description"}
                        label={"Description"}
                        placeholder={"Enter Description"}
                        component={FormInput}
                        maxLength={250}
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
          {addCashVisible && (
            <Dialog
              width={500}
              title={
                <div className="d-flex align-items-center justify-content-center">
                  <i className="fa-solid fa-plus"></i>{" "}
                  <span className="ms-2">Add Amount</span>
                </div>
              }
              onClose={addCashToggleDialog}
            >
              <Form
                onSubmit={addCashBalHandleSubmit}
                initialValues={cashFormInit}
                render={(formRenderProps) => (
                  <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                      <Field
                        id={"ihacCode"}
                        name={"ihacCode"}
                        label={"Ihac Revenue Code"}
                        placeholder={
                          "Based on county auditor's chart of accounts listing"
                        }
                        component={FormInput}
                        disabled={true}
                      />
                      <Field
                        id={"description"}
                        name={"description"}
                        label={"Description"}
                        placeholder={
                          "Based on the title given by the auditors office"
                        }
                        component={FormInput}
                        disabled={true}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Field
                          id={"startingBalance"}
                          name={"startingBalance"}
                          label={"Anticipated Revenue*"}
                          format={"c"}
                          placeholder={"$ Enter Amount"}
                          component={FormNumericTextBox}
                          validator={AnticipatedRevenueValidator}
                          wrapperstyle={{
                            width: "50%",
                            marginRight: 10,
                          }}
                          step={0}
                          spinners={false}
                        />
                        <Field
                          id={"activeDate"}
                          name={"activeDate"}
                          label={"Date*"}
                          component={FormDatePicker}
                          validator={activeDateValidator}
                        />
                      </div>
                      <Field
                          id={"notes"}
                          name={"notes"}
                          label={"Notes"}
                          component={FormTextArea}
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
          {inactiveVisible && (
            <Dialog
              width={500}
              title={
                <div className="flex justify-content-center align-items-center">
                  <i className="fa-solid fa-plus"></i>
                  <span>Inactive IHAC Anticipated Revenue Code</span>
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
                        validator={activeDateValidator}
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
                          Inactivate
                        </Button>
                      </div>
                    </fieldset>
                  </FormElement>
                )}
              />
            </Dialog>
          )}
          {visible && (
            <SacDialog
              toggleDialog={toggleDialog}
              getSacCode={getSacCode}
              type={6}
            >
              {" "}
            </SacDialog>
          )}
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
          {innerCashBalncedialogVisible && (
            <Dialog
              width={500}
              title={
                <div className="d-flex align-items-center justify-content-center">
                  <i className="fa-solid fa-edit"></i>
                  <span className="ms-2">Edit Amount</span>
                </div>
              }
              onClose={InnerGridCashBalanceToggleDialog}
            >
              <Form
                onSubmit={InnerGridCashBalanceHandleSubmit}
                initialValues={InnerGridformInit}
                render={(formRenderProps) => (
                  <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Field
                          id={"amount"}
                          name={"amount"}
                          label={"Amount*"}
                          format={"c"}
                          placeholder={"$ Enter Amount"}
                          component={FormNumericTextBox}
                          validator={startingBalanceValidator}
                          wrapperstyle={{
                            width: "60%",
                            marginRight: "10px",
                          }}
                          step={0}
                          min={0}
                          spinners={false}
                        />

                        <Field
                          id={"startDate"}
                          name={"startDate"}
                          label={"Start Date*"}
                          component={FormDatePicker}
                          validator={activeDateValidator}
                        />
                      </div>
                        <Field
                          id={"notes"}
                          name={"notes"}
                          label={"Notes"}
                          component={FormTextArea}
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
        </>
      )}
    </>
  );
}
