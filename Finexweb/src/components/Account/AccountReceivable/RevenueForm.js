import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
  DropDownList,
  MultiColumnComboBox,
} from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import {
  downloadIcon,
  eyedropperIcon,
  trashIcon,
  uploadIcon,
} from "@progress/kendo-svg-icons";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  AccountReceivable,
  CommonEndPoints,
  ConfigurationEndPoints,
  IHACExpenseCodeEndPoints,
  RevenueDetailsBD,
  RevenueEndPoints,
  UploadDocumentEndPoints,
  VendorEndPoints,
  projectCostingEndPoints
} from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import Constants from "../../common/Constants";
import {
  ColumnFormCurrencyTextBox,
  ColumnFormNumericTextBox,
  ColumnFormNumericTextBoxForNonGrouping,
  DescriptionCell100,
  FormCheckbox,
  FormCustomerMultiColumnComboBox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormNumericTextBox,
  FormTextArea
} from "../../form-components";
import AddNewVendor from "../../modal/AddNewVendor";
import IHACDialog from "../../modal/IHACDialog";
import SacDialog from "../../modal/StateAccountCodeDialog";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../NotificationHandler/NotificationHandler";
import DocumentPopup from "../../UploadFile/DocumentPopup";
import {
  RevenueRecievedFromValidator,
  activeDateValidator,
  currencyAmountValidator
} from "../../validators";

const MyCommandCell = (props) => {
  const { dataItem, type } = props;
  const isNewItem = dataItem.id == 0;
  const inEdit = dataItem.inEdit;

  const handleAddUpdate = React.useCallback(() => {
    isNewItem ? props.add(dataItem) : props.update(dataItem);
  }, [dataItem, isNewItem]);

  const handleDiscardCancel = React.useCallback(() => {
    isNewItem ? props.discard(dataItem) : props.cancel(dataItem);
  }, [dataItem, isNewItem]);

  const handleRemove = React.useCallback(() => {
    props.remove(dataItem);
  }, [dataItem]);

  const handleEdit = React.useCallback(() => {
    props.edit(dataItem);
  }, [dataItem]);

  if (props.rowType == "groupHeader") return null;

  return inEdit ? (
    <td className="k-command-cell">
      <Button onClick={handleAddUpdate}>{isNewItem ? "Add" : "Update"}</Button>
      {!isNewItem && <Button onClick={handleDiscardCancel}>Cancel</Button>}
    </td>
  ) : (
    <td className="k-command-cell" style={{ width: "100px" }}>
      <Button
        themeColor="primary"
        onClick={handleEdit}
        svgIcon={eyedropperIcon}
        disabled={type == "view"}
      ></Button>
      <Button
        themeColor="primary"
        onClick={handleRemove}
        svgIcon={trashIcon}
        disabled={type == "view"}
      ></Button>
    </td>
  );
};

