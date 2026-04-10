import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import PayrollAttendanceRight from "./PayrollAttendanceRight";
import PayrollFilterForm from "./payroll/PayrollFilterForm";
import PayrollGrid from "./payroll/PayrollGrid";
import PayrollTotalForm from "./payroll/PayrollTotalForm";

import {
  PayrollAttendance,
  PayrollEmployeeSetup,
  payrollEndpoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
const ProjectGrid = () => {
  const [bindDataGrid, setBindDataGrid] = useState(null);
  const [payrollTotalsData, setPayrollTotalsData] = useState(null);
  const [payrollGridData, setPayrollGridData] = useState([]);
  const [payrollGridDataList, setPayrollGridDataList] = useState([]);
  const [payrollToatals, setPayrollToatals] = useState({});
  const [datePaid, setDatePaid] = useState("");
  const [payrollDetails, setPayrollDetails] = useState();
  const [empPayType, setEmpPayType] = useState(0);

  const [employeePayrollDistribution, setEmployeePayrollDistribution] =
    useState();

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.employeeNumber,
          bindDataGrid.groupNumber,
          bindDataGrid.employeeName,
          bindDataGrid.total,
          bindDataGrid.search,
          bindDataGrid.desc,
          bindDataGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);
  }, [bindDataGrid]);

  const BindDataGrid = async (
    employeeNumber,
    groupNumber,
    employeeName,
    total,
    search,
    desc,
    sortKey
  ) => {
    getPREmployeeList(
      datePaid,
      employeeNumber,
      groupNumber,
      employeeName,
      total,
      search,
      desc,
      sortKey
    );
  };

  const getPayrollTotals = async (date) => {
    return axiosInstance({
      method: "GET",
      url: payrollEndpoints.PayrollTotals + `/?datePaid=${date}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        if (data && data.length) setPayrollTotalsData(data[0]);
      })
      .catch(() => { });
  };

  const getPayrollDetails = async (date) => {
    const apiRequest = {
      DatePaid: date,
      mCustomPay: false,
    };
    return axiosInstance({
      method: "POST",
      url: PayrollAttendance.GetDatePaidDetailData,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPayrollDetails({ ...data, prDatePaid: date });
      })
      .catch(() => { });
  };

  const getPREmployeeList = async (
    date,
    employeeNumber = "",
    groupNumber = "",
    employeeName = "",
    total = "",
    search = "",
    desc = false,
    sortKey,
    empId
  ) => {
    return axiosInstance({
      method: "GET",
      url:
        payrollEndpoints.PREmployeeList +
        `/?datePaid=${date}&desc=${desc}&sortKey=${sortKey || ""}&groupNumber=${groupNumber}&employeeNumber=${employeeNumber}&employeeName=${employeeName}&total=${total}&search=${search}&skip=0&take=0`,
      withCredentials: true,
    }).then((response) => {
      let data = response.data?.data;
      setPayrollGridData(
        data.map((item) => {
          if (item?.id == empId) {
            setEmployeePayrollDistribution(item?.payrollTotalDistributions)
            return {
              ...item,
              expanded: true,
            };
          }
          return {
            ...item,
          };
        })
      );
    });
  };

  const PayrollToatals = async (date, empId, cacId) => {
    let ApiUrl = payrollEndpoints.PayrollToatals + `/?datePaid=${date}`;
    if (empId) {
      ApiUrl += `&empId=${empId}`;
    }
    if (cacId) {
      ApiUrl += `&cacId=${cacId}`;
    }

    return axiosInstance({
      method: "GET",
      url: ApiUrl,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPayrollToatals(data);
      })
      .catch(() => { });
  };

  const handleFormDatePicker = async (date) => {
    setPayrollTotalsData(null);
    setPayrollGridDataList([]);
    setPayrollGridData([]);
    await Promise.allSettled([
      getPREmployeeList(date),
      getPayrollTotals(date),
      PayrollToatals(date),
      getPayrollDetails(date),
    ]);
  };
  const getEmployeeData = (empId = "") => {
    axiosInstance({
      method: "GET",
      url: PayrollEmployeeSetup.getEmployeeGridData + `?empId=${empId}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setEmpPayType(data[0].empPayType);
      })
      .catch((e) => {
        console.log(e, "error");
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
        .catch(() => { });
    } else {
      setPayrollGridDataList([]);
    }
  };

  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollRun')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <React.Fragment>
      <div>
        <div style={{ width: "100%", display: "flex" }}>
          <PayrollFilterForm
            handleFormDatePicker={handleFormDatePicker}
            payrollTotalsData={payrollTotalsData}
            setDatePaid={setDatePaid}
            payrollDetails={payrollDetails}
            datePaid={datePaid}
            setBindDataGrid={setBindDataGrid}
            PayrollToatals={PayrollToatals}
            checkPrivialgeGroup={checkPrivialgeGroup}
          />
          <div style={{ width: "40%" }}>
            <PayrollTotalForm payrollToatals={payrollToatals} />
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", marginTop: "13px" }}>
          <div
            style={{
              width: "70%",
              marginRight: "10px",
            }}
          >
            <PayrollGrid
              setBindDataGrid={setBindDataGrid}
              bindDataGrid={bindDataGrid}
              setPayrollGridData={setPayrollGridData}
              datePaid={datePaid}
              payrollGridData={payrollGridData}
              PREmployeeDistributions={PREmployeeDistributions}
              PayrollToatals={PayrollToatals}
              payrollTotalsData={payrollTotalsData}
              setPayrollGridDataList={setPayrollGridDataList}
              getEmployeeData={getEmployeeData}
              getPREmployeeList={getPREmployeeList}
              employeePayrollDistribution={employeePayrollDistribution}
              setEmployeePayrollDistribution={setEmployeePayrollDistribution}
              checkPrivialgeGroup={checkPrivialgeGroup}
            />
          </div>
          {payrollGridDataList && payrollGridDataList.length ? (
            <PayrollAttendanceRight
              payrollGridDataList={payrollGridDataList}
              displayFirstGrid={true}
              displaySecondGrid={true}
              displayThirdGrid={true}
              displayAddEditFirstGrid={true}
              PREmployeeDistributions={PREmployeeDistributions}
              empPayType={empPayType}
              getPREmployeeList={getPREmployeeList}
              datePaid={datePaid}
              payrollGridData={payrollGridData}
              PayrollToatals={PayrollToatals}
              checkPrivialgeGroup={checkPrivialgeGroup}

            />
          ) : (
            <></>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProjectGrid;
