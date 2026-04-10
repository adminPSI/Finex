import { Dialog } from "@progress/kendo-react-dialogs";
import React from "react";
import { PDFViewer } from "@progress/kendo-react-pdf-viewer";

const PdfViewer = ({ pdfURL, setPdfURL, isOpen, setIsOpen }) => {
  const closeModal = () => {
    setPdfURL("");
    setIsOpen(false);
  };
  return (
    isOpen && (
      <Dialog
        width={"70vw"}
        height={"70vh"}
        onClose={closeModal}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <span className="ms-2">View PDF</span>
          </div>
        }
      >
        <PDFViewer url={pdfURL} defaultZoom={1} />
      </Dialog>
    )
  );
};

export default PdfViewer;
