import { Reveal } from "@progress/kendo-react-animation";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { GridColumn as Column, Grid } from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import {
  ExpansionPanel,
  ExpansionPanelContent,
} from "@progress/kendo-react-layout";
import React, { cloneElement, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import {
  InventoryEndPoints,
  PayrollEndPoints,
  PurchaseOrderEndPOints,
  VendorEndPoints,
  VoucherEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import MyCommandCell from "../cells/CommandCell";
import {
  ColumnFormCurrencyTextBox,
  FormAutoComplete,
  FormCheckbox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormNumericTextBox,
} from "../form-components";
import PurchaseOrderDialog from "../modal/PurchaseOrderDialog";
import SacDialog from "../modal/StateAccountCodeDialog";
import VoucherDialog from "../modal/VoucherDialog";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";
import {
  alphaNumericWithSpaceValidator,
  AssetValidator,
  nameWithSpaceANDUnderScoreValidator,
} from "../validators";

export default function AddAssets() {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setIsNewData] = useState(false);

  const minimumDate = new Date(1950, 0);
  const [dialogTitle, setDialogTitle] = useState();
  const [addAssetsVisible, setAddAssetsVisible] = useState(false);
  const [formInit, setFormInit] = useState({});
  const [vendorList, setVendorList] = useState([]);
  const [typeOfAssetList, setTypeOfAssetList] = useState([]);
  const [fundingList, setFundingList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [, setStateAccountNumberList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [responsibleList, setResponsibleList] = useState([]);
  const [expanded, setExpanded] = useState("Assets Info");
  const [usefulLife, setUsefulLife] = useState(null);
  const [costValue, setCostValue] = useState(null);
  const [dateReceived, setDateReceived] = useState(null);
  const [firstYearNotDepriaciated, setFirstYearNotDepriaciated] =
    useState(null);
  const [firstYearToDepreciate, setFirstYearToDepreciate] = useState(null);
  const [depreciationAmount, setDepreciationAmount] = useState();
  const [repValue, setRepValue] = useState("");
  const [salvageValue, setSalvageValue] = useState("");
  const [formKey, setFormKey] = useState(1);
  const [PoNumber, setPoNumber] = useState();
  const [poId, setPoId] = useState();
  const [requiredSelection, setRequiredSelection] = useState([]);

  const functionSetFormInit = async (data) => {
    if (data.poNO) {
      const tmpData = await setInitialPoNo(data);
      data.poNO = tmpData.poNO;
    }

    if (data.voucherNo) {
      const tmpData = await setInitialVoucherNo(data);
      data.voucherNo = tmpData.voucherNo;
    }
    data.program = data.assetLocation?.program
      ? programList.find((c) => c.id == data.assetLocation.program)
      : programList.find((c) => c.id == null);
    data.building = data.assetLocation?.building
      ? buildingList.find((c) => c.id == data.assetLocation.building)
      : buildingList.find((c) => c.id == null);
    data.area = data.assetLocation?.area
      ? areaList.find((c) => c.id == data.assetLocation.area)
      : areaList.find((c) => c.id == null);
    data.resPer = data.assetLocation?.resPer
      ? responsibleList.find((c) => c.id == data.assetLocation.resPer)
      : responsibleList.find((c) => c.id == null);
    data.category = null;
    data.supplier = data?.supplier
      ? vendorList.find((c) => c.id == data.supplier)
      : vendorList.find((c) => c.id == null);
    data.account = data.account ? data.account : "";
    data.dateReceived = data.dateReceived ? new Date(data.dateReceived) : "";
    data.dateRemoved = data.dateRemoved ? new Date(data.dateRemoved) : "";
    data.firstYearToDepreciate = data.firstYearToDepreciate
      ? new Date(data.firstYearToDepreciate)
      : null;
    data.firstYearNotDepriaciated = data.firstYearNotDepriaciated
      ? new Date(data.firstYearNotDepriaciated)
      : null;
    data.poDate = data.poDate ? new Date(data.poDate) : "";
    data.voucherDate = data.voucherDate ? new Date(data.voucherDate) : "";
    data.assetLocationId = data.assetLocation?.id;
    data.assetType = data.assetType
      ? typeOfAssetList.find((c) => c.id == data.assetType)
      : "";
    data.funding = data.funding
      ? fundingList.find((c) => c.id == data.funding)
      : fundingList.find((c) => c.id == null);
    let usefulLife = parseInt(data.usefulLife);

    var firstYearNotDepriaciated = new Date(data.dateReceived);

    data.firstYearNotDepriaciated = addYears(
      firstYearNotDepriaciated,
      usefulLife
    );

    return data;
  };

  const separateByTypeName = (arr) => {
    return arr.reduce((acc, obj) => {
      if (!acc[obj.typename]) {
        acc[obj.typename] = [];
      }
      acc[obj.typename].push(obj);
      return acc;
    }, {});
  };
  const getAssetsLookup = async () => {
    return axiosInstance({
      method: "GET",
      url: InventoryEndPoints.AssetLookup,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;

        const sortData = separateByTypeName(data);

        setTypeOfAssetList(sortData["Asset Type"]);

        if (sortData["Asset Funding"] && sortData["Asset Funding"].length) {
          setFundingList([
            {
              id: null,
              name: "Select Asset Funding",
            },
            ...sortData["Asset Funding"],
          ]);
        }

        if (sortData["Building"] && sortData["Building"].length) {
          setBuildingList([
            {
              id: null,
              name: "Select Building",
            },
            ...sortData["Building"],
          ]);
        }

        if (sortData["Program"] && sortData["Program"].length) {
          setProgramList([
            {
              id: null,
              name: "Select Program",
            },
            ...sortData["Program"],
          ]);
        }

        if (sortData["Area"] && sortData["Area"].length) {
          setAreaList([
            {
              id: null,
              name: "Select Area",
            },
            ...sortData["Area"],
          ]);
        }
      })
      .catch(() => { });
  };

  const [assetsSac, setAssetsSac] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    firstLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstLoad = async () => {
    await Promise.allSettled([
      getVendor(),
      getResPersonList(),
      getAssetsLookup(),
    ]).finally(() => {
      setIsLoading(false);
    });
  };
  useEffect(() => {
    if (!isLoading) {
      const tmpData = [];

      if (!typeOfAssetList || (typeOfAssetList && !typeOfAssetList.length)) {
        tmpData.push("Type Of Assets");
      }

      if (!fundingList || (fundingList && !fundingList.length)) {
        tmpData.push("Funding");
      }

      if (!programList || (programList && !programList.length)) {
        tmpData.push("Program");
      }

      if (!buildingList || (buildingList && !buildingList.length)) {
        tmpData.push("Building");
      }

      if (!areaList || (areaList && !areaList.length)) {
        tmpData.push("Area");
      }

      if (!responsibleList || (responsibleList && !responsibleList.length)) {
        tmpData.push("Responsible");
      }

      if (tmpData && !tmpData.length) {
        const dataa = location.state;
        editFunction(dataa);
      } else {
        setRequiredSelection(tmpData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const setInitialPoNo = async (data) => {
    return await axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrder + `/${data.poNO}`,
      withCredentials: false,
    })
      .then((response) => {
        let da1ta = response.data;
        setPOVal(da1ta);
        setPoId(da1ta.id);
        data.poNO = da1ta.poNumber;
        return data;
      })
      .catch(() => { });
  };

  const setInitialVoucherNo = async (data) => {
    return await axiosInstance({
      method: "GET",
      url: VoucherEndPoints.GetVoucher + `/${data.voucherNo}`,
      withCredentials: false,
    })
      .then((response) => {
        let da1ta = response.data;
        setVoucherVal(da1ta);
        setVoucherId(da1ta.id);
        data.voucherNo = da1ta.voucherVouchNo;
        return data;
      })
      .catch(() => { });
  };

  const editFunction = async (data) => {
    if (data && data.id !== 0) {
      switch (data.action) {
        case "edit":
          if (formInit?.id) {
            return;
          }
          await firstLoad();

          axiosInstance({
            method: "GET",
            url: InventoryEndPoints.Inventory.replace("#InventoryId#", data.id),
            withCredentials: false,
          })
            .then(async (response) => {
              let data = response.data;

              data = await functionSetFormInit(data);
              setFormInit(data);
              setFormKey(formKey + 1);
              setDialogTitle("Edit Assets");
              setAddAssetsVisible(true);
              setDepreciationAmount(data.depreciationAmount);
              setRepValue(data.repValue);
              setSalvageValue(data.salvageValue);
              setFirstYearNotDepriaciated(
                new Date(data.firstYearNotDepriaciated)
              );
              setFirstYearToDepreciate(new Date(data.firstYearToDepreciate));
              getAssetSACAmount(data);
            })
            .catch(() => { });
          break;
        default:
      }
    } else {
      setAddAssetsVisible(true);
      setDialogTitle("Add Assets");
      setFormInit({});
      setFormKey(formKey + 1);
    }
  };

  const getVendor = async () => {
    return axiosInstance({
      url: VendorEndPoints.VendorFilter + "?isActive=Y&vendorType=vendor&name=",
      withCredentials: false,
      method: "POST",
    })
      .then((response) => {
        let data = response.data.data;
        setVendorList([
          {
            id: null,
            name: "Select Vendor",
          },
          ...data,
        ]);
      })
      .catch(() => { });
  };

  const getResPersonList = async () => {
    return axiosInstance({
      method: "GET",
      url: PayrollEndPoints.Employee,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        if (data && data.length) {
          setResponsibleList([
            {
              id: null,
              name: "Select Responsible Person",
            },
            ...data.map((item) => {
              return {
                name: item.displayName,
                id: item.id,
              };
            }),
          ]);
        }
      })
      .catch(() => { });
  };

  const handleUsefulLifeChange = (formRenderProps, text, event) => {
    let usefulLife = formRenderProps.valueGetter("usefulLife");
    let value = formRenderProps.valueGetter("cost");
    let dateReceived = formRenderProps.valueGetter("dateReceived");
    setUsefulLife(usefulLife);
    setCostValue(value);
    setDateReceived(dateReceived);
    if (dateReceived && usefulLife) {
      var firstYearNotDepriaciated = new Date(dateReceived);
      var firstYearToDepreciate = new Date(dateReceived);
      usefulLife = parseInt(usefulLife);
      let firstYearNotDepr = addYears(firstYearNotDepriaciated, usefulLife);
      setFirstYearNotDepriaciated(firstYearNotDepr);
      let firstYearToDepr = addYears(firstYearToDepreciate, 1);
      setFirstYearToDepreciate(firstYearToDepr);
    }
    if (usefulLife && value) {
      usefulLife = parseInt(usefulLife);
      value = parseInt(value);
      let salvageValue = (value / 100) * 10;
      let replacementValue = salvageValue + value;
      let depreciationAmount = (value - salvageValue) / usefulLife;
      setDepreciationAmount(depreciationAmount);
      setRepValue(replacementValue);
      setSalvageValue(salvageValue);
    }
  };

  const addYears = (date, years) => {
    date.setFullYear(date.getFullYear() + years);
    return date;
  };

  const viewpo = (formRenderProps) => {
    let poNUmber = formRenderProps.valueGetter("poNO");
    setPoNumber(poNUmber);
    if (!poNUmber) {
      return showErrorNotification("No PO is selected");
    }
    getPO();
    setPoId(POVal.id);
  };

  const getPO = () => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrder + "/" + poId,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        if (data.id) {
          togglePODialog();
        } else {
          showErrorNotification("Could not find PO to preview");
        }
      })
      .catch(() => { });
  };
  const viewVoucher = (formRenderProps) => {
    let voucherNo = formRenderProps.valueGetter("voucherNo");
    if (!voucherNo) {
      return showErrorNotification("No voucher is selected");
    }
    getVoucher();
    setVoucherId(VoucherVal.id);
  };

  const getVoucher = () => {
    axiosInstance({
      method: "GET",
      url: VoucherEndPoints.GetVoucher + "/" + VoucherId,
      withCredentials: false,
    })
      .then(async (response) => {
        let data = response.data;
        if (data.id) {
          toggleVoucherDialog();
        } else {
          showErrorNotification("Could not find voucher to preview");
        }
      })
      .catch(() => { });
  };

  const handleCancelClick = () => {
    navigate(
      "/assets"
    );
  };

  const addAssetsHandleSubmit = (formRenderProps, next) => {
    const values = {
      description: formRenderProps.valueGetter("description"),
      cost: formRenderProps.valueGetter("cost"),
      usefulLife: formRenderProps.valueGetter("usefulLife"),
      dateReceived: formRenderProps.valueGetter("dateReceived"),
      assetType: formRenderProps.valueGetter("assetType"),
      disposalVendor: formRenderProps.valueGetter("disposalVendor"),
      manufacturer: formRenderProps.valueGetter("manufacturer"),
      modelNo: formRenderProps.valueGetter("modelNo"),
      serialNo: formRenderProps.valueGetter("serialNo"),
      comments: formRenderProps.valueGetter("comments"),
      color: formRenderProps.valueGetter("color"),
      size: formRenderProps.valueGetter("size"),
      countyNo: formRenderProps.valueGetter("countyNo"),
    };

    const error = customValidator(values);
    if (error) {
      return error;
    }
    let apirequest = {
      id: 0,
      orG_ID: 0,
      asset: formRenderProps.valueGetter("description"),
      assetType: formRenderProps.valueGetter("assetType")
        ? formRenderProps.valueGetter("assetType")?.id
        : null,
      funding: formRenderProps.valueGetter("funding")
        ? formRenderProps.valueGetter("funding")?.id
        : null,
      description: formRenderProps.valueGetter("description"),
      purchaseDate: null,
      usefulLife: usefulLife
        ? usefulLife
        : formRenderProps.valueGetter("usefulLife")
          ? formRenderProps.valueGetter("usefulLife")
          : null,
      cost: costValue
        ? costValue
        : formRenderProps.valueGetter("cost")
          ? formRenderProps.valueGetter("cost")
          : null,
      depreciationAmount: depreciationAmount
        ? depreciationAmount
        : formRenderProps.valueGetter("depreciationAmount")
          ? formRenderProps.valueGetter("depreciationAmount")
          : null,
      account: sacCode
        ? sacCode
        : formRenderProps.valueGetter("sacCode")
          ? formRenderProps.valueGetter("sacCode")
          : null,
      lastYearDepreciation: null,
      yearRemoved: null,
      propertyNo: "",
      serialNo: formRenderProps.valueGetter("serialNo")
        ? formRenderProps.valueGetter("serialNo")
        : null,
      location: null,
      inventoryNo: null,
      itemDescription: null,
      manufacturer: formRenderProps.valueGetter("manufacturer")
        ? formRenderProps.valueGetter("manufacturer")
        : null,
      supplier: formRenderProps.valueGetter("supplier")
        ? formRenderProps.valueGetter("supplier")?.id
        : null,
      color: formRenderProps.valueGetter("color")
        ? formRenderProps.valueGetter("color")
        : null,
      size: formRenderProps.valueGetter("size")
        ? formRenderProps.valueGetter("size")
        : null,
      modelNo: formRenderProps.valueGetter("modelNo")
        ? formRenderProps.valueGetter("modelNo")
        : null,
      voucherDate: formRenderProps.valueGetter("voucherDate")
        ? formRenderProps.valueGetter("voucherDate")
        : null,
      poNO: poId || null,
      voucherNo: VoucherId || null,
      poDate: formRenderProps.valueGetter("poDate")
        ? formRenderProps.valueGetter("poDate")
        : null,
      countyNo: formRenderProps.valueGetter("countyNo")
        ? formRenderProps.valueGetter("countyNo")
        : "",
      dateReceived: dateReceived
        ? dateReceived
        : formRenderProps.valueGetter("dateReceived")
          ? formRenderProps.valueGetter("dateReceived")
          : null,
      assetArea: 0,
      installOn: "",
      source: "",
      leased: formRenderProps.valueGetter("leased")
        ? formRenderProps.valueGetter("leased")
        : false,
      manual: true,
      originalDisk: true,
      diskOnSite: true,
      comCode: "",
      comments: formRenderProps.valueGetter("comments")
        ? formRenderProps.valueGetter("comments")
        : "",
      others: true,
      repValue: repValue
        ? repValue
        : formRenderProps.valueGetter("repValue")
          ? formRenderProps.valueGetter("repValue")
          : 0,
      memo: "",
      projectCas: "",
      inactive: "N",
      isActive: "Y",
      disposalVendor: formRenderProps.valueGetter("disposalVendor")
        ? formRenderProps.valueGetter("disposalVendor")
        : "",
      disposalPrice: formRenderProps.valueGetter("disposalPrice")
        ? formRenderProps.valueGetter("disposalPrice")
        : 0,
      assetFlag: true,
      salvageValue: salvageValue
        ? salvageValue
        : formRenderProps.valueGetter("salvageValue")
          ? formRenderProps.valueGetter("salvageValue")
          : null,
      invCatId: formRenderProps.valueGetter("category")
        ? formRenderProps.valueGetter("category")?.id
        : null,
      firstYearToDepreciate: firstYearToDepreciate
        ? firstYearToDepreciate
        : formRenderProps.valueGetter("firstYearToDepreciate")
          ? formRenderProps.valueGetter("firstYearToDepreciate")
          : null,
      firstYearNotDepriaciated: firstYearNotDepriaciated
        ? firstYearNotDepriaciated
        : formRenderProps.valueGetter("firstYearNotDepriaciated")
          ? formRenderProps.valueGetter("firstYearNotDepriaciated")
          : null,
      mrddNo: null,
      ciscoServiceId: 0,
      ciscoContract: null,
      ciscoExpirationDate: null,
      dateRemoved: formRenderProps.valueGetter("dateRemoved"),
      inventoryMemo: "test",
      assetLocation: {
        id: formRenderProps.valueGetter("assetLocationId"),
        orG_ID: 0,
        assetId: 0,
        inventoryNo: formRenderProps.valueGetter("inventoryNo"),
        program: formRenderProps.valueGetter("program")
          ? formRenderProps.valueGetter("program").id
          : null,
        building: formRenderProps.valueGetter("building")
          ? formRenderProps.valueGetter("building").id
          : null,
        area: formRenderProps.valueGetter("area")
          ? formRenderProps.valueGetter("area").id
          : null,
        resPer: formRenderProps.valueGetter("resPer")
          ? formRenderProps.valueGetter("resPer").id
          : null,
        installedOn: "",
      },
    };

    if (formRenderProps.valueGetter("id")) {
      apirequest.id = formRenderProps.valueGetter("id");
      axiosInstance({
        method: "PUT",
        url: InventoryEndPoints.Inventory.replace(
          "#InventoryId#",
          formRenderProps.valueGetter("id")
        ),
        data: apirequest,
        withCredentials: false,
      })
        .then(async (response) => {
          let data = response.data;

          data = await functionSetFormInit(data);
          setFormInit(data);
          getAssetSACAmount(response.data);
          if (next == "exit") {
            navigate(
              "/assets"
            );
          } else {
            setExpanded(next);
          }
        })
        .catch(() => { });
    } else {
      axiosInstance({
        method: "POST",
        url: InventoryEndPoints.Inventory,
        data: apirequest,
        withCredentials: false,
      })
        .then(async (response) => {
          if (response.data.id) {
            let data = response.data;
            setIsNewData(true);
            data = await functionSetFormInit(data);
            setFormInit(data);
            setFormKey(formKey + 1);
            getAssetSACAmount(response.data);
            if (next == "exit") {
            } else {
              setExpanded(next);
            }
          }
        })
        .catch(() => { });
    }
  };

  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };
  const [visiblePO, setVisiblePO] = useState(false);
  const togglePODialog = () => {
    setVisiblePO(!visiblePO);
  };
  const [visibleVoucher, setVisibleVoucher] = useState(false);
  const toggleVoucherDialog = () => {
    setVisibleVoucher(!visibleVoucher);
  };

  const [sacCode, setSacCode] = useState("");
  const getSacCode = (sac) => {
    setSacCode(sac);

    let index = assetsSac.findIndex((sac) => sac.id == SelectedSac.id);
    assetsSac[index].sac = sac;
  };

  const getAssetSACAmount = (data) => {
    axiosInstance({
      method: "GET",
      url: InventoryEndPoints.GetAssetSACAmountByAssetId + "/" + data.id,
      withCredentials: false,
    })
      .then((response) => {
        let result = response.data;
        let amount = 0;
        result.map((sac) => {
          amount += sac.amount;
          return sac;
        });

        if (data.depreciationAmount > amount) {
          setStateAccountNumberList(result);
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            id: 0,
            amount: data.depreciationAmount - amount,
          };
          setAssetsSac([...result, newDataItem]);
        } else {
          setAssetsSac(result);
        }
      })
      .catch(() => { });
  };
  const addAssetSac = (data, id) => {
    let apirequest = {
      id: 0,
      orG_ID: 0,
      sac: data.sac,
      amount: data.amount,
      depDate: null,
      assetId: id,
      lastYearDept: null,
      yearRemoved: null,
    };
    axiosInstance({
      method: "POST",
      url: InventoryEndPoints.AssetSACAmount,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        getAssetSACAmount(formInit);
        setSacCode();
      })
      .catch(() => { });
  };
  const editAssetSac = (data) => {
    let apirequest = {
      id: data.id,
      orG_ID: 0,
      sac: data.sac,
      amount: data.amount,
      depDate: data.depDate,
      assetId: data.assetId,
      lastYearDept: data.lastYearDept,
      yearRemoved: data.yearRemoved,
    };
    axiosInstance({
      method: "PUT",
      url: InventoryEndPoints.AssetSACAmount + "/" + data.id,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        getAssetSACAmount(formInit);
        setSacCode();
      })
      .catch(() => { });
  };
  const deleteAssetSac = (data) => {
    axiosInstance({
      method: "DELETE",
      url: InventoryEndPoints.AssetSACAmount + "/" + data.id,
      withCredentials: false,
    })
      .then((response) => {
        getAssetSACAmount(formInit);
      })
      .catch(() => { });
  };

  const editField = "inEdit";

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      remove={remove}
      discard={discard}
      update={update}
      add={add}
      cancel={cancel}
      editField={editField}
    />
  );
  const enterEdit = (dataItem) => {
    setSacCode(dataItem.sac);
    let newData = assetsSac.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    setAssetsSac(newData);
  };
  const discard = (dataItem) => {
    const newData = [...assetsSac];
    newData.splice(0, 1);
    setAssetsSac(newData);
  };
  const cancel = (dataItem) => {
    if (dataItem.id) {
      let newData = assetsSac.map((item) =>
        item.id == dataItem.id
          ? {
            ...item,
            inEdit: false,
          }
          : item
      );
      setAssetsSac(newData);
    }
  };
  const itemChange = (event) => {
    const field = event.field || "";
    event.sac = sacCode;
    const newData = assetsSac.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [field]: event.value,
        }
        : item
    );
    setAssetsSac(newData);
  };

  const remove = (dataItem) => {
    if (formInit.id) {
      deleteAssetSac(dataItem);
    } else {
      let index = assetsSac.findIndex((sac) => sac.id == dataItem.id);
      if (index !== -1) {
        const newData = [...assetsSac];
        newData.splice(index, 1);
        setAssetsSac(newData);
      }
    }
  };

  const update = (dataItem) => {
    let isNotValid = false;
    if (dataItem.sac) {
      const tmpData = dataItem.sac.split("-");
      if (tmpData.length !== 3) {
        isNotValid = true;
      }
      for (let i = 0; i < tmpData.length; i++) {
        if (!tmpData[i].length) {
          isNotValid = true;
        }
      }
    }
    if (!dataItem.sac || isNotValid) {
      showErrorNotification("Please add/correct state account number");
      return;
    }
    if (formInit?.id) {
      editAssetSac(dataItem);
    } else {
      dataItem.inEdit = false;
      const index = assetsSac.findIndex((record) => record.id == dataItem.id);
      assetsSac[index] = dataItem;
      let amount = 0;
      assetsSac.map((sac) => {
        amount += sac.amount;
        return sac;
      });

      if (formInit.depreciationAmount > amount) {
        const newDataItem = {
          inEdit: true,
          Discontinued: false,
          id: 0,
          amount: formInit.depreciationAmount - amount,
        };
        setAssetsSac([...assetsSac, newDataItem]);
      } else {
        setAssetsSac(assetsSac);
      }
    }
  };
  const add = (dataItem) => {
    let isNotValid = false;
    if (dataItem.sac) {
      const tmpData = dataItem.sac.split("-");
      if (tmpData.length !== 3) {
        isNotValid = true;
      }
      for (let i = 0; i < tmpData.length; i++) {
        if (!tmpData[i].length) {
          isNotValid = true;
        }
      }
    }
    if (!dataItem.sac || isNotValid) {
      showErrorNotification("Please add/correct state account number");
      return;
    }

    let amount = 0;

    assetsSac.map((sac) => {
      amount += Number(sac.amount);
      return sac;
    });
    let depreciation = formInit.depreciationAmount || depreciationAmount;
    let remainingAmount = Number(depreciation) - Number(amount);

    if (remainingAmount >= 0) {
      if (formInit?.id) {
        addAssetSac(dataItem, formInit?.id);
      } else {
        dataItem.inEdit = false;
        dataItem.id = assetsSac.length + 1;
        dataItem.sac = sacCode;

        let amount = 0;
        assetsSac.map((sac) => {
          amount += sac.amount;
          return sac;
        });
        let depreciation = formInit.depreciationAmount || depreciationAmount;
        if (depreciation > amount) {
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            id: 0,
            amount: depreciation - amount,
          };
          setAssetsSac([...assetsSac, newDataItem]);
        } else {
          setAssetsSac(assetsSac);
        }

        setSacCode();
      }
    } else {
      showErrorNotification(
        "Total amount cant be greater than depreciated amount"
      );
    }
  };

  const popupCommandCell = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];
    return (
      <td>
        {dataItem.inEdit ? (
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

                  let index = assetsSac.findIndex(
                    (sac) => sac.id == dataItem.id
                  );
                  assetsSac[index].sac = "";
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
  const [SelectedSac, setSelectedSac] = useState();
  const handleSacDialog = (data) => {
    setSelectedSac(data);
    setVisible(true);
  };
  const [sacVisible, setSacVisible] = useState(false);
  const toggleSacDialog = () => {
    setSacVisible(!sacVisible);
  };

  const [PODDList, setPODDList] = useState([]);
  const [POVal, setPOVal] = useState({});

  const itemRender = (li, itemProps) => {
    const itemChildren = (
      <div className="d-flex flex-column">
        <span
          style={{
            fontWeight: "bold",
          }}
        >
          {li.props.children}
        </span>
      </div>
    );
    return cloneElement(li, li.props, itemChildren);
  };

  const POddlOnChange = async (event) => {
    if (event.syntheticEvent.type == "click" && !event.target.value.length) {
      setPOVal({});
      setPoId(null);
    }
    if (event.syntheticEvent.type == "change") {
      const error = alphaNumericWithSpaceValidator(event.target.value);
      if (!error) {
        SearchPO(event.target.value);
      }
    } else {
      let poIndex = PODDList.findIndex(
        (x) => x.poNumber == event.target.value
      );
      if (poIndex >= 0) {
        setPOVal(PODDList[poIndex]);
        setPoId(PODDList[poIndex].id);
      }
    }
  };

  const SearchPO = (searchText) => {
    axiosInstance({
      method: "GET",
      url:
        PurchaseOrderEndPOints.GetPurchaseOrder + "?searchfilter=" + searchText,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setPODDList(data);
      })
      .catch(() => { });
  };
  const [VoucherList, setVoucherList] = useState([]);
  const [VoucherVal, setVoucherVal] = useState({});
  const [VoucherId, setVoucherId] = useState();
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Assets')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  const getVoucherList = (searchText) => {
    axiosInstance({
      method: "GET",
      url: VoucherEndPoints.GetVoucher + "?searchfilter=" + searchText,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setVoucherList(data);
      })
      .catch(() => { });
  };

  const VoucherddlOnChange = async (event) => {
    if (event.syntheticEvent.type == "click" && !event.target.value.length) {
      setVoucherVal({});
      setVoucherId(null);
    }
    if (event.syntheticEvent.type == "change") {
      const error = alphaNumericWithSpaceValidator(event.target.value);
      if (!error) {
        getVoucherList(event.target.value);
      }
    } else {
      let Index = VoucherList.findIndex(
        (x) => x.voucherVouchNo == event.target.value
      );
      if (Index >= 0) {
        setVoucherVal(VoucherList[Index]);
        setVoucherId(VoucherList[Index].id);
      }
    }
  };
  const customValidator = (values) => {
    let error1 = false;
    let error2 = {};
    if (
      !Object.keys(values).length ||
      (!values.description &&
        !values.cost &&
        !values.usefulLife &&
        !values.dateReceived &&
        values.dateReceived < minimumDate &&
        !values.assetType)
    ) {
      error1 = true;
      error2 = {
        VALIDATION_SUMMARY: "Please fill in required Fields.",
        description: "Asset is required.",
        cost: "Please Add Value",
        usefulLife: "Please Add Useful Life",
        dateReceived: "Date should be greater then 1st January 1950.",
        assetType: "Please select Asset Type.",
      };
    }

    if (!values.description) {
      error1 = true;
      error2 = {
        ...error2,
        VALIDATION_SUMMARY: "Please fill in required Fields.",
        description: "Asset is required.",
      };
    } else {
      const error = alphaNumericWithSpaceValidator(values.description);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          description: error,
        };
      }
    }
    if (!values.dateReceived || values.dateReceived < minimumDate) {
      error1 = true;
      error2 = {
        ...error2,
        VALIDATION_SUMMARY: "Please fill in required Fields.",
        dateReceived: "Date should be greater then 1st January 1950.",
      };
    }
    if (!values.assetType) {
      error1 = true;
      error2 = { ...error2, assetType: "Please select Asset Type." };
    }
    if (!values.cost) {
      error1 = true;
      error2 = {
        ...error2,
        VALIDATION_SUMMARY: "Please fill in required Fields.",
        cost: "Please Add Value",
      };
    }
    if (!values.usefulLife) {
      error1 = true;
      error2 = {
        ...error2,
        VALIDATION_SUMMARY: "Please fill in required Fields.",
        usefulLife: "Please Add Useful Life",
      };
    }

    if (values.disposalVendor) {
      const error = alphaNumericWithSpaceValidator(values.disposalVendor);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          disposalVendor: error,
        };
      }
    }

    if (values.manufacturer) {
      const error = alphaNumericWithSpaceValidator(values.manufacturer);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          manufacturer: error,
        };
      }
    }

    if (values.modelNo) {
      const error = nameWithSpaceANDUnderScoreValidator(values.modelNo);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          modelNo: error,
        };
      }
    }

    if (values.serialNo) {
      const error = nameWithSpaceANDUnderScoreValidator(values.serialNo);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          serialNo: error,
        };
      }
    }

    if (values.color) {
      const error = alphaNumericWithSpaceValidator(values.color);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          color: error,
        };
      }
    }

    if (values.size) {
      const error = alphaNumericWithSpaceValidator(values.size);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          size: error,
        };
      }
    }

    if (values.countyNo) {
      const error = alphaNumericWithSpaceValidator(values.countyNo);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          countyNo: error,
        };
      }
    }

    if (!error1) {
      return;
    } else {
      return error2;
    }
  };

  if (!isLoading && requiredSelection && requiredSelection.length) {
    return (
      <div className={"k-messagebox k-messagebox-error"}>
        Please proceed to setup Assets Lookup details, then you would be able to
        add assets
        {requiredSelection.map((item) => {
          return <li>{item}</li>;
        })}
      </div>
    );
  }

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Assets/Inventory
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Assets
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Add Assets
          </li>
        </ol>
      </nav>

      <figure>
        <blockquote className="title">
          <h2>{dialogTitle}</h2>
        </blockquote>
      </figure>

      {addAssetsVisible && (
        <Form
          width={600}
          initialValues={formInit}
          validator={customValidator}
          key={formKey}
          render={(formRenderProps) => {
            return (
              <div>
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <ExpansionPanel
                      title="Assets Info"
                      expanded={expanded == "Assets Info"}
                      tabIndex={0}
                      key="Assets Info"
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : "Assets Info");
                      }}
                    >
                      <Reveal>
                        {expanded == "Assets Info" && (
                          <ExpansionPanelContent>
                            <div onKeyDown={(e) => e.stopPropagation()}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"description"}
                                  name={"description"}
                                  label={"Asset*"}
                                  component={FormInput}
                                  validator={AssetValidator}
                                  wrapperstyle={{ width: "50%" }}
                                />
                                <Field
                                  id={"id"}
                                  name={"id"}
                                  component={FormInput}
                                  type={"hidden"}
                                />
                                <Field
                                  id={"assetLocationId"}
                                  name={"assetLocationId"}
                                  component={FormInput}
                                  type={"hidden"}
                                />
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"dateReceived"}
                                  name={"dateReceived"}
                                  label={"Date Received*"}
                                  component={FormDatePicker}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                  onChange={() =>
                                    handleUsefulLifeChange(
                                      formRenderProps,
                                      "firstYear"
                                    )
                                  }
                                  validator={(e) => {
                                    if (new Date(e) < minimumDate || !e) {
                                      return "Date should be greater then 1st January 1950.";
                                    }
                                  }}
                                />
                                <Field
                                  id={"assetType"}
                                  name={"assetType"}
                                  label={"Type Of Asset*"}
                                  textField="name"
                                  dataItemKey="id"
                                  component={FormDropDownList}
                                  data={typeOfAssetList}
                                  value={typeOfAssetList?.id}
                                  wrapperstyle={{
                                    width: "50%",
                                  }}
                                  validator={(e) => {
                                    if (!e) {
                                      return "Please select Asset Type";
                                    }
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
                                  id={"funding"}
                                  name={"funding"}
                                  label={"Funding"}
                                  textField="name"
                                  dataItemKey="id"
                                  component={FormDropDownList}
                                  data={fundingList}
                                  value={fundingList?.id}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                />
                                <Field
                                  id={"cost"}
                                  name={"cost"}
                                  label={"Value*"}
                                  component={FormNumericTextBox}
                                  wrapperstyle={{
                                    width: "50%",
                                  }}
                                  onChange={(event) =>
                                    handleUsefulLifeChange(
                                      formRenderProps,
                                      "value",
                                      event
                                    )
                                  }
                                  format={"c"}
                                  step={0}
                                  min={0}
                                  spinners={false}
                                  validator={(e) => {
                                    if (!e) {
                                      return "Please Add Value";
                                    }
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
                                  id={"usefulLife"}
                                  name={"usefulLife"}
                                  label={"Useful Life*"}
                                  component={FormNumericTextBox}
                                  onChange={() =>
                                    handleUsefulLifeChange(
                                      formRenderProps,
                                      "usefulLife"
                                    )
                                  }
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                  step={0}
                                  min={0}
                                  spinners={false}
                                  validator={(e) => {
                                    if (!e) {
                                      return "Please Add Useful Life";
                                    }
                                  }}
                                />
                                <div
                                  className="k-form-field"
                                  style={{ width: "50%" }}
                                >
                                  <Label>First Year To Depriaciate</Label>
                                  <div className={"k-form-field-wrap"}>
                                    <DatePicker
                                      style={{ height: "37px" }}
                                      placeholder=""
                                      value={firstYearToDepreciate}
                                      disabled={true}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div
                                  className="k-form-field"
                                  style={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                >
                                  <Label>First Year Not Depriaciated</Label>
                                  <div className={"k-form-field-wrap"}>
                                    <DatePicker
                                      style={{ height: "37px" }}
                                      placeholder=""
                                      value={firstYearNotDepriaciated}
                                      disabled={true}
                                    />
                                  </div>
                                </div>

                                <div
                                  className="k-form-field"
                                  style={{ width: "50%" }}
                                >
                                  <Label>Depreciation Amount</Label>
                                  <div className={"k-form-field-wrap"}>
                                    <Input
                                      style={{ height: "37px" }}
                                      type="text"
                                      value={depreciationAmount}
                                      disabled={true}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div
                                  className="k-form-field"
                                  style={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                >
                                  <Label>Replacement Value</Label>
                                  <div className={"k-form-field-wrap"}>
                                    <Input
                                      style={{ height: "37px" }}
                                      type="text"
                                      value={repValue}
                                      disabled={true}
                                    />
                                  </div>
                                </div>
                                <Field
                                  id={"disposalPrice"}
                                  name={"disposalPrice"}
                                  label={"Disposal Price"}
                                  component={FormNumericTextBox}
                                  wrapperstyle={{
                                    width: "50%",
                                  }}
                                  format={"c"}
                                  step={0}
                                  min={0}
                                  spinners={false}
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"disposalVendor"}
                                  name={"disposalVendor"}
                                  label={"Disposal Vendor"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                  validator={alphaNumericWithSpaceValidator}
                                />
                                <div
                                  className="k-form-field"
                                  style={{ width: "50%" }}
                                >
                                  <Label>Salvage Value</Label>
                                  <div className={"k-form-field-wrap"}>
                                    <Input
                                      style={{ height: "37px" }}
                                      type="text"
                                      value={salvageValue}
                                      disabled={true}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Field
                                  id={"dateRemoved"}
                                  name={"dateRemoved"}
                                  label={"Date Removed"}
                                  component={FormDatePicker}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                  // onChange={() =>
                                  //   handleUsefulLifeChange(
                                  //     formRenderProps,
                                  //     "firstYear"
                                  //   )
                                  // }
                                  // validator={(e) => {
                                  //   if (new Date(e) < minimumDate || !e) {
                                  //     return "Date should be greater then 1st January 1950.";
                                  //   }
                                  // }}
                                />
                              <div
                                className="k-form-buttons"
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Button
                                  className="col-6"
                                  type={"button"}
                                  onClick={handleCancelClick}
                                >
                                  Cancel
                                </Button>

                                {dialogTitle == "Edit Assets" ? (
                                  <>
                                    {checkPrivialgeGroup("EditAssetsCM", 3) && (
                                      <>
                                        <Button
                                          className="col-6"
                                          themeColor={"primary"}
                                          type={"submit"}
                                          onClick={() =>
                                            addAssetsHandleSubmit(
                                              formRenderProps,
                                              "Asset-Description"
                                            )
                                          }
                                        >
                                          Next
                                        </Button>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {checkPrivialgeGroup("AddAssetsB", 2) && (
                                      <>
                                        <Button
                                          className="col-6"
                                          themeColor={"primary"}
                                          type={"submit"}
                                          onClick={() =>
                                            addAssetsHandleSubmit(
                                              formRenderProps,
                                              "Asset-Description"
                                            )
                                          }
                                        >
                                          Next
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </ExpansionPanelContent>
                        )}
                      </Reveal>
                    </ExpansionPanel>
                    <ExpansionPanel
                      title="State Account Code Breakdown"
                      disabled={!formInit?.id}
                      expanded={expanded == "Asset-Description"}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : "Asset-Description");
                      }}
                    >
                      <Reveal>
                        {expanded == "Asset-Description" && (
                          <ExpansionPanelContent>
                            <div onKeyDown={(e) => e.stopPropagation()}>
                              <div>
                                <Grid
                                  resizable={true}
                                  style={{
                                    height: "500px",
                                  }}
                                  data={assetsSac}
                                  dataItemKey={"id"}
                                  editField={editField}
                                  onItemChange={itemChange}
                                >
                                  <Column
                                    field="sac"
                                    title="State Account Number"
                                    cell={popupCommandCell}
                                  />
                                  <Column
                                    field="amount"
                                    title="Depreciation Amount"
                                    cell={ColumnFormCurrencyTextBox}
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
                                  />
                                  <Column
                                    cell={CommandCell}
                                    width="240px"
                                    filterable={false}
                                  />
                                </Grid>
                              </div>
                            </div>
                            <div
                              className="k-form-buttons"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                className="col-6"
                                type={"button"}
                                onClick={handleCancelClick}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="col-6"
                                themeColor={"primary"}
                                type={"button"}
                                onClick={() => setExpanded("PO-Voucher")}
                              >
                                Next
                              </Button>
                            </div>
                          </ExpansionPanelContent>
                        )}
                      </Reveal>
                    </ExpansionPanel>
                    <ExpansionPanel
                      title="PO/Voucher Info"
                      disabled={!formInit?.id}
                      expanded={expanded == "PO-Voucher"}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : "PO-Voucher");
                      }}
                    >
                      <Reveal>
                        {expanded == "PO-Voucher" && (
                          <ExpansionPanelContent>
                            <div onKeyDown={(e) => e.stopPropagation()}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div className="w-100 mb-2 me-2">
                                  <Field
                                    id={"poNO"}
                                    name={"poNO"}
                                    label={"PO Number"}
                                    textField="poNumber"
                                    dataItemKey="id"
                                    component={FormAutoComplete}
                                    data={PODDList}
                                    value={POVal}
                                    onChange={POddlOnChange}
                                    placeholder="Search PO Number..."
                                    itemRender={itemRender}
                                    wrapperstyle={{
                                      marginBottom: "10px",
                                    }}
                                    validator={
                                      nameWithSpaceANDUnderScoreValidator
                                    }
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      viewpo(formRenderProps);
                                    }}
                                  >
                                    View
                                  </Button>
                                </div>
                                <div className="w-100 mb-2">
                                  <Field
                                    id={"voucherNo"}
                                    name={"voucherNo"}
                                    label={"Voucher Number"}
                                    textField="voucherVouchNo"
                                    dataItemKey="id"
                                    component={FormAutoComplete}
                                    data={VoucherList}
                                    value={VoucherVal}
                                    onChange={VoucherddlOnChange}
                                    placeholder="Search Voucher Number..."
                                    itemRender={itemRender}
                                    wrapperstyle={{
                                      marginBottom: "10px",
                                    }}
                                    validator={
                                      nameWithSpaceANDUnderScoreValidator
                                    }
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      viewVoucher(formRenderProps);
                                    }}
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div
                              className="k-form-buttons"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                className="col-6"
                                type={"button"}
                                onClick={handleCancelClick}
                              >
                                Cancel
                              </Button>

                              {dialogTitle == "Edit Assets" ? (
                                <>
                                  {checkPrivialgeGroup("EditAssetsCM", 3) && (
                                    <>
                                      <Button
                                        className="col-6"
                                        themeColor={"primary"}
                                        type={"submit"}
                                        disabled={
                                          formRenderProps.visited &&
                                          formRenderProps.errors &&
                                          formRenderProps.errors
                                            .VALIDATION_SUMMARY
                                        }
                                        onClick={() =>
                                          addAssetsHandleSubmit(
                                            formRenderProps,
                                            "Details"
                                          )
                                        }
                                      >
                                        Next
                                      </Button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {checkPrivialgeGroup("AddAssetsB", 2) && (
                                    <>
                                      <Button
                                        className="col-6"
                                        themeColor={"primary"}
                                        type={"submit"}
                                        disabled={
                                          formRenderProps.visited &&
                                          formRenderProps.errors &&
                                          formRenderProps.errors
                                            .VALIDATION_SUMMARY
                                        }
                                        onClick={() =>
                                          addAssetsHandleSubmit(
                                            formRenderProps,
                                            "Details"
                                          )
                                        }
                                      >
                                        Next
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </ExpansionPanelContent>
                        )}
                      </Reveal>
                    </ExpansionPanel>
                    <ExpansionPanel
                      title="Details"
                      disabled={!formInit?.id}
                      expanded={expanded == "Details"}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : "Details");
                      }}
                    >
                      <Reveal>
                        {expanded == "Details" && (
                          <ExpansionPanelContent>
                            <div onKeyDown={(e) => e.stopPropagation()}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"manufacturer"}
                                  name={"manufacturer"}
                                  label={"Manufacturer"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                  validator={alphaNumericWithSpaceValidator}
                                />
                                <Field
                                  id={"supplier"}
                                  name={"supplier"}
                                  label={"Vendor"}
                                  textField="name"
                                  dataItemKey="id"
                                  component={FormDropDownList}
                                  data={vendorList}
                                  value={vendorList.id}
                                  wrapperstyle={{
                                    width: "50%",
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
                                  id={"modelNo"}
                                  name={"modelNo"}
                                  label={"Model Number"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                  validator={
                                    nameWithSpaceANDUnderScoreValidator
                                  }
                                />
                                <Field
                                  id={"serialNo"}
                                  name={"serialNo"}
                                  label={"Serial Number"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "50%",
                                  }}
                                  validator={
                                    nameWithSpaceANDUnderScoreValidator
                                  }
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"comments"}
                                  name={"comments"}
                                  label={"Comments"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                />
                                <Field
                                  id={"color"}
                                  name={"color"}
                                  label={"Color"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "50%",
                                  }}
                                  validator={alphaNumericWithSpaceValidator}
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"size"}
                                  name={"size"}
                                  label={"Size"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                  validator={alphaNumericWithSpaceValidator}
                                />
                                <Field
                                  id={"countyNo"}
                                  name={"countyNo"}
                                  label={"County Tag Number"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "50%",
                                  }}
                                  validator={alphaNumericWithSpaceValidator}
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"leased"}
                                  name={"leased"}
                                  label={"Leased"}
                                  component={FormCheckbox}
                                />
                              </div>
                            </div>
                            <div
                              className="k-form-buttons"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                className="col-6"
                                type={"button"}
                                onClick={handleCancelClick}
                              >
                                Cancel
                              </Button>

                              {dialogTitle == "Edit Assets" ? (
                                <>
                                  {checkPrivialgeGroup("EditAssetsCM", 3) && (
                                    <>
                                      <Button
                                        className="col-6"
                                        themeColor={"primary"}
                                        type={"submit"}
                                        disabled={
                                          formRenderProps.visited &&
                                          formRenderProps.errors &&
                                          formRenderProps.errors
                                            .VALIDATION_SUMMARY
                                        }
                                        onClick={() =>
                                          addAssetsHandleSubmit(
                                            formRenderProps,
                                            "location"
                                          )
                                        }
                                      >
                                        Next
                                      </Button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {checkPrivialgeGroup("AddAssetsB", 2) && (
                                    <>
                                      <Button
                                        className="col-6"
                                        themeColor={"primary"}
                                        type={"submit"}
                                        disabled={
                                          formRenderProps.visited &&
                                          formRenderProps.errors &&
                                          formRenderProps.errors
                                            .VALIDATION_SUMMARY
                                        }
                                        onClick={() =>
                                          addAssetsHandleSubmit(
                                            formRenderProps,
                                            "location"
                                          )
                                        }
                                      >
                                        Next
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </ExpansionPanelContent>
                        )}
                      </Reveal>
                    </ExpansionPanel>
                    <ExpansionPanel
                      title="Location"
                      disabled={!formInit?.id}
                      expanded={expanded == "location"}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : "location");
                      }}
                    >
                      <Reveal>
                        {expanded == "location" && (
                          <ExpansionPanelContent>
                            <div onKeyDown={(e) => e.stopPropagation()}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"program"}
                                  data={programList}
                                  textField="name"
                                  dataItemKey="id"
                                  name={"program"}
                                  label={"Program"}
                                  value={programList?.id}
                                  component={FormDropDownList}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                />
                                <Field
                                  id={"building"}
                                  name={"building"}
                                  label={"Building"}
                                  textField="name"
                                  dataItemKey="id"
                                  component={FormDropDownList}
                                  data={buildingList}
                                  value={buildingList?.id}
                                  wrapperstyle={{
                                    width: "50%",
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
                                  id={"area"}
                                  name={"area"}
                                  label={"Area"}
                                  textField="name"
                                  dataItemKey="id"
                                  component={FormDropDownList}
                                  data={areaList}
                                  value={areaList?.id}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                />
                                <Field
                                  id={"resPer"}
                                  name={"resPer"}
                                  label={"Responsible Person"}
                                  textField="name"
                                  dataItemKey="id"
                                  component={FormDropDownList}
                                  data={responsibleList}
                                  value={responsibleList?.id}
                                  wrapperstyle={{
                                    width: "50%",
                                  }}
                                />
                              </div>
                            </div>
                            <div
                              className="k-form-buttons"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                className="col-6"
                                type={"button"}
                                onClick={handleCancelClick}
                              >
                                Cancel
                              </Button>
                              {dialogTitle == "Edit Assets" ? (
                                <>
                                  {checkPrivialgeGroup("EditAssetsCM", 3) && (
                                    <>
                                      <Button
                                        className="col-6"
                                        themeColor={"primary"}
                                        type={"submit"}
                                        disabled={
                                          formRenderProps.visited &&
                                          formRenderProps.errors &&
                                          formRenderProps.errors
                                            .VALIDATION_SUMMARY
                                        }
                                        onClick={() =>
                                          addAssetsHandleSubmit(
                                            formRenderProps,
                                            "exit"
                                          )
                                        }
                                      >
                                        save
                                      </Button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {checkPrivialgeGroup("AddAssetsB", 2) && (
                                    <>
                                      <Button
                                        className="col-6"
                                        themeColor={"primary"}
                                        type={"submit"}
                                        disabled={
                                          formRenderProps.visited &&
                                          formRenderProps.errors &&
                                          formRenderProps.errors
                                            .VALIDATION_SUMMARY
                                        }
                                        onClick={() =>
                                          addAssetsHandleSubmit(
                                            formRenderProps,
                                            "exit"
                                          )
                                        }
                                      >
                                        save
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </ExpansionPanelContent>
                        )}
                      </Reveal>
                    </ExpansionPanel>
                  </fieldset>
                </FormElement>
              </div>
            );
          }}
        />
      )}
      {visible && (
        <SacDialog toggleDialog={toggleDialog} getSacCode={getSacCode} type={7}>
          {" "}
        </SacDialog>
      )}
      {visiblePO && (
        <PurchaseOrderDialog
          togglePODialog={togglePODialog}
          poNumber={PoNumber}
          poId={poId}
        >
          {" "}
        </PurchaseOrderDialog>
      )}
      {visibleVoucher && (
        <VoucherDialog
          toggleVoucherDialog={toggleVoucherDialog}
          voucherId={VoucherId}
        >
          {" "}
        </VoucherDialog>
      )}
      {sacVisible && (
        <SacDialog
          toggleDialog={toggleSacDialog}
          getSacCode={getSacCode}
          type={6}
        >
          {" "}
        </SacDialog>
      )}
    </>
  );
}
