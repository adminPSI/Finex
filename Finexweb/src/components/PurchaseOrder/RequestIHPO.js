import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import {
  downloadIcon,
  eyedropperIcon,
  trashIcon,
  uploadIcon,
} from "@progress/kendo-svg-icons";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import {
  AuthenticationEndPoints,
  ConfigurationEndPoints,
  IHPOEndPoints,
  UploadDocumentEndPoints,
  VendorEndPoints
} from "../../EndPoints";
import {
  ColumnFormCurrencyTextBox,
  ColumnFormIntegerTextBox,
  DescriptionCell100,
  FormCustomerWithVendorNoMultiColumnComboBox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormNumericTextBox,
  FormTextArea
} from "../form-components";
import AddNewVendor from "../modal/AddNewVendor";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import DocumentPopup from "../UploadFile/DocumentPopup";
import { supplierValidator } from "../validators";

const MyCommandCell = (props) => {
  const { dataItem } = props;
  const isNewItem = dataItem?.id == 0;

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

export default function RequestIHPO() {
  const [gridKey, setGridKey] = React.useState(0);

  const navigate = useNavigate();

  const [IHPOForm, setIHPOForm] = React.useState({});
  const [formKey, setFormKey] = React.useState(1);

  const [, setTemporaryPONumber] = useState("");
  const [ShowVendorOption, setShowVendorOption] = useState(true);
  const [ShowVendorDetail, setShowVendorDetail] = useState(false);
  const [ShowVendorform, setShowVendorform] = useState(true);
  const [, setAddInfo] = useState(false);
  const [IHPONumber, setIHPONumber] = useState();
  const [, setIHPOId] = useState();
  const [LineItemGriddata, setLineItemGriddata] = useState([]);
  const { state } = useLocation();
  const [isView, setIsView] = React.useState(false);
  const [docData, setDocData] = useState([]);
  const [IHPOdetail, setINPOdetail] = React.useState({});
  const vendorRef = useRef();
  const POBlanceRef = useRef();
  const ihpoRef = useRef();
  const IHPOBlanceRef = useRef();
  const FormRef = useRef();

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = React.useState(
    []
  );

  const handlePrivilageByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=Request IHPO`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => { });
  };

  const checkPrivialgeGroup = (resourcesKey, privilageId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilageId
    );
  };

  React.useEffect(() => {
    setPOSearch("");
    getIHACConfig();
    handlePrivilageByGroup();
    if (!state?.ihpoNumber) {
      getTemporaryPONumber();
    }
  }, []);

  React.useEffect(() => {
    if (state?.ihpoNumber) {
      commonFuction(state?.ihpoNumber, state?.ihpoId);
    }
    if (state?.type == "view") {
      setIsView(false);
    } else {
      setIsView(true);
    }
  }, [state]);

  const commonFuction = async (ihponumber, ihpoId) => {
    // SearchVendor("");
    await getIHPO(ihpoId);
    setIHPOId(ihpoId);
    setIHPONumber(ihponumber);
  };

  const getTemporaryPONumber = () => {
    axiosInstance({
      method: "GET",
      url: IHPOEndPoints.IHPOTemporary,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setTemporaryPONumber(data);
        setIHPOForm({
          ihpoNo: data,
          opendate: new Date(),
          totalamnt: 0,
        });
        setFormKey(formKey + 1);
      })
      .catch(() => { });
  };

  const getIHPO = async (IHPONumber) => {
    axiosInstance({
      method: "GET",
      url: IHPOEndPoints.IHPO + "/" + IHPONumber,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        setINPOdetail(data);
        ihpoRef.current = data;
        if (data.ihpoDetails?.reqVendor && data.ihpoDetails?.vendor?.name) {
          setVendorVal(data.ihpoDetails.vendor);
          setShowVendorDetail(true);
          setShowVendorOption(true);
          setShowVendorform(true);
        }
        let balance = await getIHPOBalance(data);
        let DisapproveMessages =
          data.ihpoApproval.length > 1
            ? data.ihpoApproval.sort(
              (a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate)
            )
            : data.ihpoApproval;
        let justification = data.inHousePoMemo || "";
        let reqStatusMessage = data.reqStatusMessage || "";
        let mergeMessage = reqStatusMessage
          ? justification.concat(" - ", reqStatusMessage)
          : justification;
        let mergeMessages = mergeMessage;
        DisapproveMessages.forEach((message) => {
          let disapproveMessage = message?.reqComment;
          if (disapproveMessage) {
            mergeMessages = mergeMessages.concat(" - ", disapproveMessage);
          }
        });
        let formData = {
          ihpoNo: data.reqNumber,
          Vendor: "",
          shipTo: data.shipTo,
          requestedBy: data.preparedBy,
          attentionTo: data.attenTo,
          totalamnt: data.ihpoPricing.reqTotal || 0,
          balance: balance || 0,
          opendate: new Date(data.reqDate),
          closeddate:
            data.reqDateComplete !== null
              ? new Date(data.reqDateComplete)
              : null,
          justification: mergeMessages !== undefined ? mergeMessages : "",
        };
        getDocuments("IHPO-" + state.ihpoNumber);
        setIHPOForm({ ...formData });
        setFormKey(formKey + 1);
        getLineITem(data.id);
      })
      .catch(() => { });
  };

  const getIHPOBalance = async (IHPO) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url:
          IHPOEndPoints.IHPOBalance +
          `?ihpoId=${IHPO.id}&amount=${IHPO.ihpoPricing.reqTotal}`,
        withCredentials: false,
      });

      let data = response.data;
      IHPOBlanceRef.current = data;

      return data;
    } catch (error) { }
  };

  const editIHPOForn = (dataItem, showMsg) => {
    const { status, statusMessage } = IHPOdetail;
    let apirequest = {
      ...IHPOdetail,
      id: ihpoRef.current.id,
      reqNumber: dataItem.ihpoNo,
      reqDate: dataItem.opendate,
      reqDateRequired: ihpoRef.current.reqDateRequired,
      reqDateComplete: dataItem.closeddate,
      reqCheck: ihpoRef.current.reqCheck,
      reqPONumber: "",
      complete: ihpoRef.current.complete,
      inHousePoMemo: dataItem.justification || "",
      reqPrint: ihpoRef.current.reqPrint,
      combine: ihpoRef.current.combine,
      reqIHPONo: ihpoRef.current.reqIHPONo,
      corrected: ihpoRef.current.corrected,
      address: ihpoRef.current.address,
      city: ihpoRef.current.city,
      state: ihpoRef.current.state,
      zip: ihpoRef.current.zip,
      attenTo: dataItem.attentionTo,
      preparedBy: dataItem.requestedBy,
      checkOut: ihpoRef.current.checkOut,
      checkOutByID: ihpoRef.current.checkOutByID,
      shipTo: dataItem.shipTo || "",
      ihpoDetails: {
        id: ihpoRef.current.ihpoDetails.id,
        reqID: ihpoRef.current.ihpoDetails.reqID,
        reqVendor: VendorVal.id,
        reqIHAC: ihpoRef.current.ihpoDetails.reqIHAC,
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
      ihpoApproval: null,
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
      status,
      statusMessage,
    };
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
      .then(async (response) => {
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

        let justification = data.inHousePoMemo || "";
        let reqStatusMessage = data.reqStatusMessage || "";
        let mergeMessage = justification.concat(" ", reqStatusMessage);
        let balance = await getIHPOBalance(data);
        let formData = {
          ihpoNo: data.reqNumber,
          reqPONumber: "",
          Vendor: "",
          shipTo: data.shipTo,
          requestedBy: data.preparedBy,
          attentionTo: data.attenTo,
          totalamnt: data.ihpoPricing.reqTotal || 0,
          balance: balance ? balance : 0,
          opendate: new Date(data.reqDate),
          closeddate:
            data.reqDateComplete !== null
              ? new Date(data.reqDateComplete)
              : null,
          justification: mergeMessage !== undefined ? mergeMessage : "",
        };
        setIHPOForm({ ...formData });
        setFormKey(formKey + 1);
        setPOVal(dataItem.reqPONumber);
        getLineITem(ihpoRef.current.id);
        setAddInfo(true);
        if (showMsg) {
          showSuccessNotification("Request IHPO saved successfully");
        }
      })
      .catch(() => { });
  };

  const IHPOformOnSubmit = (dataItem) => {
    let apirequest = {
      id: 0,
      reqNumber: dataItem.ihpoNo,
      reqDate: dataItem.opendate,
      reqDateRequired: null,
      reqDateComplete: null,
      reqCheck: false,
      reqPONumber: "",
      inHousePoMemo: dataItem.justification || "",
      reqPrint: false,
      combine: false,
      complete: false,
      reqIHPONo: "",
      corrected: false,
      address: "",
      city: "",
      state: "",
      zip: "",
      attenTo: dataItem.attentionTo,
      preparedBy: dataItem.requestedBy,
      checkOut: false,
      checkOutByID: 0,
      shipTo: dataItem.shipTo || "",
      workflowStepSeq: 0,
      statusMessage: "Pending",
      ihpoDetails: {
        id: 0,
        reqID: 0,
        reqVendor: VendorVal?.id,
        reqIHAC: "",
        deliverToID: 0,
        reqCatalogNo: "",
        pRno: 0,
        reqPrint: false,
        combine: false,
        whoID: 0,
        fiscalDate: null,
        superDate: null,
        reqRequestBy: "",
      },
      ihpoApproval: null,
      ihpoPricing: {
        id: 0,
        reqID: 0,
        reqTotal: 0,
        reqQuantity: "",
        reqDiscount: 0,
        reqTotalPrice: 0,
        reqUnitPrice: 0,
        reqBalance: 0,
      },
    };
    axiosInstance({
      method: "POST",
      url: IHPOEndPoints.IHPO,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setIHPONumber(dataItem.ihpoNo);
        ihpoRef.current = data;
        setINPOdetail(data);

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

        let justification = data.inHousePoMemo || "";
        let reqStatusMessage = data.reqStatusMessage || "";
        let mergeMessage = justification.concat(" ", reqStatusMessage);
        let formData = {
          ihpoNo: data.reqNumber,
          reqPONumber: "",
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
          justification: mergeMessage !== undefined ? mergeMessage : "",
        };
        setPOVal(data.reqPONumber);
        setIHPOForm({ ...formData });
        setFormKey(formKey + 1);

        getLineITem(data.id);
        setAddInfo(true);
        showSuccessNotification("Request IHPO saved successfully");
      })
      .catch(() => { });
  };

  const [CACDDList, setCACDDList] = React.useState([]);

  const [CACVal, setCACVal] = React.useState({
    value: {
      text: "Select County Expense Code",
      id: 0,
    },
  });
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

  const [POVal, setPOVal] = React.useState();
  const [showIHAC, setShowIHAC] = React.useState(false);
  const [VendorDDList, setVendorDDList] = React.useState([]);
  const [VendorVal, setVendorVal] = React.useState({});

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
  const handleApprover = () => {
    let apirequest = {
      id: 0,
      reqID: ihpoRef.current.id,
      reqApprovedRole: "USER",
      reqApprovedBy: 7,
      reqStatus: true,
      reqStatusMessage: "Pending",
      reqComment: "",
      reqApprovedDate: new Date(),
      selfApprove: checkPrivialgeGroup("SelfApprovelIHPOB", 1),
    };
    axiosInstance({
      method: "PUT",
      url: IHPOEndPoints.IHPOApproveStatus,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        showSuccessNotification("IHPO approval request sent successfully");
        NavigationTo();
      })
      .catch(() => { });
  };
  const NavigationTo = () => {
    if (state?.type == "edit") {
      navigate("/my-ihpo");
    } else {
      navigate("/purchaseorder");
    }
  };

  const getLineITem = (ihpoNo) => {
    axiosInstance({
      method: "GET",
      url: IHPOEndPoints.IHPOLineItem + "/" + ihpoNo,
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
        if (state?.type !== "view") {
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
      reqDDiscount: 0,
      reqDTotal: dataItem.reqDQuantity * dataItem.reqDUnitPrice,
      reqIHAC: "",
      balance: 0,
      po: ihpoRef.current.reqPONumber,
      complete: false,
      approvedBy: "",
      approvedDate: null,
      dateComplete: null,
      sac: "",
      voucherAmount: 0,
      lineDate: null,
      clientID: 0,
      fundingSourceID: 0,
      listOfOthersID: 0,
      categoryID: 0,
      serviceDate: null,
      unitDesc: dataItem.unitDesc,
      partNumber: dataItem.partNumber,
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
        let data = response.data;
        let LineItemAmount = 0;
        LineItemGriddata.map((item) => {
          LineItemAmount =
            LineItemAmount + item.reqDQuantity * item.reqDUnitPrice;
        });
        let formihpodata = {
          ihpoNo: IHPOForm.ihpoNo,
          reqPONumber: "",
          Vendor: "",
          shipTo: IHPOForm.shipTo,
          requestedBy: IHPOForm.requestedBy,
          attentionTo: IHPOForm.attentionTo,
          totalamnt: LineItemAmount || 0,
          balance: IHPOForm.balance || 0,
          opendate: IHPOForm.opendate,
          closeddate: IHPOForm.closeddate,
          justification: IHPOForm.justification,
        };
        editIHPOForn(formihpodata);
        showSuccessNotification("IHPO lineitem saved successfully");
      })
      .catch(() => { });
  };
  const EditLineItem = (dataItem) => {
    let apirequest = {
      id: dataItem.id,
      reqID: dataItem.reqID,
      reqDNumber: dataItem.reqDNumber,
      reqDQuantity: dataItem.reqDQuantity,
      reqDCatNo: dataItem.reqDCatNo,
      reqDDescription: dataItem.reqDDescription,
      reqDUnitPrice: dataItem.reqDUnitPrice,
      reqDDiscount: dataItem.reqDDiscount,
      reqDTotal: dataItem.reqDQuantity * dataItem.reqDUnitPrice,
      reqIHAC: dataItem.reqIHAC,
      balance: 0,
      po: dataItem.po,
      complete: false,
      approvedBy: "str",
      approvedDate: "2023-11-25T16:17:09.097Z",
      dateComplete: null,
      sac: dataItem.sac,
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
        let LineItemAmount = 0;
        LineItemGriddata.map((item) => {
          if (item.reqDQuantity && item.reqDUnitPrice) {
            LineItemAmount =
              LineItemAmount +
              Number(item.reqDQuantity) * Number(item.reqDUnitPrice);
          }
        });
        let formihpodata = {
          ihpoNo: IHPOForm.ihpoNo,
          reqPONumber: "",
          Vendor: "",
          shipTo: IHPOForm.shipTo,
          requestedBy: IHPOForm.requestedBy,
          attentionTo: IHPOForm.attentionTo,
          totalamnt: LineItemAmount || 0,
          balance: IHPOForm.balance || 0,
          opendate: IHPOForm.opendate,
          closeddate: IHPOForm.closeddate,
          justification: IHPOForm.justification,
        };
        editIHPOForn(formihpodata);
        showSuccessNotification("IHPO lineitem updated successfully");
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
        let index = LineItemGriddata.findIndex(
          (line) => line.id == dataItem.id
        );
        if (index > -1) {
          let gridData = [...LineItemGriddata];
          gridData.splice(index, 1);
          let LineItemAmount = 0;
          gridData.map((item) => {
            if (item.reqDQuantity && item.reqDUnitPrice) {
              LineItemAmount =
                LineItemAmount +
                Number(item.reqDQuantity) * Number(item.reqDUnitPrice);
            }
          });
          let formihpodata = {
            ihpoNo: IHPOForm.ihpoNo,
            reqPONumber: IHPOForm.reqPONumber,
            Vendor: "",
            shipTo: IHPOForm.shipTo,
            requestedBy: IHPOForm.requestedBy,
            attentionTo: IHPOForm.attentionTo,
            totalamnt: LineItemAmount || 0,
            balance: IHPOForm.balance || 0,
            opendate: IHPOForm.opendate,
            closeddate: IHPOForm.closeddate,
            justification: IHPOForm.justification,
          };
          editIHPOForn(formihpodata);
        }
        showSuccessNotification("IHPO lineitem delete successfully");
      })
      .catch(() => { });
  };

  const ChooseDiffCust = () => {
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
    getLineITem(ihpoRef.current.id);
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
  };
  const remove = (dataItem) => {
    deleteLineItem(dataItem);
  };
  const discard = (dataItem) => { };
  const add = (dataItem) => {
    if (dataItem?.reqDQuantity && dataItem?.reqDUnitPrice) {
      let LineItemAmount = 0;
      LineItemGriddata.map((item) => {
        LineItemAmount =
          LineItemAmount + item.reqDQuantity * item.reqDUnitPrice;
      });
      if (ihpoRef.current?.ihpoPricing?.reqTotal) {
        LineItemAmount =
          (ihpoRef.current?.ihpoPricing?.reqTotal || 0) - LineItemAmount;
      }
      dataItem.inEdit = false;
      AddLineItem(dataItem);
    }
  };
  const update = (dataItem) => {
    if (dataItem?.reqDQuantity && dataItem?.reqDUnitPrice) {
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
      EditLineItem(dataItem);
    }
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

  const handleFormSubmit = (dataItem) => {
    if (POBlanceRef.current < dataItem.totalamnt) {
      showErrorNotification(
        "Please select another PO as PO balance is less than IHPO amount"
      );
    }
    else {
      if (ihpoRef.current?.id) {
        editIHPOForn(dataItem, true);
      } else {
        IHPOformOnSubmit(dataItem);
      }
    }
    handleResetLineItemData();
  };

  const handleResetLineItemData = () => {
    let newData = LineItemGriddata.map((item) =>
      item.inEdit
        ? {
          Discontinued: false,
          id: 0,
          inEdit: true,
        }
        : item
    );
    setLineItemGriddata(newData);
    setGridKey(gridKey + 1);
  };

  const [showVendopDetail, setShowVendopDetail] = React.useState(false);

  const handleVendorDialogClose = () => {
    setShowVendopDetail(false);
  };
  const handlevendorDetail = (vendor) => {
    if (FormRef.current) {
      FormRef.current.onChange("Vendor", {
        name: "Vendor",
        touched: true,
        value: vendor,
      });
    }
    setVendorVal(vendor);
    setShowVendorDetail(true);
    setShowVendorOption(true);
    setShowVendorform(true);
  };

  const [VendorSearch, setVendorSearch] = useState("");
  React.useEffect(() => {
    const getData = setTimeout(() => {
      // if (VendorSearch)
        SearchVendor(VendorSearch);
    }, 1000);
    return () => clearTimeout(getData);
  }, [VendorSearch]);

  const [, setPOSearch] = useState("");

  const onFilterChange = (event) => {
    let searchText = event.filter.value;
    setVendorSearch(searchText);
  };
  const onPOFilterChange = (event) => {
    let searchText = event.filter.value;
    setPOSearch(searchText);
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
    setSelectedIHPO("IHPO-" + IHPOForm.ihpoNo);
    setDocumentPopupVisible(!DocumentPopupVisible);
  };
  const closeDocumentPopup = (flag) => {
    setDocumentPopupVisible(flag);
    getDocuments("IHPO-" + IHPONumber);
  };

  const getIHACConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/19",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setShowIHAC(value);
      })
      .catch(() => { });
  };

  return (
    <>
      {checkPrivialgeGroup("RequestIHPOM", 1) && (
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
                Request IHPO
              </li>
            </ol>
          </nav>
          <div className="row mb-3">
            <div className="col-sm-8">
              <figure>
                <blockquote className="blockquote">
                  <h1>
                    {!isView
                      ? "View IHPO"
                      : IHPONumber
                        ? "Edit Request IHPO"
                        : "Add Request IHPO"}
                  </h1>
                </blockquote>
              </figure>
            </div>
            <div className="col-sm-4 text-end">
              <Button themeColor={"primary"} onClick={() => NavigationTo()}>
                {state?.type == "edit" ? "Approve IHPO" : "PO Dashboard"}
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
                  ref={FormRef}
                  onSubmit={handleFormSubmit}
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
                                {isView && (
                                  <div style={{ textAlign: "center" }}>
                                    {checkPrivialgeGroup(
                                      "CreateIHPOVendorB",
                                      1
                                    ) && (
                                        <Button
                                          onMouseDown={() =>
                                            setShowVendopDetail(true)
                                          }
                                          themeColor={"primary"}
                                        >
                                          Create New Vendor
                                        </Button>
                                      )}
                                  </div>
                                )}
                              </div>
                            )
                          ) : (
                            <div className="d-flex justify-content-between align-items-end">
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
                                <span> {VendorVal?.address2}</span>
                                <br></br>
                                <span>
                                  {" "}
                                  {VendorVal?.city && (
                                    <>{VendorVal?.city} ,</>
                                  )}{" "}
                                  {VendorVal?.state && <>{VendorVal?.state},</>}{" "}
                                  {VendorVal?.zip && <>{VendorVal?.zip} </>}
                                </span>
                                <br></br>
                                {isView && (
                                  <a
                                    type="button"
                                    style={{ color: "blue" }}
                                    onClick={ChooseDiffCust}
                                  >
                                    Choose a different vendor
                                  </a>
                                )}
                              </div>
                              {isView && (
                                <div style={{ textAlign: "center" }}>
                                  <Button
                                    onMouseDown={() =>
                                      setShowVendopDetail(true)
                                    }
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
                                id={"attentionTo"}
                                name={"attentionTo"}
                                label={"Attention To"}
                                component={FormInput}
                                maxlength={50}
                                disabled={!isView}
                              />
                              <Field
                                id={"shipTo"}
                                name={"shipTo"}
                                label={"Ship To"}
                                component={FormInput}
                                maxlength={50}
                                disabled={!isView}
                              />
                              <Field
                                id={"requestedBy"}
                                name={"requestedBy"}
                                label={"Requested By"}
                                component={FormInput}
                                maxlength={50}
                                disabled={!isView}
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
                              disabled={!isView}
                            />
                            {IHPONumber ? (
                              <Field
                                id={"closeddate"}
                                name={"closeddate"}
                                label={"Closed Date"}
                                component={FormDatePicker}
                                disabled={!isView}
                              />
                            ) : null}
                            <Field
                              id={"totalamnt"}
                              name={"totalamnt"}
                              label={"Total Amount"}
                              format={"c2"}
                              placeholder={"$ Enter Amount"}
                              component={FormNumericTextBox}
                              step={0}
                              min={0}
                              spinners={false}
                              disabled={true}
                            />
                            {IHPONumber ? (
                              <Field
                                id={"balance"}
                                name={"balance"}
                                label={"Balance"}
                                format={"c2"}
                                placeholder={"$ Enter Balance"}
                                component={FormNumericTextBox}
                                disabled={true}
                                step={0}
                                min={0}
                                spinners={false}
                              />
                            ) :
                              null}
                            <Field
                              id={"justification"}
                              name={"justification"}
                              label={"Justification"}
                              component={FormTextArea}
                              maxlength={500}
                              // autoSize={true}
                              disabled={!isView}
                            />
                          </div>
                        ) : null}
                      </div>

                      {isView && (
                        <div
                          className="mb-4"
                          style={{ textAlign: "center", margin: "3px" }}
                        >
                          {checkPrivialgeGroup("CreateIHPOB", 2) && (
                            <Button
                              type={"submit"}
                              themeColor={"primary"}
                              disabled={!INFOformRender.allowSubmit}
                            >
                              {IHPONumber ? "Save " : "Create "}IHPO
                            </Button>
                          )}
                        </div>
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
                {IHPONumber ? (
                  <div>
                    <fieldset>
                      <div className="row">
                        <div className="col-sm-3 d-flex">
                          <figure>
                            <legend>IHPO Upload</legend>
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
                          {isView && (
                            <Button
                              themeColor="primary"
                              title="Upload"
                              onClick={openDocumentPopup}
                              svgIcon={uploadIcon}
                            ></Button>
                          )}
                        </div>
                      </div>
                      <Grid
                        resizable={true}
                        data={LineItemGriddata}
                        onItemChange={itemChange}
                        editField={editField}
                        dataItemKey={"id"}
                        key={gridKey}
                      >
                        <GridColumn
                          field="reqDQuantity"
                          title="Quantity*"
                          cell={ColumnFormIntegerTextBox}
                        />
                        <GridColumn field="unitDesc" title="Unit" />
                        <GridColumn field="partNumber" title="Part Number" />
                        {!isView && (
                          <GridColumn field="poNumber" title="PO Number" />
                        )}
                        {!isView && <GridColumn field="reqIHAC" title="IHAC" />}
                        {!isView && <GridColumn field="sAC" title="SAC" />}
                        <GridColumn
                          field="reqDDescription"
                          title="Description"
                          cell={DescriptionCell100}
                        />
                        <GridColumn
                          field="reqDUnitPrice"
                          title="Unit Price*"
                          editor="numeric"
                          format="{0:c2}"
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
                        <GridColumn
                          field="reqDTotal"
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
                          cell={(props) => (
                            <td className="!k-text-right">
                              $
                              {(
                                props.dataItem?.reqDQuantity *
                                props.dataItem?.reqDUnitPrice || 0
                              )
                                .toFixed(2)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") || 0}
                            </td>
                          )}
                        />
                        <GridColumn
                          field="balance"
                          title="Balance"
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
                          cell={(props) => (
                            <td className="!k-text-right">
                              $
                              {(
                                props.dataItem?.balance || 0
                              )
                                .toFixed(2)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") || 0}
                            </td>
                          )}
                        />

                        {isView && (
                          <GridColumn
                            cell={LineItemGridCommandCell}
                            width="240px"
                          />
                        )}
                      </Grid>
                      <div></div>
                    </fieldset>
                    <br></br>
                    {isView && (
                      <>
                        {checkPrivialgeGroup("SendApprovelIHPOB", 1) && (
                          <p style={{ textAlign: "center", margin: "3px" }}>
                            <Button
                              themeColor={"primary"}
                              disabled={LineItemGriddata.length < 2}
                              onClick={handleApprover}
                            >
                              Send for Approval
                            </Button>
                          </p>
                        )}
                        {checkPrivialgeGroup("SelfApprovelIHPOB", 1) && (
                          <p style={{ textAlign: "center", margin: "3px" }}>
                            <Button
                              themeColor={"primary"}
                              disabled={LineItemGriddata.length < 2}
                              onClick={handleApprover}
                            >
                              Send for Self Approval
                            </Button>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ) : null}
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
      )}
    </>
  );
}
