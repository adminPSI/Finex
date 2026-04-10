import React, { useEffect, useState } from "react";

import { Button } from "@progress/kendo-react-buttons";

import { Dialog } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { eyedropperIcon, trashIcon } from "@progress/kendo-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ConfigurationEndPoints,
  IHPOEndPoints,
  PurchaseOrderEndPOints,
} from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import { handlePrivilegeByGroup } from "../../utils/helpers/handlePrivilegeByGroup";
import { DatePickerCell } from "../DatePickerCell";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import { ColumnFormCurrencyTextBox } from "../form-components";
import PurchaseOrderForm from "./PurchaseOrderForm";

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

export default function CreatePurchaseOrder() {
  const [poNumber, setPoNumber] = React.useState();
  const [poId, setPoId] = React.useState();
  const [type, setType] = React.useState("screen");
  const [poLiquidation, setPoLiquidation] = React.useState(0);
  const [poLiquidationData, setPoLiquidationData] = React.useState([]);
  const [doubleEmbrance, setDoubleEmbrance] = React.useState(false);
  const [doubleEmbranceData, setDoubleEmbranceData] = React.useState(0);
  const navigate = useNavigate();
  const { state } = useLocation();

  const [PoLiquitationDisplay, setPoLiquitationDisplay] = React.useState(false);

  React.useEffect(() => {
    getConfigForPoLiquitaion();
  }, []);

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);

  useEffect(() => {
    handlePrivilegeByGroup({
      query: "Accounts Payable",
      setPrivilegeResourceGroup,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPrivilegeGroup = (resourcesKey, privilageId) => {
    return true
    privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilageId
    );
  };

  React.useEffect(() => {
    if (state?.poNumber) {
      let ponumber = state?.poNumber || "";
      setPoNumber(ponumber);
    }
    if (state?.poId) {
      let poId = state?.poId || "";
      setPoId(poId);
    }
    if (state?.type) {
      let type = state?.type || "";
      setType(type);
    }
  }, [state]);

  const getPOCode = (poid) => {
    setPoId(poid);
  };

  const getConfigForPoLiquitaion = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/26",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setPoLiquitationDisplay(value);
      })
      .catch(() => { });
  };

  const getDoubleEmData = () => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.DoubleEncumerance.replace("#PONUM#", poId),
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setDoubleEmbrance(true);
        setDoubleEmbranceData(data);
      })
      .catch(() => { });
  };
  const getPOLiquidationData = () => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.POLiquidate + "/" + poId,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPoLiquidation(new Date().getTime());
        data.map((da) => (da.date = new Date(da.date)));

        if (state?.type !== "view") {
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            id: 0,
          };
          data.push(newDataItem);
        }
        
        setPoLiquidationData(data);
      })
      .catch(() => { });
  };
  const closeMenuHandler = () => {
    setPoLiquidation(0);
  };
  const openDoubleEmb = () => {
    setDoubleEmbrance(true);
    getDoubleEmData();
    getIHPOBasedPO();
  };
  const closeDoubleEmb = () => {
    setDoubleEmbrance(false);
  };

  const editField = "inEdit";

  const itemChange = (event) => {
    const field = event.field || "";
    const newData = poLiquidationData.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [field]: event.value,
        }
        : item
    );
    setPoLiquidationData(newData);
  };

  const enterEdit = (dataItem) => {
    let newData = poLiquidationData.map((item) =>
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
    setPoLiquidationData(newData);
  };

  const PoLiquidGridCommandCell = (props) => (
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

  const remove = (dataItem) => {
    deletePoLiquidation(dataItem);
  };

  const cancel = (dataItem) => {
    getPOLiquidationData();
  };

  const discard = (dataItem) => { };

  const add = (dataItem) => {
    if (!dataItem.date || !dataItem.amount) {
      showErrorNotification("Required field is empty");
      return;
    }

    AddPoLiquidation(dataItem);
  };

  const AddPoLiquidation = (dataItem) => {
    let apiRequest = {
      id: 0,
      countyPOId: poId,
      date: dataItem.date,
      amount: dataItem.amount,
    };
    axiosInstance({
      method: "POST",
      url: PurchaseOrderEndPOints.POLiquidate,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        getPOLiquidationData();
        setPoLiquidation(new Date().getTime());

        showSuccessNotification("Po liquidation saved successfully");
      })
      .catch(() => { });
  };

  const update = (dataItem) => {
    if (!dataItem.date || !dataItem.amount) {
      showErrorNotification("Required field is empty");
      return;
    }
    UpdatePoLiquidation(dataItem);
  };

  const UpdatePoLiquidation = (dataItem) => {
    let apiRequest = {
      id: dataItem.id,
      countyPOId: poId,
      date: dataItem.date,
      amount: dataItem.amount,
      countyPO: null,
    };
    axiosInstance({
      method: "PUT",
      url: PurchaseOrderEndPOints.POLiquidate + "/" + dataItem.id,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        getPOLiquidationData();
        setPoLiquidation(new Date().getTime());

        showSuccessNotification("Po liquidation update successfully");
      })
      .catch(() => { });
  };

  const deletePoLiquidation = (dataItem) => {
    axiosInstance({
      method: "delete",
      url: PurchaseOrderEndPOints.POLiquidate + "?id=" + dataItem.id,
      withCredentials: false,
    })
      .then((response) => {
        getPOLiquidationData();
        showSuccessNotification("Po liquidation deleted successfully");
      })
      .catch(() => { });
  };

  const [ihpoList, setIHPOList] = React.useState([]);

  const getIHPOBasedPO = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: IHPOEndPoints.IHPOBasedPO + "/" + poId,
        withCredentials: false,
      });
      let data = response.data.record;
      setIHPOList(data);
    } catch (error) { }
  };

  return (
    <>
      {(checkPrivilegeGroup("POP", 1) ||
        checkPrivilegeGroup("POP", 2) ||
        checkPrivilegeGroup("POP", 3)) && (
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
                  Purchase Order
                </li>
              </ol>
            </nav>
            <div className="row mb-3">
              <div className="col-sm-6">
                <figure>
                  <blockquote className="blockquote">
                    <h1>
                      {" "}
                      {state?.type == "view" ? "View " : poId ? "Edit " : "Add "}
                      County Purchase Order
                    </h1>
                  </blockquote>
                </figure>
              </div>
              <div className="col-sm-6 text-end">
                {poId && (
                  <Button
                    className="me-1"
                    themeColor={"primary"}
                    onClick={openDoubleEmb}
                  >
                    IHPO & Double Encumbrance
                  </Button>
                )}
                {poId && !PoLiquitationDisplay && (
                  <Button
                    className="me-1"
                    themeColor={"primary"}
                    onClick={getPOLiquidationData}
                  >
                    PO Liquidation
                  </Button>
                )}
                <Button
                  className="me-1"
                  themeColor={"primary"}
                  onClick={() => navigate("/purchaseorder")}
                >
                  Accounts Payable Dashboard
                </Button>
              </div>
            </div>
            {poLiquidation ? (
              <Dialog
                width={800}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-plus"></i>
                    <span className="ms-2">PO Liquidation</span>
                  </div>
                }
                onClose={closeMenuHandler}
              >
                <Grid
                  resizable={true}
                  data={poLiquidationData}
                  dataItemKey={"id"}
                  onItemChange={itemChange}
                  editField={editField}
                >
                  <GridColumn
                    field="date"
                    title="Date"
                    format="{0:d}"
                    cell={DatePickerCell}
                  />
                  <GridColumn
                    field="amount"
                    title="Amount"
                    editor="numeric"
                    format="{0:c2}"
                    headerClassName="header-right-align"
                    cell={ColumnFormCurrencyTextBox}
                  />
                  {state?.type !== "view" && <GridColumn cell={PoLiquidGridCommandCell} width="240px" />}
                </Grid>
              </Dialog>
            ) : null}

            {doubleEmbrance && (
              <Dialog
                width={800}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-plus"></i>
                    <span className="ms-2">Double Encumbrance</span>
                  </div>
                }
                onClose={closeDoubleEmb}
              >
                <div className="d-flex justify-content-end">
                  <div
                    className="k-form-field mb-2"
                    style={{
                      width: "40%",
                    }}
                  >
                    <label className="k-label">Double Encumbrance</label>
                    <NumericTextBox
                      format={"c"}
                      spinners={false}
                      value={doubleEmbranceData}
                      disabled={true}
                    />
                  </div>
                </div>
                <Grid resizable={true} data={ihpoList} dataItemKey={"id"}>
                  <GridColumn field="reqNumber" title="IHPO Number" />
                  <GridColumn field="ihpoDetails.vendor.name" title="Vendor" />
                  <GridColumn field="reqDescription" title="Description" />
                  <GridColumn
                    field="ihpoPricing.reqTotal"
                    title="Total"
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
                    cell={(props) => {
                      var amount = props.dataItem?.ihpoPricing?.reqTotal || 0;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <GridColumn
                    field="ihpoPricing.reqBalance"
                    title="Balance"
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
                    cell={(props) => {
                      var amount = props.dataItem?.ihpoPricing.reqBalance || 0;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                </Grid>
              </Dialog>
            )}
            <div className="row">
              <PurchaseOrderForm
                type={type}
                getPOCode={getPOCode}
                poLiquidation={poLiquidation}
              ></PurchaseOrderForm>
            </div>
          </>
        )}
    </>
  );
}
