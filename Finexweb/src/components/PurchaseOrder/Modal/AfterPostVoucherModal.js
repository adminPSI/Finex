import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn } from "@progress/kendo-react-grid";

import React, { useCallback, useEffect, useState } from "react";
import {
  ColumnDatePicker,
} from "../../form-components";
const DATA_ITEM_KEY = "id";
const SELECTED_FIELD = "selected";

const AfterPostVoucherModal = ({ onClose, data }) => {
  const idGetter = (item) => item[DATA_ITEM_KEY];
  const [currentSelectedState, setCurrentSelectedState] = useState({});
  const [dataResult, setDataResult] = useState(data);

  useEffect(() => {
    setDataResult(data);
  }, [data]);

  const onHeaderSelectionChange = useCallback(
    (event) => {
      const checked = event.syntheticEvent.target.checked;
      const newSelectedState = {};
      data.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });
      setCurrentSelectedState(newSelectedState);
      const newData = data.map((item) => ({
        ...item,
        [SELECTED_FIELD]: checked,
      }));
      setDataResult(newData);
    },
    [data]
  );

  const onSelectionChange = (event) => {
    const selectedProductId = event.dataItem.id;
    const newSelectedState = {
      ...currentSelectedState,
      [selectedProductId]: !currentSelectedState[selectedProductId],
    };
    setCurrentSelectedState(newSelectedState);
    const newData = data.map((item) => ({
      ...item,
      selected: newSelectedState[idGetter(item)],
    }));
    setDataResult(newData);
  };

  const handleSubmit = async () => {
    dataResult.map((item) => ({
      sel: item.selected,
      vou: item.voucherVouchNo,
    }));

    onClose();
  };

  return (
    <div>
      <Dialog
        width={"94vw"}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-plus"></i>
            <span className="ms-2">Vouchers List</span>
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
          onHeaderSelectionChange={onHeaderSelectionChange}
          onSelectionChange={onSelectionChange}
          style={{
            height: 400,
          }}
          scrollable="scrollable"
        >
          <GridColumn filterable={false} field={SELECTED_FIELD} width={50} />
          <GridColumn field="voucherVouchNo" title="Voucher Number" />
          <GridColumn field="vendor.name" title="Vendor" />
          <GridColumn field="countyPO.poNumber" title="PO Number" />
          <GridColumn field="voucherDescription" title="Description" />
          <GridColumn
            field="voucherWrittenDate"
            title="Written Date"
            filterable={false}
            filter="date"
            editor="date"
            format="{0:MM/dd/yyyy}"
            filterCell={ColumnDatePicker}
            cell={(props) => {
              const [year, month, day] = props.dataItem?.voucherWrittenDate
                ? props.dataItem?.voucherWrittenDate.split("T")[0].split("-")
                : [null, null, null];
              return (
                <td>
                  {props.dataItem?.voucherWrittenDate
                    ? `${month}/${day}/${year}`
                    : null}
                </td>
              );
            }}
          />
          <GridColumn
            field="postDate"
            title="Date Posted"
            filterable={false}
            filter="date"
            editor="date"
            format="{0:MM/dd/yyyy}"
            filterCell={ColumnDatePicker}
            cell={(props) => {
              const [year, month, day] = props.dataItem?.postDate
                ? props.dataItem?.postDate.split("T")[0].split("-")
                : [null, null, null];
              return (
                <td>
                  {props.dataItem?.postDate ? `${month}/${day}/${year}` : null}
                </td>
              );
            }}
          />
          <GridColumn
            field="voucherAmount"
            title="Total"
            editor="numeric"
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
              var amount = props.dataItem?.voucherAmount || 0;
              amount =
                "$" +
                amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

              return <td className="!k-text-right">{`${amount}`}</td>;
            }}
          />
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
          <Button className={"col-2 me-2"} type={"button"} onClick={onClose}>
            Cancel
          </Button>
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

export default AfterPostVoucherModal;
