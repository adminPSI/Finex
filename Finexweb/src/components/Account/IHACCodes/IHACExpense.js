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
  trashIcon,
} from "@progress/kendo-svg-icons";
import React, { useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  ConfigurationEndPoints,
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
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../NotificationHandler/NotificationHandler";
import {
  accountDropdownValidator,
  activeDateValidator,
  departmentDropdownValidator,
  programDropdownValidator,
  startingAllBalanceValidator,
  startingBalanceValidator,
  subAccountDropdownValidator
} from "../../validators";

export default function IHACExpense() {
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
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageTotal, setPageTotal] = React.useState();
  const [, setsearchText] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [SACDisplay, setSACDisplay] = useState(false);
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = React.useState(0);
  const [CACDDList, setCACDDList] = React.useState([]);
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

  React.useEffect(() => {
    setshowInactive(false);
    setShow(false);
    setBindIHACExpenseGrid({
      isActive: "Y",
      cskip: 0,
      ctake: 10,
    });
    BindProgramDropdown();
    BindDepartmentDropdown();
    BindAccountDropdown();
    BindSubAccountDropdown();
    BindExpenseDropdown();
    getSACConfig();
  }, []);

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const [showInactive, setshowInactive] = useState(false);

  const onInactiveCheckBox = (event) => {
    setShow(false);
    let iactive = showInactive ? "Y" : "N";
    setBindIHACExpenseGrid({
      ...bindIHACExpenseGrid,
      isActive: iactive,
    });
  };
  // Sorting changes
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  // Sorting changes
  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setSort(event.sort);
    setBindIHACExpenseGrid({
      ...bindIHACExpenseGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindIHACExpenseGrid, setBindIHACExpenseGrid] = useState(null);

  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (bindIHACExpenseGrid) {
        BindIHACExpenseGrid(
          bindIHACExpenseGrid.ihacCode,
          bindIHACExpenseGrid.description,
          bindIHACExpenseGrid.stateAccountCode,
          bindIHACExpenseGrid.countyAccountCode,
          bindIHACExpenseGrid.program,
          bindIHACExpenseGrid.department,
          bindIHACExpenseGrid.account,
          bindIHACExpenseGrid.subAccount,
          bindIHACExpenseGrid.isActive,
          bindIHACExpenseGrid.startDate,
          bindIHACExpenseGrid.search,
          bindIHACExpenseGrid.cskip,
          bindIHACExpenseGrid.ctake == "All" ? 0 : bindIHACExpenseGrid.ctake,
          bindIHACExpenseGrid.desc,
          bindIHACExpenseGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindIHACExpenseGrid]);

  const getSACConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/4",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setSACDisplay(value);
      })
      .catch(() => { });
  };

  //Function to Get Funds Grid Data
  const BindIHACExpenseGrid = (
    ihacCode = "",
    description = "",
    stateAccountCode = "",
    countyAccountCode = "",
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
      Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code;
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
        "&&countyAccountCode=" +
        countyAccountCode +
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
        `&&typeCode= ${accountingTypeCode}` +
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
          bindIHACExpenseGrid.isActive &&
          bindIHACExpenseGrid.isActive == isActive
        ) {
          setshowInactive(isActive == "N" ? true : false);
        }
      })
      .catch(() => { });
  };
  const BindExpenseDropdown = () => {
    axiosInstance({
      method: "GET",
      url: ExpenseEndPoints.GetExpenseCodeList,
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
      .catch(() => { });
  };
  const BindProgramDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCProgramList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.filter((x) => x.expenseCheck == "Y");
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
      .catch(() => { });
  };

  const BindDepartmentDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCDepartmentList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.filter((x) => x.expenseCheck == "Y");
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
      .catch(() => { });
  };

  const BindAccountDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCAccountList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.filter((x) => x.expenseCheck == "Y");
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
      .catch(() => { });
  };

  const BindSubAccountDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCSubAccountList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.filter((x) => x.expenseCheck == "Y");
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
      .catch(() => { });
  };

  // Event for Funds Grid Change Filters
  const filterChange = (event) => {
    var ihacCode = "";
    var description = "";
    var stateAccountCode = "";
    var countyAccountCode = "";
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
        if (
          event.filter.filters[i].field == "accountingCode.countyExpenseCode"
        ) {
          countyAccountCode = event.filter.filters[i].value;
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
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindIHACExpenseGrid({
      ...bindIHACExpenseGrid,
      search: undefined,
      ihacCode: ihacCode,
      description: description,
      stateAccountCode: stateAccountCode,
      countyAccountCode: countyAccountCode,
      program: program,
      department: department,
      account: account,
      subAccount: subAccount,
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
      setBindIHACExpenseGrid({
        ...bindIHACExpenseGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindIHACExpenseGrid({
        ...bindIHACExpenseGrid,
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
    setBindIHACExpenseGrid({
      ...bindIHACExpenseGrid,
      ihacCode: undefined,
      description: undefined,
      stateAccountCode: undefined,
      countyAccountCode: undefined,
      program: undefined,
      department: undefined,
      account: undefined,
      subAccount: undefined,
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

  const handleCSCA = () => {
    axiosInstance({
      method: "POST",
      url: IHACExpenseCodeEndPoints.CalculateCarryoverAmounts,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification(
          "Calculate IHPO carryover amounts successfully"
        );
      })
      .catch(() => { });
  };

  const handleRCSA = () => {
    axiosInstance({
      method: "POST",
      url: IHACExpenseCodeEndPoints.ReCalculateCarryoverAdjustment,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification(
          "Recalculate carryover adjustments successfully"
        );
      })
      .catch(() => { });
  };

  //Event to Submit add fund Popup Data change later
  const addferFundHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    if (dataItem.balance < (dataItem?.startingBalance || 0)) {
      showErrorNotification(
        "Allocation amount should be lower than CAC total balance"
      );
    } else {
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
          typeCode:
            Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code,
          countyAccountingCode: dataItem?.countyAccountingCode?.id,
          stateAccountingCode: dataItem.stateAccountingCode || "",
          programAccountingCode: dataItem.ProgramDropdown.id,
          ihcAccountCode: dataItem.AccountDropdown.id,
          departmentAccountingCode: dataItem.DepartmentDropdown.id,
          subAccountAccountingCode: dataItem.SubAccountDropdown.id,
          startDate: dataItem.activeDate,
          isActive: "Y",
          revenueInd: "N",
          expenseInd: "Y",
          salaryInd: "N",
        };

        axiosInstance({
          method: "PUT",
          url: IHACExpenseCodeEndPoints.EditDeleteIAHCById + dataItem.id,
          data: apirequest,
          withCredentials: false,
        })
          .then((response) => {
            setshowInactive(false);
            setShow(false);
            setBindIHACExpenseGrid({
              ...bindIHACExpenseGrid,
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
            Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code,
          countyAccountingCode: dataItem?.countyAccountingCode?.id,
          stateAccountingCode: dataItem.stateAccountingCode || "",
          programAccountingCode: dataItem.ProgramDropdown.id,
          ihcAccountCode: dataItem.AccountDropdown.id,
          departmentAccountingCode: dataItem.DepartmentDropdown.id,
          subAccountAccountingCode: dataItem.SubAccountDropdown.id,
          startDate: dataItem.activeDate,
          isActive: "Y",
          revenueInd: "N",
          expenseInd: "Y",
          salaryInd: "N",
        };

        axiosInstance({
          method: "POST",
          url: IHACExpenseCodeEndPoints.AddIHAC,
          data: apirequest,
          withCredentials: false,
        })
          .then((response) => {
            if (dataItem.startingBalance > 0) {
              let IHACAllocationRequest = {
                id: 0,
                ihacCodeId: response.data.id,
                amount: dataItem.startingBalance,
                typeCode: Constants.IHACExpenseAmountTypeCode.Allocation.code,
                startDate: dataItem.activeDate,
              };

              axiosInstance({
                method: "POST",
                url: IHACExpenseCodeEndPoints.AddIHACExpenseAmount,
                data: IHACAllocationRequest,
                withCredentials: false,
              })
                .then((response) => {
                  setshowInactive(false);
                  setShow(false);
                  setBindIHACExpenseGrid({
                    isActive: "Y",
                    cskip: 0,
                    ctake: 10,
                    desc: true,
                    sortKey: "modifiedDate",
                  });
                })
                .catch(() => { });
            } else {
              setshowInactive(false);
              setShow(false);
              setBindIHACExpenseGrid({
                isActive: "Y",
                cskip: 0,
                ctake: 10,
                desc: true,
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
    }
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
      typeCode: Constants.IHACExpenseAmountTypeCode.Allocation.code,
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
        showSuccessNotification("Amount added successfully");
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
            setBindIHACExpenseGrid({
              ...bindIHACExpenseGrid,
            });
            inactiveToggleDialog();
            showSuccessNotification("IHAC expense inactivated successfully");
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

  const getCashBalance = (id) => {
    axiosInstance({
      method: "GET",
      url: IHACExpenseCodeEndPoints.GetIHACDetailList.replace("#ID#", id),
      withCredentials: false,
    })
      .then((response) => {
        let cashBalance = response.data;
        if (cashBalance.length > 1) {
          cashBalance.sort(
            (a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate)
          );
        }
        let data = IHACData.slice();
        let index = data.findIndex((d) => d.id == id);

        if (index >= 0) {
          data[index].details = cashBalance;
        }
        setIHACData(data);
      })
      .catch(() => { });
  };

  const ddlProgramhandleChange = async (formRenderProps) => {
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

  const InnerGridCashBalanceToggleDialog = () => {
    setInnerCashBalncedialogVisible(!innerCashBalncedialogVisible);
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
      .catch(() => { });
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
        showSuccessNotification("Amount added successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };
  const handleCloseMenuInnerGrid = () => {
    setInnerGridShow(false);
    setselectedCashBalanceId(0);
  };

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

  //Event to Bind DetailComponent of fund grid
  const DetailComponent = (props) => {
    const data = props.dataItem.details;
    if (data && Object.keys(data).length > 0) {
      data.map((item) => {
        item["type"] = item.typeCode
          ? getCountyExpenseAmountType(item.typeCode)
          : "";
      });
      return (
        <>
          {checkPrivialgeGroup("IHACEG", 1) && (
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
                className="!k-text-left"
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
            {checkPrivialgeGroup("EditIHACEAmountCM", 3) && (
              <MenuItem
                text="Edit"
                data={{
                  action: "edit",
                }}
                svgIcon={eyedropperIcon}
              />
            )}
            {checkPrivialgeGroup("DeleteIHACEAmountCM", 4) && (
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
          }).then((response) => {
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

            data.startingBalance = data?.startingBalance;
            data.activeDate = new Date(data.startDate);

            data.ProgramCodeInput = data.ProgramDropdown?.code;
            data.DepartmentCodeInput = data.DepartmentDropdown?.code;
            data.SubAccountCodeInput = data.SubAccountDropdown?.code;
            data.AccountCodeInput = data.AccountDropdown?.code;
            data.edit = true;
            if (data?.countyAccountingCode?.id) {
              axiosInstance({
                method: "Get",
                url: budgetamountEndPoints.TotalBudgetAmount.replace(
                  "#AccountingCodeId#",
                  data?.countyAccountingCode?.id
                ),
                withCredentials: false,
              }).then((response) => {
                let budgetData = response.data;
                data.balance = budgetData.balance;
                data.CACAllocation = budgetData.amount;
                setFormInit(data);
                setFormKey(formKey + 1);
              });
            } else {
              setFormInit(data);
              setFormKey(formKey + 1);
            }
            setAddIHACVisible(!addIHACVisible);
          });
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

  const formRef = useRef();
  const [visible, setVisible] = React.useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const [, setSacCode] = React.useState("");
  const getSacCode = (sac) => {
    setSacCode(sac);
    formRef.current.valueSetter("stateAccountingCode", sac);
    formInit.stateAccountingCode = sac;
  };

  const { checkPrivialgeGroup, loading, error } = usePrivilege('IHAC Expense')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("IHACEM", 1) && (
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
                IHAC Expense Allocation
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>IHAC Expense Allocation</h3>
            </div>
            <div className="col-sm-4 text-end">
              {checkPrivialgeGroup("AddIHACExpenseB", 2) && (
                <Button themeColor={"primary"} onClick={addIAHCToggleDialog}>
                  <i className="fa-solid fa-plus"></i> Add IHAC Expense Code
                </Button>
              )}
            </div>
          </div>

          <div className="row d-flex justify-content-end">
            <div className="col-sm-8 text-end">
              {checkPrivialgeGroup("CalculateIHACExpenseCarryoverB", 2) && (
                <Button
                  style={{
                    margin: "5px",
                  }}
                  onClick={handleCSCA}
                >
                  Calculate IHPO Carryover Amounts
                </Button>
              )}
              {checkPrivialgeGroup("RecalculateCarryoverAdjustmentB", 2) && (
                <Button
                  style={{
                    margin: "5px",
                  }}
                  onClick={handleRCSA}
                >
                  Recalculate Carryover Adjustments
                </Button>
              )}
            </div>
          </div>
          {checkPrivialgeGroup("IHACEG", 1) && (
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
                dataItemKey={"id"}
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
                        {checkPrivialgeGroup("ShowIHACEInactiveCB", 1) && (
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
                        {checkPrivialgeGroup("SMIIHACECB", 1) && (
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
                <Column field="accountingCode.countyExpenseCode" title="CAC" />
                {SACDisplay && (
                  <Column field="stateAccountingCode" title="SAC" />
                )}
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
                {checkPrivialgeGroup("EditIHACExpenseCM", 3) &&
                  !showInactive && (
                    <MenuItem
                      text="Edit Expense"
                      data={{
                        action: "edit",
                      }}
                      svgIcon={eyedropperIcon}
                    />
                  )}
                {checkPrivialgeGroup("MakeIHACEInactiveCM", 2) &&
                  !showInactive && (
                    <MenuItem
                      text="Make Expense Inactive"
                      data={{
                        action: "inactive",
                      }}
                      svgIcon={eyeSlashIcon}
                    />
                  )}
                {checkPrivialgeGroup("AddIHACEAmountCM", 2) &&
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
                      ? "Edit Expense Code"
                      : "Add New IHAC Expense Code"}
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
                        label={"IHAC Code"}
                        placeholder={"IHAC Code"}
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
                          label={"County Expense Code"}
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
                            width: "40%",
                            marginRight: "10px",
                          }}
                        />
                        <Field
                          id={"CACAllocation"}
                          name={"CACAllocation"}
                          label={"Total"}
                          placeholder={"Total"}
                          component={FormInput}
                          wrapperstyle={{
                            width: "30%",
                            marginRight: "10px",
                          }}
                          disabled={true}
                        />
                        <Field
                          id={"balance"}
                          name={"balance"}
                          label={"Balance"}
                          placeholder={"Balance"}
                          component={FormInput}
                          wrapperstyle={{
                            width: "30%",
                          }}
                          disabled={true}
                        />
                      </div>
                      {SACDisplay && (
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
                      )}

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
                            label={"Allocation Amount"}
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
                            label={"Date"}
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
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        {formRenderProps.valueGetter("description")?.length ||
                          0}
                        /250
                      </span>
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
                  <i className="fa-solid fa-plus"></i>
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
                        label={"IHAC Code"}
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
                        maxLength={250}
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
                          label={"Amount*"}
                          format={"c"}
                          placeholder={"$ Enter Amount"}
                          component={FormNumericTextBox}
                          validator={startingAllBalanceValidator}
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
                  <span> Inactive IHAC Expense</span>
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
                        label={"Date*"}
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
                          Inactive Expense
                        </Button>
                      </div>
                    </fieldset>
                  </FormElement>
                )}
              />
            </Dialog>
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
          {visible && (
            <SacDialog
              toggleDialog={toggleDialog}
              getSacCode={getSacCode}
              type={7}
            >
              {" "}
            </SacDialog>
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
                          validator={startingAllBalanceValidator}
                          wrapperstyle={{
                            width: "60%",
                            marginRight: "10px",
                          }}
                          step={0}
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
