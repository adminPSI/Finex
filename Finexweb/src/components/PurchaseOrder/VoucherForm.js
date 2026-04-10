import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { Tooltip } from "@progress/kendo-react-tooltip";
import {
  cancelIcon,
  downloadIcon,
  eyedropperIcon,
  saveIcon,
  trashIcon,
  uploadIcon,
} from "@progress/kendo-svg-icons";
import Axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import {
  ConfigurationEndPoints,
  IHACExpenseCodeEndPoints,
  IHPOEndPoints,
  PurchaseOrderEndPOints,
  ReportsEndPoints,
  UploadDocumentEndPoints,
  VendorEndPoints,
  VoucherBD,
  VoucherEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import { projectService } from "../../services/ProjectServices";
import { DatePickerCell } from "../DatePickerCell";
import {
  ColumnFormCurrencyTextBox,
  ColumnFormNegativeCurrencyTextBox,
  FormCustomerMultiColumnComboBox,
  FormCustomerWithVendorNoMultiColumnComboBox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
  FormTextArea
} from "../form-components";
import AddNewVendor from "../modal/AddNewVendor";
import IHACDialog from "../modal/IHACDialog";
import SacDialog from "../modal/StateAccountCodeDialog";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import DocumentPopup from "../UploadFile/DocumentPopup";
import { poValidator, supplierValidator } from "../validators";

const MyCommandCell = (props) => {
  const { dataItem } = props;
  const isNewItem = dataItem?.id <= 0;

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
      <Button onClick={handleAddUpdate} svgIcon={saveIcon}>
      </Button>
      {!isNewItem && (
        <Button onClick={handleDiscardCancel} svgIcon={cancelIcon}></Button>
      )}
    </td>
  ) : (
    <td className="k-command-cell">
      <Button
        themeColor="primary"
        onClick={handleEdit}
        svgIcon={eyedropperIcon}
      ></Button>
      <Button
        themeColor="primary"
        onClick={handleRemove}
        svgIcon={trashIcon}
      ></Button>
    </td>
  );
};

