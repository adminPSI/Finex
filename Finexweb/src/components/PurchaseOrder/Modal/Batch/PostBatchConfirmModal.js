import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import React, { useState } from "react";
import axiosInstance from "../../../../core/HttpInterceptor";
import { BatchEndPoints } from "../../../../EndPoints";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { FormDatePicker } from "../../../form-components";
import { DateValidator } from "../../../validators";

export const PostBatchConfirmModal = ({
  closePostBatch,
  addEditBatchData,
  setBindDataGrid,
}) => {
  const [loading, setLoading] = useState(false);
  const postBatch = async (dataItem) => {
    let id = addEditBatchData.id;
    setLoading(true);
    let postDate = new Date(dataItem.postDate);
    const postYear = postDate.getFullYear();
    const postMonth = String(postDate.getMonth() + 1).padStart(2, "0");
    const postDay = String(postDate.getDate()).padStart(2, "0");
    const formatPostDate = `${postYear}-${postMonth}-${postDay}`;
    axiosInstance({
      method: "Post",
      url: `${BatchEndPoints.PostBatchVouchers}/${id}?dateTime=${formatPostDate}`,
      withCredentials: false,
    })
      .then((response) => {
        closePostBatch();
        setBindDataGrid({});
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog title={<span>Post Batch</span>} onClose={closePostBatch}>
      <Form
        onSubmit={postBatch}
        initialValues={{
          postDate: null,
        }}
        key={0}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <div>
                <Field
                  id={"postDate"}
                  name={"postDate"}
                  label={"Post Date*"}
                  component={FormDatePicker}
                  validator={DateValidator}
                />
              </div>

              <div className="k-form-buttons">
                <Button
                  className={"col-5 me-2"}
                  type={"button"}
                  onClick={closePostBatch}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  themeColor={"primary"}
                  className={"col-5"}
                  type={"submit"}
                  disabled={loading || !formRenderProps.allowSubmit}
                >
                  Post Batch
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
};

export default PostBatchConfirmModal;
