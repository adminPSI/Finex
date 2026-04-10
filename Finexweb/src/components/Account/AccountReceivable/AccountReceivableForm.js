import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { eyedropperIcon, trashIcon } from "@progress/kendo-svg-icons";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  AccountReceivable,
  AccountReceivablesDesc,
  ConfigurationEndPoints,
  IHACExpenseCodeEndPoints,
  RevenueEndPoints,
  VendorEndPoints
} from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import Constants from "../../common/Constants";
import {
  ColumnFormCurrencyTextBox,
  ColumnFormNumericTextBox,
  FormCheckbox,
  FormCustomerMultiColumnComboBox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox
} from "../../form-components";
import AddNewVendor from "../../modal/AddNewVendor";
import IHACDialog from "../../modal/IHACDialog";
import SacDialog from "../../modal/StateAccountCodeDialog";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../NotificationHandler/NotificationHandler";
import {
  InvoiceToValidator,
  prevCurrNextYearDateValidator
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

  const handleAdditional = React.useCallback(() => {
    props.additionalInfo(dataItem);
  }, [dataItem]);

  if (props.rowType == "groupHeader") return null;

  return inEdit ? (
    <td className="k-command-cell">
      <Button onClick={handleAddUpdate}>{isNewItem ? "Add" : "Update"}</Button>
      {!isNewItem && <Button onClick={handleDiscardCancel}>Cancel</Button>}
    </td>
  ) : (
    <td className="k-command-cell">
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
      <Button
        themeColor="primary"
        onClick={handleAdditional}
        disabled={type == "view"}
      >
        Add Additional Info
      </Button>
    </td>
  );
};

