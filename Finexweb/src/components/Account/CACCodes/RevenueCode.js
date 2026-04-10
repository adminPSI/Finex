import { filterBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  GridColumn as Column,
  getSelectedState,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, NumericTextBox } from "@progress/kendo-react-inputs";
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
  AuthenticationEndPoints,
  ExpenseEndPoints,
  FundEndPoints,
  RevenueEndPoints,
} from "../../../EndPoints";
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
  FormTextArea
} from "../../form-components";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../NotificationHandler/NotificationHandler";
import {
  activeDateValidator,
  ddlFundValidator,
  ddlRevenueCodeValidator,
  descriptionValidator,
  reveneuCodeValidator,
  startingBalanceValidator,
  transferAmtValidator
} from "../../validators";

const myCustomDateCell = (props) => {
  var myDate = props.dataItem.startDate;
  const [year, month, day] = myDate.split("T")[0].split("-");
  return <td>{`${month}/${day}/${year} `}</td>;
};
export default function RevenueCode() {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState();
  const [pageTotal, setPageTotal] = React.useState();
  const [searchText, setSearchText] = React.useState("");
  const [filter, setFilter] = React.useState();
  const [showFilter, setshowFilter] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [InnerGridshow, setInnerGridShow] = React.useState(false);
  const [RevenueData, setRevenueData] = useState([]);
  const [addRevenueVisible, setAddRevenueVisible] = React.useState(false);
  const [formInit, setFormInit] = useState([]);
  const [InnerGridformInit, setInnerGridformInit] = useState([]);
  const [FundDropdownData, setFundDropdownData] = useState([]);
  const [FilterFundDropdownData, setFilterFundDropdownData] = useState("");
  const [FundList, setFundsList] = useState([]);

  const [transferRevenueVisible, setTransferRevenueVisible] =
    React.useState(false);
  const [RevenueCodeDropdownData, setRevenueCodeDropdownData] = useState([]);
  const [InnerRevenueVisible, setInnerRevenueVisible] = React.useState(false);
  const [, setState] = React.useState({
    value: {
      text: "Select Fund",
      id: 0,
    },
  });
  const [, setFundDate] = React.useState();
  const [stateTo, setStateTo] = React.useState({});
  const [stateFrom, setStateFrom] = React.useState({});
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
  const [transferfilter, setTransferFilter] = React.useState();
  const [transferFromBalance, setTransferFromBalance] = React.useState();
  const [transferToBalance, setTransferToBalance] = React.useState();
  const [inactiveFormInit, setInactiveFormInit] = useState([{}]);
  const [showInactive, setshowInactive] = useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [, setIsLoading] = React.useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");

  const handleFilterChange = (event) => {
    if (event) {
      setTransferFilter(event.filter);
    }
  };

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
      header: "",
      width: "300px",
    },
  ];

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
  const [deleteVisible, setDeleteVisible] = useState(false);

  React.useEffect(() => {
    setshowInactive(false);
    setShow(false);
    setBindRevenueGrid({
      cskip: 0,
      ctake: page.take,
    });
    BindFundGrid();
    BindRevenueCodesDropdown();
    handlePrivilageByGroup();
  }, []);
  const [privilegeResourceGroup, setPrivilegeResourceGroup] = React.useState(
    []
  );
  const handlePrivilageByGroup = () => {
    setIsLoading(true);

    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=CAC Revenue Code`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => { });
  };

  const InvactivateFundOnClick = (data, e) => {
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
      isActive: dataItem.isActive,
    };

    axiosInstance({
      method: "POST",
      url: RevenueEndPoints.AddExpense,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        setshowInactive(false);
        setBindRevenueGrid({
          ...bindRevenueGrid,
        });
        toggleDialog();
        setFormInit([]);
        showSuccessNotification("Fund inactivated successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const checkPrivialgeGroup = (resourcesKey, privilageId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilageId
    );
  };
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];

  const onInactiveCheckBox = (event) => {
    setShow(false);

    let iactive = showInactive ? "Y" : "N";
    setBindRevenueGrid({
      isActive: iactive,
      cskip: 0,
      ctake: 10,
    });
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const [sort, setSort] = useState(initialSort);
  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    let iactive = !showInactive ? "Y" : "N";

    setSort(event.sort);
    setBindRevenueGrid({
      isActive: iactive,
      cskip: 0,
      ctake: 10,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindRevenueGrid, setBindRevenueGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindRevenueGrid) {
        BindRevenueGrid(
          bindRevenueGrid.code,
          bindRevenueGrid.description,
          bindRevenueGrid.fundCode,
          bindRevenueGrid.isActive,
          bindRevenueGrid.startDate,
          bindRevenueGrid.search,
          bindRevenueGrid.cskip,
          bindRevenueGrid.ctake,
          bindRevenueGrid.desc,
          bindRevenueGrid.sortKey,
          bindRevenueGrid.inactiveDate
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindRevenueGrid]);

  const BindRevenueGrid = (
    code = "",
    description = "",
    fundCode = "",
    isActive = "Y",
    startDate = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate",
    inactiveDate = ""
  ) => {
    const accountingcode =
      Constants.ExpenseOrRevenueIndicatorTypeCode.RevenueIndicator.code;
    axiosInstance({
      method: "Post",
      url:
        RevenueEndPoints.GetAccountingCodesFilter +
        `accountingcodetype=${accountingcode}` +
        "&&description=" +
        description +
        "&&code=" +
        code +
        "&&fundCode=" +
        fundCode +
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
        "&&inactiveDate=" +
        inactiveDate,
      withCredentials: false,
    })
      .then((response) => {
        setRevenueData();
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
        setRevenueData(data);
        if (bindRevenueGrid.isActive && bindRevenueGrid.isActive == isActive) {
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
            text: data.fundCode,
            id: data.id,
          };
          itemsData.push(items);
        });
        setFundsList(data);
        setFundDropdownData(data);
      })
      .catch(() => { });
  };

  const BindRevenueCodesDropdown = () => {
    axiosInstance({
      method: "GET",
      url: ExpenseEndPoints.GetAccountingCodesList.replace(
        "#AccountingTypeCode#",
        Constants.ExpenseOrRevenueIndicatorTypeCode.RevenueIndicator.code
      ),
      withCredentials: false,
    })
      .then((response) => {
        let items = response.data.map((x) => ({
          id: x.id,
          text: x.countyExpenseCode,
        }));
        setRevenueCodeDropdownData(items);
      })
      .catch(() => { });
  };
  //Event for Transfer From dropdown of Transfer fund popup
  const ddlRevenueFromHandleChange = async (event) => {
    let transferFrom = event.target.value;
    if (transferFrom?.id) {
      let Balance = await getRevenueCodeBalances(transferFrom.id);
      setTransferFromBalance(Balance);
    }
    setStateFrom({
      value: event.target.value,
    });
  };
  const getRevenueCodeBalances = async (id) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: FundEndPoints.GetFundBalanceByID.replace("#ID#", id),
        withCredentials: false,
      });

      let trnasferBalance = response.data;
      return trnasferBalance;
    } catch (error) { }
  };

  //Event for Transfer To dropdown of Transfer fund popup
  const ddlRevenueToHandleChange = async (event) => {
    let transferTo = event.target.value;
    if (transferTo?.id) {
      let Balance = await getRevenueCodeBalances(transferTo.id);
      setTransferToBalance(Balance);
    }
    setStateTo({
      value: event.target.value,
    });
  };
  // Event
  const expandChange = (event) => {
    let newData = RevenueData.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setRevenueData(newData);
    event.dataItem.expanded = event.value;
    setRevenueData([...RevenueData]);
    if (!event.value || event.dataItem.amountDetails) {
      return;
    }
    setselectedRowId(event.dataItem.id);

    let id = event.dataItem.id;
    getRevenueCodeBalancesDetail(id);
  };

  const [selectedState,] = useState({});
  const DATA_ITEM_KEY = "countyExpenseCode";
  const onSelectionChange = (event) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    let revenueId;
    let newData = RevenueData.map((item) => {
      if (item.countyExpenseCode == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
        revenueId = item.id;
        setselectedRowId(revenueId);

        getRevenueCodeBalancesDetail(revenueId);
      } else {
        item.expanded = false;
      }
      return item;
    });
    setRevenueData(newData);
  };

  const getRevenueCodeBalancesDetail = (id) => {
    axiosInstance({
      method: "GET",
      url: RevenueEndPoints.GetBudgetAmount.replace("#AccountingCodeId#", id),
      withCredentials: false,
    })
      .then((response) => {
        let data = RevenueData.slice();
        let index = data.findIndex((d) => d.id == id);
        if (index >= 0) {
          data[index].details = response.data;
        }
        setRevenueData(data);
      })
      .catch(() => { });
  };

  // Event for Funds Grid Change Filters
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
    let iactive = !showInactive ? "Y" : "N";
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindRevenueGrid({
      ...bindRevenueGrid,
      search: undefined,
      code: code,
      description: description,
      fundCode: fundCode,
      isActive: iactive,
      startDate: startDate,
      cskip: 0,
      inactiveDate: inactiveDate,
    });
    setFilter(event.filter);
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };

  const transferRevenueToggleDialog = () => {
    setTransferToBalance();
    setTransferFromBalance();
    setStateFrom({});
    setStateTo({});
    if (!transferRevenueVisible) {
      BindRevenueCodesDropdown();
    }
    setTransferRevenueVisible(!transferRevenueVisible);
  };
  //Event of grid page change
  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindRevenueGrid({
        ...bindRevenueGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindRevenueGrid({
        ...bindRevenueGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: RevenueData.length,
      });
    }
  };

  const transferRevenueHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    if (transferFromBalance < dataItem.transferAmount) {
      showErrorNotification("Transfer amount can't be greater than balance");
    } else {
      let apirequest = {
        fromExpenseId: dataItem.transferFrom.id,
        toExpenseId: dataItem.transferTo.id,
        amount: dataItem.transferAmount,
        date: dataItem.date,
        transferTypeCode: Constants.CountyExpenseAmountTypeCode.Transfer.code,
      };

      axiosInstance({
        method: "POST",
        url: RevenueEndPoints.TransferAmount,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          if (response?.data == "True") {
            setshowInactive(false);
            setShow(false);
            setBindRevenueGrid({
              cskip: 0,
              ctake: 10,
            });
            showSuccessNotification("Amount transferred successfully");
          }
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
      transferRevenueToggleDialog();
    }
  };

  const addRevenueCodeHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let apirequest = {
      id: dataItem.id,
      fundId: dataItem.fund.id,
      orgAccountId: 7,
      countyExpenseCode: dataItem.countyExpenseCode,
      countyExpenseDescription: dataItem.countyExpenseDescription,
      typeCode:
        Constants.ExpenseOrRevenueIndicatorTypeCode.RevenueIndicator.code,
      startDate: dataItem.startDate,
      isActive: "Y",
    };
    setDropdownSearch("");
    axiosInstance({
      method: "POST",
      url: RevenueEndPoints.AddExpense,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        if (dataItem.id == undefined && dataItem.startingBalance > 0) {
          let budgetamountRequest = {
            id: 0,
            accountingCodeId: response.data.id,
            amount: dataItem.startingBalance,
            typeCode:
              Constants.CountyExpenseAmountTypeCode.AnticipatedRevenue.code,
            startDate: response.data.startDate,
          };
          axiosInstance({
            method: "POST",
            url: RevenueEndPoints.AddBudgetAmount.replace(
              "#AccountingCodeId#",
              budgetamountRequest.accountingCodeId
            ),
            data: budgetamountRequest,
            withCredentials: false,
          })
            .then((response) => { })
            .catch(() => { });
        }
        setFormInit([]);
        BindRevenueCodesDropdown();
        setshowInactive(false);
        setShow(false);
        setBindRevenueGrid({
          ...bindRevenueGrid,
        });
        showSuccessNotification("Revenue code added successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
    addRevenueToggleDialog();
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
      typeCode: Constants.CountyExpenseAmountTypeCode.AnticipatedRevenue.code,
      startDate: dataItem.startDate,
      notes:dataItem.notes
    };
    axiosInstance({
      method: "POST",
      url: RevenueEndPoints.AddBudgetAmount.replace(
        "#AccountingCodeId#",
        budgetamountRequest.accountingCodeId
      ),
      data: budgetamountRequest,
      withCredentials: false,
    })
      .then((response) => {
        setInnerGridformInit([]);
        getRevenueCodeBalancesDetail(budgetamountRequest.accountingCodeId);
        InnerRevenueToggleDialog();
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
      isActive: dataItem.isActive,
    };

    axiosInstance({
      method: "POST",
      url: RevenueEndPoints.AddExpense,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        setshowInactive(false);
        setShow(false);
        toggleDialog();
        showSuccessNotification("Revenue code inactivated successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const ddlhandleChange = (event) => {
    FundList.forEach((fund) => {
      if (fund.fundCode == event.target.value?.fundCode) {
        setFundDate(new Date(fund.activeDate));
      }
    });
    setState({
      value: event.target.value,
    });
  };
  const addRevenueToggleDialog = () => {
    if (addRevenueVisible) {
      setFormInit([]);
    }
    setAddRevenueVisible(!addRevenueVisible);
  };
  const InnerRevenueToggleDialog = () => {
    setInnerRevenueVisible(!InnerRevenueVisible);
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
  //Event for Select ContextMenu Item of Grid Data
  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          axiosInstance({
            method: "GET",
            url: RevenueEndPoints.GetAccountingCodesByID + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data[0];
              let convertDate = new Date(data.startDate);
              data.startDate = convertDate;
              setState({
                value: data.fundId,
              });
              setFormInit(data);
              addRevenueToggleDialog();
            })
            .catch(() => { });
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
              console.log({ response })
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
              InnerRevenueToggleDialog();
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
        getRevenueCodeBalancesDetail(selectedRowId);
        toggleDeleteDialog();
      })
      .catch(() => { });
  };

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
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
      typeCode: Constants.CountyExpenseAmountTypeCode.AnticipatedRevenue.code,
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
        getRevenueCodeBalancesDetail(budgetamountRequest.accountingCodeId);
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
  const InnerGridCommandCell = (props) => (
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
  const filterData = (e) => {
    let value = e.target.value;
    setSearchText(value);
    let iactive = !showInactive ? "Y" : "N";
    setPage({ ...page, skip: 0 });
    setBindRevenueGrid({
      ...bindRevenueGrid,
      isActive: iactive,
      cskip: 0,
      search: value,
      code: undefined,
      description: undefined,
      fundCode: undefined,
      startDate: undefined,
    });
  };

  const DetailComponent = (props) => {
    const data = props.dataItem.details;
    if (data) {
      data.map((item) => {
        item["type"] = getCountyExpenseAmountType(item.typeCode);
      });
      return (
        <>
          <Grid
            resizable={true}
            data={data}
          >
            <Column field="startDate" title="Date" cell={myCustomDateCell} />
            <Column
              field="amount"
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
            {checkPrivialgeGroup("EditCACRAmountCM", 3) && (
              <MenuItem
                text="Edit"
                data={{
                  action: "edit",
                }}
                svgIcon={eyedropperIcon}
              />
            )}
            {checkPrivialgeGroup("DeleteCACRAmountCM", 4) && (
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
    }
  };

  return (
    <>
      {checkPrivialgeGroup("CACRM", 1) && (
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
                Revenue Codes
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-6 d-flex align-items-center">
              <h3>County Revenue Code</h3>
            </div>
            <div className="col-sm-6 text-end">
              {checkPrivialgeGroup("AddRevenueCodeB", 2) && (
                <Button themeColor={"primary"} onClick={addRevenueToggleDialog}>
                  <i className="fa-solid fa-plus "></i> Add New Revenue Code
                </Button>
              )}
            </div>
          </div>
          {checkPrivialgeGroup("CACRG", 1) && (
            <div className="mt-3">
              <Grid
                resizable={true}
                data={RevenueData}
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
                //scrollable='none'
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
                        {checkPrivialgeGroup("ShowCACRInactiveCB", 1) && (
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
                        {checkPrivialgeGroup("SMICACRCB", 1) && (
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
                          value={searchText}
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

                <Column field="countyExpenseCode" title="Revenue Code" />
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
              <ContextMenu
                show={show}
                offset={offset.current}
                onSelect={handleOnSelect}
                onClose={handleCloseMenu}
              >
                {checkPrivialgeGroup("EditRevenueCM", 3) && !showInactive && (
                  <MenuItem
                    text="Edit Revenue Code"
                    data={{ action: "edit" }}
                    svgIcon={eyedropperIcon}
                  />
                )}
                {checkPrivialgeGroup("MakeCACRInactiveCM", 2) &&
                  !showInactive && (
                    <MenuItem
                      text="Make Revenue Code Inactive"
                      data={{ action: "inactive" }}
                      svgIcon={eyeSlashIcon}
                    />
                  )}
                {checkPrivialgeGroup("AddCACRAmountCM", 2) && !showInactive && (
                  <MenuItem
                    text="Add Amount"
                    data={{ action: "AddCashBalance" }}
                    svgIcon={plusOutlineIcon}
                  />
                )}
              </ContextMenu>
            </div>
          )}
          <div>
            {addRevenueVisible && (
              <Dialog
                width={500}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i
                      className={
                        "fa-solid " +
                        " " +
                        (formInit.id > 0 ? "fa-edit" : "fa-plus")
                      }
                    ></i>{" "}
                    <span className="ms-2">
                      {formInit.id > 0
                        ? "Edit CAC Revenue Code"
                        : "Add New CAC Revenue Code"}
                    </span>
                  </div>
                }
                onClose={addRevenueToggleDialog}
              >
                <Form
                  onSubmit={addRevenueCodeHandleSubmit}
                  initialValues={formInit}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <Field
                          id={"CountyExpenseCode"}
                          name={"countyExpenseCode"}
                          label={"CAC Revenue Code*"}
                          placeholder={
                            "Based on county auditor's chart of accounts listing"
                          }
                          component={FormInput}
                          validator={reveneuCodeValidator}
                          disabled={formInit?.id}
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
                          {!formInit.id && (
                            <Field
                              id={"startingBalance"}
                              name={"startingBalance"}
                              label={"Amount"}
                              format={"c"}
                              placeholder={"$ Enter Amount"}
                              component={FormNumericTextBox}
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
                            validator={activeDateValidator}
                            disabled={!formRenderProps.valueGetter("fund")}
                          />
                        </div>

                        <div className="k-form-buttons">
                          <Button
                            themeColor={"primary"}
                            className={"col-12"}
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
          <div>
            {InnerRevenueVisible && (
              <Dialog
                width={500}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-edit"></i>{" "}
                    <span className="ms-2">Edit Amount</span>
                  </div>
                }
                onClose={InnerRevenueToggleDialog}
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
          </div>
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
                          label={"CAC Revenue Code*"}
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
                          label={"Description*"}
                          placeholder={
                            "Based on the title given by the auditors office"
                          }
                          component={FormInput}
                          disabled={true}
                          maxLength={255}
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
          </>
          {InactiveFundvisible && (
            <Dialog
              title={<span>Please Provide Date and Confirm</span>}
              onClose={toggleDialog}
            >
              <Form
                onSubmit={InvactivateFundOnClick}
                initialValues={inactiveFormInit}
                key={1}
                render={(formRenderProps) => (
                  <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                      <Field
                        id={"inactiveFormDate"}
                        name={"inactiveFormDate"}
                        label={"Inactive Date*"}
                        component={FormDatePicker}
                        validator={activeDateValidator}
                      />

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
          <>
            {transferRevenueVisible && (
              <Dialog
                width={500}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-right-left"></i>{" "}
                    <span className="ms-2">Transfer Amount</span>
                  </div>
                }
                onClose={transferRevenueToggleDialog}
              >
                <p>Transfer amount from one account to another</p>
                <Form
                  onSubmit={transferRevenueHandleSubmit}
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
                            id={"transferFrom"}
                            name={"transferFrom"}
                            label={"Transfer From*"}
                            textField="text"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            data={
                              transferfilter
                                ? filterBy(
                                  RevenueCodeDropdownData,
                                  transferfilter
                                )
                                : RevenueCodeDropdownData
                            }
                            value={stateFrom.value}
                            columns={transferColumns}
                            placeholder="Search Transfer To"
                            onChange={ddlRevenueFromHandleChange}
                            validator={ddlRevenueCodeValidator}
                            defaultValue={stateFrom.value}
                            filterable={true}
                            onFilterChange={handleFilterChange}
                            wrapperstyle={{
                              width: "58%",
                              marginRight: "10px",
                            }}
                          />
                          <div
                            className="k-form-field"
                            style={{
                              width: "40%",
                            }}
                          >
                            <label className="k-label">Balance</label>
                            <NumericTextBox
                              format={"c"}
                              spinners={false}
                              value={transferFromBalance}
                              disabled={true}
                            />
                          </div>
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
                              transferfilter
                                ? filterBy(
                                  RevenueCodeDropdownData,
                                  transferfilter
                                )
                                : RevenueCodeDropdownData
                            }
                            value={stateTo.value}
                            columns={transferColumns}
                            placeholder="Search Transfer To"
                            onChange={ddlRevenueToHandleChange}
                            validator={ddlRevenueCodeValidator}
                            defaultValue={stateTo.value}
                            filterable={true}
                            onFilterChange={handleFilterChange}
                            wrapperstyle={{
                              width: "58%",
                              marginRight: "10px",
                            }}
                          />
                          <div
                            className="k-form-field"
                            style={{
                              width: "40%",
                            }}
                          >
                            <label className="k-label">Balance</label>
                            <NumericTextBox
                              format={"c"}
                              spinners={false}
                              value={transferToBalance}
                              disabled={true}
                            />
                          </div>
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
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                            validator={transferAmtValidator}
                            step={0}
                            spinners={false}
                          />
                          <Field
                            id={"date"}
                            name={"date"}
                            label={"Date*"}
                            component={FormDatePicker}
                            validator={activeDateValidator}
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
        </>
      )}
    </>
  );
}
