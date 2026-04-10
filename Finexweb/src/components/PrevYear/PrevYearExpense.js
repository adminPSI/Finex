import React, { useEffect, useState } from "react";
import {
  Grid,
  GridColumn as Column,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { AuthenticationEndPoints, PrevYear } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import usePrivilege from "../../helper/usePrivilege";

const PrevYearExpense = () => {
  const [data, setData] = useState([]);
  const [yearDropdownList, setYearDropdownList] = React.useState([]);
  const [selectedYearDropdown, setSelectedYearDropdown] = React.useState();

  useEffect(() => {
   
    setYearDropdownList(["2025","2024", "2023", "2022", "2021", "2020"]);
    setSelectedYearDropdown(new Date().getFullYear());
    getPrevYearExpenseList(new Date().getFullYear());
  }, []);

  const getPrevYearExpenseList = (year) => {
    axiosInstance({
      method: "GET",
      url: PrevYear.prevYearExpense + "?year=" + year,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setData(data);
      })
      .catch(() => { });
  };

  const handleYearChange = (event) => {
    setSelectedYearDropdown(event.target.value);
    getPrevYearExpenseList(event.target.value);
  };

  const { checkPrivialgeGroup, loading, error } = usePrivilege('Previous Year Expense')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("PYExpenseM", 1) && (
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
                Previous Year Expense
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8">
              <figure>
                <blockquote className="blockquote">
                  <h1>Previous Year Expense</h1>
                </blockquote>
              </figure>
            </div>
          </div>
          <br />
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
          <br />
          {checkPrivialgeGroup("PYExpenseG", 1) && (
            <div>
              <Grid
                resizable={true}
                style={{
                  height: "500px",
                }}
                data={data}
                dataItemKey={"id"}
                fixedScroll={"true"}
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
                  field="balJan"
                  title="Jan"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balJan;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balFeb"
                  title="Feb"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balFeb;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balMar"
                  title="Mar"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balMar;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balApr"
                  title="Apr"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balApr;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balMay"
                  title="May"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balMay;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balJun"
                  title="Jun"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balJun;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balJul"
                  title="Jul"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balJul;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balAug"
                  title="Aug"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balAug;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balSep"
                  title="Sep"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balSep;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balOct"
                  title="Oct"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balOct;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balNov"
                  title="Nov"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balNov;
                    amount =
                      "$" +
                      amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                    return <td className="!k-text-right">{`${amount}`}</td>;
                  }}
                />
                <Column
                  field="balDec"
                  title="Dec"
                  format="{0:c}"
                  width={"140px"}
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
                    var amount = props.dataItem.balDec;
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
          )}
        </>
      )}
    </>
  );
};

export default PrevYearExpense;
