import { Button } from "@progress/kendo-react-buttons";
import {
  GridColumn as Column,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { downloadIcon } from "@progress/kendo-svg-icons";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  UploadDocumentEndPoints,
} from "../../EndPoints";
import DocumentPopup from "./DocumentPopup";
import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";

export default function UploadDocumentList() {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [GridData, setGridData] = useState([]);
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState();
  const [pageTotal, setPageTotal] = React.useState();
  const [, setsearchText] = React.useState("");
  const [showFilter, setshowFilter] = React.useState(false);
  const [filter, setFilter] = React.useState();
  const [columnShow, setColumnShow] = useState(false);


  const [, setIsLoading] = React.useState(false);
  const [privilegeResourceGroup, setPrivilegeResourceGroup] = React.useState(
    []
  );
  const [bindDocumentGrid, setBindDocumentGrid] = useState({
    cskip: 0,
    ctake: 10,
  });

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDocumentGrid) {
        BindGrid(
          bindDocumentGrid.fileType,
          bindDocumentGrid.docName,
          bindDocumentGrid.fileDesc,
          bindDocumentGrid.search,
          bindDocumentGrid.cskip,
          bindDocumentGrid.ctake == "All" ? 0 : bindDocumentGrid.ctake,
          bindDocumentGrid.desc,
          bindDocumentGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindDocumentGrid]);


  const initialSort = [
    {
      field: "",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "";
    setSort(event.sort);
    setBindDocumentGrid({
      ...bindDocumentGrid,
      skip: page.skip,
      take: page.take,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const filterChange = (event) => {
    var fileType = "";
    var docName = "";
    var fileDesc = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "fileType") {
          fileType = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "docName") {
          docName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "fileDesc") {
          fileDesc = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindDocumentGrid({
      ...bindDocumentGrid,
      fileType: fileType,
      docName: docName,
      fileDesc: fileDesc,
      search: undefined,
      cskip: 0,
    });
    setFilter(event.filter);
  };
  const BindGrid = (
    fileType = "",
    docName = "",
    fileDesc = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = true,
    sortKey = ""
  ) => {
    axiosInstance({
      method: "Get",
      url:
        UploadDocumentEndPoints.GetUploadDocumentList +
        "fileType=" +
        fileType +
        "&&docName=" +
        docName +
        "&&fileDesc=" +
        fileDesc +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&desc=" +
        desc +
        "&sortKey=" +
        sortKey,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setGridData(data);
        setPageTotal(response.data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: response.data.total,
          });
        }
      })
      .catch(() => { });
  };

  const [DocumentPopupVisible, setDocumentPopupVisible] = React.useState(false);

  const openDocumentPopup = () => {
    setDocumentPopupVisible(!DocumentPopupVisible);
  };
  const closeDocumentPopup = (flag) => {
    setDocumentPopupVisible(flag);
    setBindDocumentGrid({
      ...bindDocumentGrid,
    });
  };

  //Event of grid page change
  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindDocumentGrid({
        ...bindDocumentGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindDocumentGrid({
        ...bindDocumentGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: GridData.length,
      });
    }
  };
  //Event of grid filter change
  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindDocumentGrid({
      ...bindDocumentGrid,
      cskip: 0,
      search: value,
      fileType: undefined,
      docName: undefined,
      fileDesc: undefined,
    });
  };
  //Set filter operator for Grid Data
  const filterOperators = {
    text: [
      {
        text: "grid.filterContainsOperator",
        operator: "contains",
      },
    ],
  };
  function getFileNameFromPath(path) {
    const parts = path.split(/[\\/]/);
    const filename = parts[parts.length - 1];
    return filename;
  }
  function DownloadDoc(base64String, filename) {
    if (base64String !== "" && filename !== "") {
      const binaryString = window.atob(base64String);

      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getFileNameFromPath(filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("File not found..");
    }
  }

  const { checkPrivialgeGroup, loading, error } = usePrivilege('DocumentManagement')

  return (
    <>
      {checkPrivialgeGroup("UploadDocListM", 1) && (
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
                Documents List
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>Document List</h3>
            </div>
            <div className="col-sm-4 text-end">
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                type={"button"}
                onClick={openDocumentPopup}
              >
                Upload Document
              </Button>
            </div>
          </div>

          {checkPrivialgeGroup("UploadDocListG", 1) && (
            <div className="row mt-3">
              <Grid
                resizable={true}
                filterable={showFilter}
                data={GridData}
                filter={filter}
                filterOperators={filterOperators}
                onFilterChange={filterChange}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, 50, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                onPageChange={pageChange}
                sortable={true}
                sort={sort}
                onSortChange={(e) => {
                  onSortChange(e);
                }}
              >
                <GridToolbar>
                  <div className="row col-sm-12">
                    <div className="col-sm-6 d-grid gap-3 d-md-block">
                      <Button
                        className="buttons-container-button"
                        fillMode="outline"
                        themeColor={"primary"}
                        onClick={MoreFilter}
                      >
                        <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                        &nbsp; More Filter
                      </Button>
                    </div>
                    <div className="col-sm-6 d-flex align-items-center justify-content-center">
                      <div className="col-3">
                        {checkPrivialgeGroup("UDSMICB", 1) && (
                          <Checkbox
                            type="checkbox"
                            id="modifiedBy"
                            name="modifiedBy"
                            defaultChecked={columnShow}
                            onChange={onCheckBox}
                            label={"Modified Info"}
                          />
                        )}
                      </div>
                      <div className="input-group">
                        <Input
                          className="form-control border-end-0 border"
                          onChange={filterData}
                        />
                        <span
                          className="input-group-append"
                          onChange={filterData}
                        >
                          <button
                            className="btn btn-outline-secondary bg-white rounded-0 border-start-0 rounded-end-2 border ms-n5"
                            type="button"
                          >
                            <i className="fa fa-search"></i>
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                </GridToolbar>
                <Column field="fileType" title="File Type" />
                <Column field="docName" title="File Name" />
                <Column field="fileDesc" title="File Description" />
                {columnShow && (
                  <Column
                    field="createdDate"
                    title="Created Date"
                    cell={(props) => {
                      const [year, month, day] = props.dataItem?.createdDate
                        ? props.dataItem?.createdDate.split("T")[0].split("-")
                        : [null, null, null];
                      return (
                        <td>
                          {props.dataItem?.createdDate
                            ? `${month}/${day}/${year}`
                            : null}
                        </td>
                      );
                    }}
                  />
                )}
                {columnShow && <Column field="createdBy" title="Created By" />}
                {columnShow && (
                  <Column
                    field="modifiedDate"
                    title="Modified Date"
                    cell={(props) => {
                      const [year, month, day] = props.dataItem?.modifiedDate
                        ? props.dataItem?.modifiedDate.split("T")[0].split("-")
                        : [null, null, null];
                      return (
                        <td>
                          {props.dataItem?.modifiedDate
                            ? `${month}/${day}/${year}`
                            : null}
                        </td>
                      );
                    }}
                  />
                )}
                {columnShow && (
                  <Column field="modifiedBy" title="Modified By" />
                )}
                <Column
                  title="Download"
                  cell={(props) => (
                    <div className="buttons-container">
                      {checkPrivialgeGroup("UploadDocListDownloadB", 2) && (
                        <Button
                          className="buttons-container-button"
                          svgIcon={downloadIcon}
                          type="button"
                          onClick={() =>
                            DownloadDoc(
                              props.dataItem.fileData,
                              props.dataItem.fileName
                            )
                          }
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  )}
                />
              </Grid>
            </div>
          )}
        </>
      )}
      {DocumentPopupVisible && (
        <DocumentPopup onclosePopup={closeDocumentPopup}></DocumentPopup>
      )}
    </>
  );
}
