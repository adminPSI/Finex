import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  EmplTimecardEndPoints,
  ExpenseEndPoints,
  PayrollAttendance,
  PayrollEndPoints,
  ReportsEndPoints
} from "../../EndPoints";
import {
  FormCheckbox,
  FormDatePicker,
  FormDropDownList
} from "../form-components";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";
import PdfViewer from "./pdfViewer/PdfViewer";
export default function TimeCardReports() {
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
  const [benefitVal, ] = React.useState();
  const [fileType, setFileType] = useState("PDF")

  const formRef = useRef();

  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [selectedTab, setSelectedTab] = useState(0);

  const [dueDateDropdownData, setDueDateDropdownData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [CACDDList, setCACDDList] = React.useState([]);
  const [, setBenefitList] = React.useState([]);
  const [daysAhead, ] = useState();
  const [hoursTilMax, ] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [pdfURL, setPdfURL] = useState("");
  const [employeeDataByID, setEmployeeData] = useState()
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
      });
  };

  const BindEmployeeDropdown = async () => {
    return axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.ByGroupNumber,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data?.data;
        if (data && data.length) {
          setEmployeeList([
            {
              id: null,
              name: "Select Employee",
            },
            ...data.map((item) => {
              return {
                ...item,
                name: item.fullName,
                id: item.empId,
              };
            }),
          ]);
        }
      })
      .catch(() => { });
  };

  const ddlEmployeeChange = async (event) => {
    if (event.target.value != null) {
      setEmployee(event.target.value.id);
      setEmployeeData(event.target.value)
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
        console.log(error)
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
        console.log(error)
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
    if (!selectedStartDate || !selectedEndDate) {
      showErrorNotification("Please select Start and End Dates");
    } else {
      if (reportType == undefined || reportType == null) {
        showErrorNotification("Please select Report");
      } else {
        let data;
        //This is report changes by soma
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
            }

            setOptionsPara([]);
            setTextBoxValue("");
          })
          .catch((error) => {
            console.log(error);
          });
      }
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
    "SuppressInactiveEmployees",
    "SuppressInactiveFunds",
    "SuppressInactiveAccountCodes",
    "VendorByPostDate",
    "SuppressInactiveIHACs",
    "SuppresZero",
    "Surpress00",
    "PayrollandBenefitsByPostDate",
  ];

  const [optionsPara, setOptionsPara] = useState(defaultSelected);
  const onCheckBoxPara = (e) => {
    if (e.target.value) {
      setOptionsPara((prev) => [...prev, e.target.name]);
    } else {
      setOptionsPara((prev) => prev.filter((item) => item !== e.target.name));
    }
  };
  const [textBoxValue, setTextBoxValue] = useState("");

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
            TimeCard Reports
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
                    label={"Start Date*"}
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
                    label={"End Date*"}
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
                    wrapperstyle={{ width: "220px" }}
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
        <TabStripTab title={"Timecard"}>
          <Form
            onSubmit={{}}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={""}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <Field
                          id="TimeCardTimeSheets"
                          name="TimeCardTimeSheets"
                          label="Print Timecard"
                          checked={options.TimeCardTimeSheets == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        {employeeDataByID?.isPayrollSpecialist || employeeDataByID?.isSupervisor && <Field
                          id="TimeCardTimeSheetsDateSpan"
                          name="TimeCardTimeSheetsDateSpan"
                          label="Print Time Card Details (Date Span)"
                          checked={options.TimeCardTimeSheetsDateSpan == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />}
                        <Field
                          id="EmpTimeCardVerification"
                          name="EmpTimeCardVerification"
                          label="Print Verification Report"
                          checked={options.EmpTimeCardVerification == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="TimeCardSummaryPayPeriod"
                          name="TimeCardSummaryPayPeriod"
                          label="Print Time Card Summary (Pay Period)"
                          checked={options.TimeCardSummaryPayPeriod == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="TimeCardSummaryDateSpan"
                          name="TimeCardSummaryDateSpan"
                          label="Print Time Card Summary (Date Span)"
                          checked={options.TimeCardSummaryDateSpan == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="CustomLeaveRequest"
                          name="CustomLeaveRequest"
                          label="Print Leave Request"
                          checked={options.CustomLeaveRequest == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPDetailDatePaidYTD"
                          name="VSPDetailDatePaidYTD"
                          label="Print Vaca, Sick, Pers Detailed"
                          checked={options.VSPDetailDatePaidYTD == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="VSPPayWithoutWages"
                          name="VSPPayWithoutWages"
                          label="Print Vaca, Sick, Pers Summary"
                          checked={options.VSPPayWithoutWages == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                        <Field
                          id="TrueHourly"
                          name="TrueHourly"
                          label="True Hourly Emps Only"
                          checked={options.TrueHourly == true}
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
      </TabStrip>
    </>
  );
}
