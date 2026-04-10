import { getter, orderBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
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
import {
  AccountReceivable,
  AuthenticationEndPoints,
  ConfigurationEndPoints,
  PayrollEndPoints,
  roleEndPoints,
} from "../../../EndPoints";
import axiosInstance from "../../../core/HttpInterceptor";
import usePrivilege from "../../../helper/usePrivilege";
import { showSuccessNotification } from "../../NotificationHandler/NotificationHandler";
import Constants from "../../common/Constants";
import { FormDatePicker, FormInput } from "../../form-components";
import {
  activeDateValidator,
  startDateValidator
} from "../../validators";
export default function Revenue() {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const navigate = useNavigate();
  const [page, setPage] = React.useState(initialDataState);
  const [RevenueApprovePage, setRevenueApprovePage] =
    React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageSizeRevenueApproveValue, setPageSizeRevenueApproveValue] =
    React.useState(initialDataState.take);
  const [pageTotal, setPageTotal] = React.useState();
  const [pageRevenueapproveTotal, setPageRevenueapproveTotal] =
    React.useState();
  const [filter, setFilter] = React.useState();
  const [RevenueApproveFilter, setRevenueApproveFilter] = React.useState();
  const [searchText, setsearchText] = React.useState("");

  const [RevenueshowFilter, setRevenueshowFilter] = useState(false);
  const [RevenueApproveshowFilter, setRevenueApproveshowFilter] =
    useState(false);
  const [RevenueShow, setRevenueShow] = useState(false);
  const [revenueSHowOptions, setRevenueShowOptions] = useState([]);
  const [selectedRevenueRowId, setselectedRevenueRowId] = useState(0);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [RevenueApproveDisplay, setRevenueApproveDisplay] =
    React.useState(false);
  const [ReceivableFilter, setReceivableFilter] = React.useState("Select Year");

  const RevenueOffset = React.useRef({
    left: 0,
    top: 0,
  });
  const [RevenueData, setRevenueData] = React.useState([]);
  const [RevenueApproveData, setRevenueApproveData] = React.useState([]);
  const [columnShow, setColumnShow] = useState(false);
  const [RevenueApproveColumnShow, setRevenueApproveColumnShow] =
    useState(false);
  const [dayTypeAmount, setDayTypeAmount] = React.useState(-1);
  const [advanceSearchVisible, setAdvanceSearchVisible] = React.useState("");
  const [showPostRevenue, setShowPostRevenue] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [endDateError, setEndDateError] = useState("");


  React.useEffect(() => {
    setReceivableFilter(years[1]);
  }, []);

  React.useEffect(() => {
    getConfigForPostRevenue();
    getConfigForRevenueApprove();
    BindRevenueGrid();
    BindRevenueApproveGrid();
    getUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ReceivableFilter]);
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const initialRevenueApproveSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];
  const [RevenueApprovesort, setRevenueApproveSort] = useState(
    initialRevenueApproveSort
  );
  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setSort(event.sort);
    setBindRevenueGrid({
      ...bindRevenueGrid,
      search: searchText,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const onSortRevenueApproveChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setRevenueApproveSort(event.sort);
    setBindRevenueApproveGrid({
      ...bindRevenueApproveGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindRevenueGrid, setBindRevenueGrid] = useState(null);
  const [bindRevenueApproveGrid, setBindRevenueApproveGrid] = useState(null);

  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (bindRevenueGrid) {
        BindRevenueGrid(
          bindRevenueGrid.RevenueContrib,
          bindRevenueGrid.dateReceived,
          bindRevenueGrid.revreceiptno,
          bindRevenueGrid.revAmount,
          bindRevenueGrid.payinno,
          bindRevenueGrid.description,
          bindRevenueGrid.search,
          bindRevenueGrid.status,
          bindRevenueGrid.statusChangeDate,
          bindRevenueGrid.postDate,
          bindRevenueGrid.cskip,
          bindRevenueGrid.ctake == "All" ? 0 : bindRevenueGrid.ctake,
          bindRevenueGrid.desc,
          bindRevenueGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindRevenueGrid]);

  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (bindRevenueApproveGrid) {
        BindRevenueApproveGrid(
          bindRevenueApproveGrid.RevenueContrib,
          bindRevenueApproveGrid.dateReceived,
          bindRevenueApproveGrid.revreceiptno,
          bindRevenueApproveGrid.revAmount,
          bindRevenueApproveGrid.payinno,
          bindRevenueApproveGrid.description,
          bindRevenueApproveGrid.search,
          bindRevenueApproveGrid.status,
          bindRevenueApproveGrid.statusChangeDate,
          bindRevenueApproveGrid.postDate,
          bindRevenueApproveGrid.cskip,
          bindRevenueApproveGrid.ctake == "All"
            ? 0
            : bindRevenueApproveGrid.ctake,
          bindRevenueApproveGrid.desc,
          bindRevenueApproveGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindRevenueApproveGrid]);

  const BindRevenueGrid = (
    RevenueContrib = "",
    dateReceived = "",
    revreceiptno = "",
    revAmount = "",
    payinno = "",
    description = "",
    search = "",
    status = "",
    statusChangeDate = "",
    postDate = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        AccountReceivable.GetRevenueFilter +
        `?RevenueContrib=${RevenueContrib}&dateReceived=${dateReceived}&revreceiptno=${revreceiptno}&revAmount=${revAmount}&payinno=${payinno}&description=${description}&status=${status}&statusCahngeDate=${statusChangeDate}&postDate=${postDate}&search=${search}&skip=${cskip}&take=${ctake}&desc=${desc}&sortKey=${sortKey}&year=${ReceivableFilter}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPageTotal(data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: data.total,
          });
        }
        setRevenueData(data.data);
        setDayTypeAmount(-1);
      })
      .catch(() => { });
  };

  const BindRevenueApproveGrid = (
    RevenueContrib = "",
    dateReceived = "",
    revreceiptno = "",
    revAmount = "",
    payinno = "",
    description = "",
    search = "",
    status = "Pending",
    statusChangeDate = "",
    postDate = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        AccountReceivable.GetRevenueFilter +
        `?RevenueContrib=${RevenueContrib}&dateReceived=${dateReceived}&revreceiptno=${revreceiptno}&revAmount=${revAmount}&payinno=${payinno}&description=${description}&status=Pending&statusChangeDate=${statusChangeDate}&postDate=${postDate}&search=${search}&skip=${cskip}&take=${ctake}&desc=${desc}&sortKey=${sortKey}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPageRevenueapproveTotal(data.total);
        if (ctake == 0) {
          setRevenueApprovePage({
            skip: 0,
            take: data.total,
          });
        }
        setRevenueApproveData(
          // eslint-disable-next-line eqeqeq
          data.data?.filter((x) => x?.codeValues?.value == "Pending")
        );
      })
      .catch(() => { });
  };

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const onRevenueApproveCheckBox = (event) => {
    setRevenueApproveColumnShow(!RevenueApproveColumnShow);
  };
  const RevenueMoreFilter = () => {
    setRevenueshowFilter(!RevenueshowFilter);
  };
  const RevenueApproveMoreFilter = () => {
    setRevenueApproveshowFilter(!RevenueApproveshowFilter);
  };
  const RevenueFilterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({ ...page, skip: 0 });
    setBindRevenueGrid({
      ...bindRevenueGrid,
      search: value,
      RevenueContrib: undefined,
      dateReceived: undefined,
      revreceiptno: undefined,
      revAmount: undefined,
      payinno: undefined,
      description: undefined,
      status: undefined,
      statusChangeDate: undefined,
      postDate: undefined,
      cskip: 0,
    });
  };

  const RevenueApproveFilterData = (e) => {
    let value = e.target.value;
    setRevenueApprovePage({ ...RevenueApprovePage, skip: 0 });
    setBindRevenueApproveGrid({
      ...bindRevenueApproveGrid,
      search: value,
      cskip: 0,
      RevenueContrib: undefined,
      dateReceived: undefined,
      revreceiptno: undefined,
      revAmount: undefined,
      payinno: undefined,
      description: undefined,
      status: undefined,
      statusChangeDate: undefined,
      postDate: undefined,
    });
  };

  const RevenueApproveFilterChange = (event) => {
    var RevenueContrib = "";
    var dateReceived = "";
    var revreceiptno = "";
    var revAmount = "";
    var payinno = "";
    var description = "";
    var status = "";
    var statusChangeDate = "";
    var postDate = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "countyRevenueContrib.name") {
          RevenueContrib = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "dateReceived") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          dateReceived = date;
        }
        if (event.filter.filters[i].field == "rev_Receipt_No") {
          revreceiptno = event.filter.filters[i].value;
        }
        if (
          event.filter.filters[i].field == "countyRevenueDetails.payoutnum"
        ) {
          payinno = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "rev_Amount") {
          revAmount = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "rev_Description") {
          description = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "status") {
          status = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "statusChangeDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          statusChangeDate = date;
        }
        if (event.filter.filters[i].field == "postDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          postDate = date;
        }
      }
    }
    setRevenueApprovePage({
      skip: 0,
      take: pageSizeRevenueApproveValue,
    });
    setBindRevenueApproveGrid({
      RevenueContrib: RevenueContrib,
      dateReceived: dateReceived,
      revreceiptno: revreceiptno,
      revAmount: revAmount,
      payinno: payinno,
      description: description,
      status: status,
      statusChangeDate: statusChangeDate,
      postDate: postDate,
      cskip: 0,
      search: undefined,
    });
    setRevenueApproveFilter(event.filter);
  };

  const RevenueFilterChange = (event) => {
    var RevenueContrib = "";
    var dateReceived = "";
    var revreceiptno = "";
    var revAmount = "";
    var payinno = "";
    var description = "";
    var status = "";
    var statusChangeDate = "";
    var postDate = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "countyRevenueContrib.name") {
          RevenueContrib = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "dateReceived") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          dateReceived = date;
        }
        if (event.filter.filters[i].field == "rev_Receipt_No") {
          revreceiptno = event.filter.filters[i].value;
        }
        if (
          event.filter.filters[i].field == "countyRevenueDetails.payoutnum"
        ) {
          payinno = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "rev_Amount") {
          revAmount = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "rev_Description") {
          description = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "status") {
          status = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "statusChangeDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          statusChangeDate = date;
        }
        if (event.filter.filters[i].field == "postDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          postDate = date;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindRevenueGrid({
      ...bindRevenueGrid,
      RevenueContrib: RevenueContrib,
      dateReceived: dateReceived,
      revreceiptno: revreceiptno,
      revAmount: revAmount,
      payinno: payinno,
      description: description,
      status: status,
      statusChangeDate: statusChangeDate,
      postDate: postDate,
      search: undefined,
      cskip: 0,
    });
    setFilter(event.filter);
  };

  const filterByDateDayType = (date) => {
    let dateformatyear = new Date(date.value).getFullYear();
    if (
      !date.value ||
      // eslint-disable-next-line eqeqeq
      (dateformatyear < 1961 && dateformatyear.toString().length == 4)
    ) {
      BindRevenueGrid();
      // eslint-disable-next-line eqeqeq
    } else if (dateformatyear.toString().length == 4) {
      let dateformat = new Date(date.value);
      let month =
        dateformat.getMonth() < 9
          ? "0" + (dateformat.getMonth() + 1)
          : dateformat.getMonth() + 1;
      let noDaydate =
        dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();

      axiosInstance({
        method: "GET",
        url: AccountReceivable.GetRevenueFilter + `?dayTapeDate=${noDaydate}`,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setPageTotal(data.total);
          setRevenueData(data.data);
          setDayTypeAmount(data.dayTapeAmount);
        })
        .catch(() => { });
    }
  };
  const RevenuePageChange = (event) => {
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

  const RevenueApprovePageChange = (event) => {
    let sortDetail = sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    if (event.page.take <= 50) {
      setPageSizeRevenueApproveValue(event.page.take);

      setBindRevenueApproveGrid({
        ...bindRevenueApproveGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
        desc: direction,
        sortKey: sortColumn,
      });

      setRevenueApprovePage({
        ...event.page,
      });
    } else {
      setPageSizeRevenueApproveValue("All");
      setBindRevenueApproveGrid({
        ...bindRevenueApproveGrid,
        cskip: 0,
        ctake: 0,
        desc: direction,
        sortKey: sortColumn,
      });
      setRevenueApprovePage({
        skip: 0,
        take: RevenueApproveData.length,
      });
    }
  };

  const filterByRBDInvoiceNo = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    dataItem.invoiceNo = dataItem.invoiceNo || "";
    dataItem.rev_BD_Check_No = dataItem.rev_BD_Check_No || "";

    axiosInstance({
      method: "GET",
      url:
        AccountReceivable.GetRevenueFilter +
        `?checkNo=${dataItem.rev_BD_Check_No}&invoiceNo=${dataItem.invoiceNo}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPageTotal(data.total);
        setRevenueData(data.data);
        setDayTypeAmount(-1);
        setAdvanceSearchVisible(false);
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const RevenueGridCommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.poNumber}
          onClick={(event) => handleContextMenu(event, props.dataItem)}
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

  const handleContextMenu = (e, data) => {
    e.preventDefault();
    setselectedRevenueRowId(data);
    RevenueOffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setRevenueShow(true);
    if (data && data.postDate) {
      setRevenueShowOptions(["view", "delete"]);
    } else {
      setRevenueShowOptions(["view", "edit", "delete"]);
    }
  };
  const RevenueContextMenuCloseMenu = () => {
    setRevenueShow(false);
    setRevenueShowOptions([]);
    setselectedRevenueRowId({});
  };
  const RevenueContextMenuOnSelect = (e) => {
    let id = +selectedRevenueRowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "view":
          navigate("/revenue-form", {
            state: { revenueId: selectedRevenueRowId.id, type: "view" },
          });
          break;
        case "edit":
          navigate("/revenue-form", {
            state: { revenueId: selectedRevenueRowId.id },
          });
          break;
        case "delete":
          openDeleteDialog(id);
          break;
        default:
          break;
      }
    }
  };

  const getUserInfo = () => {
    axiosInstance({
      method: "GET",
      url: AuthenticationEndPoints.GetUserInfo,
      withCredentials: false,
    })
      .then((response) => {
        let [firstName, lastName] = response.data.info?.split(" ");
        getEmployeeData(firstName, lastName);
      })
      .catch(() => { });
  };

  const getEmployeeData = (FirstName = "", LastName = "") => {
    axiosInstance({
      method: "Post",
      url:
        PayrollEndPoints.EmployeeFilter +
        "?FirstName=" +
        FirstName +
        "&&LastName=" +
        LastName,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let loginUser = data?.find(
          // eslint-disable-next-line eqeqeq
          (x) => x.firstName == FirstName && x.lastName == LastName
        );
        getRolesByUser(loginUser.userName);
      })
      .catch(() => { });
  };

  const getRolesByUser = (userName) => {
    axiosInstance({
      method: "POST",
      url: roleEndPoints.getRolesByUser + "?UserName=" + userName,
      withCredentials: false,
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);

  const [selectedState, setSelectedState] = React.useState({});
  const [selectedApproveRevenue, setSelectedApproveRevenue] = React.useState(
    []
  );
  const [checkboxData, setCheckboxData] = useState([]);

  const onRevenueSelectionChange = React.useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });
      if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
        setSelectedState(newSelectedState);
      } else {
        setSelectedState({});
      }
    },
    [selectedState]
  );

  const onRevenueApproveSelectionChange = React.useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedApproveRevenue,
        dataItemKey: DATA_ITEM_KEY,
      });
      let currentCheckBoxList = [...checkboxData];
      // eslint-disable-next-line eqeqeq
      let existRow = checkboxData?.findIndex((x) => event.dataItem.id == x?.id);
      // eslint-disable-next-line eqeqeq
      if (existRow == -1) {
        currentCheckBoxList.push(event.dataItem);
      } else {
        currentCheckBoxList.splice(existRow, 1);
      }
      setSelectedApproveRevenue(newSelectedState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedApproveRevenue]
  );

  const onHeaderSelectionChange = React.useCallback((event) => {
    const checkboxElement = event.syntheticEvent.target;
    const checked = checkboxElement.checked;
    const newSelectedState = {};
    event.dataItems.forEach((item) => {
      newSelectedState[idGetter(item)] = checked;
    });
    setCheckboxData(event.dataItems);
    setSelectedApproveRevenue(newSelectedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approveRevenue = () => {
    axiosInstance({
      method: "POST",
      url: AccountReceivable.approveRevenues,
      withCredentials: false,
      data: Object.keys(selectedApproveRevenue),
    })
      .then((response) => {
        setBindRevenueGrid({ ...bindRevenueGrid });
        setBindRevenueApproveGrid({ ...bindRevenueApproveGrid });
        setCheckboxData([]);
        setSelectedApproveRevenue([]);
      })
      .catch(() => { });
  };
  const openDeleteDialog = (id) => {
    setDeleteVisible(id);
  };
  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };
  const DeleteOnClick = () => {
    axiosInstance({
      method: "delete",
      url: AccountReceivable.Revenue + "/" + deleteVisible,
      withCredentials: false,
    })
      .then((response) => {
        closeDeleteDialog();
        BindRevenueGrid();
        setRevenueShow(false);
        setRevenueShowOptions([]);
      })
      .catch(() => { });
  };
  const postRevenueHandleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let startDate = new Date(dataItem.startDate);
    const startyear = startDate.getFullYear();
    const startmonth = String(startDate.getMonth() + 1).padStart(2, "0");
    const startday = String(startDate.getDate()).padStart(2, "0");
    const formatStartDate = `${startyear}-${startmonth}-${startday}`;

    let endDate = new Date(dataItem.endDate);
    const endyear = endDate.getFullYear();
    const endmonth = String(endDate.getMonth() + 1).padStart(2, "0");
    const endday = String(endDate.getDate()).padStart(2, "0");
    const formatEndDate = `${endyear}-${endmonth}-${endday}`;

    let postDate = new Date(dataItem.postDate);
    const postyear = postDate.getFullYear();
    const postmonth = String(postDate.getMonth() + 1).padStart(2, "0");
    const postday = String(postDate.getDate()).padStart(2, "0");
    const formatPostDate = `${postyear}-${postmonth}-${postday}`;

    axiosInstance({
      method: "POST",
      url:
        AccountReceivable.BatchPostRevenue +
        `?startDate=${formatStartDate}&endDate=${formatEndDate}&postDate=${formatPostDate}`,
      withCredentials: false,
    })
      .then((response) => {
        BindRevenueGrid();
        setShowPostRevenue(false);
        showSuccessNotification("Revenue posted successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const closePostRevenue = () => {
    setShowPostRevenue(false);
  };
  const [PostRevenueDisplay, setPostRevenueDisplay] = React.useState(false);

  const getConfigForPostRevenue = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/48",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setPostRevenueDisplay(value);
      })
      .catch(() => { });
  };

  const getConfigForRevenueApprove = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/46",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setRevenueApproveDisplay(value);
      })
      .catch(() => { });
  };

  const updateStartDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedStartDate(date.toString());
    localEndDateValidator({ startdate: dateformat });
  };

  const localEndDateValidator = ({ enddate, startdate }) => {
    const startDate = new Date(startdate ?? selectedStartDate);
    const endDate = new Date(enddate ?? selectedEndDate);
    if (!startDate) {
      setEndDateError("Please select start date first");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setEndDateError("End date should be greater than start date");
    } else {
      setEndDateError("");
    }
  };

  const updateEndDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedEndDate(date.toString());
    localEndDateValidator({ enddate: dateformat });
  };


  const yearOptions = Array.from(
    { length: 
      new Date().getFullYear() - 2010 + 1 },
    (_, i) => 
    new Date().getFullYear() - i
  );
  const years = ["Select Year", ...yearOptions];
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Account Receivable Revenue')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("AccountReceivableRevenueM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Accounting
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Accounts Receivable
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Revenue
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-9 d-flex align-items-center justify-content-between">
              <h3 className="mb-0">Revenue</h3>
              <div className="d-flex align-items-center ">
                {checkPrivialgeGroup("DayTapARRevenueD", 1) && (
                  <>
                    <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                      <h5 style={{ width: "140%" }} className="me-2 mb-0">
                        Day Tape Date:{" "}
                      </h5>
                    </span>
                    <span style={{ width: "40%" }} className="me-2">
                      <DatePicker
                        onChange={filterByDateDayType}
                        placeholder="Select"
                      />
                    </span>
                    {dayTypeAmount >= 0 ? (
                      <span
                        className="d-flex align-items-center"
                        style={{ marginLeft: "10px" }}
                      >
                        <h5 className="me-2 mb-0">Total Amount: </h5>
                        <Input
                          style={{ width: "40%" }}
                          value={
                            "$" +
                            dayTypeAmount
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                          }
                          disabled={true}
                        />
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            </div>
            <div className="col-sm-3 text-end">
              {checkPrivialgeGroup("PostARRevenueB", 2) &&
                PostRevenueDisplay && (
                  <Button
                    themeColor={"primary"}
                    className="k-button k-button-lg k-rounded-lg me-2"
                    onClick={() => setShowPostRevenue(true)}
                  >
                    Post Revenue
                  </Button>
                )}
              {checkPrivialgeGroup("AddARRevenueB", 2) && (
                <Button
                  themeColor={"primary"}
                  className="k-button k-button-lg k-rounded-lg"
                  onClick={() => navigate("/revenue-form")}
                >
                  <i className="fa-solid fa-plus"></i> Add Revenue
                </Button>
              )}
            </div>
          </div>
          {checkPrivialgeGroup("ARRevenueG", 1) && (
            <div className="row">
              <div className="col-sm-12">
                <div className="mt-3">
                  <Grid
                    resizable={true}
                    data={orderBy(
                      RevenueData.map((item) => ({
                        ...item,
                        [SELECTED_FIELD]: selectedState[idGetter(item)],
                      })),
                      sort
                    )}
                    filterable={RevenueshowFilter}
                    filter={filter}
                    onFilterChange={RevenueFilterChange}
                    skip={page.skip}
                    take={page.take}
                    total={pageTotal}
                    pageable={{
                      buttonCount: 4,
                      pageSizes: [10, 15, 50, "All"],
                      pageSizeValue: pageSizeValue,
                    }}
                    onPageChange={RevenuePageChange}
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      drag: false,
                      cell: false,
                      mode: "multiple",
                    }}
                    onSelectionChange={onRevenueSelectionChange}
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
                            onClick={RevenueMoreFilter}
                          >
                            <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                            &nbsp; More Filter
                          </Button>
                        </div>
                        <div className="col-sm-6 d-flex align-items-center justify-content-center">
                          <div className="col-3">
                            {checkPrivialgeGroup("SMIARRevenueCB", 1) && (
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
                          <div className="input-group" style={{ width: "50%" }}>
                            <Input
                              className="form-control border-end-0 border"
                              onChange={RevenueFilterData}
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
                          <div style={{ marginLeft: "1%" }}>
                            <Button
                              className="buttons-container-button"
                              fillMode="outline"
                              themeColor={"primary"}
                              onClick={() => setAdvanceSearchVisible(true)}
                            >
                              Advance Filter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GridToolbar>

                    <GridColumn
                      field="countyRevenueContrib.name"
                      title="Customer"
                    />
                    <GridColumn
                      field="dateReceived"
                      filter="date"
                      title="Received Date"
                      cell={(props) => {
                        const [year, month, day] = props.dataItem?.dateReceived
                          ? props.dataItem?.dateReceived
                            .split("T")[0]
                            .split("-")
                          : [null, null, null];
                        return (
                          <td>
                            {props.dataItem?.dateReceived
                              ? `${month}/${day}/${year}`
                              : null}
                          </td>
                        );
                      }}
                      editor="date"
                      format="{0:d}"
                      k-format="MM/DD/yyyy"
                    />

                    <GridColumn field="rev_Receipt_No" title="Receipt" />
                    <GridColumn
                      field="countyRevenueDetails.payoutnum"
                      title="Pay In No"
                    />
                    <GridColumn field="rev_Description" title="Description" />
                    <GridColumn
                      field="rev_Amount"
                      title="Amount"
                      format="{0:c2}"
                      headerClassName="header-right-align"
                      cell={(props) => {
                        var amount = props.dataItem.rev_Amount;
                        amount =
                          "$" +
                          amount
                            .toFixed(2)
                            .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                        return <td className="!k-text-right">{`${amount}`}</td>;
                      }}
                    />
                    {PostRevenueDisplay && (
                      <GridColumn
                        field="postDate"
                        title="Post Date"
                        filter="date"
                        cell={(props) => {
                          const [year, month, day] = props.dataItem?.postDate
                            ? props.dataItem?.postDate.split("T")[0].split("-")
                            : [null, null, null];
                          return (
                            <td>
                              {props.dataItem?.postDate
                                ? `${month}/${day}/${year}`
                                : null}
                            </td>
                          );
                        }}
                      />
                    )}
                    {RevenueApproveDisplay && (
                      <GridColumn
                        field="status"
                        title="Status"
                        cell={(props) => {
                          var status = props.dataItem.codeValues?.value;
                          return <td>{status}</td>;
                        }}
                      />
                    )}
                    {RevenueApproveDisplay && (
                      <GridColumn
                        field="statusChangeDate"
                        filter="date"
                        title="Status Change Date"
                        cell={(props) => {
                          const [year, month, day] = props.dataItem
                            ?.statusChangeDate
                            ? props.dataItem?.statusChangeDate
                              .split("T")[0]
                              .split("-")
                            : [null, null, null];
                          return (
                            <td>
                              {props.dataItem?.statusChangeDate
                                ? `${month}/${day}/${year}`
                                : null}
                            </td>
                          );
                        }}
                      />
                    )}
                    {columnShow && (
                      <GridColumn
                        field="createdDate"
                        title="Created Date"
                        cell={(props) => {
                          const [year, month, day] = props.dataItem?.createdDate
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
                    <GridColumn
                      cell={RevenueGridCommandCell}
                      filterable={false}
                    />
                  </Grid>
                  <ContextMenu
                    show={RevenueShow}
                    offset={RevenueOffset.current}
                    onSelect={RevenueContextMenuOnSelect}
                    onClose={RevenueContextMenuCloseMenu}
                  >
                    {checkPrivialgeGroup("ViewARRevenueCM", 1) &&
                      revenueSHowOptions.includes("view") && (
                        <MenuItem
                          text="View "
                          data={{
                            action: "view",
                          }}
                          icon="post"
                        />
                      )}
                    {checkPrivialgeGroup("EditARRevenueCM", 3) &&
                      revenueSHowOptions.includes("edit") && (
                        <MenuItem
                          text="Edit "
                          data={{
                            action: "edit",
                          }}
                          icon="edit"
                        />
                      )}
                    {checkPrivialgeGroup("DeleteARRevenueCM", 4) &&
                      revenueSHowOptions.includes("delete") && (
                        <MenuItem
                          text="Delete "
                          data={{
                            action: "delete",
                          }}
                          icon="delete"
                        />
                      )}
                  </ContextMenu>
                </div>
              </div>
            </div>
          )}

          {checkPrivialgeGroup("ARRevenueApproveG", 5) &&
            RevenueApproveDisplay && (
              <>
                <div className="row mt-5">
                  <div className="col-sm-8 d-flex align-items-center">
                    <h3>Approve Revenue</h3>
                  </div>
                  <div className="col-sm-4 text-end">
                    {checkPrivialgeGroup("ARRevenueApproveB", 5) && (
                      <Button
                        themeColor={"primary"}
                        className="k-button k-button-lg k-rounded-lg"
                        onClick={approveRevenue}
                        disabled={Object.keys(selectedApproveRevenue).length == 0}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <div className="mt-3">
                      <Grid
                        resizable={true}
                        data={orderBy(
                          RevenueApproveData.map((item) => ({
                            ...item,
                            [SELECTED_FIELD]:
                              selectedApproveRevenue[idGetter(item)],
                          })),
                          sort
                        )}
                        filterable={RevenueApproveshowFilter}
                        filter={RevenueApproveFilter}
                        onFilterChange={RevenueApproveFilterChange}
                        skip={RevenueApprovePage.skip}
                        take={RevenueApprovePage.take}
                        total={pageRevenueapproveTotal}
                        pageable={{
                          buttonCount: 4,
                          pageSizes: [10, 15, 50, "All"],
                          pageSizeValue: pageSizeRevenueApproveValue,
                        }}
                        onPageChange={RevenueApprovePageChange}
                        dataItemKey={DATA_ITEM_KEY}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          drag: false,
                          cell: false,
                          mode: "multiple",
                        }}
                        onSelectionChange={onRevenueApproveSelectionChange}
                        onHeaderSelectionChange={onHeaderSelectionChange}
                        sortable={true}
                        sort={RevenueApprovesort}
                        onSortChange={(e) => {
                          onSortRevenueApproveChange(e);
                        }}
                      >
                        <GridToolbar>
                          <div className="row col-sm-12">
                            <div className="col-sm-6 d-grid gap-3 d-md-block">
                              <Button
                                className="buttons-container-button"
                                fillMode="outline"
                                themeColor={"primary"}
                                onClick={RevenueApproveMoreFilter}
                              >
                                <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                                &nbsp; More Filter
                              </Button>
                            </div>
                            <div className="col-sm-6 d-flex align-items-center justify-content-center">
                              <div className="col-3">
                                {checkPrivialgeGroup("SMIARRCB", 1) && (
                                  <Checkbox
                                    type="checkbox"
                                    id="modifiedBy"
                                    name="modifiedBy"
                                    defaultChecked={RevenueApproveColumnShow}
                                    onChange={onRevenueApproveCheckBox}
                                    label={"Modified Info"}
                                  />
                                )}
                              </div>
                              <div
                                className="input-group"
                                style={{ width: "50%" }}
                              >
                                <Input
                                  className="form-control border-end-0 border"
                                  onChange={RevenueApproveFilterData}
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
                        <GridColumn
                          field={SELECTED_FIELD}
                          width="50px"
                          headerSelectionValue={
                            RevenueApproveData.findIndex(
                              (item) => !selectedApproveRevenue[idGetter(item)]
                            ) == -1
                          }
                        />
                        <GridColumn
                          field="countyRevenueContrib.name"
                          title="Customer"
                        />
                        <GridColumn
                          field="dateReceived"
                          filter="date"
                          title="Received Date"
                          cell={(props) => {
                            const [year, month, day] = props.dataItem
                              ?.dateReceived
                              ? props.dataItem?.dateReceived
                                .split("T")[0]
                                .split("-")
                              : [null, null, null];
                            return (
                              <td>
                                {props.dataItem?.dateReceived
                                  ? `${month}/${day}/${year}`
                                  : null}
                              </td>
                            );
                          }}
                          editor="date"
                          format="{0:d}"
                          k-format="MM/DD/yyyy"
                        />

                        <GridColumn field="rev_Receipt_No" title="Receipt" />
                        <GridColumn
                          field="countyRevenueDetails.payoutnum"
                          title="Pay In No"
                        />
                        <GridColumn
                          field="rev_Description"
                          title="Description"
                        />
                        <GridColumn
                          field="rev_Amount"
                          title="Amount"
                          format="{0:c2}"
                          headerClassName="header-right-align"
                          cell={(props) => {
                            var amount = props.dataItem.rev_Amount;
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
                        {PostRevenueDisplay && (
                          <GridColumn
                            field="postDate"
                            title="Post Date"
                            filter="date"
                            cell={(props) => {
                              const [year, month, day] = props.dataItem
                                ?.postDate
                                ? props.dataItem?.postDate
                                  .split("T")[0]
                                  .split("-")
                                : [null, null, null];
                              return (
                                <td>
                                  {props.dataItem?.postDate
                                    ? `${month}/${day}/${year}`
                                    : null}
                                </td>
                              );
                            }}
                          />
                        )}
                        <GridColumn
                          field="status"
                          title="Status"
                          filterable={false}
                          cell={(props) => {
                            var status = props.dataItem.codeValues?.value;
                            return <td>{status}</td>;
                          }}
                        />
                        <GridColumn
                          field="statusChangeDate"
                          title="Status Change Date"
                          filter="date"
                          cell={(props) => {
                            const [year, month, day] = props.dataItem
                              ?.statusChangeDate
                              ? props.dataItem?.statusChangeDate
                                .split("T")[0]
                                .split("-")
                              : [null, null, null];
                            return (
                              <td>
                                {props.dataItem?.statusChangeDate
                                  ? `${month}/${day}/${year}`
                                  : null}
                              </td>
                            );
                          }}
                        />
                        {RevenueApproveColumnShow && (
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
                        {RevenueApproveColumnShow && (
                          <GridColumn field="createdBy" title="Created By" />
                        )}
                        {RevenueApproveColumnShow && (
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
                        {RevenueApproveColumnShow && (
                          <GridColumn field="modifiedBy" title="Modified By" />
                        )}
                      </Grid>
                    </div>
                  </div>
                </div>
              </>
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
          {advanceSearchVisible && (
            <Dialog
              width={500}
              title={
                <div className="d-flex align-items-center justify-content-center">
                  <>
                    <i className="fa-solid"></i>
                    <span className="ms-2">Advance Search</span>
                  </>
                </div>
              }
              onClose={() => {
                setAdvanceSearchVisible(false);
              }}
            >
              <Form
                onSubmit={filterByRBDInvoiceNo}
                render={(formRenderProps) => (
                  <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                      <Field
                        id={"rev_BD_Check_No"}
                        name={"rev_BD_Check_No"}
                        label={"Revenue BD Check No"}
                        component={FormInput}
                      />
                      <Field
                        id={"invoiceNo"}
                        name={"invoiceNo"}
                        label={"Invoice No"}
                        component={FormInput}
                      />

                      <div className="k-form-buttons">
                        <Button
                          themeColor={"primary"}
                          className={"col-12"}
                          type={"submit"}
                          disabled={!formRenderProps.allowSubmit}
                        >
                          Search
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
      {showPostRevenue && (
        <Dialog
          width={600}
          title={
            <div className="d-flex align-items-center justify-content-center">
              <i className="fa-solid fa-plus"></i>
              <span className="ms-2">Post Revenue</span>
            </div>
          }
          onClose={closePostRevenue}
        >
          <Form
            onSubmit={postRevenueHandleSubmit}
            key={0}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={"k-form-fieldset"}>
                  <div>
                    <Field
                      id={"startDate"}
                      name={"startDate"}
                      label={"Start Date*"}
                      component={FormDatePicker}
                      validator={startDateValidator}
                      value={selectedStartDate}
                      onChange={updateStartDate}
                    />
                    <div className="">
                      <Field
                        id={"endDate"}
                        name={"endDate"}
                        label={"End Date*"}
                        component={FormDatePicker}
                        onChange={updateEndDate}
                      />
                      {endDateError && (
                        <p
                          className="text-danger mb-0 p-0"
                          style={{ fontSize: "12px" }}
                        >
                          {endDateError}
                        </p>
                      )}
                    </div>

                    <Field
                      id={"postDate"}
                      name={"postDate"}
                      label={"Post Date*"}
                      component={FormDatePicker}
                      validator={activeDateValidator}
                    />
                  </div>

                  <div className="k-form-buttons">
                    <Button className={"col-5 me-2"} type={"button"}>
                      Cancel
                    </Button>
                    <Button
                      themeColor={"primary"}
                      className={"col-5"}
                      type={"submit"}
                      disabled={!formRenderProps.allowSubmit || endDateError}
                    >
                      Post Revenue
                    </Button>
                  </div>
                </fieldset>
              </FormElement>
            )}
          />
        </Dialog>
      )}
    </>
  );
}