export default function RevenueForm() {
  const navigate = useNavigate();
  const initialSort = [
    {
      field: "id",
      dir: "desc",
    },
  ];

  const [sort,] = React.useState(initialSort);
  const [formKey, setFormKey] = React.useState(1);
  const [revenueForm, setrevenueForm] = React.useState({});
  const [, setAddSubmit] = useState(false);
  const [LineItemGriddata, setLineItemGriddata] = useState([]);
  const [RevenueNumber, setRevenueNumber] = React.useState();
  const [selectedProject,] = useState({});
  const [projectOptions, setProjectOptions] = useState([]);
  // const [otherDescOptions, setOtherDescOptions] = useState([
  //   {id:1, description:'other description 1'},
  //   {id:2, description:'other description 2'},
  //   {id:3, description:'other description 3'},
  //   {id:4, description:'other description 4'}
  // ]);
  const [otherDescOptions, setOtherDescOptions] = useState([]);
  const [docData, setDocData] = useState([]);

  const [ShowCustomerOption, setShowCustomerOption] = useState(true);
  const [ShowCustomerDetail, setShowCustomerDetail] = useState(false);
  const [, setShowCustomerform] = useState(true);
  const [PayInDisplay, setPayInDisplay] = useState(false);
  const [SACDisplay, setSACDisplay] = useState(false);
  const [IHACDisplay, setIHACDisplay] = useState(false);
  const [LicenseDisplay, setLicenseDisplay] = useState(false);
  const [CACDDList, setCACDDList] = React.useState([]);
  const [, setIHACDDList] = React.useState([]);

  const [, setRevenuedetail] = React.useState({});
  const [RevenueCounter, setRevenueCounter] = React.useState(0);
  const [bdformKey,] = React.useState(1);
  const [RevenueReceivedList, setRevenueReceivedList] = useState([]);
  const [RevenueReceivedVal, setRevenueReceivedVal] = React.useState({});
  const [deleteVisible, setDeleteVisible] = useState(null);
  const { state, pathname } = useLocation();
  const cacRef = useRef([]);
  const RevenueRef = useRef([]);
  const revenueReceivedRef = useRef();
  const [TypeList, setTypeList] = useState([]);
  const [pendingInvoiceList, setPendingInvoiceList] = useState([]);
  const [gridKey, setGridKey] = useState(0);

  React.useEffect(() => {
    getPayInConfig();
    getSACConfig();
    getLicenseConfig();
    getRevenueTypeList();
    getInvoiceList();
    getIHACConfig();
    if (!state?.revenueId) {
      commonFuction();
    }
  }, []);

  const commonFuction = async () => {
    await SearchRevenueReceived("");
    await getCAC();
    await getihac();
    await getAllProjectList();
    await getAllOtherDescriptionList();

    getTemporaryReceiptNumber();
  };

  React.useEffect(() => {
    if (state?.revenueId) {
      EditRevenueScreen();
    }
  }, [state]);
  const getRevenueTypeList = () => {
    axiosInstance({
      method: "GET",
      url: CommonEndPoints.Getcommon + "?id=" + 8,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setTypeList(data);
      })
      .catch(() => { });
  };
  const getInvoiceList = () => {
    axiosInstance({
      method: "GET",
      url: CommonEndPoints.Getcommon + "?id=" + 8,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setTypeList(data);
      })
      .catch(() => { });
  };
  const EditRevenueScreen = async () => {
    if (RevenueCounter == 0) {
      await SearchRevenueReceived("");
      getRevenue(state.revenueId);
      setRevenueNumber(state.revenueId);
      await getCAC();
      await getihac();
      await getAllProjectList();
      await getAllOtherDescriptionList();
      await getLineITem(state.revenueId);
      setRevenueCounter(RevenueCounter + 1);
    }
  };
  const getPendingInvoice = (customer) => {
    axiosInstance({
      method: "GET",
      url: AccountReceivable.getPendingInvoice + `/${customer.id}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPendingInvoiceList([
          {
            id: 0,
            invoiceNo: "Select Invoice Number",
          },
          ...data,
        ]);
      })
      .catch(() => { });
  };

  const getTemporaryReceiptNumber = () => {
    axiosInstance({
      method: "GET",
      url: AccountReceivable.GetTemporaryReceiptNumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setrevenueForm({
          dateReceived: new Date(),
          rev_Receipt_No: data,
        });
        setFormKey(formKey + 1);
      })
      .catch(() => { });
  };

  const getAllProjectList = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: projectCostingEndPoints.Project,
        withCredentials: false,
      });
      let data = response.data;
      setProjectOptions(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllOtherDescriptionList = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: AccountReceivable.GetAllOtherDescription,
        withCredentials: false,
      });
      let data = response.data;
      setOtherDescOptions(data);
    } catch (error) {
      console.log(error);
    }
  };

  const SearchRevenueReceived = async (searchText) => {
    try {
      const response = await axiosInstance({
        method: "POST",
        url:
          VendorEndPoints.VendorFilter +
          "?isActive=" +
          "Y" +
          "&vendorType=customer" +
          "&name=" +
          searchText,
        withCredentials: false,
      });
      let data = response.data.data;
      setRevenueReceivedList(data);
      revenueReceivedRef.current = data;
    } catch (error) {
      console.log(error);
    }
  };

  const getCAC = async () => {
    const accountingcode =
      Constants.ExpenseOrRevenueIndicatorTypeCode.RevenueIndicator.code;

    axiosInstance({
      method: "Post",
      url:
        RevenueEndPoints.GetAccountingCodesFilter +
        `accountingcodetype=${accountingcode}` +
        "&&description=" +
        "" +
        "&&code=" +
        "" +
        "&&fundCode=" +
        "" +
        "&&isActive=" +
        "Y" +
        "&&search=" +
        "" +
        "&&skip=" +
        0 +
        "&&take=" +
        0,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
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
        cacRef.current = itemsData;
      })
      .catch(() => { });
  };

  const getIHACConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/1",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setIHACDisplay(value);
      })
      .catch(() => { });
  };

  const getPayInConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/52",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setPayInDisplay(value);
      })
      .catch(() => { });
  };
  const getSACConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/47",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? false : true;
        setSACDisplay(value);
      })
      .catch(() => { });
  };

  const getLicenseConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/50",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setLicenseDisplay(value);
      })
      .catch(() => { });
  };

  const getihac = async () => {
    const accountingTypeCode =
      Constants.ExpenseOrRevenueIndicatorTypeCode.RevenueIndicator.code;
    axiosInstance({
      method: "Post",
      url:
        IHACExpenseCodeEndPoints.GetIHACListWithFilter +
        "code=" +
        "&&description=" +
        "&&isActive=" +
        "Y" +
        "&&search=" +
        "&&skip=" +
        0 +
        "&&take=" +
        0 +
        `&&typeCode=${accountingTypeCode}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;

        setIHACDDList(data);
      })
      .catch(() => { });
  };

  const getRevenue = async (revenueID) => {
    axiosInstance({
      method: "GET",
      url: AccountReceivable.GetRevenue + "/" + revenueID,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data.x;
        data.noDayTape = data?.countyRevenueDetails.noDayTape;
        setRevenuedetail(data);
        RevenueRef.current = data;
        let revFromIndex = revenueReceivedRef.current.findIndex(
          (x) => x.id == data.rev_From
        );

        if (data.rev_From) {
          setRevenueReceivedVal(revenueReceivedRef.current[revFromIndex]);
          setShowCustomerDetail(true);
          setShowCustomerOption(true);
          setShowCustomerform(true);
          if (revenueReceivedRef.current[revFromIndex]) {
            getPendingInvoice(revenueReceivedRef.current[revFromIndex]);
          }
        }
        let formData = {
          status: data?.status,
          rev_From: revenueReceivedRef.current[revFromIndex],
          rev_Date: null,
          rev_Amount: data?.rev_Amount || null,
          rev_Description: data?.rev_Description || null,
          rev_Receipt_No: data?.rev_Receipt_No || null,
          dateReceived: new Date(data?.dateReceived) || null,
          payoutnum: data?.countyRevenueDetails?.payoutnum || null,
          noDayTape: data?.countyRevenueDetails?.noDayTape || null,
        };
        getDocuments("R-" + state.revenueId);
        setrevenueForm({ ...formData });
        setFormKey(formKey + 1);
      })
      .catch(() => { });
  };

  const AddRevenueForm = (dataItem) => {
    if (!RevenueReceivedVal.id) {
      showErrorNotification("Customer is required");
    } else {
      let apirequest = {
        id: 0,
        rev_From: RevenueReceivedVal.id,
        rev_Date: null,
        rev_Amount: dataItem.rev_Amount,
        rev_Description: dataItem.rev_Description || "",
        rev_Receipt_No: dataItem.rev_Receipt_No,
        dateReceived: dataItem.dateReceived,
        receiptedByID: 0,
        countyRevenueContrib: null,
        countyRevenueDetails: {
          id: 0,
          countyRevenueId: 0,
          invoiceNo: "",
          rev_Cac: 0,
          rev_Ihac: "",
          rev_Type: 0,
          rev_Sacr: "",
          payoutnum: dataItem.payoutnum,
          noDayTape: dataItem.noDayTape || false,
          printQue: false,
          countyRevenue: "",
        },
        countyRevenueBD: null,
        revenueReceivableApproval: null,
      };
      axiosInstance({
        method: "POST",
        url: AccountReceivable.Revenue,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          navigate(pathname, { state: { ...state, revenueId: data.id } });
          setRevenueNumber(data.id);
          setAddSubmit(true);
          RevenueRef.current = data;
          getLineITem(data.id);
          getPendingInvoice(RevenueReceivedVal);
          showSuccessNotification("Revenue saved successfully");
        })
        .catch(() => { });
    }
    handleResetLineItemData();
  };
  const editRevenueForm = (dataItem) => {
    let apirequest = {
      status: RevenueRef.current?.status,
      id: RevenueRef.current.id,
      rev_From: dataItem.rev_From.id,
      rev_Date: null,
      rev_Amount: dataItem.rev_Amount,
      rev_Description: dataItem.rev_Description || "",
      rev_Receipt_No: dataItem.rev_Receipt_No,
      dateReceived: dataItem.dateReceived,
      receiptedByID: RevenueRef.current.receiptedByID,
      countyRevenueContrib: RevenueRef.current.countyRevenueContrib,
      countyRevenueBD: RevenueRef.current.countyRevenueBD,
      revenueReceivableApproval: RevenueRef.current.revenueReceivableApproval,
      countyRevenueDetails: {
        id: RevenueRef.current?.countyRevenueDetails?.id || 0,
        countyRevenueId:
          RevenueRef.current?.countyRevenueDetails?.countyRevenueId || null,
        invoiceNo: RevenueRef.current?.countyRevenueDetails?.invoiceNo || null,
        rev_Cac: RevenueRef.current?.countyRevenueDetails?.rev_Cac || null,
        rev_Ihac: RevenueRef.current?.countyRevenueDetails?.rev_Ihac || null,
        rev_Type: RevenueRef.current?.countyRevenueDetails?.rev_Type || null,
        rev_Sacr: RevenueRef.current?.countyRevenueDetails?.rev_Sacr || null,
        payoutnum: dataItem.payoutnum || null,
        noDayTape: dataItem.noDayTape || false,
        printQue: RevenueRef.current?.countyRevenueDetails?.printQue || null,
        countyRevenue:
          RevenueRef.current?.countyRevenueDetails?.countyRevenue || null,
      },
    };
    axiosInstance({
      method: "PUT",
      url: AccountReceivable.Revenue + "/" + RevenueNumber,
      data: apirequest,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        RevenueRef.current = data;
        getLineITem(apirequest?.id);
        showSuccessNotification("Revenue saved successfully");
      })
      .catch(() => { });
    handleResetLineItemData();
  };

  const handleResetLineItemData = () => {
    let newData = LineItemGriddata.map((item) =>
      item.inEdit
        ? {
          inEdit: true,
          Discontinued: false,
          id: 0,
        }
        : item
    );
    setLineItemGriddata(newData);
    setGridKey(gridKey + 1);
  };

  const getLineITem = async (revenueId) => {
    axiosInstance({
      method: "GET",
      url: RevenueDetailsBD.CountyRevenueBD + "/" + revenueId,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let LineItemAmount = 0;
        let lineItems = [];
        data.map((item) => {
          LineItemAmount = LineItemAmount + (Number(item.rev_BD_Amount) || 0);
          if (item.invoiceId) {
            item.invoiceNo = item.accountReceivables?.invoiceNo;
          }
          lineItems.push(item);
        });
        if (RevenueRef.current.rev_Amount) {
          LineItemAmount = RevenueRef.current.rev_Amount - LineItemAmount;
        }
        if (LineItemAmount > 0) {
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            id: 0,
            rev_BD_Amount: LineItemAmount,
          };
          lineItems.push(newDataItem);
        }
        setLineItemGriddata([...lineItems]);
      })
      .catch(() => { });
  };

  const AddLineItem = (dataItem) => {
    let apirequest = {
      id: 0,
      rev_BD_Amount: dataItem.rev_BD_Amount,
      rev_BD_Check_No: dataItem.rev_BD_Check_No,
      rev_BD_CAC: dataItem.rev_BD_CAC,
      rev_BD_IHAC: dataItem.rev_BD_IHAC || IHPOCode,
      rev_BD_Type: dataItem.rev_BD_Type?.id || null,
      rev_BD_SACR: dataItem.rev_BD_SACR,
      rev_ID: RevenueRef.current.id,
      rev_Date: RevenueRef.current.rev_Date,
      bdDescription: dataItem.bdDescription,
      invoiceId: dataItem.invoiceId,
      invoiceNo: dataItem.invoiceNo,
      certLicenseNo: dataItem.certLicenseNo || null,
      recieptLineID: 0,
      customerID: 0,
      invoiceLineID: 0,
      payIn: dataItem?.payIn,
      projectID: dataItem.projectID,
      otherDescriptionID: dataItem.otherDescriptionID,
      countyRevenue: null,
      countyRevenueCode: null,
    };

    axiosInstance({
      method: "POST",
      url: RevenueDetailsBD.revenueDetails,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        getLineITem(RevenueNumber);
        showSuccessNotification("Revenue Details saved successfully");
      })
      .catch((err) => {
        if (err.response.data) {
          enterEdit(dataItem);
        }
      });
  };
  const EditLineItem = (dataItem) => {
    let apirequest = {
      id: dataItem.id,
      rev_BD_Amount: dataItem.rev_BD_Amount,
      rev_BD_Check_No: dataItem.rev_BD_Check_No,
      rev_BD_CAC: dataItem.rev_BD_CAC,
      rev_BD_IHAC: dataItem.rev_BD_IHAC || IHPOCode,
      rev_BD_Type: dataItem.rev_BD_Type?.id || null,
      rev_BD_SACR: dataItem.rev_BD_SACR,
      rev_ID: dataItem.rev_ID,
      rev_Date: dataItem.rev_Date,
      bdDescription: dataItem.bdDescription,
      invoiceNo: dataItem.invoiceNo,
      invoiceId: dataItem.invoiceId,
      certLicenseNo: dataItem.certLicenseNo,
      recieptLineID: dataItem.recieptLineID,
      customerID: dataItem.customerID,
      invoiceLineID: dataItem.invoiceLineID,
      payIn: dataItem?.payIn,
      projectID: dataItem.projectID,
      otherDescriptionID: dataItem.otherDescriptionID,
      countyRevenue: null,
      countyRevenueCode: null,
    };

    axiosInstance({
      method: "PUT",
      url: RevenueDetailsBD.revenueDetails + "/" + dataItem.id,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        getLineITem(RevenueNumber);
        showSuccessNotification("Revenue Details saved successfully");
      })
      .catch(() => { });
  };

  const getAllList = (field, id) => {
    const data = getAccountReceivableList(id);
    const isMatchData = data?.accountReceivableDescs
      ?.filter((s) => s[field])
      ?.map((s) => s[field]);
    return isMatchData;
  };

  const getMatchedCountyCodeList = (array) => {
    const map = new Map(CACDDList.map((item) => [item.id, item]));
    const matched = array
      .filter((item) => map.has(item.cacId))
      .map((item) => ({
        ...item,
        ...map.get(item.cacId),
      }));
    return matched;
  };

  const getAccountReceivableList = (invoiceNo) => {
    const data = pendingInvoiceList.find((s) => s.invoiceNo == invoiceNo);
    return data;
  };

  const InvoiceDropdown = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];
    let invoiceIndex = 0;
    if (pendingInvoiceList.length > 0) {
      const InvoiceIdx = pendingInvoiceList.findIndex(
        (c) => c.invoiceNo == dataValue
      );
      if (InvoiceIdx >= 0) {
        invoiceIndex = InvoiceIdx;
      }
    }
    const handleChange = (e) => {
      let isMatchDataSAC = getAllList("sac", e.value.invoiceNo);
      let isMatchDataIHAC = getAllList("ihac", e.value.invoiceNo);
      let isMatchDataCAC = getAllList("cacId", e.value.invoiceNo);

      const field = props.field || "";
      const newData = LineItemGriddata.map((item) =>
        item.id == props.dataItem.id
          ? {
            ...item,
            [field]:
              e.target.value.invoiceNo || pendingInvoiceList[invoiceIndex],
            rev_BD_SACR: isMatchDataSAC.length ? isMatchDataSAC[0] : "",
            rev_BD_IHAC: isMatchDataIHAC.length ? isMatchDataIHAC[0] : "",
            rev_BD_CAC: isMatchDataCAC.length ? isMatchDataCAC[0] : "",
          }
          : item
      );
      setLineItemGriddata(newData);
    };

    return (
      <td>
        {dataItem?.showInvoiceNumber ? (
          <DropDownList
            onChange={handleChange}
            popupSettings={{ width: "auto" }}
            id={"id"}
            name={"id"}
            dataItemKey="id"
            value={pendingInvoiceList[invoiceIndex]}
            data={pendingInvoiceList.sort((a, b) => {
              const isANumber = /^\d/.test(a["invoiceNo"]);
              const isBNumber = /^\d/.test(b["invoiceNo"]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a["invoiceNo"].localeCompare(b["invoiceNo"]);
            })}
            textField="invoiceNo"
          />
        ) : dataItem.inEdit ? (
          <div
            onClick={() => handleShowInvoiceNumber(props)}
            style={{
              border: "1px solid #b7b5b596",
              borderRadius: "5px",
              padding: dataValue ? "7px" : "17px",
            }}
            className={"bg-white"}
          >
            {dataValue}
          </div>
        ) : (
          <div onClick={() => handleShowInvoiceNumber(props)}>{dataValue}</div>
        )}
      </td>
    );
  };

  const handleShowInvoiceNumber = (props) => {
    if (LineItemGriddata.length > 0) {
      const newData = LineItemGriddata.map((item) =>
        item.id == props.dataItem.id
          ? {
            ...item,
            showInvoiceNumber: true,
          }
          : item
      );
      setLineItemGriddata([...newData]);
    }
  };

  const cacDropdown = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];

    const data = pendingInvoiceList.find(
      (s) => s.invoiceNo == dataItem.invoiceNo
    );
    let cacArr = !!data
      ? getMatchedCountyCodeList(data?.accountReceivableDescs).length
        ? getMatchedCountyCodeList(data?.accountReceivableDescs)
        : CACDDList
      : CACDDList;

    let cacIndex = -1;
    if (cacArr.length) {
      cacIndex = cacArr.findIndex((c) => c.id == dataValue);
    }
    cacArr = cacArr.sort((a, b) => a.text - b.text);

    const handleChange = (e) => {
      if (props.onItemChange) {
        props.onItemChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value ? e.target.value.id : "",
        });
      }
      itemChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ? e.target.value.id : "",
      });
    };

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
    const textField = "text";
    return (
      <td>
        {dataItem.inEdit ? (
          <MultiColumnComboBox
            onChange={handleChange}
            value={cacArr.find((c) => c.id == dataValue)}
            data={cacArr.sort((a, b) => {
              const isANumber = /^\d/.test(a[textField]);
              const isBNumber = /^\d/.test(b[textField]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;
              return a[textField].localeCompare(b[textField]);
            })}
            dataItemKey="id"
            columns={CACColumns}
            textField={textField}
          />
        ) : cacIndex >= 0 ? (
          cacArr[cacIndex].text
        ) : null}
      </td>
    );
  };
  const sacDropdown = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];
    let isMatchDataSAC = getAllList("sac", dataItem.invoiceNo);

    const handleChange = (e) => {
      if (props.onItemChange) {
        props.onItemChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value,
        });
      }

      itemChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value,
      });
    };

    return (
      <td>
        {dataItem.inEdit ? (
          dataValue && isMatchDataSAC?.length ? (
            <div className="d-flex align-items-center border rounded-2 overflow-hidden bg-white">
              <DropDownList
                onChange={handleChange}
                popupSettings={{ width: "auto" }}
                id={"id"}
                name={"id"}
                value={dataValue}
                data={isMatchDataSAC}
              />
            </div>
          ) : (
            <div className="d-flex align-items-center border rounded-2 overflow-hidden bg-white">
              <Input
                onClick={() => handleSacDialog(dataItem)}
                id={"sac"}
                name={"sac"}
                value={dataValue}
                style={{
                  border: "none",
                  borderRadius: "0px",
                  boxShadow: "none",
                }}
              />

              {dataItem[field] && (
                <div
                  style={{ padding: "0px 7px", cursor: "pointer" }}
                  onClick={() => {
                    setSacCode("");
                    let index = LineItemGriddata.findIndex(
                      (sac) => sac.id == dataItem.id
                    );
                    LineItemGriddata[index].rev_BD_SACR = "";
                    setLineItemGriddata(LineItemGriddata);
                    setGridKey(gridKey + 1);
                  }}
                >
                  <i
                    className="fa-solid fa-close"
                    style={{ color: "#999fa9" }}
                  ></i>
                </div>
              )}
            </div>
          )
        ) : (
          dataValue
        )}
      </td>
    );
  };

  const [SelectedSac, setSelectedSac] = useState();
  const handleSacDialog = (data) => {
    setSelectedSac(data);
    setVisible(true);
  };

  const [, setSacCode] = React.useState("");
  const [, setCacCode] = React.useState("");

  const getSacCode = (sac) => {
    setSacCode(sac);
    let index = LineItemGriddata.findIndex((sac) => sac.id == SelectedSac.id);
    LineItemGriddata[index].rev_BD_SACR = sac;
  };
  const getSacCode1 = (sac) => {
    setSacCode(sac);
    LineItemGriddata[0].rev_BD_SACR = sac;
  };
  const getCacCode = (cac) => {
    setCacCode(cac);
    LineItemGriddata[0].rev_BD_CAC = cac?.value?.id;
  };
  const IHACpopupCommandCell = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];
    let isMatchDataIHAC = getAllList("ihac", dataItem.invoiceNo);
    const handleChange = (e) => {
      if (props.onItemChange) {
        props.onItemChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value,
        });
      }

      itemChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value,
      });
    };
    return (
      <td>
        {dataItem.inEdit ? (
          dataValue && isMatchDataIHAC?.length ? (
            <div className="d-flex align-items-center border rounded-2 overflow-hidden bg-white">
              <DropDownList
                onChange={handleChange}
                popupSettings={{ width: "auto" }}
                id={"id"}
                name={"id"}
                value={dataValue}
                data={isMatchDataIHAC}
              />
            </div>
          ) : (
            <div className="d-flex align-items-center border rounded-2 overflow-hidden bg-white">
              <Input
                onClick={() => handleIHACDialog(dataItem)}
                id={"rev_BD_IHAC"}
                name={"rev_BD_IHAC"}
                value={dataValue}
                style={{
                  border: "none",
                  borderRadius: "0px",
                  boxShadow: "none",
                }}
              />
              {dataItem[field] && (
                <div
                  style={{ padding: "0px 7px", cursor: "pointer" }}
                  onClick={() => {
                    setIHPOCode("");

                    let index = LineItemGriddata.findIndex(
                      (item) => item.id == dataItem.id
                    );
                    LineItemGriddata[index].rev_BD_IHAC = "";
                    setGridKey(gridKey + 1);
                  }}
                >
                  <i
                    className="fa-solid fa-close"
                    style={{ color: "#999fa9" }}
                  ></i>
                </div>
              )}
            </div>
          )
        ) : (
          dataValue
        )}
      </td>
    );
  };

  const [SelectedIHAC, setSelectedIHAC] = useState();

  const handleIHACDialog = (data) => {
    setSelectedIHAC(data);
    setVisibleIHPO(true);
  };

  const projectDropdown = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];
    const projectIndex = projectOptions.findIndex((c) => c.id == dataValue);
    const handleChange = (e) => {
      if (props.onItemChange) {
        props.onItemChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value.id,
        });
      }
      itemChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value.id,
      });
    };
    const newSortedArr = projectOptions.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            onChange={handleChange}
            popupSettings={{ width: "auto" }}
            value={projectOptions.find((c) => c.id == dataValue)}
            data={newSortedArr.sort((a, b) => {
              const isANumber = /^\d/.test(a["name"]);
              const isBNumber = /^\d/.test(b["name"]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a["name"].localeCompare(b["name"]);
            })}
            textField="name"
          />
        ) : projectIndex >= 0 ? (
          projectOptions[projectIndex].name
        ) : null}
      </td>
    );
  };
  const OtherDescriptionDropdown = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];
    const projectIndex = otherDescOptions.findIndex((c) => c.id == dataValue);
    const handleChange = (e) => {
      if (props.onItemChange) {
        props.onItemChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value.id,
        });
      }
      itemChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value.id,
      });
    };
    const newSortedArr = otherDescOptions?.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            onChange={handleChange}
            popupSettings={{ width: "auto" }}
            value={otherDescOptions.find((c) => c.id == dataValue)}
            data={newSortedArr.sort((a, b) => {
              const isANumber = /^\d/.test(a["name"]);
              const isBNumber = /^\d/.test(b["name"]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a["name"].localeCompare(b["name"]);
            })}
            textField="name"
          />
        ) : projectIndex >= 0 ? (
          otherDescOptions[projectIndex].name
        ) : null}
      </td>
    );
  };

  const cancel = (dataItem) => {
    getLineITem(RevenueNumber);
  };

  const itemChange = (event) => {
    const field = event.field || "";
    const newData = LineItemGriddata.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [field]: event.value,
        }
        : item
    );
    setLineItemGriddata(newData);
  };
  const enterEdit = (dataItem) => {
    let newData = LineItemGriddata.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item.id == 0
          ? {
            ...item,
            rev_BD_Amount: 0,
          }
          : item
    );
    setLineItemGriddata(newData);
  };

  const editField = "inEdit";

  const LineItemGridCommandCell = (props) => {
    return (
      <MyCommandCell
        {...props}
        edit={enterEdit}
        remove={openDeleteDialog}
        discard={discard}
        add={add}
        update={update}
        cancel={cancel}
        editField={editField}
        type={state?.type}
      />
    );
  };
  const openDeleteDialog = (record) => {
    setDeleteVisible(record.id);
  };
  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };
  const DeleteOnClick = () => {
    axiosInstance({
      method: "delete",
      url: RevenueDetailsBD.revenueDetails + "/" + deleteVisible,
      withCredentials: false,
    })
      .then((response) => {
        closeDeleteDialog();
        getLineITem(RevenueNumber);
        showSuccessNotification("Lineitem deleted successfully");
      })
      .catch(() => { });
  };
  const discard = (dataItem) => { };
  const add = (dataItem) => {
    let LineItemAmount = 0;
    LineItemGriddata.map((item) => {
      LineItemAmount = LineItemAmount + (Number(item.rev_BD_Amount) || 0);
    });
    if (RevenueRef.current?.rev_Amount) {
      LineItemAmount = RevenueRef.current?.rev_Amount - LineItemAmount;
    }
    if (LineItemAmount >= 0) {
      dataItem.inEdit = false;
      if (dataItem.invoiceNo) {
        const invoiceId = pendingInvoiceList.find(
          (item) => item.invoiceNo == dataItem.invoiceNo
        );
        if (invoiceId?.id) dataItem.invoiceId = invoiceId.id;
      }
      AddLineItem(dataItem);
      handleResetLineItemData();
    } else {
      showErrorNotification(
        "LineItem total amount should be lower than revenue amount"
      );
    }
  };
  const update = (dataItem) => {
    let LineItemAmount = 0;
    LineItemGriddata.map((item) => {
      LineItemAmount = LineItemAmount + (Number(item.rev_BD_Amount) || 0);
    });
    if (RevenueRef.current?.rev_Amount) {
      LineItemAmount = RevenueRef.current?.rev_Amount - LineItemAmount;
    }
    if (LineItemAmount >= 0) {
      if (dataItem.invoiceNo) {
        const invoiceId = pendingInvoiceList.find(
          (item) => item.invoiceNo == dataItem.invoiceNo
        );
        if (invoiceId?.id) dataItem.invoiceId = invoiceId.id;
      }
      EditLineItem(dataItem);
    } else {
      showErrorNotification(
        "LineItem total amount should be lower than PO total"
      );
    }
  };
  const [formInit,] = useState([]);

  const [ShowBDDialog, setShowBDDialog] = useState(false);

  const handleShowBDDialogClose = () => {
    setShowBDDialog(false);
  };

  const handleBDRequest = (dataItem) => { };

  const [visible, setVisible] = React.useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const RevenueddlOnChange = (event) => {
    if(event.value == null){
      return;
    }
    if (event.syntheticEvent.type == "change") {
      SearchRevenueReceived(event.target.value);
    } else {
      let ReceivedIndex = RevenueReceivedList.findIndex(
        (x) => x.id == event.target.value.id
      );
      if (ReceivedIndex >= 0) {
        setRevenueReceivedVal(RevenueReceivedList[ReceivedIndex]);
        setShowCustomerDetail(true);
        setShowCustomerOption(true);
        setShowCustomerform(true);
      }
    }
  };

  const ChooseDiffCust = () => {
    setShowCustomerDetail(false);
    setShowCustomerform(true);
  };
  const itemRender = (li, itemProps) => {
    const itemChildren = (
      <div>
        <span
          style={{
            fontWeight: "bold",
          }}
        >
          {li.props.children}
        </span>
        <br></br>
        <span>{itemProps.dataItem.desc}</span>
      </div>
    );
    return React.cloneElement(li, li.props, itemChildren);
  };

  const [visibleIHPO, setVisibleIHPO] = React.useState(false);
  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };

  const [IHPOCode, setIHPOCode] = React.useState("");
  const getIHACCode = (ihpo) => {
    setIHPOCode(ihpo);

    let index = LineItemGriddata.findIndex(
      (item) => item.id == SelectedIHAC.id
    );
    LineItemGriddata[index].rev_BD_IHAC = ihpo;
  };
  const [CustomerSearch, setCustomerSearch] = useState("");

  React.useEffect(() => {
    const getData = setTimeout(() => {
      SearchRevenueReceived(CustomerSearch);
    }, 1000);
    return () => clearTimeout(getData);
  }, [CustomerSearch]);

  const onFilterChange = (event) => {
    let searchText = event.filter.value;
    setCustomerSearch(searchText);
  };
  const [showVendopDetail, setShowVendopDetail] = React.useState(false);

  const handleVendorDialogClose = (message) => {
    setShowVendopDetail(false);
    if (message !== "") {
      showSuccessNotification(message);
      SearchRevenueReceived("");
    }
  };
  const handlevendorDetail = (vendor) => {
    setRevenueReceivedVal(vendor);
    setShowCustomerDetail(true);
    setShowCustomerOption(true);
    setShowCustomerform(true);
  };
  function getFileNameFromPath(path) {
    const parts = path.split(/[\\/]/);
    const filename = parts[parts.length - 1];
    return filename;
  }
  const getDocuments = async (docName) => {
    axiosInstance({
      method: "Get",
      url:
        UploadDocumentEndPoints.GetUploadDocumentList +
        "fileType=" +
        "" +
        "&&docName=" +
        docName +
        "&&search=" +
        "" +
        "&&skip=" +
        0 +
        "&&take=" +
        15,
      withCredentials: false,
    })
      .then((response) => {
        setDocData(response.data.data[0] || "");
      })
      .catch(() => { });
  };
  function DownloadDoc() {
    var base64String = docData.fileData;
    var filename = docData.fileName;
    if (base64String !== "" && filename !== "") {
      const binaryString = window.atob(base64String);

      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getFileNameFromPath(filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("File not found..");
    }
  }
  const [DocumentPopupVisible, setDocumentPopupVisible] = React.useState(false);
  const [selectedRevenueBreakdown, setSelectedRevenueBreakdown] = useState("");

  const openDocumentPopup = () => {
    setSelectedRevenueBreakdown("R-" + state.revenueId);
    setDocumentPopupVisible(!DocumentPopupVisible);
  };
  const closeDocumentPopup = (flag) => {
    setDocumentPopupVisible(flag);
    getDocuments("R-" + state.revenueId);
  };
  const DropDownCommandCell = (props) => {
    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value,
        });
      }
    };
    const { dataItem } = props;
    const field = props.field || "";
    let dataValue = dataItem[field] == null ? "" : dataItem[field];
    if (typeof dataValue == "number") {
      let index = TypeList.findIndex((type) => type.id == dataValue);
      dataValue = TypeList[index];
    }

    const TypeListSorted = TypeList.sort((a, b) =>
      a.value.localeCompare(b.value)
    );

    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            onChange={handleChange}
            id={"Type"}
            popupSettings={{ width: "auto" }}
            name={"Type"}
            textField="value"
            dataItemKey="id"
            data={TypeListSorted.sort((a, b) => {
              const isANumber = /^\d/.test(a["value"]);
              const isBNumber = /^\d/.test(b["value"]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a["value"].localeCompare(b["value"]);
            })}
            value={dataValue}
          />
        ) : (
          dataValue?.value
        )}
      </td>
    );
  };
  console.log("LineItemGriddata", LineItemGriddata)
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Account Receivable Revenue')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
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
      <div className="row mb-3">
        <div className="col-sm-8">
          <figure>
            <blockquote className="blockquote">
              <h1>
                {state?.type == "view"
                  ? "View "
                  : RevenueNumber
                    ? "Edit "
                    : "Add "}
                Revenue
              </h1>
            </blockquote>
          </figure>
        </div>
        <div className="col-sm-4 text-end">
          <Button
            themeColor={"primary"}
            className="k-button k-button-lg k-rounded-lg"
            onClick={() => navigate("/revenue")}
          >
            <i className="fa-solid"></i> Revenue Dashboard
          </Button>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              boxShadow:
                "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              padding: "20px",
              height: "fit-content",
            }}
          >
            <Form
              onSubmit={RevenueNumber ? editRevenueForm : AddRevenueForm}
              initialValues={revenueForm}
              key={formKey}
              render={(RevenueformRender) => (
                <FormElement>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        width: "50%",
                        padding: "20px",
                      }}
                    >
                      {!ShowCustomerDetail ? (
                        ShowCustomerOption && (
                          <div className="d-flex justify-content-between align-items-end">
                            <Field
                              id={"rev_From"}
                              name={"rev_From"}
                              label={"Revenue Received From*"}
                              textField="name"
                              dataItemKey="id"
                              // component={FormDropDownList}
                              component={FormCustomerMultiColumnComboBox}
                              data={RevenueReceivedList.sort((a, b) =>
                                a.name.localeCompare(b.name)
                              )}
                              value={RevenueReceivedVal}
                              onChange={RevenueddlOnChange}
                              placeholder="Search Customer..."
                              wrapperstyle={{
                                width: "100%",
                                marginRight: "10px",
                              }}
                              validator={RevenueRecievedFromValidator}
                              filterable={true}
                              onFilterChange={onFilterChange}
                              // itemRender={itemRender}
                            />
                            <div style={{ textAlign: "center" }}>
                              <Button
                                onMouseDown={() => setShowVendopDetail(true)}
                                themeColor={"primary"}
                              >
                                Create New Customer
                              </Button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="d-flex justify-content-between align-items-end">
                          <div>
                            <span>
                              {" "}
                              <b>{RevenueReceivedVal?.name}</b>
                            </span>
                            <br></br>
                            <span> {RevenueReceivedVal?.address1}</span>
                            <br></br>
                            <span>
                              {" "}
                              {RevenueReceivedVal?.city},
                              {RevenueReceivedVal?.state},
                              {RevenueReceivedVal?.zip}
                            </span>
                            <br></br>
                            <a
                              type="button"
                              style={{ color: "blue" }}
                              onClick={ChooseDiffCust}
                            >
                              Choose a different customer
                            </a>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <Button
                              onMouseDown={() => setShowVendopDetail(true)}
                              themeColor={"primary"}
                              disabled={state?.type == "view"}
                            >
                              Create New Customer
                            </Button>
                          </div>
                        </div>
                      )}
                      <div></div>
                    </div>

                    <div style={{ width: "50%", padding: "20px" }}>

                      <Field
                        id={"dateReceived"}
                        name={"dateReceived"}
                        label={"Date Received*"}
                        component={FormDatePicker}
                        disabled={state?.type == "view"}
                        validator={activeDateValidator}
                      />

                      <Field
                        id={"rev_Receipt_No"}
                        name={"rev_Receipt_No"}
                        label={"Receipt Number"}
                        component={FormInput}
                        disabled={RevenueNumber}
                        maxLength={15}
                      />

                      <Field
                        id={"rev_Amount"}
                        name={"rev_Amount"}
                        label={"Amount*"}
                        format={"c"}
                        placeholder={"$ Enter Amount"}
                        component={FormNumericTextBox}
                        step={0}
                        min={0}
                        spinners={false}
                        disabled={state?.type == "view"}
                        validator={currencyAmountValidator}
                      />
                      <Field
                        id={"payoutnum"}
                        name={"payoutnum"}
                        label={"Pay In Number"}
                        component={FormInput}
                        spinners={false}
                        disabled={state?.type == "view"}
                        maxLength={15}
                      />

                      <Field
                        id={"rev_Description"}
                        name={"rev_Description"}
                        label={"Description"}
                        component={FormTextArea}
                        disabled={state?.type == "view"}
                        maxLength={250}
                      />
                      <Field
                        id="noDayTape"
                        name="noDayTape"
                        label="Do Not Include In DayTape"
                        component={FormCheckbox}
                        disabled={state?.type == "view"}
                      />
                    </div>
                  </div>
                  <div
                    className="mb-4"
                    style={{ textAlign: "center", margin: "3px" }}
                  >
                    {RevenueNumber ? (
                      <>
                        {checkPrivialgeGroup("EditARRevenueCM", 2) && (
                          <Button
                            type={"submit"}
                            themeColor={"primary"}
                            disabled={!RevenueformRender.allowSubmit}
                          >
                            Save Revenue
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {checkPrivialgeGroup("AddARRevenueB", 2) && (
                          <Button
                            type={"submit"}
                            themeColor={"primary"}
                            disabled={!RevenueformRender.allowSubmit}
                          >
                            Create Revenue
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </FormElement>
              )}
            />
            {showVendopDetail ? (
              <AddNewVendor
                handleVendorDialogClose={handleVendorDialogClose}
                handleType={"Customer"}
                handlevendorDetail={handlevendorDetail}
              />
            ) : null}

            {RevenueNumber ? (
              <div>
                <fieldset>
                  <div className="row">
                    <div className="col-sm-3 d-flex">
                      <figure>
                        <legend>Revenue Breakdown</legend>
                      </figure>
                    </div>

                    <div className="col-sm-2 text-end">
                      <Button
                        themeColor="primary"
                        className="me-2"
                        title="Download"
                        disabled={docData == "" || docData == undefined}
                        onClick={DownloadDoc}
                        svgIcon={downloadIcon}
                      ></Button>
                      <Button
                        themeColor="primary"
                        title="Upload"
                        onClick={openDocumentPopup}
                        svgIcon={uploadIcon}
                        disabled={state?.type == "view"}
                      ></Button>
                    </div>
                  </div>
                  <Grid
                    resizable={true}
                    data={LineItemGriddata}
                    onItemChange={itemChange}
                    editField={editField}
                    dataItemKey={"id"}
                    sortable={true}
                    sort={sort}
                    scrollable={true}
                    key={gridKey}
                  >
                    <GridColumn
                      field="invoiceNo"
                      title="Invoice Number"
                      width={150}
                      cell={InvoiceDropdown}
                    />
                    <GridColumn
                      field="rev_BD_Check_No"
                      title="Check No"
                      width={150}
                      cell={ColumnFormNumericTextBoxForNonGrouping}
                      format="0"
                    />
                    {PayInDisplay && (
                      <GridColumn
                        field="payIn"
                        title="Pay In"
                        headerClassName="header-right-align"
                        width={150}
                        cell={ColumnFormNumericTextBox}
                      />
                    )}
                    {IHACDisplay && (
                      <GridColumn
                        field="rev_BD_IHAC"
                        title="IHAC"
                        cell={IHACpopupCommandCell}
                        width={220}
                      />
                    )}
                    {SACDisplay && (
                      <GridColumn
                        field="rev_BD_SACR"
                        title="SAC"
                        cell={sacDropdown}
                        width={200}
                      />
                    )}
                    <GridColumn
                      field="rev_BD_CAC"
                      title="CAC"
                      cell={cacDropdown}
                      width={200}
                    />
                    {LicenseDisplay && (
                      <GridColumn
                        field="certLicenseNo"
                        title="Certificate/License"
                        width={150}
                      />
                    )}
                    <GridColumn
                      field="rev_BD_Type"
                      title="Type"
                      cell={DropDownCommandCell}
                      width={210}
                    />
                    <GridColumn
                      field="projectID"
                      title="Project"
                      cell={projectDropdown}
                      width={200}
                    />
                    <GridColumn
                      field="otherDescriptionID"
                      title="Other Revenue"
                      cell={OtherDescriptionDropdown}
                      width={200}
                    />
                    <GridColumn
                      field="bdDescription"
                      title="Description"
                      width={150}
                      cell={DescriptionCell100}
                    />
                    <GridColumn
                      field="rev_BD_Amount"
                      title="Amount"
                      format="{0:c2}"
                      headerClassName="header-right-align"
                      width={150}
                      cell={ColumnFormCurrencyTextBox}
                    />
                    <GridColumn cell={LineItemGridCommandCell} width="120px" />
                  </Grid>
                </fieldset>
              </div>
            ) : null}
            {ShowBDDialog && (
              <Dialog
                width={500}
                height={600}
                title={<span>Update BD info</span>}
                onClose={handleShowBDDialogClose}
              >
                <Form
                  onSubmit={handleBDRequest}
                  initialValues={formInit}
                  key={bdformKey}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <Field
                          id={"amount"}
                          name={"amount"}
                          label={"Amount"}
                          format={"c"}
                          placeholder={"$ Enter Amount"}
                          component={FormNumericTextBox}
                          step={0}
                          min={0}
                          spinners={false}
                        />
                        <Field
                          id={"invoiceNo"}
                          name={"invoiceNo"}
                          label={"Invoice No"}
                          component={FormInput}
                          maxLength={15}
                        />
                        <Field
                          id={"cac"}
                          name={"cac"}
                          label={"CAC"}
                          component={FormInput}
                        />
                        <Field
                          id={"checkNo"}
                          name={"checkNo"}
                          label={"Check No"}
                          component={FormNumericTextBox}
                          maxLength={25}
                        />

                        <Field
                          id={"engProjectID"}
                          name={"engProjectID"}
                          label={"Project"}
                          component={FormDropDownList}
                          data={projectOptions}
                          value={selectedProject}
                          textField="name"
                          dataItemKey="id"
                        />
                        <div
                          style={{ width: "100%" }}
                        >
                          <Field
                            id={"voucherSAC"}
                            name={"voucherSAC"}
                            label={"SAC"}
                            component={FormInput}
                            maxLength={8}
                          />
                        </div>
                        <div
                          style={{ width: "100%" }}
                          onClick={() => setVisibleIHPO(true)}
                        >
                          <Field
                            id={"IHAC"}
                            name={"IHAC"}
                            label={"IHAC"}
                            component={FormInput}
                            maxLength={12}
                          />
                        </div>
                        <Field
                          id={"revType"}
                          name={"revType"}
                          label={"Rev Type"}
                          component={FormInput}
                        />

                        <div className="k-form-buttons">
                          <Button
                            className="col-5"
                            themeColor={"primary"}
                            type={"submit"}
                            disabled={!formRenderProps.allowSubmit}
                          >
                            Apply
                          </Button>

                          <Button
                            className="col-5"
                            onClick={handleShowBDDialogClose}
                          >
                            Cancel
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
        {visible && (
          <SacDialog
            toggleDialog={toggleDialog}
            getSacCode={getSacCode}
            type={6}
          >
            {" "}
          </SacDialog>
        )}
        {visibleIHPO && (
          <IHACDialog
            toggleIHPODialog={toggleIHPODialog}
            getIHACCode={getIHACCode}
            getSacCode={getSacCode1}
            getCAC={getCacCode}
            forihpo={false}
            type={6}
          >
            {" "}
          </IHACDialog>
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
        {DocumentPopupVisible && (
          <DocumentPopup
            onclosePopup={closeDocumentPopup}
            selectedLineItemId={selectedRevenueBreakdown}
            docTypeId={2}
            docNameDisabled={true}
          ></DocumentPopup>
        )}
      </div>
    </>
  );
}