export default function AccountReceivableForm() {
  const navigate = useNavigate();
  const initialSort = [
    {
      field: "id",
      dir: "desc",
    },
  ];
  const CACColumns = [
    {
      field: "countyExpenseCode",
      header: "Name",
      width: "300px",
    },
    {
      field: "countyExpenseDescription",
      header: "Description",
      width: "300px",
    },
  ];

  const [sort,] = React.useState(initialSort);
  const [formKey, setFormKey] = React.useState(1);
  const [receivableForm, setreceivableForm] = React.useState({});
  const [, setShowVendorDetail] = useState(false);
  const [, setAddSubmit] = useState(false);
  const [LineItemGriddata, setLineItemGriddata] = useState([]);
  const [prevLineItemGriddata, setPrevLineItemGriddata] = useState([]);
  useState(false);
  const [receivableId, setReceivableId] = React.useState();
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [CACDDList, setCACDDList] = React.useState([]);
  const [ReceivableCounter, setReceivableCounter] = React.useState(0);
  const [, setReceivableData] = React.useState();
  const [RevenueReceivedList, setRevenueReceivedList] = useState([]);
  const [RevenueReceivedVal, setRevenueReceivedVal] = React.useState({});
  const [SelectedRow, setSelectedRow] = useState({});
  const [IHACDisplay, setIHACDisplay] = useState(false);
  const [AdditionalformInit, setAdditonalFormInit] = useState({});
  const [AdditionalformKey, setAdditionalFormKey] = React.useState(1);
  const [showAdditionalInfoDialog, setShowAdditionalInfoDialog] =
    useState(false);

  const [ShowCustomerOption, setShowCustomerOption] = useState(true);
  const [ShowCustomerDetail, setShowCustomerDetail] = useState(false);
  const [, setShowCustomerform] = useState(true);
  const [gridKey, setGridKey] = useState(0);

  const [CACVal, setCACVal] = React.useState({
    value: {
      text: "Select County Expense Code",
      id: 0,
    },
  });
  const { state } = useLocation();
  const cacRef = useRef([]);
  const ReceivableRef = useRef([]);
  const revenueReceivedRef = useRef();
  const formRef = useRef();

  React.useEffect(() => {
    getihac();
    getCAC();
    getIHACConfig();

    if (!state?.receivableId) {
      commonFuction();
    } else {
      SearchRevenueReceived("");
    }
  }, []);

  const commonFuction = async () => {
    await SearchRevenueReceived("");
    getTemporaryInvoiceNumber();
  };

  React.useEffect(() => {
    if (state?.receivableId) {
      setReceivableId(state.receivableId);
      ReceivableRef.current.id = state.receivableId;
      EditReceivableScreen();
    }
  }, [state]);

  const EditReceivableScreen = async () => {
    if (ReceivableCounter == 0) {
      await SearchRevenueReceived("");
      await getReceivable(state.receivableId);
      getLineITem(state.receivableId);
      setReceivableCounter(ReceivableCounter + 1);
    }
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
        console.log(response)
      })
      .catch(() => { });
  };

  const getReceivable = async (receivableId) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: AccountReceivable.getAccountReceivable + "/" + receivableId,
        withCredentials: false,
      });
      let data = response.data.x;
      setReceivableData(data);
      ReceivableRef.current = data;

      if (data?.countyRevenueContrib) {
        setShowCustomerDetail(true);
        setShowCustomerOption(true);
        setShowCustomerform(true);
        setRevenueReceivedVal(data?.countyRevenueContrib);
      }

      let formData = {
        vendor: "",
        invoiceNo: data?.invoiceNo || null,
        arDate: new Date(data?.arDate) || null,
        amount: data?.amount || 0,
        balance: data?.balance || 0,
        uncollectedDebt: data?.uncollectedDebt || false,
        printed: data?.printed || false,
      };
      setreceivableForm({ ...formData });
      setFormKey(formKey + 1);
    } catch (error) { }
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
    } catch (error) { }
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
  const getTemporaryInvoiceNumber = () => {
    axiosInstance({
      method: "GET",
      url: AccountReceivable.GetTemporaryInvoiceNumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setreceivableForm({
          arDate: new Date(),
          invoiceNo: data,
          amount: 0,
          balance: 0,
        });
        setFormKey(formKey + 1);
      })
      .catch(() => { });
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
        setCACDDList(data);
        cacRef.current = data;
      })
      .catch(() => { });
  };

  const getLineITem = (arId, id) => {
    axiosInstance({
      method: "GET",
      url: AccountReceivablesDesc.getAccountReceivablesDesc + "/" + arId,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.record;
        let LineItemAmount = 0;
        let lineItems = [];
        data.map((item) => {
          LineItemAmount = LineItemAmount + item.amount;
          lineItems.push(item);
        });
        if (ReceivableRef.current?.amount) {
          LineItemAmount = ReceivableRef.current?.amount - LineItemAmount;
        }

        const newDataItem = {
          inEdit: true,
          Discontinued: false,
          id: 0,
        };
        if (state?.type !== "view") {
          lineItems.push(newDataItem);
        }

        let newData = lineItems;
        if (id) {
          newData = LineItemGriddata.map((item) =>
            item.id == id ? { ...item, inEdit: false } : item
          );
        }
        setLineItemGriddata([...newData]);
        setPrevLineItemGriddata([...newData]);
      })
      .catch(() => { });
  };

  const AddReceivableForm = (dataItem, isMsg, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (RevenueReceivedVal.id) {
      let apirequest = {
        id: 0,
        vendorID: RevenueReceivedVal.id,
        arDate: dataItem.arDate,
        invoiceNo: dataItem.invoiceNo,
        amount: 0,
        balance: 0,
        uncollectedDebt: dataItem.uncollectedDebt || false,
        corrected: false,
        printed: dataItem.printed || false,
        countyRevenueContrib: null,
        accountReceivableDescs: null,
        revenueReceivableApproval: null,
      };

      axiosInstance({
        method: "POST",
        url: AccountReceivable.AccountReceivable,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setReceivableId(dataItem.id);
          setAddSubmit(true);
          ReceivableRef.current = data;
          getLineITem(data.id);
          getReceivable(data.id);
          if (isMsg) {
            showSuccessNotification("Account Receivable saved successfully");
          }
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    } else {
      showErrorNotification("Invoice to is required");
    }
    handleResetLineItemData();
  };

  const editReceivableForm = (dataItem, isMsg, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let apirequest = {
      id: ReceivableRef.current.id,
      vendorID: RevenueReceivedVal.id,
      arDate: dataItem.arDate,
      invoiceNo: dataItem.invoiceNo,
      amount: dataItem.amount,
      balance: dataItem.balance,
      uncollectedDebt: dataItem.uncollectedDebt,
      corrected: ReceivableRef.current.corrected,
      printed: dataItem.printed,
      countyRevenueContrib: null,
      accountReceivableDescs: null,
      revenueReceivableApproval: null,
    };
    axiosInstance({
      method: "PUT",
      url:
        AccountReceivable.AccountReceivable + "/" + ReceivableRef.current?.id,
      data: apirequest,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        setReceivableId(data.id);
        getReceivable(ReceivableRef.current?.id);
        getLineITem(data.id);
        if (isMsg) {
          showSuccessNotification("Account Receivable saved successfully");
        }
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
    handleResetLineItemData();
  };

  const handleResetLineItemData = () => {
    let newData = LineItemGriddata.map((item) =>
      item.inEdit
        ? {
          id: 0,
          inEdit: true,
        }
        : item
    );
    setLineItemGriddata(newData);
    setGridKey(gridKey + 1);
  };

  const AddLineItem = (dataItem) => {
    let apirequest = {
      id: 0,
      arID: ReceivableRef.current.id,
      amount: Number(dataItem.quantity) * Number(dataItem.pricePerUnit),
      description: dataItem.description,
      quantity: dataItem.quantity,
      pricePerUnit: dataItem.pricePerUnit,
      unit: dataItem.unit,
      customerID: 0,
      sac: "",
      ihac: "",
      lineBalance: 0,
      caCid: null,
      received: 0,
      countyRevenueContrib: null,
      accountReceivable: null,
    };

    axiosInstance({
      method: "POST",
      url: AccountReceivablesDesc.getAccountReceivableDesc,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        getLineITem(ReceivableRef.current.id);
        let LineItemAmount = 0;
        LineItemGriddata.map((item) => {
          if (item.quantity && item.pricePerUnit) {
            LineItemAmount =
              LineItemAmount +
              Number(item.quantity) * Number(item.pricePerUnit);
          }
        });
        let apirequest = {
          id: receivableForm.id,
          vendorID: RevenueReceivedVal.id,
          arDate: receivableForm.arDate,
          invoiceNo: receivableForm.invoiceNo,
          amount: LineItemAmount,
          balance: receivableForm.balance,
          uncollectedDebt: receivableForm.uncollectedDebt,
          corrected: receivableForm.corrected,
          printed: receivableForm.printed,
          countyRevenueContrib: receivableForm.countyRevenueContrib,
          accountReceivableDescs: receivableForm.accountReceivableDescs,
          revenueReceivableApproval: receivableForm.revenueReceivableApproval,
        };
        editReceivableForm(apirequest);
        showSuccessNotification(
          "Account Receivable lineItem saved successfully"
        );
      })
      .catch(() => { });
  };
  const EditLineItem = (dataItem) => {
    var amount = +dataItem?.quantity * +dataItem?.pricePerUnit || 0;
    amount = amount.toFixed(2);

    let apirequest = {
      id: dataItem.id,
      arID: dataItem.arID,
      amount: amount,
      description: dataItem.description,
      quantity: dataItem.quantity,
      pricePerUnit: dataItem.pricePerUnit,
      unit: dataItem.unit,
      customerID: 0,
      sac: dataItem.sac,
      ihac: dataItem.ihac,
      lineBalance: dataItem.lineBalance,
      caCid: dataItem.caCid,
      received: dataItem.received,
      countyRevenueContrib: null,
      accountReceivable: null,
    };

    axiosInstance({
      method: "PUT",
      url: AccountReceivablesDesc.getAccountReceivableDesc + "/" + dataItem.id,
      data: apirequest,
      withCredentials: false,
    })
      .then(() => {
        getLineITem(receivableId);
        let gridData = [...LineItemGriddata];
        let filterArray = gridData.filter((item) => item.id !== dataItem.id);
        let LineItemAmount = 0;
        filterArray.map((item) => {
          if (item.quantity && item.pricePerUnit) {
            LineItemAmount =
              LineItemAmount +
              Number(item.quantity) * Number(item.pricePerUnit);
          }
        });
        LineItemAmount = Number(LineItemAmount) + Number(amount);
        let apirequest = {
          id: receivableForm.id,
          vendorID: RevenueReceivedVal.id,
          arDate: receivableForm.arDate,
          invoiceNo: receivableForm.invoiceNo,
          amount: LineItemAmount,
          balance: receivableForm.balance,
          uncollectedDebt: receivableForm.uncollectedDebt,
          corrected: receivableForm.corrected,
          printed: receivableForm.printed,
          countyRevenueContrib: receivableForm.countyRevenueContrib,
          accountReceivableDescs: receivableForm.accountReceivableDescs,
          revenueReceivableApproval: receivableForm.revenueReceivableApproval,
        };
        editReceivableForm(apirequest);
        showSuccessNotification(
          "Account Receivable lineItem updated successfully"
        );
      })
      .catch(() => { });
  };
  const AdditionalLineItem = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let apirequest = {
      id: SelectedRow.id,
      arID: SelectedRow.arID,
      amount: SelectedRow.amount,
      description: SelectedRow.description,
      quantity: SelectedRow.quantity,
      pricePerUnit: SelectedRow.pricePerUnit,
      unit: SelectedRow.unit,
      customerID: SelectedRow.customerID,
      sac: dataItem?.sac || null,
      ihac: dataItem?.ihac || null,
      lineBalance: SelectedRow.lineBalance,
      caCid: dataItem?.cac?.id || null,
      received: SelectedRow.received,
      countyRevenueContrib: null,
      accountReceivable: null,
    };

    axiosInstance({
      method: "PUT",
      url:
        AccountReceivablesDesc.getAccountReceivableDesc + "/" + SelectedRow.id,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        getLineITem(data?.arID ?? receivableId);
        handleAdditionalDialogClose();

        showSuccessNotification(
          "Account Receivable lineItem saved successfully"
        );
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const cancel = (dataItem) => {
    const newData = prevLineItemGriddata.map((item) =>
      item.id == dataItem.id ? { ...item, inEdit: false } : item
    );
    setLineItemGriddata(newData);
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
        : item
    );
    setLineItemGriddata(newData);
    setPrevLineItemGriddata(newData);
  };

  const editField = "inEdit";

  const LineItemGridCommandCell = (props) => {
    return (
      <MyCommandCell
        {...props}
        type={state?.type}
        edit={enterEdit}
        remove={openDeleteDialog}
        discard={discard}
        add={add}
        update={update}
        cancel={cancel}
        additionalInfo={additionalInfo}
        editField={editField}
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
      url:
        AccountReceivablesDesc.getAccountReceivableDesc + "/" + deleteVisible,
      withCredentials: false,
    })
      .then((response) => {
        closeDeleteDialog();
        getLineITem(receivableId);
        let gridData = [...LineItemGriddata];
        let filterArray = gridData.filter((item) => item.id !== deleteVisible);

        let LineItemAmount = 0;
        filterArray.map((item) => {
          if (item.quantity && item.pricePerUnit) {
            LineItemAmount =
              LineItemAmount +
              Number(item.quantity) * Number(item.pricePerUnit);
          }
        });
        showSuccessNotification("Lineitem deleted Successfully");

        let apirequest = {
          id: receivableForm.id,
          vendorID: RevenueReceivedVal.id,
          arDate: receivableForm.arDate,
          invoiceNo: receivableForm.invoiceNo,
          amount: LineItemAmount,
          balance: receivableForm.balance,
          uncollectedDebt: receivableForm.uncollectedDebt,
          corrected: receivableForm.corrected,
          printed: receivableForm.printed,
          countyRevenueContrib: receivableForm.countyRevenueContrib,
          accountReceivableDescs: receivableForm.accountReceivableDescs,
          revenueReceivableApproval: receivableForm.revenueReceivableApproval,
        };
        editReceivableForm(apirequest);
      })
      .catch(() => { });
  };
  const discard = (dataItem) => { };

  const add = (dataItem) => {
    if (!dataItem.quantity) {
      showErrorNotification("Quantity is required");
    } else if (!dataItem.pricePerUnit) {
      showErrorNotification("Price per unit is required");
    } else if (dataItem.quantity < 0) {
      showErrorNotification("Quantity can't be negative number");
    } else if (dataItem.pricePerUnit < 0) {
      showErrorNotification("Price Per Unit can't be negative number");
    } else {
      dataItem.inEdit = false;
      AddLineItem(dataItem);
    }
  };
  const update = (dataItem) => {
    if (dataItem.pricePerUnit < 0) {
      showErrorNotification("Price Per Unit can't be negative number");
    } else if (dataItem.quantity < 0) {
      showErrorNotification("Quantity can't be negative number");
    } else {
      if (dataItem.quantity && dataItem.pricePerUnit) {
        EditLineItem(dataItem);
      } else {
        showErrorNotification("LineItem amount can't be 0");
      }
    }
  };

  const additionalInfo = (dataItem) => {
    setSelectedRow(dataItem);
    let cacIndex = cacRef.current.findIndex((x) => x.id == dataItem.cacId);
    if (cacIndex >= 0) {
      setCACVal([cacRef.current[cacIndex]]);
    }
    let formData = {
      cac: cacRef.current[cacIndex],
      sac: dataItem.sac,
      ihac: dataItem.ihac,
    };

    setAdditonalFormInit({ ...formData });
    setAdditionalFormKey(AdditionalformKey + 1);
    setShowAdditionalInfoDialog(true);
  };

  const handleAdditionalDialogClose = () => {
    setShowAdditionalInfoDialog(false);
  };

  const [visible, setVisible] = React.useState(false);
  const [visibleIHPO, setVisibleIHPO] = React.useState(false);
  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };
  const RevenueddlOnChange = (event) => {
    if(event?.value == null){
      return;
    }

    if (event?.syntheticEvent?.type == "change") {
      SearchRevenueReceived(event.target.value);
    } else {
      let ReceivedIndex = RevenueReceivedList?.findIndex(
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

  const toggleDialog = () => {
    setVisible(!visible);
  };
  const [, setSacCode] = React.useState("");
  const getSacCode = (sac) => {
    setSacCode(sac);
    formRef.current.valueSetter("sac", sac);
  };
  const [, setIHPOCode] = React.useState("");
  const getIHACCode = (ihpo) => {
    setIHPOCode(ihpo);
    formRef.current.valueSetter("ihac", ihpo);
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
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Account Receivable')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      <>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              Accounting
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Account Receivable
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Receivable Form
            </li>
          </ol>
        </nav>
        <div className="row mb-3">
          <div className="col-sm-8">
            <figure>
              <blockquote className="blockquote">
                <h1>
                  {" "}
                  {ReceivableRef.current?.id ? "Edit " : ""}Account Receivable Form
                </h1>
              </blockquote>
            </figure>
          </div>
          <div className="col-sm-4 text-end">
            <Button
              themeColor={"primary"}
              className="k-button k-button-lg k-rounded-lg"
              onClick={() => navigate("/AccountReceivable")}
            >
              <i className="fa-solid"></i> Back to Account Receivable
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
                onSubmit={(data, e) =>
                  ReceivableRef.current?.id
                    ? editReceivableForm(data, true, e)
                    : AddReceivableForm(data, true, e)
                }
                initialValues={receivableForm}
                key={formKey}
                ignoreModified={true}
                render={(ReceivableformRender) => (
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
                                id={"vendor"}
                                name={"vendor"}
                                label={"Customer*"}
                                textField="name"
                                dataItemKey="id"
                                component={FormCustomerMultiColumnComboBox}
                                // component={FormDropDownList}
                                data={RevenueReceivedList.sort((a, b) =>
                                  a.name.localeCompare(b.name)
                                )}
                                onChange={RevenueddlOnChange}
                                placeholder="Search Customer..."
                                wrapperstyle={{
                                  width: "100%",
                                  marginRight: "10px",
                                }}
                                filterable={true}
                                onFilterChange={onFilterChange}
                                // itemRender={itemRender}
                                validator={InvoiceToValidator}
                              />
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
                              {state?.type !== "view" && (
                                <a
                                  type="button"
                                  style={{ color: "blue" }}
                                  onClick={ChooseDiffCust}
                                >
                                  Choose a different customer
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ width: "50%", padding: "20px" }}>
                        <Field
                          id={"invoiceNo"}
                          name={"invoiceNo"}
                          label={"Invoice Number*"}
                          component={FormInput}
                          disabled={true}
                        />
                        <Field
                          id={"arDate"}
                          name={"arDate"}
                          label={"Invoice Date*"}
                          component={FormDatePicker}
                          disabled={state?.type == "view"}
                          validator={prevCurrNextYearDateValidator}
                        />
                        <div>
                          <Field
                            id={"amount"}
                            name={"amount"}
                            label={"Invoice Amount"}
                            format={"c"}
                            placeholder={"$ Enter Amount"}
                            component={FormNumericTextBox}
                            step={0}
                            spinners={false}
                            disabled={true}
                          />

                          <Field
                            id={"balance"}
                            name={"balance"}
                            label={"Invoice Balance"}
                            format={"c"}
                            placeholder={"$ Enter Balance"}
                            component={FormNumericTextBox}
                            step={0}
                            spinners={false}
                            disabled={true}
                          />
                        </div>

                        <Field
                          id="uncollectedDebt"
                          name="uncollectedDebt"
                          label="Uncollected Debt"
                          disabled={state?.type == "view"}
                          component={FormCheckbox}
                        />

                        <Field
                          id="printed"
                          name="printed"
                          label="Printed"
                          disabled={state?.type == "view"}
                          component={FormCheckbox}
                        />
                      </div>
                    </div>

                    <div
                      className="mb-4"
                      style={{ textAlign: "center", margin: "3px" }}
                    >
                      {ReceivableRef.current?.id ? (
                        <>
                          {checkPrivialgeGroup(
                            "EditAccountReceivableCM",
                            3
                          ) && (
                              <>
                                <Button
                                  type={"submit"}
                                  themeColor={"primary"}
                                  disabled={
                                    !ReceivableformRender.allowSubmit ||
                                    state?.type == "view"
                                  }
                                >
                                  Save Account Receivable
                                </Button>
                              </>
                            )}
                        </>
                      ) : (
                        <>
                          {checkPrivialgeGroup("AddAccountReceivableB", 2) && (
                            <>
                              <Button
                                type={"submit"}
                                themeColor={"primary"}
                                disabled={
                                  !ReceivableformRender.allowSubmit ||
                                  state?.type == "view"
                                }
                              >
                                Create Account Receivable
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </FormElement>
                )}
              />
              {ReceivableRef.current?.id ? (
                <div>
                  <fieldset>
                    <div className="mb-4 mt-4 d-flex">
                      <legend>Line Items</legend>
                    </div>
                    <Grid
                      resizable={true}
                      data={LineItemGriddata}
                      onItemChange={itemChange}
                      editField={editField}
                      dataItemKey={"id"}
                      sortable={true}
                      sort={sort}
                      onSortChange={(e) => {
                        setShowVendorDetail(e.sort);
                      }}
                      key={gridKey}
                    >
                      <GridColumn
                        field="quantity"
                        title="Quantity*"
                        width="100px"
                        cell={ColumnFormNumericTextBox}
                      />
                      <GridColumn field="unit" title="Unit" width="100px" />
                      <GridColumn
                        field="pricePerUnit"
                        title="Price per Unit*"
                        format="{0:c2}"
                        width="130px"
                        cell={ColumnFormCurrencyTextBox}
                        headerCell={(props) => {
                          return (
                            <span className="k-cell-inner">
                              <span className="k-link !k-cursor-default d-flex justify-content-end">
                                <span className="k-column-title">
                                  {props.title}
                                </span>
                                {props.children}
                              </span>
                            </span>
                          );
                        }}
                      />
                      <GridColumn field="description" title="Description" />
                      <GridColumn
                        field="amount"
                        title="Amount"
                        format="{0:c2}"
                        headerCell={(props) => {
                          return (
                            <span className="k-cell-inner">
                              <span className="k-link !k-cursor-default d-flex justify-content-end">
                                <span className="k-column-title">
                                  {props.title}
                                </span>
                                {props.children}
                              </span>
                            </span>
                          );
                        }}
                        width="150px"
                        cell={(props) => {
                          var amount =
                            props.dataItem?.quantity *
                            props.dataItem?.pricePerUnit || 0;
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
                      <GridColumn
                        field="received"
                        title="Received"
                        format="{0:c2}"
                        width="130px"
                        cell={(props) => {
                          var receivedAmount = props.dataItem?.received || 0;
                          receivedAmount =
                            "$" +
                            receivedAmount
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                          return (
                            <td className="!k-text-right">{`${receivedAmount}`}</td>
                          );
                        }}
                        headerCell={(props) => {
                          return (
                            <span className="k-cell-inner">
                              <span className="k-link !k-cursor-default d-flex justify-content-end">
                                <span className="k-column-title">
                                  {props.title}
                                </span>
                                {props.children}
                              </span>
                            </span>
                          );
                        }}
                      />
                      <GridColumn
                        field="lineBalance"
                        title="Line Balance"
                        editable={false}
                        format="{0:c2}"
                        width="130px"
                        cell={(props) => {
                          var amount =
                            props.dataItem?.lineBalance >= 0
                              ? props.dataItem?.lineBalance
                              : props.dataItem?.quantity *
                              props.dataItem?.pricePerUnit || 0;
                          amount =
                            "$" +
                            amount
                              .toFixed(2)
                              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                          return (
                            <td className="!k-text-right">{`${amount}`}</td>
                          );
                        }}
                        headerCell={(props) => {
                          return (
                            <span className="k-cell-inner">
                              <span className="k-link !k-cursor-default d-flex justify-content-end">
                                <span className="k-column-title">
                                  {props.title}
                                </span>
                                {props.children}
                              </span>
                            </span>
                          );
                        }}
                      />
                      <GridColumn cell={LineItemGridCommandCell} />
                    </Grid>
                  </fieldset>
                </div>
              ) : null}
              {showAdditionalInfoDialog && (
                <Dialog
                  width={500}
                  title={<span>Additional Info</span>}
                  onClose={handleAdditionalDialogClose}
                >
                  <Form
                    onSubmit={AdditionalLineItem}
                    ref={formRef}
                    initialValues={AdditionalformInit}
                    key={AdditionalformKey}
                    ignoreModified={true}
                    render={(formRenderProps) => (
                      <FormElement>
                        <fieldset className={"k-form-fieldset"}>
                          <div
                            style={{ width: "100%" }}
                            onClick={() => setVisible(true)}
                          >
                            <Field
                              id={"sac"}
                              name={"sac"}
                              label={"SAC"}
                              component={FormInput}
                            />
                          </div>
                          {IHACDisplay && (
                            <div
                              style={{ width: "100%" }}
                              onClick={() => setVisibleIHPO(true)}
                            >
                              <Field
                                id={"ihac"}
                                name={"ihac"}
                                label={"IHAC"}
                                component={FormInput}
                              />
                            </div>
                          )}

                          <Field
                            id={"cac"}
                            name={"cac"}
                            label={"County Revenue Account Code"}
                            textField="countyExpenseCode"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            data={CACDDList}
                            value={CACVal}
                            columns={CACColumns}
                            placeholder="Search CAC..."
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
                              onClick={handleAdditionalDialogClose}
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
                  forihpo={false}
                  type={6}
                >
                  {" "}
                </IHACDialog>
              )}
              {showVendopDetail ? (
                <AddNewVendor
                  handleVendorDialogClose={handleVendorDialogClose}
                  handleType={"Customer"}
                  handlevendorDetail={handlevendorDetail}
                />
              ) : null}

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
            </div>
          </div>
        </div>
      </>
    </>
  );
}
