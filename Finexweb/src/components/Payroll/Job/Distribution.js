/* eslint-disable eqeqeq */
import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { eyedropperIcon, plusOutlineIcon } from "@progress/kendo-svg-icons";
import { memo, useEffect, useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  ConfigurationEndPoints,
  IHACExpenseCodeEndPoints,
  PayrollEmployee,
  RevenueEndPoints
} from "../../../EndPoints";

import {
  ColumnFormCurrencyTextBox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
  FormRadioGroup,
  radioData,
} from "../../form-components";

import { getter } from "@progress/kendo-data-query";
import { Checkbox } from "@progress/kendo-react-inputs";
import usePrivilege from "../../../helper/usePrivilege";
import { useStartEndDateValidatorForSingle } from "../../../helper/useStartEndDateValidatorForSingle";
import { CheckBoxCell } from "../../cells/CheckBoxCell";
import Constants from "../../common/Constants";
import SacDialog from "../../modal/StateAccountCodeDialog";
import { showErrorNotification } from "../../NotificationHandler/NotificationHandler";
import {
  payrollJobDescValidator,
  startDateValidator
} from "../../validators";
import DistributionRowExpand from "./expand/DistributionRowExpand";
import IHACDialog from "./modals/IHACpopup";

const Distribution = ({
  distributionSelectedState,
  setDistributionSelectedState,
  setSelectedDistribution,
  selectedEmployeeId,
}) => {
  const {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
    resetDatesFun,
  } = useStartEndDateValidatorForSingle();

  const [show, setShow] = useState(false);
  const [addEditDistribution, setAddEditDistribution] = useState(false);
  const [distribution, setDistribution] = useState([]);
  const [selectedRowId, setselectedRowId] = useState(0);
  const [formInit, setFormInit] = useState();
  const [formKey, setFormKey] = useState(0);
  const [visibleIHPO, setVisibleIHPO] = useState(false);
  const [IHACDisplay, setIHACDisplay] = useState(false);
  const formRef = useRef();
  const [vacaStartDate, setVacaStartDate] = useState();

  const [defaultJob, setDefaultJob] = useState();

  const [notificationState, setNotificationState] = useState({
    none: false,
    success: false,
    error: false,
    warning: false,
    info: false,
    notificationMessage: "",
  });
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
  const [showInactive, setShowInactive] = useState(false);
  const [iSCheckPercentageCondision, setIsCheckPercentageCondision] = useState(false)

  const [, setIHACDDList] = useState([]);

  const [CACDDList, setCACDDList] = useState([]);
  const [CACVal, setCACVal] = useState({
    value: {
      text: "Select County Expense Code",
      id: 2555,
    },
  });
  const CACColumns = [
    {
      field: "countyExpenseCode",
      header: "Name",
      width: "300px",
    },
    {
      field: "countyExpenseDescription",
      header: "Description",
      width: "300px",
    },
  ];
  const [visible, setVisible] = useState(false);
  const [JobList, setJobList] = useState([]);
  const [selectedJobDescription, setSelectedJobDescription] = useState();
  const [selectedJob, setSelectedJob] = useState(null);
  const [percentageWarningData, setPercentageWarningData] = useState([]);
  const [columnShow, setColumnShow] = useState(false);
  const [IHACValueEdit, setIHACValueEdit] = useState("");
  const [SACValueEdit, setSACValueEdit] = useState("");
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  useEffect(() => {
    getDistributionList();
    setDistribution([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId, showInactive]);

  useEffect(() => {
    getihac();
    getCAC();
    getIHACConfig();
    getJobList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const JobddlOnChange = (event) => {
    // eslint-disable-next-line eqeqeq
    if (event.syntheticEvent.type == "click") {
      let jobIndex = JobList.findIndex((x) => x.id == event.target.value.id);
      if (jobIndex > -1) {
        setSelectedJob(JobList[jobIndex]);
        const singleDistribution = distribution.find(
          (item) => item.jobName == JobList[jobIndex].empJobDescription
        );
        if (singleDistribution) {
          setFormInit({
            ...formInit,
            disabled: singleDistribution.percentage > 0
              ? "percentage"
              : "lineRate",
          });
        } else {
          setFormInit({
            ...formInit,
          });
        }
      }
    }
  };

  const getJobList = async () => {
    try {
      const { data } = await axiosInstance({
        method: "GET",
        url: PayrollEmployee.jobList + `?take=0&skip=0`,
        withCredentials: false,
      });
      setJobList(data);
      if (defaultJob !== undefined) {
        let jobIndex = JobList.findIndex((x) => x.id == defaultJob);
        if (jobIndex > -1) {
          setSelectedJob(JobList[jobIndex]);
          setSelectedJobDescription(JobList[jobIndex]);
        }
      }
    } catch (e) {
      console.log(e, "error");
    }
  };

  const getIHACConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/1",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setIHACDisplay(value);
      })
      .catch(() => { });
  };

  const getDistributionList = async () => {
    try {
      if (selectedEmployeeId) {
        let url =
          PayrollEmployee.PayrollDistribution +
          `/?active=${!showInactive}` +
          `&empId=${selectedEmployeeId}`;

        const { data } = await axiosInstance({
          method: "GET",
          url,
          withCredentials: false,
        });
        setDistribution(data.data);
      }
    } catch (e) {
      console.log(e, "error");
    }
  };

  const getCAC = async () => {
    const accountingcode =
      Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code;

    axiosInstance({
      method: "Post",
      url:
        RevenueEndPoints.GetAccountingCodesFilter +
        `accountingcodetype=${accountingcode}` +
        "&&description=" +
        "" +
        "&&code=" +
        "" +
        "&&fundCode=" +
        "" +
        "&&isActive=" +
        "Y" +
        "&&search=" +
        "" +
        "&&skip=" +
        0 +
        "&&take=" +
        0,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setCACDDList(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleDialog = () => {
    setVisible(!visible);
  };
  const getSacCode = (sac) => {
    if (formRef.current) {
      formRef.current.onChange("sac", {
        name: "sac",
        touched: true,
        value: sac,
      });
      setSACValueEdit(sac)
    }
  };
  const getihac = async () => {
    const accountingTypeCode =
      Constants.ExpenseOrRevenueIndicatorTypeCode.RevenueIndicator.code;
    axiosInstance({
      method: "Post",
      url:
        IHACExpenseCodeEndPoints.GetIHACListWithFilter +
        "code=" +
        "&&description=" +
        "&&isActive=" +
        "Y" +
        "&&search=" +
        "&&skip=" +
        0 +
        "&&take=" +
        0 +
        `&&typeCode=${accountingTypeCode}`,
      withCredentials: false,
    }).then((response) => {
      let data = response.data.data;

      setIHACDDList(data);
    });
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
  const editDistributionToggleDialog = (dataItem) => {
    axiosInstance({
      method: "GET",
      url: PayrollEmployee.PayrollDistribution + "/" + dataItem,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        let obj = {
          ...data,
          id: data.id,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          ihac: data.ihac,
          cac: CACDDList.find((x) => x.id == data.cac),
          sac: data.sac,
          distributionName: data.distributionName,
          vacaPayout: data.vacaPayout,
          sickPayout: data.sickPayout,
          flatRateNoHours: data.flatRateNoHours,
          sick: data.sick,
          vacaStartDate: data.vacaStartDate ? new Date(data.vacaStartDate) : null,
          jobDescriptionID: JobList.find(
            (item) => item.id == data.jobDescriptionID
          ),
        };
        setVacaStartDate(data.vacaStartDate);
        setSelectedJobDescription(
          JobList.find((item) => item.id == obj.jobDescriptionID)
        );
        setFormInit(obj);
        setSelectedJob(
          JobList.find((item) => item.id == data.jobDescriptionID)
        );
        setFormKey(formKey + 1);
        setAddEditDistribution(!addEditDistribution);
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  const addDistributionToggleDialog = () => {
    resetDatesFun();
    setAddEditDistribution(!addEditDistribution);
    if (addEditDistribution) {
      setFormInit({});
    }
    setIHACValueEdit("");
    setSACValueEdit("");
  };

  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          const filterDistribution = distribution.filter(el => Number(el.id) == Number(id));
          editDistributionToggleDialog(id);
          setIHACValueEdit(filterDistribution[0]?.ihac)
          setSACValueEdit(filterDistribution[0]?.sac)
          break;
        case "inactive":
          break;
        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const expandChange = (event) => {
    let newData = distribution.map((item) => {
      if (item.id == event.dataItem.id) {
        item.expanded = !event.dataItem.expanded;
      }
      return item;
    });
    setDistribution(newData);
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

  const formHandleSubmit = async (dataItem) => {

    var distributionData = distribution.filter((item) => item.id !== dataItem.id);

    const tmpDistribution = distributionData.map((item) =>
    ({
      id: item.id || 0,
      jobName: item?.jobName,
      lineRate: item?.lineRate || 0,
      percentage: item?.percentage || 0,
    })
    );

    const groupData = tmpDistribution.reduce((acc, obj) => {
      if (!acc[obj.jobName]) {
        acc[obj.jobName] = obj.percentage;
      } else {
        acc[obj.jobName] += obj.percentage;
      }
      return acc;
    }, {});

    const result = Object.keys(groupData).map((name) => {
      const totalPercentage = groupData[name];
      return { jobName: name, remainingPercentage: 100 - totalPercentage };
    });

    const currentJob = result.find(
      (item) => item.jobName == dataItem?.jobDescriptionID?.empJobDescription
    );

    if (currentJob && currentJob.remainingPercentage < dataItem.percentage) {
      showErrorNotification(
        `Percentage total can't be greater than 100% for ${dataItem?.jobDescriptionID?.empJobDescription}`
      );
    } else {
      let apiRequest = {
        id: dataItem.id || 0,
        jobDescriptionID: selectedJob?.id,
        cac: dataItem.cac ? dataItem.cac.id : 0,
        ihac: dataItem.ihac ? dataItem.ihac
          : "",
        sac: dataItem.sac,
        defaultJob: true,
        activeJob: true,
        benSac: 0,
        benIhac: "",
        jobClass: "",
        vaca: true,
        noBenefits: true,
        transcacId: 0,
        notUsedInRegHours: true,
        vacaPayout: dataItem.vacaPayout,
        sickPayout: dataItem.sickPayout,
        sick: dataItem.sick,
        touchScreenClock: true,
        flatRateNoHours: dataItem.flatRateNoHours,
        showOnPayReport: true,
        vacaStartDate: dataItem.vacaStartDate,
        startDate: dataItem.startDate,
        endDate: dataItem.endDate,
        distributionName: dataItem.distributionName,
        lineRate: dataItem?.lineRate || 0,
        percentage: dataItem?.percentage || 0,
      };

      if (dataItem.id > 0) {
        apiRequest = {
          ...apiRequest,
        };
        try {
          await axiosInstance({
            method: "PUT",
            url: PayrollEmployee.PayrollDistribution + "/" + dataItem.id,
            data: apiRequest,
            withCredentials: false,
          });
          setAddEditDistribution(!addEditDistribution);
          getDistributionList();
          setFormInit({});
          setIHACValueEdit("");
          setSACValueEdit("");
        } catch (error) {
          if (error.response.status == 400) {
            setAddEditDistribution(!addEditDistribution);
            let errorMessage =
              error?.response?.data || "Something went wrong!";
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
        apiRequest = {
          ...apiRequest,
          empID: selectedEmployeeId,
        };
        try {
          await axiosInstance({
            method: "POST",
            url: PayrollEmployee.PayrollDistribution,
            data: apiRequest,
            withCredentials: false,
          });
          setAddEditDistribution(!addEditDistribution);
          getDistributionList();
          setIHACValueEdit("");
          setSACValueEdit("");
        } catch (error) {
          if (error.response.status == 400) {
            setAddEditDistribution(!addEditDistribution);
            let errorMessage =
              error?.response?.data || "Something went wrong!";
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
    }

  };

  let [formData, setformData] = useState({});

  const onIhacChange = async (e, whichDate = "") => {
    setformData({ ...formData, [e.target.name]: e.target.value });

    const isValid = new Date(e?.value);
    if (
      isValid &&
      whichDate &&
      !isNaN(isValid.getTime()) &&
      isValid.getFullYear() != 1969
    ) {
      if (whichDate == "startDate") {
        updateStartDateFun({
          formRenderProps: e,
          enddate: formInit?.endDate || selectedEndDate,
        });
      } else if (whichDate == "endDate") {
        updateEndDateFun({
          formRenderProps: e,
          startdate: formInit?.startDate || selectedStartDate,
        });
      }
    }
  };

  const handleFieldChange = async (data) => {
    setformData({ ...formData, [data?.name]: data?.value });
    formRef.current.valueSetter("cac", data?.value);
  }

  useEffect(() => {
    setFormInit(formData);
  }, [formData]);

  const toggleIHPODialog = () => {
    if (IHACValueEdit && IHACValueEdit.length > 10) {
      var ihacVal = IHACValueEdit.replace(/_/g, "-");
      setIHACValueEdit(ihacVal);
    }
    setVisibleIHPO(!visibleIHPO);
  };

  const getIHACCode = (ihac) => {
    formRef.current.valueSetter("ihac", ihac);
    setIHACValueEdit(ihac)
  };

  const onInactiveCheckBox = (event) => {
    setShowInactive(!showInactive);
  };

  const DATA_ITEM_KEY = "id";
  const idGetter = getter(DATA_ITEM_KEY);

  const SELECTED_FIELD = "selected";

  const onDistributionSelected = (data) => {
    let update = false;
    if (data.dataItem) {
      if (
        Object.keys(distributionSelectedState) &&
        Object.keys(distributionSelectedState).length
      ) {
        if (
          parseInt(Object.keys(distributionSelectedState)[0]) !==
          data.dataItem.id
        ) {
          update = true;
        } else {
          setDistributionSelectedState({});
          setSelectedDistribution();
          setDistribution(
            distribution.map((item) => ({
              ...item,
              [SELECTED_FIELD]: false,
            }))
          );
        }
      } else {
        update = true;
      }

      if (update) {
        setDistributionSelectedState({ [data.dataItem.id]: true });
        setSelectedDistribution(data.dataItem);
        setDistribution(
          distribution.map((item) => ({
            ...item,
            [SELECTED_FIELD]: { [data.dataItem.id]: true }[idGetter(item)],
          }))
        );
      }
    } else {
      setSelectedDistribution();
    }
  };

  const amountPerValidation = () => {
    const amount = formRef.current.valueGetter("lineRate");
    const percentage = formRef.current.valueGetter("percentage");
    return !amount && !percentage ? "Field is Required" : "";
  };

  const getWarning = () => {
    const groupData = distribution.reduce((acc, obj) => {
      if (!obj.lineRate) {
        if (!acc[obj.jobName]) {
          acc[obj.jobName] = obj.percentage;
        } else {
          acc[obj.jobName] += obj.percentage;
        }
      }
      return acc;
    }, {});

    const result = Object.keys(groupData).map((name) => {
      const totalPercentage = groupData[name];

      return {
        jobName: name,
        percentage: 100 - totalPercentage,
      };
    });
    setPercentageWarningData(result.filter(item => item.percentage > 0));
  };

  useEffect(() => {
    getWarning();
  }, [distribution]);

  const getJob = async ({ id }) => {
    if (id) {
      try {
        const { data } = await axiosInstance({
          method: "GET",
          url: PayrollEmployee.job + "/" + id + `?active=${!showInactive}`,
          withCredentials: false,
        });
        if (data?.data.length > 0) {
          setFormInit({
            ...formInit,
            jobDescriptionID: data?.data[0].jobDescription,
            startDate: new Date(data?.data[0].startDate),
          });
          setDefaultJob(data?.data[0].jobDescription.id);
          if (JobList.length > 0) {
            let jobIndex = JobList.findIndex(
              (x) => x.id == data?.data[0].jobDescription.id
            );
            if (jobIndex > -1) {
              setSelectedJob(JobList[jobIndex]);
              setSelectedJobDescription(JobList[jobIndex]);
            }
          }
        }
        return data?.data;
      } catch (e) {
        console.log(e, "error");
      }
    }
  };

  const checkCondition = async (id) => {
    if (id) {
      try {
        const { data } = await axiosInstance({
          method: "GET",
          url: PayrollEmployee.job + "/" + id + `?active=${!showInactive}`,
          withCredentials: false,
        });
        setIsCheckPercentageCondision(true);
      } catch (e) {
        console.log(e, "error");
      }
    }
  }
  useEffect(() => {
    checkCondition()
  }, []);
  useEffect(() => {
    getJob({ id: selectedEmployeeId });
  }, [selectedEmployeeId, addEditDistribution]);
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <h3 className="mb-0">Distributions </h3>
          {percentageWarningData?.length > 0 && (
            <div
              className="px-3 py-2 rounded ms-4"
              style={{ background: "#ffc92680" }}
            >
              <div>
                <i className="fa-solid fa-warning"></i> Percentage warning
              </div>
              {percentageWarningData.map(({ jobName, percentage }) => {
                return (
                  <div className="my-1">
                    {jobName && (
                      <>
                        - {jobName} <strong>{percentage} </strong> Percentage
                        Remaining
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          {checkPrivialgeGroup("PSAddDB", 2) && (
            <Button
              className="k-button k-button-lg k-rounded-lg"
              themeColor={"primary"}
              onClick={() => {
                setAddEditDistribution(true);
              }}
            >
              Add Distribution
            </Button>
          )}
        </div>
      </div>
      {checkPrivialgeGroup("PSDistributionG", 1) && <div className="mt-3">
        <Grid
          data={distribution}
          onRowClick={onDistributionSelected}
          selectedField={SELECTED_FIELD}
          detail={DistributionRowExpand}
          expandField="expanded"
          onExpandChange={expandChange}
          pageable={{
            buttonCount: 4,
            pageSizes: [10, 15, "All"],
          }}
        >
          <GridToolbar>
            <div className="row col-sm-12 d-flex justify-content-end">
              <div className="col-sm-6 d-flex align-items-end justify-content-end gap-5">
                {checkPrivialgeGroup("PSDShowInactiveCB", 1) && (
                  <Checkbox
                    type="checkbox"
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
          <GridColumn field="jobName" title="Job Name" />

          <GridColumn
            field="startDate"
            title="Start Date"
            editor="date"
            format="{0:MM/dd/yyyy}"
            cell={(props) => {
              if (props && props.dataItem && props.dataItem.startDate) {
                const [year, month, day] = props?.dataItem?.startDate
                  ?.split("T")[0]
                  ?.split("-");
                return <td>{`${month}/${day}/${year}`}</td>;
              } else {
                return <td></td>;
              }
            }}
          />
          <GridColumn
            field="endDate"
            title="End Date"
            editor="date"
            format="{0:MM/dd/yyyy}"
            cell={(props) => {
              if (props && props.dataItem && props.dataItem.endDate) {
                const [year, month, day] = props.dataItem.endDate
                  ?.split("T")[0]
                  ?.split("-");
                return <td>{`${month}/${day}/${year}`}</td>;
              }
              return <td></td>;
            }}
          />

          {IHACDisplay && <GridColumn field="ihac" title="IHAC" />}
          <GridColumn field="accountingCode" title="CAC" />
          <GridColumn field="sac" title="SAC" />
          <GridColumn
            field="lineRate"
            title="Amount"
            format="{0:c2}"
            cell={ColumnFormCurrencyTextBox}
          />
          <GridColumn field="percentage" title="Percentage" cell={(props) => {
            if (props.dataItem?.percentage) {
              var rate = props.dataItem?.percentage || 0;
              rate = rate?.toFixed(2) + "%";

              return <td className="!k-text-right">{`${rate}`}</td>;
            } else {
              return <td></td>;
            }
          }} />
          <GridColumn
            field="primaryJob"
            cell={(colProps) => <CheckBoxCell {...colProps} showText="true" />}
            title="Primary Job"
          />
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
          <GridColumn cell={CommandCell} />
        </Grid>
        <ContextMenu
          show={show}
          offset={offset.current}
          onSelect={handleOnSelect}
          onClose={handleCloseMenu}
        >
          {checkPrivialgeGroup("EditPRDCM", 3) && (
            <MenuItem
              text="Edit Distribution"
              data={{
                action: "edit",
              }}
              svgIcon={eyedropperIcon}
            />
          )}
          {checkPrivialgeGroup("DuplicatePRDCM", 2) && (
            <MenuItem
              text="Duplicate Distribution"
              data={{
                action: "duplicate",
              }}
              svgIcon={plusOutlineIcon}
            />
          )}
        </ContextMenu>
      </div>}
      <div>
        {addEditDistribution && (
          <Dialog
            width={800}
            title={
              <div className="d-flex align-items-center justify-content-center">
                <i className="fa-solid fa-plus"></i>
                <span className="ms-2">
                  {formInit.id > 0 ? "Edit Distribution" : "Add Distribution"}
                </span>
              </div>
            }
            onClose={addDistributionToggleDialog}
          >
            <Form
              ref={formRef}
              onSubmit={formHandleSubmit}
              initialValues={formInit}
              key={formKey}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <Field
                      id={"jobDescriptionID"}
                      name={"jobDescriptionID"}
                      label={"Job Description*"}
                      textField="empJobDescription"
                      dataItemKey="id"
                      component={FormDropDownList}
                      data={JobList}
                      value={selectedJobDescription}
                      onChange={JobddlOnChange}
                      placeholder="Select job description"
                      wrapperstyle={{
                        width: "100%",
                      }}
                      validator={payrollJobDescValidator}
                    />

                    <Field
                      id={"id"}
                      name={"id"}
                      component={FormInput}
                      type={"hidden"}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {IHACDisplay && (
                        <div
                          onClick={() => toggleIHPODialog()}
                          style={{
                            marginRight: "10px",
                            flex: "1",
                            width: "40%",
                          }}
                        >
                          <Field
                            id={"ihac"}
                            name={"ihac"}
                            label={"IHAC"}
                            component={FormInput}
                          />
                        </div>
                      )}
                      <Field
                        id={"cac"}
                        name={"cac"}
                        label={"CAC"}
                        textField="countyExpenseCode"
                        dataItemKey="id"
                        component={FormMultiColumnComboBox}
                        data={CACDDList}
                        value={CACVal}
                        columns={CACColumns}
                        onChange={onIhacChange}
                        wrapperstyle={{ width: "30%", marginRight: "10px" }}
                        placeholder="Search CAC..."
                      />

                      <div
                        style={{ width: "33%", marginRight: "10px" }}
                        onClick={() => setVisible(true)}
                      >
                        <Field
                          id={"sac"}
                          name={"sac"}
                          label={"SAC"}
                          component={FormInput}
                        />
                      </div>
                    </div>
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
                        onChange={(e) => onIhacChange(e, "startDate")}
                        value={selectedStartDate}
                        component={FormDatePicker}
                        wrapperstyle={{
                          width: "50%",
                          marginRight: "10px",
                        }}
                        validator={startDateValidator}
                      />
                      <div style={{ width: "50%", marginRight: "10px" }}>
                        <Field
                          id={"endDate"}
                          name={"endDate"}
                          label={"End Date"}
                          onChange={(e) => onIhacChange(e, "endDate")}
                          component={FormDatePicker}
                          wrapperstyle={{
                            width: "100%",
                            marginRight: "10px",
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
                      <div style={{ width: "50%", marginRight: "10px" }}>
                        <Field
                          id={"vacaStartDate"}
                          name={"vacaStartDate"}
                          label={"Vacation Start Date"}
                          value={vacaStartDate}
                          component={FormDatePicker}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between ",
                        alignItems: "center",
                        border: "1px solid",
                        padding: "15px",
                        borderRadius: "10px",
                        gap: "15px",
                        marginTop: "15px",
                      }}
                    >
                      <Field
                        id={"lineRate"}
                        name={"lineRate"}
                        label={iSCheckPercentageCondision ? "Amount*" : "Amount"}
                        format="c2"
                        placeholder={"$ Enter Amount"}
                        component={FormNumericTextBox}
                        wrapperstyle={{
                          width: "60%",
                        }}
                        step={0}
                        min={0}
                        spinners={false}
                        onChange={() => {
                          formRenderProps.onChange("percentage", {
                            value: null,
                          });
                        }}
                        validator={iSCheckPercentageCondision ? amountPerValidation : ""}
                      />
                      <div
                        style={{ height: "70px" }}
                        className="d-flex flex-column align-items-center"
                      >
                        <span
                          style={{
                            width: "1px",
                            flex: "1",
                            display: "inline-block",
                            background: "#000",
                          }}
                        ></span>
                        <strong>OR</strong>
                        <span
                          style={{
                            width: "1px",
                            flex: "1",
                            display: "inline-block",
                            background: "#000",
                          }}
                        ></span>
                      </div>
                      <Field
                        id={"percentage"}
                        name={"percentage"}
                        label={iSCheckPercentageCondision ? "Percentage*" : "Percentage"}
                        component={FormNumericTextBox}
                        wrapperstyle={{ width: "60%" }}
                        spinners={false}
                        max={100}
                        onChange={() => {
                          formRenderProps.onChange("lineRate", {
                            value: null,
                          });
                        }}
                        validator={iSCheckPercentageCondision ? amountPerValidation : ''}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          width: "50%",
                        }}
                      >
                        <Field
                          id={"vacaPayout"}
                          name={"vacaPayout"}
                          label={"Vacation Payout"}
                          placeholder={""}
                          data={radioData}
                          layout={"horizontal"}
                          component={FormRadioGroup}
                        />
                        <Field
                          id={"sickPayout"}
                          name={"sickPayout"}
                          label={"Sick Payout"}
                          placeholder={""}
                          data={radioData}
                          layout={"horizontal"}
                          component={FormRadioGroup}
                        />
                      </div>
                      <div
                        style={{
                          width: "50%",
                        }}
                      >
                        <Field
                          id={"flatRateNoHours"}
                          name={"flatRateNoHours"}
                          label={"Flat Rate No Hours"}
                          placeholder={""}
                          data={radioData}
                          layout={"horizontal"}
                          component={FormRadioGroup}
                        />
                        <Field
                          id={"sick"}
                          name={"sick"}
                          label={"Sick Time"}
                          placeholder={""}
                          data={radioData}
                          layout={"horizontal"}
                          component={FormRadioGroup}
                        />{" "}
                      </div>
                    </div>
                    <div className="k-form-buttons">
                      <Button
                        themeColor={"primary"}
                        className={"col-12"}
                        type={"submit"}
                        disabled={!formRenderProps.allowSubmit}
                      >
                        Save Distribution
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </Dialog>
        )}
        {visible && (
          <SacDialog
            toggleDialog={toggleDialog}
            getSacCode={getSacCode}
            SACValue={SACValueEdit}
            type={7}
          />
        )}
        {visibleIHPO && (
          <IHACDialog
            toggleIHPODialog={toggleIHPODialog}
            getIHACCode={getIHACCode}
            forihpo={false}
            IHACValue={IHACValueEdit}
            getSacCode={getSacCode}
            getCAC={() => handleFieldChange()}
          ></IHACDialog>
        )}
      </div>
    </>
  );
};

export default memo(Distribution);
