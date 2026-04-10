import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridToolbar
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { PayrollEndPoints } from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";

export default function ExportSetup() {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [jobCodeData, setJobCodeData] = React.useState([]);
  const [columnShow, setColumnShow] = useState(false);

  const [filter, setFilter] = useState();
  const [showFilter, setshowFilter] = useState(false);
  const [page, setPage] = useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);
  const [pageTotal, setPageTotal] = useState();
  const [, setsearchText] = useState("");
  const [bindFundGrid, setBindFundGrid] = useState(null);

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindFundGrid) {
        getJobCodes(
          bindFundGrid.jobDescription,
          bindFundGrid.jobId,
          bindFundGrid.search,
          bindFundGrid.cskip,
          bindFundGrid.ctake == "All" ? 0 : bindFundGrid.ctake
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindFundGrid]);

  const getJobCodes = async (
    jobDescription = "",
    jobId = "",
    search = "",
    cskip = page.skip,
    ctake = page.take
  ) => {
    try {
      const result = await axiosInstance({
        method: "GET",
        url:
          PayrollEndPoints.JobCodes +
          `?skip=${cskip}&take=${ctake}&jobCode=${jobId}&jobName=${jobDescription}&search=${search} `,
        withCredentials: false,
      });
      setPageTotal(result.data.total);
      setJobCodeData(result.data.data);
    } catch (e) {
      console.log(e, "error");
    }
  };

  useEffect(() => {
    getJobCodes();
  }, []);

  const filterChange = (event) => {
    var jobDescription = "";
    var jobId = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (
          event.filter.filters[i].field ==
          "payrollJobDescription.empJobDescription"
        ) {
          jobDescription = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "jobId") {
          jobId = +event.filter.filters[i].value;
        }
      }
    }

    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindFundGrid({
      ...bindFundGrid,
      search: undefined,
      cskip: 0,
      jobDescription,
      jobId,
    });
    setFilter(event.filter);
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindFundGrid({
        ...bindFundGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindFundGrid({
        ...bindFundGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: pageTotal,
      });
    }
  };
  const handleSearch = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindFundGrid({
      ...bindFundGrid,
      search: value,
      cskip: 0,
      jobDescription: undefined,
      jobId: undefined,
    });
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollOrganizationDataSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <React.Fragment>
      {checkPrivialgeGroup("ESM", 1) &&
        < div >
          < nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Payroll
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Payroll Details
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Export Setup
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8">
              <figure>
                <blockquote className="blockquote">
                  <h1>Export Setup</h1>
                </blockquote>
              </figure>
            </div>
            <div className="col-sm-4 text-end">
            </div>
          </div>

          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h4>Job Codes</h4>
            </div>
            <div className="col-sm-4 text-end">
            </div>
          </div>

          {
            checkPrivialgeGroup("ESG", 1) && <Grid
              data={jobCodeData}
              resizable={true}
              filterable={showFilter}
              filter={filter}
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
                      <i className="fa-solid fa-arrow-down-wide-short"></i> &nbsp;
                      More Filter
                    </Button>
                  </div>
                  <div className="col-sm-6 d-flex align-items-center justify-content-center">
                    <div className="col-3">
                      {checkPrivialgeGroup("ESSMICB", 1) && (
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
                        onChange={handleSearch}
                      />
                      <span className="input-group-append">
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
              <GridColumn
                field="payrollJobDescription.empJobDescription"
                title="Job Description"
              />
              <GridColumn field="jobId" title="Job ID" />
              {columnShow && (
                <GridColumn
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
              {columnShow && <GridColumn field="createdBy" title="Created By" />}
              {columnShow && (
                <GridColumn
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
              {columnShow && <GridColumn field="modifiedBy" title="Modified By" />}
            </Grid>
          }
          <ContextMenu
          >
            {checkPrivialgeGroup("EditESCM", 3) && (
              <MenuItem
                text="Edit"
                data={{
                  action: "edit",
                }}
                icon="edit"
              />
            )}
            {checkPrivialgeGroup("DeleteESCM", 4) && (
              <MenuItem
                text="Delete"
                data={{
                  action: "delete",
                }}
                icon="delete"
              />
            )}
          </ContextMenu>
          <br></br>
        </div >}
    </React.Fragment >
  );
}
