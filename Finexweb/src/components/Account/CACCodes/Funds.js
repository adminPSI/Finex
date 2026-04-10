import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  GridColumn as Column,
  getSelectedState,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import {
  ContextMenu,
  Drawer,
  DrawerContent,
  DrawerItem,
  MenuItem,
} from "@progress/kendo-react-layout";
import {
  eyedropperIcon,
  eyeSlashIcon,
  plusOutlineIcon,
  trashIcon,
} from "@progress/kendo-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import { FundEndPoints } from "../../../EndPoints";
import axiosInstance from "../../../core/HttpInterceptor";
import usePrivilege from "../../../helper/usePrivilege";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../NotificationHandler/NotificationHandler";
import Constants from "../../common/Constants";
import { handleDropdownSearch } from "../../common/Helper";
import {
  ColumnDatePicker,
  FormDatePicker,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
  FormTextArea,
} from "../../form-components";
import {
  activeDateValidator,
  amountValidator,
  currentDateValidator,
  ddlFundValidator,
  fundCodeValidator,
  fundNameValidator,
  startingBalanceValidator,
  transferAmtValidator,
} from "../../validators";

export default function Funds() {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [filter, setFilter] = useState();
  const [showFilter, setshowFilter] = useState(false);
  const [transferFundVisible, setTransferFundVisible] = useState(false);
  const [addFundVisible, setAddFundVisible] = useState(false);
  const [addCashVisible, setAddCashVisible] = useState(false);
  const [fundData, setFundData] = useState([]);
  const [formInit, setFormInit] = useState([]);
  const [showInactive, setshowInactive] = useState(false);
  const showInactiveRef = useRef(false);

  const [columnShow, setColumnShow] = useState(false);
  const [inactiveFormInit, setInactiveFormInit] = useState([{}]);
  const [cashFormInit, setCashFormInit] = useState([]);
  const [fundFromDropdownData, setFundFromDropdownData] = useState([]);
  const [fundToDropdownData, setFundToDropdownData] = useState([]);
  const [InactiveFundvisible, setInactiveFundvisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [stateTo, setStateTo] = useState({
    value: {
      text: "Select Fund",
      id: 0,
    },
  });
  const [stateFrom, setStateFrom] = useState({
    value: {
      text: "Select Fund",
      id: 0,
    },
  });
  const [page, setPage] = useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);
  const [pageTotal, setPageTotal] = useState();
  const [, setsearchText] = useState("");
  const [show, setShow] = useState(false);
  const offset = useRef({
    left: 0,
    top: 0,
  });
  const offsetInnerGrid = useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = useState(0);
  const [drawerexpanded, setDrawerExpanded] = useState(false);
  const [selectedFundCashBalanceId, setselectedFundCashBalanceId] = useState(0);
  const [InnerGridshow, setInnerGridShow] = useState(false);
  const [InnerGridformInit, setInnerGridformInit] = useState([]);
  const [innerCashBalncedialogVisible, setInnerCashBalncedialogVisible] =
    useState(false);
  const [, setTransferFromBalance] = useState();
  const [, setTransferToBalance] = useState();

  const [searchTransferFrom, setSearchTransferFrom] = useState("");
  const [searchTransferFromData, setSearchTransferFromData] = useState("");

  const [searchTransferTo, setSearchTransferTo] = useState("");
  const [searchTransferToData, setSearchTransferToData] = useState("");

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

  const searchableField = ["fundCode", "fundname"];

  useEffect(() => {
    const result = handleDropdownSearch(
      fundFromDropdownData,
      searchableField,
      searchTransferFrom
    );
    setSearchTransferFromData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTransferFrom]);

  useEffect(() => {
    const result = handleDropdownSearch(
      fundToDropdownData,
      searchableField,
      searchTransferTo
    );
    setSearchTransferToData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTransferTo]);

  const transferColumns = [
    {
      field: "fundCode",
      header: "Fund Code",
      width: "200px",
    },
    {
      field: "fundname",
      header: "Fund Name",
      width: "200px",
    },
  ];
  const items = [];
  const [selectedId, setSelectedId] = useState();
  useEffect(() => {
    setshowInactive(false);
    showInactiveRef.current = false;
    setShow(false);
    setBindFundGrid({
      cskip: 0,
      ctake: 10,
    });
    BindFundDropdown();
    setTransferFromBalance();
    setTransferToBalance();
  }, []);

  //Set filter operator for Funds Grid Data
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];

  const [sort, setSort] = useState(initialSort);
  const [bindFundGrid, setBindFundGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindFundGrid) {
        BindFundGrid(
          bindFundGrid.code,
          bindFundGrid.fundName,
          bindFundGrid.isActive,
          bindFundGrid.startDate,
          bindFundGrid.search,
          bindFundGrid.cskip,
          bindFundGrid.ctake == "All" ? 0 : bindFundGrid.ctake,
          bindFundGrid.desc,
          bindFundGrid.sortKey,
          bindFundGrid.inactiveDate
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindFundGrid]);

  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindFundGrid({
      ...bindFundGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  //Function to Get Funds Grid Data
  const BindFundGrid = async (
    code = "",
    fundName = "",
    isActive = "Y",
    startDate = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate",
    inactiveDate = ""
  ) => {
    axiosInstance({
      method: "Post",
      url:
        FundEndPoints.GetFundListWithFilter +
        "code=" +
        code +
        "&&fundName=" +
        fundName +
        "&&isActive=" +
        isActive +
        "&&startDate=" +
        startDate +
        "&&search=" +
        search +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&&inactiveDate=" +
        inactiveDate,
      withCredentials: false,
    })
      .then((response) => {
        setFundData();
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
        setFundData(data);
        if (bindFundGrid.isActive && bindFundGrid.isActive == isActive) {
          setshowInactive(isActive == "N" ? true : false);
          showInactiveRef.current = !showInactive;
        }
      })
      .catch(() => { });
  };

  const handleCSFB = () => {
    axiosInstance({
      method: "POST",
      url: FundEndPoints.CalculateAndStoreFundBalances,
      withCredentials: false,
    })
      .then((response) => {
        showInactiveRef.current = false;
        setshowInactive(false);
        setShow(false);
        showSuccessNotification("Calculated and Stored Fund Balance");
      })
      .catch(() => { });
  };

  const BindFundDropdown = () => {
    axiosInstance({
      method: "GET",
      url: FundEndPoints.GetFundCodeList,
      withCredentials: false,
    })
      .then((response) => {
        setFundFromDropdownData(response.data);
      })
      .catch(() => { });
  };
  const filterChange = (event) => {
    var code = "";
    var fundName = "";
    var startDate = "";
    var inactiveDate = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "fundCode") {
          code = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "fundName") {
          fundName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "activeDate") {
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
        if (event.filter.filters[i].field == "inactiveDate") {
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
    setBindFundGrid({
      ...bindFundGrid,
      search: undefined,
      cskip: 0,
      code: code,
      fundName: fundName,
      startDate: startDate,
      inactiveDate: inactiveDate,
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
      setBindFundGrid({
        ...bindFundGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindFundGrid({
        ...bindFundGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: fundData.length,
      });
    }
  };
  //Event of grid filter change
  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindFundGrid({
      ...bindFundGrid,
      search: value,
      cskip: 0,
      code: undefined,
      fundName: undefined,
      startDate: undefined,
      inactiveDate: undefined,
    });
  };

  //Open Transfer funds Popup
  const transferFundToggleDialog = () => {
    setTransferToBalance();
    setTransferFromBalance();
    setStateFrom({});
    setStateTo({});
    setFundToDropdownData([]);
    setTransferFundVisible(!transferFundVisible);
    if (!transferFundVisible) {
      BindFundDropdown();
    }
  };
  //Open Add funds Popup
  const addFundToggleDialog = () => {
    setAddFundVisible(!addFundVisible);
    if (addFundVisible) {
      setFormInit([]);
    }
  };
  //Open Add Cash Balance Popup
  const addCashToggleDialog = () => {
    setAddCashVisible(!addCashVisible);

    if (addCashVisible) {
      setCashFormInit([]);
    }
  };

  //Event to Submit transfer fund Popup Data
  const transferFundHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    if (dataItem.transferFrom.id == dataItem.transferTo.id) {
      showErrorNotification("Transfer from and transfer to should not be same");
    } else {
      let apirequest = {
        fromFundId: dataItem.transferFrom.id,
        toFundId: dataItem.transferTo.id,
        amount: dataItem.transferAmount,
        date: dataItem.date,
        transferTypeCode: Constants.FundTypeCode.Transfer.code,
      };
      setSearchTransferFrom("");
      setSearchTransferTo("");
      axiosInstance({
        method: "POST",
        url: FundEndPoints.TransferFund,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          if (response?.data == "True") {
            setshowInactive(false);
            showInactiveRef.current = false;
            setShow(false);
            setBindFundGrid({
              cskip: 0,
              ctake: 10,
            });
            transferFundToggleDialog();
            showSuccessNotification("Fund transferred successfully");
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

  const DeleteOnClick = () => {
    let id = selectedFundCashBalanceId;
    axiosInstance({
      method: "Delete",
      url: FundEndPoints.GetFundCashBalanceByID.replace("#cashBalanceID#", id),
      withCredentials: false,
    })
      .then((response) => {
        getFundsCashBalances(selectedRowId);
        toggleDeleteDialog();
      })
      .catch(() => { });
  };

  const InvactivateFundOnClick = (data, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let inaactivateDate = data.inactiveFormDate;

    let apirequest = {
      id: data.id,
      orG_ID: 7,
      fundCode: data.fundCode,
      fundName: data.fundName,
      activeDate: data.activeDate,
      inactiveDate: inaactivateDate,
      isActive: data.isActive,
    };
    axiosInstance({
      method: "PUT",
      url: FundEndPoints.EditDeleteFundById + data.id,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        setshowInactive(false);
        showInactiveRef.current = false;
        setBindFundGrid({
          ...bindFundGrid,
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

  //Event to Submit add fund Popup Data
  const addferFundHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    if (dataItem.id !== undefined) {
      let apirequest = {
        id: dataItem.id,
        orG_ID: 7,
        fundCode: dataItem.fundCode,
        fundName: dataItem.fundName,
        activeDate: dataItem.activeDate,
        inactiveDate: dataItem.inactiveDate,
        isActive: dataItem.isActive,
      };

      axiosInstance({
        method: "PUT",
        url: FundEndPoints.EditDeleteFundById + dataItem.id,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          setshowInactive(false);
          showInactiveRef.current = false;
          setBindFundGrid({
            ...bindFundGrid,
          });
          BindFundDropdown();
          addFundToggleDialog();
          showSuccessNotification("Fund code updated successfully");
        })
        .catch(() => { });
    } else {
      let apirequest = {
        id: 0,
        orG_ID: 7,
        fundCode: dataItem.fundCode,
        fundName: dataItem.fundName,
        activeDate: dataItem.activeDate,
        inactiveDate: "",
        isActive: "Y",
      };

      axiosInstance({
        method: "POST",
        url: FundEndPoints.AddFund,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          setshowInactive(false);
          showInactiveRef.current = false;
          setShow(false);
          addFundToggleDialog();
          if (dataItem.startingBalance && dataItem.startingBalance !== 0) {
            let casebalanceRequest = {
              id: 0,
              amount: dataItem.startingBalance,
              startDate: response.data.activeDate,
              fundId: response.data.id,
              typeCode: Constants.FundTypeCode.CashBalance.code,
            };

            axiosInstance({
              method: "POST",
              url: FundEndPoints.AddCashBalance.replace(
                "#FundId#",
                casebalanceRequest.fundId
              ),
              data: casebalanceRequest,
              withCredentials: false,
            })
              .then((response) => {
                setshowInactive(false);
                showInactiveRef.current = false;
                setShow(false);
                showSuccessNotification("Fund code added successfully");
              })
              .catch(() => { });
          }

          setBindFundGrid({
            cskip: 0,
            ctake: 10,
          });
          BindFundDropdown();
          setFormInit([]);
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    }
  };

  //Event to Submit add CashBalace Popup Data
  const addCashBalHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let cashbalanceRequest = {
      id: 0,
      amount: dataItem.startingBalance,
      startDate: dataItem.activeDate,
      fundId: dataItem.id,
      typeCode: Constants.FundTypeCode.CashBalance.code,
    };
    axiosInstance({
      method: "POST",
      url: FundEndPoints.AddCashBalance.replace(
        "#FundId#",
        cashbalanceRequest.fundId
      ),
      data: cashbalanceRequest,
      withCredentials: false,
    })
      .then((response) => {
        getFundsCashBalances(cashbalanceRequest.fundId);
        addCashToggleDialog();
        showSuccessNotification("Added amount successfully");
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
    let newData = fundData.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setFundData(newData);
    setselectedRowId(event.dataItem.id);

    event.dataItem.expanded = event.value;
    setFundData([...fundData]);
    let fundId = event.dataItem.id;
    getFundsCashBalances(fundId);
    if (!event.value || event.dataItem.amountDetails) {
      return;
    }
  };

  const [selectedState, setSelectedState] = useState({});
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";

  const onSelectionChange = (event) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    let id;
    let newData = fundData.map((item) => {
      if (item.id == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
        id = item.id;
        setselectedRowId(id);
        getFundsCashBalances(id);
      } else {
        item.expanded = false;
      }
      return item;
    });
    if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
      setSelectedState(newSelectedState);
    } else {
      setSelectedState({});
    }
    setFundData(newData);
  };

  const getFundsCashBalances = (fundId) => {
    axiosInstance({
      method: "GET",
      url: FundEndPoints.GetFundDetailList.replace("#ID#", fundId),
      withCredentials: false,
    })
      .then((response) => {
        let cashBalance = response.data;
        if (cashBalance.length > 0) {
          cashBalance.sort(
            (a, b) => new Date(b.startDate) - new Date(a.startDate)
          );
          let data = fundData.slice();
          let index = data.findIndex((d) => d.id == fundId);
          if (index >= 0) {
            data[index].details = cashBalance;
          }
          setFundData(data);
        } else {
          let data = fundData.slice();
          let index = data.findIndex((d) => d.id == fundId);
          if (index >= 0) {
            data[index].details = {};
          }
          setFundData(data);
        }
      })
      .catch(() => { });
  };

  //Click Method for View Modified History
  const drawerhandleClick = () => {
    setDrawerExpanded((prevState) => !prevState);
  };

  //Drawer Event of View Modified History
  const drawerhandleSelect = (ev) => {
    setSelectedId(ev.itemIndex);
    setDrawerExpanded(false);
  };

  //Event for Transfer From dropdown of Transfer fund popup
  const ddlFundFromHandleChange = async (event) => {
    let transferFrom = event.target.value;
    let transferto = fundFromDropdownData.filter(
      (fund) => fund?.id !== transferFrom?.id
    );
    setFundToDropdownData(transferto);
    setStateFrom({
      value: event.target.value,
    });
  };

  //Event for Transfer To dropdown of Transfer fund popup
  const ddlFundToHandleChange = async (event) => {
    setStateTo({
      value: event.target.value,
    });
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
            url: FundEndPoints.EditDeleteFundById + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              let convertDate = new Date(response.data.activeDate);
              data.activeDate = convertDate;
              setFormInit(data);
              addFundToggleDialog();
            })
            .catch(() => { });
          break;

        case "history":
          drawerhandleClick();
          break;

        case "inactive":
          axiosInstance({
            method: "GET",
            url: FundEndPoints.EditDeleteFundById + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.inactiveDate = new Date();
              data.isActive = "N";
              setInactiveFormInit(data);
              setShow(false);
              toggleDialog();
            })
            .catch(() => { });
          break;

        case "AddCashBalance":
          axiosInstance({
            method: "GET",
            url: FundEndPoints.EditDeleteFundById + id,
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
  const toggleDialog = () => {
    setInactiveFundvisible(!InactiveFundvisible);
  };
  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
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

  //Custom Item bind for View Modified History
  const CustomItem = (props) => {
    return (
      <DrawerItem {...props}>
        <img src={props.profileimg} height={50} width={50} alt="imagec"></img>
        <div className="item-descr-wrap">
          <div className="row">
            <div className="col-8">{props.text}</div>
            <div className="col-4 item-date">{"10/02/23"}</div>
          </div>
          <span className="item-descr">
            Modified <span className="text-success">{props.desc}</span>
          </span>
        </div>
      </DrawerItem>
    );
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
  const InnerGridCashBalanceHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let casebalanceRequest = {
      id: dataItem.id,
      amount: dataItem.amount,
      startDate: dataItem.startDate,
      fundId: dataItem.fundId,
      typeCode: dataItem.typeCode,
    };

    axiosInstance({
      method: "POST",
      url: FundEndPoints.AddCashBalance.replace(
        "#FundId#",
        casebalanceRequest.fundId
      ),
      data: casebalanceRequest,
      withCredentials: false,
    })
      .then((response) => {
        setInnerGridformInit([]);
        getFundsCashBalances(casebalanceRequest.fundId);
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

  const handleOnSelectInnerGrid = (e) => {
    let id = selectedFundCashBalanceId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          let url = FundEndPoints.GetFundCashBalanceByID.replace(
            "#cashBalanceID#",
            id
          );
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
  const handleCloseMenuInnerGrid = () => {
    setInnerGridShow(false);
    setselectedFundCashBalanceId(0);
  };

  const handleInnerGridContextMenu = (props) => {
    handleInnerGridContextMenuOpen(props);
  };

  const handleInnerGridContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedFundCashBalanceId(e.currentTarget.id);
    offsetInnerGrid.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setInnerGridShow(true);
  };

  const onInactiveCheckBox = (event) => {
    setShow(false);

    let iactive = showInactive ? "Y" : "N";
    setBindFundGrid({
      ...bindFundGrid,
      isActive: iactive,
    });
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const InnerGridCommandCell = (props) => {
    const data = props.dataItem;

    if (data.typeDesc == "Transfer") {
      return <td className="k-command-cell"></td>;
    } else {
      return (
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
      );
    }
  };

  //Event to Bind DetailComponent of fund grid
  const DetailComponent = (props) => {
    const data = props.dataItem.details;
    if (data && Object.keys(data).length > 0) {
      return (
        <>
          {checkPrivialgeGroup("FundG", 1) && (
            <Grid
              resizable={true}
              data={data}
            >
              <Column
                field="startDate"
                title="Start Date"
                type="date"
                cell={myCustomDateCell}
              />
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
                field="typeDesc"
                title="Types"
                cell={(props) => {
                  return <td>{props.dataItem.typeDesc}</td>;
                }}
              />
              <Column
                field="notes"
                title="Note"
                cell={(props) => {
                  return <td>{props.dataItem.notes}</td>;
                }}
              />
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
              {columnShow && <Column field="modifiedBy" title="Modified By" />}
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
            {checkPrivialgeGroup("EditAmountCM", 3) && (
              <MenuItem
                text="Edit"
                data={{
                  action: "edit",
                }}
                svgIcon={eyedropperIcon}
              />
            )}
            {checkPrivialgeGroup("DeleteAmountCM", 4) && (
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
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Fund')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("FundM", 1) && (
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
                Fund
              </li>
            </ol>
          </nav>

          <div className="row d-flex justify-content-between">
            <div className="col-sm-4 d-flex align-items-center">
              <span className="page-title">Fund</span>
            </div>
            <div className="col-sm-8 text-end">
              {checkPrivialgeGroup("CalculateFundB", 1) && (
                <Button
                  style={{
                    margin: "5px",
                  }}
                  onClick={handleCSFB}
                >
                  Calculate & Store Balances
                </Button>
              )}
              {checkPrivialgeGroup("TransferFundB", 2) && (
                <Button
                  style={{
                    margin: "5px",
                  }}
                  onClick={transferFundToggleDialog}
                >
                  <i className="fa-solid fa-right-left"></i> Transfer Funds
                </Button>
              )}
              {checkPrivialgeGroup("AddFundB", 2) && (
                <Button themeColor={"primary"} onClick={addFundToggleDialog}>
                  <i className="fa-solid fa-plus"></i> Add Fund
                </Button>
              )}
            </div>
          </div>

          <div>
            <Drawer
              expanded={drawerexpanded}
              position={"end"}
              mode={"overlay"}
              width={400}
              items={items.map((item) => ({
                ...item,
                selected: item.text == selectedId,
              }))}
              item={CustomItem}
              onSelect={drawerhandleSelect}
              onOverlayClick={drawerhandleSelect}
            >
              <DrawerContent></DrawerContent>
            </Drawer>
          </div>

          {checkPrivialgeGroup("FundG", 1) && (
            <div className="mt-3">
              <Grid
                resizable={true}
                filterable={showFilter}
                detail={DetailComponent}
                expandField="expanded"
                onExpandChange={expandChange}
                filter={filter}
                onFilterChange={filterChange}
                data={fundData}
                selectedField={SELECTED_FIELD}
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
                dataItemKey={DATA_ITEM_KEY}
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
                  <div className="row col-sm-12 d-flex justify-content-between">
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
                        {checkPrivialgeGroup("ShowInactiveFundCB", 1) && (
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
                        {checkPrivialgeGroup("SMIFundCB", 1) && (
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

                <Column field="fundCode" title="Code" />
                <Column field="fundName" title="Fund Name" />
                <Column
                  field="activeDate"
                  title="Start Date"
                  format="{0:MM/dd/yyyy}"
                  filterCell={ColumnDatePicker}
                  filter="date"
                  cell={(props) => {
                    const [year, month, day] = props.dataItem?.activeDate
                      ? props.dataItem?.activeDate.split("T")[0].split("-")
                      : [null, null, null];
                    return (
                      <td>
                        {props.dataItem?.activeDate
                          ? `${month}/${day}/${year}`
                          : null}
                      </td>
                    );
                  }}
                />
                {showInactive && (
                  <Column
                    field="inactiveDate"
                    title="Inactive Date"
                    format="{0:MM/dd/yyyy}"
                    filterCell={ColumnDatePicker}
                    filter="date"
                    cell={(props) => {
                      const [year, month, day] = props.dataItem?.inactiveDate
                        ? props.dataItem?.inactiveDate.split("T")[0].split("-")
                        : [null, null, null];
                      return (
                        <td>
                          {props.dataItem?.inactiveDate
                            ? `${month}/${day}/${year}`
                            : null}
                        </td>
                      );
                    }}
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
                {checkPrivialgeGroup("EditFundCM", 3) && !showInactive && (
                  <MenuItem
                    text="Edit Fund"
                    data={{
                      action: "edit",
                    }}
                    svgIcon={eyedropperIcon}
                  />
                )}
                {checkPrivialgeGroup("MakeFundInactiveCM", 2) &&
                  !showInactive && (
                    <MenuItem
                      text="Make Fund Inactive"
                      data={{
                        action: "inactive",
                      }}
                      svgIcon={eyeSlashIcon}
                    />
                  )}
                {checkPrivialgeGroup("AddAmountCM", 2) && !showInactive && (
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
          <div>
            {transferFundVisible && (
              <Dialog
                width={500}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-right-left"></i>{" "}
                    <span className="ms-2">Transfer Funds</span>
                  </div>
                }
                onClose={transferFundToggleDialog}
              >
                <Form
                  onSubmit={transferFundHandleSubmit}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <div
                        >
                          <Field
                            id={"transferFrom"}
                            name={"transferFrom"}
                            label={"Transfer From*"}
                            textField="fundCode"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            data={
                              searchTransferFrom ||
                                searchTransferFromData.length
                                ? searchTransferFromData
                                : fundFromDropdownData
                            }
                            value={stateFrom.value}
                            columns={transferColumns}
                            placeholder="Search Transfer From"
                            onChange={ddlFundFromHandleChange}
                            validator={ddlFundValidator}
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
                            textField="fundCode"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            data={
                              searchTransferTo || searchTransferToData.length
                                ? searchTransferToData
                                : fundToDropdownData
                            }
                            value={stateTo.value}
                            columns={transferColumns}
                            placeholder="Search Transfer To"
                            onChange={ddlFundToHandleChange}
                            validator={ddlFundValidator}
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
                            format="c2"
                            component={FormNumericTextBox}
                            placeholder={"$ Enter Amount"}
                            validator={transferAmtValidator}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                            step={0}
                            min={0}
                            spinners={false}
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
                            Transfer Funds
                          </Button>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </Dialog>
            )}
            {addFundVisible && (
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
                    ></i>
                    <span className="ms-2">
                      {formInit.id > 0 ? "Edit Fund" : "Add new Fund"}
                    </span>
                  </div>
                }
                onClose={addFundToggleDialog}
              >
                <Form
                  onSubmit={addferFundHandleSubmit}
                  initialValues={formInit}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <Field
                          id={"fundCode"}
                          name={"fundCode"}
                          label={"Fund Code*"}
                          placeholder={
                            "Based on county auditor's chart of accounts listing"
                          }
                          component={FormInput}
                          validator={formInit.id > 0 ? "" : fundCodeValidator}
                          maxLength={50}
                          disabled={formInit.id > 0}
                        />

                        <Field
                          id={"fundName"}
                          name={"fundName"}
                          label={"Fund Name*"}
                          placeholder={
                            "Based on the title given by the auditors office"
                          }
                          component={FormTextArea}
                          validator={fundNameValidator}
                          maxLength={255}
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
                              format="c2"
                              placeholder={"$ Enter Amount"}
                              component={FormNumericTextBox}
                              wrapperstyle={{
                                width: "60%",
                                marginRight: "10px",
                              }}
                              step={0}
                              min={0}
                              spinners={false}
                              validator={amountValidator}
                            />
                          )}
                          <Field
                            id={"date"}
                            name={"activeDate"}
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
                          id={"fundCode"}
                          name={"fundCode"}
                          label={"Fund Code"}
                          placeholder={
                            "Based on county auditor's chart of accounts listing"
                          }
                          component={FormInput}
                          validator={fundCodeValidator}
                          disabled={true}
                        />
                        <Field
                          id={"fundName"}
                          name={"fundName"}
                          label={"Fund Name"}
                          placeholder={
                            "Based on the title given by the auditors office"
                          }
                          component={FormInput}
                          validator={fundNameValidator}
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
                            label={"Amount*"}
                            format="c2"
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
                            id={"date"}
                            name={"activeDate"}
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
                            Save
                          </Button>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </Dialog>
            )}
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
            <div>
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
                              format="c2"
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
                              id={"date"}
                              name={"startDate"}
                              label={"Start Date*"}
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
          </div>
        </>
      )}
    </>
  );
}
