import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import React from "react";
import axiosInstance from "../../../../core/HttpInterceptor";
import { BatchEndPoints } from "../../../../EndPoints";

export const DeleteBatchConfirmModal = ({
  closeDeleteDialog,
  addEditBatchData,
  setBindDataGrid,
}) => {
  const deleteBatch = () => {
    let id = addEditBatchData.id;
    axiosInstance({
      method: "delete",
      url: BatchEndPoints.DeleteVoucher + "/" + id,
      withCredentials: false,
    })
      .then((response) => {
        setBindDataGrid({
        });
      })
      .catch(() => {})
      .finally(() => {
        closeDeleteDialog();
      });
  };
  return (
    <Dialog title={<span>Please confirm</span>} onClose={closeDeleteDialog}>
      <p
        style={{
          margin: "25px",
          textAlign: "center",
        }}
      >
        Are you sure you want to Delete?
      </p>
      <DialogActionsBar>
        <Button
          themeColor={"secondary"}
          className={"col-12"}
          onClick={closeDeleteDialog}
        >
          No
        </Button>
        <Button
          themeColor={"primary"}
          className={"col-12"}
          onClick={deleteBatch}
        >
          Yes
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};

export default DeleteBatchConfirmModal;
