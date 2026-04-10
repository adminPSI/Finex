import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../core/HttpInterceptor";
import { BatchEndPoints } from "../../../../EndPoints";
import {
  ColumnDatePicker,
} from "../../../form-components";

const DATA_ITEM_KEY = "id";
const SELECTED_FIELD = "selected";

export const BatchVoucherModal = ({
  closeShowBatchVoucher,
  addEditBatchData,
  setNewBatchData,
  newBatchData,
}) => {
  const idGetter = (item) => item[DATA_ITEM_KEY];
  const [currentSelectedState, setCurrentSelectedState] = useState({});
  const [data, setData] = useState([]);
  const [dataResult, setDataResult] = useState([]);
  useEffect(() => {
    const fetchBatchVoucherData = async () => {
      let url;
      if (newBatchData) {
        url = `?startDate=${newBatchData.date.startDate}&endDate=${newBatchData.date.endDate}`;
      } else {
        url = `/${addEditBatchData.id}`;
      }

      try {
        const response = await axiosInstance({
          method: "GET",
          url: newBatchData
            ? BatchEndPoints.GetVouchersByDateSpan + url
            : BatchEndPoints.GetBatchVoucherByBatchId + url,
          withCredentials: false,
        });
        const fetchedData = response.data;
        setData(fetchedData);
        const selectedState = {};
        fetchedData.forEach((item) => {
          selectedState[idGetter(item)] = true;
        });
        setCurrentSelectedState(selectedState);
        setDataResult(
          fetchedData.map((item) => ({
            ...item,
            [SELECTED_FIELD]: true,
          }))
        );
      } catch (error) { }
    };

    fetchBatchVoucherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addEditBatchData, newBatchData]);

  const onHeaderSelectionChange = useCallback(
    (event) => {
      if (isAllHavePosted) {
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
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const onSelectionChange = (event) => {
    if (!event.dataItem.postDate) {
      const selectedProductId = event.dataItem.id;
      const newSelectedState = {
        ...currentSelectedState,
        [selectedProductId]: !currentSelectedState[selectedProductId],
      };
      setCurrentSelectedState(newSelectedState);
      const newData = data.map((item) => ({
        ...item,
        [SELECTED_FIELD]: newSelectedState[idGetter(item)],
      }));
      setDataResult(newData);
    }
  };

  const handleSubmit = async () => {
    const id = newBatchData ? newBatchData.batchData.id : addEditBatchData.id;
    let url = `?batchId=${id}`;
    const selectedData = dataResult
      .filter((item) => item.selected)
      .map((item) => item.id);
    const unSelectedData = dataResult
      .filter((item) => !item.selected)
      .map((item) => item.id);
    await axiosInstance({
      method: "POST",
      url: BatchEndPoints.RemoveVouhersFromBatch + url,
      withCredentials: false,
      data: unSelectedData,
    })
      .then((response) => {
      })
      .catch(() => { });

    await axiosInstance({
      method: "POST",
      url: BatchEndPoints.AddVouhersToBatch + url,
      withCredentials: false,
      data: selectedData,
    })
      .then((response) => {
        setNewBatchData(null);
        closeShowBatchVoucher();
      })
      .catch(() => { });
  };

  const checkHeaderSelectionValue = useMemo(() => {
    return dataResult.length
      ? dataResult.every((d) => d[SELECTED_FIELD])
      : false;
  }, [dataResult]);

  const isAllHavePosted = useMemo(() => {
    return dataResult.every((b) => !b.postDate);
  }, [dataResult]);

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
        onClose={closeShowBatchVoucher}
      >
        <div style={{ marginTop: "15px", marginBottom: "15px" }}></div>
        <Grid
          resizable={true}
          data={dataResult}
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          onHeaderSelectionChange={onHeaderSelectionChange}
          onSelectionChange={onSelectionChange}
          style={{ height: 400 }}
          scrollable="scrollable"
        >
          <GridColumn
            filterable={false}
            field={SELECTED_FIELD}
            width={50}
            headerSelectionValue={checkHeaderSelectionValue}
          />
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
            headerCell={(props) => (
              <span className="k-cell-inner">
                <span className="k-link !k-cursor-default d-flex justify-content-end">
                  <span className="k-column-title">{props.title}</span>
                  {props.children}
                </span>
              </span>
            )}
            cell={(props) => {
              let amount = props.dataItem?.voucherAmount || 0;
              amount =
                "$" +
                amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
              return <td className="!k-text-right">{amount}</td>;
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
          <Button
            className={"col-2 me-2"}
            type={"button"}
            onClick={closeShowBatchVoucher}
          >
            Cancel
          </Button>
          {(newBatchData ||
            (addEditBatchData && !addEditBatchData.datePosted)) && (
              <Button
                themeColor={"primary"}
                className={"col-2"}
                type={"submit"}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            )}
        </div>
      </Dialog>
    </div>
  );
};
