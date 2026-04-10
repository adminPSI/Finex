import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { cloneElement, useEffect, useRef, useState } from "react";
import {
  InventoryEndPoints,
  PayrollEndPoints,
  PurchaseOrderEndPOints,
  VendorEndPoints,
  VoucherEndPoints
} from "../../EndPoints";
import {
  FormAutoComplete,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormNumericTextBox,
} from "../form-components";
import {
  alphaNumericWithSpaceValidator,
  alphaNumericWithSpaceValidatorRequired,
  nameWithSpaceANDUnderScoreValidator,
} from "../validators";

import { Reveal } from "@progress/kendo-react-animation";
import { Button } from "@progress/kendo-react-buttons";
import {
  ExpansionPanel,
  ExpansionPanelContent,
} from "@progress/kendo-react-layout";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";

export default function AddInventory() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dialogTitle, setDialogTitle] = useState();
  const [addInventoryVisible, setAddInventoryVisible] = useState(false);
  const [formInit, setFormInit] = useState({});
  const [vendorList, setVendorList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [stateAccountNumberList, setStateAccountNumberList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [responsibleList, setResponsibleList] = useState([]);
  const [expanded, setExpanded] = useState("Inventory Info");
  const [, setIsNewData] = useState(false);
  const vendorRef = useRef([]);

  const [isLoading, setIsLoading] = useState(true);
  const [requiredSelection, setRequiredSelection] = useState([]);

  useEffect(() => {
    firstLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstLoad = async () => {
    await Promise.allSettled([
      getVendor(),
      getResPerson(),
      getAssetsLookup(),
      getAssetSACAmount(),
    ]).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (!isLoading) {
      const tmpData = [];

      if (!categoryList || (categoryList && !categoryList.length)) {
        tmpData.push("Category");
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
        tmpData.push("Responsible Person");
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
  const [PODDList, setPODDList] = useState([]);
  const [POVal, setPOVal] = useState({});
  const [poId, setPoId] = useState();

  const [VoucherList, setVoucherList] = useState([]);
  const [VoucherVal, setVoucherVal] = useState({});
  const [VoucherId, setVoucherId] = useState();

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
        if (sortData["Program"] && sortData["Program"].length) {
          setProgramList([
            {
              id: null,
              name: "Select Program",
            },
            ...sortData["Program"],
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

        if (sortData["Area"] && sortData["Area"].length) {
          setAreaList([
            {
              id: null,
              name: "Select Area",
            },
            ...sortData["Area"],
          ]);
        }

        if (
          sortData["Inventory Category"] &&
          sortData["Inventory Category"].length
        ) {
          setCategoryList([
            {
              id: null,
              name: "Select Inventory Category",
            },
            ...sortData["Inventory Category"],
          ]);
        }
      })
      .catch(() => { });
  };

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

  const functionSetFormInit = async (data) => {
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
    data.category = data?.invCatId
      ? categoryList.find((c) => c.id == data.invCatId)
      : categoryList.find((c) => c.id == null);
    data.supplier = data?.supplier
      ? vendorList.find((c) => c.id == data.supplier)
      : vendorList.find((c) => c.id == null);
    data.assetLocationId = data.assetLocation?.id;
    data.account = data.account
      ? stateAccountNumberList.find((c) => c.id == data.account)
      : 0;
    data.dateReceived = data.dateReceived ? new Date(data.dateReceived) : "";
    data.firstYearToDepreciate = data.firstYearToDepreciate
      ? new Date(data.firstYearToDepreciate)
      : "";
    data.dateRemoved = data.dateRemoved ? new Date(data.dateRemoved) : "";
    data.firstYearNotDepriaciated = data.firstYearNotDepriaciated
      ? new Date(data.firstYearNotDepriaciated)
      : "";
    data.poDate = data.poDate ? new Date(data.poDate) : "";
    data.voucherDate = data.voucherDate ? new Date(data.voucherDate) : "";

    if (data.poNO) {
      const tmpData = await setInitialPoNo(data);
      data.poNO = tmpData.poNO;
    }

    if (data.voucherNo) {
      const tmpData = await setInitialVoucherNo(data);
      data.voucherNo = tmpData.voucherNo;
    }
    return data;
  };

  const editFunction = (data) => {
    if (data && data.id !== 0) {
      switch (data.action) {
        case "edit":
          axiosInstance({
            method: "GET",
            url: InventoryEndPoints.Inventory.replace("#InventoryId#", data.id),
            withCredentials: false,
          })
            .then(async (response) => {
              let data = response.data;
              data = await functionSetFormInit(data);

              setFormInit(data);
              setDialogTitle("Edit Inventory");
              setAddInventoryVisible(true);
            })
            .catch(() => { });
          break;
        default:
      }
    } else {
      setAddInventoryVisible(true);
      setDialogTitle("Add Inventory");
      setFormInit({});
    }
  };
  const getVendor = async () => {
    return axiosInstance({
      method: "Post",
      url: VendorEndPoints.VendorFilter + "?isActive=Y&vendorType=vendor&name=",
      withCredentials: false,
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
        vendorRef.current = data;
      })
      .catch(() => { });
  };

  const getResPerson = async () => {
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

  const getAssetSACAmount = async () => {
    return axiosInstance({
      method: "GET",
      url: InventoryEndPoints.GetAssetSACAmount,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setStateAccountNumberList(data);
      })
      .catch(() => { });
  };

  const addInventoryToggleDialog = () => {
    navigate(
      "/inventory"
    );
  };
  const addInventoryHandleSubmit = (formRenderProps, next) => {
    const values = {
      inventoryNo: formRenderProps.valueGetter("inventoryNo"),
      description: formRenderProps.valueGetter("description"),
      manufacturer: formRenderProps.valueGetter("manufacturer"),
      countyNo: formRenderProps.valueGetter("countyNo"),
      modelNo: formRenderProps.valueGetter("modelNo"),
      serialNo: formRenderProps.valueGetter("serialNo"),
      inventoryMemo: formRenderProps.valueGetter("inventoryMemo"),
    };
    const error = customValidator(values);
    if (error) {
      return error;
    }
    let apirequest = {
      id: 0,
      orG_ID: 7,
      description: formRenderProps.valueGetter("description")
        ? formRenderProps.valueGetter("description")
        : "",
      purchaseDate: null,
      usefulLife: null,
      cost: formRenderProps.valueGetter("cost")
        ? formRenderProps.valueGetter("cost")
        : null,
      depreciationAmount: null,
      account: "",
      lastYearDepreciation: null,
      yearRemoved: null,
      propertyNo: null,
      serialNo: formRenderProps.valueGetter("serialNo")
        ? formRenderProps.valueGetter("serialNo")
        : null,
      location: "",
      inventoryNo: formRenderProps.valueGetter("inventoryNo"),
      itemDescription: formRenderProps.valueGetter("description")
        ? formRenderProps.valueGetter("description")
        : "",
      manufacturer: formRenderProps.valueGetter("manufacturer")
        ? formRenderProps.valueGetter("manufacturer")
        : null,
      supplier: formRenderProps.valueGetter("supplier")
        ? formRenderProps.valueGetter("supplier")?.id
        : null,
      color: null,
      size: null,
      modelNo: formRenderProps.valueGetter("modelNo")
        ? formRenderProps.valueGetter("modelNo")
        : null,
      voucherDate: null,
      poNO: poId || null,
      voucherNo: VoucherId || null,
      poDate: null,
      countyNo: formRenderProps.valueGetter("countyNo")
        ? formRenderProps.valueGetter("countyNo")
        : null,
      dateReceived: formRenderProps.valueGetter("dateReceived")
        ? formRenderProps.valueGetter("dateReceived")
        : null,
      assetType: null,
      assetArea: null,
      installOn: null,
      source: null,
      leased: null,
      manual: null,
      originalDisk: null,
      diskOnSite: null,
      comCode: null,
      comments: null,
      others: true,
      repValue: null,
      memo: null,
      projectCas: null,
      inactive: "N",
      isActive: "Y",
      disposalVendor: null,
      disposalPrice: null,
      assetFlag: false,
      salvageValue: null,
      invCatId: formRenderProps.valueGetter("category")
        ? formRenderProps.valueGetter("category")?.id
        : null,
      firstYearToDepreciate: null,
      mrddNo: "",
      ciscoServiceId: null,
      ciscoContract: "",
      ciscoExpirationDate: null,
      dateRemoved:  formRenderProps.valueGetter("dateRemoved")
      ? formRenderProps.valueGetter("dateRemoved")
      : null,
      inventoryMemo: formRenderProps.valueGetter("inventoryMemo")
        ? formRenderProps.valueGetter("inventoryMemo")
        : "",
      assetLocation: {
        id: formRenderProps.valueGetter("assetLocationId"),
        orG_ID: 7,
        assetId: 0,
        inventoryNo: formRenderProps.valueGetter("inventoryNo"),
        program: formRenderProps.valueGetter("program")
          ? formRenderProps.valueGetter("program")?.id
          : null,
        building: formRenderProps.valueGetter("building")
          ? formRenderProps.valueGetter("building")?.id
          : null,
        area: formRenderProps.valueGetter("area")
          ? formRenderProps.valueGetter("area")?.id
          : null,
        resPer: formRenderProps.valueGetter("resPer")
          ? formRenderProps.valueGetter("resPer")?.id
          : null,
        installedOn: null,
      },
    };

    if (formInit.id) {
      apirequest.id = formInit.id;
      axiosInstance({
        method: "PUT",
        url: InventoryEndPoints.Inventory.replace("#InventoryId#", formInit.id),
        data: apirequest,
        withCredentials: false,
      })
        .then(async (response) => {
          let data = response.data;

          data = await functionSetFormInit(data);
          setFormInit(data);
          if (next == "exit") {
            navigate(
              "/inventory"
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
            if (next == "exit") {
            } else {
              setExpanded(next);
            }
          }
        })
        .catch(() => { });
    }
  };

  const handleCancelClick = () => {
    navigate(
      "/inventory"
    );
  };

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
      const error = nameWithSpaceANDUnderScoreValidator(event.target.value);
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

  const VoucherddlOnChange = async (event) => {
    if (event.syntheticEvent.type == "click" && !event.target.value.length) {
      setVoucherVal({});
      setVoucherId(null);
    }
    if (event.syntheticEvent.type == "change") {
      const error = nameWithSpaceANDUnderScoreValidator(event.target.value);
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

  const customValidator = (values) => {
    let error1 = false;
    let error2 = {};

    if (
      !Object.keys(values).length ||
      (!values.inventoryNo && !values.description)
    ) {
      error1 = true;
      error2 = {
        VALIDATION_SUMMARY: "Please fill in required Fields.",
        inventoryNo: "Inventory Number is required.",
        description: "Description is required.",
      };
    }

    if (!values.inventoryNo) {
      error1 = true;
      error2 = {
        ...error2,
        VALIDATION_SUMMARY: "Please fill in required Fields.",
        inventoryNo: "Inventory Number is required.",
      };
    } else if (!values.inventoryNo.trim().length) {
      error1 = true;
      error2 = {
        ...error2,
        VALIDATION_SUMMARY: "Please fill in required Fields.",
        inventoryNo: "Inventory Number is required.",
      };
    } else {
      const error = alphaNumericWithSpaceValidator(values.inventoryNo);
      if (error) {
        error1 = true;
        // eslint-disable-next-line no-const-assign
        error2 = {
          ...error2,
          VALIDATION_SUMMARY: "Please Correct Fields.",
          inventoryNo: error,
        };
      }
    }

    if (!values.description) {
      error1 = true;
      error2 = {
        ...error2,
        description: "Description is required.",
      };
    } else if (!values.description.trim().length) {
      error1 = true;
      // eslint-disable-next-line no-const-assign
      error2 = {
        ...error2,
        description: "Description is required.",
      };
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
    if (!error1) {
      return;
    } else {
      return error2;
    }
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Inventory')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>

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
            Inventory
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Add Inventory
          </li>
        </ol>
      </nav>

      <div onClose={addInventoryToggleDialog}>
        <figure>
          <blockquote className="title">
            <h2>{dialogTitle}</h2>
          </blockquote>
        </figure>

        {addInventoryVisible && (
          <Form
            width={600}
            initialValues={formInit}
            validator={customValidator}
            formKey={1}
            render={(formRenderProps) => (
              <div>
                {" "}
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <ExpansionPanel
                      title="Inventory Info"
                      expanded={expanded == "Inventory Info"}
                      tabIndex={0}
                      key="Inventory Info"
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : "Inventory Info");
                      }}
                    >
                      <Reveal>
                        {expanded == "Inventory Info" && (
                          <ExpansionPanelContent>
                            <div onKeyDown={(e) => e.stopPropagation()}>
                              <div
                                className="k-w-full"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div className="k-w-full me-3">
                                  <Field
                                    id={"inventoryNo"}
                                    name={"inventoryNo"}
                                    label={"Inventory Number*"}
                                    component={FormInput}
                                    validator={
                                      alphaNumericWithSpaceValidatorRequired
                                    }
                                  />
                                  <Field
                                    id={"id"}
                                    name={"id"}
                                    component={FormInput}
                                    type={"hidden"}
                                  />
                                </div>
                                <div className="k-w-full">
                                  <Field
                                    id={"description"}
                                    name={"description"}
                                    label={"Inventory Description*"}
                                    component={FormInput}
                                  />
                                </div>
                              </div>
                              <div
                                className="k-w-full"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div className="k-w-full me-3">
                                  <Field
                                    id={"dateReceived"}
                                    name={"dateReceived"}
                                    label={"Date Received"}
                                    component={FormDatePicker}
                                  />
                                </div>
                                <div className="k-w-full">
                                  <Field
                                    id={"manufacturer"}
                                    name={"manufacturer"}
                                    label={"Manufacturer"}
                                    component={FormInput}
                                    validator={alphaNumericWithSpaceValidator}
                                  />
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
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
                                    marginRight: "10px",
                                  }}
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
                              </div>
                            </div>
                            <div
                              className="k-form-buttons"
                              style={{
                                display: "flex",
                                justifyContent: "flex-between",
                              }}
                            >
                              <Button
                                className="col-6"
                                type={"button"}
                                onClick={handleCancelClick}
                                style={{
                                  width: "49.5%",
                                }}
                              >
                                Cancel
                              </Button>
                              {dialogTitle == "Edit Inventory" ? (
                                <>
                                  {checkPrivialgeGroup(
                                    "EditInventoryCM",
                                    3
                                  ) && (
                                      <>
                                        <Button
                                          className="col-6"
                                          themeColor={"primary"}
                                          type={"submit"}
                                          style={{
                                            width: "49.5%",
                                            marginLeft: "5px",
                                          }}
                                          onClick={() =>
                                            addInventoryHandleSubmit(
                                              formRenderProps,
                                              "Inventory-Details"
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
                                  {checkPrivialgeGroup("AddInventoryB", 2) && (
                                    <>
                                      <Button
                                        className="col-6"
                                        themeColor={"primary"}
                                        type={"submit"}
                                        style={{
                                          width: "49.5%",
                                          marginLeft: "5px",
                                        }}
                                        onClick={() =>
                                          addInventoryHandleSubmit(
                                            formRenderProps,
                                            "Inventory-Details"
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
                      title="Inventory Details"
                      expanded={expanded == "Inventory-Details"}
                      disabled={!formInit?.id}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : "Inventory-Details");
                      }}
                    >
                      <Reveal>
                        {expanded == "Inventory-Details" && (
                          <ExpansionPanelContent>
                            <div onKeyDown={(e) => e.stopPropagation()}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Field
                                  id={"cost"}
                                  name={"cost"}
                                  label={"Cost"}
                                  component={FormNumericTextBox}
                                  step={0}
                                  min={0}
                                  spinners={false}
                                  format={"c"}
                                  wrapperstyle={{
                                    width: "50%",
                                    marginRight: "10px",
                                  }}
                                />
                                <Field
                                  id={"category"}
                                  name={"category"}
                                  label={"Category"}
                                  textField="name"
                                  dataItemKey="id"
                                  component={FormDropDownList}
                                  data={categoryList}
                                  value={categoryList?.id}
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
                                    width: "50%",
                                  }}
                                  validator={
                                    nameWithSpaceANDUnderScoreValidator
                                  }
                                />
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
                                    width: "50%",
                                    marginLeft: "10px",
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
                                  id={"inventoryMemo"}
                                  name={"inventoryMemo"}
                                  label={"Memo"}
                                  component={FormInput}
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
                                style={{
                                  width: "49.5%",
                                }}
                              >
                                Cancel
                              </Button>
                              {dialogTitle == "Edit Inventory" ? (
                                <>
                                  {checkPrivialgeGroup(
                                    "EditInventoryCM",
                                    3
                                  ) && (
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
                                          style={{
                                            width: "49.5%",
                                            marginLeft: "5px",
                                          }}
                                          onClick={() =>
                                            addInventoryHandleSubmit(
                                              formRenderProps,
                                              "Location"
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
                                  {checkPrivialgeGroup("AddInventoryB", 2) && (
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
                                        style={{
                                          width: "49.5%",
                                          marginLeft: "5px",
                                        }}
                                        onClick={() =>
                                          addInventoryHandleSubmit(
                                            formRenderProps,
                                            "Location"
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
                      expanded={expanded == "Location"}
                      disabled={!formInit?.id}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : "Location");
                      }}
                    >
                      <Reveal>
                        {expanded == "Location" && (
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
                                style={{
                                  width: "49.5%",
                                }}
                              >
                                Cancel
                              </Button>
                              {dialogTitle == "Edit Inventory" ? (
                                <>
                                  {checkPrivialgeGroup(
                                    "EditInventoryCM",
                                    3
                                  ) && (
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
                                          style={{
                                            width: "49.5%",
                                            marginLeft: "5px",
                                          }}
                                          onClick={() =>
                                            addInventoryHandleSubmit(
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
                                  {checkPrivialgeGroup("AddInventoryB", 2) && (
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
                                        style={{
                                          width: "49.5%",
                                          marginLeft: "5px",
                                        }}
                                        onClick={() =>
                                          addInventoryHandleSubmit(
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
            )}
          />
        )}
      </div>
    </>
  );
}
