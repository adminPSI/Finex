import React, { useEffect, useState } from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import EmployeeHistory from "../EmployeeHistory";
import { Button } from "@progress/kendo-react-buttons";
import PayrollAttendanceRight from "../PayrollAttendanceRight";
import axiosInstance from "../../../core/HttpInterceptor";
import { payrollEndpoints } from "../../../EndPoints";

const PayrollEmployeeHistory = ({ viewEmployeeHistoryPopup, employeeId }) => {
  const [EmployeePaidHistoryData, setEmployeePaidHistoryData] = useState([]);
  const [selectedState, setSelectedState] = useState({});
  const [benefitData, setBenefitData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [payrollGridDataList, setPayrollGridDataList] = useState([]);

  const getEmployeePaidHistory = async (empid) => {
    axiosInstance({
      method: "GET",
      url: payrollEndpoints.EmployeePaidHistory + `/?empid=${empid}`,
      withCredentials: true,
    }).then((response) => {
      let data = response.data;
      setEmployeePaidHistoryData(data);
    });
  };

  const PREmployeeDistributions = ({
    selected,
    key,
    selectedRowId,
    datePaid,
  }) => {
    if (
      selected &&
      selected == "selected" &&
      key &&
      selectedRowId &&
      datePaid
    ) {
      let ApiUrl =
        payrollEndpoints.PayrollTotalDeatial +
        `/?datePaid=${datePaid}` +
        `&empId=${selectedRowId}` +
        `&jobId=${key}`;

      axiosInstance({
        method: "GET",
        url: ApiUrl,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setPayrollGridDataList([data]);
        })
        .catch(() => {});
    } else {
      setPayrollGridDataList([]);
    }
  };

  useEffect(() => {
    getEmployeePaidHistory(employeeId);
  }, [employeeId]);

  return (
    <Dialog
      title={<span>Employee History</span>}
      onClose={viewEmployeeHistoryPopup}
    >
      <div
        className="row"
        style={{
          textAlign: "center",
          maxWidth: "1200px",
          width: "100%",
          maxHeight: "90vh",
          height: "100%",
        }}
      >
        <div
          className={
            Object.keys(selectedState) && Object.keys(selectedState).length
              ? "col-8"
              : "col-12"
          }
        >
          <EmployeeHistory
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            EmployeePaidHistoryData={EmployeePaidHistoryData}
            benefitData={benefitData}
            setBenefitData={setBenefitData}
            distributionData={distributionData}
            setDistributionData={setDistributionData}
            PREmployeeDistributions={PREmployeeDistributions}
          />
        </div>
        {Object.keys(selectedState) && Object.keys(selectedState).length ? (
          <div className="col-4">
            <PayrollAttendanceRight
              width="100%"
              displayFirstGrid={true}
              displayThirdGrid={true}
              payrollGridDataList={payrollGridDataList}
              displayAddEditFirstGrid={false}
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <DialogActionsBar
        style={{
          margin: "10px",
          textAlign: "center",
          width: "100px",
        }}
      >
        <Button themeColor={"primary"} onClick={viewEmployeeHistoryPopup}>
          Close
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};

export default PayrollEmployeeHistory;
