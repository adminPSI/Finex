import { toString as kendoToString } from "@progress/kendo-intl";
import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  payrollEndpoints,
  ReportsEndPoints
} from "../../EndPoints";
import {
  DefaultFirstGrid,
  DefaultSecondGrid,
  DefaultThirdGrid,
} from "../../utils/RunPayrollRightSection";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import AddEditPayrollTypeFirstPopup from "./modals/AddEditPayrollTypeFirstPopup";
import AddEditPayrollTypeSecondPopup from "./modals/AddEditPayrollTypeSecondPopup";
import AddEditPayrollTypeThirdPopup from "./modals/AddEditPayrollTypeThirdPopup";

const PayrollAttendanceRight = ({
  payrollGridDataList,
  displayFirstGrid,
  displaySecondGrid,
  displayThirdGrid,
  width,
  displayAddEditFirstGrid,
  PREmployeeDistributions,
  empPayType,
  getPREmployeeList,
  datePaid,
  payrollGridData,
  PayrollToatals,
  checkPrivialgeGroup
}) => {
  const [firstGrid, setFirstGrid] = useState(DefaultFirstGrid);
  const [secondGrid, setSecondGrid] = useState(DefaultSecondGrid);
  const [thirdGrid, setThirdGrid] = useState(DefaultThirdGrid);
  const [isAcceptShow, setIsAcceptShow] = useState(false);
  useEffect(() => {
    if (payrollGridDataList?.length) {
      const data = payrollGridDataList[0];
      const setterFirstGrid = firstGrid.map((item) => ({
        ...item,
        hours: data[item.fieldHour],
        amount: data[item.fieldAmount],
      }));

      const setterSecondGrid = secondGrid.map((item) => ({
        ...item,
        hours: data[item.fieldHour],
      }));
      const setterThirdGrid = thirdGrid.map((item) => ({
        ...item,
        hours: data[item.fieldHour],
      }));
      setFirstGrid(setterFirstGrid);
      setSecondGrid(setterSecondGrid);
      setThirdGrid(setterThirdGrid);
    } else {
      setFirstGrid(DefaultFirstGrid);
      setSecondGrid(DefaultSecondGrid);
      setThirdGrid(DefaultThirdGrid);
    }
  }, [payrollGridDataList]);

  const [openFirstPopup, setOpenFirstPopup] = useState(false);
  const [openSecondPopup, setOpenSecondPopup] = useState(false);
  const [openThirdPopup, setOpenThirdPopup] = useState(false);

  const toggleFirstDialog = () => {
    setOpenFirstPopup(!openFirstPopup);
  };
  const toggleSecondDialog = () => {
    setOpenSecondPopup(!openSecondPopup);
  };
  const toggleThirdDialog = () => {
    setOpenThirdPopup(!openThirdPopup);
  };

  const handlePayrollTotalDetail = (data) => {
    let obj = {};

    data.map((item) => {
      obj[item.fieldAmount] = item.amount || 0;
      obj[item.fieldHour] = item.hours || 0;
    });

    let apirequest = {
      ...payrollGridDataList[0],
      ...obj,
    };
    axiosInstance({
      method: "POST",
      url: payrollEndpoints.RefreshPayrollTotalDetail,
      data: apirequest,
      withCredentials: false,
    })
      .then((response) => {
        if (openSecondPopup) toggleSecondDialog();
        if (openThirdPopup) toggleThirdDialog();
        PREmployeeDistributions({
          selected: "selected",
          key: apirequest.jobDescriptionId,
          datePaid: kendoToString(apirequest.prDatePaid, "MM/dd/yyyy"),
          selectedRowId: apirequest.empId,
        });
        setIsAcceptShow(true);
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  const handlePayrollAccept = () => {
    const payrollData = payrollGridDataList[0];

    const apiRequest = {
      datePaid: payrollData.prDatePaid,
      payPeriodStart: payrollData.prStartDate,
      payPeriodEnd: payrollData.prEndDate,
      whichPay: payrollData.whichPay,
      empId: payrollData.empId,
      whichJob: payrollData.jobDescriptionId,
      jobId: payrollData.jobDescriptionId,
      payTotalRecID: payrollData.id,
      payoutAmount: payrollData.prGross,
      hoursWorked: payrollData.prTotalHours,
      grossPay: payrollData.prGross,
    };

    axiosInstance({
      method: "POST",
      url: ReportsEndPoints.PayrollBreakDown,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Accepted successfully");
        if (openFirstPopup) toggleFirstDialog();
        if (openSecondPopup) toggleSecondDialog();
        if (openThirdPopup) toggleThirdDialog();
        setIsAcceptShow(false);
        PREmployeeDistributions({
          selected: "selected",
          key: apiRequest.jobDescriptionId || payrollData.jobDescriptionId,
          datePaid: kendoToString(apiRequest.datePaid, "MM/dd/yyyy"),
          selectedRowId: apiRequest.empId,
        });
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  return (
    <div
      className="item-descr-wrap"
      style={{
        width: width ?? "30%",
        height: "62vh",
        overflowY: "auto",
      }}
    >
      {isAcceptShow && (
        <Button
          className="k-button k-button-lg k-rounded-lg float-left my-2"
          themeColor={"primary"}
          type="button"
          style={{ width: "fit-content", position: "absolute" }}
          onClick={handlePayrollAccept}
        >
          Accept
        </Button>
      )}
      {displayFirstGrid && (
        <div>
          <div className="d-flex justify-content-end align-items-center my-2">
            {displayAddEditFirstGrid && checkPrivialgeGroup("PRPAddEditB", 3) && (
              <Button
                className="k-button k-button-lg k-rounded-lg"
                themeColor={"primary"}
                type="button"
                style={{ height: "70%" }}
                onClick={toggleFirstDialog}
              >
                Add / Edit
              </Button>
            )}
          </div>
          <div className="d-flex justify-content align-items-end mb-3">
            <Grid
              data={firstGrid.filter((item) =>
                displayAddEditFirstGrid ? item.hours || item.amount : true
              )}
            >
              <GridColumn field="type" title="Type" />
              <GridColumn
                title="Hours"
                cell={(props) => {
                  var hours = props.dataItem?.hours;
                  hours = hours.toFixed(2);
                  return <td className="!k-text-right">{`${hours}`}</td>;
                }}
              />
              <GridColumn
                field="amount"
                title="Amount"
                cell={(props) => {
                  var amount = props.dataItem?.amount;
                  amount =
                    "$" +
                    amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                  return <td className="!k-text-right">{`${amount}`}</td>;
                }}
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
              />
            </Grid>
          </div>
        </div>
      )}
      {displayThirdGrid && (
        <div>
          <div className="d-flex justify-content align-items-end mb-3">
            <Grid data={thirdGrid.filter((item) => item.hours)}>
              <GridColumn field="type" title="Type" />
              <GridColumn
                title="Used Hours"
                cell={(props) => {
                  var hours = props.dataItem?.hours;
                  return <td className="!k-text-right">{`${hours}`}</td>;
                }}
              />
            </Grid>
          </div>
        </div>
      )}

      {displaySecondGrid && checkPrivialgeGroup("PRPAddEditB", 3) && (
        <div>
          <div className="d-flex justify-content-end align-items-center">
            <Button
              className="k-button k-button-lg k-rounded-lg"
              themeColor={"primary"}
              style={{ height: "70%" }}
              onClick={toggleSecondDialog}
              type="button"
            >
              Add / Edit
            </Button>
          </div>

          <div className="d-flex justify-content align-items-end mb-3 ">
            <Grid data={secondGrid.filter((item) => item.hours)}>
              <GridColumn field="type" title="Type" />
              <GridColumn
                title="Earned Hours"
                cell={(props) => {
                  var hours = props.dataItem?.hours;
                  return <td className="!k-text-right">{`${hours}`}</td>;
                }}
              />
            </Grid>
          </div>
        </div>
      )}

      {openFirstPopup && (
        <AddEditPayrollTypeFirstPopup
          data={firstGrid}
          onClose={toggleFirstDialog}
          setData={setFirstGrid}
          handlePayrollTotalDetail={handlePayrollTotalDetail}
          payrollGridDataList={payrollGridDataList?.[0]}
          empPayType={empPayType}
          getPREmployeeList={getPREmployeeList}
          datePaid={datePaid}
          PREmployeeDistributions={PREmployeeDistributions}
          payrollGridData={payrollGridData}
          PayrollToatals={PayrollToatals}
        />
      )}

      {openSecondPopup && (
        <AddEditPayrollTypeSecondPopup
          data={secondGrid}
          onClose={toggleSecondDialog}
          setData={setSecondGrid}
          handlePayrollTotalDetail={handlePayrollTotalDetail}
          payrollGridDataList={payrollGridDataList?.[0]}
          empPayType={empPayType}
          getPREmployeeList={getPREmployeeList}
          datePaid={datePaid}
          PREmployeeDistributions={PREmployeeDistributions}
          payrollGridData={payrollGridData}
          PayrollToatals={PayrollToatals}
        />
      )}

      {openThirdPopup && (
        <AddEditPayrollTypeThirdPopup
          data={thirdGrid}
          onClose={toggleThirdDialog}
          setData={setThirdGrid}
          payrollGridDataList={payrollGridDataList?.[0]}
        />
      )}
    </div>
  );
};

export default PayrollAttendanceRight;
