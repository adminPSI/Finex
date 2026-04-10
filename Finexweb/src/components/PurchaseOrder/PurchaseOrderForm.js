import { toString as kendoToString } from "@progress/kendo-intl";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { eyedropperIcon, trashIcon } from "@progress/kendo-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CommonEndPoints,
  ConfigurationEndPoints,
  FundEndPoints,
  PurchaseOrderEndPOints,
  PurchaseOrderLineItemEndPoints,
  ReportsEndPoints,
  VendorEndPoints
} from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import { handleDropdownSearch } from "../common/Helper";
import {
  ColumnFormCurrencyTextBox,
  FormCheckbox,
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
  activeDateValidator,
  cacexpenseCodeValidator,
  currencyAmountValidator,
  poValidator,
  supplierValidator,
} from "../validators";

const MyCommandCell = (props) => {
  const { dataItem } = props;
  const isNewItem = dataItem.cId == 0;

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

export default function PurchaseOrderForm({ poLiquidation, ...props }) {
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

  const initialSort = [
    {
      field: "cId",
      dir: "desc",
    },
  ];
  const navigate = useNavigate();

  useEffect(() => {
    if (poLiquidation) {
      if (state?.poNumber || props?.poNumber) {
        getPO(poId);
      }
    }
  }, [poLiquidation]);

  const [sort, setSort] = React.useState(initialSort);
  const [formKey, setFormKey] = React.useState(1);
  const [purchaseOrderForm, setPurchaseOrderForm] = React.useState({
    opendate: new Date()
  });
  const [temporaryPONumber, setTemporaryPONumber] = useState("");
  const [ShowVendorOption, setShowVendorOption] = useState(true);
  const [ShowVendorDetail, setShowVendorDetail] = useState(false);
  const [ShowVendorform, setShowVendorform] = useState(true);
  const [AddSubmit, setAddSubmit] = useState(false);
  const [LineItemGriddata, setLineItemGriddata] = useState([]);
  const [showAddEquipmentSetupDialog, setShowAddEquipmentSetupDialog] =
    useState(false);
  const [addEquipmentSetupVisible, setaddEquipmentSetupVisible] =
    React.useState(false);
  const [poId, setPoId] = React.useState();
  const [poNumber, setPoNumber] = React.useState();
  const [poType, setPOType] = React.useState([]);
  const [VendorDDList, setVendorDDList] = React.useState([]);
  const [VendorVal, setVendorVal] = React.useState({});
  const [isView, setIsView] = React.useState(false);

  const [CACDDList, setCACDDList] = React.useState([]);
  const [Podetail, setPodetail] = React.useState({});
  const [poCounter, setPoCounter] = React.useState(0);
  const [CACBalance, setCACBalance] = React.useState();
  const [PoLIneitemDisplay, setPoLIneitemDisplay] = React.useState(false);
  const [IhacSacDisplay, setIhacSacDisplay] = React.useState(false);
  const [PoTypeDisplay, setPoTypeDisplay] = React.useState(null);
  const [IHACDisplay, setIHACDisplay] = useState(false);
  const [CACVal, setCACVal] = React.useState({
    value: {
      text: "Select County Expense Code",
      id: 0,
    },
  });
  const { state } = useLocation();
  const cacRef = useRef([]);
  const vendorRef = useRef([]);
  const poRef = useRef([]);
  const poTypeRef = useRef([]);
  const POBlanceRef = useRef();
  const formRef = useRef();
  const [ignoreModified, setIgnoreModified] = useState(false);

  const [visibleSAC, setVisibleSAC] = React.useState(false);
  const toggleDialog = () => {
    setVisibleSAC(!visibleSAC);
  };
  const [visibleIHPO, setVisibleIHPO] = React.useState(false);
  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };

  const [visiblePOClose, setVisiblePOClose] = React.useState(false);
  const toggleVisiblePOClose = () => {
    setVisiblePOClose(!visiblePOClose);
  };

  const [sacCode, setSacCode] = React.useState("");
  const getSacCode = (sac) => {
    setSacCode(sac);
    formRef.current.valueSetter("sac", sac);
    setIgnoreModified(true);
  };
  const [IHACCode, setIHACCode] = React.useState("");
  const getIHACCode = (ihac) => {
    setIHACCode(ihac);
    formRef.current.valueSetter("ihac", ihac);
    setIgnoreModified(true);
  };

  const [searchCAC, setSearchCAC] = useState("");
  const [searchCACData, setSearchCACData] = useState("");

  const handleFilterChange = (event) => {
    if (event) {
      setSearchCAC(event.filter.value);
    }
  };

  const searchableField = [
    "id",
    "countyExpenseCode",
    "countyExpenseDescription",
  ];
  useEffect(() => {
    const result = handleDropdownSearch(CACDDList, searchableField, searchCAC);
    setSearchCACData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCAC]);

  React.useEffect(() => {
    getConfigForLineItem();
    getConfigForForm();
    getConfigForPoType();
    setCACBalance();
    getIHACConfig();
    async function fetchData() {
      setALLDropdown();
      // await SearchVendor("");
      await getPOType();
      await getCAC();
    }
    fetchData();

    if (!state?.poNumber) {
      getConfigForAutoPo();
    }
  }, []);

  React.useEffect(() => {
    if (state?.poNumber || props?.poNumber) {
      if (
        // vendorRef.current.length > 0 &&
        cacRef.current.length > 0 &&
        poTypeRef.current.length > 0 &&
        poCounter == 0 && 
        PoTypeDisplay == false
      ) {
        let ponumber =
          state?.poNumber || props?.poNumber || poRef.current?.poNumber || "";
        let poId = state?.poId || props?.poId || poRef.current?.id || "";
        getPO(poId);
        setPoId(poId);
        setPoNumber(ponumber);
        getLineITem(poId);
        setPoCounter(poCounter + 1);
      }
    }
    if (props?.type == "model" || props?.type == "view") {
      setIsView(true);
    } else {
      setIsView(false);
    }
  }, [state, CACDDList, poType, VendorDDList,PoTypeDisplay]);

  const setALLDropdown = () => {
    let purOrderData = [
      { text: "2022-001", id: 1 },
      { text: "2022-002", id: 2 },
      { text: "2022-003", id: 3 },
    ];

    setpurOrderDDList(purOrderData);
  };

  const CACHandleChange = async (event) => {
    let cac = event.target.value;
    if (cac?.id) {
      getUnencumberedBalance(cac.id);
    }
  };

  const getExpenseCodeBalances = async (id) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: FundEndPoints.GetFundBalanceByID.replace("#ID#", id),
        withCredentials: false,
      });

      let trnasferBalance = response.data;
      return trnasferBalance;
    } catch (error) {
      console.log(error);
    }
  };

  const getTemporaryPONumber = () => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetTemporaryPONumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setTemporaryPONumber(data);
        setPurchaseOrderForm({
          opendate: new Date(),
          pono: props?.poNumber || data,
        });
        setFormKey(formKey + 1);
      })
      .catch(() => { });
  };

  const getConfigForLineItem = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/17",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setPoLIneitemDisplay(value);
      })
      .catch(() => { });
  };
  const getConfigForAutoPo = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/22",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        if (value == true) {
          getTemporaryPONumber();
        }
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
  const getConfigForPoType = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/20",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setPoTypeDisplay(value);
      })
      .catch(() => { });
  };

  const HandlePOClose = async () => { };

  const getCAC = async () => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.getCAC + "/7",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setCACDDList(data);
        cacRef.current = data;
      })
      .catch(() => { });
  };

  const getPOType = async () => {
    // axiosInstance({
    //   method: "GET",
    //   url: CommonEndPoints.Getcommon + "?id=6",
    //   withCredentials: false,
    // })
    //   .then((response) => {
    //     let data = response.data;
    //     poTypeRef.current = data;
    //     setPOType(data);
    //   })
    //   .catch(() => { });

    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrderCountyPOTypes,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        poTypeRef.current = data;
        setPOType(data);
      })
      .catch(() => { });
  };

  const getPO = async (poNumber) => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrder + "/" + poNumber,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        setPodetail(data);
        poRef.current = data;
        if (data.countyPODetails?.poVendorNo) {
          setVendorVal(data.countyPODetails.vendor);
          setShowVendorDetail(true);
          setShowVendorOption(true);
          setShowVendorform(true);
        }
        let cacIndex = cacRef.current.findIndex(
          (x) => x.id == data?.countyPODetails?.pocacid
        );

        if (cacIndex >= 0) {
          setCACVal([cacRef.current[cacIndex]]);
        }
        let formData = {
          pono: data.poNumber,
          Vendor: "",
          shipvia: data.poShipVia,
          requestedBy: data.createdBy,
          attentionTo: data.countyPODetails.poAttentionValue,
          fob: data.pofob,
          cac: cacRef.current[cacIndex],
          potype: data.poType
            ? poTypeRef.current.find((c) => c.poType == data.poType)
            : {},
          opendate: new Date(data.poOpenDate),
          closeddate:
            data.poCompleteDate == null ? "" : new Date(data.poCompleteDate),
          totalamnt: data.countyPOPricing?.poAmount,
          balance: data.countyPOPricing?.poBalance,
          description: data.poDescription,
          sac: data.sac,
          ihac: data.ihac,
        };

        purchaseOrderForm.opendate = formData?.opendate;

        if (cacIndex >= 0) {
          getUnencumberedBalance(cacRef.current[cacIndex].id);
        }

        setPurchaseOrderForm({ ...formData });
        setFormKey(formKey + 1);

        await getPOBalance(data);
      })
      .catch(() => { });
  };

  const getLineITem = (poNo) => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderLineItemEndPoints.LineItem + "/" + poNo,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.record;
        let LineItemAmount = 0;
        let lineItems = [];
        data.map((item) => {
          LineItemAmount = LineItemAmount + item?.poQuantity * item?.poPrice;
          lineItems.push(item);
        });
        if (poRef.current?.poAmount) {
          LineItemAmount = poRef.current?.poAmount - LineItemAmount;
        }
        if ((LineItemAmount > 0 || lineItems.length == 0) && !isView) {
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            cId: 0,
          };
          lineItems.push(newDataItem);
        }
        setLineItemGriddata([...lineItems]);
      })
      .catch(() => { });
  };
  const updateOpenDate = (formRenderProps) => {
    setPurchaseOrderForm({
      opendate: new Date(formRenderProps.value)
    });
  }

  const AddPurchaseOrder = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    if (dataItem.totalamnt < 0) {
      showErrorNotification("Total amount can't be in negative number");
    } else if (dataItem.totalamnt > CACBalance) {
      showErrorNotification(
        "Total amount can't be greater than county expense code balance"
      );
    } else {
      let apirequest = {
        id: 0,
        poNumber: dataItem.pono,
        poAmount: +dataItem.totalamnt,
        poOpenDate: dataItem.opendate,
        poCompleteDate: null,
        poComplete: false,
        poDescription: dataItem.description || "",
        poType: dataItem?.potype?.poType || "",
        poMemo: "",
        poShipVia: dataItem.shipvia || "",
        pofob: dataItem.fob || "",
        poDateRequired: "2023-11-23T10:52:10.972Z",
        poTransmittDate: "2023-11-23T10:52:10.972Z",
        whoID: 1,
        authorziedSignature: "",
        ihac: dataItem.ihac || "",
        sac: dataItem.sac || "",
        countyPODetails: {
          id: 0,
          poId: 0,
          pocacid: dataItem?.cac?.id || "",
          poVendorNo: VendorVal.id || "",
          poDeliverTo: 0,
          poAttention: 0,
          poAttentionValue: dataItem.attentionTo,
          poDirectInq: 0,
          deputyID: 0,
          localPONo: "",
          carryOver: dataItem.carryOver || false,
          poPrinted: false,
          poComplete: false,
          recurring: dataItem.recurring || false,
        },
        countyPOPricing: {
          id: 0,
          poId: 0,
          poAmount: +dataItem.totalamnt || 0,
          poBalance: +dataItem.totalamnt || 0,
          poQuantity: "",
          poDiscount: 0,
          doubleEncumerance: 0,
          closingBalance: 0,
        },
      };
      axiosInstance({
        method: "POST",
        url: PurchaseOrderEndPOints.PurchaseOrder,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setPoId(data.id);
          setPoNumber(dataItem.pono);
          setAddSubmit(true);
          poRef.current = data;
          props.getPOCode(data.id);
          if (data.countyPODetails?.poVendorNo) {
            let vendorIndex = vendorRef.current.findIndex(
              (x) => x.id == data.countyPODetails?.poVendorNo
            );
            if (vendorIndex >= 0) {
              setVendorVal(vendorRef.current[vendorIndex]);
              setShowVendorDetail(true);
              setShowVendorOption(true);
              setShowVendorform(true);
            }
          }
          let cacIndex = cacRef.current.findIndex(
            (x) => x.id == data.countyPODetails?.pocacid
          );

          if (cacIndex >= 0) {
            setCACVal([cacRef.current[cacIndex]]);
          }
          let formData = {
            pono: data.poNumber,
            Vendor: "",
            shipvia: data.poShipVia,
            requestedBy: data.createdBy,
            attentionTo: data.countyPODetails.poAttentionValue,
            fob: data.pofob,
            cac: cacRef.current[cacIndex],
            potype: data.poType
              ? poTypeRef.current.find((c) => c.poType == data.poType)
              : {},

            opendate: new Date(data.poOpenDate),
            closeddate:
              data.poCompleteDate == null
                ? null
                : new Date(data.poCompleteDate),
            totalamnt: data.countyPOPricing?.poAmount,
            balance: data.countyPOPricing?.poBalance,
            description: data.poDescription,
            sac: data.sac,
            ihac: data.ihac,
          };
          getLineITem(data.id);

          setPurchaseOrderForm({ ...formData });
          setFormKey(formKey + 1);
          showSuccessNotification("County PO save successfully");

          if (cacIndex >= 0) {
            getUnencumberedBalance(cacRef.current[cacIndex].id);
          }

          if (isView && !PoLIneitemDisplay) {
            navigate("/purchaseorder");
          }
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    }
    handleResetLineItemData();
  };
  const editPurchaseOrder = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    let apirequest = {
      id: poRef.current.id,
      poNumber: dataItem.pono,
      poAmount: +dataItem.totalamnt,
      poOpenDate: dataItem.opendate,
      poCompleteDate: dataItem.closeddate || null,
      poComplete: false,
      poDescription: dataItem.description || "",
      poType: dataItem?.potype?.poType || "",
      poMemo: "",
      poShipVia: dataItem.shipvia,
      pofob: dataItem.fob,
      poDateRequired: "2023-11-23T10:52:10.972Z",
      poTransmittDate: "2023-11-23T10:52:10.972Z",
      whoID: 1,
      modifiedDate: new Date(),
      authorziedSignature: "",
      ihac: dataItem.ihac || "",
      sac: dataItem.sac || "",
      countyPODetails: {
        id: poRef.current.countyPODetails?.id || null,
        poId: poRef.current.countyPODetails?.poId || null,
        pocacid: dataItem?.cac?.id,
        poVendorNo: VendorVal.id,
        poDeliverTo: 0,
        poAttention: 0,
        poAttentionValue: dataItem.attentionTo,
        poDirectInq: 0,
        deputyID: 0,
        localPONo: "",
        carryOver: dataItem.carryOver || false,
        poPrinted: false,
        poComplete: poRef.current?.countyPODetails?.poComplete || false,
        recurring: dataItem.recurring || false,
      },
      countyPOPricing: {
        id: poRef.current.countyPOPricing?.id || 0,
        poId: poRef.current.countyPOPricing?.poId || poRef.current?.id,
        poAmount: +dataItem.totalamnt || 0,
        poBalance: +dataItem.balance || 0,
        poQuantity: "",
        poDiscount: 0,
        doubleEncumerance: 0,
        closingBalance: 0,
      },
    };
    axiosInstance({
      method: "PUT",
      url: PurchaseOrderEndPOints.PurchaseOrder + "/" + poRef.current.id,
      data: apirequest,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        let cacIndex = cacRef.current.findIndex(
          (x) => x.id == data.countyPODetails?.pocacid
        );
        let formData = {
          pono: data.poNumber,
          Vendor: "",
          shipvia: data.poShipVia,
          requestedBy: data.createdBy,
          attentionTo: data.countyPODetails.poAttentionValue,
          fob: data.pofob,
          cac: cacRef.current[cacIndex],
          potype: data.poType
            ? poTypeRef.current.find((c) => c.poType == data.poType)
            : {},

          opendate: new Date(data.poOpenDate),
          closeddate:
            data.poCompleteDate == null ? null : new Date(data.poCompleteDate),
          totalamnt: data.countyPOPricing?.poAmount,
          balance: data.countyPOPricing?.poBalance,
          description: data.poDescription,
          sac: data.sac,
          ihac: data.ihac,
        };
        setPurchaseOrderForm(formData);
        let poBalance = await getPOBalance(data);

        showSuccessNotification("County PO saved successfully");
        if (isView && !PoLIneitemDisplay) {
          navigate("/purchaseorder");
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
          ...item,
          cId: 0,
          inEdit: true,
          poDescription: "",
          poDiscount: "",
          poPrice: "",
          poQuantity: "",
        }
        : item
    );
    setLineItemGriddata(newData);
  };

  const getPOBalance = async (poDetail) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url:
          PurchaseOrderEndPOints.POBalance +
          `?id=${poDetail?.id}&poamount=${poDetail?.countyPOPricing?.poAmount}&pocomplete=${poDetail?.poComplete}`,
        withCredentials: false,
      });
      let data = response.data;
      POBlanceRef.current = data;
      purchaseOrderForm.totalamnt = poDetail?.countyPOPricing?.poAmount;
      purchaseOrderForm.balance = data;
      setFormKey(formKey + 1);
      return data;
    } catch (error) { }
  };
  const [encumberedBalance, setUnencumberedBalance] = React.useState(0);

  const getUnencumberedBalance = async (id) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: PurchaseOrderEndPOints.UnencumberedBalance + "/" + id + "/" + kendoToString(purchaseOrderForm.opendate, "MM-dd-yyyy"),
        withCredentials: false,
      });
      let data = response.data;
      setUnencumberedBalance(data);
    } catch (error) { }
  };
  const [DoubleEncumerance, setDoubleEncumerance] = React.useState(0);

  const getDoubleEncumerance = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url:
          PurchaseOrderEndPOints.DoubleEncumerance +
          "/" +
          purchaseOrderForm.pono,
        withCredentials: false,
      });
      let data = response.data;
      setDoubleEncumerance(data);
    } catch (error) {
      console.log(error);
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

  const AddLineItem = (dataItem) => {
    let apirequest = {
      cid: 0,
      countyPOId: poRef.current.id,
      poQuantity: dataItem.poQuantity,
      poLineNumber: LineItemGriddata.length.toString(),
      poDescription: dataItem.poDescription,
      poPrice: +dataItem.poPrice || 0,
      poAmount: +dataItem.poAmount || 0,
      poDiscount: +dataItem.poDiscount || 0,
    };

    axiosInstance({
      method: "POST",
      url: PurchaseOrderLineItemEndPoints.LineItem,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        getLineITem(poId);
        showSuccessNotification("PO lineItem saved successfully");
      })
      .catch(() => { });
  };
  const EditLineItem = (dataItem) => {
    let apirequest = {
      cid: dataItem.cId,
      countyPOId: dataItem.countyPOId,
      poQuantity: dataItem.poQuantity,
      poLineNumber: dataItem.poLineNumber,
      poDescription: dataItem.poDescription,
      poPrice: +dataItem.poPrice,
      poAmount: +dataItem.poAmount,
      poDiscount: +dataItem.poDiscount,
    };

    axiosInstance({
      method: "PUT",
      url: PurchaseOrderLineItemEndPoints.LineItem + "/" + dataItem.cId,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        getLineITem(dataItem.countyPOId);
        showSuccessNotification("PO lineItem updated successfully");
      })
      .catch(() => { });
  };

  const deleteLineItem = (dataItem) => {
    axiosInstance({
      method: "delete",
      url: PurchaseOrderLineItemEndPoints.LineItem + "/" + dataItem.cId,
      withCredentials: false,
    })
      .then((response) => {
        getLineITem(poId);
        showSuccessNotification("Lineitem deleted successfully");
      })
      .catch(() => { });
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
        setVendorDDList(data);
        vendorRef.current = data;
      })
      .catch(() => { });
  };

  const [purOrderDDList, setpurOrderDDList] = React.useState([]);
  const CACddlOnChange = (event) => {
    setCACVal({ value: event.target.value });
  };
  const [purOrderVal, setpurOrderVal] = React.useState({
    value: {
      text: "Select Purchase Order",
      id: 0,
    },
  });

  const [VendorSearch, setVendorSearch] = useState("");

  const onFilterChange = (event) => {
    let searchText = event.filter.value;
    setVendorSearch(searchText);
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      if(state.type == 'screen' || VendorSearch)
      SearchVendor(VendorSearch);
    }, 1000);
    return () => clearTimeout(getData);
  }, [VendorSearch]);

  const VendorddlOnChange = (event) => {
    if(event.value == null){
      return;
    }
    if (event.syntheticEvent.type == "click") {
      let vendorIndex = VendorDDList.findIndex(
        (x) => x.id == event.target.value.id
      );
      if (vendorIndex > -1) {
        setVendorVal(VendorDDList[vendorIndex]);
        setShowVendorDetail(true);
        setShowVendorOption(true);
        setShowVendorform(true);
      }
    }
  };

  const ChooseDiffCust = () => {
    SearchVendor("")
    setShowVendorDetail(false);
    setShowVendorform(true);
    setVendorVal({});
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
    getLineITem(poId);
  };

  const itemChange = (event) => {
    const field = event.field || "";
    const newData = LineItemGriddata.map((item) =>
      item.cId == event.dataItem.cId
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
      item.cId == dataItem.cId
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    setLineItemGriddata(newData);
  };
  const handleAddEquipmentSetup = () => {
    setaddEquipmentSetupVisible(!addEquipmentSetupVisible);
    setShowAddEquipmentSetupDialog(true);
    if (addEquipmentSetupVisible) {
      setFormInit([]);
    }
  };
  const editField = "inEdit";

  const LineItemGridCommandCell = (props) => {
    return (
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
    );
  };
  const remove = (dataItem) => {
    deleteLineItem(dataItem);
  };
  const discard = (dataItem) => { };
  const add = (dataItem) => {
    let LineItemAmount = 0;
    LineItemGriddata.map((item) => {
      LineItemAmount =
        LineItemAmount +
        (Number(item.poQuantity) * Number(item.poPrice) -
          (Number(item.poDiscount) || 0));
    });
    if (poRef.current?.poAmount) {
      LineItemAmount = poRef.current?.poAmount - LineItemAmount;
    }
    if (LineItemAmount >= 0) {
      dataItem.inEdit = false;
      AddLineItem(dataItem);
    } else {
      showErrorNotification(
        "LineItem total amount should be lower than PO total"
      );
    }
  };
  const update = (dataItem) => {
    let LineItemAmount = 0;
    LineItemGriddata.map((item) => {
      if (item.poQuantity && item.poPrice) {
        LineItemAmount =
          LineItemAmount +
          (Number(item.poQuantity) * Number(item.poPrice) -
            (Number(item.poDiscount) || 0));
      }
    });
    if (poRef.current?.poAmount) {
      LineItemAmount = poRef.current?.poAmount - LineItemAmount;
    }

    if (LineItemAmount >= 0) {
      EditLineItem(dataItem);
    } else {
      showErrorNotification(
        "LineItem total amount should be lower than PO total"
      );
    }
  };
  const [formInit, setFormInit] = useState([]);

  const [showVendopDetail, setShowVendopDetail] = React.useState(false);

  const handleVendorDialogClose = () => {
    setShowVendopDetail(false);
  };
  const handleVendorDialogOpen = () => {
    setShowVendopDetail(true);
  };
  const handlevendorDetail = (vendor) => {
    setVendorVal(vendor);
    setIgnoreModified(true);
    setShowVendorDetail(true);
    setShowVendorOption(true);
    setShowVendorform(true);
  };
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
      ReportName: "PO",
      //"DictionaryParameters": "{ID:" + poId + "}"
      DictionaryParameters: { ID: poId },
    };
    axiosInstance({
      method: "POST",
      maxBodyLength: Infinity,
      url: ReportsEndPoints.GenerateReport,
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

  const { checkPrivialgeGroup, loading, error } = usePrivilege('Accounts Payable')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div className="col-sm-12">
      <div className={!isView ? "form-container" : ""}>
        <Form
          onSubmit={poNumber ? editPurchaseOrder : AddPurchaseOrder}
          initialValues={purchaseOrderForm}
          key={formKey}
          ref={formRef}
          ignoreModified={ignoreModified}
          render={(PurchaseOrderformRender) => (
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
                        <Field
                          id={"Vendor"}
                          name={"Vendor"}
                          label={"Vendor*"}
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
                        />
                        <div style={{ textAlign: "center" }}>
                          <Button
                            onMouseDown={handleVendorDialogOpen}
                            themeColor={"primary"}
                          >
                            Create New Vendor
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-end">
                        <div>
                          <span>Bill to</span>
                          <br></br>
                          <span>
                            {" "}
                            <b>{VendorVal?.name}</b>
                          </span>
                          <br></br>
                          {VendorVal?.address1 && (
                            <>
                              <span> {VendorVal?.address1}</span>
                              <br></br>
                            </>
                          )}
                          {VendorVal?.address2 && (
                            <>
                              <span> {VendorVal?.address2}</span>
                              <br></br>
                            </>
                          )}
                          <span>
                            {" "}
                            {VendorVal?.city && <>{VendorVal?.city} ,</>}{" "}
                            {VendorVal?.state && <>{VendorVal?.state},</>}{" "}
                            {VendorVal?.zip && <>{VendorVal?.zip} </>}
                          </span>
                          <br></br>
                          {!isView && (
                            <a
                              type="button"
                              style={{ color: "blue" }}
                              onClick={ChooseDiffCust}
                            >
                              Choose a different vendor
                            </a>
                          )}
                        </div>

                        {!isView && (
                          <div style={{ textAlign: "center" }}>
                            <Button
                              onMouseDown={handleVendorDialogOpen}
                              themeColor={"primary"}
                            >
                              Create New Vendor
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {ShowVendorform ? (
                    <div>
                      <Field
                        id={"attentionTo"}
                        name={"attentionTo"}
                        label={"Attention To"}
                        component={FormInput}
                        disabled={isView}
                        maxlength={50}
                      />
                      <Field
                        id={"shipvia"}
                        name={"shipvia"}
                        label={"Ship Via"}
                        component={FormInput}
                        disabled={isView}
                        maxlength={35}
                      />
                      <Field
                        id={"requestedBy"}
                        name={"requestedBy"}
                        label={"Requested By"}
                        component={FormInput}
                        disabled={isView}
                        maxlength={50}
                      />
                      <Field
                        id={"fob"}
                        name={"fob"}
                        label={"FOB"}
                        component={FormInput}
                        disabled={isView}
                        maxlength={25}
                      />
                      <div className="d-flex">
                        <div className="me-2">
                          <Field
                            id="carryOver"
                            name="carryOver"
                            label="Carry Over"
                            component={FormCheckbox}
                          />
                        </div>
                        <div className="me-2">
                          <Field
                            id="recurring"
                            name="recurring"
                            label="Recurring"
                            component={FormCheckbox}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {ShowVendorform ? (
                  <div style={{ width: "50%", padding: "20px" }}>
                    <div className="d-flex">
                      <Field
                        id={"cac"}
                        name={"cac"}
                        label={"County Expense Code*"}
                        textField="countyExpenseCode"
                        dataItemKey="id"
                        component={FormMultiColumnComboBox}
                        data={
                          searchCAC || searchCACData.length
                            ? searchCACData
                            : CACDDList
                        }
                        value={CACVal}
                        columns={CACColumns}
                        filterable={true}
                        onFilterChange={handleFilterChange}
                        placeholder="Search CAC..."
                        onChange={CACHandleChange}
                        wrapperstyle={{
                          width: "58%",
                          marginRight: "10px",
                        }}
                        validator={cacexpenseCodeValidator}
                        disabled={isView}
                      />
                      <div
                        className="k-form-field"
                        style={{
                          width: "40%",
                        }}
                      >
                        <label className="k-label">Unencumbered Balance</label>
                        <NumericTextBox
                          format={"c"}
                          spinners={false}
                          value={encumberedBalance}
                          disabled={true}
                        />
                      </div>
                    </div>
                    <Field
                      id={"pono"}
                      name={"pono"}
                      label={"PO Number*"}
                      component={FormInput}
                      disabled={isView}
                      validator={poValidator}
                    />
                    {!PoTypeDisplay && (
                      <Field
                        id={"potype"}
                        name={"potype"}
                        label={"PO Type"}
                        textField="poType"
                        dataItemKey="id"
                        component={FormDropDownList}
                        data={poType}
                        disabled={isView}
                      />
                    )}
                    <Field
                      id={"opendate"}
                      name={"opendate"}
                      label={"Open Date*"}
                      component={FormDatePicker}
                      onChange={updateOpenDate}
                      disabled={isView}
                      validator={activeDateValidator}
                    />
                    {poRef.current?.id ? (
                      <Field
                        id={"closeddate"}
                        name={"closeddate"}
                        label={"Closed Date"}
                        component={FormDatePicker}
                        disabled={isView}
                      />
                    ) : null}
                    <Field
                      id={"totalamnt"}
                      name={"totalamnt"}
                      label={"Total*"}
                      format={"c"}
                      placeholder={"$ Enter Amount"}
                      step={0}
                      spinners={false}
                      component={FormNumericTextBox}
                      validator={currencyAmountValidator}
                      disabled={isView}
                    />
                    {poRef.current?.id ? (
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
                    ) : null}
                    <Field
                      id={"description"}
                      name={"description"}
                      label={"Description"}
                      component={FormTextArea}
                      disabled={isView}
                      maxlength={255}
                    />
                    {IHACDisplay && IhacSacDisplay && (
                      <div
                        style={{ width: "100%" }}
                        onClick={() => setVisibleIHPO(true)}
                      >
                        <Field
                          id={"ihac"}
                          name={"ihac"}
                          label={"In House Account Code"}
                          component={FormInput}
                          disabled={isView}
                        />
                      </div>
                    )}
                    {IhacSacDisplay && (
                      <>
                        <div
                          style={{ width: "100%" }}
                          onClick={() => setVisibleSAC(true)}
                        >
                          <Field
                            id={"sac"}
                            name={"sac"}
                            label={"State Account Code"}
                            component={FormInput}
                            disabled={isView}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
              {!isView && (
                <>
                  <div
                    className="mb-4"
                    style={{ textAlign: "center", margin: "3px" }}
                  >
                    {poNumber ? (
                      <>
                        {checkPrivialgeGroup("EditPurchaseOrderCM", 3) && (
                          <Button
                            type={"submit"}
                            themeColor={"primary"}
                            disabled={!PurchaseOrderformRender.allowSubmit}
                          >
                            Save PO
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {checkPrivialgeGroup("AddPurchaseOrderB", 2) && (
                          <Button
                            type={"submit"}
                            themeColor={"primary"}
                            disabled={!PurchaseOrderformRender.allowSubmit}
                          >
                            Create PO
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </FormElement>
          )}
        />
        {showVendopDetail ? (
          <AddNewVendor
            handleVendorDialogClose={handleVendorDialogClose}
            handleType={"Vendor"}
            handlevendorDetail={handlevendorDetail}
          />
        ) : null}
        {(!isView && PoLIneitemDisplay && poNumber) ||
          (isView && PoLIneitemDisplay && LineItemGriddata.length > 0) ? (
          <div>
            <fieldset>
              <legend>Line Item</legend>
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
              >
                <GridColumn
                  field="poQuantity"
                  title="Quantity"
                  editor="numeric"
                />
                <GridColumn field="poDescription" title="Description" />
                <GridColumn
                  field="poPrice"
                  title="Price"
                  editor="numeric"
                  format="{0:c2}"
                  cell={ColumnFormCurrencyTextBox}
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
                <GridColumn
                  field="poDiscount"
                  title="Discount"
                  editor="numeric"
                  format="{0:c2}"
                  cell={ColumnFormCurrencyTextBox}
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
                <GridColumn
                  field="poAmount"
                  title="Amount"
                  format="{0:c2}"
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
                  cell={(props) => (
                    <td className="!k-text-right">
                      $
                      {props.dataItem?.poQuantity * props.dataItem?.poPrice -
                        (props.dataItem?.poDiscount || 0) || 0}
                    </td>
                  )}
                />
                {!isView && (
                  <GridColumn cell={LineItemGridCommandCell} width="240px" />
                )}
              </Grid>
            </fieldset>
            <br></br>
          </div>
        ) : null}
        {!isView && (
          <p style={{ textAlign: "center", margin: "3px" }}>
            {checkPrivialgeGroup("PrintPurchaseOrderCM", 2) && (
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
        {visibleSAC && (
          <SacDialog
            toggleDialog={toggleDialog}
            getSacCode={getSacCode}
            type={7}
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
          >
            {" "}
          </IHACDialog>
        )}

        {visiblePOClose && (
          <Dialog
            title={<span>Please confirm</span>}
            onClose={toggleVisiblePOClose}
          >
            <p
              style={{
                margin: "25px",
                textAlign: "center",
              }}
            >
              Voucher amount is 90% of PO balance, do you want to close PO
            </p>
            <DialogActionsBar>
              <Button
                themeColor={"secondary"}
                className={"col-12"}
                onClick={toggleVisiblePOClose}
              >
                No
              </Button>
              <Button
                themeColor={"primary"}
                className={"col-12"}
                onClick={HandlePOClose}
              >
                Yes
              </Button>
            </DialogActionsBar>
          </Dialog>
        )}
      </div>
    </div>
  );
}
