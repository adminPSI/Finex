import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn } from "@progress/kendo-react-grid";

import { useEffect, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { ConfigurationEndPoints, IHPOEndPoints } from "../../../EndPoints";
import { useNavigate } from "react-router-dom";
import { showErrorNotification } from "../../NotificationHandler/NotificationHandler";
import { ColumnFormCurrencyTextBox } from "../../form-components";
const DATA_ITEM_KEY = "id";
const SELECTED_FIELD = "selected";

const IHPOUploadModal = ({ ihpoUploadModalData, onClose }) => {
  const [LineItemGriddata, setLineItemGriddata] = useState([]);
  const [showIHAC, setShowIHAC] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (ihpoUploadModalData) {
      getIHPO(ihpoUploadModalData.ihpoId);
    }
    getIHACConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ihpoUploadModalData]);

  const getIHPO = async (IHPONumber) => {
    axiosInstance({
      method: "GET",
      url: IHPOEndPoints.IHPO + "/" + IHPONumber,
      withCredentials: false,
    })
      .then(async (response) => {
        const data = response.data;
        if (data) {
          await getLineITem(data.id);
        }
      })
      .catch((error) => {});
  };

  const getLineITem = async (ihpoNo) => {
    return axiosInstance({
      method: "GET",
      url: IHPOEndPoints.IHPOLineItem + "/" + ihpoNo,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.record.filter((item) => item.balance>0);
        let lineItems = [];
        let LineItemAmount = 0;
        data.map((item) => {
          LineItemAmount =
            LineItemAmount + item.reqDQuantity * item.reqDUnitPrice;
            lineItems.push(item);
          return item;
        });

        setLineItemGriddata([...lineItems]);
      })
      .catch(() => {});
  };

  const idGetter = (item) => item[DATA_ITEM_KEY];
  const [currentSelectedState, setCurrentSelectedState] = useState({});
  const [dataResult, setDataResult] = useState(LineItemGriddata);

  useEffect(() => {
    setDataResult(LineItemGriddata);
  }, [LineItemGriddata]);

  const onSelectionChange = (event) => {
    const selectedProductId = event.dataItem.id;
    const tmpSelectedProduct = event.dataItem;
    const newSelectedState = {
      ...currentSelectedState,
      [selectedProductId]: !currentSelectedState[selectedProductId],
    };

    const tmpSelectedData = dataResult.filter((item) => item.selected);

    if (tmpSelectedData && !tmpSelectedData.length) {
      setCurrentSelectedState(newSelectedState);
      const newData = LineItemGriddata.map((item) => ({
        ...item,
        selected: newSelectedState[idGetter(item)],
      }));

      setDataResult(newData);
    } else {
      const tmp = tmpSelectedData.find(
        (item) => item.poNumber == tmpSelectedProduct.poNumber
      );
      if (!tmp) {
        showErrorNotification("Only same PO number selection available.");
      } else {
        setCurrentSelectedState(newSelectedState);
        const newData = LineItemGriddata.map((item) => ({
          ...item,
          selected: newSelectedState[idGetter(item)],
        }));

        setDataResult(newData);
      }
    }
  };

  const handleSubmit = async () => {
    const selectedIHPOUpload = dataResult.filter((item) => item.selected);

    navigate("/addVoucher", {
      state: {
        ...ihpoUploadModalData,
        selectedIHPOUpload,
      },
    });
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
      .catch(() => {});
  };
  return (
    <div>
      <Dialog
        width={"94vw"}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <span className="ms-2">IHPO Upload</span>
          </div>
        }
        onClose={onClose}
      >
        <div
          style={{
            marginTop: "15px",
            marginBottom: "15px",
          }}
        ></div>
        <Grid
          resizable={true}
          data={dataResult}
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          onSelectionChange={onSelectionChange}
          style={{
            height: 400,
          }}
          scrollable="scrollable"
        >
          <GridColumn
            filterable={false}
            field={SELECTED_FIELD}
            width={50}
            headerCell={() => null}
          />

          <GridColumn field="reqDQuantity" editor="numeric" title="Quantity*" />
          <GridColumn field="unitDesc" title="Unit" />
          <GridColumn field="partNumber" title="Part Number" />
          <GridColumn field="poNumber" title="PO Number" />
          {showIHAC && <GridColumn field="reqIHAC" title="IHAC" />}
          {showIHAC && <GridColumn field="sAC" title="SAC" />}
          <GridColumn field="reqDDescription" title="Description" />
          <GridColumn
            field="reqDUnitPrice"
            title="Unit Price*"
            editor="numeric"
            format="{0:c2}"
            headerClassName="header-right-align"
            cell={ColumnFormCurrencyTextBox}
          />
          <GridColumn
            field="reqDTotal"
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
                    <span className="k-column-title">{props.title}</span>
                    {props.children}
                  </span>
                </span>
              );
            }}
            cell={(props) => (
              <td className="!k-text-right">
                $
                {(
                  props.dataItem?.balance
                )
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") || 0}
              </td>
            )}
          />
          {/* <GridColumn field="balance" title="Balance" format="{0:c2}"
            headerClassName="header-right-align" cell={ColumnFormCurrencyTextBox}/> */}
        </Grid>
        <div
          className="k-form-buttons"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            marginTop: "15px",
          }}
        >
          <Button
            themeColor={"primary"}
            className={"col-2"}
            type={"submit"}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default IHPOUploadModal;
