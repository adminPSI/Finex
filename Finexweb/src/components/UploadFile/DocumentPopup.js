import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  IntlProvider,
  LocalizationProvider,
  loadMessages,
} from "@progress/kendo-react-intl";
import { Error } from "@progress/kendo-react-labels";
import { Upload } from "@progress/kendo-react-upload";
import React from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { UploadDocumentEndPoints } from "../../EndPoints";
import { FormDropDownList, FormInput, FormTextArea } from "../form-components";
import {
  docnameValidator,
  docsValidator,
  doctypeValidator
} from "../validators";
import bgMessages from "./bg.json";

loadMessages(bgMessages, "bg-BG");

export default function DocumentPopup({
  onclosePopup,
  selectedLineItemId,
  docNameDisabled,
  docTypeId,
}) {
  const [files, setFiles] = React.useState([]);
  const [formkey, setFormKey] = React.useState([]);
  const [fileData, setfileData] = React.useState([]);
  const [typeDDList, settypeDDList] = React.useState([]);
  const handleClosePopup = () => {
    onclosePopup(false);
  };
  const [disableDocName, ] = React.useState(
    docNameDisabled || false
  );
  const [documentData, setDocumentData] = React.useState({
    docname: selectedLineItemId,
  });

  const resetFrom = () => {
    setFormKey(formkey + 1);
  };
  const [typeVal, settypeVal] = React.useState({
    value: {
      text: "Select Type",
      id: 0,
    },
  });

  React.useEffect(() => {
    if (typeDDList.length && docTypeId) {
      let docTypeIndex = typeDDList.findIndex((type) => type.id == docTypeId);
      documentData.type = typeDDList[docTypeIndex];
      setDocumentData(documentData);
      setFormKey(formkey + 1);
    }
  }, [docTypeId, typeDDList]);
  React.useEffect(() => {
    setALLDropdown();
  }, []);
  const setALLDropdown = () => {
    let typeData = [
      { text: "Accounts Payable", id: 1 },
      { text: "Accounts Receivable", id: 2 },
      { text: "Banking", id: 3 },
      { text: "General Ledger", id: 4 },
      { text: "Payroll", id: 5 },
      { text: "Taxes", id: 6 },
    ];
    settypeDDList(typeData);
  };
  const onAdd = (event) => {
    setFiles(event.newState);
  };
  const onRemove = (event) => {
    setFiles(event.newState);
  };
  const onProgress = (event) => {
    setFiles(event.newState);
  };
  const onStatusChange = (event) => {
    setFiles(event.newState);
  };
  function onSaveRequest(files, options, onProgress) {
    const currentFile = files[0];
    const uid = currentFile.uid;
    return new Promise((resolve, reject) => {
      if (
        currentFile.validationErrors &&
        currentFile.validationErrors.length > 0
      ) {
        reject({
          uid: uid,
        });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result && typeof reader.result == "string") {
            const base64Result = reader.result.split(",")[1];
            setfileData({
              base64Result: base64Result,
              filename: currentFile.name,
            });
            resolve({
              uid: uid,
            });
          } else {
            reject({
              uid: uid,
            });
          }
        };
        reader.onprogress = (data) => {
          onProgress(uid, data);
        };

        reader.onabort = () => {
          reject({
            uid: uid,
          });
        };
        reader.onerror = () => {
          reject({
            uid: uid,
          });
        };
        reader.readAsDataURL(currentFile.getRawFile());
      }
    });
  }
  function onRemoveRequest(files, options) {
    const currentFile = files[0];
    const uid = currentFile.uid;
    setfileData([]);
    return new Promise((resolve) => {
      resolve({
        uid: uid,
      });
    });
  }

  const typeddlOnChange = (event) => {
    settypeVal({ value: event.target.value });
  };

  const formOnSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let data = {
      fileData: fileData.base64Result,
      fileName: fileData.filename,
      docName: dataItem.docname,
      fileType: dataItem.type.text,
      fileDesc: dataItem.docdescription,
    };

    axiosInstance({
      method: "POST",
      maxBodyLength: Infinity,
      url: UploadDocumentEndPoints.SaveUploadDocument,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    })
      .then((response) => {
        resetFrom();
        setfileData([]);
        setFiles("");
        alert("File Uploaded");
        handleClosePopup();
      })
      .catch(() => {})
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  return (
    <>
      <Dialog
        width={500}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-plus"></i>
            <span className="ms-2">Add New Document</span>
          </div>
        }
        onClose={handleClosePopup}
      >
        <Form
          key={formkey}
          onSubmit={formOnSubmit}
          initialValues={documentData}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field
                  id={"type"}
                  name={"type"}
                  label={"Document Type"}
                  textField="text"
                  dataItemKey="id"
                  component={FormDropDownList}
                  data={typeDDList}
                  value={typeVal.value}
                  onChange={typeddlOnChange}
                  validator={doctypeValidator}
                />
                <Field
                  id={"docname"}
                  name={"docname"}
                  label={"Document Name"}
                  component={FormInput}
                  validator={docnameValidator}
                  disabled={disableDocName}
                />
                <div className="mt-3">
                  <label className="mb-2">Upload Document</label>
                  <LocalizationProvider language="bg-BG">
                    <IntlProvider locale="bg">
                      <Upload
                        batch={false}
                        multiple={false}
                        restrictions={{
                          allowedExtensions: [".png", ".jpg", ".xls", ".pdf"],
                        }}
                        files={files}
                        onAdd={onAdd}
                        onRemove={onRemove}
                        onProgress={onProgress}
                        onStatusChange={onStatusChange}
                        withCredentials={false}
                        saveUrl={onSaveRequest}
                        removeUrl={onRemoveRequest}
                        validator={docsValidator}
                        onBlur={() => {
                          formRenderProps.onChange("docdescription", {
                            value:
                              formRenderProps.valueGetter("docdescription") ??
                              "",
                            touched: true,
                            field: "docdescription",
                          });
                        }}
                      ></Upload>
                    </IntlProvider>
                  </LocalizationProvider>
                </div>
                {!fileData.base64Result &&
                  (formRenderProps.submitted || formRenderProps.touched) && (
                    <Error id="uploadfile">Document is required.</Error>
                  )}

                <Field
                  id={"docdescription"}
                  name={"docdescription"}
                  label={"Document Description"}
                  component={FormTextArea}
                />

                <div className="k-form-buttons">
                  <Button
                    type={"submit"}
                    themeColor={"primary"}
                    disabled={!formRenderProps.allowSubmit}
                  >
                    Save Document
                  </Button>
                  <Button
                    type={"button"}
                    themeColor={"secondary"}
                    onClick={handleClosePopup}
                  >
                    Cancel
                  </Button>
                </div>
              </fieldset>
            </FormElement>
          )}
        ></Form>
      </Dialog>
    </>
  );
}
