import { getter } from "@progress/kendo-data-query";
import { Reveal } from "@progress/kendo-react-animation";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import {
  Card,
  ContextMenu,
  ExpansionPanel,
  ExpansionPanelContent,
  MenuItem,
} from "@progress/kendo-react-layout";
import {
  editToolsIcon,
  eyedropperIcon,
  eyeSlashIcon,
  plusOutlineIcon
} from "@progress/kendo-svg-icons";
import { cloneElement, Fragment, useEffect, useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  ConfigurationEndPoints,
  PayrollEmployee,
  PayrollEndPoints,
  SignificantRates
} from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import { useStartEndDateValidatorForSingle } from "../../../helper/useStartEndDateValidatorForSingle";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormNumericTextBox,
} from "../../form-components";
import {
  hiredDateValidator,
  payrollJobDescValidator,
  salaryHourlyRateValidator,
  salaryPersonalYearEndDateValidator,
  salaryPersonalYearStartDateValidator,
  salaryStartDateValidator,
  startDateValidator
} from "../../validators";
import { AllSalaries } from "./modals/AllSalaries";
import { EditSalaries } from "./modals/EditSalaries";
const Jobs = ({
  jobSelectedState,
  setJobSelectedState,
  onJobSelected,
  setSelectedJob,
  selectedJob,
  setSelectedEmployeeId,
  selectedEmployeeId,
  empWorkMonths,
  employeeList,
}) => {
  const formRef = useRef();
  const [data, setData] = useState(null);
  const [addEditJob, setAddEditJob] = useState(false);
  const [addSalaries, setAddSalaries] = useState(false);

  const [JobList, setJobList] = useState([]);
  const [masterJobList, setMasterJobList] = useState([]);
  const [showInactive, setShowInactive] = useState(false);

  const [employeeId, setEmployeeId] = useState(null);
  const [show, setShow] = useState(false);
  const [selectedRowId, setselectedRowId] = useState(0);
  const [formInit, setFormInit] = useState({});
  const [primaryJobDescription, setPrimaryJobDescription] = useState()
  const [notificationState, setNotificationState] = useState({
    none: false,
    success: false,
    error: false,
    warning: false,
    info: false,
    notificationMessage: "",
  });
  const [columnShow, setColumnShow] = useState(false);
  const [, setIsFatch] = useState(true);
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const [fullTime, setFullTime] = useState(false);

  const {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
    resetDatesFun,
  } = useStartEndDateValidatorForSingle();

  useEffect(() => {
    getJob({ id: selectedEmployeeId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId, showInactive]);

  const getJob = async ({ id }) => {
    setSelectedEmployeeId(id);
    if (id) {
      try {
        const { data } = await axiosInstance({
          method: "GET",
          url: PayrollEmployee.job + "/" + id + `?active=${!showInactive}`,
          withCredentials: false,
        });
        setAddEditJob(false);
        setEmployeeId(id);
        setSelectedEmployeeId(id);
        const mapData = employeeList.filter((el) => el?.empId == id)[0]
        setFullTime(mapData?.fullTime);
        setPrimaryJobDescription(data.data[0]?.jobDescription?.empJobDescription)
        setMasterJobList([
          ...data.data.filter((item) => item.primaryJob),
          ...data.data.filter((item) => !item.primaryJob),
        ]);
        setExpandedGrid();
      } catch (e) {
        console.log(e, "error");
      }
    }
  };

  const onToggle = (flag, notificationMessage) =>
    setNotificationState({
      ...notificationState,
      [flag]: !notificationState[flag],
      notificationMessage: notificationMessage,
    });
  const offset = useRef({
    left: 0,
    top: 0,
  });

  useEffect(() => {
    getJobList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getJobList = async () => {
    try {
      const { data } = await axiosInstance({
        method: "GET",
        url: PayrollEmployee.jobList,
        withCredentials: false,
      });

      setJobList(data);
    } catch (e) {
      console.log(e, "error");
    }
  };

  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };

  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };

  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          editJobToggleDialog(id);
          break;

        case "inactive":
          break;

        case "addSalaryToJob":
          getSalary(id);
          setTimeout(() => {
            setAddSalaries(true)
          }, 100)
          break;
        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const CommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleContextMenu}
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </Button>
      </td>
    </>
  );
  const [salariesMenuOpen, setSalariesMenuOpen] = useState(false);
  const [editSalariesMenuOpen, setEditSalariesMenuOpen] = useState(false);

  let [expandedGrid, setExpandedGrid] = useState();
  let [formDataRate, setFormDataRate] = useState({});
  const [formDistributionPanelData, setFormDistributionPanelData] = useState();
  const [isPersonalUse, setIsPersonalUse] = useState(false);

  useEffect(() => {
    setFormDataRate({});
    getConfig();
  }, []);

  const [formDataSalary, setFormDataSalary] = useState(null);
  const [formKeyDistributionPanel, setFormKeyDistributionPanel] = useState(0);

  const getConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/78",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setIsPersonalUse(value);
      })
      .catch(() => { });
  };

  const handleSubmitRate = async (dataItem) => {
    setIsFatch(true);
    let rateForm = {
      id: dataItem.id || 0,
      orgAccountId: dataItem.orgAccountId,
      payDistId: dataItem.payDistId,
      hoursWorked: +dataItem.hoursWorked,
      hoursPaid: dataItem.hoursPaid,
      hoursPerDay: dataItem.hoursPerDay,
      overTimeRate: dataItem.overTimeRate,
      holidayRate: dataItem.holidayRate,
      vacationRate: dataItem.vacationRate,
      vacationLimit: dataItem.vacationLimit,
      sickRate: dataItem.sickRate,
      sickLimit: dataItem.sickLimit,
      personalRate: dataItem.personalRate,
      personalLimit: dataItem.personalLimit,
      vacationYears: dataItem.vacationYears,
      maxVacation: +dataItem.maxVacation,
      lowRate: dataItem.lowRate,
    };
    rateForm.payDistId = data.id;
    if (dataItem.id > 0) {
      await axiosInstance({
        method: "PUT",
        url: `${SignificantRates.SignificantRatesByPayDistId}/${dataItem.id}`,
        data: rateForm,
        withCredentials: false,
      })
        .then(() => {
          getSignificantRates();
        })
        .catch((err) => {
          console.log(err, "err");
        });
    } else {
      await axiosInstance({
        method: "POST",
        url: `${SignificantRates.SignificantRatesByPayDistId}`,
        data: rateForm,
        withCredentials: false,
      })
        .then(() => {
          getSignificantRates();
        })
        .catch((err) => {
          console.log(err, "err");
        });
    }
  };

  const handleSubmitDate = async (dataItem) => {
    let dateForm = {
      id: dataItem.id,
      hiredDate: dataItem.hiredDate,
      fullTimeHire: dataItem.fullTimeHire,
      lastDate: dataItem.lastDate,
      years: dataItem.years,
      days: dataItem.days,
      countyDate: dataItem.countyDate,
      yearsDD: dataItem.yearsDD,
      daysDD: dataItem.daysDD,
      anniversaryDateDD: dataItem.anniversaryDateDD,
      empStepDate: dataItem.empStepDate,
      rehireDate: dataItem.rehireDate,
      empDateCurrentPos: dataItem.empDateCurrentPos,
      evalDate: dataItem.evalDate,
      evalNoticeSentDate: dataItem.evalNoticeSentDate,
      evalCompletionDate: dataItem.evalCompletionDate,
      orgAccountId: dataItem.orgAccountId,
    };
    dateForm.payDistId = data.id;
    if (dataItem.id > 0) {
      await axiosInstance({
        method: "PUT",
        url: `${SignificantRates.SignificantDatesByPayDistId}/${dataItem.id}`,
        data: dateForm,
        withCredentials: false,
      })
        .then(() => {
          getSignificantDates();
        })
        .catch((err) => {
          console.log(err, "err");
        });
    } else {
      await axiosInstance({
        method: "POST",
        url: `${SignificantRates.SignificantDatesByPayDistId}`,
        data: dateForm,
        withCredentials: false,
      })
        .then(() => {
          getSignificantDates();
        })
        .catch((err) => {
          console.log(err, "err");
        });
    }
  };

  const handleSubmitSalary = (dataItem) => {

    const dataForm = {
      id: dataItem.id,
      jobId: selectedJob?.id,
      empId: selectedEmployeeId,
      startDate: dataItem.startDate ? new Date(dataItem.startDate) : null,
      endDate: dataItem.endDate ? new Date(dataItem.endDate) : null,
      hourlyRate: dataItem.hourlyRate,
      longevity: dataItem.longevity,
      step: dataItem.step,
      contractDays: dataItem.contractDays,
      paidHolidays: dataItem.paidHolidays,
      hoursPerYear: dataItem.hoursPerYear,
      currentPosStartDate: dataItem.currentPosStartDate
        ? new Date(dataItem.currentPosStartDate)
        : null,
      personalYearStartDate: dataItem.personalYearStartDate
        ? new Date(dataItem.personalYearStartDate)
        : null,
      personalYearEndDate: dataItem.personalYearEndDate
        ? new Date(dataItem.personalYearEndDate)
        : null,
      payDaySalary: dataItem.payDaySalary,
      //orG_ID: 0,
      salary: dataItem.annualSalary,
      payDistId: data.id,
    };
    if (dataItem.id > 0) {
      axiosInstance({
        method: "PUT",
        url: `${PayrollEmployee.UpdateSalary}/${dataForm.id}`,
        data: dataForm,
        withCredentials: false,
      })
        .then(() => {
          getSalary();
        })
        .catch((err) => {
          console.log(err, "err");
        });
      return;
    } else {
      axiosInstance({
        method: "POST",
        url: PayrollEmployee.Salary,
        data: dataForm,
        withCredentials: false,
      })
        .then(() => {
          getSalary();
        })
        .catch((error) => {
          console.log(error, "error");
        });
    }
  };

  const handleAddSalaryToJob = (dataItem) => {
    const dataForm = {
      id: dataItem.id,
      startDate: dataItem.startDate ? new Date(dataItem.startDate) : null,
      hourlyRate: dataItem.hourlyRate,
      payDaySalary: formDataSalary?.isSalarySelected == 82 ? dataItem.payDaySalary : 0,
    };
    if (dataItem.id > 0) {
      axiosInstance({
        method: "PUT",
        url: `${PayrollEmployee.AddSalaryToJob}/${dataForm.id}`,
        data: dataForm,
        withCredentials: false,
      })
        .then(() => {
          getSalary();
          getJob({ id: selectedEmployeeId });
          setAddSalaries(false);
        })
        .catch((err) => {
          console.log(err, "err");
        });
      return;
    } else {
      axiosInstance({
        method: "POST",
        url: PayrollEmployee.Salary,
        data: dataForm,
        withCredentials: false,
      })
        .then(() => {
          getSalary();
          getJob({ id: selectedEmployeeId });
          setAddSalaries(false);
        })
        .catch((error) => {
          console.log(error, "error");
        });
    }
  }
  const PullFromOrganizationData = async () => {
    try {
      setExpandedGrid("Significant Rate");
      if (!formDataRate) {
        await getSignificantRates();
      }
      const result = await axiosInstance({
        method: "GET",
        url: `${PayrollEndPoints.Defaults}`,
        withCredentials: false,
      });
      let obj = {
        overTimeRate: result.data?.defaultOtRates,
        holidayRate: result.data?.defaultHolidsayRate,
        vacationRate: result.data?.defaultVacationRate,
        sickRate: result.data?.defaultSickRate,
        sickLimit: result.data?.defaultSickLimit
      };

      if (formDataRate) {
        obj.id = formDataRate.id;
        obj.payDistId = data.id;
        obj.orgAccountId = formDataRate.orgAccountId;
        obj.payDistId = formDataRate.payDistId;
        obj.hoursWorked = formDataRate.hoursWorked;
        obj.hoursPaid = formDataRate.hoursPaid;
        obj.hoursPerDay = formDataRate.hoursPerDay;
        obj.vacationLimit = formDataRate.vacationLimit;
        obj.sickLimit = formDataRate.sickLimit;
        obj.personalRate = formDataRate.personalRate;
        obj.personalLimit = formDataRate.personalLimit;
        obj.vacationYears = formDataRate.vacationYears;
        obj.maxVacation = formDataRate.maxVacation;
        obj.lowRate = formDataRate.lowRate;
      }
      for (let key in obj) {
        if (formRef.current) {
          //formRef.current.valueSetter(key,obj[key]);
          formRef.current.onChange(key, {
            name: key,
            touched: true,
            value: obj[key],
          });
        }
      }
      setFormDataRate({ ...obj });
      setIsFatch(false);
    } catch (e) {
      console.log(e, "error");
    }
  };

  const getSignificantRates = async () => {
    try {
      const result = await axiosInstance({
        method: "GET",
        url: `${SignificantRates.SignificantRatesByPayDistId}/${data.id}`,
        withCredentials: false,
      });
      formDataRate = result.data;
      setFormDataRate({ ...result.data });
      setFormKeyDistributionPanel(formKeyDistributionPanel + 1);
      return result.data;
    } catch (e) {
      console.log(e, "error");
    }
  };

  const getSalary = async (id) => {
    try {
      const salaryId = id !== undefined ? id : data.id
      const result = await axiosInstance({
        method: "GET",
        url: `${PayrollEmployee.getSalary}/${salaryId}`,
        withCredentials: false,
      });
      let res = result.data;
      res = {
        ...res,
        startDate: result.data?.startDate
          ? new Date(result.data?.startDate)
          : null,
        endDate: result.data?.endDate ? new Date(result.data?.endDate) : null,
        currentPosStartDate: result.data?.currentPosStartDate
          ? new Date(result.data?.currentPosStartDate)
          : null,
        personalYearStartDate: result.data?.personalYearStartDate
          ? new Date(result.data?.personalYearStartDate)
          : null,
        personalYearEndDate: result.data?.personalYearEndDate
          ? new Date(result.data?.personalYearEndDate)
          : null,
        isSalarySelected: employeeList.find(
          (item) => item.empId == selectedEmployeeId
        )?.empPayType,
        annualSalary:
          (result.data?.payDaySalary == null ? 0 : result.data?.payDaySalary) *
          26,
        primaryJobDescription: primaryJobDescription
      };
      setFormDataSalary(res);
      setFormKeyDistributionPanel(formKeyDistributionPanel + 1);
      return result.data;
    } catch (e) {
      console.log(e, "error");
    }
  };

  const getSignificantDates = async () => {
    try {
      const result = await axiosInstance({
        method: "GET",
        url: `${SignificantRates.SignificantDatesByPayDistId}/${data.id}`,
        withCredentials: false,
      });

      let obj = {
        id: result.data?.id,
        orgAccountId: result.data?.orgAccountId,
        payDistId: result.data?.payDistId,
        hiredDate:
          result.data?.hiredDate == null
            ? null
            : new Date(result.data?.hiredDate),
        fullTimeHire:
          result.data?.fullTimeHire == null
            ? null
            : new Date(result.data?.fullTimeHire),
        lastDate:
          result.data?.lastDate == null
            ? null
            : new Date(result.data?.lastDate),
        years: result.data?.years,
        days: result.data?.days,
        countyDate:
          result.data?.countyDate == null
            ? null
            : new Date(result.data?.countyDate),
        yearsDD: result.data?.yearsDD,
        daysDD: result.data?.daysDD,
        anniversaryDateDD:
          result.data?.anniversaryDateDD == null
            ? null
            : new Date(result.data?.anniversaryDateDD),
        empStepDate:
          result.data?.empStepDate == null
            ? null
            : new Date(result.data?.empStepDate),
        rehireDate:
          result.data?.rehireDate == null
            ? null
            : new Date(result.data?.rehireDate),
        empDateCurrentPos:
          result.data?.empDateCurrentPos == null
            ? null
            : new Date(result.data?.empDateCurrentPos),
        evalDate:
          result.data?.evalDate == null
            ? null
            : new Date(result.data?.evalDate),
        evalNoticeSentDate:
          result.data?.evalNoticeSentDate == null
            ? null
            : new Date(result.data?.evalNoticeSentDate),
        evalCompletionDate:
          result.data?.evalCompletionDate == null
            ? null
            : new Date(result.data?.evalCompletionDate),
      };
      setFormDistributionPanelData(obj);
      setFormKeyDistributionPanel(formKeyDistributionPanel + 1);
    } catch (e) {
      console.log(e, "error");
    }
  };
  const handleApiCall = (panelKey) => {
    // eslint-disable-next-line eqeqeq
    const newExpandedPanel = panelKey == expandedGrid ? "" : panelKey;
    setExpandedGrid(newExpandedPanel);

    if (newExpandedPanel == "Significant Rate") {
      getSignificantRates();
    } else if (newExpandedPanel == "Significant Date") {
      getSignificantDates();
    } else if (newExpandedPanel == "Salary") {
      getSalary();
    }
  };

  const addEditJobToggleDialog = () => {
    resetDatesFun();
    setAddEditJob(!addEditJob);
    if (addEditJob) {
      setFormInit([]);
    }
  };

  const addSalariesToggleDialog = () => {
    setAddSalaries(false)
  }
  const editJobToggleDialog = (dataItem) => {
    axiosInstance({
      method: "GET",
      url: PayrollEmployee.EmployeeJobInfo + "/" + dataItem,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        data.startDate = data.startDate ? new Date(data.startDate) : null;
        data.endDate = data.endDate ? new Date(data.endDate) : null;
        let jobIndex = JobList.findIndex((x) => x.id == data.jobDescripId);
        if (jobIndex > -1) {
          data.jobDesc = JobList[jobIndex];
        }
        setFormInit(data);
        setAddEditJob(true);
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  const JobddlOnChange = (event) => {
    if (event.syntheticEvent.type == "click") {
      let jobIndex = JobList.findIndex((x) => x.id == event.target.value.id);
      if (jobIndex > -1) {
        setSelectedJob(JobList[jobIndex]);
      }
    }
  };

  const itemRender = (li, itemProps) => {
    const itemChildren = (
      <div>
        <span
          style={{
            fontWeight: "bold",
          }}
        >
          {li.props.children}
        </span>
        <br></br>
        <span>{itemProps.dataItem.desc}</span>
      </div>
    );
    return cloneElement(li, li.props, itemChildren);
  };

  const formHandleSubmit = async (dataItem) => {
    let apiRequest = {
      id: dataItem.id,
      empId: employeeId,
      jobDescId: dataItem.jobDesc.id,
      jobClassId: 3,
      startDate: dataItem.startDate,
      endDate: dataItem.endDate,
      primaryJob: dataItem.primaryJob ?? false,
    };
    if (dataItem.id) {
      try {
        await axiosInstance({
          method: "PUT",
          url: PayrollEmployee.EmployeeJobInfo + "/" + dataItem.id,
          data: apiRequest,
          withCredentials: false,
        });
        getJob({ id: employeeId });
        setFormInit([]);
      } catch (error) {
        if (error.response.status == 400) {
          let errorMessage = error?.response?.data || "Something went wrong!";
          onToggle("error", errorMessage);
          setTimeout(
            () =>
              setNotificationState({
                ...notificationState,
                error: false,
                notificationMessage: "",
              }),
            3000
          );
        }
      }
    } else {
      try {
        await axiosInstance({
          method: "POST",
          url: PayrollEmployee.EmployeeJobInfo,
          data: apiRequest,
          withCredentials: false,
        });
        getJob({ id: employeeId });
      } catch (error) {
        if (error.response.status == 400) {
          let errorMessage = error?.response?.data || "Something went wrong!";
          onToggle("error", errorMessage);
          setTimeout(
            () =>
              setNotificationState({
                ...notificationState,
                error: false,
                notificationMessage: "",
              }),
            3000
          );
        }
      }
    }
  };

  const onInactiveCheckBox = (event) => {
    setShowInactive(!showInactive);
  };

  const expandChange = (event) => {
    let newData = masterJobList.map((item) => {
      if (item.id == event.dataItem.id) {
        item.expanded = !event.dataItem.expanded;
      }
      return item;
    });
    setMasterJobList(newData);
  };

  const DetailComponent = (props) => {
    const [selectedStartDateSalary, setSelectedStartDateSalary] = useState();
    const [selectedEndDateSalary, setSelectedEndDateSalary] = useState();
    const [endDateErrorSalary, setEndDateErrorSalary] = useState("");

    const data = props.dataItem;
    setData(data);

    useEffect(() => {
      setSelectedStartDateSalary(props.dataItem.startDate);
      setSelectedEndDateSalary(props.dataItem.endDate);
    }, [props.dataItem.endDate, props.dataItem.startDate]);

    const updateStartDateSalary = (formRenderProps) => {
      let dateformat = new Date(formRenderProps.value);
      let month =
        dateformat.getMonth() < 9
          ? "0" + (dateformat.getMonth() + 1)
          : dateformat.getMonth() + 1;
      let date =
        month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

      setSelectedStartDateSalary(date.toString());
      localEndDateValidatorSalary({ startdate: dateformat });
    };

    const localEndDateValidatorSalary = ({ enddate, startdate }) => {
      const startDateSalary = new Date(startdate ?? selectedStartDateSalary);
      const endDateSalary = new Date(enddate ?? selectedEndDateSalary);

      if (!startDateSalary) {
        setEndDateErrorSalary("Please select start date first");
        return;
      }
      if (startDateSalary && endDateSalary && endDateSalary < startDateSalary) {
        setEndDateErrorSalary("End date should be greater than start date");
      } else {
        setEndDateErrorSalary("");
      }
    };

    const updateEndDateSalary = (formRenderProps) => {
      let dateformat = new Date(formRenderProps.value);
      let month =
        dateformat.getMonth() < 9
          ? "0" + (dateformat.getMonth() + 1)
          : dateformat.getMonth() + 1;
      let date =
        month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

      setSelectedEndDateSalary(date.toString());
      localEndDateValidatorSalary({ enddate: dateformat });
    };

    const fullTimeHireValidator1 = (value) => {
      if (fullTime) {
        return value ? "" : "Full time hired is required."
      } else {
        return ""
      }
    }

    const salaryContractDaysValidator1 = (value) => {
      if (fullTime) {
        return value ? "" : "Contract Days is required."
      } else {
        return ""
      }
    }

    const salaryPaidHolidaysValidator1 = (value) => {
      if (fullTime) {
        return value ? "" : "Paid Holidays is required."
      } else {
        return ""
      }
    }

    const salaryHoursPerYearValidator1 = (value) => {
      if (fullTime) {
        return value ? "" : "Hours Per Year is required."
      } else {
        return ""
      }
    }

    const countyDateValidator1 = (value) => {
      if (fullTime) {
        return value ? "" : "Anniversary Date hired is required."
      } else {
        return ""
      }
    }
    return (
      <>
        <div>

          <ExpansionPanel
            className={"k-expanded-payroll"}
            title="Significant Rate"
            expanded={expandedGrid == "Significant Rate"}
            tabIndex={0}
            key="Significant Rate"
            onAction={(event) => {
              handleApiCall("Significant Rate");
            }}
          >
            <Reveal>
              {expandedGrid == "Significant Rate" && (
                <ExpansionPanelContent>
                  <div className="d-flex justify-content-end mb-2">
                    {checkPrivialgeGroup("PSSRPODB", 2) && <Button
                      className="k-button k-button-lg k-rounded-lg"
                      themeColor={"primary"}
                      onClick={PullFromOrganizationData}
                    >
                      Pull from organization data
                    </Button>}
                  </div>
                  <Form
                    ref={formRef}
                    onSubmit={handleSubmitRate}
                    initialValues={formDataRate}
                    key={formKeyDistributionPanel}
                    render={(formRenderProps) => {

                      return (
                        <>
                          <FormElement>
                            <fieldset className={"k-form-fieldset"}>
                              <Card className="">
                                <div style={{ padding: 15 }}>
                                  <div className="d-flex justify-content-center gap-3 ">
                                    <Field
                                      id={"hoursWorked"}
                                      name={"hoursWorked"}
                                      label={`Hours worked${empWorkMonths == 12 ? "*" : ""}`}
                                      min={0}
                                      component={FormNumericTextBox}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                      validator={(value) => {
                                        const f1 = value;
                                        const f2 = formRenderProps.valueGetter("hoursPerDay");

                                        if (!f1 && !f2) {
                                          return "Atleast one field is required";
                                        }

                                        if (!f1 && empWorkMonths == 12) {
                                          return "Value required."
                                        }

                                        return "";
                                      }}
                                    />
                                    <Field
                                      id={"hoursPaid"}
                                      name={"hoursPaid"}
                                      label={`Hours Paid${empWorkMonths == 12 ? "" : ""}`}
                                      min={0}
                                      component={FormNumericTextBox}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                  </div>

                                  <div className="d-flex justify-content-center  gap-3">
                                    <Field
                                      id={"hoursPerDay"}
                                      name={"hoursPerDay"}
                                      label={"Hours Per Day*"}
                                      component={FormNumericTextBox}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                      validator={(value) => {
                                        const f1 = value;
                                        const f2 = formRenderProps.valueGetter("hoursPerDay");

                                        if (!f1 && !f2) {
                                          return "Atleast one field is required";
                                        }

                                        return "";
                                      }}
                                    />
                                    <Field
                                      id={"overTimeRate"}
                                      name={"overTimeRate"}
                                      label={"Overtime Rate"}
                                      component={FormNumericTextBox}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                  </div>
                                  <div className="d-flex justify-content-center  gap-3">
                                    <Field
                                      id={"holidayRate"}
                                      name={"holidayRate"}
                                      label={"Holiday Rate"}
                                      component={FormNumericTextBox}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                    <Field
                                      id={"vacationRate"}
                                      name={"vacationRate"}
                                      label={"Vacation Rate"}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      component={FormNumericTextBox}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                  </div>
                                  <div className="d-flex justify-content-center  gap-3">
                                    <Field
                                      id={"vacationLimit"}
                                      name={"vacationLimit"}
                                      label={"Vacation Limit"}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      component={FormNumericTextBox}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                    <Field
                                      id={"sickRate"}
                                      name={"sickRate"}
                                      label={"Sick Time Rate"}
                                      component={FormNumericTextBox}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                  </div>
                                  <div className="d-flex justify-content-center  gap-3">
                                    <Field
                                      id={"sickLimit"}
                                      name={"sickLimit"}
                                      label={"Sick Time Limit"}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      component={FormNumericTextBox}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                    <Field
                                      id={"vacationYears"}
                                      name={"vacationYears"}
                                      label={"Vacation Rate Years"}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      component={FormNumericTextBox}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                  </div>

                                  <div className="d-flex justify-content-center  gap-3">
                                    <Field
                                      id={"maxVacation"}
                                      name={"maxVacation"}
                                      label={"Max Vacation"}
                                      format={{
                                        style: "decimal",
                                        maximumFractionDigits: 4,
                                      }}
                                      component={FormNumericTextBox}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                    />
                                    <Field
                                      id={"empTotalYears"}
                                      name={"empTotalYears"}
                                      component={FormInput}
                                      wrapperstyle={{
                                        width: "45%",
                                      }}
                                      type={"hidden"}
                                    />
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      paddingTop: 40,
                                      gap: 20,
                                    }}
                                  >
                                    <Button
                                      className="k-button k-button-sm k-rounded-lg k-w-full k-button-expanded-payroll-submit k-button-expanded-payroll-cancel"
                                      themeColor={"bootstrap"}
                                      onClick={(event) => {
                                        handleApiCall("Significant Rate");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                                      themeColor={"primary"}
                                      type={"submit"}
                                      disabled={!formRenderProps.allowSubmit}
                                    >
                                      Submit
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            </fieldset>
                          </FormElement>
                        </>
                      );
                    }}
                  />
                </ExpansionPanelContent>
              )}
            </Reveal>
          </ExpansionPanel>

          <ExpansionPanel
            className={"k-expanded-payroll"}
            title="Salary"
            expanded={expandedGrid == "Salary"}
            tabIndex={0}
            key={formKeyDistributionPanel}
            onAction={(event) => {
              handleApiCall("Salary");
            }}
          >
            <Reveal>
              {expandedGrid == "Salary" && (
                <>
                  <ExpansionPanelContent>
                    <Form
                      onSubmit={handleSubmitSalary}
                      initialValues={formDataSalary}
                      ref={formRef}
                      render={(formRenderProps) => {
                        return (
                          <>
                            <FormElement>
                              <fieldset className={"k-form-fieldset"}>
                                <Card className="">
                                  <div style={{ padding: 16 }}>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Field
                                        id={"startDate"}
                                        name={"startDate"}
                                        label={"Start Date*"}
                                        component={FormDatePicker}
                                        onChange={updateStartDateSalary}
                                        value={selectedStartDateSalary}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                        validator={salaryStartDateValidator}
                                      />
                                      <div style={{ width: "45%" }}>
                                        <Field
                                          id={"endDate"}
                                          name={"endDate"}
                                          label={"End Date"}
                                          component={FormDatePicker}
                                          onChange={updateEndDateSalary}
                                          wrapperstyle={{}}
                                          startDate={formRenderProps.valueGetter(
                                            "startDate"
                                          )}
                                        />
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Field
                                        id={"currentPosStartDate"}
                                        name={"currentPosStartDate"}
                                        label={"Current Postion Start Date"}
                                        component={FormDatePicker}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                      />

                                      <Field
                                        id={"longevity"}
                                        name={"longevity"}
                                        label={"Longevity"}
                                        component={FormInput}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                      />
                                    </div>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Field
                                        id={"step"}
                                        name={"step"}
                                        label={"Step"}
                                        component={FormNumericTextBox}
                                        spinners={false}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                      />

                                      <Field
                                        id={"contractDays"}
                                        name={"contractDays"}
                                        label={`Contract Days ${fullTime ? "*" : ""}`}
                                        component={FormNumericTextBox}
                                        spinners={false}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                        validator={salaryContractDaysValidator1}
                                        onChange={(e) => {
                                          var contractDays =
                                            formRef?.current?.valueGetter(
                                              "contractDays"
                                            );
                                          var paidHolidays =
                                            formRef?.current?.valueGetter(
                                              "paidHolidays"
                                            );
                                          var hoursPerDay =
                                            formRef?.current?.valueGetter(
                                              "hoursPerDay"
                                            );

                                          if (isNaN(contractDays))
                                            contractDays = 0;
                                          if (isNaN(paidHolidays))
                                            paidHolidays = 0;
                                          if (isNaN(hoursPerDay)) hoursPerDay = 0;

                                          formRef?.current?.valueSetter(
                                            "hoursPerYear",
                                            (contractDays + paidHolidays) *
                                            hoursPerDay
                                          );
                                        }}
                                      />
                                    </div>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Field
                                        id={"paidHolidays"}
                                        name={"paidHolidays"}
                                        label={`Paid Holidays ${fullTime ? "*" : ""}`}
                                        component={FormNumericTextBox}
                                        spinners={false}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                        validator={salaryPaidHolidaysValidator1}
                                        onChange={(e) => {
                                          var contractDays =
                                            formRef?.current?.valueGetter(
                                              "contractDays"
                                            );
                                          var paidHolidays =
                                            formRef?.current?.valueGetter(
                                              "paidHolidays"
                                            );
                                          var hoursPerDay =
                                            formRef?.current?.valueGetter(
                                              "hoursPerDay"
                                            );

                                          if (isNaN(contractDays))
                                            contractDays = 0;
                                          if (isNaN(paidHolidays))
                                            paidHolidays = 0;
                                          if (isNaN(hoursPerDay)) hoursPerDay = 0;

                                          formRef?.current?.valueSetter(
                                            "hoursPerYear",
                                            (contractDays + paidHolidays) *
                                            hoursPerDay
                                          );
                                        }}
                                      />
                                      <Field
                                        id={"hoursPerYear"}
                                        name={"hoursPerYear"}
                                        label={`Hours per Year ${fullTime ? "*" : ""}`}
                                        component={FormNumericTextBox}
                                        spinners={false}
                                        disabled={true}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                        validator={salaryHoursPerYearValidator1}
                                      />
                                    </div>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Field
                                        id={"personalYearStartDate"}
                                        name={"personalYearStartDate"}
                                        label={`Personal Year Start Date${isPersonalUse ? "*" : ""}`}
                                        component={FormDatePicker}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                        validator={
                                          isPersonalUse &&
                                          salaryPersonalYearStartDateValidator
                                        }
                                      />
                                      <Field
                                        id={"personalYearEndDate"}
                                        name={"personalYearEndDate"}
                                        label={`Personal Year End${isPersonalUse ? "*" : ""}`}
                                        component={FormDatePicker}
                                        startDate={formRenderProps.valueGetter(
                                          "personalYearStartDate"
                                        )}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                        validator={
                                          isPersonalUse &&
                                          salaryPersonalYearEndDateValidator
                                        }
                                      />
                                    </div>

                                    <div className="d-flex justify-content-center gap-3">
                                      {formDataSalary?.isSalarySelected ==
                                        82 && (
                                          <>
                                            <Field
                                              id={"payDaySalary"}
                                              name={"payDaySalary"}
                                              format={"c2"}
                                              label={"Pay Day Salary"}
                                              spinners={false}
                                              component={FormNumericTextBox}
                                              wrapperstyle={{
                                                width: "45%",
                                              }}
                                              onChange={(e) => {
                                                var annualSalary =
                                                  (e.target.value || 0) * 26;
                                                formRef?.current?.valueSetter(
                                                  "annualSalary",
                                                  annualSalary
                                                );
                                                var hoursPerYear =
                                                  formRef?.current?.valueGetter(
                                                    "hoursPerYear"
                                                  );
                                                formRef?.current?.valueSetter(
                                                  "hourlyRate",
                                                  annualSalary / hoursPerYear
                                                );
                                              }}
                                            />

                                            <Field
                                              id={"annualSalary"}
                                              name={"annualSalary"}
                                              format={"c2"}
                                              label={"Annual Salary"}
                                              spinners={false}
                                              component={FormNumericTextBox}
                                              wrapperstyle={{
                                                width: "45%",
                                              }}
                                              onChange={(e) => {
                                                var payDaySalary =
                                                  (e.target.value || 0) / 26;
                                                formRef?.current?.valueSetter(
                                                  "payDaySalary",
                                                  payDaySalary
                                                );
                                                var hoursPerYear =
                                                  formRef?.current?.valueGetter(
                                                    "hoursPerYear"
                                                  );
                                                formRef?.current?.valueSetter(
                                                  "hourlyRate",
                                                  e.target.value / hoursPerYear
                                                );
                                              }}
                                            />
                                          </>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-center gap-3">
                                      <Field
                                        id={"hourlyRate"}
                                        name={"hourlyRate"}
                                        label={"Hourly Rate*"}
                                        format={"c2"}
                                        component={FormNumericTextBox}
                                        min={0}
                                        spinners={false}
                                        wrapperstyle={{
                                          width: "45%",
                                        }}
                                        validator={salaryHourlyRateValidator}
                                        onChange={(e) => {
                                          var hoursPerYear =
                                            formRef?.current?.valueGetter(
                                              "hoursPerYear"
                                            );
                                          var annualSalary =
                                            hoursPerYear * (e.target.value || 0);
                                          formRef?.current?.valueSetter(
                                            "annualSalary",
                                            annualSalary
                                          );

                                          formRef?.current?.valueSetter(
                                            "payDaySalary",
                                            annualSalary / 26
                                          );
                                        }}
                                      />
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        paddingTop: 40,
                                        gap: 20,
                                      }}
                                    >
                                      <Button
                                        className="k-button k-button-sm k-rounded-lg k-w-full k-button-expanded-payroll-submit k-button-expanded-payroll-cancel"
                                        themeColor={"bootstrap"}
                                        onClick={(event) => {
                                          handleApiCall("Salary");
                                        }}
                                      >
                                        Cancel
                                      </Button>

                                      <Button
                                        className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                                        themeColor={"primary"}
                                        disabled={
                                          !formRenderProps.allowSubmit ||
                                          endDateErrorSalary
                                        }
                                        type={"submit"}
                                      >
                                        Submit
                                      </Button>
                                    </div>
                                    <div className="mb-5"></div>
                                  </div>
                                </Card>
                              </fieldset>
                            </FormElement>
                          </>
                        );
                      }}
                    />
                  </ExpansionPanelContent>
                </>
              )}
            </Reveal>
          </ExpansionPanel>

          <ExpansionPanel
            className={"k-expanded-payroll"}
            title="Significant Date"
            expanded={expandedGrid == "Significant Date"}
            tabIndex={0}
            key="Significant Date"
            onAction={(event) => {
              handleApiCall("Significant Date");
            }}
          >
            <Reveal>
              {expandedGrid == "Significant Date" && (
                <ExpansionPanelContent>
                  <Form
                    ref={formRef}
                    onSubmit={handleSubmitDate}
                    initialValues={formDistributionPanelData}
                    key={formKeyDistributionPanel}
                    render={(formRenderProps) => (
                      <>
                        <FormElement>
                          <fieldset className={"k-form-fieldset"}>
                            <Card className="">
                              <div
                                style={{ padding: 16 }}
                                className="d-flex flex-column align-items-center"
                              >
                                <Field
                                  id={"hiredDate"}
                                  name={"hiredDate"}
                                  label={"Date Hired*"}
                                  component={FormDatePicker}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                  validator={hiredDateValidator}
                                />
                                <Field
                                  id={"fullTimeHire"}
                                  name={"fullTimeHire"}
                                  label={`Full-Time Hire Date ${fullTime ? "*" : ""}`}
                                  component={FormDatePicker}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                  validator={fullTimeHireValidator1}
                                  onChange={(e) => {
                                    var fullTimeHire =
                                      formRef?.current?.valueGetter(
                                        "fullTimeHire"
                                      );
                                    var years =
                                      formRef?.current?.valueGetter("years");
                                    var days =
                                      formRef?.current?.valueGetter("days");
                                    var fullTimeHireDate = new Date();
                                    if (fullTimeHireDate !== "")
                                      fullTimeHireDate = new Date(fullTimeHire);
                                    if (isNaN(years)) years = 0;
                                    if (isNaN(days)) days = 0;

                                    fullTimeHireDate.setFullYear(
                                      fullTimeHireDate.getFullYear() -
                                      Number(years)
                                    );
                                    fullTimeHireDate.setDate(
                                      fullTimeHireDate.getDate() - Number(days)
                                    );

                                    formRef?.current?.valueSetter(
                                      "countyDate",
                                      fullTimeHireDate
                                    );
                                  }}
                                />
                                <Field
                                  id={"years"}
                                  name={"years"}
                                  label={"Years"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                  onChange={(e) => {
                                    var fullTimeHire =
                                      formRef?.current?.valueGetter(
                                        "fullTimeHire"
                                      );
                                    var years =
                                      formRef?.current?.valueGetter("years");
                                    var days =
                                      formRef?.current?.valueGetter("days");
                                    var fullTimeHireDate = new Date();
                                    if (fullTimeHireDate !== "")
                                      fullTimeHireDate = new Date(fullTimeHire);
                                    if (isNaN(years)) years = 0;
                                    if (isNaN(days)) days = 0;

                                    fullTimeHireDate.setFullYear(
                                      fullTimeHireDate.getFullYear() -
                                      Number(years)
                                    );
                                    fullTimeHireDate.setDate(
                                      fullTimeHireDate.getDate() - Number(days)
                                    );

                                    formRef?.current?.valueSetter(
                                      "countyDate",
                                      fullTimeHireDate
                                    );
                                  }}
                                  maxLength={4}
                                />

                                <Field
                                  id={"days"}
                                  name={"days"}
                                  label={"Days"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                  maxLength={4}
                                  format="#"
                                  onChange={(e) => {
                                    var fullTimeHire =
                                      formRef?.current?.valueGetter(
                                        "fullTimeHire"
                                      );
                                    var years =
                                      formRef?.current?.valueGetter("years");
                                    var days =
                                      formRef?.current?.valueGetter("days");
                                    var fullTimeHireDate = new Date();
                                    if (fullTimeHireDate !== "")
                                      fullTimeHireDate = new Date(fullTimeHire);
                                    if (isNaN(years)) years = 0;
                                    if (isNaN(days)) days = 0;

                                    fullTimeHireDate.setFullYear(
                                      fullTimeHireDate.getFullYear() -
                                      Number(years)
                                    );
                                    fullTimeHireDate.setDate(
                                      fullTimeHireDate.getDate() - Number(days)
                                    );

                                    formRef?.current?.valueSetter(
                                      "countyDate",
                                      fullTimeHireDate
                                    );
                                  }}
                                />

                                <Field
                                  id={"yearsDD"}
                                  name={"yearsDD"}
                                  label={"Years DD"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                  maxLength={4}
                                />
                                <Field
                                  id={"daysDD"}
                                  name={"daysDD"}
                                  label={"Days DD"}
                                  component={FormInput}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                  maxLength={4}
                                />
                                <Field
                                  id={"countyDate"}
                                  name={"countyDate"}
                                  label={`Anniversary Date ${fullTime ? "*" : ""}`}
                                  component={FormDatePicker}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                  disabled={true}
                                  validator={countyDateValidator1}
                                />
                                <Field
                                  id={"anniversaryDateDD"}
                                  name={"anniversaryDateDD"}
                                  label={"Anniversary Date DD"}
                                  component={FormDatePicker}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                />
                                <Field
                                  id={"empStepDate"}
                                  name={"empStepDate"}
                                  label={"Employee Step Date"}
                                  component={FormDatePicker}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                />
                                <Field
                                  id={"rehireDate"}
                                  name={"rehireDate"}
                                  label={"Rehire Date me"}
                                  component={FormDatePicker}
                                  wrapperstyle={{
                                    width: "90%",
                                  }}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    paddingTop: 40,
                                    gap: 20,
                                  }}
                                >
                                  <Button
                                    className="k-button k-button-sm k-rounded-lg k-w-full k-button-expanded-payroll-submit k-button-expanded-payroll-cancel"
                                    themeColor={"bootstrap"}
                                    onClick={(event) => {
                                      handleApiCall("Significant Date");
                                    }}
                                  >
                                    Cancel
                                  </Button>

                                  <Button
                                    className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                                    themeColor={"primary"}
                                    type={"submit"}
                                    disabled={!formRenderProps.allowSubmit}
                                  >
                                    Submit
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </fieldset>
                        </FormElement>
                      </>
                    )}
                  />
                </ExpansionPanelContent>
              )}
            </Reveal>
          </ExpansionPanel>
          {editSalariesMenuOpen && (
            <EditSalaries setEditSalariesMenuOpen={setEditSalariesMenuOpen} />
          )}

          {salariesMenuOpen && (
            <AllSalaries
              setSalariesMenuOpen={setSalariesMenuOpen}
              setEditSalariesMenuOpen={setEditSalariesMenuOpen}
            />
          )}
        </div>
      </>
    );
  };

  const DATA_ITEM_KEY = "id";
  const idGetter = getter(DATA_ITEM_KEY);
  const SELECTED_FIELD = "selected";

  const jobRowClick = (data) => {
    let update = false;
    if (Object.keys(jobSelectedState) && Object.keys(jobSelectedState).length) {
      if (parseInt(Object.keys(jobSelectedState)[0]) !== data.dataItem.id) {
        update = true;
      } else {
        setJobSelectedState({});
        setSelectedJob();
        setMasterJobList(
          masterJobList.map((item) => ({
            ...item,
            [SELECTED_FIELD]: false,
          }))
        );
      }
    } else {
      update = true;
    }

    if (update) {
      setJobSelectedState({ [data.dataItem.id]: true });
      onJobSelected(data);
      setSelectedJob(data.dataItem);
      setMasterJobList(
        masterJobList.map((item) => ({
          ...item,
          [SELECTED_FIELD]: { [data.dataItem.id]: true }[idGetter(item)],
        }))
      );
    }
  };
  const updateStartDate = (formRenderProps) =>
    updateStartDateFun({
      formRenderProps,
      enddate: formInit?.endDate || selectedEndDate,
    });
  const updateEndDate = (formRenderProps) =>
    updateEndDateFun({
      formRenderProps,
      startdate: formInit?.startDate || selectedStartDate,
    });
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <Fragment>
      {checkPrivialgeGroup("PRSSRTab", 1) && <>
        <div className="d-flex mt-3  k-flex-row k-w-full k-justify-content-between mb-3">
          <div className="d-flex k-flex-column">
          </div>
          <div>
            {checkPrivialgeGroup("PSSAddJobB", 2) && (
              <Button
                className="k-button k-button-lg k-rounded-lg"
                themeColor={"primary"}
                onClick={() => {
                  setAddEditJob(true);
                }}
              >
                Add Job
              </Button>
            )}
          </div>
        </div>
        <>
          <div className="mt-3">
            {checkPrivialgeGroup("PSSRG", 1) && <Grid
              data={masterJobList}
              dataItemKey={DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                drag: false,
                cell: false,
                mode: "multiple",
              }}
              onRowClick={jobRowClick}
              detail={DetailComponent}
              expandField="expanded"
              onExpandChange={expandChange}
              pageable={{
                buttonCount: 4,
                pageSizes: [10, 15, "All"],
              }}
            >
              <GridToolbar>
                <div className="row col-sm-12 d-flex justify-content-end">
                  <div className="col-sm-6 gap-5 d-flex align-items-end justify-content-end">
                    {checkPrivialgeGroup("PSSRShowInactiveCB", 1) && (
                      <Checkbox
                        type="checkbox"
                        id="showInactive"
                        name="showInactive"
                        defaultChecked={showInactive}
                        value={showInactive}
                        onChange={onInactiveCheckBox}
                        label={"Show Inactive"}
                      />
                    )}
                    {checkPrivialgeGroup("SMICB", 1) && (
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
                </div>
              </GridToolbar>
              <GridColumn
                field="startDate"
                title="Start Date"
                editor="date"
                format="{0:MM/dd/yyyy}"
                cell={(props) => {
                  const [year, month, day] = props.dataItem?.startDate
                    ? props.dataItem?.startDate.split("T")[0].split("-")
                    : [null, null, null];
                  return (
                    <td>
                      {props.dataItem?.startDate
                        ? `${month}/${day}/${year}`
                        : null}
                    </td>
                  );
                }}
              />
              <GridColumn
                field="endDate"
                title="End Date"
                editor="date"
                format="{0:MM/dd/yyyy}"
                cell={(props) => {
                  const [year, month, day] = props.dataItem?.endDate
                    ? props.dataItem?.endDate.split("T")[0].split("-")
                    : [null, null, null];
                  return (
                    <td>
                      {props.dataItem?.endDate ? `${month}/${day}/${year}` : null}
                    </td>
                  );
                }}
              />

              <GridColumn
                field="jobDescription.empJobDescription"
                title="Primary Job Description"
              />
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
              {columnShow && (
                <GridColumn field="modifiedBy" title="Modified By" />
              )}
              <GridColumn cell={CommandCell} />
            </Grid>}
            <ContextMenu
              show={show}
              offset={offset.current}
              onSelect={handleOnSelect}
              onClose={handleCloseMenu}
            >
              {checkPrivialgeGroup("PSSREditCM", 3) && (
                <MenuItem
                  text="Edit Job"
                  data={{
                    action: "edit",
                  }}
                  svgIcon={eyedropperIcon}
                />
              )}
              {/* {checkPrivialgeGroup("PSSRMakeInactiveCM", 3) && (
                <MenuItem
                  text="Make Inactive"
                  data={{
                    action: "inactive",
                  }}
                  svgIcon={eyeSlashIcon}
                />
              )} */}

              {checkPrivialgeGroup("PSRDuplicateCM", 2) && (
                <MenuItem
                  text="Duplicate Job"
                  data={{
                    action: "duplicate",
                  }}
                  svgIcon={plusOutlineIcon}
                />
              )}

              {checkPrivialgeGroup("PSSREditCM", 3) && (
                <MenuItem
                  text="Add New Salary"
                  data={{
                    action: "addSalaryToJob",
                  }}
                  svgIcon={editToolsIcon}
                />
              )}
            </ContextMenu>
          </div>
          <div>
            {addSalaries && (
              <Dialog
                width={650}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-plus"></i>
                    <span className="ms-2">
                      {"Add Salary"}
                    </span>
                  </div>
                }
                onClose={addSalariesToggleDialog}
              >
                <Form
                  onSubmit={handleAddSalaryToJob}
                  initialValues={formDataSalary}
                  ref={formRef}
                  render={(formRenderProps) => {
                    return (
                      <>
                        <FormElement>
                          <fieldset className={"k-form-fieldset"}>
                            <Card className="">
                              <div style={{ padding: 16 }}>
                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"primaryJobDescription"}
                                    name={"primaryJobDescription"}
                                    label={"Primary Job Description"}
                                    component={FormInput}
                                    wrapperstyle={{
                                      width: "92%",
                                    }}
                                    disabled
                                  />
                                </div>
                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"startDate"}
                                    name={"startDate"}
                                    label={"Start Date*"}
                                    component={FormDatePicker}
                                    wrapperstyle={{
                                      width: "92%",
                                    }}
                                    validator={salaryStartDateValidator}
                                  />
                                </div>
                                <div className="d-flex justify-content-center gap-3">
                                  {formDataSalary?.isSalarySelected ==
                                    82 && (
                                      <>
                                        <Field
                                          id={"payDaySalary"}
                                          name={"payDaySalary"}
                                          format={"c2"}
                                          label={"Pay Day Salary"}
                                          spinners={false}
                                          component={FormNumericTextBox}
                                          wrapperstyle={{
                                            width: "45%",
                                          }}
                                          onChange={(e) => {
                                            var annualSalary =
                                              (e.target.value || 0) * 26;
                                            formRef?.current?.valueSetter(
                                              "annualSalary",
                                              annualSalary
                                            );
                                            var hoursPerYear =
                                              formRef?.current?.valueGetter(
                                                "hoursPerYear"
                                              );
                                            formRef?.current?.valueSetter(
                                              "hourlyRate",
                                              annualSalary / hoursPerYear
                                            );
                                          }}
                                        />

                                        <Field
                                          id={"annualSalary"}
                                          name={"annualSalary"}
                                          format={"c2"}
                                          label={"Annual Salary"}
                                          spinners={false}
                                          component={FormNumericTextBox}
                                          wrapperstyle={{
                                            width: "45%",
                                          }}
                                          onChange={(e) => {
                                            var payDaySalary =
                                              (e.target.value || 0) / 26;
                                            formRef?.current?.valueSetter(
                                              "payDaySalary",
                                              payDaySalary
                                            );
                                            var hoursPerYear =
                                              formRef?.current?.valueGetter(
                                                "hoursPerYear"
                                              );
                                            formRef?.current?.valueSetter(
                                              "hourlyRate",
                                              e.target.value / hoursPerYear
                                            );
                                          }}
                                        />
                                      </>
                                    )}
                                </div>

                                <div className="d-flex justify-content-center gap-3">
                                  <Field
                                    id={"hourlyRate"}
                                    name={"hourlyRate"}
                                    label={"Hourly Rate*"}
                                    format={"c2"}
                                    component={FormNumericTextBox}
                                    spinners={false}
                                    wrapperstyle={{
                                      width: "45%",
                                    }}
                                    validator={salaryHourlyRateValidator}
                                    onChange={(e) => {
                                      var hoursPerYear =
                                        formRef?.current?.valueGetter(
                                          "hoursPerYear"
                                        );
                                      var annualSalary =
                                        hoursPerYear * (e.target.value || 0);
                                      formRef?.current?.valueSetter(
                                        "annualSalary",
                                        annualSalary
                                      );

                                      formRef?.current?.valueSetter(
                                        "payDaySalary",
                                        annualSalary / 26
                                      );
                                    }}
                                  />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    paddingTop: 40,
                                    gap: 20,
                                  }}
                                >
                                  <Button
                                    className="k-button k-button-sm k-rounded-lg k-w-full k-button-expanded-payroll-submit k-button-expanded-payroll-cancel"
                                    themeColor={"bootstrap"}
                                    onClick={(event) => {
                                      setAddSalaries(false);
                                    }}
                                  >
                                    Cancel
                                  </Button>

                                  <Button
                                    className="k-button k-button-md k-rounded-lg k-w-full k-button-expanded-payroll-submit"
                                    themeColor={"primary"}
                                    disabled={
                                      !formRenderProps.allowSubmit
                                    }
                                    type={"submit"}
                                  >
                                    Submit
                                  </Button>
                                </div>
                                <div className="mb-5"></div>
                              </div>
                            </Card>
                          </fieldset>
                        </FormElement>
                      </>
                    );
                  }}
                />
              </Dialog>
            )}
          </div>
          <div>
            {addEditJob && (
              <Dialog
                width={650}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fa-solid fa-plus"></i>
                    <span className="ms-2">
                      {formInit.id ? "Edit Job" : "Add new Job"}
                    </span>
                  </div>
                }
                onClose={addEditJobToggleDialog}
              >
                <Form
                  onSubmit={formHandleSubmit}
                  initialValues={formInit}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <Field
                          id={"id"}
                          name={"id"}
                          component={FormInput}
                          type={"hidden"}
                        />
                        <Field
                          id={"jobDesc"}
                          name={"jobDesc"}
                          label={"Job Description*"}
                          textField="empJobDescription"
                          dataItemKey="id"
                          component={FormDropDownList}
                          data={JobList}
                          value={selectedJob}
                          onChange={JobddlOnChange}
                          placeholder=""
                          wrapperstyle={{
                            width: "100%",
                          }}
                          validator={payrollJobDescValidator}
                          itemRender={itemRender}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"startDate"}
                            name={"startDate"}
                            label={"Start Date*"}
                            component={FormDatePicker}
                            onChange={updateStartDate}
                            validator={startDateValidator}
                            value={selectedStartDate}
                            wrapperstyle={{
                              width: "100%",
                              marginRight: "10px",
                            }}
                          />
                          {formInit.id && (
                            <div style={{ width: "100%" }}>
                              <Field
                                id={"endDate"}
                                name={"endDate"}
                                label={"End Date"}
                                component={FormDatePicker}
                                onChange={updateEndDate}
                                wrapperstyle={{
                                  width: "100%",
                                }}
                              />
                              {endDateError && (
                                <p
                                  className="text-danger mb-0 p-0"
                                  style={{ fontSize: "12px" }}
                                >
                                  {endDateError}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="k-form-buttons">
                          <Button
                            themeColor={"primary"}
                            className={"col-12"}
                            type={"submit"}
                            disabled={
                              !formRenderProps.allowSubmit || endDateError
                            }
                          >
                            Save Job
                          </Button>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </Dialog>
            )}
          </div>
        </>
      </>}
    </Fragment>
  );
};

export default Jobs;