export default function VoucherPOForm(props) {
  const { state } = useLocation();
  const CACColumns = [
    {
      field: "id",
      header: "ID",
      width: "100px",
    },
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
  const [dataState,] = useState(state);
  const [VoucherForm, setVoucherForm] = React.useState({});
  const [formKey, setFormKey] = React.useState(1);
  const [bdformKey, setBDFormKey] = React.useState(1);
  const [ShowVendorOption, setShowVendorOption] = useState(true);
  const [ShowVendorDetail, setShowVendorDetail] = useState(false);
  const [ShowVendorform, setShowVendorform] = useState(true);
  const [VoucherId, setVoucherId] = useState("");
  const [LineItemGriddata, setLineItemGriddata] = useState([]);
  const [BDGriddata, setBDGriddata] = useState([]);
  const [ShowBDDialog, setShowBDDialog] = useState(false);
  const [AmountWarningVisible, setAmountWarningVisible] = useState(false);
  const [AutoFillIHACConfig,] = useState(false);

  const [projectOptions, setProjectOptions] = useState([]);
  const [selectedProject,] = useState({});
  const [WarrantDisplay, setWarrantDisplay] = useState(false);
  const [selectedLineItemId, setSelectedLineItemId] = useState("");
  const [IHACDisplay, setIHACDisplay] = useState(false);
  const [IHPODisplay, setIHPODisplay] = useState(false);
  let [IHPOLineItemPoId,] = useState(null);
  const [VoucherAmountConfig, setVoucherAmountConfig] = useState(false);
  const [, setShowSAC] = useState(false);
  const [forVoucher, setForVoucher] = useState(false);
  const [IhacSacDisplay, setIhacSacDisplay] = React.useState(false);
  const [isDateWrittenEnable, setIsDateWrittenEnable] = React.useState(false);
  const [isView, setIsView] = React.useState(false);
  const vendorRef = useRef([]);
  const voucherRef = useRef();
  const cacRef = useRef();
  const poRef = useRef([]);
  const IHPORef = useRef([]);
  const cacDetailRef = useRef();
  const POBlanceRef = useRef();
  const IHPOBlanceRef = useRef();
  const [gridKey, setGridKey] = useState(0);

  React.useEffect(() => {
    getSupressWarrant();
    getAllProjectList();
    getihac();
    getIHACConfig();
    getIHPOConfig();
    getSACConfig();
    getConfigForForm();
    getConfigForDateWritten();
    getAllowVoucherAmountConfig();
    async function fetchData() {
      if (!state?.voucherId) {
        await getCAC();
        // await SearchVendor("");
      }
    }
    fetchData();
    async function fetchGetLineItem() {
      await getLineITem(state?.ihpoId);
      if (!state?.voucherId && props?.type == "screen") {
        getTemporaryVocher();
      }
    }
    fetchGetLineItem();
    if (state?.type == "view") {
      setIsView(true);
    } else {
      setIsView(false);
    }
    if (props?.type == "model") {
      setIsView(true);
    }
  }, [state]);

  React.useEffect(() => {
    SearchPO("");
  }, []);

  React.useEffect(() => {
    if (state?.voucherId || props?.voucherId) {
      let voucherNumber = state?.voucherId || props?.voucherId;
      async function fetchData() {
        await getCAC();
        // await SearchVendor("");
        GetBD();
      }
      fetchData();
      async function getVoucherData(params) {
        if (voucherNumber && voucherNumber !== "") {
          await getVoucher(voucherNumber);
          await setVoucherId(voucherNumber);
          await getVoucherLineItem(voucherNumber);
        }
      }
      getVoucherData();
    }
    if (state) {
      if (
        state.selectedIHPOUpload &&
        state.selectedIHPOUpload.length &&
        state.selectedIHPOUpload[0].poNumber
      ) {
        SearchPO(state.selectedIHPOUpload[0].poNumber).then(async (data) => {
          const resp = data.data[0];
          async function getAutoFill() {
            const response = await axiosInstance({
              method: "GET",
              url: ConfigurationEndPoints.GetConfigurationById + "/31",
              withCredentials: false,
            });
            const value = Number(response.data.result.settingsValue) == 1 ? true : false;
            return value
          }
          const result = await getAutoFill()
          if (data.data && data.data.length) {
            setPOVal(data.data[0]);
            let poDetail = await getPurchaseOrder(data.data[0].id);
            setCACVal(poDetail?.cacDetail);
            let ihpoDetail = await getIHPOBasedPO(data.data[0].id);
            let configuration = await GetConfigurationMasterData();
            VoucherForm.cac = cacDetailRef.current;
            VoucherForm.poNumber = data.data[0];
            VoucherForm.totalamnt = data.data[0]?.countyPOPricing?.poAmount || 0;
            VoucherForm.balance = data.data[0]?.countyPOPricing?.poBalance || 0;
            VoucherForm.ihpoNo = ihpoDetail?.reqNumber || "";
            if (
              configuration[2].settingsObj[0].keyData[10].settingsValue == "1"
            ) {
              let description = "";
              for (const key of state.selectedIHPOUpload) {
                description += key.reqDDescription + " ";
              }
              VoucherForm.voucherDescription = description;
            }

            if (resp?.countyPODetails?.vendor) {
              setVendorVal(ihpoDetail[0]?.ihpoDetails?.vendor);
              setShowVendorDetail(true);
              setShowVendorOption(true);
              setShowVendorform(true);
            }
            setFormKey(formKey + 1);

            if (result) {
              formInit.voucherSAC = dataState.selectedIHPOUpload[0]?.sAC;
              formInit.voucherIHAC = dataState.selectedIHPOUpload[0]?.reqIHAC
            }
            formInit.allowSubmit = true;
            setFormInit(formInit);
            setBDFormKey(bdformKey + 1);
          }
        });
      }
    }
  }, [state, props?.voucherId, dataState]);

  const GetConfigurationMasterData = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: ConfigurationEndPoints.GetConfigurationData,
        withCredentials: false,
      });
      let data = response.data.result;
      return data;
    } catch (error) {
      console.log("error", error);
    }
  };

  const getIHACConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/19",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setIHACDisplay(value);
      })
      .catch(() => { });
  };

  const getIHPOConfig = async () => {
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

  const getSupressWarrant = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/31",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setWarrantDisplay(value);
      })
      .catch(() => { });
  };

  const getihac = async () => {
    axiosInstance({
      method: "GET",
      url: IHACExpenseCodeEndPoints.GetIHACList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setIHACDDList(data);
      })
      .catch(() => { });
  };
  const getIHPOBalance = async (IHPO) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url:
          IHPOEndPoints.IHPOBalance +
          `?ihponumber=${IHPO.id}&amount=${IHPO.ihpoPricing.reqTotal}`,
        withCredentials: false,
      });

      let data = response.data;
      IHPOBlanceRef.current = data;

      return data;
    } catch (error) { }
  };

  const getPurchaseOrder = async (poId) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: PurchaseOrderEndPOints.GetPurchaseOrder + "/" + poId,
        withCredentials: false,
      });

      let data = response.data;
      let cacIndex = cacRef.current.findIndex(
        (x) => x.id == data.countyPODetails?.pocacid
      );
      if (cacIndex >= 0) {
        cacDetailRef.current = cacRef.current[cacIndex];
        data.cacDetail = cacRef.current[cacIndex];
      }
      return data;
    } catch (error) { }
  };

  const getTemporaryVocher = async () => {
    try {
      let cac = {};
      if (IHPOLineItemPoId) {
        await getIHPOBasedPO(IHPOLineItemPoId);
      }
      let totalAmt = 0;
      let balance = 0;
      let poNumber = "";
      if (IHPOLineItemPoId) {
        poNumber = await getPurchaseOrder(IHPOLineItemPoId);
        cac = poNumber.cacDetail;
        balance = poNumber?.countyPOPricing?.poBalance;
        totalAmt = poNumber?.countyPOPricing?.poAmount;
      }
      if (POBlanceRef.current) {
        balance = POBlanceRef.current;
      }
      if (state?.ihpo) {
        setVendorVal(state?.ihpo?.ihpoDetails?.vendor);
        setShowVendorDetail(true);
        setShowVendorOption(true);
        setShowVendorform(true);
      }
      if (state?.po) {
        balance = state?.po?.countyPOPricing?.poBalance;
        totalAmt = state?.po?.countyPOPricing?.poAmount;
        poNumber = state?.po;
        setPOVal(poNumber);

        async function getAutoFill() {
          const response = await axiosInstance({
            method: "GET",
            url: ConfigurationEndPoints.GetConfigurationById + "/31",
            withCredentials: false,
          });
          const value = Number(response.data.result.settingsValue) == 1 ? true : false;
          return value
        }
        const result = await getAutoFill()

        if (result) {
          formInit.voucherSAC = poNumber.sac || "";
          formInit.voucherIHAC = poNumber.ihac || "";
        }
        formInit.allowSubmit = true;
        setFormInit(formInit);
        setBDFormKey(bdformKey + 1);
        cac = state?.po?.countyPODetails?.accountingCode;
        setVendorVal(state?.po?.countyPODetails?.vendor);
        setShowVendorDetail(true);
        setShowVendorOption(true);
        setShowVendorform(true);
      }
      let formData = {
        ...VoucherForm,
        cac: cac || cacDetailRef.current || {},
        voucherWrittenDate: new Date(),
        ihpoNo: state?.ihpo || "",
        poNumber: poNumber || "",
        totalamnt: totalAmt,
        balance: balance,
        sac: poNumber ? poNumber.sac : "",
        ihac: poNumber ? poNumber.ihac : "",
      };
      setVoucherForm({
        ...formData,
      });
      if (state?.ihpo?.ihpoDetails?.vendor?.id) {
        setVendorVal(state?.ihpo?.ihpoDetails?.vendor);
        setShowVendorDetail(true);
        setShowVendorOption(true);
        setShowVendorform(true);
      }
      setFormKey(formKey + 1);
    } catch (error) { }
  };

  const getIHPOBasedPO = async (poId) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: IHPOEndPoints.IHPOBasedPO + "/" + poId,
        withCredentials: false,
      });
      let data = response.data.record;
      setIHPOList([
        { id: null, reqNumber: "Select IHPO" },
        ...data.sort((a, b) => {
          const isANumber = /^\d/.test(a["reqNumber"]);
          const isBNumber = /^\d/.test(b["reqNumber"]);
          if (!a.id || !b.id) return 1;

          if (isANumber && !isBNumber) return -1;
          if (!isANumber && isBNumber) return 1;

          return a["reqNumber"].localeCompare(b["reqNumber"]);
        }),
      ]);
      IHPORef.current = data;
      return data;
    } catch (error) { }
  };

  const getCountyPOTypes = async () => {
    let poTypes = await axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrderCountyPOTypes,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        return data || []
      })
      .catch(() => { });
    return poTypes || [];
  }

  const getAllProjectList = () => {
    projectService.fetchProjects().then((data) => {
      setProjectOptions(data);
    });
  };
  const getCAC = async () => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.getCAC + "/7",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        cacRef.current = data;
        setCACDDList(data);
      })
      .catch(() => { });
  };
  const getVoucherLineItem = (voucherId, ihpos, add) => {
    axiosInstance({
      method: "GET",
      url: VoucherEndPoints.VoucherLineItem + "/" + voucherId,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data || [];
        let lineItems = data;
        let LineItemAmount = 0;
        data.map((item) => {
          item.invoiceDate = new Date(item.invoiceDate);
          LineItemAmount = LineItemAmount + item.amount;
        });
        if (voucherRef.current?.countyPO?.poAmount) {
          LineItemAmount =
            (voucherRef.current?.countyPO?.poAmount || 0) - LineItemAmount;
        }
        if ((LineItemAmount > 0 || lineItems.length == 0) && !isView) {
          if ((state?.type !== "view" && props?.type !== "model") || add) {
            const newDataItem = {
              inEdit: true,
              Discontinued: false,
              id: 0,
              amount: 0,
              ihpo: state && state.ihpo ? state.ihpo : null,
              iHPONo: state && state.ihpo ? state.ihpo : null,
              ihpoNumber: state && state.ihpo ? state.ihpo.reqNumber : null,
            };
            lineItems.push(newDataItem);
          }
        }
        if (
          !(
            state &&
            state.selectedIHPOUpload &&
            state.selectedIHPOUpload.length
          ) ||
          add
        ) {
          setLineItemGriddata([...lineItems]);
        }
      })
      .catch(() => { });
  };

  const [CACDDList, setCACDDList] = React.useState([]);
  const [, setIHACDDList] = React.useState([]);

  const [CACVal, setCACVal] = React.useState({
    value: {
      text: "Select County Expense Code",
      id: 0,
    },
  });

  const [VendorDDList, setVendorDDList] = React.useState([]);
  const [VendorVal, setVendorVal] = React.useState();

  const handleShowBDDialog = () => {
    setShowBDDialog(true);
  };
  const handleShowBDDialogClose = () => {
    setFormInit({});
    setShowBDDialog(false);
  };
  const toggleAmountWarningDialog = () => {
    setAmountWarningVisible(!AmountWarningVisible);
  };

  const handlePoClose = () => {
    axiosInstance({
      method: "get",
      url: PurchaseOrderEndPOints.ClosePO + `/` + POVal?.id,
      withCredentials: false,
    })
      .then((response) => {
        toggleAmountWarningDialog();
      })
      .catch(() => { });
  };

  const editVoucherForm = (dataItem, isMsg, e) => {
    const submitButton = e?.target?.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let apirequest = {
      id: voucherRef.current.id,
      orG_ID: voucherRef.current.orG_ID,
      ihpoId: dataItem.ihpoId,
      ihpoNumber: dataItem.ihpoNumber,
      poId: dataItem?.poNumber?.id || dataItem.poId,
      voucherAmount: dataItem.voucherAmount || 0,
      voucherBalance: voucherRef.current.voucherBalance,
      voucherInvoice: voucherRef.current.voucherInvoice,
      voucherDate: null,
      voucherPrint: false,
      IHPONumber: dataItem?.ihpoNo?.reqNumber || dataItem?.IHPONumber,
      postDate: dataItem?.datePosted || null,
      poCACId: dataItem?.cac?.id || voucherRef.current.poCACId,
      vendorNo: VendorVal?.id || voucherRef.current.vendorNo,
      voucherWrittenDate: dataItem.voucherWrittenDate,
      voucherVouchNo: voucherRef.current.voucherVouchNo,
      v1099: false,
      invoiceDate: voucherRef.current.invoiceDate,
      posted: false,
      yearClose: false,
      warrantNo: "",
      warrantDate: dataItem.warrantDate,
      mailedDate: dataItem.mailedDate,
      track1099: false,
      finalVoucher: false,
      reqNo: voucherRef.current.reqNo,
      apDate: dataItem.apDate,
      dateCleared: dataItem.dateCleared,
      voided: false,
      dateReceived: voucherRef.current.dateReceived,
      prioR_YEAR_OBLIGATION: false,
      approved: false,
      disapproved: false,
      disapprovedMemo: "",
      corrected: false,
      checkDoutbyWoId: 0,
      nowAndThen: false,
      transCode: "",
      claimNumber: "",
      superDate: "2023-11-24T14:43:50.588Z",
      superId: 0,
      superDisapproved: false,
      superCorrected: false,
      fiscalDate: "2023-11-24T14:43:50.588Z",
      removedFromPrintQuebyWhoId: 0,
      voucherDescription: dataItem.voucherDescription,
      prepaid: false,
      vendorName: VendorVal?.name || voucherRef.current.vendorName,
    };
    axiosInstance({
      method: "PUT",
      url: VoucherEndPoints.PostVoucher + "/" + voucherRef.current.id,
      data: apirequest,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        voucherRef.current = data;
        let balance = 0;
        let total = dataItem.totalamnt || 0;
        let poID = dataItem?.poNumber?.id || dataItem.poId;
        let pobalance = await getPurchaseOrder(poID);
        let currectCac = "";

        if (pobalance?.countyPOPricing?.poBalance) {
          balance = pobalance.countyPOPricing?.poBalance || 0;
          total = pobalance.countyPOPricing?.poAmount || 0;
        }
        if (cacRef.current.length) {
          let cacIndex = cacRef.current.findIndex((x) => x.id == data.poCACId);
          if (cacIndex >= 0) {
            currectCac = cacRef.current[cacIndex];
            setCACVal([cacRef.current[cacIndex]]);
          }
        }
        SearchPO("");
        let formData = {
          Vendor: "",
          voucherVouchNo: data.voucherVouchNo,
          voucherAmount: data.voucherAmount,
          voucherWrittenDate: new Date(data.voucherWrittenDate),
          datePosted: data.postDate ? new Date(data.postDate) : null,
          voucherDescription: data.voucherDescription,
          poNumber: pobalance,
          cac: currectCac,
          ihpoNo: dataItem.ihpoNo || {},
          totalamnt: total,
          balance: balance,
          sac: pobalance ? pobalance.sac : "",
          ihac: pobalance ? pobalance.ihac : "",
        };
        setPOVal(pobalance);
        setVoucherForm({ ...formData });
        setFormKey(formKey + 1);
        if (AutoFillIHACConfig) {
          formInit.voucherSAC = data?.poNumber?.sac;
          formInit.voucherIHAC = data?.poNumber?.ihac;
        }

        formInit.allowSubmit = true;
        setFormInit(formInit);
        setBDFormKey(bdformKey + 1);

        let calculatePerfectage = total * (10 / 100);
        if (balance <= calculatePerfectage) {
          setAmountWarningVisible(true);
        }
        if (isMsg) {
          showSuccessNotification("Voucher saved successfully");
        }
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const VoucherformOnSubmit = (dataItem, isMsg, e) => {
    const submitButton = e?.target?.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let apirequest = {
      id: 0,
      orG_ID: 7,
      poNumber: dataItem.poNumber.poNumber,
      poId: dataItem.poNumber.id,
      voucherAmount: dataItem.voucherAmount || 0,
      voucherBalance: 0,
      voucherInvoice: "",
      voucherDate: null,
      postDate: dataItem?.datePosted || null,
      voucherPrint: false,
      IHPONumber: dataItem.ihpoNo.reqNumber,
      poCACId: dataItem.cac?.id || 0,
      vendorNo: VendorVal?.id,
      voucherWrittenDate: dataItem.voucherWrittenDate || new Date(),
      voucherVouchNo: dataItem.voucherVouchNo,
      v1099: false,
      invoiceDate: null,
      posted: false,
      yearClose: false,
      warrantNo: "",
      warrantDate: dataItem?.warrantDate ? dataItem?.warrantDate : null,
      mailedDate: dataItem?.mailedDate ? dataItem?.mailedDate : null,
      track1099: false,
      finalVoucher: false,
      reqNo: 0,
      apDate: dataItem?.apDate ? dataItem?.apDate : null,
      dateCleared: dataItem?.dateCleared ? dataItem?.dateCleared : null,
      voided: false,
      dateReceived: null,
      prioR_YEAR_OBLIGATION: false,
      approved: false,
      disapproved: false,
      disapprovedMemo: "",
      corrected: false,
      checkDoutbyWoId: 0,
      nowAndThen: false,
      transCode: "",
      claimNumber: "",
      superDate: null,
      superId: 0,
      superDisapproved: false,
      superCorrected: false,
      fiscalDate: null,
      removedFromPrintQuebyWhoId: 0,
      voucherDescription: dataItem.voucherDescription || "",
      prepaid: false,
      vendorName: VendorVal?.name || "",
    };
    axiosInstance({
      method: "POST",
      url: VoucherEndPoints.PostVoucher,
      data: apirequest,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        setVoucherId(data.id);
        voucherRef.current = data;
        let ihpoList = null;
        if (dataItem.poNumber.id) {
          ihpoList = await getIHPOBasedPO(dataItem.poNumber.id);
        }
        //getVoucherLineItem(data.id, ihpoList, true);
        SearchPO("");
        let balance = 0;
        if (data.ihpoNumber) {
          balance = await getIHPOBalance(dataItem.ihpoNo);
        } else if (data.poId) {
          let poDetail = await getPurchaseOrder(data.poId);
          balance = poDetail?.countyPOPricing?.poBalance;
          setPOVal(poDetail);
        }
        let formData = {
          Vendor: "",
          voucherVouchNo: data.voucherVouchNo,
          voucherAmount: data.voucherAmount,
          voucherWrittenDate: new Date(data.voucherWrittenDate),
          datePosted: data.postDate ? new Date(data.postDate) : null,
          voucherDescription: data.voucherDescription,
          poNumber: dataItem.poNumber,
          cac: dataItem.cac,
          ihpoNo: dataItem.ihpoNo || {},
          totalamnt: dataItem.totalamnt,
          balance: balance,
          sac: dataItem.poNumber ? dataItem.poNumber.sac : "",
          ihac: dataItem.poNumber ? dataItem.poNumber.ihac : "",
        };
        setVoucherForm({ ...formData });
        setFormKey(formKey + 1);

        formInit.allowSubmit = true;
        setFormInit(formInit);
        setBDFormKey(bdformKey + 1);

        let calculatebalance = balance * (90 / 100);
        if (data.voucherAmount > calculatebalance) {
          setAmountWarningVisible(true);
        }
        if (isMsg) {
          showSuccessNotification("Voucher saved successfully");
        }


        if (
          state &&
          state.selectedIHPOUpload &&
          state.selectedIHPOUpload.length
        ) {
          async function fetchData() {
            await getCAC();
            // await SearchVendor("");
            GetBD();
          }
          fetchData();
          await getVoucher(data.id);
          setVoucherId(data.id);
          const lineItems = [];
          console.log(state);
          let amount = 0,
            reqIHAC = [],
            sAC = [];
          var lineItemId = 0;
          for (const key of state.selectedIHPOUpload) {
            //amount += key.reqDTotal;
            reqIHAC.push(key.reqIHAC);
            sAC.push(key.sAC);

            var lineItemEntry = {
              id: lineItemId,
              inEdit: true,
              invoiceNumber: "",
              amount: key.balance,
              invoiceDate: new Date(),
              ihpo: state.ihpo ? state.ihpo : null,
              iHPONo: state.ihpo ? state.ihpo : null,
              ihpoNumber: state.ihpo ? state.ihpo.reqNumber : null,
              voucherID: data.id,
              reqIHAC,
              sAC,
              lineitemReqIHAC: key.reqIHAC,
              lineitemSAC: key.sAC,
              ihpoLineItemID: key.id
            };
            console.log(lineItemId);
            lineItems.push(lineItemEntry);
            lineItemId--;
          }
          console.log(lineItems);
          setLineItemGriddata(lineItems);
        }
        else if (add) {
          const lineItems = [];
          var newDataItem = {
            Discontinued: false,
            invoiceDate: null,
            amount: 0,
            iHPONo: null,
            id: 0,
            ihpo: null,
            ihpoNumber: null,
            invoiceNumber: null,
            inEdit: true,
          }
          lineItems.push(newDataItem);

          setLineItemGriddata(lineItems);
          setGridKey(gridKey + 1);

        }
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const VendorddlOnChange = (event) => {
    if(event.value == null){
      return;
    }
    if (event.syntheticEvent.type == "change") {
      SearchVendor(event.target.value);
    } else {
      let vendorIndex = VendorDDList.findIndex(
        (x) => x.id == event.target.value.id
      );
      if (vendorIndex >= 0) {
        setVendorVal(VendorDDList[vendorIndex]);
        setShowVendorDetail(true);
        setShowVendorOption(true);
        setShowVendorform(true);
      }
    }
  };

  const SearchVendor = async (searchText) => {
    axiosInstance({
      method: "POST",
      url:
        VendorEndPoints.VendorFilter +
        "?isActive=" +
        "Y" +
        "&vendorType=vendor" +
        "&name=" +
        searchText,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        vendorRef.current = data;
        setVendorDDList(data);
      })
      .catch(() => { });
  };

  const [showVendopDetail, setShowVendopDetail] = React.useState(false);

  const handleVendorDialogClose = () => {
    setShowVendopDetail(false);
  };
  const handlevendorDetail = (vendor) => {
    setVendorVal(vendor);
    setShowVendorDetail(true);
    setShowVendorOption(true);
    setShowVendorform(true);
  };
  const getAllowVoucherAmountConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/21",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setVoucherAmountConfig(value);
      })
      .catch(() => { });
  };
  const handleFormSubmit = (dataItem, e) => {
    if (dataItem.ihpoNo.reqNumber) {
      if (IHPOBlanceRef.current < dataItem.voucherAmount) {
        showErrorNotification(
          "Voucher amount should be lower than IHPO balance"
        );
        return;
      }
    } else if (dataItem.poNumber) {
      if (POBlanceRef.current < dataItem.voucherAmount) {
        showErrorNotification("Voucher amount should be lower than PO balance");
        return;
      }
    }
    if (voucherRef.current?.id) {
      editVoucherForm(dataItem, true, e);
    } else {
      VoucherformOnSubmit(dataItem, true, e);
    }
    handleResetLineItemData();
  };

  const getVoucher = async (voucherId) => {
    axiosInstance({
      method: "GET",
      url: VoucherEndPoints.GetVoucher + "/" + voucherId,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        voucherRef.current = data;
        if (data?.vendor?.id) {
          setVendorVal(data?.vendor);
          setShowVendorDetail(true);
          setShowVendorOption(true);
          setShowVendorform(true);
        }
        let ihpoDetails = data.poId
          ? (await getIHPOBasedPO(data.poId)) || {}
          : {};

        let POdetail = data.poId
          ? (await getPurchaseOrder(data.poId)) || {}
          : {};
        let currectCac = "";
        if (cacRef.current && cacRef.current.length) {
          let cacIndex = cacRef.current.findIndex((x) => x.id == data.poCACId);
          if (cacIndex >= 0) {
            currectCac = cacRef.current[cacIndex];
            setCACVal([cacRef.current[cacIndex]]);
          }
        }
        let ihpoDetail = {};

        if (ihpoDetails && ihpoDetails.length) {
          let ihpoIndex = ihpoDetails.findIndex(
            (ihpo) => ihpo.reqNumber == data.ihpoNumber
          );
          ihpoDetail = ihpoDetails[ihpoIndex];
        }
        let formData = {
          Vendor: "",
          voucherVouchNo: data.voucherVouchNo,
          voucherAmount: data.voucherAmount,
          voucherWrittenDate: new Date(data.voucherWrittenDate),
          datePosted: data.postDate ? new Date(data.postDate) : null,
          voucherDescription: data.voucherDescription,
          poNumber: POdetail,
          cac: currectCac,
          ihpoNo: ihpoDetail || {},
          totalamnt: POdetail?.countyPOPricing?.poAmount
            ? POdetail?.countyPOPricing?.poAmount
            : 0,
          balance: POdetail?.countyPOPricing?.poBalance
            ? POdetail?.countyPOPricing?.poBalance
            : 0,
          sac: POdetail ? POdetail.sac : "",
          ihac: POdetail ? POdetail.ihac : "",
        };
        setPOVal(POdetail);
        setVoucherForm({ ...formData });
        setFormKey(formKey + 1);

        if (AutoFillIHACConfig) {
          formInit.voucherSAC = POdetail.sac;
          formInit.voucherIHAC = POdetail.ihac;
        }

        formInit.allowSubmit = true;
        setFormInit(formInit);
        setBDFormKey(bdformKey + 1);
        getVoucherLineItem(data.id);
      })
      .catch(() => { });
  };

  const handleResetLineItemData = () => {
    let newData = LineItemGriddata.map((item) =>
      item.inEdit
        ? {
          Discontinued: false,
          invoiceDate: null,
          amount: 0,
          iHPONo: null,
          id: 0,
          ihpo: null,
          ihpoNumber: null,
          invoiceNumber: null,
          inEdit: true,
        }
        : item
    );
    setLineItemGriddata(newData);
    setGridKey(gridKey + 1);
  };

  const ChooseDiffCust = () => {
    SearchVendor("");
    setShowVendorDetail(false);
    setShowVendorform(true);
  };
  const itemRender = (li, itemProps) => {
    const index = itemProps.index;
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
  const cancel = (dataItem) => {
    getVoucherLineItem(VoucherId);
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
            amount: 0,
          }
          : item
    );
    setLineItemGriddata(newData);
  };

  const editField = "inEdit";
  const getProjectName = (projectid) => {
    const id = projectid?.id ? projectid.id : projectid;

    let project = projectOptions.find((project) => project.id == id);
    return project?.name || "";
  };

  const BDGridCommandCell = (props) => {
    const { dataItem } = props;

    const handleRemove = React.useCallback(() => {
      deletebd(dataItem);
    }, [dataItem]);

    const handleEdit = React.useCallback(() => {
      if (!isNaN(dataItem.engProjectID)) {
        let project = projectOptions.find(
          (project) => project.id == dataItem.engProjectID
        );
        dataItem.engProjectID = project;
      }

      setFormInit(dataItem);
      setBDFormKey(bdformKey + 1);
      handleShowBDDialog();
    }, [dataItem]);

    return (
      <td className="k-command-cell">
        <Button
          themeColor="primary"
          onClick={handleEdit}
          svgIcon={eyedropperIcon}
        ></Button>
        <Button
          themeColor="primary"
          onClick={handleRemove}
          svgIcon={trashIcon}
        ></Button>
      </td>
    );
  };

  const LineItemGridCommandCell = (props) => (
    <>
      <MyCommandCell
        {...props}
        edit={enterEdit}
        remove={remove}
        discard={discard}
        add={add}
        update={update}
        cancel={cancel}
        editField={editField}
      />
    </>
  );
  const remove = (dataItem) => {
    deleteLineItem(dataItem);
  };
  const discard = (dataItem) => { };

  const add = (dataItem) => {
    if (!dataItem.invoiceNumber || !dataItem.amount || !dataItem.invoiceDate) {
      showErrorNotification("Required field is empty");
      return;
    }
    if (dataItem.amount > VoucherForm.balance && !VoucherAmountConfig) {
      showErrorNotification("Line item amount can't be greater than PO balance");
      return;
    }
    let LineItemAmount = 0;
    LineItemGriddata.map((item) => {
      LineItemAmount = LineItemAmount + item.amount;
    });
    if (voucherRef.current?.countyPO?.poAmount) {
      LineItemAmount =
        (voucherRef.current?.countyPO?.poAmount || 0) - LineItemAmount;
    }

    if (LineItemAmount >= 0 || VoucherAmountConfig) {
      dataItem.inEdit = false;
      AddLineItem(dataItem);
    } else {
      showErrorNotification(
        "LineItem total amount should be lower than PO amount"
      );
    }
  };
  const update = (dataItem) => {
    if (!dataItem.invoiceNumber || !dataItem.amount || !dataItem.invoiceDate) {
      showErrorNotification("Required field is empty");
      return;
    }
    let LineItemAmount = 0;
    LineItemGriddata.map((item) => {
      LineItemAmount = LineItemAmount + item.amount;
    });

    let bdAmount = 0;

    BDGriddata.map((bd) => {
      bdAmount = bdAmount + Number(bd.voucherAmount);
    });
    if (bdAmount > 0 && LineItemAmount > 0) {
      if (bdAmount > LineItemAmount) {
        showErrorNotification(
          "Lineitem amount should be greater than voucher breakDown"
        );
        return;
      }
    }
    if (voucherRef.current?.countyPO?.poAmount) {
      LineItemAmount =
        (voucherRef.current?.countyPO?.poAmount || 0) - LineItemAmount;
    }
    if (LineItemAmount >= 0 || VoucherAmountConfig) {
      dataItem.inEdit = false;
      EditLineItem(dataItem, LineItemAmount);
    } else {
      showErrorNotification(
        "LineItem total amount should be lower than PO amount"
      );
    }
  };

  const GetBD = async () => {
    axiosInstance({
      method: "GET",
      url: VoucherBD.GetBD + `/${state?.voucherId ?state?.voucherId :voucherRef.current?.id}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.voucherBreakDowns;
        if (data.length) {
          // let voucherbd = data.filter((bd) => {
          //   return bd.voucherID == voucherRef.current?.id;
          // });
        }
        setBDGriddata(data);
      })
      .catch(() => { });
  };

  const handleBDRequest = async (dataItem, e) => {
    let bdAmount = 0;
    BDGriddata.map((bd) => {
      bdAmount = bdAmount + (Math.round(bd.voucherAmount * 100)/100);
    });
    if (dataItem.id) {
      let currentBd = BDGriddata.find((bd) => {
        return bd.id == dataItem.id;
      });
      bdAmount = bdAmount - (Math.round(currentBd.voucherAmount *100)/100);
    }
    if (dataItem.voucherAmount) {
      bdAmount = bdAmount + (Math.round(dataItem.voucherAmount * 100)/100);
    }

    // if ((Math.round(bdAmount *100)/100) > (Math.round(voucherRef.current.voucherAmount * 100)/100)) {
    //   console.log("bdAmount :",bdAmount);
    //   console.log("voucherAmount :",voucherRef.current.voucherAmount);
    //   showErrorNotification(
    //     "Total BD amount cant be greater than voucher amount"
    //   );
    // } else {
      if (dataItem?.id) {
        handleEditBD(dataItem, e);
      } else {
        let LineItemAmount = 0;
        LineItemGriddata.map((item) => {
          LineItemAmount = LineItemAmount + item.amount;
        });

        let remainingAmount = voucherRef.current.voucherAmount - bdAmount;
        let voucherIHAC = "";
        let voucherSAC = "";
        let allowToCreateBreakDown = null;

        let selectedIHPO =
          ihpoList &&
          ihpoList.length &&
          ihpoList.find((c) => c.reqNumber == dataItem?.ihpoNumber);
        if (
          selectedIHPO &&
          selectedIHPO.countyPO &&
          (selectedIHPO.countyPO.ihac || selectedIHPO.countyPO.sac)
        ) {
          voucherIHAC = selectedIHPO.countyPO.ihac || "";
          voucherSAC = selectedIHPO.countyPO.sac || "";
          allowToCreateBreakDown = true;
        } else if (VoucherForm.ihac || VoucherForm.sac) {
          voucherIHAC = VoucherForm.ihac || "";
          voucherSAC = VoucherForm.sac || "";
          allowToCreateBreakDown = true;
        }
        await handleBD(dataItem);
        if (allowToCreateBreakDown > 0 && allowToCreateBreakDown)
          await handleBD({
            id: 0,
            orgId: 7,
            voucherAmount: remainingAmount,
            voucherIHAC: voucherIHAC,
            voucherSAC: voucherSAC,
            voucherID: voucherRef.current.id,
            voucherPercent: "",
            voucherBreakDown: null,
            voucherDate: voucherRef.current.voucherDate || new Date(),
            reqNumber: voucherRef.current.reqNumber || "",
            poNumber: voucherRef.current.poNumber,
            pRno: 0,
            pos: true,
            voucherNotes: "",
            famResFamily: 0,
            famResCategory: 0,
            famResOther: 0,
            icfmr: 0,
            yearClose: false,
            engProjectID: {},
            engFundingSourceID: 0,
            engWorkOrderID: 0,
            poReqID: 0,
            fundID: 0,
            individualName: "",
            previousYearExpense: false,
            frDate: new Date(),
            transCACID: 0,
            frDate2: new Date(),
            invoiceID: 0,
            deletedBy: "",
            deletedDate: null,
          });
      }
    //}
  };

  const handleBD = async (dataItem) => {
    let apirequest = {
      id: 0,
      orgId: 7,
      voucherAmount: Math.round(dataItem.voucherAmount * 100)/100,
      voucherIHAC: dataItem.voucherIHAC,
      voucherSAC: dataItem.voucherSAC || "",
      voucherID: voucherRef.current.id,
      voucherPercent: dataItem.voucherPercent,
      voucherBreakDown: null,
      voucherDate: voucherRef.current.voucherDate || new Date(),
      reqNumber: voucherRef.current.reqNumber || "",
      poNumber: voucherRef.current.poNumber,
      pRno: 0,
      pos: true,
      voucherNotes: "",
      famResFamily: 0,
      famResCategory: 0,
      famResOther: 0,
      icfmr: 0,
      yearClose: false,
      engProjectID: dataItem.engProjectID?.id,
      engFundingSourceID: 0,
      engWorkOrderID: 0,
      poReqID: 0,
      fundID: 0,
      individualName: dataItem.individualName || "",
      previousYearExpense: false,
      frDate: new Date(),
      transCACID: 0,
      frDate2: new Date(),
      invoiceID: 0,
      deletedBy: "",
      deletedDate: null,
    };
    return axiosInstance({
      method: "POST",
      url: VoucherEndPoints.VoucherBreakdown,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        handleShowBDDialogClose();
        GetBD();
        setFormInit({});
        setBDFormKey(bdformKey + 1);
        showSuccessNotification("VoucherBreakdown added successfully");
      })
      .catch(() => { });
  };
  const handleEditBD = async (dataItem, e) => {
    const submitButton = e?.target?.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let bdAmount = 0;

    BDGriddata.map((bd) => {
      bdAmount = bdAmount + (Math.round(bd.voucherAmount *100)/100);
    });
    if (dataItem.id) {
      let currentBd = BDGriddata.find((bd) => {
        return bd.id == dataItem.id;
      });
      bdAmount = bdAmount - currentBd.voucherAmount;
    }
    if (dataItem.voucherAmount) {
      bdAmount = bdAmount + (Math.round(dataItem.voucherAmount *100)/100);
    }
    // if ((Math.round(bdAmount *100)/100) > (Math.round(voucherRef.current.voucherAmount *100)/100)) {
    //   showErrorNotification("Total BD amount should be same as voucher amount");
    // } else {
      let apirequest = {
        id: dataItem.id,
        orgId: dataItem.orgId,
        voucherAmount: (Math.round(dataItem.voucherAmount*100)/100),
        voucherIHAC: dataItem.voucherIHAC,
        voucherSAC: dataItem.voucherSAC || "",
        voucherID: dataItem.voucherID,
        voucherPercent: dataItem.voucherPercent,
        voucherDate: dataItem.voucherDate,
        reqNumber: dataItem.reqNumber,
        poNumber: dataItem.poNumber,
        pRno: 0,
        pos: true,
        voucherNotes: "",
        famResFamily: 0,
        famResCategory: 0,
        famResOther: 0,
        icfmr: 0,
        yearClose: false,
        engProjectID: dataItem.engProjectID?.id,
        engFundingSourceID: 0,
        engWorkOrderID: 0,
        poReqID: 0,
        fundID: 0,
        individualName: dataItem.individualName || "",
        previousYearExpense: false,
        frDate: dataItem.frDate,
        transCACID: 0,
        frDate2: dataItem.frDate2,
        invoiceID: 0,
        deletedBy: "",
        deletedDate: null,
      };

      await handleUpdateBD(apirequest);

      let remainingAmount = voucherRef.current.voucherAmount - bdAmount;

      // if (remainingAmount > 0) {
        apirequest.id = 0;
        apirequest.voucherAmount = remainingAmount;
        await handleBD(apirequest);
      // }
    // }
  };

  const handleUpdateBD = async (dataItem) => {

    axiosInstance({
      method: "PUT",
      url: VoucherEndPoints.VoucherBreakdown + "/" + dataItem.id,
      data: dataItem,
      withCredentials: false,
    })
      .then((response) => {


        let data = response.data;
        handleShowBDDialogClose();
        GetBD();
        setFormInit({});
        setBDFormKey(bdformKey + 1);
        showSuccessNotification("Voucher breakdown saved successfully");

      })
      .catch(() => { })
      .finally(() => {


      });
  };

  const deletebd = (dataItem) => {
    axiosInstance({
      method: "delete",
      url: VoucherEndPoints.VoucherBreakdown + "/" + dataItem.id,
      withCredentials: false,
    })
      .then((response) => {
        GetBD();
      })
      .catch(() => { });
  };

  const AddLineItem = (dataItem) => {
    let selectedIHPO =
      ihpoList &&
      ihpoList.length &&
      ihpoList.find((c) => c.reqNumber == dataItem?.ihpoNumber);

    let apirequest = {
      id: (dataItem.id < 0 ? 0 : dataItem.id),
      voucherID: dataItem.voucherID ? dataItem.voucherID : VoucherId,
      invoiceDate: dataItem.invoiceDate,
      invoiceNumber: dataItem.invoiceNumber,
      amount: dataItem.amount,
      ihpoId: selectedIHPO ? selectedIHPO.id : 0,
      ihpoNumber: dataItem?.ihpoNumber || "",
      ihpoLineItemID: dataItem?.ihpoLineItemID,
      description: "",
      serviceStartDate: "",
      serviceEndDate: "",
      createdDate: new Date(),
      modifiedDate: new Date(),
      deletedDate: "",
      createdUser: "string",
      modifiedUser: "string",
      deletedUser: "string",
    };
    axiosInstance({
      method: "POST",
      url: VoucherEndPoints.VoucherLineItemForm,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        var isLineItemSavePending = false;
        var lineItemSAC = "";
        var lineItemIHAC = "";

        if (dataItem.id <= 0) {
          var currentItem = LineItemGriddata.find((c) => c.id == dataItem.id);
          if (dataItem.id <= 0) {
            lineItemIHAC = currentItem.lineitemReqIHAC;
            lineItemSAC = currentItem.lineitemSAC;
          }
          currentItem.id = response.data.id;
          isLineItemSavePending = LineItemGriddata.find((c) => c.id <= 0);
        }

        let data = response.data;
        let LineItemAmount = 0;
        LineItemGriddata.map((item) => {
          LineItemAmount = LineItemAmount + item.amount;
        });
        voucherRef.current.voucherAmount = LineItemAmount;
        voucherRef.current.ihpoId = data.ihpoId;
        voucherRef.current.ihpoNumber = data.ihpoNumber;
        editVoucherForm(voucherRef.current);

        if (!isLineItemSavePending) {
          getVoucherLineItem(
            dataItem.voucherID ? dataItem.voucherID : VoucherId,
            [],
            true
          );
        }
        showSuccessNotification("Voucher lineItem saved successfully");
        let allowToCreateBreakDown = null;
        let voucherIHAC = [];
        let voucherSAC = [];
        if (
          (dataItem.reqIHAC && dataItem.reqIHAC.length) ||
          (dataItem.sAC && dataItem.reqIHAC.length)
        ) {
          voucherIHAC = dataItem.reqIHAC || [];
          voucherSAC = dataItem.sAC || [];
          allowToCreateBreakDown = true;
        } else if (
          selectedIHPO &&
          selectedIHPO.countyPO &&
          (selectedIHPO.countyPO.ihac || selectedIHPO.countyPO.sac)
        ) {
          allowToCreateBreakDown = true;
          voucherIHAC = [selectedIHPO.countyPO.ihac] || [];
          voucherSAC = [selectedIHPO.countyPO.sac] || [];
        } else if (VoucherForm.ihac || VoucherForm.sac) {
          allowToCreateBreakDown = true;
          voucherIHAC = [VoucherForm.ihac] || [];
          voucherSAC = [VoucherForm.sac] || [];
        } else {
          allowToCreateBreakDown = false;
        }
        if (allowToCreateBreakDown) {
          const length =
            voucherIHAC.length >= voucherSAC.length
              ? voucherIHAC.length
              : voucherSAC.length;

          for (let i = 0; i < length; i++) {
            let apirequest = {
              id: 0,
              orgId: 7,
              voucherAmount: dataItem.amount,
              voucherIHAC: lineItemIHAC != "" && lineItemIHAC != undefined ? lineItemIHAC : voucherIHAC[i],
              voucherSAC: lineItemSAC != "" && lineItemSAC != undefined ? lineItemSAC : voucherSAC[i],
              voucherID: voucherRef.current.id,
              voucherPercent: "",
              voucherBreakDown: null,
              voucherDate: voucherRef.current.voucherDate || new Date(),
              reqNumber: voucherRef.current.reqNumber || "",
              poNumber: voucherRef.current.poNumber,
              ihpoLineItemID: dataItem.ihpoLineItemID,
              pRno: 0,
              pos: true,
              voucherNotes: "",
              famResFamily: 0,
              famResCategory: 0,
              famResOther: 0,
              icfmr: 0,
              yearClose: false,
              engProjectID: 0,
              engFundingSourceID: 0,
              engWorkOrderID: 0,
              poReqID: 0,
              fundID: 0,
              individualName: "",
              previousYearExpense: false,
              frDate: new Date(),
              transCACID: 0,
              frDate2: new Date(),
              invoiceID: 0,
              deletedBy: "",
              deletedDate: null,
            };
            axiosInstance({
              method: "POST",
              url: VoucherEndPoints.VoucherBreakdown,
              data: apirequest,
              withCredentials: false,
            })
              .then((response) => {
                let data = response.data;
                GetBD();
                showSuccessNotification("VoucherBreakdown added successfully");
              })
              .catch((error) => {
                console.log("error", error);
              });

            if (lineItemIHAC != "")
              return;
          }
        }
      })
      .catch((err) => {
        if (err?.response?.data) {
          enterEdit(dataItem);
        }
      });
  };

  const getLineITem = async (ihpoNo) => {
    if (ihpoNo) {
      return await axiosInstance({
        method: "GET",
        url: IHPOEndPoints.IHPOLineItem + "/" + ihpoNo,
        withCredentials: false,
      })
        .then((response) => {
          if (response.data?.record?.length > 0) {
            let poIdRecord = response.data?.record?.find((x) => x.poid != null);
            IHPOLineItemPoId = poIdRecord?.poid;
            return poIdRecord?.poid;
          }
        })
        .catch(() => { });
    }
  };

  const EditLineItem = (dataItem, LineItemAmount) => {
    let ihpoId =
      ihpoList && ihpoList.length
        ? ihpoList.find((c) => c.reqNumber == dataItem?.ihpoNumber)
          ? ihpoList.find((c) => c.reqNumber == dataItem?.ihpoNumber).id
          : ihpoList[0].id
        : 0;

    let apirequest = {
      id: dataItem.id,
      voucherID: VoucherId,
      invoiceDate: dataItem.invoiceDate,
      invoiceNumber: dataItem.invoiceNumber,
      amount: dataItem.amount,
      ihpoId,
      ihpoNumber: dataItem?.ihpoNumber || "",
      description: "",
      serviceStartDate: "",
      serviceEndDate: "",
      createdDate: new Date(),
      modifiedDate: new Date(),
      deletedDate: "",
      createdUser: "string",
      modifiedUser: "string",
      deletedUser: "string",
    };

    axiosInstance({
      method: "PUT",
      url: VoucherEndPoints.VoucherLineItemForm + "/" + dataItem.id,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        let LineItemAmount = 0;
        LineItemGriddata.map((item) => {
          LineItemAmount = LineItemAmount + +item.amount;
        });
        voucherRef.current.voucherAmount = LineItemAmount;
        editVoucherForm(voucherRef.current);

        let bdAmount = 0;

        BDGriddata.map((bd) => {
          bdAmount = bdAmount + Number(bd.voucherAmount);
        });
        let voucherIHAC = "";
        let voucherSAC = "";
        let allowToCreateBreakDown = null;

        let selectedIHPO =
          ihpoList &&
          ihpoList.length &&
          ihpoList.find((c) => c.reqNumber == dataItem?.ihpoNumber);
        if (
          selectedIHPO &&
          selectedIHPO.countyPO &&
          (selectedIHPO.countyPO.ihac || selectedIHPO.countyPO.sac)
        ) {
          voucherIHAC = selectedIHPO.countyPO.ihac || "";
          voucherSAC = selectedIHPO.countyPO.sac || "";
          allowToCreateBreakDown = true;
        } else if (VoucherForm.ihac || VoucherForm.sac) {
          voucherIHAC = VoucherForm.ihac || "";
          voucherSAC = VoucherForm.sac || "";
          allowToCreateBreakDown = true;
        }
        if (LineItemAmount - bdAmount > 0 && allowToCreateBreakDown) {
          let apirequest = {
            id: 0,
            orgId: 7,
            voucherAmount: LineItemAmount - bdAmount,
            voucherIHAC,
            voucherSAC,
            voucherID: voucherRef.current.id,
            voucherPercent: "",
            voucherBreakDown: null,
            voucherDate: voucherRef.current.voucherDate || new Date(),
            reqNumber: voucherRef.current.reqNumber || "",
            poNumber: voucherRef.current.poNumber,
            pRno: 0,
            pos: true,
            voucherNotes: "",
            famResFamily: 0,
            famResCategory: 0,
            famResOther: 0,
            icfmr: 0,
            yearClose: false,
            engProjectID: 0,
            engFundingSourceID: 0,
            engWorkOrderID: 0,
            poReqID: 0,
            fundID: 0,
            individualName: "",
            previousYearExpense: false,
            frDate: new Date(),
            transCACID: 0,
            frDate2: new Date(),
            invoiceID: 0,
            deletedBy: "",
            deletedDate: null,
          };
          axiosInstance({
            method: "POST",
            url: VoucherEndPoints.VoucherBreakdown,
            data: apirequest,
            withCredentials: false,
          })
            .then((response) => {
              GetBD();
              showSuccessNotification("VoucherBreakdown added successfully");
            })
            .catch(() => { });
        }
        getVoucherLineItem(VoucherId);
        showSuccessNotification("Voucher lineItem saved successfully");
      })
      .catch((err) => { });
  };

  const deleteLineItem = (dataItem) => {
    axiosInstance({
      method: "delete",
      url: VoucherEndPoints.VoucherLineItemForm + "/" + dataItem.id,
      withCredentials: false,
    })
      .then((response) => {
        getVoucherLineItem(VoucherId);
        let LineItemAmount = 0;
        let currentArr = LineItemGriddata.filter(
          (item) => item.id !== dataItem.id
        );
        currentArr.map((item) => {
          LineItemAmount = LineItemAmount + +item.amount;
          return item;
        });
        voucherRef.current.voucherAmount = LineItemAmount;
        editVoucherForm(voucherRef.current);
        showSuccessNotification("Voucher lineItem deleted successfully");
      })
      .catch(() => { });
  };

  const [visible, setVisible] = React.useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };
  const [visibleIHPO, setVisibleIHPO] = React.useState(false);
  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };
  const [DocumentPopupVisible, setDocumentPopupVisible] = React.useState(false);
  const openDocumentPopup = (dataItem) => {
    setSelectedLineItemId("V-" + state?.voucherId + "-" + dataItem?.id);
    setDocumentPopupVisible(!DocumentPopupVisible);
  };
  const closeDocumentPopup = (flag) => {
    setDocumentPopupVisible(flag);
  };
  function getFileNameFromPath(path) {
    const parts = path.split(/[\\/]/);
    const filename = parts[parts.length - 1];
    return filename;
  }
  function download(base64String, filename) {
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
  }
  function DownloadDoc(dataItem) {
    let fileDocName = "V-" + state?.voucherId + "-" + dataItem?.id;
    axiosInstance({
      method: "Get",
      url:
        UploadDocumentEndPoints.GetUploadDocumentList +
        "fileType=" +
        "" +
        "&&docName=" +
        fileDocName +
        "&&search=" +
        "" +
        "&&skip=" +
        0 +
        "&&take=" +
        15,
      withCredentials: false,
    })
      .then((response) => {
        var base64String = response?.data?.data[0]?.fileData;
        var filename = response?.data?.data[0]?.fileName;
        if (base64String && filename) {
          download(base64String, filename);
        } else {
          showErrorNotification("No document found");
        }
      })
      .catch(() => { });
  }
  const [, setSacCode] = React.useState("");
  const getSacCode = (sac) => {
    if (forVoucher) {
      VoucherForm.sac = sac;
      setVoucherForm(VoucherForm);
      setForVoucher(false);
      setFormKey(formKey + 1);
      return;
    }
    setSacCode(sac);
    formInit.voucherSAC = sac;

    formInit.allowSubmit = true;
    setFormInit(formInit);
    setBDFormKey(bdformKey + 1);
  };
  const [, setIHPOCode] = React.useState("");
  const getIHACCode = (ihac) => {
    if (forVoucher) {
      VoucherForm.ihac = ihac;
      setVoucherForm(VoucherForm);
      setForVoucher(false);
      setFormKey(formKey + 1);
      return;
    }
    setIHPOCode(ihac);
    formInit.voucherIHAC = ihac;

    formInit.allowSubmit = true;
    setFormInit(formInit);
    setBDFormKey(bdformKey + 1);
  };

  const [formInit, setFormInit] = useState({});

  const [PODDList, setPODDList] = React.useState([]);
  const poSearchColumn = [
    {
      field: "poNumber",
      header: "PO Number",
      width: "200px",
    },
    {
      field: "countyPOPricing.poAmount",
      header: "Amount",
      width: "200px",
    }, {
      field: "countyPOPricing.poBalance",
      header: "Balance",
      width: "200px",
    },
  ]

  const [ihpoList, setIHPOList] = React.useState([]);
  const [POVal, setPOVal] = React.useState({});
  const [POSearch, setPOSearch] = useState("");
  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (POSearch || POSearch === '') {
        SearchPO(POSearch);
      }
    }, 1000);
    return () => clearTimeout(getData);
  }, [POSearch]);

  const onPOFilterChange = (event) => {
    let searchText = event.filter.value;
    setPOSearch(searchText);
  };
  const POddlOnChange = async (event) => {
    if (event.syntheticEvent.type == "change") {
      SearchPO(event.target.value);
    } else {
      let poIndex = PODDList.findIndex(
        (x) => x.poNumber == event.target.value.poNumber
      );
      if (poIndex >= 0) {
        const selectedPO = PODDList[poIndex];
        setPOVal(PODDList[poIndex]);
        let poDetail = await getPurchaseOrder(PODDList[poIndex].id);
        setCACVal(poDetail?.cacDetail);

        let ihpoDetail = await getIHPOBasedPO(PODDList[poIndex].id);
        VoucherForm.cac = cacDetailRef.current;
        VoucherForm.poNumber = PODDList[poIndex];
        VoucherForm.totalamnt = PODDList[poIndex]?.countyPOPricing?.poAmount || 0;
        VoucherForm.balance = PODDList[poIndex]?.countyPOPricing?.poBalance || 0;
        VoucherForm.ihpoNo = ihpoDetail?.reqNumber || "";
        VoucherForm.sac = PODDList[poIndex].sac;
        VoucherForm.ihac = PODDList[poIndex].ihac;

        let poTypes = await getCountyPOTypes();
        
        let selectedPOType = poTypes.find(poType => poType.poType == selectedPO.poType)
        
        if (selectedPOType && selectedPOType.autoSelectVendor == "Y" ) {
          const vendorData = selectedPO?.countyPODetails?.vendor;
          if (vendorData) {
            setVendorVal(vendorData);
            setShowVendorDetail(true);
            setShowVendorOption(true);
            setShowVendorform(true);
          }
        } else {
          if (ihpoDetail?.ihpoDetails?.vendor?.id) {
            setVendorVal(ihpoDetail?.ihpoDetails?.vendor?.id);
            setShowVendorDetail(true);
            setShowVendorOption(true);
            setShowVendorform(true);
          }
        }

        setFormKey(formKey + 1);
        formInit.voucherSAC = PODDList[poIndex].sac;
        formInit.voucherIHAC = PODDList[poIndex].ihac;

        formInit.allowSubmit = true;
        setFormInit(formInit);
        setBDFormKey(bdformKey + 1);
      }
    }
  };

  const SearchPO = async (searchText) => {
    return axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrder + "?poNumber=" + searchText,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setPODDList(data);
        poRef.current = data;
        return response.data;
      })
      .catch(() => { });
  };

  const PoitemRender = (li, itemProps) => {
    const itemChildren = (
      <div className="d-flex flex-row justify-content-center align-items-center">
        <span
          style={{
            fontWeight: "bold",
            marginRight: "10px",
          }}
        >
          {li.props.children}
        </span>
        <span
          style={{
            fontWeight: "bold",
            marginRight: "10px",
          }}
        >
          ${itemProps.dataItem.countyPOPricing?.poAmount || 0}
        </span>
        <span
          style={{
            fontWeight: "bold",
            marginRight: "10px",
          }}
        >
          ${itemProps.dataItem.countyPOPricing?.poBalance || 0}
        </span>
      </div>
    );
    return React.cloneElement(li, li.props, itemChildren);
  };

  const [VendorSearch, setVendorSearch] = useState("");
  React.useEffect(() => {
    const getData = setTimeout(() => {
      if(VendorSearch || state.type == 'screen'){
        SearchVendor(VendorSearch);
      }
    }, 1000);
    return () => clearTimeout(getData);
  }, [VendorSearch]);

  const onFilterChange = (event) => {
    let searchText = event.filter.value;
    setVendorSearch(searchText);
  };

  const DropDownCommandCell = (props) => {
    const localizedData = ihpoList;

    useEffect(() => {
      if (localizedData.length == 1) {
        props.dataItem.ihpo = {
          ihpoNumber: localizedData[0].reqNumber,
          ihpoId: localizedData[0].id,
        };
      }
    }, [localizedData]);

    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value.reqNumber,
        });
      }
    };
    const { dataItem } = props;
    const dataValue = dataItem?.ihpoNumber == null ? "" : dataItem?.ihpoNumber;
    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            onChange={handleChange}
            id={"ihpoNumber"}
            name={"ihpoNumber"}
            textField="reqNumber"
            dataItemKey="id"
            data={localizedData}
            popupSettings={{ width: "auto" }}
            defaultValue={localizedData[0]}
            value={localizedData.find((c) => c.reqNumber == dataValue)}
          />
        ) : (
          localizedData.find((c) => c.reqNumber == dataValue)?.reqNumber
        )}
      </td>
    );
  };

  const [columnShow, setColumnShow] = useState(false);
  const PDFViewer = (base64String, type) => {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: type });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");

    URL.revokeObjectURL(url);
  };
  const downloadPOPDF = () => {
    let data = {
      ReportName: "Voucher",
      DictionaryParameters: { ID: VoucherId },
    };
    Axios({
      method: "POST",
      maxBodyLength: Infinity,
      url: ReportsEndPoints.GenerateReportVoucher,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    })
      .then((response) => {
        PDFViewer(response.data, "application/pdf");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getSACConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/19",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setShowSAC(value);
      })
      .catch(() => { });
  };

  const getConfigForForm = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/19",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setIhacSacDisplay(value);
      })
      .catch(() => { });
  };

  const getConfigForDateWritten = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/95",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? false : true;
        setIsDateWrittenEnable(value);
      })
      .catch(() => { });
  };

  const { checkPrivialgeGroup, loading, error } = usePrivilege('Accounts Payable')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div className="row">
      {VoucherId && (
        <div className="d-flex justify-content-end">
          <Checkbox
            type="checkbox"
            className="me-2"
            disabled="true"
            id="printQueue"
            name="printQueue"
            defaultChecked={columnShow}
            label={"Voucher in Print Queue"}
          />
          <Checkbox
            type="checkbox"
            id="fiscalApprove"
            disabled="true"
            name="fiscalApprove"
            defaultChecked={columnShow}
            label={"Fiscal Approved"}
          />
        </div>
      )}
      <div className="col-sm-12">
        <div className={!isView ? "form-container" : ""}>
          <Form
            onSubmit={handleFormSubmit}
            initialValues={VoucherForm}
            key={formKey}
            ignoreModified={true}
            render={(VendorformRender) => (
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
                    {!ShowVendorDetail ? (
                      ShowVendorOption && (
                        <div className="d-flex justify-content-between align-items-end">
                          <div className="w-100">
                            <Field
                              id={"Vendor"}
                              name={"Vendor"}
                              label={
                                <>
                                  Vendor*
                                  {!(
                                    state?.ihpo?.id ||
                                    isView ||
                                    state?.poNumber
                                  ) ? (
                                    <span className="ms-3">
                                      <i className="fa-solid fa-circle-info"></i>
                                      Please select PO number first
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </>
                              }
                              textField="name"
                              dataItemKey="id"
                              component={FormCustomerWithVendorNoMultiColumnComboBox}
                              data={VendorDDList}
                              value={VendorVal}
                              onChange={VendorddlOnChange}
                              placeholder="Search Vendor..."
                              wrapperstyle={{
                                width: "100%",
                                marginRight: "10px",
                              }}
                              validator={supplierValidator}
                              filterable={true}
                              onFilterChange={onFilterChange}
                              // itemRender={itemRender}
                              disabled={VoucherForm.poNumber ? false : true}
                            />
                          </div>

                          {!isView && (
                            <div style={{ textAlign: "center" }}>
                              <Button
                                onClick={() => setShowVendopDetail(true)}
                                themeColor={"primary"}
                              >
                                Create New Vendor
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="d-flex justify-content-between align-items-end mt-2">
                        <div>
                          <span>Bill to</span>
                          <br></br>
                          <span>
                            {" "}
                            <b>{VendorVal?.name}</b>
                          </span>
                          <br></br>
                          <span> {VendorVal?.address1}</span>
                          <br></br>
                          <br></br>
                          <span>
                            {" "}
                            {VendorVal?.city && <>{VendorVal?.city} ,</>}{" "}
                            {VendorVal?.state && <>{VendorVal?.state},</>}{" "}
                            {VendorVal?.zip && <>{VendorVal?.zip} </>}
                          </span>
                          <br></br>
                          {!isView && POVal && POVal.poType !== "R" && (
                            <a
                              type="button"
                              style={{ color: "blue" }}
                              onClick={ChooseDiffCust}
                            >
                              Choose a different vendor
                            </a>
                          )}
                        </div>
                        {!isView && POVal && POVal.poType !== "R" && (
                          <div style={{ textAlign: "center" }}>
                            <Button
                              type="button"
                              onClick={() => setShowVendopDetail(true)}
                              themeColor={"primary"}
                            >
                              Create New Vendor
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {ShowVendorform ? (
                      <div>
                        <Field
                          id={"voucherVouchNo"}
                          name={"voucherVouchNo"}
                          label={"Voucher Number"}
                          component={FormInput}
                          disabled={true}
                        />
                        {VendorformRender.valueGetter("voucherAmount") > 0 && (
                          <Field
                            id={"voucherAmount"}
                            name={"voucherAmount"}
                            label={"Voucher Amount"}
                            format={"c"}
                            placeholder={"$ Enter Amount"}
                            component={FormNumericTextBox}
                            step={0}
                            min={0}
                            spinners={false}
                            disabled={true}
                          />
                        )}
                        <Field
                          id={"voucherWrittenDate"}
                          name={"voucherWrittenDate"}
                          label={"Date Written"}
                          defaultValue={new Date()}
                          component={FormDatePicker}
                          disabled={isDateWrittenEnable}
                        />
                        <Field
                          id={"datePosted"}
                          name={"datePosted"}
                          label={"Date Posted"}
                          component={FormDatePicker}
                          disabled={isView}
                        />
                        <Field
                          id={"voucherDescription"}
                          name={"voucherDescription"}
                          label={"Description"}
                          component={FormTextArea}
                          disabled={isView}
                        />
                        {!WarrantDisplay && (
                          <>
                            <Field
                              id={"warrantDate"}
                              name={"warrantDate"}
                              label={"Warrant Date"}
                              component={FormDatePicker}
                              disabled={isView}
                            />
                            <Field
                              id={"mailedDate"}
                              name={"mailedDate"}
                              label={"Mailed Date"}
                              component={FormDatePicker}
                              disabled={isView}
                            />
                            <Field
                              id={"apDate"}
                              name={"apDate"}
                              label={"Ap Date"}
                              component={FormDatePicker}
                              disabled={isView}
                            />
                            <Field
                              id={"dateCleared"}
                              name={"dateCleared"}
                              label={"Date Cleared"}
                              component={FormDatePicker}
                              disabled={isView}
                            />
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {ShowVendorform ? (
                    <div style={{ width: "50%", padding: "20px" }}>
                      <Field
                        id={"poNumber"}
                        name={"poNumber"}
                        label={"PO Number"}
                        textField="poNumber"
                        dataItemKey="id"
                        component={FormMultiColumnComboBox}
                        data={PODDList.map((item) => {
                          if (item.countyPOPricing) {
                            return {
                              ...item,
                              countyPOPricing: {
                                ...item.countyPOPricing,
                                poBalance: "$" + item.countyPOPricing.poBalance,
                                poAmount: "$" + item.countyPOPricing.poAmount
                              }
                            }
                          }
                          else {
                            return {
                              ...item,
                              countyPOPricing: {
                                poBalance: "$" + 0,
                                poAmount: "$" + 0
                              }
                            }
                          }
                        })}
                        value={POVal}
                        onChange={POddlOnChange}
                        placeholder="Search PO Number..."
                        // itemRender={PoitemRender}
                        filterable={true}
                        onFilterChange={onPOFilterChange}
                        disabled={state?.ihpo?.id || isView || state?.poNumber}
                        validator={poValidator}
                        columns={poSearchColumn}
                      />

                      <Field
                        id={"cac"}
                        name={"cac"}
                        label={"County Expense Account Code"}
                        textField="countyExpenseCode"
                        dataItemKey="id"
                        component={FormMultiColumnComboBox}
                        data={CACDDList}
                        value={CACVal}
                        columns={CACColumns}
                        placeholder="Search CAC..."
                        disabled={true}
                      />

                      <Field
                        id={"totalamnt"}
                        name={"totalamnt"}
                        label={"PO Total"}
                        format={"c"}
                        placeholder={"$ Enter Amount"}
                        component={FormNumericTextBox}
                        disabled={true}
                        step={0}
                        min={0}
                        spinners={false}
                      />
                      <Field
                        id={"balance"}
                        name={"balance"}
                        label={"PO Balance"}
                        format={"c"}
                        placeholder={"$ Enter Balance"}
                        component={FormNumericTextBox}
                        disabled={true}
                        step={0}
                        min={0}
                        spinners={false}
                      />
                      {IHACDisplay && IhacSacDisplay && (
                        <div
                          style={{ width: "100%" }}
                        >
                          <Field
                            id={"ihac"}
                            name={"ihac"}
                            label={"In House Account Code"}
                            component={FormInput}
                            disabled={true}
                          />
                        </div>
                      )}

                      {IhacSacDisplay && (
                        <div
                          style={{ width: "100%" }}
                        >
                          <Field
                            id={"sac"}
                            name={"sac"}
                            label={"State Account Code"}
                            component={FormInput}
                            disabled={true}
                          />
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                {!isView && (
                  <div
                    className="mb-4"
                    style={{ textAlign: "center", margin: "3px" }}
                  >
                    {VoucherId ? (
                      <>
                        {checkPrivialgeGroup("EditVoucherCM", 3) && (
                          <Button
                            type={"submit"}
                            themeColor={"primary"}
                            className="me-2"
                          >
                            Save Voucher
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {checkPrivialgeGroup("POVoucherCM", 2) && (
                          <Button
                            type={"submit"}
                            themeColor={"primary"}
                            className="me-2"
                          >
                            Add Voucher
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </FormElement>
            )}
          />
          {showVendopDetail ? (
            <AddNewVendor
              handleVendorDialogClose={handleVendorDialogClose}
              handlevendorDetail={handlevendorDetail}
              handleType={"Vendor"}
            />
          ) : null}
          {VoucherId ? (
            <div>
              <fieldset>
                <legend>Line Item</legend>
                <Grid
                  resizable={true}
                  data={LineItemGriddata}
                  onItemChange={itemChange}
                  editField={editField}
                  dataItemKey={"id"}
                  key={gridKey}
                >
                  <GridColumn
                    field="invoiceDate"
                    title="Date*"
                    format="{0:d}"
                    cell={DatePickerCell}
                    filterable={false}
                  />
                  <GridColumn field="invoiceNumber" title="Invoice Number*" />
                  {IHPODisplay && (
                    <GridColumn
                      field="ihpoNumber"
                      title="IHPO"
                      cell={DropDownCommandCell}
                    />
                  )}
                  <GridColumn
                    field="amount"
                    title="Amount*"
                    editor="numeric"
                    format="{0:c2}"
                    cell={ColumnFormNegativeCurrencyTextBox}
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

                  {!isView && (
                    <GridColumn cell={LineItemGridCommandCell} width="140px" />
                  )}
                  {!isView && (
                    <GridColumn
                      cell={(props) => (
                        <td className="k-command-cell">
                          <Tooltip anchorElement="target" parentTitle={true}>
                            <Button
                              themeColor="primary"
                              className="me-2"
                              title="Download"
                              disabled={props.dataItem.documentRecord == ""}
                              onClick={() => DownloadDoc(props.dataItem)}
                              svgIcon={downloadIcon}
                            ></Button>
                            <Button
                              themeColor="primary"
                              title="Upload"
                              onClick={() => openDocumentPopup(props.dataItem)}
                              svgIcon={uploadIcon}
                            ></Button>
                          </Tooltip>
                        </td>
                      )}
                      width="140px"
                    />
                  )}
                </Grid>
              </fieldset>

              <div>
                <div className="mb-4 mt-4 d-flex">
                  <legend>Voucher BreakDown</legend>
                  {!isView && (
                    <Button
                      type={"submit"}
                      themeColor={"primary"}
                      disabled={!voucherRef.current?.id}
                      onClick={handleShowBDDialog}
                    >
                      Add BD
                    </Button>
                  )}
                </div>

                <Grid
                  resizable={true}
                  data={BDGriddata}
                  editField={editField}
                  dataItemKey={"id"}
                >
                  <GridColumn field="voucherIHAC" title="IHAC" />
                  <GridColumn field="voucherSAC" title="SAC" />

                  <GridColumn
                    field="voucherPercent"
                    title="Percent"
                    format="{0:p2}"
                  />
                  <GridColumn
                    field="voucherAmount"
                    format="{0:c2}"
                    title="Amount"
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
                    cell={(props) => {
                      var amount = props.dataItem.voucherAmount || 0;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                      return <td className="!k-text-right">{amount}</td>;
                    }}
                  />
                  <GridColumn
                    field="engProjectID"
                    title="Project"
                    cell={(props) => (
                      <td>{getProjectName(props.dataItem?.engProjectID)}</td>
                    )}
                  />

                  {!isView && (
                    <GridColumn cell={BDGridCommandCell} width="240px" />
                  )}
                </Grid>
              </div>
              {AmountWarningVisible && (
                <Dialog
                  title={<span>Please confirm</span>}
                  onClose={toggleAmountWarningDialog}
                >
                  <p
                    style={{
                      margin: "25px",
                      textAlign: "center",
                    }}
                  >
                    90% of the PO Amount has been utilized. Would you like to
                    close the PO?
                  </p>
                  <DialogActionsBar>
                    <Button
                      themeColor={"secondary"}
                      className={"col-12"}
                      onClick={toggleAmountWarningDialog}
                    >
                      No
                    </Button>
                    <Button
                      themeColor={"primary"}
                      className={"col-12"}
                      onClick={handlePoClose}
                    >
                      Yes
                    </Button>
                  </DialogActionsBar>
                </Dialog>
              )}
              {ShowBDDialog && (
                <Dialog
                  width={500}
                  height={600}
                  title={<span>{formInit?.id ? "Update" : "Add"} BD info</span>}
                  onClose={handleShowBDDialogClose}
                >
                  <Form
                    onSubmit={handleBDRequest}
                    initialValues={formInit}
                    key={bdformKey}
                    ignoreModified={true}
                    render={(formRenderProps) => (
                      <FormElement>
                        <fieldset className={"k-form-fieldset"}>
                          <div
                            style={{ width: "100%" }}
                            onClick={() => setVisibleIHPO(true)}
                          >
                            <Field
                              id={"voucherIHAC"}
                              name={"voucherIHAC"}
                              label={"IHAC"}
                              component={FormInput}
                            />
                          </div>
                          <div
                            style={{ width: "100%" }}
                            onClick={() => setVisible(true)}
                          >
                            <Field
                              id={"voucherSAC"}
                              name={"voucherSAC"}
                              label={"SAC"}
                              component={FormInput}
                            />
                          </div>
                          <Field
                            id={"voucherPercent"}
                            name={"voucherPercent"}
                            label={"Percent"}
                            placeholder={"% Enter Percentage"}
                            component={FormNumericTextBox}
                            format={"p2"}
                            step={0.1}
                            decimals={2}
                            min={0}
                            spinners={false}
                          />

                          <Field
                            id={"voucherAmount"}
                            name={"voucherAmount"}
                            label={"Amount"}
                            format={"c"}
                            placeholder={"$ Enter Amount"}
                            component={FormNumericTextBox}
                            step={0}
                            // min={0}
                            spinners={false}
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
              {!isView && (
                <p style={{ textAlign: "center", margin: "5px" }}>
                  {checkPrivialgeGroup("PrintVoucherCM", 2) && (
                    <Button
                      type={"submit"}
                      themeColor={"primary"}
                      disabled={false}
                      onClick={downloadPOPDF}
                    >
                      Print Preview
                    </Button>
                  )}
                </p>
              )}

              {DocumentPopupVisible && (
                <DocumentPopup
                  onclosePopup={closeDocumentPopup}
                  docTypeId={1}
                  selectedLineItemId={selectedLineItemId}
                  docNameDisabled={true}
                ></DocumentPopup>
              )}
            </div>
          ) : null}
          {visible && (
            <SacDialog
              toggleDialog={toggleDialog}
              getSacCode={getSacCode}
              type={7}
              SACValue={VoucherForm?.sac || (dataState && dataState.selectedIHPOUpload && dataState.selectedIHPOUpload[0]?.sAC) || ""}
            >
              {" "}
            </SacDialog>
          )}

          {visibleIHPO && (
            <IHACDialog
              toggleIHPODialog={toggleIHPODialog}
              getIHACCode={getIHACCode}
              forihpo={false}
              type={7}
              getSacCode={getSacCode}
              IHACValue={VoucherForm?.ihac || (dataState && dataState.selectedIHPOUpload && dataState.selectedIHPOUpload[0]?.reqIHAC) || ""}
            >
              {" "}
            </IHACDialog>
          )}
        </div>
      </div>
    </div>
  );
}
