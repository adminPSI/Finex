import React, { useEffect, useState } from "react";
import {
  Grid,
  GridColumn as Column,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { AuthenticationEndPoints, PrevYear } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import { DropDownList } from "@progress/kendo-react-dropdowns";

const PrevYearRevenue = () => {
  const [data, setData] = useState([]);
  const [yearDropdownList, setYearDropdownList] = React.useState([]);
  const [selectedYearDropdown, setSelectedYearDropdown] = React.useState();

  useEffect(() => {
    handlePrivilageByGroup();
    setYearDropdownList(["2024", "2023", "2022", "2021", "2020"]);
    setSelectedYearDropdown(new Date().getFullYear());
    setGetPrevYearRevenueList({
      year: new Date().getFullYear(),
    });
  }, []);

  const [getPrevYearRevenueList, setGetPrevYearRevenueList] = useState(null);

  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (getPrevYearRevenueList) {
        GetPrevYearRevenueList(getPrevYearRevenueList.year);
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPrevYearRevenueList]);

  const GetPrevYearRevenueList = (year) => {
    axiosInstance({
      method: "GET",
      url: PrevYear.prevYearRevneue + "?year=" + year,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setData(data);
      })
      .catch(() => {});
  };

  const handleYearChange = (event) => {
    setSelectedYearDropdown(event.target.value);
    setGetPrevYearRevenueList({ year: event.target.value });
  };
  //

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = React.useState(
    []
  );
  const handlePrivilageByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=Previous Year Revenue`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => {});
  };

  const checkPrivialgeGroup = (resourcesKey, privilageId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilageId
    );
  };

  return (
    <>
      {checkPrivialgeGroup("PYRevenueM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Payroll
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Payroll
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Previous Year Revenue
              </li>
            </ol>
          </nav>

          {checkPrivialgeGroup("PYRevenueG", 1) && (
            <>
              <div className="row">
                <div className="col-sm-8">
                  <figure>
                    <blockquote className="blockquote">
                      <h1>Previous Year Revenue</h1>
                    </blockquote>
                  </figure>
                </div>
              </div>
              <br />
              {checkPrivialgeGroup("PYRevenueDD", 1) && (
                <DropDownList
                  style={{
                    width: "250px",
                  }}
                  defaultItem="Year Range"
                  value={selectedYearDropdown}
                  className="app-dropdown mb-3"
                  data={yearDropdownList}
                  onChange={handleYearChange}
                />
              )}

              <br />
              <div>
                <Grid
                  resizable={true}
                  style={{
                    height: "500px",
                  }}
                  data={data}
                  dataItemKey={"id"}
                >
                  <Column
                    field="accountingCode"
                    title="County Code"
                    width={"200px"}
                    cell={(props) => {
                      return (
                        <td>
                          {props.dataItem?.accountingCode?.countyExpenseCode}{" "}
                          {
                            props.dataItem?.accountingCode
                              ?.countyExpenseDescription
                          }
                        </td>
                      );
                    }}
                  />
                  <Column
                    field="jan"
                    title="Jan"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.jan;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="feb"
                    title="Feb"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.feb;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="mar"
                    title="Mar"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.mar;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="apr"
                    title="Apr"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.apr;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="may"
                    title="May"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.may;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="jun"
                    title="Jun"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.jun;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="jul"
                    title="Jul"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.jul;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="aug"
                    title="Aug"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.aug;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="sep"
                    title="Sep"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.sep;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="oct"
                    title="Oct"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.oct;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="nov"
                    title="Nov"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.nov;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <Column
                    field="dec"
                    title="Dec"
                    format="{0:c}"
                    width={"140px"}
                    headerCell={(props) => {
                      return (
                        <span className="k-cell-inner">
                          <span className="k-link !k-cursor-default d-flex justify-content-end">
                            <span className="k-column-title">
                              {props.title}
                            </span>
                            {props.children}
                          </span>
                        </span>
                      );
                    }}
                    cell={(props) => {
                      var amount = props.dataItem.dec;
                      amount =
                        "$" +
                        amount
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                </Grid>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default PrevYearRevenue;
