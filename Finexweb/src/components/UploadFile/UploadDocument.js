import { Button } from "@progress/kendo-react-buttons";
import React from "react";
import axiosInstance from "../../core/HttpInterceptor";
import DocumentPopup from "./DocumentPopup";
import usePrivilege from "../../helper/usePrivilege";

export default function UploadDocument() {
  const [DocumentPopupVisible, setDocumentPopupVisible] = React.useState(false);

  const openDocumentPopup = () => {
    setDocumentPopupVisible(!DocumentPopupVisible);
  };
  const closeDocumentPopup = (flag) => {
    setDocumentPopupVisible(flag);
  };

  const { checkPrivialgeGroup, loading, error } = usePrivilege('DocumentManagement')

  return (
    <>
      {checkPrivialgeGroup("UploadDocM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Documents
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Upload Document
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Upload Document
              </li>
            </ol>
          </nav>
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
                  minHeight: "800px",
                }}
              >
                <div className="col-sm-12"></div>
                {checkPrivialgeGroup("UploadDocB", 2) && (
                  <div className="k-form-buttons">
                    <Button
                      themeColor={"primary"}
                      className="k-button k-button-lg k-rounded-lg"
                      type={"button"}
                      onClick={openDocumentPopup}
                    >
                      Upload Document
                    </Button>
                  </div>
                )}

                {DocumentPopupVisible && (
                  <DocumentPopup
                    onclosePopup={closeDocumentPopup}
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
