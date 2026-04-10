import { orderBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  GridColumn as Column,
  getSelectedState,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import {
  eyedropperIcon,
  eyeSlashIcon,
  plusOutlineIcon,
  trashIcon,
} from "@progress/kendo-svg-icons";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  ExpenseEndPoints,
  FundEndPoints
} from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import Constants from "../../common/Constants";
import {
  getCountyExpenseAmountType,
  handleDropdownSearch,
} from "../../common/Helper";
import {
  ColumnDatePicker,
  FormDatePicker,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
  FormRadioGroup,
  FormTextArea
} from "../../form-components";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../NotificationHandler/NotificationHandler";
import {
  currentDateValidator,
  ddlExpenseCodeValidator,
  ddlFundValidator,
  descriptionValidator,
  expenseAmountTypeValidator,
  expenseCodeValidator,
  startingAllBalanceValidator,
  startingBalanceValidator,
  transferAmtValidator
} from "../../validators";

const myCustomDateCell = (props) => {
  var myDate = props.dataItem.startDate;
  const [year, month, day] = myDate.split("T")[0].split("-");
  return <td>{`${month}/${day}/${year} `}</td>;
};

const radioData = [
  {
    label: "Allocation",
    value: 3,
  },
  {
    label: "Carryover",
    value: 5,
  },
];

const checkboxs = [
  Constants.CountyExpenseAmountTypeCode.Allocation.title,
  Constants.CountyExpenseAmountTypeCode.Transfer.title,
  Constants.CountyExpenseAmountTypeCode.Carryover.title,
];

