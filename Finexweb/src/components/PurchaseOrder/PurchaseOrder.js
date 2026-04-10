import { getter } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
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
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ConfigurationEndPoints,
  IHPOEndPoints,
  PurchaseOrderEndPOints,
  ReportsEndPoints,
  VoucherEndPoints
} from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import PdfViewer from "../Reports/pdfViewer/PdfViewer";
import Constants from "../common/Constants";
import { DropdownFilterCell } from "../common/Filter/DropdownFilterCell";
import {
  ColumnDatePicker,
  FormDatePicker,
  FormNumericTextBox
} from "../form-components";
import {
  activeDateValidator,
  startDateValidator
} from "../validators";
import AfterPostVoucherModal from "./Modal/AfterPostVoucherModal";
import IHPOUploadModal from "./Modal/IHPOUploadModal";
import { CheckBoxCell } from "../cells/CheckBoxCell";

const statusValue = ["Approved", "Rejected"];
const DropdownFilterCel = (props) => (
  <DropdownFilterCell {...props} data={statusValue} defaultItem={"select"} />
);
export default function PurchaseOrder() {
  const navigate = useNavigate();



  const [totalpage, setTotalPage] = React.useState(0);
  const [IHPOtoatlpage, setIHPOTotalpage] = React.useState(0);
  const [Vouchertoatlpage, setVoucherTotalpage] = React.useState(0);



  const [show, setShow] = React.useState(false);
  const [IHPOshow, setIHPOShow] = React.useState(false);
  const [Vouchershow, setVoucherShow] = React.useState(false);

  const yearOptions = Array.from(
    { length: 
      new Date().getFullYear() - 2010 + 1 },
    (_, i) => 
    new Date().getFullYear() - i
  );
  const years = ["Select Year", ...yearOptions];
  const PurchaseOrderG = JSON.parse(localStorage.getItem("PurchaseOrderG"));
  const savedPO =  PurchaseOrderG?.selectedState ? (Object.keys(PurchaseOrderG?.selectedState)[0] ?? 0) : 0;

  const [selectedRowId, setselectedRowId] = React.useState(0);
  const [selectedIHPORowId, setselectedIHPORowId] = React.useState(0);
  const [selectedVoucherRowId, setselectedVoucherRowId] = React.useState(0);
  const [approveVoucherDisplay, setApproveVoucherDisplay] = useState(false);
  const [PoId, setPoId] = useState(savedPO);
  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [endDateError, setEndDateError] = useState("");

  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const ihpooffset = React.useRef({
    left: 0,
    top: 0,
  });
  const Voucheroffset = React.useRef({
    left: 0,
    top: 0,
  });

  const [POGriddata, setPOGriddata] = React.useState([]);
  const [IHPOGriddata, setIHPOGriddata] = useState([]);
  const [VoucherGriddata, setVoucherGriddata] = useState([]);

  const [IHPODisplay, setIHPODisplay] = useState(false);
  const [AllowVoucherIfSupritendentApproved, setAllowVoucherIfSupritendentApproved] = useState(false);
  const [showPostVoucher, setShowPostVoucher] = useState(false);

  const [showAfterPostVoucherModal, setShowAfterPostVoucherModal] =
    useState(false);
  const [showAfterPostVoucherData, setShowAfterPostVoucherData] = useState([]);

  const closeShowAfterPostVoucherModal = () => {
    setShowAfterPostVoucherModal(false);
  };

  // PO

  const [bindPOGrid, setBindPOGrid] = useState(JSON.parse(localStorage.getItem("PurchaseOrderG")) || {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize
  });


  const initialDataState = {
    skip: bindPOGrid && bindPOGrid.skip ? bindPOGrid.skip : 0,
    take: bindPOGrid && bindPOGrid.take ? bindPOGrid.take : Constants.KendoGrid.defaultPageSize,
  };
  const [poformKey, setPOFormKey] = React.useState(1);
  const [ShowPODialog, setShowPODialog] = useState(false);
  const [formInit, setFormInit] = useState({});   
  const handleShowPODialog = (poId) => {
    setFormInit(prev => ({...prev, poId:poId}))
    setShowPODialog(true);
  };
  const handleShowPODialogClose = () => {
      setFormInit({});
      setShowPODialog(false);
    };
  const [page, setPage] = React.useState(initialDataState);
  const [POPageSizeValue, setPOPageSizeValue] = React.useState();

  const [columnShow, setColumnShow] = useState(bindPOGrid.modifiedBy);

  const [POFilter, setPOFilter] = React.useState(bindPOGrid && bindPOGrid.filters ? bindPOGrid.filters : undefined);
  const [POYearFilter, setPOYearFilter] = React.useState(bindPOGrid.yearFilter ? bindPOGrid.yearFilter : years[1]);
  const [POshowFilter, setPOshowFilter] = React.useState(bindPOGrid.moreFilter ? bindPOGrid.moreFilter : false);
  const [selectedState, setSelectedState] = React.useState(bindPOGrid.selectedState ? bindPOGrid.selectedState : {});

  const initialPOSort = bindPOGrid && bindPOGrid.sort && bindPOGrid.sort.length
    ? bindPOGrid.sort
    : [
      {
        field: "modifiedDate",
        dir: "desc",
      },
    ];
  const [poSort, setPOSort] = useState(initialPOSort);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindPOGrid) {
        localStorage.setItem("PurchaseOrderG", JSON.stringify(bindPOGrid))
        getPurchaseOrder(
          bindPOGrid.poNumber,
          bindPOGrid.vendorName,
          bindPOGrid.description,
          bindPOGrid.poAmount,
          bindPOGrid.balance,
          bindPOGrid.cac,
          bindPOGrid.openDate,
          bindPOGrid.closeDate,
          bindPOGrid.search,
          bindPOGrid.skip,
          bindPOGrid.take == "All" ? 0 : bindPOGrid.take,
          bindPOGrid.desc,
          bindPOGrid.sortKey,
          bindPOGrid.poComplete
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindPOGrid, POYearFilter]);


  // IHPO

  const [bindIHPOGrid, setBindIHPOGrid] = useState(JSON.parse(localStorage.getItem("IHPOG")) || {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize
  });

  const initialIHPODataState = {
    skip: bindIHPOGrid && bindIHPOGrid.skip ? bindIHPOGrid.skip : 0,
    take: bindIHPOGrid && bindIHPOGrid.take ? bindIHPOGrid.take : Constants.KendoGrid.defaultPageSize,
  };

  const [IHPOpage, setIHPOpage] = React.useState(initialIHPODataState);
  const [IHPOPageSizeValue, setIHPOPageSizeValue] = React.useState();

  const [ihpoColumnShow, setIhpoColumnShow] = useState(false);

  const [IHPOFilter, setIHPOFilter] = React.useState(bindIHPOGrid && bindIHPOGrid.filters ? bindIHPOGrid.filters : undefined);
  const [IHPOYearFilter, setIHPOYearFilter] = React.useState(bindIHPOGrid.yearFilter ? bindIHPOGrid.yearFilter : years[1]);
  const [IHPOshowFilter, setIHPOshowFilter] = React.useState(bindIHPOGrid.moreFilter ? bindIHPOGrid.moreFilter : false);
  const [ihpoSelectedState, setihpoSelectedState] = React.useState(bindIHPOGrid.selectedState ? bindIHPOGrid.selectedState : {});


  const initialIHPOSort = bindIHPOGrid && bindIHPOGrid.sort && bindIHPOGrid.sort.length
    ? bindIHPOGrid.sort
    : [
      {
        field: "modifiedDate",
        dir: "desc",
      },
    ];
  const [ihpoSort, setIHPOSort] = useState(initialIHPOSort);

  useEffect(() => {
    if (IHPODisplay) {
      const getData = setTimeout(() => {
        if (bindIHPOGrid) {
          localStorage.setItem("IHPOG", JSON.stringify(bindIHPOGrid))
          getIHPO(
            bindIHPOGrid.ihpoNo,
            bindIHPOGrid.vendor,
            bindIHPOGrid.description,
            bindIHPOGrid.total,
            bindIHPOGrid.balance,
            bindIHPOGrid.status,
            bindIHPOGrid.search,
            bindIHPOGrid.poId,
            bindIHPOGrid.reqDate,
            bindIHPOGrid.reqDateComplete,
            bindIHPOGrid.skip,
            bindIHPOGrid.take == "All" ? 0 : bindIHPOGrid.take,
            bindIHPOGrid.desc,
            bindIHPOGrid.sortKey,
            bindIHPOGrid.poNumber,
            bindIHPOGrid.ihpoComplete
          );
        }
      }, 500);

      return () => clearTimeout(getData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindIHPOGrid, IHPOYearFilter, IHPODisplay]);


  // VOUCHER

  const [bindVoucherGrid, setBindVoucherGrid] = useState(JSON.parse(localStorage.getItem("VoucherG")) || {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize
  });

  const initialVendorDataState = {
    skip: bindVoucherGrid && bindVoucherGrid.skip ? bindVoucherGrid.skip : 0,
    take: bindVoucherGrid && bindVoucherGrid.take ? bindVoucherGrid.take : Constants.KendoGrid.defaultPageSize,
  };

  const [vendorpage, setVendorPage] = React.useState(initialVendorDataState);
  const [VoucherPageSizeValue, setVoucherPageSizeValue] = React.useState();

  const [voucherColumnShow, setVoucherColumnShow] = useState(bindVoucherGrid.modifiedBy);

  const [VoucherFilter, setVoucherFilter] = React.useState(bindVoucherGrid && bindVoucherGrid.filters ? bindVoucherGrid.filters : undefined);
  const [VoucherYearFilter, setVoucherYearFilter] =
    React.useState(bindVoucherGrid.yearFilter ? bindVoucherGrid.yearFilter : years[1]);
  const [VouchershowFilter, setVouchershowFilter] = React.useState(bindVoucherGrid.moreFilter ? bindVoucherGrid.moreFilter : false);

  const initialVoucherSort = bindVoucherGrid && bindVoucherGrid.sort && bindVoucherGrid.sort.length
    ? bindVoucherGrid.sort
    : [
      {
        field: "modifiedDate",
        dir: "desc",
      },
    ];
  const [voucherSort, setVoucherSort] = useState(initialVoucherSort);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindVoucherGrid) {
        localStorage.setItem("VoucherG", JSON.stringify(bindVoucherGrid))
        getVoucherFilterList(
          bindVoucherGrid.VoucherVouchNo,
          bindVoucherGrid.name,
          bindVoucherGrid.VoucherDescription,
          bindVoucherGrid.VoucherAmount,
          bindVoucherGrid.VoucherBalance,
          bindVoucherGrid.search,
          bindVoucherGrid.writtenDate,
          bindVoucherGrid.postDate,
          bindVoucherGrid.approve,
          bindVoucherGrid.approvalDate,
          bindVoucherGrid.poId,
          bindVoucherGrid.skip,
          bindVoucherGrid.take == "All" ? 0 : bindVoucherGrid.take,
          bindVoucherGrid.desc,
          bindVoucherGrid.sortKey,
          bindVoucherGrid.ihpoId,
          bindVoucherGrid.poNumber
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindVoucherGrid, VoucherYearFilter]);



  const [, setPOSearchtext] = useState("");
  const [, setIHPOSearchtext] = useState("");
  const [, setVoucherSearchtext] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [pdfURL, setPdfURL] = useState("");

  useEffect(() => {
    if (pdfURL !== "") {
      setIsOpen(true);
    }
  }, [pdfURL]);

  React.useEffect(() => {
    getConfig();
    getConfigForApproveBatch();
    getSupritendentApprovedConfig();
    // setPOYearFilter(years[1]);
    // setIHPOYearFilter(years[1]);
    // setVoucherYearFilter(years[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
    setBindPOGrid({
      ...bindPOGrid,
      modifiedBy: !columnShow
    })
  };
  const onIhpoCheckBox = (event) => {
    setIhpoColumnShow(!ihpoColumnShow);
    setBindIHPOGrid({
      ...bindIHPOGrid,
      modifiedBy: !ihpoColumnShow
    })
  };
  const onVoucherCheckBox = (event) => {
    setVoucherColumnShow(!voucherColumnShow);
    setBindVoucherGrid({
      ...bindIHPOGrid,
      modifiedBy: !voucherColumnShow
    })
  };
  const getConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/2",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setIHPODisplay(value);
      })
      .catch(() => { });
  };

  const getSupritendentApprovedConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/11",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setAllowVoucherIfSupritendentApproved(value);
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
        setApproveVoucherDisplay(value);
      })
      .catch(() => { });
  };

  const onPOSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setPOSort(event.sort);
    setBindPOGrid({
      ...bindPOGrid,
      desc: direction,
      sortKey: sortColumn,
      sort: event.sort
    });
  };

  const getPurchaseOrder = (
    poNumber = "",
    vendorName = "",
    description = "",
    poAmount = "",
    balance = "",
    cac = "",
    openDate = "",
    closeDate = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate",
    poComplete = false
  ) => {
    const filterYear = POYearFilter == "Select Year" ? "" : POYearFilter;
    let url =
      "?poNumber=" +
      poNumber +
      "&&vendorName=" +
      vendorName +
      "&&description=" +
      description +
      "&&poAmount=" +
      poAmount +
      "&&balance=" +
      balance +
      "&&caccode=" +
      cac +
      "&&openDate=" +
      openDate +
      "&&closeDate=" +
      closeDate +
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
      "&&poComplete=" +
      poComplete +
      "&&year=" +
      filterYear;
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrder + url,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPOGriddata(data.data);
        setTotalPage(data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: data.total,
          });
        }
      })
      .catch(() => { });
  };

  const onIHPOSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setIHPOSort(event.sort);
    setBindIHPOGrid({
      ...bindIHPOGrid,
      poId: PoId,
      desc: direction,
      sortKey: sortColumn,
      skip: 0,
      take: IHPOpage.take,
      sort: event.sort
    });
  };

  const getIHPO = (
    ihpoNo = "",
    vendor = "",
    description = "",
    total = "",
    balance = "",
    Status = "",
    search = "",
    poId = 0,
    reqDate = "",
    reqDateComplete = "",
    cskip = IHPOpage.skip,
    ctake = IHPOpage.take,
    desc = "true",
    sortKey = "modifiedDate",
    poNumber = "",
    ihpoComplete =  false
  ) => {

    if (IHPODisplay) {
      let url = `?ihpoNumber=${ihpoNo}&&vendorname=${vendor}&&description=${description}&&reTotal=${total}&&reBalance=${balance}&&Status=${Status}&&search=${search}&&poId=${poId}&&reqDate=${reqDate}&&reqDateComplete=${reqDateComplete}&&skip=${cskip}&&take=${ctake}&&desc=${desc}&&sortKey=${sortKey}&&forApproval=false&&poNumber=${poNumber}&&year=${IHPOYearFilter == "Select Year" ? "" : IHPOYearFilter}&&ihpoComplete=${ihpoComplete}`;
      axiosInstance({
        method: "GET",
        url: IHPOEndPoints.GetIHPO + url,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setIHPOGriddata(data.data);
          if (ctake == 0) {
            setIHPOpage({
              skip: 0,
              take: data.total,
            });
          }
          setIHPOTotalpage(data.total);
        })
        .catch(() => { });
    }
  };

  const fetchAfterPostVoucherData = async () => {
    let url = `?skip=${0}&take=${20}`;

    return axiosInstance({
      method: "GET",
      url: VoucherEndPoints.GetVoucher + url,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setShowAfterPostVoucherData(data);
        setShowAfterPostVoucherModal(true);
        setShowPostVoucher(false);
      })
      .catch(() => { });
  };

  const onVoucherSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setVoucherSort(event.sort);

    setBindVoucherGrid({
      ...bindVoucherGrid,
      poId: PoId,
      skip: 0,
      take: 10,
      desc: direction,
      sortKey: sortColumn,
      sort: event.sort
    });
  };

  const getVoucherFilterList = (
    VoucherVouchNo = "",
    name = "",
    VoucherDescription = "",
    VoucherAmount = "",
    VoucherBalance = "",
    search = "",
    writtenDate = "",
    postDate = "",
    approve = "",
    approvalDate = "",
    poId = 0,
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate",
    ihpoId = 0,
    poNumber = ""
  ) => {
    let url = `?VoucherVouchNo=${VoucherVouchNo}&name=${name}&VoucherDescription=${VoucherDescription}&VoucherAmount=${VoucherAmount}&VoucherBalance=${VoucherBalance}&search=${search}&writtenDate=${writtenDate}&postDate=${postDate}&approve=${approve}&approvalDate=${approvalDate}&poId=${poId}&skip=${cskip}&take=${ctake}&&desc=${desc}&&sortKey=${sortKey}&&ihpoId=${ihpoId}&&poNumber=${poNumber}&&year=${VoucherYearFilter == "Select Year" ? "" : VoucherYearFilter}`;
    axiosInstance({
      method: "Post",
      url: VoucherEndPoints.GetVoucherFilter + url,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setVoucherGriddata(data.data);
        setVoucherTotalpage(data.total);
        if (ctake == 0) {
          setVendorPage({
            skip: 0,
            take: data.total,
          });
        }
      })
      .catch(() => { });
  };

  const POMoreFilter = () => {
    setPOshowFilter(!POshowFilter);
    setBindPOGrid({
      ...bindPOGrid,
      moreFilter: !POshowFilter
    })
  };

  const IHPOMoreFilter = () => {
    setIHPOshowFilter(!IHPOshowFilter);
    setBindIHPOGrid({
      ...bindIHPOGrid,
      moreFilter: !IHPOshowFilter
    })
  };

  const VoucherMoreFilter = () => {
    setVouchershowFilter(!VouchershowFilter);
    setBindVoucherGrid({
      ...bindVoucherGrid,
      moreFilter: !VouchershowFilter
    })
  };

  const POSearchData = (e) => {
    let value = e.target.value;

    setselectedIHPORowId(0)
    setselectedVoucherRowId(0)
    setselectedRowId(0)
    setSelectedState({})
    setihpoSelectedState({})

    setPOSearchtext(value);
    setPage({ ...page, skip: 0 });

    setPoId(0)

    setBindPOGrid({
      ...bindPOGrid,
      skip: 0,
      search: value,
      selectedState: {}
    });

    setBindIHPOGrid({
      ...bindIHPOGrid,
      selectedState: {},
    })

    setBindVoucherGrid({
      ...bindVoucherGrid,
      ihpoId: 0,
    });

  };

  const POFilterData = (event) => {
    var poNumber = "";
    var name = "";
    var poDescription = "";
    var poAmount = "";
    var poBalance = "";
    var cac = "";
    var openDate = "";
    var closeDate = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "poNumber") {
          poNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "countyPODetails.vendor.name") {
          name = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "poDescription") {
          poDescription = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "countyPOPricing.poAmount") {
          poAmount = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "countyPOPricing.poBalance") {
          poBalance = event.filter.filters[i].value;
        }
        if (
          event.filter.filters[i].field ==
          "countyPODetails.accountingCode.countyExpenseCode"
        ) {
          cac = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "poOpenDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          openDate = date;
        }
        if (event.filter.filters[i].field == "poCompleteDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          closeDate = date;
        }
      }
    }
    setPage({
      skip: 0,
      take: POPageSizeValue,
    });


    setPoId(0)


    setselectedIHPORowId(0)
    setselectedVoucherRowId(0)
    setselectedRowId(0)
    setSelectedState({})
    setihpoSelectedState({})

    setBindPOGrid({
      ...bindPOGrid,
      search: undefined,
      poNumber: poNumber,
      vendorName: name,
      description: poDescription,
      poAmount: poAmount,
      balance: poBalance,
      cac: cac,
      openDate: openDate,
      closeDate: closeDate,
      skip: 0,
      take: bindPOGrid.ctake ? bindPOGrid.ctake : Constants.KendoGrid.defaultPageSize,
      filters: event.filter,
      selectedState: {}
    });

    setBindIHPOGrid({
      ...bindIHPOGrid,
      selectedState: {}
    })

    setBindVoucherGrid({
      ...bindVoucherGrid,
      ihpoId: 0,
    });

    setPOFilter(event.filter);
  };

  const IHPOSearchData = (e) => {
    let value = e.target.value;
    setIHPOSearchtext(value);
    setIHPOpage({
      ...IHPOpage,
      skip: 0,
    });

    setBindVoucherGrid({
      ...bindVoucherGrid,
      ihpoId: 0,
    });

    setselectedIHPORowId(0)
    setselectedVoucherRowId(0)
    setihpoSelectedState({})

    setBindIHPOGrid({
      ...bindIHPOGrid,
      search: value,
      ihpoNo: undefined,
      vendor: undefined,
      description: undefined,
      total: undefined,
      balance: undefined,
      status: undefined,
      reqDate: undefined,
      reqDateComplete: undefined,
      poNumber: undefined,
      poId: PoId,
      skip: 0,
      selectedState: {}
    });
  };

  const IHPOFilterData = (event) => {
    var ihpoNo = "";
    var vendor = "";
    var description = "";
    var total = "";
    var balance = "";
    var status = "";
    var reqDate = "";
    var reqDateComplete = "";
    var poNumber = "";
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
        if (event.filter.filters[i].field == "statusMessage") {
          status = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "reqDate") {
          let dateValue = event.filter.filters[i].value;
          let dateformat = new Date(dateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          reqDate = date;
        }
        if (event.filter.filters[i].field == "reqDateComplete") {
          let dateValue = event.filter.filters[i].value;
          let dateformat = new Date(dateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          reqDateComplete = date;
        }
        if (event.filter.filters[i].field == "countyPO.poNumber") {
          poNumber = event.filter.filters[i].value;
        }
      }
    }
    setIHPOpage({
      skip: 0,
      take: IHPOpage.take,
    });

    setselectedIHPORowId(0)
    setselectedVoucherRowId(0)
    setihpoSelectedState({})


    setBindVoucherGrid({
      ...bindVoucherGrid,
      ihpoId: 0,
    });


    setBindIHPOGrid({
      ...bindIHPOGrid,
      ihpoNo: ihpoNo,
      vendor: vendor,
      description: description,
      total: total,
      balance: balance,
      status: status,
      poId: PoId,
      reqDate: reqDate,
      reqDateComplete,
      skip: 0,
      poNumber: poNumber,
      filters: event.filter,
      selectedState: {}
    });
    setIHPOFilter(event.filter);
  };

  const VoucherSearchData = (e) => {
    let value = e.target.value;
    setVoucherSearchtext(value);
    setVendorPage({
      ...page,
      skip: 0,
    });

    setselectedVoucherRowId(0)

    setBindVoucherGrid({
      ...bindVoucherGrid,
      search: value,
      poId: PoId,
      skip: 0
    });
  };

  const VoucherFilterData = (event) => {
    var VoucherVouchNo = "";
    var name = "";
    var VoucherDescription = "";
    var VoucherAmount = "";
    var VoucherBalance = "";
    var voucherWrittenDate = "";
    var postDate = "";
    var poNumber = "";
    var approve = "";
    var approvalDate = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "voucherVouchNo") {
          VoucherVouchNo = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "vendor.name") {
          name = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "voucherDescription") {
          VoucherDescription = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "voucherAmount") {
          VoucherAmount = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "voucherBalance") {
          VoucherBalance = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "voucherWrittenDate") {
          let dateValue = event.filter.filters[i].value;
          let dateformat = new Date(dateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          voucherWrittenDate = date;
        }
        if (event.filter.filters[i].field == "postDate") {
          let dateValue = event.filter.filters[i].value;
          let dateformat = new Date(dateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          postDate = date;
        }
        if (event.filter.filters[i].field == "countyPO.poNumber") {
          poNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "approved") {
          approve = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "approvalDate") {
          let dateValue = event.filter.filters[i].value;
          let dateformat = new Date(dateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          approvalDate = date;
        }
      }
    }
    setVendorPage({
      skip: 0,
      take: vendorpage.take,
    });


    setselectedVoucherRowId(0)

    setBindVoucherGrid({
      ...bindVoucherGrid,
      VoucherVouchNo: VoucherVouchNo,
      name: name,
      VoucherDescription: VoucherDescription,
      VoucherAmount: VoucherAmount,
      VoucherBalance: VoucherBalance,
      writtenDate: voucherWrittenDate,
      postDate: postDate,
      approve: approve,
      approvalDate: approvalDate,
      poId: PoId,
      skip: 0,
      poNumber: poNumber,
      filters: event.filter
    });
    setVoucherFilter(event.filter);
  };

  const POPageChange = (event) => {
    if (event.page.take <= 50) {
      setPOPageSizeValue(event.page.take);
      setBindPOGrid({
        ...bindPOGrid,
        skip: event.page.skip,
        take: event.page.take,
      });
      setPage({
        skip: event.page.skip,
        take: event.page.take,
      });
    } else {
      setPOPageSizeValue("All");
      setBindPOGrid({ ...bindPOGrid, take: 0, skip: 0 });
      setPage({
        skip: 0,
        take: totalpage,
      });
    }
  };

  const IHPOPageChange = (event) => {
    if (event.page.take <= 50) {
      setIHPOPageSizeValue(event.page.take);
      setBindIHPOGrid({
        ...bindIHPOGrid,
        poId: PoId,
        skip: event.page.skip,
        take: event.page.take,
      });
      setIHPOpage({
        ...event.page,
      });
    } else {
      setIHPOPageSizeValue("All");
      setBindIHPOGrid({
        ...bindIHPOGrid,
        cskip: 0,
        ctake: 0,
      });
      setIHPOpage({
        skip: 0,
        take: 0,
      });
    }
  };

  const VoucherPageChange = (event) => {
    if (event.page.take <= 50) {
      setVoucherPageSizeValue(event.page.take);
      setBindVoucherGrid({
        ...bindVoucherGrid,
        poId: PoId,
        skip: event.page.skip,
        take: event.page.take,
      });
      setVendorPage({
        ...event.page,
      });
    } else {
      setVoucherPageSizeValue("All");
      setBindVoucherGrid({ ...bindVoucherGrid, take: 0, skip: 0 });
    }
  };

  //Custom Cell to bind ContextMenu for po Grid
  const POGridCommandCell = (props) => (
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

  const IHPOGridCommandCell = (props) => {
    return (
      <>
        <td className="k-command-cell">
          <Button
            id={props.dataItem.ihpo?.id}
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
  };

  const VoucherGridCommandCell = (props) => {
    return (
      <>
        <td className="k-command-cell">
          <Button
            id={props.dataItem.id}
            onClick={(event) => handleVoucherContextMenu(event, props.dataItem)}
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
  };

  const handleContextMenu = (e, data) => {
    e.preventDefault();
    setselectedRowId(data);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };
  const handleihpoContextMenu = (e, data) => {
    e.preventDefault();
    if (AllowVoucherIfSupritendentApproved) {
      setShowVoucherActionBtn(data.statusMessage?.toLowerCase() == "superintendent approved");
    }
    else if (
      // eslint-disable-next-line eqeqeq
      data.statusMessage?.toLowerCase() == "fiscaloffice approved" ||
      // eslint-disable-next-line eqeqeq
      data.statusMessage?.toLowerCase() == "superintendent approved"
    ) {
      setShowVoucherActionBtn(true);
    } else {
      setShowVoucherActionBtn(false);
    }
    setselectedIHPORowId(data);
    ihpooffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setIHPOShow(true);
  };
  const handleVoucherContextMenu = (e, data) => {
    e.preventDefault();
    setselectedVoucherRowId(data);
    Voucheroffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setVoucherShow(true);
  };

  const [ihpoUploadModalData, setIHPOUploadModalData] = useState({});
  const [showIHPOUploadModal, setShowIHPOUploadModal] = useState(false);

  const closeSetShowIHPOUploadModal = () => {
    setShowIHPOUploadModal(false);
  };

  const POContextMenuOnSelect = (e) => {
    let id = +selectedRowId.id;
    let poId = +selectedRowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "view":
          navigate("/addpurchaseorder", {
            state: {
              poNumber: selectedRowId.poNumber,
              poId: selectedRowId.id,
              type: "view",
            },
          });
          break;
        case "edit":
          navigate("/addpurchaseorder", {
            state: {
              poNumber: selectedRowId.poNumber,
              poId: selectedRowId.id,
              type: "edit",
            },
          });
          break;
        case "printpo":
          downloadPOPDF("PO", selectedRowId);
          break;
        case "delete":
          axiosInstance({
            method: "delete",
            url: PurchaseOrderEndPOints.PurchaseOrder + "/" + id,
            withCredentials: false,
          })
            .then((response) => {
              setBindPOGrid({ ...bindPOGrid });
              setShow(false);
              showSuccessNotification("Deleted successfully");
            })
            .catch(() => { });
          break;
          case "openPo":
          axiosInstance({
            method: "PUT",
            url: PurchaseOrderEndPOints.OpenPo + "/" + poId,
            withCredentials: false,
          })
            .then((response) => {
              setBindPOGrid({ ...bindPOGrid });
              showSuccessNotification("Po opened successfully");
            })
            .catch(() => { });
          break;
          case "closePo":
           handleShowPODialog(poId)
          break;
        case "voucher":
          navigate("/addVoucher", {
            state: { poNumber: selectedRowId.poNumber, po: selectedRowId },
          });
          break;
        default:
          break;
      }
    }
  };
  const POContextMenuCloseMenu = () => {
    setShow(false);
    setselectedRowId({});
  };

  useEffect(() => {
    setBindVoucherGrid({
      ...bindVoucherGrid,
      poId: PoId,
    });

    setBindIHPOGrid({
      ...bindIHPOGrid,
      poId: PoId,
    });

  }, [PoId])

  const [showVoucherActionBtn, setShowVoucherActionBtn] = useState(false);

  const IHPOContextMenuOnSelect = (e) => {
    let id = +selectedIHPORowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "view":
          navigate("/requestIHPO", {
            state: {
              ihpoNumber: selectedIHPORowId.reqNumber,
              ihpoId: selectedIHPORowId.id,
              type: "view",
            },
          });
          break;
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
              setBindIHPOGrid({ ...bindIHPOGrid });
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
        case "voucher":
          setIHPOUploadModalData({
            ihpoNumber: selectedIHPORowId.reqNumber,
            ihpoId: selectedIHPORowId.id,
            ihpo: selectedIHPORowId,
          });
          setShowIHPOUploadModal(true);
          break;
          
          case "closeIHPO":
            axiosInstance({
              method: "put",
              url: IHPOEndPoints.CloseIHPO + "/" + id,
              withCredentials: false,
            })
              .then((response) => {
                setBindIHPOGrid({ ...bindIHPOGrid });
                showSuccessNotification("IHPO closed successfully");
              })
              .catch(() => { });
            break;
            case "openIHPO":
              axiosInstance({
                method: "put",
                url: IHPOEndPoints.OpenIHPO + "/" + id,
                withCredentials: false,
              })
                .then((response) => {
                  setBindIHPOGrid({ ...bindIHPOGrid });
                  showSuccessNotification("IHPO opened successfully");
                })
                .catch(() => { });
              break;
            case "approveAsSuperintendent":
              axiosInstance({
                method: "put",
                url: IHPOEndPoints.ApproveAsSuperintendent + "/" + id,
                withCredentials: false,
              })
                .then((response) => {
                  setBindIHPOGrid({ ...bindIHPOGrid });
                  showSuccessNotification("IHPO ApproveAsSuperintendent successfully");
                })
                .catch(() => { });
              break;
        default:
          break;
      }
    }
  };
  const IHPOContextMenuCloseMenu = () => {
    setIHPOShow(false);
    setselectedIHPORowId({});
  };

  const VoucherContextMenuOnSelect = (e) => {
    let id = +selectedVoucherRowId.id;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "view":
          navigate("/addVoucher", {
            state: { voucherId: selectedVoucherRowId.id, type: "view" },
          });
          break;
        case "edit":
          navigate("/addVoucher", {
            state: { voucherId: selectedVoucherRowId.id, type: "edit" },
          });
          break;
        case "printvoucher":
          downloadPOPDF("Voucher", selectedVoucherRowId);
          break;
        case "delete":
          axiosInstance({
            method: "delete",
            url: VoucherEndPoints.DeleteVoucher + "/" + id,
            withCredentials: false,
          })
            .then((response) => {
              setBindVoucherGrid({
                ...bindVoucherGrid,
                poId: PoId,
                skip: 0,
                take: 10,
              });
              setVoucherShow(false);
            })
            .catch(() => { });
          break;
          case "unpost":
          axiosInstance({
            method: "put",
            url: VoucherEndPoints.UnPostVoucher + "/" + id,
            withCredentials: false,
          })
            .then((response) => {
              setBindVoucherGrid({
                ...bindVoucherGrid,
                poId: PoId,
                skip: 0,
                take: 10,
              });
              setVoucherShow(false);
            })
            .catch(() => { });
          break;
        case "voucher":
          navigate("/addVoucher");
          break;
        default:
          break;
      }
    }
  };
  const VoucherContextMenuCloseMenu = () => {
    setVoucherShow(false);
    setselectedVoucherRowId({});
  };

  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);


  const onSelectionChange = React.useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });
      if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
        let poid = Object.keys(newSelectedState)[0];
        setPoId(poid);
        setBindIHPOGrid({
          ...bindIHPOGrid,
          poId: poid,
          skip: 0,
          take: IHPOpage.take,
        });
        setBindVoucherGrid({
          ...bindVoucherGrid,
          poId: poid,
        });
        setSelectedState(newSelectedState);
        setBindPOGrid({
          ...bindPOGrid,
          selectedState: newSelectedState,
        });
      } else {
        setPoId(0);
        setBindIHPOGrid({
          ...bindIHPOGrid,
          selectedState: {}
        })
        setSelectedState({});
        setBindIHPOGrid({ ...bindIHPOGrid, poId: 0 });
        setBindVoucherGrid({
          ...bindVoucherGrid,
          poId: 0,
        });
        setBindPOGrid({
          ...bindPOGrid,
          selectedState: {}
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedState, bindPOGrid]
  );

  const IHPO_DATA_ITEM_KEY = "id";
  const IHPO_SELECTED_FIELD = "selected";
  const idGetter_IHPO = getter(IHPO_DATA_ITEM_KEY);

  const onIHPOSelectionChange = React.useCallback(
    (event) => {

      const newSelectedState = getSelectedState({
        event,
        ihpoSelectedState: ihpoSelectedState,
        dataItemKey: IHPO_DATA_ITEM_KEY,
      });
      if (
        Object.keys(ihpoSelectedState)[0] !== Object.keys(newSelectedState)[0]
      ) {
        let ihpoNo = Object.keys(newSelectedState)[0];
        getVoucherBasedIhpo(ihpoNo);
        setihpoSelectedState(newSelectedState);
        setBindIHPOGrid({
          ...bindIHPOGrid,
          selectedState: newSelectedState
        })
      } else {
        setBindIHPOGrid({
          ...bindIHPOGrid,
          selectedState: {}
        })
        setihpoSelectedState({});
        let poNo = Object.keys(selectedState)[0];
        setPoId(poNo);
        setBindVoucherGrid({
          ...bindVoucherGrid,
          ihpoId: 0,
          poId: poNo,
          skip: 0,
          take: 10,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ihpoSelectedState, bindIHPOGrid]
  );

  const getVoucherBasedIhpo = (ihpoNumber) => {
    setBindVoucherGrid({ ...bindVoucherGrid, ihpoId: ihpoNumber });
  };

  const postVoucherHandleSubmit = (dataItem, e) => {
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
        VoucherEndPoints.BatchPostVouchers +
        `?startDate=${formatStartDate}&endDate=${formatEndDate}&postDate=${formatPostDate}`,
      withCredentials: false,
    })
      .then((response) => {
        setBindVoucherGrid({ ...bindVoucherGrid });
        fetchAfterPostVoucherData();
        showSuccessNotification("Post voucher added successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const closePoHandleSubmit = (dataItem, e) => {
    let apirequest = {
      poId :dataItem.poId,
      closingAmount : dataItem.closingAmount
    }
    axiosInstance({
      method: "PUT",
      url: PurchaseOrderEndPOints.CloseCurrentPo,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        setBindPOGrid({ ...bindPOGrid });
        handleShowPODialogClose()
        showSuccessNotification("Po closed successfully");
      })
      .catch(() => { });
  }

  const closePostVoucher = () => {
    setShowPostVoucher(false);
  };
  const PDFViewer = (base64String, type) => {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: type });
    const url = URL.createObjectURL(blob);
    setPdfURL(url);
  };
  const downloadPOPDF = (type, po) => {
    let data;
    let url = "";
    if (type == "PO") {
      url = ReportsEndPoints.GenerateReportPO;
      data = {
        ReportName: type,
        DictionaryParameters: {},
      };
      data.DictionaryParameters = {
        PO: po.poNumber,
        ReportPOId: po.id,
      };
    } else if (type == "Voucher") {
      url = ReportsEndPoints.GenerateReportVoucher;
      data = {
        ReportName: type,
        DictionaryParameters: {},
      };
      data.DictionaryParameters = {
        Voucher: po.voucherVouchNo,
        ReportVoucherId: po.id,
      };
    }

    axiosInstance({
      method: "POST",
      maxBodyLength: Infinity,
      url,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    })
      .then((response) => {
        PDFViewer(response.data, "application/pdf");
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
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Accounts Payable')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {isOpen && (
        <PdfViewer
          pdfURL={pdfURL}
          setPdfURL={setPdfURL}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
      {checkPrivialgeGroup("PurchaseOrderDashboardM", 1) && (
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
                Dashboard
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <span className="page-title">Accounts Payable Dashboard </span>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="p-3">
                {checkPrivialgeGroup("PurchaseOrderG", 1) && (
                  <>
                    <div className="row">
                      <div className="col-sm-6">
                        <legend>County PO List</legend>
                      </div>

                      <div className="col-sm-6 text-end">
                        {checkPrivialgeGroup("AddPurchaseOrderB", 2) && (
                          <Button
                            themeColor={"primary"}
                            className="k-button k-button-lg k-rounded-lg"
                            onClick={() =>
                              navigate("/addpurchaseorder", {
                                state: { type: "screen" },
                              })
                            }
                          >
                            <i className="fa-solid fa-plus"></i> Add County PO
                          </Button>
                        )}
                      </div>
                    </div>
                    <br></br>
                    {checkPrivialgeGroup("PurchaseOrderG", 1) && (
                      <div>
                        <Grid
                          resizable={true}
                          data={POGriddata.map((item) => ({
                            ...item,
                            [SELECTED_FIELD]: selectedState[idGetter(item)],
                          }))}
                          filterable={POshowFilter}
                          filter={POFilter}
                          onFilterChange={POFilterData}
                          skip={page.skip}
                          take={page.take}
                          total={totalpage}
                          pageable={{
                            buttonCount: 4,
                            pageSizes: [10, 15, 50, "All"],
                            pageSizeValue: POPageSizeValue,
                          }}
                          onPageChange={POPageChange}
                          dataItemKey={DATA_ITEM_KEY}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            drag: false,
                            cell: false,
                            mode: "multiple",
                          }}
                          onSelectionChange={onSelectionChange}
                          sortable={true}
                          sort={poSort}
                          onSortChange={(e) => {
                            onPOSortChange(e);
                          }}
                        >
                          <GridToolbar>
                            <div className="row col-sm-12">
                              <div className="col-sm-6 d-grid gap-3 d-md-block d-flex d-md-flex  align-items-center">
                                <Button
                                  className="buttons-container-button"
                                  fillMode="outline"
                                  themeColor={"primary"}
                                  onClick={POMoreFilter}
                                >
                                  <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                                  &nbsp; More Filter
                                </Button>
                                <p className="m-0">
                                  {/* <i className="fa-solid fa-circle-info"></i>{" "}
                                  Shows open POs for this year & the previous
                                  year. Use search for details */}
                                </p>
                              </div>
                              <div className="col-sm-6 d-flex align-items-center justify-content-center">
                                <div className="col-3">
                                  {checkPrivialgeGroup("SMICBPOCB", 1) && (
                                    <Checkbox
                                      type="checkbox"
                                      id="modifiedBy"
                                      name="modifiedBy"
                                      defaultChecked={bindPOGrid.modifiedBy}
                                      onChange={onCheckBox}
                                      label={"Modified Info"}
                                    />
                                  )}
                                  {checkPrivialgeGroup("ClosedPOPOCB", 1) && (
                                    <Checkbox
                                      type="checkbox"
                                      id="poComplete"
                                      name="poComplete"
                                      defaultChecked={bindPOGrid.poComplete}
                                      onChange={(e) => {
                                        setBindPOGrid({
                                          ...bindPOGrid,
                                          poComplete: e.target.value,
                                        });
                                      }}
                                      label={"Closed PO"}
                                    />
                                  )}
                                </div>
                                <div style={{ margin: "5px" }}>
                                  <DropDownList
                                    data={years}
                                    value={POYearFilter}
                                    onChange={(e) => {
                                      setPOYearFilter(e.value)
                                      setselectedIHPORowId(0)
                                      setselectedVoucherRowId(0)
                                      setselectedRowId(0)
                                      setSelectedState({})
                                      setihpoSelectedState({})
                                      setBindPOGrid({
                                        ...bindPOGrid,
                                        yearFilter: e.target.value,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="input-group">
                                  <Input
                                    className="form-control border-end-0 border"
                                    onChange={POSearchData}
                                    defaultValue={bindPOGrid.search}
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

                          <GridColumn field="poNumber" title="PO Number" />
                          <GridColumn
                            field="countyPODetails.vendor.name"
                            title="Vendor"
                          />
                          <GridColumn
                            field="poDescription"
                            title="Description"
                          />
                          <GridColumn
                            field="countyPODetails.accountingCode.countyExpenseCode"
                            title="CAC"
                          />
                          <GridColumn
                            field="poOpenDate"
                            filter="date"
                            title="Open Date"
                            cell={(props) => {
                              const [year, month, day] = props.dataItem
                                ?.poOpenDate
                                ? props.dataItem?.poOpenDate
                                  .split("T")[0]
                                  .split("-")
                                : [null, null, null];
                              return (
                                <td data-grid-col-index={props.columnIndex}>
                                  {props.dataItem?.poOpenDate
                                    ? `${month}/${day}/${year}`
                                    : null}
                                </td>
                              );
                            }}
                          />
                          <GridColumn
                            field="poCompleteDate"
                            filter="date"
                            title="Closed Date"
                            cell={(props) => {
                              const [year, month, day] = props.dataItem
                                ?.poCompleteDate
                                ? props.dataItem?.poCompleteDate
                                  .split("T")[0]
                                  .split("-")
                                : [null, null, null];
                              return (
                                <td data-grid-col-index={props.columnIndex}>
                                  {props.dataItem?.poCompleteDate
                                    ? `${month}/${day}/${year}`
                                    : null}
                                </td>
                              );
                            }}
                          />
                          <GridColumn
                            field="countyPOPricing.poAmount"
                            title="Total"
                            format="{0:c2}"
                            headerClassName="header-right-align"
                            cell={(props) => {
                              var amount =
                                props.dataItem?.countyPOPricing?.poAmount || 0;
                              amount =
                                "$" +
                                amount
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                              return (
                                <td
                                  className="!k-text-right"
                                  data-grid-col-index={props.columnIndex}
                                >{`${amount}`}</td>
                              );
                            }}
                          />
                          <GridColumn
                            field="countyPOPricing.poBalance"
                            title="Balance"
                            format="{0:c2}"
                            headerClassName="header-right-align"
                            cell={(props) => {
                              var amount =
                                props.dataItem?.countyPOPricing?.poBalance || 0;
                              amount =
                                "$" +
                                amount
                                  .toFixed(2)
                                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                              return (
                                <td
                                  className="!k-text-right"
                                  data-grid-col-index={props.columnIndex}
                                >{`${amount}`}</td>
                              );
                            }}
                          />
                          {columnShow && (
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
                                  <td data-grid-col-index={props.columnIndex}>
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
                                  <td data-grid-col-index={props.columnIndex}>
                                    {props.dataItem?.modifiedDate
                                      ? `${month}/${day}/${year}`
                                      : null}
                                  </td>
                                );
                              }}
                            />
                          )}
                          {columnShow && (
                            <GridColumn
                              field="modifiedBy"
                              title="Modified By"
                            />
                          )}
                          <GridColumn
                            cell={POGridCommandCell}
                            filterable={false}
                          />
                        </Grid>
                        <ContextMenu
                          show={show}
                          offset={offset.current}
                          onSelect={POContextMenuOnSelect}
                          onClose={POContextMenuCloseMenu}
                        >
                          {checkPrivialgeGroup("ViewPurchaseOrderCM", 1) && (
                            <MenuItem
                              text="View PO"
                              data={{
                                action: "view",
                              }}
                              icon="view"
                            />
                          )}

                          {checkPrivialgeGroup("EditPurchaseOrderCM", 3) &&
                            !selectedRowId?.poCompleteDate && (
                              <MenuItem
                                text="Edit PO"
                                data={{
                                  action: "edit",
                                }}
                                icon="edit"
                              />
                            )}
                          {checkPrivialgeGroup("DeletePurchaseOrderCM", 4) && (
                            !selectedRowId?.poCompleteDate && (
                            <MenuItem
                              text="Delete PO"
                              data={{
                                action: "delete",
                              }}
                              icon="delete"
                            />
                            )
                          )}
                          {
                          checkPrivialgeGroup("ClosePurchaseOrderCM", 1) && (
                            !selectedRowId?.poCompleteDate && (
                            <MenuItem
                              text="Close PO"
                              data={{
                                action: "closePo",
                              }}
                              icon="close"
                            />
                            )
                           )
                          }
                          {
                          checkPrivialgeGroup("OpenPurchaseOrderCM", 1) && (
                            selectedRowId?.poCompleteDate && (
                            <MenuItem
                              text="Open PO"
                              data={{
                                action: "openPo",
                              }}
                              icon="open"
                            />
                            )
                          )
                          }
                          {checkPrivialgeGroup("PrintPurchaseOrderCM", 1) && (
                            <MenuItem
                              text="Print PO"
                              data={{
                                action: "printpo",
                              }}
                              icon="edit"
                            />
                          )}

                          {checkPrivialgeGroup("POVoucherCM", 2) && (
                            !selectedRowId?.poCompleteDate && (
                            <MenuItem
                              text="Voucher"
                              data={{
                                action: "voucher",
                              }}
                              icon="add"
                            />
                            )
                          )}
                        </ContextMenu>
                      </div>
                    )}
                  </>
                )}
                {IHPODisplay && (
                  <>
                    <br></br>
                    <fieldset>
                      <div className="row">
                        <div className="col-sm-8">
                          <legend>IHPO List</legend>
                        </div>
                        {checkPrivialgeGroup("RequestIHPOB", 2) && (
                          <div className="col-sm-4 text-end">
                            <Button
                              themeColor={"primary"}
                              className="k-button k-button-lg k-rounded-lg"
                              onClick={() => navigate("/requestIHPO")}
                            >
                              Request IHPO
                            </Button>
                          </div>
                        )}
                      </div>
                      <br></br>
                      {checkPrivialgeGroup("IHPOG", 1) && (
                        <div>
                          <Grid
                            resizable={true}
                            data={IHPOGriddata.map((item) => ({
                              ...item,
                              [SELECTED_FIELD]:
                                ihpoSelectedState[idGetter_IHPO(item)],
                            }))}
                            filterable={IHPOshowFilter}
                            filter={IHPOFilter}
                            onFilterChange={IHPOFilterData}
                            skip={IHPOpage.skip}
                            take={IHPOpage.take}
                            total={IHPOtoatlpage}
                            pageable={{
                              buttonCount: 4,
                              pageSizes: [10, 15, 50, "All"],
                              pageSizeValue: IHPOPageSizeValue,
                            }}
                            onPageChange={IHPOPageChange}
                            dataItemKey={IHPO_DATA_ITEM_KEY}
                            selectedField={IHPO_SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              drag: false,
                              cell: false,
                              mode: "multiple",
                            }}
                            onSelectionChange={onIHPOSelectionChange}
                            sortable={true}
                            sort={ihpoSort}
                            onSortChange={(e) => {
                              onIHPOSortChange(e);
                            }}
                          >
                            <GridToolbar>
                              <div className="row col-sm-12">
                                <div className="col-sm-6 d-grid gap-3 d-md-block d-flex d-md-flex  align-items-center">
                                  <Button
                                    className="buttons-container-button"
                                    fillMode="outline"
                                    themeColor={"primary"}
                                    onClick={IHPOMoreFilter}
                                  >
                                    <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                                    &nbsp; More Filter
                                  </Button>
                                  <p className="m-0">
                                    {/* <i className="fa-solid fa-circle-info"></i>{" "}
                                    Shows open IHPOs for this year & the previous
                                    year. Use search for details */}
                                  </p>
                                </div>
                                <div className="col-sm-6 d-flex align-items-center justify-content-center">
                                  <div className="col-3">
                                    {checkPrivialgeGroup("SMIIHPOCB", 1) && (
                                      <Checkbox
                                        type="checkbox"
                                        id="modifiedByIHPO"
                                        name="modifiedByIHPO"
                                        defaultChecked={bindIHPOGrid.modifiedBy}
                                        onChange={onIhpoCheckBox}
                                        label={"Modified Info"}
                                      />
                                    )}
                                  </div>
                                  <div className="col-3">
                                  {/* {checkPrivialgeGroup("CloseIHPOCB", 1) && ( */}
                                    <Checkbox
                                      type="checkbox"
                                      id="ihpoComplete"
                                      name="ihpoComplete"
                                      defaultChecked={bindIHPOGrid.ihpoComplete}
                                      onChange={(e) => {
                                        setBindIHPOGrid({
                                          ...bindIHPOGrid,
                                          ihpoComplete: e.target.value,
                                        });
                                      }}
                                      label={"Closed IHPO"}
                                    />
                                  {/* )}  */}
                                  </div>
                                  <div style={{ margin: "5px" }}>
                                    <DropDownList
                                      data={years}
                                      value={IHPOYearFilter}
                                      onChange={(e) => {
                                        setIHPOYearFilter(e.value)
                                        setBindIHPOGrid({
                                          ...bindIHPOGrid,
                                          yearFilter: e.target.value,
                                        });
                                      }
                                      }
                                    />
                                  </div>
                                  <div className="input-group">
                                    <Input
                                      className="form-control border-end-0 border"
                                      onChange={IHPOSearchData}
                                      defaultValue={bindIHPOGrid.search}
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
                            <GridColumn field="reqNumber" title="IHPO Number" />
                            <GridColumn
                              field="ihpoDetails.vendor.name"
                              title="Vendor"
                            />
                            {/* <GridColumn
                              field="countyPO.poNumber"
                              title="PO Number"
                            /> */}
                            <GridColumn
                              field="reqDescription"
                              title="Description"
                            />
                            <GridColumn
                              field="reqDate"
                              title="Open Date"
                              filter="date"
                              cell={(props) => {
                                const [year, month, day] = props.dataItem
                                  ?.reqDate
                                  ? props.dataItem?.reqDate
                                    .split("T")[0]
                                    .split("-")
                                  : [null, null, null];
                                return (
                                  <td data-grid-col-index={props.columnIndex}>
                                    {props.dataItem?.reqDate
                                      ? `${month}/${day}/${year}`
                                      : null}
                                  </td>
                                );
                              }}
                            />
                            <GridColumn
                              field="reqDateComplete"
                              title="Closed Date"
                              filter="date"
                              cell={(props) => {
                                const [year, month, day] = props.dataItem
                                  ?.reqDateComplete
                                  ? props.dataItem?.reqDateComplete
                                    .split("T")[0]
                                    .split("-")
                                  : [null, null, null];
                                return (
                                  <td data-grid-col-index={props.columnIndex}>
                                    {props.dataItem?.reqDateComplete
                                      ? `${month}/${day}/${year}`
                                      : null}
                                  </td>
                                );
                              }}
                            />
                            <GridColumn
                              field="ihpoPricing.reqTotal"
                              title="Total"
                              format="{0:c2}"
                              headerClassName="header-right-align"
                              cell={(props) => {
                                var amount =
                                  props.dataItem?.ihpoPricing?.reqTotal || 0;
                                amount =
                                  "$" +
                                  amount
                                    .toFixed(2)
                                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                                return (
                                  <td
                                    className="!k-text-right"
                                    data-grid-col-index={props.columnIndex}
                                  >
                                    {`${amount}`}
                                  </td>
                                );
                              }}
                            />
                            <GridColumn
                              field="ihpoPricing.reqBalance"
                              title="Balance"
                              format="{0:c2}"
                              headerClassName="header-right-align"
                              cell={(props) => {
                                var amount =
                                  props.dataItem?.ihpoPricing?.reqBalance || 0;
                                amount =
                                  "$" +
                                  amount
                                    .toFixed(2)
                                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                                return (
                                  <td
                                    className="!k-text-right"
                                    data-grid-col-index={props.columnIndex}
                                  >
                                    {`${amount}`}
                                  </td>
                                );
                              }}
                            />
                            <GridColumn
                              field="statusMessage"
                              title="Status"
                              filterCell={DropdownFilterCel}
                            />
                            {ihpoColumnShow && (
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
                                    <td data-grid-col-index={props.columnIndex}>
                                      {props.dataItem?.createdDate
                                        ? `${month}/${day}/${year}`
                                        : null}
                                    </td>
                                  );
                                }}
                              />
                            )}
                            {ihpoColumnShow && (
                              <GridColumn
                                field="createdBy"
                                title="Created By"
                              />
                            )}
                            {ihpoColumnShow && (
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
                                    <td data-grid-col-index={props.columnIndex}>
                                      {props.dataItem?.modifiedDate
                                        ? `${month}/${day}/${year}`
                                        : null}
                                    </td>
                                  );
                                }}
                              />
                            )}
                            {ihpoColumnShow && (
                              <GridColumn
                                field="modifiedBy"
                                title="Modified By"
                              />
                            )}
                            <GridColumn
                              cell={IHPOGridCommandCell}
                              filterable={false}
                            />
                          </Grid>
                          <ContextMenu
                            show={IHPOshow}
                            offset={ihpooffset.current}
                            onSelect={IHPOContextMenuOnSelect}
                            onClose={IHPOContextMenuCloseMenu}
                          >
                            {checkPrivialgeGroup("ViewIHPOCM", 1) && (
                              <MenuItem
                                text="View IHPO"
                                data={{
                                  action: "view",
                                }}
                                icon="view"
                              />
                            )}

                            {checkPrivialgeGroup("IHPOVoucherCM", 1) &&
                              showVoucherActionBtn && !selectedIHPORowId?.reqDateComplete &&  (
                                <MenuItem
                                  text="Voucher"
                                  data={{
                                    action: "voucher",
                                  }}
                                  icon="add"
                                />
                              )}
                            {checkPrivialgeGroup("CloseIHPOVoucherCM", 1) &&
                              showVoucherActionBtn && !selectedIHPORowId?.reqDateComplete && (
                                <MenuItem
                                  text="Close IHPO"
                                  data={{
                                    action: "closeIHPO",
                                  }}
                                  icon="close"
                                />
                              )}
                            {checkPrivialgeGroup("OpenIHPOVoucherCM", 1) &&
                              selectedIHPORowId?.reqDateComplete && (
                                <MenuItem
                                  text="Open IHPO"
                                  data={{
                                    action: "openIHPO",
                                  }}
                                  icon="open"
                                />
                              )}
                            {
                            checkPrivialgeGroup("DelegateSApproveCM", 1) &&
                             selectedIHPORowId.statusMessage?.toLowerCase() == "fiscaloffice approved" && (
                                <MenuItem
                                  text="ApproveAsSuperintendent"
                                  data={{
                                    action: "approveAsSuperintendent",
                                  }}
                                  icon="open"
                                />
                              )
                              }
                          </ContextMenu>
                        </div>
                      )}
                      <br></br>
                    </fieldset>
                  </>
                )}
                <br></br>
                {checkPrivialgeGroup("VoucherG", 1) && (
                  <fieldset>
                    <div className="row">
                      <div className="col-sm-6">
                        <legend>Voucher List</legend>
                      </div>
                      {checkPrivialgeGroup("AddVoucherB", 2) && (
                        <div className="col-sm-6 text-end">
                          <Button
                            themeColor={"primary"}
                            className="k-button k-button-lg k-rounded-lg me-2"
                            onClick={() => navigate("/batch-voucher")}
                          >
                            Batch Voucher
                          </Button>
                          <Button
                            themeColor={"primary"}
                            className="k-button k-button-lg k-rounded-lg"
                            onClick={() => { navigate("/addVoucher", {
                              state: { type: "screen" },
                            })}}
                          >
                            <i className="fa-solid fa-plus"></i> Add Voucher
                          </Button>
                        </div>
                      )}
                    </div>
                    <br></br>
                    {checkPrivialgeGroup("VoucherG", 1) && (
                      <div>
                        <Grid
                          resizable={true}
                          data={VoucherGriddata}
                          filterable={VouchershowFilter}
                          filter={VoucherFilter}
                          onFilterChange={VoucherFilterData}
                          skip={vendorpage.skip}
                          take={vendorpage.take}
                          total={Vouchertoatlpage}
                          pageable={{
                            buttonCount: 4,
                            pageSizes: [10, 15, 50, "All"],
                            pageSizeValue: VoucherPageSizeValue,
                          }}
                          onPageChange={VoucherPageChange}
                          sortable={true}
                          sort={voucherSort}
                          onSortChange={(e) => {
                            onVoucherSortChange(e);
                          }}
                        >
                          <GridToolbar>
                            <div className="row col-sm-12">
                              <div className="col-sm-6 d-grid gap-3 d-md-block d-flex d-md-flex  align-items-center">
                                <Button
                                  className="buttons-container-button"
                                  fillMode="outline"
                                  themeColor={"primary"}
                                  onClick={VoucherMoreFilter}
                                >
                                  <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                                  &nbsp; More Filter
                                </Button>
                                <p className="m-0">
                                  {/* <i className="fa-solid fa-circle-info"></i>{" "}
                                  Shows open Vouchers for this year & the previous
                                  year. Use search for details */}
                                </p>
                              </div>
                              <div className="col-sm-6 d-flex align-items-center justify-content-center">
                                <div className="col-3">
                                  {checkPrivialgeGroup("SMIAVCB", 1) && (
                                    <Checkbox
                                      type="checkbox"
                                      id="modifiedByVoucher"
                                      name="modifiedByVoucher"
                                      defaultChecked={bindVoucherGrid.modifiedBy}
                                      onChange={onVoucherCheckBox}
                                      label={"Modified Info"}
                                    />
                                  )}
                                </div>
                                <div style={{ margin: "6px" }}>
                                  <DropDownList
                                    data={years}
                                    value={VoucherYearFilter}
                                    onChange={(e) => {
                                      setVoucherYearFilter(e.value)
                                      setBindVoucherGrid({
                                        ...bindVoucherGrid,
                                        yearFilter: e.target.value,
                                      });
                                    }
                                    }
                                  />
                                </div>

                                <div className="input-group">
                                  <Input
                                    className="form-control border-end-0 border"
                                    onChange={VoucherSearchData}
                                    defaultValue={bindVoucherGrid.search}
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
                            field="voucherVouchNo"
                            title="Voucher Number"
                          />
                          <GridColumn field="vendor.name" title="Vendor" />
                          <GridColumn
                            field="countyPO.poNumber"
                            title="PO Number"
                          />
                          <GridColumn
                            field="voucherDescription"
                            title="Description"
                          />
                          <GridColumn
                            field="voucherWrittenDate"
                            title="Written Date"
                            filter="date"
                            editor="date"
                            format="{0:MM/dd/yyyy}"
                            filterCell={ColumnDatePicker}
                            cell={(props) => {
                              const [year, month, day] = props.dataItem
                                ?.voucherWrittenDate
                                ? props.dataItem?.voucherWrittenDate
                                  .split("T")[0]
                                  .split("-")
                                : [null, null, null];
                              return (
                                <td>
                                  {props.dataItem?.voucherWrittenDate
                                    ? `${month}/${day}/${year}`
                                    : null}
                                </td>
                              );
                            }}
                          />
                          <GridColumn
                            field="postDate"
                            title="Date Posted"
                            filter="date"
                            editor="date"
                            format="{0:MM/dd/yyyy}"
                            filterCell={ColumnDatePicker}
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
                          {approveVoucherDisplay && (
                            <GridColumn field="approved" title="Approved" cell={CheckBoxCell}
                            />
                          )}
                          {approveVoucherDisplay && (
                            <GridColumn
                              field="approvalDate"
                              title="Approval Date"
                              filter="date"
                              editor="date"
                              format="{0:MM/dd/yyyy}"
                              filterCell={ColumnDatePicker}
                              cell={(props) => {
                                const [year, month, day] = props.dataItem
                                  ?.approvalDate
                                  ? props.dataItem?.approvalDate
                                    .split("T")[0]
                                    .split("-")
                                  : [null, null, null];
                                return (
                                  <td>
                                    {props.dataItem?.approvalDate
                                      ? `${month}/${day}/${year}`
                                      : null}
                                  </td>
                                );
                              }}
                            />
                          )}
                          <GridColumn
                            field="voucherAmount"
                            title="Total"
                            editor="numeric"
                            format="{0:c2}"
                            headerClassName="header-right-align"
                            cell={(props) => {
                              var amount = props.dataItem?.voucherAmount || 0;
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

                          {voucherColumnShow && (
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
                          {voucherColumnShow && (
                            <GridColumn field="createdBy" title="Created By" />
                          )}
                          {voucherColumnShow && (
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
                          {voucherColumnShow && (
                            <GridColumn
                              field="modifiedBy"
                              title="Modified By"
                            />
                          )}
                          <GridColumn
                            cell={VoucherGridCommandCell}
                            filterable={false}
                          />
                        </Grid>
                        <ContextMenu
                          show={Vouchershow}
                          offset={Voucheroffset.current}
                          onSelect={VoucherContextMenuOnSelect}
                          onClose={VoucherContextMenuCloseMenu}
                        >
                          {checkPrivialgeGroup("ViewVoucherCM", 1) && (
                            <MenuItem
                              text="View Voucher"
                              data={{
                                action: "view",
                              }}
                              icon="view"
                            />
                          )}
                          {checkPrivialgeGroup("EditVoucherCM", 3) &&
                            !selectedVoucherRowId.postDate && (
                              <MenuItem
                                text="Edit Voucher"
                                data={{
                                  action: "edit",
                                }}
                                icon="edit"
                              />
                            )}
                          {checkPrivialgeGroup("PrintVoucherCM", 1) &&
                            !selectedVoucherRowId.postDate && (
                              <MenuItem
                                text="Print Preview"
                                data={{
                                  action: "printvoucher",
                                }}
                                icon="edit"
                              />
                            )}
                          {checkPrivialgeGroup("DeleteVoucherCM", 4) && (
                            !selectedVoucherRowId.postDate && (
                            <MenuItem
                              text="Delete Voucher"
                              data={{
                                action: "delete",
                              }}
                              icon="delete"
                            />
                            )
                          )}
                          {
                          checkPrivialgeGroup("UnpostVoucherCM", 1) && (
                            selectedVoucherRowId.postDate && (
                            <MenuItem
                              text="Unpost Voucher"
                              data={{
                                action: "unpost",
                              }}
                              icon="unpost"
                            />
                            )
                          )
                          }
                        </ContextMenu>
                      </div>
                    )}
                    <br></br>
                  </fieldset>
                )}
              </div>
            </div>
          </div>
          {showPostVoucher && (
            <Dialog
              width={600}
              title={
                <div className="d-flex align-items-center justify-content-center">
                  <i className="fa-solid fa-plus"></i>
                  <span className="ms-2">Post Vouchers</span>
                </div>
              }
              onClose={closePostVoucher}
            >
              <Form
                onSubmit={postVoucherHandleSubmit}
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
                          onChange={updateStartDate}
                          value={selectedStartDate}
                        />
                        <div>
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
                          disabled={
                            !formRenderProps.allowSubmit || endDateError
                          }
                        >
                          Post Vouchers
                        </Button>
                      </div>
                    </fieldset>
                  </FormElement>
                )}
              />
            </Dialog>
          )}

          {showAfterPostVoucherModal && (
            <AfterPostVoucherModal
              onClose={closeShowAfterPostVoucherModal}
              data={showAfterPostVoucherData}
            />
          )}
          {ShowPODialog && (
            <Dialog
              title={<span>Close PO</span>}
              onClose={handleShowPODialogClose}
            >
              <Form
                onSubmit={closePoHandleSubmit}
                initialValues={formInit}
                key={poformKey}

                render={(formRenderProps) => (
                  <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                      
                    <Field
                            id={"closingAmount"}
                            name={"closingAmount"}
                            label={"Closing Balance"}
                            format={"c"}
                            placeholder={"$ Enter Amount"}
                            component={FormNumericTextBox}
                            step={0}
                            min={0}
                            spinners={false}
                          />


                      <div className="k-form-buttons">
                        <Button className={"col-5 me-2"} type={"button"} onClick={handleShowPODialogClose}>
                          Cancel
                        </Button>
                        <Button
                          themeColor={"primary"}
                          className={"col-5"}
                          type={"submit"}
                          disabled={
                            !formRenderProps.allowSubmit || endDateError
                          }
                        >
                          Close PO
                        </Button>
                      </div>
                    </fieldset>
                  </FormElement>
                )}
              />
            </Dialog>
          )}

          {showIHPOUploadModal && (
            <IHPOUploadModal
              ihpoUploadModalData={ihpoUploadModalData}
              onClose={closeSetShowIHPOUploadModal}
            />
          )}
        </>
      )}
    </>
  );
}
