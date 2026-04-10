import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  ExpenseEndPoints,
  PayrollAttendance,
  PayrollEndPoints,
  ReportsEndPoints
} from "../../EndPoints";
import {
  FormCheckbox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
} from "../form-components";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";
import PdfViewer from "./pdfViewer/PdfViewer";
export default function PayrollReports() {
  React.useEffect(() => {
    BindDueDateDropdown();
    BindEmployeeDropdown();
    BindCACDropdown();
    BindBenefitDropdown();
  }, []);

  const [employeeId, setEmployee] = React.useState();
  const [dueDate, setDueDate] = React.useState();
  const [dueDate2, setDueDate2] = React.useState();
  const [CALVal, setCAC] = React.useState();
  const [benefitVal, setBenefit] = React.useState();
  const [fileType, setFileType] = useState("PDF")

  const formRef = useRef();

  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [selectedTab, setSelectedTab] = useState(0);

  const [dueDateDropdownData, setDueDateDropdownData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [CACDDList, setCACDDList] = React.useState([]);
  const [benefitList, setBenefitList] = React.useState([]);
  const [daysAhead, setDaysAhead] = useState();
  const [hoursTilMax, setHoursTilMax] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [pdfURL, setPdfURL] = useState("");

  useEffect(() => {
    if (pdfURL !== "") {
      setIsOpen(true);
    }
  }, [pdfURL]);

  const PDFViewer = (base64String, type) => {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: type });
    const url = URL.createObjectURL(blob);
    setPdfURL(url);
  };
  const handleTabSelect = (event) => {
    if (event.selected == 0) {
      formRef.current.values.endDate = null;
      setSelectedEndDate(null);
    }
    setSelectedTab(event.selected);
    setOptionsPara([]);
    setOptions({});
    setTextBoxValue("");
  };
  const handleSubmit = (dataItem) => {
    alert(dataItem + " submitted");
  };

  const BindDueDateDropdown = () => {
    axiosInstance({
      method: "GET",
      url: PayrollAttendance.DatePaid,
      withCredentials: false,
    })
      .then((response) => {
        setDueDateDropdownData(response.data);
      })
      .catch((error) => {
        console.log("Error", error)
      });
  };

  const BindEmployeeDropdown = async () => {
    return axiosInstance({
      method: "GET",
      url: PayrollEndPoints.Employee,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        if (data && data.length) {
          setEmployeeList([
            {
              id: null,
              name: "Select Employee",
            },
            ...data.map((item) => {
              return {
                name: item.displayName,
                id: item.id,
              };
            }),
          ]);
        }
      })
      .catch((error) => {
        console.log("Error", error)
      });
  };

  const ddlEmployeeChange = async (event) => {
    if (event.target.value != null) {
      setEmployee(event.target.value.id);
    }
  };

  const ddlDueDateChange = async (event) => {
    if (event.target.value != null) {
      setDueDate(event.target.value);
    }
  };
  const ddlDueDate2Change = async (event) => {
    if (event.target.value != null) {
      setDueDate2(event.target.value);
    }
  };
  const onCACChange = async (event) => {
    if (event.target.value != null) {
      setCAC(event.target.value.id);
    }
  };

  const benefitOnChange = async (event) => {
    if (event.target.value != null) {
      setBenefit(event.target.value.id);
    }
  };

  const BindCACDropdown = () => {
    axiosInstance({
      method: "GET",
      url: ExpenseEndPoints.GetExpenseCodeList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;

        let itemsData = [];
        data.forEach((data) => {
          let items = {
            desc: data.countyExpenseDescription,
            text: data.countyExpenseCode,
            id: data.id,
          };
          itemsData.push(items);
        });
        setCACDDList(itemsData);
      })
      .catch((error) => {
        
      });
  };

  const BindBenefitDropdown = () => {
    axiosInstance({
      method: "GET",
      url: PayrollEndPoints.Benefits,
      withCredentials: false,
    })
      .then((response) => {
        setBenefitList(response.data);
      })
      .catch((error) => {
        console.log("error", error)
      });
  };

  const updateStartDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedStartDate(date.toString());
  };
  const updateEndDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedEndDate(date.toString());
  };

  const downloadReportsCommonFunction = (reportType) => {
    // if (!selectedStartDate || !selectedEndDate) {
      // showErrorNotification("Please select Start and End Dates");
    // } else {
      if (reportType == undefined || reportType == null) {
        showErrorNotification("Please select Report");
      } else {
        let data;
        if (
          reportType == "PayrollReport" || 
          reportType == "Custom3" || 
          reportType == "PayrollReportBonus" || 
          reportType == "PayTotalsByCACByEmp" || 
          reportType == "PayrollTotalsHoursWorkedWithVacaEarnedDetail" || 
          reportType == "PRPayDistBySACDetail" || 
          reportType == "PRPayDistBySACDetailWithHours" || 
          reportType == "EmpJobsDescriptions" || 
          reportType == "TimeCardTimeSheets" || 
          reportType == "TrueHourly" ||
          reportType == "TimeSheets" || 
          reportType == "TimeCardPayrollEdit" || 
          reportType == "TimeSheetSalary" ||
          reportType == "EmpPayrollWithHoursSummary" || 
          reportType == "PRStaffReconciliation" || 
          reportType == "PRStaffReconciliationRegHours" || 
          reportType == "PRStaffReconciliationEmail" || 
          reportType == "EmployeeMailingLabels" || 
          reportType == "PayrollTotalsJobDescDateSpan" || 
          reportType == "PROTDetailByEmp" || 
          reportType == "PROTSummaryByEmp" || 
          reportType == "PRPayAndBenefitsDateSpanWAC" || 
          reportType == "PRPayAndBenefitsDateSpanSummary" || 
          reportType == "PRPayAndBenefitsDateSpanSummaryWithJobs" || 
          reportType == "PRPayAndBenefitsPostDateWAC" || 
          reportType == "PRPayAndBenefitsPostDateSummaryWAC" || 
          reportType == "PRPayAndBenefitsDateSpanSummaryPostDWithJobs" || 
          reportType == "PayAndBenefitsSummary" || 
          reportType == "PBL" || 
          reportType == "CountyLeaveAnalysis" || 
          reportType == "EmployeeHours" ||
          reportType == "ICFSalaries" || 
          reportType == "TouchScreenLoginLog" || 
          reportType == "TimeCardHoursSummaryElectronic" ||
          reportType == "TimeCardHoursDetailElectronic" ||
          reportType == "BenByPostDate" ||
          reportType == "BenefitSummary" || 
          reportType == "BenefitDetailByEmpCAC" || 
          reportType == "BenefitSummaryByEmpCAC" || 
          reportType == "BenefitDetailByEmpIhacSac" || 
          reportType == "Custom1" ||
          reportType == "Custom2" ||
          reportType == "BenefitsSetupByEmployee" || 
          reportType == "VSPPayWithoutWages" || 
          reportType == "VSPPayWithoutWagesByJob" || 
          reportType == "VSPPayWithWages" || 
          reportType == "VSPDetailDatePaidYTD" || 
          reportType == "VSPSummaryDatePaidYTD" || 
          reportType == "VSPLOWPDetailDatePaidYTD" || 
          reportType == "VSCSummaryYTD" || 
          reportType == "LeaveUsageWithoutPRData" || 
          reportType == "SuppressInactiveEmployees" ||
          reportType == "VSPDetailByDateSpan" || 
          reportType == "VSPSummaryDateSpan" || 
          reportType == "VSPDetailedByDateSpanUsageOnly" || 
          reportType == "MaxVacation" || 
          reportType == "VSPDetailByDateSpanFFCRA" || 
          reportType == "VSPSummaryDateSpanFFCRA" || 
          reportType == "VSPDetailDatePaidYTDEmail" || 
          reportType == "VSPSummaryDatePaidYTDEmail" || 
          reportType == "VSPDetailDatePaidYTDToSupervisorEmail" || 
          reportType == "LWOPByDateSpan" || 
          reportType == "PersonalTimeByDateSpan" || 
          reportType == "CompDetailed" || 
          reportType == "FMLADetail" || 
          reportType == "AdminLeaveByDateSpan" || 
          reportType == "ParentalLeaveByDateSpan" || 
          reportType == "FedPaidSick" || 
          reportType == "VSP3PerPage" || 
          reportType == "VSP5PerPage" || 
          reportType == "VSP6PerPage" || 
          reportType == "EmpRosterByName" || 
          reportType == "EmpBirthdays" || 
          reportType == "AttendanceLeaveRequest" || 
          reportType == "AttendanceTimeCard" || 
          reportType == "AttendanceVsTimeCard" ||
          reportType == "EmpTimeCardVerification" ||
          reportType == "TimeCardSummaryPayPeriod" ||
          reportType == "TimeCardSummaryDateSpan" ||
          reportType == "CustomLeaveRequest" ||
          reportType == "VSPDetailDatePaidYTDByName" ||
          reportType == "TimeCardTimeSheetsDateSpan"
        ) {
          data = {
            ReportName: reportType,
            exportType: fileType,
            DictionaryParameters: {},
          };
          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            EmployeeID: employeeId ?? "",
            DatePaid: dueDate ?? "",
            DatePaid2: dueDate2 ?? "",
            CACID: CALVal ?? "",
            OptionsParameter: optionsPara,
            BenefitID: benefitVal,
            HoursTilMax: hoursTilMax,
            DaysAhead: daysAhead
          };
          if (reportType == "SACCACSummary") {
            data.DictionaryParameters.Tag = "s,o";
          } else if (reportType == "IHACCACDetailGroupByCAC") {
            data.DictionaryParameters.Tag = "s,i";
          } else {
            data.DictionaryParameters.Tag = "s";
          }
        }

        axiosInstance({
          method: "POST",
          maxBodyLength: Infinity,
          url: ReportsEndPoints.GenerateReportPayroll,
          data: data,
        })
          .then((response) => {
            if (fileType == "PDF") {
              PDFViewer(response.data, "application/pdf");
            } else if (fileType == "XLS") {
              const binaryString = window.atob(response.data);
              const byteArray = new Uint8Array(binaryString.length);

              for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
              }

              const blob = new Blob([byteArray], { type: "text/XLS" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `Report${moment(new Date()).format("MMDDYYYY")}.xls`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else if (fileType == "CSV") {
              const binaryString = window.atob(response.data);
              const byteArray = new Uint8Array(binaryString.length);

              for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
              }

              const blob = new Blob([byteArray], { type: "text/csv:charset=utf-8" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `Report${moment(new Date()).format("MMDDYYYY")}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              console.log("Type is different")
            }

            setOptionsPara([]);
            setTextBoxValue("");
          })
          .catch((error) => {
            console.log(error);
          });
      // }
    }
  };

  const assetOptionsParameter = [
    {
      id: "PrintByEmpNo",
      label: "Print By Emp No",
    },
    {
      id: "PrintByGroupNo",
      label: "Print By Group No",
    },
  ];

  const [options, setOptions] = useState({});
  const onCheckBox = (e) => {
    setOptions({ [e.target.name]: e.target.value });
  };

  const defaultSelected = [
    // "SuppressInactiveEmployees",
    // "SuppressInactiveFunds",
    // "SuppressInactiveAccountCodes",
    // "VendorByPostDate",
    // "SuppressInactiveIHACs",
    // "SuppresZero",
    // "Surpress00",
    // "PayrollandBenefitsByPostDate",
  ];

  const [optionsPara, setOptionsPara] = useState(defaultSelected);
  const onCheckBoxPara = (e) => {
    if (e.target.value) {
      setOptionsPara((prev) => [...prev, e.target.name]);
    } else {
      setOptionsPara((prev) => prev.filter((item) => item !== e.target.name));
    }
  };
  const [, setTextBoxValue] = useState("");

  const downloadReport = () => {
    downloadReportsCommonFunction(Object.keys(options)[0]);
  };

  return (
    <>
      {isOpen && (
        <PdfViewer
          pdfURL={pdfURL}
          setPdfURL={setPdfURL}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll Reports
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Crystal Reports
          </li>
        </ol>
      </nav>
      <Form
        className="d-flex align-items-center justify-content-center"
        onSubmit={handleSubmit}
        ref={formRef}
        render={(formRenderProps) => (
          <FormElement>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <fieldset className={""}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Field
                    id={"startDate"}
                    name={"startDate"}
                    label={"Start Date"}
                    component={FormDatePicker}
                    onChange={updateStartDate}
                    value={selectedStartDate}
                    wrapperstyle={{
                      width: "170px",
                    }}
                  />
                  <Field
                    id={"endDate"}
                    name={"endDate"}
                    label={"End Date"}
                    component={FormDatePicker}
                    onChange={updateEndDate}
                    {...(selectedStartDate &&
                      selectedTab == 0 && {
                      max: new Date(
                        new Date(selectedStartDate)?.getFullYear(),
                        new Date(selectedStartDate)?.getMonth() + 1,
                        0
                      ),
                      min: new Date(
                        new Date(selectedStartDate)?.getFullYear(),
                        new Date(selectedStartDate)?.getMonth(),
                        new Date(selectedStartDate)?.getDate()
                      ),
                    })}
                    wrapperstyle={{
                      width: "170px",
                    }}
                  />
                  <div style={{
                    marginTop: "40px"
                  }}>
                    <DropDownList data={["PDF", "XLS"]}
                      value={fileType} onChange={(e) => {
                        setFileType(e?.value)
                      }}
                      wrapperstyle={{
                        width: "150px",
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    themeColor={"primary"}
                    style={{
                      marginTop: "40px",
                    }}
                    onClick={() => downloadReport()}
                  >
                    Show
                  </Button>
                  <Field
                    id={"employee"}
                    name={"employee"}
                    label={"Employee"}
                    textField="name"
                    dataItemKey="id"
                    component={FormDropDownList}
                    data={employeeList}
                    value={employeeList?.id}
                    onChange={ddlEmployeeChange}
                    wrapperstyle={{
                      width: "250px",
                    }}
                  />

                  <Field
                    id={"datePaid"}
                    name={"datePaid"}
                    label={"Paid Date From"}
                    component={FormDropDownList}
                    data={dueDateDropdownData}
                    value={dueDate}
                    onChange={ddlDueDateChange}
                    placeholder="Date Paid"
                    filterable={false}
                    wrapperstyle={{
                      width: "170px",
                    }}
                  />
                  <Field
                    id={"datePaid2"}
                    name={"datePaid2"}
                    label={"Paid Date To"}
                    component={FormDropDownList}
                    data={dueDateDropdownData}
                    value={dueDate2}
                    onChange={ddlDueDate2Change}
                    placeholder="Date Paid"
                    filterable={false}
                    wrapperstyle={{
                      width: "170px",
                    }}
                  />
                  <Field
                    id={"cac"}
                    name={"cac"}
                    label={"County Code"}
                    textField="text"
                    dataItemKey="id"
                    component={FormDropDownList}
                    data={CACDDList}
                    value={CALVal}
                    onChange={onCACChange}
                    wrapperstyle={{ width: "220px"}}
                    placeholder="Search CAC..."
                  />
                </div>
              </fieldset>
            </div>
            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "end",
              }}
            >
              {assetOptionsParameter.map((p, i) => {
                return (
                  <Field
                    key={i}
                    id={p.id}
                    name={p.id}
                    label={p.label}
                    checked={optionsPara.includes(p.id)}
                    component={FormCheckbox}
                    onChange={onCheckBoxPara}
                  />
                );
              })}
            </div>
          </FormElement>
        )}
      />

      <br></br>
      <TabStrip selected={selectedTab} onSelect={handleTabSelect}>
        <TabStripTab title={"Payroll Reports"}>
          <Form
            onSubmit={{}}
            render={(formRenderProps) => (
              <FormElement>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    paddingTop: "20px",
                  }}
                >
                  <div>
                    <h6>Reports</h6>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <Field
                          id="PayrollReport"
                          name="PayrollReport"
                          label="Standard Payroll Report"
                          checked={options.PayrollReport == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="PayrollReportBonus"
                          name="PayrollReportBonus"
                          label="Standard Payroll Report (Bonus Pay Only)"
                          checked={options.PayrollReportBonus == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="PayTotalsByCACByEmp"
                          name="PayTotalsByCACByEmp"
                          label="Payroll Totals by CAC by Employee By Date Span"
                          checked={options.PayTotalsByCACByEmp == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="PayrollTotalsHoursWorkedWithVacaEarnedDetail"
                          name="PayrollTotalsHoursWorkedWithVacaEarnedDetail"
                          label="Payroll Totals With Hours Worked With Vaca Earned (Detail)"
                          checked={
                            options.PayrollTotalsHoursWorkedWithVacaEarnedDetail ==
                            true
                          }
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="PRPayDistBySACDetail"
                          name="PRPayDistBySACDetail"
                          label="Totals Pay Distribution with IHAC and SAC (Detail)"
                          checked={options.PRPayDistBySACDetail == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />

                        <Field
                          id="PRPayDistBySACDetailWithHours"
                          name="PRPayDistBySACDetailWithHours"
                          label="Totals Pay Distribution with IHAC and Hours (Detail)"
                          checked={
                            options.PRPayDistBySACDetailWithHours == true
                          }
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="EmpJobsDescriptions"
                          name="EmpJobsDescriptions"
                          label="Employee Job Descriptions"
                          checked={options.EmpJobsDescriptions == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />

                        <Field
                          id="EmpPayrollWithHoursSummary"
                          name="EmpPayrollWithHoursSummary"
                          label="Employee Payroll With Hours Summary"
                          checked={options.EmpPayrollWithHoursSummary == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="PRStaffReconciliation"
                          name="PRStaffReconciliation"
                          label="Staff Reconciliation With Total Hours"
                          checked={options.PRStaffReconciliation == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="PRStaffReconciliationRegHours"
                          name="PRStaffReconciliationRegHours"
                          label="Staff Reconciliation With Regular Hours"
                          checked={
                            options.PRStaffReconciliationRegHours == true
                          }
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="PRStaffReconciliationEmail"
                          name="PRStaffReconciliationEmail"
                          label="Staff Reconciliation With Total Hours (Email)"
                          checked={options.PRStaffReconciliationEmail == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="EmployeeMailingLabels"
                          name="EmployeeMailingLabels"
                          label="Employee Mailing Labels"
                          checked={options.EmployeeMailingLabels == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <Field
                        id="PayrollTotalsJobDescDateSpan"
                        name="PayrollTotalsJobDescDateSpan"
                        label="Payroll Totals By Job Description By Date Span"
                        checked={options.PayrollTotalsJobDescDateSpan == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PROTDetailByEmp"
                        name="PROTDetailByEmp"
                        label="Overtime Detailed By Employee"
                        checked={options.PROTDetailByEmp == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PROTSummaryByEmp"
                        name="PROTSummaryByEmp"
                        label="Overtime Summary By Employee"
                        checked={options.PROTSummaryByEmp == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PRPayAndBenefitsDateSpanWAC"
                        name="PRPayAndBenefitsDateSpanWAC"
                        label="Payroll and Benefits by Date Span Detailed By Payroll Date"
                        checked={options.PRPayAndBenefitsDateSpanWAC == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PRPayAndBenefitsDateSpanSummary"
                        name="PRPayAndBenefitsDateSpanSummary"
                        label="Payroll and Benefits by Date Span Summary By Payroll Date"
                        checked={
                          options.PRPayAndBenefitsDateSpanSummary == true
                        }
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PRPayAndBenefitsDateSpanSummaryWithJobs"
                        name="PRPayAndBenefitsDateSpanSummaryWithJobs"
                        label="Payroll and Benefits by Date Span Summary By Payroll Date With Jobs"
                        checked={
                          options.PRPayAndBenefitsDateSpanSummaryWithJobs ==
                          true
                        }
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PRPayAndBenefitsPostDateWAC"
                        name="PRPayAndBenefitsPostDateWAC"
                        label="Payroll and Benefits by Date Span Detailed By Post Date"
                        checked={options.PRPayAndBenefitsPostDateWAC == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PRPayAndBenefitsPostDateSummaryWAC"
                        name="PRPayAndBenefitsPostDateSummaryWAC"
                        label="Payroll and Benefits by Date Span Summary By Post Date"
                        checked={
                          options.PRPayAndBenefitsPostDateSummaryWAC == true
                        }
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PRPayAndBenefitsDateSpanSummaryPostDWithJobs"
                        name="PRPayAndBenefitsDateSpanSummaryPostDWithJobs"
                        label="Payroll and Benefits by Date Span Summary By Post Date With Jobs"
                        checked={
                          options.PRPayAndBenefitsDateSpanSummaryPostDWithJobs ==
                          true
                        }
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PayAndBenefitsSummary"
                        name="PayAndBenefitsSummary"
                        label="Payroll and Benefits Totals by Date Span By Post Date (Summary)"
                        checked={options.PayAndBenefitsSummary == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="PBL"
                        name="PBL"
                        label="Payroll, Benefits and Liabilities Totals by Date Span By Post Date (Summary)"
                        checked={options.PBL == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="CountyLeaveAnalysis"
                        name="CountyLeaveAnalysis"
                        label="County Leave Analysis"
                        checked={options.CountyLeaveAnalysis == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />
                      <Field
                        id="EmployeeHours"
                        name="EmployeeHours"
                        label="Employee Hours"
                        checked={options.EmployeeHours == true}
                        component={FormCheckbox}
                        onChange={onCheckBox}
                      />

                    </div>
                  </div>
                </div>
              </FormElement>
            )}
          />
        </TabStripTab>
        <TabStripTab title={"Benefits"}>
          <Form
            onSubmit={{}}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={""}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Field
                      id={"Benefit"}
                      name={"Benefit"}
                      label={"Benefit"}
                      textField="benefitsName"
                      dataItemKey="id"
                      component={FormDropDownList}
                      data={benefitList?.data}
                      value={benefitVal}
                      onChange={benefitOnChange}
                      placeholder="Combo Benefit..."
                      wrapperstyle={{
                        width: "30%",
                      }}
                      filterable={false}
                    />
                  </div>

                  <div className="mt-5">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <Field
                          id="BenByPostDate"
                          name="BenByPostDate"
                          label="By Post Date"
                          checked={options.BenByPostDate == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="BenefitSummary"
                          name="BenefitSummary"
                          label="Summary"
                          checked={options.BenefitSummary == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="BenefitDetailByEmpCAC"
                          name="BenefitDetailByEmpCAC"
                          label="Detail By Employee CAC Only"
                          checked={options.BenefitDetailByEmpCAC == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="BenefitSummaryByEmpCAC"
                          name="BenefitSummaryByEmpCAC"
                          label="Summary By Employee CAC Only"
                          checked={options.BenefitSummaryByEmpCAC == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />

                        <Field
                          id="BenefitDetailByEmpIhacSac"
                          name="BenefitDetailByEmpIhacSac"
                          label="Detail By Employee CAC, IHAC and SAC"
                          checked={options.BenefitDetailByEmpIhacSac == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="Custom1"
                          name="Custom1"
                          label="Payroll and Benefit Totals by Date Span by Post Date (Custom)"
                          checked={options.Custom1 == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="Custom2"
                          name="Custom2"
                          label="Payroll and Benefit Totals by Date Span by Date Paid (Custom)"
                          checked={options.Custom2 == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="BenefitsSetupByEmployee"
                          name="BenefitsSetupByEmployee"
                          label="Benefit Setup by Employee"
                          checked={options.BenefitsSetupByEmployee == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </FormElement>
            )}
          />
        </TabStripTab>
        <TabStripTab title={"Vaca, Sick, Personal"}>
          <Form
            onSubmit={{}}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={""}>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <Field
                      id={"DaysAhead"}
                      name={"DaysAhead"}
                      label={"Days Ahead"}
                      component={FormInput}
                      onChange={(e) => setDaysAhead(e?.value)}
                    />
                    <Field
                      id={"HoursTilMax"}
                      name={"HoursTilMax"}
                      label={"Hours Until Max"}
                      component={FormInput}
                      onChange={(e) => setHoursTilMax(e?.value)}
                    />
                  </div>

                  <div className="mt-5">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h6>Reports</h6>
                        <Field
                          id="VSPPayWithoutWages"
                          name="VSPPayWithoutWages"
                          label="Pay Date Without Wages"
                          checked={options.VSPPayWithoutWages == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPPayWithoutWagesByJob"
                          name="VSPPayWithoutWagesByJob"
                          label="Pay Date Without Wages by Job Classification"
                          checked={options.VSPPayWithoutWagesByJob == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPPayWithWages"
                          name="VSPPayWithWages"
                          label="Pay Date With Wages"
                          checked={options.VSPPayWithWages == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                      <div>
                        <h6>Options Parameter</h6>
                        <div>
                          <Field
                            id="SuppressInactiveEmployees"
                            name="SuppressInactiveEmployees"
                            label="Suppress Inactive Employees"
                            checked={optionsPara.includes(
                              "SuppressInactiveEmployees"
                            )}
                            component={FormCheckbox}
                            onChange={onCheckBoxPara}
                          />
                        </div>
                      </div>
                      <div></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: "10px",
                      }}
                    >
                      <div>
                        <Field
                          id="VSPDetailDatePaidYTD"
                          name="VSPDetailDatePaidYTD"
                          label="VSP Detailed By Date Paid, Year to Date"
                          checked={options.VSPDetailDatePaidYTD == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPSummaryDatePaidYTD"
                          name="VSPSummaryDatePaidYTD"
                          label="VSP Summary By Date Paid, Year to Date"
                          checked={options.VSPSummaryDatePaidYTD == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPLOWPDetailDatePaidYTD"
                          name="VSPLOWPDetailDatePaidYTD"
                          label="VSPLWOP Detailed By Date Paid, Year to Date"
                          checked={options.VSPLOWPDetailDatePaidYTD == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSCSummaryYTD"
                          name="VSCSummaryYTD"
                          label="VCS Summary By Date Paid, Year to Date"
                          checked={options.VSCSummaryYTD == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="LeaveUsageWithoutPRData"
                          name="LeaveUsageWithoutPRData"
                          label="Leave Usage by Date Span"
                          checked={options.LeaveUsageWithoutPRData == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                      <div>
                        <Field
                          id="VSPDetailByDateSpan"
                          name="VSPDetailByDateSpan"
                          label="VSP Detailed By Date Span"
                          checked={options.VSPDetailByDateSpan == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPSummaryDateSpan"
                          name="VSPSummaryDateSpan"
                          label="VSP Summary By Date Span"
                          checked={options.VSPSummaryDateSpan == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPDetailedByDateSpanUsageOnly"
                          name="VSPDetailedByDateSpanUsageOnly"
                          label="VSP Detailed By Date Span (Usage Only)"
                          checked={
                            options.VSPDetailedByDateSpanUsageOnly == true
                          }
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="MaxVacation"
                          name="MaxVacation"
                          label="Max Vacation"
                          checked={options.MaxVacation == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                      <div>
                        <Field
                          id="VSPDetailByDateSpanFFCRA"
                          name="VSPDetailByDateSpanFFCRA"
                          label="VSP Detailed By Date Span w/ FFCRA"
                          checked={options.VSPDetailByDateSpanFFCRA == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPSummaryDateSpanFFCRA"
                          name="VSPSummaryDateSpanFFCRA"
                          label="VSP Summary By Date Span w/ FFCRA"
                          checked={options.VSPSummaryDateSpanFFCRA == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "20px",
                      }}
                    >
                      <div>
                        <Field
                          id="VSPDetailDatePaidYTDEmail"
                          name="VSPDetailDatePaidYTDEmail"
                          label="VSP Detailed By Date Paid, Year to Date (Email to Employees)"
                          checked={options.VSPDetailDatePaidYTDEmail == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPSummaryDatePaidYTDEmail"
                          name="VSPSummaryDatePaidYTDEmail"
                          label="VSP Summary By Date Paid, Year to Date (Email to Supervisors)"
                          checked={options.VSPSummaryDatePaidYTDEmail == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                      <div>
                        <Field
                          id="VSPDetailDatePaidYTDToSupervisorEmail"
                          name="VSPDetailDatePaidYTDToSupervisorEmail"
                          label="VSP Detailed By Date Paid, Year to Date (Email to Supervisors)"
                          checked={
                            options.VSPDetailDatePaidYTDToSupervisorEmail ==
                            true
                          }
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                      <div
                        style={{
                          width: "19%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "20px",
                      }}
                    >
                      <div>
                        <div>
                          <Field
                            id="LWOPByDateSpan"
                            name="LWOPByDateSpan"
                            label="Leave Without Pay by Date Span"
                            checked={options.LWOPByDateSpan == true}
                            component={FormCheckbox}
                            onChange={onCheckBox}
                          />
                          <Field
                            id="PersonalTimeByDateSpan"
                            name="PersonalTimeByDateSpan"
                            label="Personal Time by Date Span"
                            checked={options.PersonalTimeByDateSpan == true}
                            component={FormCheckbox}
                            onChange={onCheckBox}
                          />
                          <Field
                            id="CompDetailed"
                            name="CompDetailed"
                            label="Comp Time By Date Span"
                            checked={options.CompDetailed == true}
                            component={FormCheckbox}
                            onChange={onCheckBox}
                          />
                        </div>
                      </div>
                      <div>
                        <Field
                          id="FMLADetail"
                          name="FMLADetail"
                          label="FMLA Detail"
                          checked={options.FMLADetail == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="AdminLeaveByDateSpan"
                          name="AdminLeaveByDateSpan"
                          label="Administrative Leave by Date Span"
                          checked={options.AdminLeaveByDateSpan == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "20px",
                      }}
                    >
                      <div> </div>
                      <div> </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "20px",
                      }}
                    >
                      <div>
                        <Field
                          id="EmpRosterByName"
                          name="EmpRosterByName"
                          label="Employee Roster By Name"
                          checked={options.EmpRosterByName == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="EmpBirthdays"
                          name="EmpBirthdays"
                          label="Employee Birthdays (Enter start date or leave blank)"
                          checked={options.EmpBirthdays == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                      <div>
                        <Field
                          id="AttendanceLeaveRequest"
                          name="AttendanceLeaveRequest"
                          label="Attendance Leave Request Verification"
                          checked={options.AttendanceLeaveRequest == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="AttendanceTimeCard"
                          name="AttendanceTimeCard"
                          label="Time Card Versus Attendance Verification"
                          checked={options.AttendanceTimeCard == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="AttendanceVsTimeCard"
                          name="AttendanceVsTimeCard"
                          label="Attendance Versus Time Card Verification"
                          checked={options.AttendanceVsTimeCard == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </div>
                      <div
                        style={{
                          width: "24%",
                        }}
                      ></div>
                    </div>
                  </div>
                </fieldset>
              </FormElement>
            )}
          />
        </TabStripTab>
      </TabStrip>
    </>
  );
}