export default function ExpenseCode() {
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
  const [lineItemfilter, setLineItemfilter] = React.useState();
  const [showFilter, setshowFilter] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [InnerGridshow, setInnerGridShow] = React.useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [addExpenseVisible, setAddExpenseVisible] = React.useState(false);
  const [InnerExpenseVisible, setInnerExpenseVisible] = React.useState(false);
  const [transferExpenseVisible, setTransferExpenseVisible] =
    React.useState(false);
  const [formInit, setFormInit] = useState();
  const [formKey, setFormKey] = useState(1);
  const [TransferformKey,] = useState(1);
  const [FundDropdownData, setFundDropdownData] = useState([]);
  const [ExpenseFromCodeDropdownData, setExpenseFromCodeDropdownData] =
    useState([]);
  const [ExpenseToCodeDropdownData, setExpenseToCodeDropdownData] = useState(
    []
  );
  const [InnerGridformInit, setInnerGridformInit] = useState([]);
  const [FundList, setFundsList] = useState([]);
  const [, setFundDate] = React.useState();
  const [inactiveFormInit, setInactiveFormInit] = useState([{}]);
  const [showInactive, setshowInactive] = useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [, setState] = React.useState({
    value: {
      text: "Select Fund",
      id: 0,
    },
  });
  const [stateTo, setStateTo] = React.useState({
    value: {
      text: "Select Expense Code",
      id: 0,
    },
  });
  const [stateFrom, setStateFrom] = React.useState({
    value: {
      text: "Select Expense Code",
      id: 0,
    },
  });
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const offsetInnerGrid = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = React.useState(0);
  const [selectedAccountingId, setselectedAccountingId] = React.useState(0);
  const [InactiveFundvisible, setInactiveFundvisible] = useState(false);
  const [cashFormInit, setCashFormInit] = useState([]);
  const [addCashVisible, setAddCashVisible] = React.useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [, setTransferFromBalance] = React.useState();
  const [, setTransferToBalance] = React.useState();
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [FilterFundDropdownData, setFilterFundDropdownData] = useState("");
  const [searchTransferFrom, setSearchTransferFrom] = useState("");
  const [searchTransferFromData, setSearchTransferFromData] = useState("");

  const [searchTransferTo, setSearchTransferTo] = useState("");
  const [searchTransferToData, setSearchTransferToData] = useState("");
  const [bindExpenseGrid, setBindExpenseGrid] = useState(null);

  const handleFilterChangeFrom = (event) => {
    if (event) {
      setSearchTransferFrom(event.filter.value);
    }
  };

  const handleFilterChangeTo = (event) => {
    if (event) {
      setSearchTransferTo(event.filter.value);
    }
  };

  const searchableField = ["text"];
  useEffect(() => {
    const result = handleDropdownSearch(
      ExpenseFromCodeDropdownData,
      searchableField,
      searchTransferFrom
    );
    setSearchTransferFromData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTransferFrom]);

  useEffect(() => {
    const result = handleDropdownSearch(
      ExpenseToCodeDropdownData,
      searchableField,
      searchTransferTo
    );
    setSearchTransferToData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTransferTo]);

  const onFilterChange = (event) => {
    let searchText = event.filter.value;
    setDropdownSearch(searchText);
  };

  const searchableFieldForFund = ["fundCode", "fundName"];

  React.useEffect(() => {
    const result = handleDropdownSearch(
      FundDropdownData,
      searchableFieldForFund,
      dropdownSearch
    );
    setFilterFundDropdownData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownSearch]);

  const transferColumns = [
    {
      field: "text",
      header: "Expense Code",
      width: "300px",
    },
  ];

  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];

  const [sort, setSort] = useState(initialSort);

  const fundColumns = [
    {
      field: "fundCode",
      header: "Fund Code",
      width: "150px",
    },
    {
      field: "fundName",
      header: "Fund Name",
      width: "300px",
    },
  ];

  const onInactiveCheckBox = (event) => {
    setShow(false);
    let iactive = showInactive ? "Y" : "N";
    setBindExpenseGrid({
      isActive: iactive,
      cskip: 0,
      ctake: page.ctake,
    });
  };

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  React.useEffect(() => {
    setshowInactive(false);
    setShow(false);
    setBindExpenseGrid({
      ...bindExpenseGrid,
      isActive: "Y",
    });
    BindFundGrid();
    BindExpenseCodesDropdown();
  }, []);


  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setSort(event.sort);
    setBindExpenseGrid({
      ...bindExpenseGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindExpenseGrid) {
        BindExpenseGrid(
          bindExpenseGrid.code,
          bindExpenseGrid.description,
          bindExpenseGrid.fundCode,
          bindExpenseGrid.isActive,
          bindExpenseGrid.startDate,
          bindExpenseGrid.search,
          bindExpenseGrid.cskip,
          bindExpenseGrid.ctake == "All" ? 0 : bindExpenseGrid.ctake,
          bindExpenseGrid.desc,
          bindExpenseGrid.sortKey,
          bindExpenseGrid.inactiveDate
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindExpenseGrid]);

  const BindExpenseGrid = (
    code = "",
    description = "",
    fundCode = "",
    isActive = "",
    startDate = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate",
    inactiveDate = ""
  ) => {
    const accountingcode =
      Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code;
    axiosInstance({
      method: "Post",
      url:
        ExpenseEndPoints.GetAccountingCodesFilter +
        `accountingcodetype=${accountingcode}` +
        "&&description=" +
        description +
        "&&code=" +
        code +
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
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey +
        "&&fundCode=" +
        fundCode +
        "&&inactiveDate=" +
        inactiveDate,
      withCredentials: false,
    })
      .then((response) => {
        setExpenseData();
        let data = response.data.data;
        setPageTotal(response.data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: response.data.total,
          });
        }
        data = data.map((element) => {
          if (element.endDate) {
            element.endDate = new Date(element.endDate);
          }
          return element;
        });
        setExpenseData(data);
        if (bindExpenseGrid.isActive && bindExpenseGrid.isActive == isActive) {
          setshowInactive(isActive == "N" ? true : false);
        }
      })
      .catch(() => { });
  };
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
  //Function to Get Funds Grid Data
  const BindFundGrid = (search = "") => {
    axiosInstance({
      method: "Post",
      url:
        FundEndPoints.GetFundListWithFilter +
        `code=${search}&&fundName=&&isActive=Y&&search=&&skip=0&&take=0`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data?.fundCode,
            id: data.id,
          };
          itemsData.push(items);
        });
        setFundsList(data);
        let fundDropdownList = data.sort((a, b) => a.fundCode - b.fundCode);
        setFundDropdownData(fundDropdownList);
      })
      .catch(() => { });
  };
  const BindExpenseCodesDropdown = () => {
    axiosInstance({
      method: "GET",
      url: ExpenseEndPoints.GetAccountingCodesList.replace(
        "#AccountingTypeCode#",
        Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code
      ),
      withCredentials: false,
    })
      .then((response) => {
        let items = [];
        response.data.forEach((expense) => {
          if (expense.isActive == "Y") {
            items.push({ id: expense.id, text: expense.countyExpenseCode });
          }
        });
        setExpenseFromCodeDropdownData(items);
      })
      .catch(() => { });
  };
  const ddlExpenseFromHandleChange = async (event) => {
    let transferFrom = event.target.value;
    let transferto = ExpenseFromCodeDropdownData.filter(
      (expense) => expense?.id !== transferFrom?.id
    );
    setExpenseToCodeDropdownData(transferto);

    setStateFrom({
      value: event.target.value,
    });
  };

  //Event for Transfer To dropdown of Transfer fund popup
  const ddlExpenseToHandleChange = async (event) => {
    setStateTo({
      value: event.target.value,
    });
  };

  const handleCSCA = () => {
    axiosInstance({
      method: "POST",
      url: FundEndPoints.CalculateCarryoverAmounts,
      withCredentials: false,
    })
      .then((response) => {
        setshowInactive(false);
        setShow(false);
        showSuccessNotification("Calculated and Stored Carryover Amounts");
      })
      .catch(() => { });
  };

  const expandChange = (event) => {
    let newData = expenseData.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setExpenseData(newData);
    event.dataItem.expanded = event.value;
    setExpenseData([...expenseData]);
    if (!event.value || event.dataItem.amountDetails) {
      return;
    }

    setselectedRowId(event.dataItem.id);

    let id = event.dataItem.id;
    getExpenseCodeBalancesDetail(id);
  };

  const [selectedState,] = useState({});
  const DATA_ITEM_KEY = "countyExpenseCode";

  const onSelectionChange = (event) => {
    handleCloseMenuInnerGrid();
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    let expenseId;
    let newData = expenseData.map((item) => {
      if (item.countyExpenseCode == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
        expenseId = item.id;
        setselectedRowId(expenseId);

        getExpenseCodeBalancesDetail(expenseId);
      } else {
        item.expanded = false;
      }
      return item;
    });
    setExpenseData(newData);
  };

  const getExpenseCodeBalancesDetail = (id) => {
    axiosInstance({
      method: "GET",
      url: ExpenseEndPoints.GetBudgetAmount.replace("#AccountingCodeId#", id),
      withCredentials: false,
    })
      .then((response) => {
        let cashBalance = response.data;
        if (cashBalance.length > 0) {
          cashBalance.sort(
            (a, b) => new Date(b.startDate) - new Date(a.startDate)
          );
          let data = expenseData.slice();
          let index = data.findIndex((d) => d.id == id);
          if (index >= 0) {
            data[index].details = cashBalance;
          }
          setExpenseData(data);
        } else {
          let data = expenseData.slice();
          let index = data.findIndex((d) => d.id == id);
          if (index >= 0) {
            data[index].details = {};
          }
          setExpenseData(data);
        }
      })
      .catch(() => { });
  };

  const filterLineChange = (event) => {
    setLineItemfilter(event.value);
  };

  const filterChange = (event) => {
    var code = "";
    var description = "";
    var fundCode = "";
    var startDate = "";
    var inactiveDate = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "countyExpenseCode") {
          code = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "countyExpenseDescription") {
          description = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "fund.fundCode") {
          fundCode = event.filter.filters[i].value;
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
        if (event.filter.filters[i].field == "endDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          inactiveDate = date;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindExpenseGrid({
      ...bindExpenseGrid,
      cskip: 0,
      search: undefined,
      code: code,
      description: description,
      fundCode: fundCode,
      startDate: startDate,
      inactiveDate: inactiveDate,
    });
    setFilter(event.filter);
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  //Open Transfer Expense Popup
  const transferExpenseToggleDialog = () => {
    setTransferFromBalance();
    setTransferToBalance();
    setStateFrom({});
    setStateTo({});
    setTransferExpenseVisible(!transferExpenseVisible);
  };
  //Event of grid page change
  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindExpenseGrid({
        ...bindExpenseGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindExpenseGrid({
        ...bindExpenseGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: expenseData.length,
      });
    }
  };
  //Event to Submit transfer fund Popup Data
  const transferExpenseHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    if (dataItem.transferFrom.id == dataItem.transferTo.id) {
      showErrorNotification("Transfer from and transfer to should not be same");
    } else {
      let apirequest = {
        fromExpenseId: dataItem.transferFrom.id,
        toExpenseId: dataItem.transferTo.id,
        amount: dataItem.transferAmount,
        date: dataItem.date,
        transferTypeCode: Constants.CountyExpenseAmountTypeCode.Transfer.code,
      };
      setSearchTransferTo("");
      setSearchTransferFrom("");
      setDropdownSearch("");
      axiosInstance({
        method: "POST",
        url: ExpenseEndPoints.TransferAmount,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          if (response?.data == "True") {
            setshowInactive(false);
            setShow(false);
            setBindExpenseGrid({
              ...bindExpenseGrid,
            });
            transferExpenseToggleDialog();
            showSuccessNotification("Amount transferred successfully");
          }
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    }
  };

  const addExpenseCodeHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let apirequest = {
      id: dataItem.id,
      fundId: dataItem.fund.id,
      orgAccountId: 6,
      countyExpenseCode: dataItem.countyExpenseCode,
      countyExpenseDescription: dataItem.countyExpenseDescription,
      typeCode:
        Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code,
      startDate: dataItem.startDate,
      isActive: "Y",
    };
    setSearchTransferTo("");
    setSearchTransferFrom("");
    setDropdownSearch("");
    axiosInstance({
      method: "POST",
      url: ExpenseEndPoints.AddExpense,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        if (dataItem.id == undefined && dataItem.startingBalance > 0) {
          let budgetamountRequest = {
            id: 0,
            accountingCodeId: response.data.id,
            amount: dataItem.startingBalance,
            typeCode: Constants.CountyExpenseAmountTypeCode.Allocation.code,
            startDate: response.data.startDate,
          };
          axiosInstance({
            method: "POST",
            url: ExpenseEndPoints.AddBudgetAmount.replace(
              "#AccountingCodeId#",
              budgetamountRequest.accountingCodeId
            ),
            data: budgetamountRequest,
            withCredentials: false,
          })
            .then((response) => {
              setFormInit([]);
              setState({
                value: {
                  text: "Select Fund",
                  id: 0,
                },
              });
            })
            .catch(() => { });
        }
        setFormInit([]);
        BindExpenseCodesDropdown();
        setshowInactive(false);
        setShow(false);
        if (dataItem.id) {
          setBindExpenseGrid({
            ...bindExpenseGrid,
          });
        } else {
          setBindExpenseGrid({
            isActive: "Y",
            cskip: 0,
            ctake: 10,
          });
        }
        showSuccessNotification(
          `Expense code ${dataItem.id ? "updated" : "added"} successfully`
        );
        addExpenseToggleDialog();
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const InnerGridHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let budgetamountRequest = {
      id: dataItem.id,
      accountingCodeId: dataItem.accountingCodeId,
      amount: dataItem.amount,
      typeCode: Constants.CountyExpenseAmountTypeCode.Allocation.code,
      startDate: dataItem.startDate,
      notes:dataItem.notes
    };
    axiosInstance({
      method: "POST",
      url: ExpenseEndPoints.AddBudgetAmount.replace(
        "#AccountingCodeId#",
        budgetamountRequest.accountingCodeId
      ),
      data: budgetamountRequest,
      withCredentials: false,
    })
      .then((response) => {
        setInnerGridformInit([]);
        getExpenseCodeBalancesDetail(budgetamountRequest.accountingCodeId);
        InnerExpenseToggleDialog();
        showSuccessNotification("Amount added successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const InvactivateExpenseOnClick = (data, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let inaactivateDate = data.inactiveFormDate;
    var dataItem = inactiveFormInit;
    let apirequest = {
      id: dataItem.id,
      fundId: dataItem.fund.id,
      orgAccountId: 6,
      countyExpenseCode: dataItem.countyExpenseCode,
      countyExpenseDescription: dataItem.countyExpenseDescription,
      typeCode: dataItem.typeCode,
      startDate: dataItem.startDate,
      endDate: inaactivateDate,
      isActive: "N",
    };

    axiosInstance({
      method: "POST",
      url: ExpenseEndPoints.AddExpense,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        setshowInactive(false);
        setShow(false);
        setBindExpenseGrid({
          ...bindExpenseGrid,
        });
        toggleDialog();
        showSuccessNotification("expense code inactived successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const ddlhandleChange = (event) => {
    FundList?.forEach((fund) => {
      if (fund?.fundCode == event.target.value?.fundCode) {
        setFundDate(new Date(fund.activeDate));
      }
    });
    setState({
      value: event.target.value,
    });
  };
  const addExpenseToggleDialog = () => {
    if (addExpenseVisible) {
      setFormInit([]);
      setState({
        value: {
          text: "Select Fund",
          id: 0,
        },
      });
    }
    setAddExpenseVisible(!addExpenseVisible);
  };
  const InnerExpenseToggleDialog = () => {
    setInnerExpenseVisible(!InnerExpenseVisible);
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
  const handleInnerGridContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedAccountingId(e.currentTarget.id);
    offsetInnerGrid.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setInnerGridShow(true);
  };
  //close ContextMenu for fund Grid
  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };
  const handleCloseMenuInnerGrid = () => {
    setInnerGridShow(false);
    setselectedAccountingId(0);
  };
  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          axiosInstance({
            method: "GET",
            url: ExpenseEndPoints.GetAccountingCodesByID + id,
            withCredentials: false,
          }).then((response) => {
            let data = response.data[0];
            let convertDate = new Date(data.startDate);
            data.startDate = convertDate;
            setState({ value: data.fundId });
            axiosInstance({
              method: "GET",
              url: ExpenseEndPoints.GetBudgetAmount.replace(
                "#AccountingCodeId#",
                id
              ),
              withCredentials: false,
            })
              .then((response) => {
                let transferBalance = response.data[0]?.amount || 0;
                data.startingBalance = transferBalance;
                setFormInit(data);
                setFormKey(formKey + 1);
                addExpenseToggleDialog();
              })
              .catch(() => { });
          });
          break;
        case "inactive":
          axiosInstance({
            method: "GET",
            url: ExpenseEndPoints.GetAccountingCodesByID + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data[0];
              data.inactiveDate = new Date();
              data.isActive = "N";
              setInactiveFormInit(data);
              toggleDialog();
            })
            .catch(() => { });
          break;

        case "AddCashBalance":
          axiosInstance({
            method: "GET",
            url: ExpenseEndPoints.GetAccountingCodesByID + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data[0];
              data.amount = "";
              data.activeDate = "";
              data.typeCode = radioData[0].value;
              data.startDate = response.data.startDate;
              data.modifiedDate = response.data.modifiedDate;
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
  const handleOnSelectInnerGrid = (e) => {
    let id = selectedAccountingId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          axiosInstance({
            method: "GET",
            url: ExpenseEndPoints.GetBudgetAmountByID.replace("#budgetID#", id),
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.startDate = new Date(data.startDate);
              setInnerGridformInit(data);
              InnerExpenseToggleDialog();
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
    let id = selectedAccountingId;

    axiosInstance({
      method: "Delete",
      url: ExpenseEndPoints.GetBudgetAmountByID.replace("#budgetID#", id),
      withCredentials: false,
    })
      .then((response) => {
        getExpenseCodeBalancesDetail(selectedRowId);
        toggleDeleteDialog();
      })
      .catch(() => { });
  };
  //Click Event bind ContextMenu for fund Grid
  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };
  const handleInnerGridContextMenu = (props) => {
    handleInnerGridContextMenuOpen(props);
  };

  const toggleDialog = () => {
    setInactiveFundvisible(!InactiveFundvisible);
  };
  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };
  const addCashToggleDialog = () => {
    setAddCashVisible(!addCashVisible);

    if (addCashVisible) {
      setCashFormInit([]);
    }
  };

  //Event to Submit add CashBalace Popup Data
  const addCashBalHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let budgetamountRequest = {
      id: 0,
      accountingCodeId: dataItem.id,
      amount: dataItem.amount,
      typeCode: dataItem.typeCode,
      startDate: dataItem.startDate,
      notes:dataItem.notes
    };
    axiosInstance({
      method: "POST",
      url: ExpenseEndPoints.AddBudgetAmount.replace(
        "#AccountingCodeId#",
        budgetamountRequest.accountingCodeId
      ),
      data: budgetamountRequest,
      withCredentials: false,
    })
      .then((response) => {
        addCashToggleDialog();
        getExpenseCodeBalancesDetail(budgetamountRequest.accountingCodeId);
        showSuccessNotification("Amount added successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  //Custom Cell to bind ContextMenu for Grid
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
  const InnerGridCommandCell = (props) => {
    const data = props.dataItem;

    if (data.type == "Transfer") {
      return <td className="k-command-cell"></td>;
    } else {
      return (
        <>
          <td className="k-command-cell">
            <Button
              id={props.dataItem.id}
              onClick={handleInnerGridContextMenu}
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
    }
  };

  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindExpenseGrid({
      ...bindExpenseGrid,
      cskip: 0,
      code: undefined,
      description: undefined,
      fundCode: undefined,
      startDate: undefined,
      inactiveDate: undefined,
      search: value,
    });
  };

  const DetailComponent = (props) => {
    const data = props.dataItem.details;
    if (data && Object.keys(data).length > 0) {
      data.map((item) => {
        item["type"] = getCountyExpenseAmountType(item.typeCode);
      });
      let filterData = data;
      if (lineItemfilter !== "select" && lineItemfilter) {
        filterData = data.filter((detail) => {
          return detail.type == lineItemfilter;
        });
      }

      return (
        <>
          <Grid
            resizable={true}
            data={filterData}
          >
            <GridToolbar>
              <div className="row  d-flex justify-content-end w-100">
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "end",
                  }}
                >
                  <Label
                    style={{
                      display: "flex",
                      marginRight: "5px",
                      alignItems: "center",
                    }}
                  >
                    Filter By Type
                  </Label>
                  <DropDownList
                    onChange={filterLineChange}
                    popupSettings={{ width: "auto" }}
                    value={lineItemfilter}
                    data={checkboxs.sort()}
                    defaultItem={"select"}
                  />
                </div>
              </div>
            </GridToolbar>

            <Column
              field="startDate"
              title="Date"
              filterable={false}
              cell={myCustomDateCell}
            />
            <Column
              field="amount"
              title="Amount"
              filterable={false}
              cell={myCustomAmtCell}
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
            />
            <Column field="type" title="Types" />
            <Column field="notes" title="Notes" />
            {!showInactive && (
              <Column cell={InnerGridCommandCell} filterable={false} />
            )}
          </Grid>
          <ContextMenu
            show={InnerGridshow}
            offset={offsetInnerGrid.current}
            onSelect={handleOnSelectInnerGrid}
            onClose={handleCloseMenuInnerGrid}
          >
            {checkPrivialgeGroup("EditCACEAmountCM", 3) && (
              <MenuItem
                text="Edit"
                data={{
                  action: "edit",
                }}
                svgIcon={eyedropperIcon}
              />
            )}
            {checkPrivialgeGroup("DeleteCACEAmountCM", 4) && (
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
  const { checkPrivialgeGroup, loading, error } = usePrivilege('CAC Expense Code')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("CACEM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Accounting
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                CAC Codes
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Expense Codes
              </li>
            </ol>
          </nav>
          <div className="row d-flex justify-content-between">
            <div className="col-sm-4 d-flex align-items-center">
              <h3>County Expense Code</h3>
            </div>
            <div className="col-sm-8 text-end">
              {checkPrivialgeGroup("CACECarryoverB", 1) && (
                <Button
                  style={{
                    margin: "5px",
                  }}
                  onClick={handleCSCA}
                >
                  Calculate carryover amounts
                </Button>
              )}
              {checkPrivialgeGroup("TransferCACEAmountB", 2) && (
                <Button
                  style={{
                    margin: "5px",
                  }}
                  onClick={transferExpenseToggleDialog}
                >
                  <i className="fa-solid fa-right-left "></i> Transfer Amounts
                </Button>
              )}
              {checkPrivialgeGroup("AddExpenseCodeB", 2) && (
                <Button themeColor={"primary"} onClick={addExpenseToggleDialog}>
                  <i className="fa-solid fa-plus"></i> Add Expense Code
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3">
            {checkPrivialgeGroup("CACEG", 1) && (
              <Grid
                resizable={true}
                data={orderBy(expenseData, sort)}
                detail={DetailComponent}
                expandField="expanded"
                onExpandChange={expandChange}
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
                        {checkPrivialgeGroup("ShowCACEInactiveCB", 1) && (
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

                        {checkPrivialgeGroup("SMICACECB", 1) && (
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

                <Column field="countyExpenseCode" title="Expense Code" />
                <Column field="countyExpenseDescription" title="Description" />
                <Column field="fund.fundCode" title="Fund Code" />
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
            )}
            <ContextMenu
              show={show}
              offset={offset.current}
              onSelect={handleOnSelect}
              onClose={handleCloseMenu}
            >
              {checkPrivialgeGroup("EditCACECM", 3) && !showInactive && (
                <MenuItem
                  text="Edit Expense Code"
                  data={{ action: "edit" }}
                  svgIcon={eyedropperIcon}
                />
              )}
              {checkPrivialgeGroup("MakeCACEInactiveCM", 2) &&
                !showInactive && (
                  <MenuItem
                    text="Make Expense Code Inactive"
                    data={{ action: "inactive" }}
                    svgIcon={eyeSlashIcon}
                  />
                )}
              {checkPrivialgeGroup("AddCACEAmountCM", 2) && !showInactive && (
                <MenuItem
                  text="Add Amount"
                  data={{ action: "AddCashBalance" }}
                  svgIcon={plusOutlineIcon}
                />
              )}
            </ContextMenu>
          </div>

          <div>
            {addExpenseVisible && (
              <Dialog
                width={500}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    {formInit?.id ? (
                      <span className="ms-2">
                        <i className="fa-solid fa-edit me-2"></i>Edit CAC
                        Expense Code
                      </span>
                    ) : (
                      <span className="ms-2">
                        <i className="fa-solid fa-add me-2"></i>Add New CAC
                        Expense Code{" "}
                      </span>
                    )}
                  </div>
                }
                onClose={addExpenseToggleDialog}
              >
                <Form
                  onSubmit={addExpenseCodeHandleSubmit}
                  initialValues={formInit}
                  key={formKey}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <Field
                          id={"CountyExpenseCode"}
                          name={"countyExpenseCode"}
                          label={"CAC Expense Code*"}
                          placeholder={
                            "Based on county auditor's chart of accounts listing"
                          }
                          component={FormInput}
                          validator={expenseCodeValidator}
                          disabled={formInit?.id ? true : false}
                          maxLength={50}
                        />

                        <Field
                          id={"CountyExpenseDescription"}
                          name={"countyExpenseDescription"}
                          label={"Description*"}
                          placeholder={
                            "Based on the title given by the auditors office"
                          }
                          component={FormTextArea}
                          validator={descriptionValidator}
                          maxLength={255}
                        />
                        <Field
                          id={"fund"}
                          name={"fund"}
                          label={"Fund*"}
                          textField="fundCode"
                          dataItemKey="fundCode"
                          component={FormMultiColumnComboBox}
                          data={
                            dropdownSearch || FilterFundDropdownData.length
                              ? FilterFundDropdownData
                              : FundDropdownData
                          }
                          columns={fundColumns}
                          placeholder="Based on existing funds"
                          onChange={ddlhandleChange}
                          validator={ddlFundValidator}
                          filterable={true}
                          onFilterChange={onFilterChange}
                        />

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          {!formInit?.id && (
                            <Field
                              id={"startingBalance"}
                              name={"startingBalance"}
                              label={"Amount"}
                              format={"c"}
                              placeholder={"$ Enter Amount"}
                              component={FormNumericTextBox}
                              disabled={formInit?.id ? true : false}
                              wrapperstyle={{
                                width: "60%",
                                marginRight: "10px",
                              }}
                              step={0}
                              min={0}
                              spinners={false}
                            />
                          )}

                          <Field
                            id={"startDate"}
                            name={"startDate"}
                            label={"Start Date*"}
                            component={FormDatePicker}
                            validator={currentDateValidator}
                            disabled={!formRenderProps.valueGetter("fund")}
                          />
                        </div>

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
          <>
            {InnerExpenseVisible && (
              <Dialog
                width={500}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-edit"></i>
                    <span className="ms-2">Edit Amount</span>
                  </div>
                }
                onClose={InnerExpenseToggleDialog}
              >
                <Form
                  onSubmit={InnerGridHandleSubmit}
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
                            spinners={false}
                            step={0}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"startDate"}
                            name={"startDate"}
                            label={"Start Date*"}
                            component={FormDatePicker}
                            validator={currentDateValidator}
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
          <>
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
                          id={"CountyExpenseCode"}
                          name={"countyExpenseCode"}
                          label={"CAC Expense Code*"}
                          placeholder={
                            "Based on county auditor's chart of accounts listing"
                          }
                          component={FormInput}
                          disabled={true}
                          maxLength={50}
                        />
                        <Field
                          id={"CountyExpenseDescription"}
                          name={"countyExpenseDescription"}
                          label={"Description"}
                          placeholder={
                            "Based on the title given by the auditors office"
                          }
                          component={FormInput}
                          disabled={true}
                          maxLength={255}
                        />
                        <Field
                          id={"typeCode"}
                          name={"typeCode"}
                          label={"Type"}
                          placeholder={""}
                          data={radioData}
                          layout={"horizontal"}
                          component={FormRadioGroup}
                          validator={expenseAmountTypeValidator}
                        />

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
                            spinners={false}
                            step={0}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />
                          <Field
                            id={"startDate"}
                            name={"startDate"}
                            label={"Date*"}
                            component={FormDatePicker}
                            validator={currentDateValidator}
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
          {InactiveFundvisible && (
            <Dialog
              title={<span>Please Provide Date and Confirm</span>}
              onClose={toggleDialog}
            >
              <Form
                onSubmit={InvactivateExpenseOnClick}
                initialValues={inactiveFormInit}
                key={1}
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
                          id={"inactiveFormDate"}
                          name={"inactiveFormDate"}
                          label={"Inactive Date*"}
                          component={FormDatePicker}
                          validator={currentDateValidator}
                        />
                      </div>

                      <div className="k-form-buttons">
                        <Button
                          themeColor={"secondary"}
                          className={"col-6"}
                          onClick={toggleDialog}
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
                Are you sure you want to delete?
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

          <>
            {transferExpenseVisible && (
              <Dialog
                width={500}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-right-left"></i>{" "}
                    <span className="ms-2">Transfer Expense</span>
                  </div>
                }
                onClose={transferExpenseToggleDialog}
              >
                <Form
                  onSubmit={transferExpenseHandleSubmit}
                  key={TransferformKey}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <div
                        >
                          <Field
                            id={"transferFrom"}
                            name={"transferFrom"}
                            label={"Transfer From*"}
                            textField="text"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            data={
                              searchTransferFrom ||
                                searchTransferFromData.length
                                ? searchTransferFromData
                                : ExpenseFromCodeDropdownData
                            }
                            value={stateFrom.value}
                            columns={transferColumns}
                            placeholder="Search Transfer From"
                            onChange={ddlExpenseFromHandleChange}
                            validator={ddlExpenseCodeValidator}
                            defaultValue={stateFrom.value}
                            filterable={true}
                            onFilterChange={handleFilterChangeFrom}
                            wrapperstyle={{
                              width: "100%",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"transferTo"}
                            name={"transferTo"}
                            label={"Transfer To*"}
                            textField="text"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            data={
                              searchTransferTo || searchTransferToData.length
                                ? searchTransferToData
                                : ExpenseToCodeDropdownData
                            }
                            value={stateTo.value}
                            columns={transferColumns}
                            placeholder="Search Transfer To"
                            onChange={ddlExpenseToHandleChange}
                            validator={ddlExpenseCodeValidator}
                            defaultValue={stateTo.value}
                            filterable={true}
                            onFilterChange={handleFilterChangeTo}
                            wrapperstyle={{
                              width: "100%",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"transferAmount"}
                            name={"transferAmount"}
                            label={"Transfer Amount*"}
                            format={"c"}
                            component={FormNumericTextBox}
                            placeholder={"$ Enter Amount"}
                            spinners={false}
                            step={0}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                            validator={transferAmtValidator}
                          />
                          <Field
                            id={"date"}
                            name={"date"}
                            label={"Date*"}
                            component={FormDatePicker}
                            validator={currentDateValidator}
                          />
                        </div>

                        <div className="k-form-buttons">
                          <Button
                            themeColor={"primary"}
                            className={"col-12"}
                            type={"submit"}
                            disabled={!formRenderProps.allowSubmit}
                          >
                            Transfer Amount
                          </Button>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </Dialog>
            )}
          </>
        </>
      )}
    </>
  );
}
