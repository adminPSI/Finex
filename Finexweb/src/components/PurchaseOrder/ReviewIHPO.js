import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import {
  downloadIcon,
  eyedropperIcon,
  trashIcon,
  uploadIcon,
} from "@progress/kendo-svg-icons";
import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import {
  IHACExpenseCodeEndPoints,
  IHPOEndPoints,
  InventoryEndPoints,
  PurchaseOrderEndPOints,
  UploadDocumentEndPoints,
  VendorEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import {
  ColumnFormCurrencyTextBox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormNumericTextBox,
  FormTextArea
} from "../form-components";
import IHACDialog from "../modal/IHACDialog";
import SacDialog from "../modal/StateAccountCodeDialog";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import DocumentPopup from "../UploadFile/DocumentPopup";
import { supplierValidator } from "../validators";

const MyCommandCell = (props) => {
  const { dataItem } = props;
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
      ></Button>
      <Button
        themeColor="primary"
        onClick={handleRemove}
        svgIcon={trashIcon}
      ></Button>
      <Button themeColor="primary" onClick={handleAdditional}>
        Add Additional Info
      </Button>
    </td>
  );
};
export default function AddReviewIHPO() {
  const navigate = useNavigate();
  const [IHPOForm, setIHPOForm] = React.useState({});
  const [formKey, setFormKey] = React.useState(1);
  const [AdditionalformKey, setAdditionalFormKey] = React.useState(1);
  const [docData, setDocData] = useState([]);
  const [ShowVendorOption, setShowVendorOption] = useState(true);
  const [ShowVendorDetail, setShowVendorDetail] = useState(false);
  const [ShowVendorform, setShowVendorform] = useState(true);
  const [LineItemGriddata, setLineItemGriddata] = useState([]);
  const [ihacValue, setIHacValue] = useState("");
  const [sacValue, setSacValue] = useState("");
  const [showAdditionalInfoDialog, setShowAdditionalInfoDialog] =
    useState(false);
  const [SelectedRow, setSelectedRow] = useState({});
  const [, setIHPODetail] = useState({});
  const [, setIHPONumber] = React.useState();
  const [DisapproveModal, setDisapproveModal] = React.useState(false);
  const { state } = useLocation();
  const ihpoRef = useRef();
  const vendorRef = useRef();
  const poRef = useRef();
  const POBlanceRef = useRef();

  const poListRef = useRef();

  React.useEffect(() => {
    getCAC();
    getsac();
    getihac();
  }, []);

  React.useEffect(() => {
    if (state?.IHPONumber) {
      commonFuction(state?.IHPONumber, state?.ihpoId);
    }
  }, [state]);

  const commonFuction = async (ihponumber, ihpoId) => {
    SearchVendor("");
    await SearchPO("");
    await getIHPO(ihpoId);
    setIHPONumber(ihponumber);
  };

  const getCAC = () => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.getCAC + "/7",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setCACDDList(data);
      })
      .catch(() => { });
  };
  const getsac = () => {
    axiosInstance({
      method: "GET",
      url: InventoryEndPoints.GetAssetSACAmount,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setSACDDList(data);
      })
      .catch(() => { });
  };
  const getihac = () => {
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
  const getPO = async (poId) => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrder + "/" + poId,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        poRef.current = data;
        poListRef.current = data;

        return data;
      })
      .catch(() => { });
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

      return data;
    } catch (error) { }
  };

  const getIHPO = async (ihpoNo) => {
    axiosInstance({
      method: "GET",
      url: IHPOEndPoints.IHPO + "/" + ihpoNo,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        setIHPODetail(data);
        ihpoRef.current = data;
        let podetail;
        if (data?.reqPOid) {
          podetail = await getPO(data.reqPOid);
        }
        if (data.ihpoDetails?.reqVendor && data.ihpoDetails?.vendor?.name) {
          setVendorVal(data.ihpoDetails.vendor);
          setShowVendorDetail(true);
          setShowVendorOption(true);
          setShowVendorform(true);
        }

        let poDetail = data.reqPOid;
        if (poListRef.current && data.reqPOid) {
          let index = poListRef.current.findIndex(
            (x) => x.id == data?.reqPOid
          );
          poDetail = poListRef.current[index];
          setPOVal(poDetail);
        }
        let formData = {
          requestedBy: data.preparedBy,
          attentionTo: data.attenTo,
          ihpoNo: data.reqNumber,
          opendate: new Date(data.reqDate),
          closeddate:
            data.reqDateComplete !== null
              ? new Date(data.reqDateComplete)
              : null,
          shipTo: data.shipTo,
          totalamnt: data.ihpoPricing.reqTotal,
          balance: data.ihpoPricing.reqBalance,
          reqPONumber: poDetail,
          justification: data.inHousePoMemo,
        };
        getDocuments("IHPO-" + data.reqNumber);
        setIHPOForm({ ...formData });

        setFormKey(formKey + 1);
        getLineITem(data.id);
      })
      .catch(() => { });
  };
  const SearchVendor = (searchText) => {
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

  const IHPOformOnSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (POBlanceRef.current < dataItem.totalamnt) {
      showErrorNotification(
        "Please select another PO as PO balance is less than IHPO amount"
      );
    } else {
      let apirequest = {
        id: ihpoRef.current.id,
        reqNumber: dataItem.ihpoNo,
        reqDate: dataItem.opendate,
        reqDateRequired: ihpoRef.current.reqDateRequired,
        reqDateComplete: dataItem.closeddate,
        reqCheck: ihpoRef.current.reqCheck,
        reqPONumber: dataItem.reqPONumber?.poNumber,
        reqPOid: dataItem.reqPONumber?.id,
        complete: ihpoRef.current.complete,
        reqDescription: dataItem.justification || "",
        reqPrint: ihpoRef.current.reqPrint,
        combine: ihpoRef.current.combine,
        reqIHPONo: ihpoRef.current.reqIHPONo,
        inHousePoMemo: ihpoRef.current.inHousePoMemo,
        corrected: ihpoRef.current.corrected,
        address: ihpoRef.current.address,
        city: ihpoRef.current.city,
        state: ihpoRef.current.state,
        zip: ihpoRef.current.zip,
        attenTo: dataItem.attentionTo,
        preparedBy: dataItem.requestedBy,
        checkOut: ihpoRef.current.checkOut,
        checkOutByID: ihpoRef.current.checkOutByID,
        shipTO: dataItem.shipTo,
        ihpoDetails: {
          id: ihpoRef.current.ihpoDetails.id,
          reqID: ihpoRef.current.ihpoDetails.reqID,
          reqVendor: VendorVal.id,
          reqIHAC: ihpoRef.current.ihpoDetails.reqIHAC
            ? ihpoRef.current.ihpoDetails.reqIHAC//.split("-").join("-")
            : ihpoRef.current.ihpoDetails.reqIHAC,
          deliverToID: ihpoRef.current.ihpoDetails.deliverToID,
          reqCatalogNo: ihpoRef.current.ihpoDetails.reqCatalogNo,
          pRno: 0,
          reqPrint: false,
          combine: false,
          whoID: 0,
          fiscalDate: null,
          superDate: null,
          reqRequestBy: "",
        },
        ihpoApproval: ihpoRef.current.ihpoApproval,
        ihpoPricing: {
          id: ihpoRef.current.ihpoPricing.id,
          reqID: ihpoRef.current.ihpoPricing.reqID,
          reqTotal: +dataItem.totalamnt || 0,
          reqQuantity: "",
          reqDiscount: 0,
          reqTotalPrice: 0,
          reqUnitPrice: 0,
          reqBalance: +dataItem.balance || 0,
        },
        ihpoWorkflowStep: ihpoRef.current?.ihpoWorkflowStep,
      };
      if (ihpoRef.current?.ihpoWorkflowStep?.id) {
        apirequest.ihpoWorkflowStep = {
          workflowId: ihpoRef.current?.ihpoWorkflowStep.workflowId,
          workflowStepName: ihpoRef.current?.ihpoWorkflowStep.workflowStepName,
          stepSeq: ihpoRef.current?.ihpoWorkflowStep.stepSeq,
          stepStatus: ihpoRef.current?.ihpoWorkflowStep.stepStatus,
          stepRole: ihpoRef.current?.ihpoWorkflowStep.stepRole,
        };
      }
      if (ihpoRef.current?.ihpoApproval?.id) {
        apirequest.ihpoApproval = {
          id: ihpoRef.current.ihpoApproval.id,
          reqID: ihpoRef.current.ihpoApproval.reqID,
          reqApprovedRole: ihpoRef.current.ihpoApproval.reqApprovedRole,
          reqApprovedBy: ihpoRef.current.ihpoApproval.reqApprovedBy,
          reqStatus: ihpoRef.current.ihpoApproval.reqStatus,
          reqStatusMessage: ihpoRef.current.ihpoApproval.reqStatusMessage,
        };
      }
      axiosInstance({
        method: "PUT",
        url: IHPOEndPoints.IHPO + "/" + ihpoRef.current.id,
        data: apirequest,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setIHPONumber(dataItem.ihpoNo);
          ihpoRef.current = data;

          if (data.ihpoDetails?.reqVendor && data.ihpoDetails?.vendor?.name) {
            let vendorIndex = vendorRef.current.findIndex(
              (x) => x.id == data.ihpoDetails?.reqVendor
            );
            if (vendorIndex >= 0) {
              setVendorVal(vendorRef.current[vendorIndex]);
              setShowVendorDetail(true);
              setShowVendorOption(true);
              setShowVendorform(true);
            }
          }


          let formData = {
            ihpoNo: data.reqNumber,
            reqPONumber: dataItem.reqPONumber,
            Vendor: "",
            shipTo: data.shipTo,
            requestedBy: data.preparedBy,
            attentionTo: data.attenTo,
            totalamnt: data.ihpoPricing.reqTotal || 0,
            balance: data.ihpoPricing.reqBalance || 0,
            opendate: new Date(data.reqDate),
            closeddate:
              data.reqDateComplete !== null
                ? new Date(data.reqDateComplete)
                : null,
            justification: data.inHousePoMemo
          };
          setIHPOForm({ ...formData });
          setFormKey(formKey + 1);
          setPOVal(dataItem.reqPONumber);
          getLineITem(data.id);
          showSuccessNotification("IHPO saved successfully");
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    }
  };

  const [, setCACDDList] = React.useState([]);
  const [, setSACDDList] = React.useState([]);
  const [IHACDDList, setIHACDDList] = React.useState([]);

  const [VendorDDList, setVendorDDList] = React.useState([]);
  const [VendorVal, setVendorVal] = React.useState();

  const VendorddlOnChange = (event) => {
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

  const getLineITem = (poNo) => {
    axiosInstance({
      method: "GET",
      url: IHPOEndPoints.IHPOLineItem + "/" + poNo,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.record;
        let lineItems = [];
        let LineItemAmount = 0;
        data.map((item) => {
          LineItemAmount =
            LineItemAmount + item.reqDQuantity * item.reqDUnitPrice;
          lineItems.push(item);
        });
        if (ihpoRef.current?.ihpoPricing?.reqTotal) {
          LineItemAmount =
            (ihpoRef.current?.ihpoPricing?.reqTotal || 0) - LineItemAmount;
        }
        if (LineItemAmount > 0) {
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            id: 0,
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
      reqID: ihpoRef.current.id,
      reqDNumber: ihpoRef.current.reqNumber,
      reqDQuantity: dataItem.reqDQuantity,
      reqDCatNo: "",
      reqDDescription: dataItem.reqDDescription,
      reqDUnitPrice: dataItem.reqDUnitPrice,
      reqDDiscount: dataItem.reqDDiscount || 0,
      reqDTotal: dataItem.reqDTotal,

      reqIHAC: dataItem.reqIHAC
        ? dataItem.reqIHAC.split("-")
        : dataItem.reqIHAC,
      balance: 0,
      po: ihpoRef.current.reqPONumber,
      poid: POVal.id,
      complete: false,
      approvedBy: "",
      approvedDate: null,
      dateComplete: null,
      sAC: dataItem.sAC,
      voucherAmount: 0,
      lineDate: "2023-11-25T16:15:00.864Z",
      clientID: 0,
      fundingSourceID: 0,
      listOfOthersID: 0,
      categoryID: 0,
      serviceDate: null,
      unitDesc: "",
      partNumber: "",
      projectID: 0,
      quantityRec: 0,
      serviceDateEnd: null,
      dateEntered: null,
      enteredBy: 0,
      modifiedWhen: new Date(),
    };
    axiosInstance({
      method: "POST",
      url: IHPOEndPoints.IHPOLineItem,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        getLineITem(ihpoRef.current.id);
        showSuccessNotification("IHPO lineitem saved successfully");
      })
      .catch(() => {
        cancel();
      });
  };
  const EditLineItem = (dataItem) => {
    let apirequest = {
      id: dataItem.id,
      reqID: dataItem.reqID,
      reqDNumber: dataItem.reqDNumber,
      reqDQuantity: dataItem.reqDQuantity,
      reqDCatNo: "",
      reqDDescription: dataItem.reqDDescription,
      reqDUnitPrice: dataItem.reqDUnitPrice,
      reqDDiscount: dataItem.reqDDiscount,
      reqDTotal: dataItem.reqDTotal,
      reqIHAC: dataItem.reqIHAC
        ? dataItem.reqIHAC
        : dataItem.reqIHAC,
      balance: dataItem.balance,
      po: dataItem.po,
      poid: dataItem?.poid || 0,
      complete: true,
      approvedBy: "str",
      approvedDate: "2023-11-25T16:17:09.097Z",
      dateComplete: dataItem.dateComplete,
      sAC: dataItem.sAC,
      voucherAmount: 0,
      lineDate: "2023-11-25T16:17:09.097Z",
      clientID: 0,
      fundingSourceID: 0,
      listOfOthersID: 0,
      categoryID: 0,
      serviceDate: dataItem.serviceDate,
      unitDesc: dataItem.unitDesc,
      partNumber: dataItem.partNumber,
      projectID: 0,
      quantityRec: 0,
      serviceDateEnd: "2023-11-25T16:17:09.097Z",
      dateEntered: "2023-11-25T16:17:09.097Z",
      enteredBy: 0,
      modifiedWhen: dataItem.modifiedWhen,
    };

    axiosInstance({
      method: "PUT",
      url: IHPOEndPoints.IHPOLineItem + "/" + dataItem.id,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        getLineITem(ihpoRef.current.id);
        showSuccessNotification("Lineitem updated successfully");
      })
      .catch(() => {
        cancel();
      });
  };
  const AdditionalLineItem = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (Number(dataItem.reqDQuantity) < Number(dataItem.reqReceive)) {
      showErrorNotification("Recieve can't be greater than quantity");
      submitButton.disabled = false;
      return;
    }
    let apirequest = {
      id: SelectedRow.id,
      reqID: SelectedRow.reqID,
      reqDNumber: SelectedRow.reqDNumber,
      reqDQuantity: SelectedRow.reqDQuantity,
      reqDCatNo: "",
      reqDDescription: SelectedRow.reqDDescription,
      reqDUnitPrice: SelectedRow.reqDUnitPrice,
      reqDDiscount: SelectedRow.reqDDiscount,
      reqDTotal: SelectedRow.reqDTotal,
      reqIHAC: SelectedRow?.reqIHAC
        ? SelectedRow.reqIHAC
        : SelectedRow.reqIHAC,
      reqReceive: dataItem.reqReceive || 0,
      balance: 0,
      po: SelectedRow.po,
      complete: false,
      approvedBy: "",
      approvedDate: null,
      dateComplete: dataItem.dateComplete,
      sAC: SelectedRow.sAC,
      voucherAmount: 0,
      lineDate: null,
      clientID: 0,
      fundingSourceID: 0,
      listOfOthersID: 0,
      categoryID: 0,
      serviceDate: SelectedRow.serviceDate,
      unitDesc: SelectedRow.unitDesc,
      partNumber: SelectedRow.partNumber,
      projectID: 0,
      quantityRec: 0,
      serviceDateEnd: null,
      dateEntered: null,
      enteredBy: 0,
      modifiedWhen: SelectedRow.modifiedWhen,
      poid: SelectedRow?.poid || 0,
    };
    axiosInstance({
      method: "PUT",
      url: IHPOEndPoints.IHPOLineItem + "/" + SelectedRow.id,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        handleAdditionalDialogClose();
        getLineITem(ihpoRef.current.id);
        showSuccessNotification("Additional info saved successfully");
      })
      .catch(() => {
        cancel();
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  const handleApprover = (status) => {
    if (status == "disapprove") {
      setDisapproveModal(true);
    } else {
      let approveRequirement = false;
      if (checkPrivialgeGroup("POnumberIHPOF", 2)) {
        let isPOValid = LineItemGriddata?.filter((item) => item.id).find(
          (x) => !x.poid
        );

        if (isPOValid) {
          approveRequirement = false;
          showErrorNotification("Please select PO number before approve");
          return false;
        } else {
          approveRequirement = true;
        }
      }

      if (checkPrivialgeGroup("IHACIHPOF", 2)) {
        approveRequirement = false;

        LineItemGriddata.forEach((item) => {
          if (item.id && (item.reqIHAC == "" || item.inEdit)) {
            approveRequirement = false;
            showErrorNotification(
              "Please enter IHAC code in lineitem before approve"
            );
            return false;
          } else {
            approveRequirement = true;
          }
          return false;
        });
      }

      if (checkPrivialgeGroup("sacIHPOF", 2)) {
        approveRequirement = false;
        LineItemGriddata.forEach((item) => {
          if (item.id && (item.sAC == "" || item?.inEdit)) {
            approveRequirement = false;
            showErrorNotification("Please add SAC in lineitem before approve");
            return true;
          } else {
            approveRequirement = true;
          }
        });
      }
      if (approveRequirement) {
        let apirequest = {
          id: 0,
          reqID: ihpoRef.current?.id,
          reqApprovedRole: "DHADMIN",
          reqApprovedBy: 8,
          reqStatus: true,
          reqStatusMessage: "Approved",
          reqComment: "",
          reqApprovedDate: ihpoRef.current?.ihpoApproval?.reqApprovedDate,
        };
        axiosInstance({
          method: "PUT",
          url: IHPOEndPoints.IHPOApproveStatus,
          data: apirequest,
          withCredentials: false,
        })
          .then((response) => {
            let data = response.data.data;
            navigate("/approveIHPO");
          })
          .catch(() => { });
      }
    }
  };
  const handleDisapprove = (dataItem) => {
    let apirequest = {
      id: 0,
      reqID: ihpoRef.current?.id,
      reqApprovedRole: "DHADMIN",
      reqApprovedBy: 8,
      reqStatus: false,
      reqStatusMessage: "Rejected",
      reqComment: dataItem.disapproveMemo,
      reqApprovedDate: ihpoRef.current.ihpoApproval.reqApprovedDate,
    };
    axiosInstance({
      method: "PUT",
      url: IHPOEndPoints.IHPOApproveStatus,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setDisapproveModal(false);
        navigate("/approveIHPO");
      })
      .catch(() => { });
  };

  const deleteLineItem = (dataItem) => {
    axiosInstance({
      method: "delete",
      url: IHPOEndPoints.IHPOLineItem + "/" + dataItem.id,
      withCredentials: false,
    })
      .then((response) => {
        getLineITem(ihpoRef.current.id);
        showSuccessNotification("Lineitem delete successfully");
      })
      .catch(() => {
        cancel();
      });
  };
  const handleAdditionalDialogClose = () => {
    setShowAdditionalInfoDialog(false);
  };
  const handleDisaprroveDialogClose = () => {
    setDisapproveModal(false);
  };
  const additionalInfo = (dataItem) => {
    setSelectedRow(dataItem);

    let ihpoIndex = IHACDDList.findIndex(
      (x) => x.ihacCode == dataItem.reqIHAC
    );

    let formData = {
      reqDQuantity: dataItem.reqDQuantity,
      cac: "",
      sAC: dataItem.sAC,
      reqIHAC: dataItem.reqIHAC
        ? dataItem.reqIHAC
        : dataItem.reqIHAC,
      reqReceive: dataItem.reqReceive || "",
      dateComplete: dataItem.dateComplete
        ? new Date(dataItem.dateComplete)
        : null,
    };
    setAdditonalFormInit(formData);
    setAdditionalFormKey(AdditionalformKey + 1);
    setShowAdditionalInfoDialog(true);
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
  const cancel = (dataItem) => {
    getLineITem(ihpoRef.current.id);
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
    setSacCode(dataItem.sAC);
    setIHPOCode(dataItem.reqIHAC);
    let newData = LineItemGriddata.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    setLineItemGriddata(newData);
  };
  const editField = "inEdit";

  const LineItemGridCommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      remove={remove}
      discard={discard}
      update={update}
      add={add}
      cancel={cancel}
      additionalInfo={additionalInfo}
      editField={editField}
    />
  );

  const remove = (dataItem) => {
    deleteLineItem(dataItem);
  };
  const discard = (dataItem) => { };
  const add = (dataItem) => {
    if (dataItem?.reqDQuantity) {
      let LineItemAmount = 0;
      LineItemGriddata.map((item) => {
        LineItemAmount =
          LineItemAmount + item.reqDQuantity * item.reqDUnitPrice;
      });
      if (ihpoRef.current?.ihpoPricing?.reqTotal) {
        LineItemAmount =
          (ihpoRef.current?.ihpoPricing?.reqTotal || 0) - LineItemAmount;
      }
      if (LineItemAmount >= 0) {
        dataItem.inEdit = false;
        AddLineItem(dataItem);
      } else {
        showErrorNotification(
          "LineItem total amount should be lower than IHPO total"
        );
      }
    }
  };
  const update = (dataItem) => {
    if (dataItem?.reqDQuantity) {
      let LineItemAmount = 0;
      LineItemGriddata.map((item) => {
        if (item.reqDQuantity && item.reqDUnitPrice) {
          LineItemAmount =
            LineItemAmount +
            Number(item.reqDQuantity) * Number(item.reqDUnitPrice);
        }
      });
      if (ihpoRef.current?.ihpoPricing?.reqTotal) {
        LineItemAmount =
          (ihpoRef.current?.ihpoPricing?.reqTotal || 0) - LineItemAmount;
      }
      if (LineItemAmount >= 0) {
        dataItem.inEdit = false;
        EditLineItem(dataItem);
      } else {
        showErrorNotification(
          "LineItem total amount should be lower than IHPO total"
        );
      }
    }
  };

  const [visible, setVisible] = React.useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const [sacCode, setSacCode] = React.useState("");
  const getSacCode = (sAC) => {
    setSacCode(sAC);
    AdditionalformInit.sAC = sAC;

    AdditionalformInit.allowSubmit = true;
    setAdditonalFormInit({ ...AdditionalformInit });
    setAdditionalFormKey(AdditionalformKey + 1);

    let index = LineItemGriddata.findIndex((line) => line.id == SelectedBD.id);
    LineItemGriddata[index].sAC = sAC;
  };
  const [visibleIHPO, setVisibleIHPO] = React.useState(false);
  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };
  const [IHPOCode, setIHPOCode] = React.useState("");
  const getIHACCode = (ihac) => {
    setIHPOCode(ihac);
    AdditionalformInit.reqIHAC = ihac;

    AdditionalformInit.allowSubmit = true;
    setAdditonalFormInit(AdditionalformInit);
    setAdditionalFormKey(AdditionalformKey + 1);
    let index = LineItemGriddata.findIndex((line) => line.id == SelectedBD.id);
    LineItemGriddata[index].reqIHAC = ihac;
  };

  const [PODDList, setPODDList] = React.useState([]);
  const [POVal, setPOVal] = React.useState({});

  const SearchPO = async (searchText) => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrder + "?carryover=false",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setPODDList(data);
        poRef.current = data;
        poListRef.current = data;
      })
      .catch(() => { });
  };

  const [AdditionalformInit, setAdditonalFormInit] = useState({});
  const [formInit, setFormInit] = useState({});

  const SacpopupCommandCell = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = !dataItem[field] ? "" : dataItem[field];
    return (
      <td>
        {dataItem.inEdit ? (
          <div className="d-flex align-items-center border rounded-2 overflow-hidden bg-white">
            <Input
              onClick={() => handleSacDialog(dataItem)}
              id={"sAC"}
              name={"sAC"}
              disabled={!checkPrivialgeGroup("sacIHPOF", 2)}
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
                  AdditionalformInit.sAC = "";

                  AdditionalformInit.allowSubmit = true;
                  setAdditonalFormInit({ ...AdditionalformInit });
                  setAdditionalFormKey(AdditionalformKey + 1);

                  let index = LineItemGriddata.findIndex(
                    (line) => line.id == dataItem.id
                  );
                  LineItemGriddata[index].sAC = "";
                }}
              >
                <i
                  className="fa-solid fa-close"
                  style={{ color: "#999fa9" }}
                ></i>
              </div>
            )}
          </div>
        ) : (
          dataValue
        )}
      </td>
    );
  };

  const handleSacDialog = (data) => {
    setSelectedBD(data);
    setSacValue(data.sAC)
    setVisible(true);
  };

  const [SelectedBD, setSelectedBD] = useState();

  const IHACpopupCommandCell = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];

    return (
      <td>
        {dataItem.inEdit ? (
          <div className="d-flex align-items-center border rounded-2 overflow-hidden bg-white">
            <Input
              onClick={() => handleIHACDialog(dataItem)}
              id={"reqIHAC"}
              name={"reqIHAC"}
              disabled={!checkPrivialgeGroup("IHACIHPOF", 2)}
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
                  AdditionalformInit.reqIHAC = "";

                  AdditionalformInit.allowSubmit = true;
                  setAdditonalFormInit(AdditionalformInit);
                  setAdditionalFormKey(AdditionalformKey + 1);
                  let index = LineItemGriddata.findIndex(
                    (line) => line.id == dataItem.id
                  );
                  LineItemGriddata[index].reqIHAC = "";
                }}
              >
                <i
                  className="fa-solid fa-close"
                  style={{ color: "#999fa9" }}
                ></i>
              </div>
            )}
          </div>
        ) : (
          dataValue
        )}
      </td>
    );
  };
  const handleIHACDialog = (data) => {
    setSelectedBD(data);
    setIHacValue(data.reqIHAC);
    setVisibleIHPO(true);
  };
  const [VendorSearch, setVendorSearch] = useState("");
  React.useEffect(() => {
    const getData = setTimeout(() => {
      SearchVendor(VendorSearch);
    }, 1000);
    return () => clearTimeout(getData);
  }, [VendorSearch]);

  const onFilterChange = (event) => {
    let searchText = event.filter.value;
    setVendorSearch(searchText);
  };
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
  function getFileNameFromPath(path) {
    const parts = path.split(/[\\/]/);
    const filename = parts[parts.length - 1];
    return filename;
  }
  function DownloadDoc() {
    var base64String = docData.fileData;
    var filename = docData.fileName;
    if (base64String != "" && filename != "") {
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
  const [selectedIHPO, setSelectedIHPO] = useState("");

  const openDocumentPopup = () => {
    setSelectedIHPO("IHPO-" + IHPOForm?.ihpoNo);
    setDocumentPopupVisible(!DocumentPopupVisible);
  };
  const closeDocumentPopup = (flag) => {
    setDocumentPopupVisible(flag);
  };

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
    },
    {
      field: "countyPOPricing.poBalance",
      header: "Balance",
      width: "200px",
    },
    {
      field: "VendorName",
      header: "Vendor",
      width: "200px",
    },
    {
      field: "poDescription",
      header: "Description",
      width: "200px",
    },
  ]

  const PoDropDownCell = (props) => {
    const [poSearch, setPOSearch] = useState("");

    const { dataItem } = props;
    const handleChange = (e) => {
      props.dataItem.poid = e.target.value.id;
      setPOVal({ id: e.target.value.id, poNumber: e.target.value.poNumber });
    };
    let selectPoNumber = PODDList.find((x) => x.id == props.dataItem.poid);
    return dataItem.inEdit ? (
      <td>
        <MultiColumnComboBox
          textField="poNumber"
          dataItemKey="id"
          data={PODDList.filter((item) => item.poNumber.includes(poSearch)).sort((a, b) => {
            const isANumber = /^\d/.test(a["poNumber"]);
            const isBNumber = /^\d/.test(b["poNumber"]);

            if (isANumber && !isBNumber) return -1;
            if (!isANumber && isBNumber) return 1;

            return a["poNumber"].localeCompare(b["poNumber"]);
          }).map((item) => {
            const VendorName = item.countyPODetails?.vendor?.name || "" ;
            if (item.countyPOPricing) {
              return {
                ...item,
                VendorName,
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
                VendorName,
                countyPOPricing: {
                  poBalance: "$" + 0,
                  poAmount: "$" + 0
                }
              }
            }
          })}
          value={selectPoNumber}
          onChange={handleChange}
          disabled={!checkPrivialgeGroup("POnumberIHPOF", 2)}
          filterable={true}
          onFilterChange={(event) => {
            const value = event.filter.value
            setPOSearch(value)
          }}
          columns={poSearchColumn}

        />
      </td>
    ) : (
      <td>{selectPoNumber?.id != 0 && selectPoNumber?.poNumber}</td>
    );
  }

  const { checkPrivialgeGroup, loading, error } = usePrivilege('Approve IHPOs')
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
            Accounts Payable
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Approve IHPO
          </li>
        </ol>
      </nav>
      <div className="row mb-3">
        <div className="col-sm-8">
          <figure>
            <blockquote className="blockquote">
              <h1>Review IHPO</h1>
            </blockquote>
          </figure>
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
              onSubmit={IHPOformOnSubmit}
              initialValues={IHPOForm}
              key={formKey}
              render={(INFOformRender) => (
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
                          <Field
                            id={"Vendor"}
                            name={"Vendor"}
                            label={"Vendor*"}
                            textField="name"
                            dataItemKey="id"
                            component={FormDropDownList}
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
                            itemRender={itemRender}
                          />
                        )
                      ) : (
                        <div>
                          <span>Bill to</span>
                          <br></br>
                          <span>
                            {" "}
                            <b>{VendorVal.name}</b>
                          </span>
                          <br></br>
                          <span> {VendorVal.address1}</span>
                          <br></br>
                          <span> {VendorVal.address2}</span>
                          <br></br>
                          <span>
                            {" "}
                            {VendorVal?.city && <>{VendorVal?.city} ,</>}{" "}
                            {VendorVal?.state && <>{VendorVal?.state},</>}{" "}
                            {VendorVal?.zip && <>{VendorVal?.zip} </>}
                          </span>
                          <br></br>
                          <br></br>
                          <br></br>
                        </div>
                      )}
                      {ShowVendorform ? (
                        <div>
                          <Field
                            id={"shipTo"}
                            name={"shipTo"}
                            label={"Ship To"}
                            component={FormInput}
                            disabled={true}
                          />
                          <Field
                            id={"requestedBy"}
                            name={"requestedBy"}
                            label={"Requested By"}
                            component={FormInput}
                            disabled={true}
                          />
                          <Field
                            id={"attentionTo"}
                            name={"attentionTo"}
                            label={"Attention To"}
                            component={FormInput}
                            disabled={true}
                          />
                        </div>
                      ) : null}
                    </div>
                    {ShowVendorform ? (
                      <div style={{ width: "50%", padding: "20px" }}>
                        <Field
                          id={"ihpoNo"}
                          name={"ihpoNo"}
                          label={"IHPO Number"}
                          component={FormInput}
                          disabled={true}
                        />
                        <Field
                          id={"opendate"}
                          name={"opendate"}
                          label={"Open Date"}
                          component={FormDatePicker}
                          disabled={true}
                        />
                        <Field
                          id={"closeddate"}
                          name={"closeddate"}
                          label={"Closed Date"}
                          component={FormDatePicker}
                          disabled={true}
                        />
                        <Field
                          id={"totalamnt"}
                          name={"totalamnt"}
                          label={"Total"}
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
                          label={"Balance"}
                          format={"c"}
                          placeholder={"$ Enter Balance"}
                          component={FormNumericTextBox}
                          disabled={true}
                          step={0}
                          min={0}
                          spinners={false}
                        />
                        <Field
                          id={"justification"}
                          name={"justification"}
                          label={"Justification"}
                          component={FormTextArea}
                          maxlength={500}
                          autoSize={true}
                          disabled={true}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div
                    className="mb-4"
                    style={{ textAlign: "center", margin: "3px" }}
                  >
                    <Button
                      type={"submit"}
                      themeColor={"primary"}
                      disabled={!INFOformRender.allowSubmit}
                    >
                      Save IHPO
                    </Button>
                  </div>
                  {ShowVendorform ? (
                    <div>
                      <fieldset className="text-right-number">
                        <div className="row">
                          <div className="col-sm-3 d-flex">
                            <figure>
                              <legend>IHPO Documents</legend>
                            </figure>
                          </div>

                          <div className="col-sm-2">
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
                            ></Button>
                          </div>
                        </div>
                        <Grid
                          resizable={true}
                          data={LineItemGriddata}
                          onItemChange={itemChange}
                          editField={editField}
                          dataItemKey={"id"}
                          fixedScroll={"true"}
                        >
                          <GridColumn
                            field="reqDQuantity"
                            title="Quantity"
                            width={"120px"}
                          />
                          <GridColumn
                            field="reqDDescription"
                            title="Description"
                            width={"200px"}
                          />
                          <GridColumn
                            field="reqDUnitPrice"
                            title="Price"
                            width={"120px"}
                            editor="numeric"
                            format="{0:c2}"
                            headerClassName="header-right-align"
                            cell={ColumnFormCurrencyTextBox}
                          />
                          <GridColumn
                            field="reqDDiscount"
                            title="Discount"
                            width={"120px"}
                            editor="numeric"
                            format="{0:c2}"
                            headerClassName="header-right-align"
                            cell={ColumnFormCurrencyTextBox}
                          />
                          <GridColumn
                            field="reqDTotal"
                            title="Amount"
                            width={"120px"}
                            format="{0:c2}"
                            headerClassName="header-right-align"
                            cell={ColumnFormCurrencyTextBox}
                          />
                          <GridColumn
                            title="PO Number"
                            width={"230px"}
                            cell={PoDropDownCell}
                          />
                          <GridColumn
                            field="reqIHAC"
                            title="IHAC"
                            width={"200px"}
                            cell={IHACpopupCommandCell}
                          />
                          <GridColumn
                            field="sAC"
                            title="SAC"
                            width={"200px"}
                            cell={SacpopupCommandCell}
                          />
                          <GridColumn
                            cell={LineItemGridCommandCell}
                            width="400px"
                          />
                        </Grid>
                        <div>
                          {showAdditionalInfoDialog && (
                            <Dialog
                              width={500}
                              title={<span>Additional Info</span>}
                              onClose={handleAdditionalDialogClose}
                            >
                              <Form
                                onSubmit={AdditionalLineItem}
                                initialValues={AdditionalformInit}
                                key={AdditionalformKey}
                                ignoreModified={true}
                                render={(formRenderProps) => (
                                  <FormElement>
                                    <fieldset className={"k-form-fieldset"}>

                                      <div className="d-flex justify-content-between">
                                        <Field
                                          id={"reqReceive"}
                                          name={"reqReceive"}
                                          label={"Receive"}
                                          component={FormInput}
                                          wrapperstyle={{
                                            width: "50%",
                                            marginRight: "10px",
                                          }}
                                        />
                                        <Field
                                          id={"dateComplete"}
                                          name={"dateComplete"}
                                          label={"Date Complete"}
                                          component={FormDatePicker}
                                        />
                                      </div>

                                      <div className="k-form-buttons">
                                        <Button
                                          className="col-5"
                                          themeColor={"primary"}
                                          type={"submit"}
                                          disabled={
                                            !formRenderProps.allowSubmit
                                          }
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
                        </div>
                        <div>
                          {visible && (
                            <SacDialog
                              toggleDialog={toggleDialog}
                              getSacCode={getSacCode}
                              type={7}
                              SACValue={sacValue}
                            >
                              {" "}
                            </SacDialog>
                          )}
                          {visibleIHPO && (
                            <IHACDialog
                              toggleIHPODialog={toggleIHPODialog}
                              getIHACCode={getIHACCode}
                              forihpo={true}
                              forDeptIhpo={false}
                              type={7}
                              IHACValue={ihacValue}
                            >
                              {" "}
                            </IHACDialog>
                          )}
                          {DisapproveModal && (
                            <Dialog
                              width={500}
                              title={<span>Disapprove IHPO</span>}
                              onClose={handleDisaprroveDialogClose}
                            >
                              <Form
                                onSubmit={handleDisapprove}
                                initialValues={formInit}
                                key={AdditionalformKey}
                                render={(formRenderProps) => (
                                  <FormElement>
                                    <fieldset className={"k-form-fieldset"}>
                                      <Field
                                        id={"disapproveMemo"}
                                        name={"disapproveMemo"}
                                        label={"Disapprove Memo"}
                                        component={FormTextArea}
                                      />

                                      <div className="k-form-buttons">
                                        <Button
                                          className="col-5"
                                          themeColor={"primary"}
                                          type={"submit"}
                                          disabled={
                                            !formRenderProps.allowSubmit
                                          }
                                        >
                                          Disapprove
                                        </Button>

                                        <Button
                                          className="col-5"
                                          onClick={handleDisaprroveDialogClose}
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
                      </fieldset>
                      <br></br>
                      <p style={{ textAlign: "center", margin: "3px" }}>
                        <Button
                          type="button"
                          className="me-3"
                          themeColor={"primary"}
                          disabled={!LineItemGriddata.length}
                          onClick={() => handleApprover("approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          themeColor={"danger"}
                          disabled={!LineItemGriddata.length}
                          onClick={() => handleApprover("disapprove")}
                        >
                          Disapprove
                        </Button>
                      </p>
                    </div>
                  ) : null}
                </FormElement>
              )}
            />
            {DocumentPopupVisible && (
              <DocumentPopup
                onclosePopup={closeDocumentPopup}
                selectedLineItemId={selectedIHPO}
                docTypeId={2}
                docNameDisabled={true}
              ></DocumentPopup>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
