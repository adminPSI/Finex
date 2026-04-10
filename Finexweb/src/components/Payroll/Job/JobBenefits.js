import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { Tooltip } from "@progress/kendo-react-tooltip";
import React, { useEffect, useRef, useState } from "react";

import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Checkbox } from "@progress/kendo-react-inputs";
import {
  eyedropperIcon,
  eyeSlashIcon,
  plusOutlineIcon,
} from "@progress/kendo-svg-icons";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  ConfigurationEndPoints,
  PayrollEmployee,
  PayrollEndPoints,
  RevenueEndPoints
} from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import { useStartEndDateValidatorForSingle } from "../../../helper/useStartEndDateValidatorForSingle";
import Constants from "../../common/Constants";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
} from "../../form-components";
import SacDialog from "../../modal/StateAccountCodeDialog";
import { showSuccessNotification } from "../../NotificationHandler/NotificationHandler";
import {
  benefitPackageValidator,
  benefitValidator,
  startDateValidator
} from "../../validators";
import IHACDialog from "./modals/IHACpopup";

const JobBenefits = ({
  selectedJob,
  selectedDistribution,
  selectedEmployeeId,
}) => {
  const [isEdit, setIsEdit] = useState(false);
  const [benefitType, setBenefitType] = useState("benefit-na");
  const [addEditBenefit, setAddEditBenefit] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedRowId, setselectedRowId] = useState(0);
  const [formInit, setFormInit] = useState([]);
  const [formBenefitsData, setFormBenefitsData] = useState([]);
  const [benefitsName, setBenefitsName] = useState([]);
  const [benefitsPackage, setBenefitsPackage] = useState([]);
  const [visibleIHPO, setVisibleIHPO] = useState(false);
  const [formKey,] = useState(1);
  const [IHACDisplay, setIHACDisplay] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const formRef = useRef();
  const [visibleSAC, setVisibleSAC] = useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [isActiveBenefit, setIsActiveBenefit] = useState(false);
  const [chengesStatus, setChangeStatus] = useState(false);
  const [inactive, setInactive] = useState(false);
  const [sacCode, setSACCode] = useState("");
  const [IHACCode, setIHACCode] = useState("");

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
    resetDatesFun,
  } = useStartEndDateValidatorForSingle();

  const offset = useRef({
    left: 0,
    top: 0,
  });

  const [CACDDList, setCACDDList] = useState([]);
  const CACVal = {
    value: {
      text: "Select County Expense Code",
      id: 0,
    },
  };
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

  useEffect(() => {
    const getBenefitsName = () => {
      axiosInstance({
        method: "GET",
        url: PayrollEndPoints.Benefits + "?inActive=" + false,
        withCredentials: false,
      })
        .then((response) => {
          setBenefitsName(response.data.data);
        })
        .catch((e) => {
          console.log(e, "error");
        });
    };

    getBenefitsName();
  }, []);

  useEffect(() => {
    const getBenefitsPackage = () => {
      axiosInstance({
        method: "GET",
        url: PayrollEndPoints.Packages + `?take=0&skip=0`,
        withCredentials: false,
      })
        .then((response) => {
          setBenefitsPackage(response.data.data);
        })
        .catch((e) => {
          console.log(e, "error");
        });
    };

    getBenefitsPackage();
  }, []);

  useEffect(() => {
    getBenefitsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob, selectedEmployeeId, showInactive, selectedDistribution]);

  useEffect(() => {
    getIHACConfig();
    getCAC();
  }, []);

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
  const getSacCode = (sac) => {
    if (formRef.current) {
      formRef.current.onChange("sac", {
        name: "sac",
        touched: true,
        value: sac,
      });
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

  const getBenefitsList = async () => {
    try {
      if (selectedEmployeeId) {
        let url =
          `${PayrollEmployee.EmployeePayrollBenefits}/` +
          `?active=${!showInactive}` +
          `&empId=${selectedEmployeeId}`;

        if (selectedDistribution) {
          url += `&jobId=${selectedDistribution.jobDescriptionID}`;
        }

        const response = await axiosInstance({
          method: "GET",
          url,
          withCredentials: false,
        });
        let data = response.data?.data;
        setFormBenefitsData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleFieldChange = async (data) => {
    setformData({ ...formData, [data?.name]: data?.value });
    formRef.current.valueSetter("cac", data?.value);
  }
  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    var rowData = formBenefitsData.find((i) => i.id == e.currentTarget.id);
    setIsActiveBenefit(rowData.endDAte == undefined);
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

  const getBenefitStatusChange = () => {
    axiosInstance({
      method: "PUT",
      url: PayrollEmployee.EmployeeBenefitStatusChange.replace(
        "#Id#",
        selectedRowId
      ).replace("#inactive#", inactive),
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Update Status.");
      })
      .catch(() => { })
      .finally(() => {
        getBenefitsList();
        setChangeStatus(null);
      });
  };

  const handleOnSelect = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          let data = Object.assign(
            {},
            formBenefitsData.find((i) => i.id == id)
          );
          data.startDate = new Date(data.startDate);
          data.endDate = data.endDAte ? new Date(data.endDAte) : null;
          data.benefit = benefitsName?.find((i) => i.id == data.benefitId);
          data.benefitPachakeId = benefitsPackage.data?.find(
            (i) => i.id == data.benefitPachakeId
          );
          if (data.benefitIHACDistribution) {
            data.cac = CACDDList.find(
              (i) => i.id == data.benefitIHACDistribution.cacId
            );
            data.ihac = data.benefitIHACDistribution.ihac;
          }
          setSACCode(data.sac);
          setIHACCode(data.ihac);
          setBenefitType("benefit");
          setFormInit(data);
          addEditBenefitToggleDialog();
          setIsEdit(true);
          break;
        case "inactive":
          setInactive(true);
          setChangeStatus(true);
          break;
        case "active":
          setInactive(false);
          setChangeStatus(true);
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

  const addEditBenefitToggleDialog = () => {
    resetDatesFun();
    setAddEditBenefit(!addEditBenefit);
    if (addEditBenefit) {
      setBenefitType("benefit-na");

      setFormInit([]);
    }
  };

  const addferBenefitHandleSubmit = async (dataItem) => {
    let req = {
      id: 0,
      empId: selectedEmployeeId,
      benefitId: dataItem.benefit ? dataItem.benefit.id : 0,
      benefitPachakeId: dataItem.benefitPachakeId
        ? dataItem.benefitPachakeId.id
        : 0,
      benefitAmount: dataItem.benefitAmount,

      startDate: dataItem.startDate ?? null,
      endDAte: dataItem.endDate ?? null,
      benefitRate: dataItem.benefitRate,
      sac: dataItem?.sac || null,
      cac: dataItem?.cac?.id || null,
      benefitIHACDistribution: {
        payDistId: selectedDistribution
          ? selectedDistribution.id
          : dataItem.payDistId,
        ihac: dataItem.ihac,
        benId: 0,
        cacId: dataItem?.cac?.id || null,
      },
    };

    if (req.benefitId || req.benefitPachakeId) {
      if (dataItem.id > 0 || isEdit) {
        req.id = dataItem.id;
        try {
          await axiosInstance({
            method: "PUT",
            url: `${PayrollEmployee.PostEmployeePayrollBenefits}/${dataItem.id}`,
            data: req,
            withCredentials: false,
          });
          setAddEditBenefit(false);
          setIsEdit(false);
          formInit([]);
        } catch (error) {
          console.log(error);
        }
      } else {
        req = {
          ...req,
          payDistId: selectedDistribution.id,
        };
        try {
          await axiosInstance({
            method: "POST",
            url: `${PayrollEmployee.PostEmployeePayrollBenefits}`,
            data: req,
            withCredentials: false,
          });
          setAddEditBenefit(false);
          formInit([]);
        } catch (error) {
          console.log(error);
        }
      }
      setBenefitType("benefit");
      getBenefitsList();
    } else {
      if (req.benefitId && !req.benefitPachakeId) {
        alert("Please select Benefit or Benefit Package");
      }
    }
  };

  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };

  const toggleDialogSAC = () => {
    setVisibleSAC(!visibleSAC);
  };

  const getIHACCode = (ihac) => {
    formRef.current.valueSetter("ihac", ihac);
  };

  let [formData, setformData] = useState({});
  const onIhacChange = (e) => {
    setformData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    setFormInit(formData);
  }, [formData]);

  const onInactiveCheckBox = (event) => {
    setShowInactive(!showInactive);
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

  const amountPerValidation = () => {
    const amount = formRef.current.valueGetter("benefitAmount");
    const percentage = formRef.current.valueGetter("benefitRate");
    return !amount && !percentage ? "Field is Required" : "";
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h3>Benefits {selectedJob?.jobDesc}</h3>
        </div>

        <Tooltip anchorElement="target" parentTitle={true}>
          {checkPrivialgeGroup("AddBenefitB", 2) && <div
            title={
              !(selectedJob && selectedDistribution)
                ? "Select Job & Distribution to enable"
                : "Create Benefit with selected Job & Distribution"
            }
          >
            <Button
              className="k-button k-button-lg k-rounded-lg"
              themeColor={"primary"}
              disabled={!selectedDistribution}
              onClick={() => {
                setFormInit([]);
                setBenefitType("benefit-na");
                setAddEditBenefit(true);
                setIsEdit(false);
              }}
            >
              Add Benefits
            </Button>
          </div>}
        </Tooltip>
      </div>

      {checkPrivialgeGroup("PRBShowInactiveCB", 1) && <div className="mt-3">
        <Grid
          data={formBenefitsData}
          pageable={{
            buttonCount: 4,
            pageSizes: [10, 15, "All"],
          }}
        >
          <GridToolbar>
            <div className="row col-sm-12 d-flex justify-content-end">
              <div className="col-sm-6 gap-5 d-flex align-items-end justify-content-end">
                {checkPrivialgeGroup("PRBShowInactiveCB", 1) && <Checkbox
                  type="checkbox"
                  name="showInactive"
                  defaultChecked={showInactive}
                  value={showInactive}
                  onChange={onInactiveCheckBox}
                  label={"Show Inactive"}
                />}
                <Checkbox
                  type="checkbox"
                  name="modifiedBy"
                  defaultChecked={columnShow}
                  onChange={onCheckBox}
                  label={"Modified Info"}
                />
              </div>
            </div>
          </GridToolbar>
          <GridColumn
            field="benefitId"
            title="Benefit"
            cell={(props) => {
              const benefitId = props.dataItem.benefitId;
              let benefitName = "";
              benefitsName.forEach((name) => {
                if (name.id == benefitId) {
                  benefitName = name.benefitsName;
                }
              });
              return <td>{benefitName}</td>;
            }}
          />
          <GridColumn
            field="startDate"
            title="Start Date"
            editor="date"
            format="{0:MM/dd/yyyy}"
            cell={(props) => {
              if (props.dataItem.startDate) {
                const [year, month, day] = props.dataItem.startDate
                  .split("T")[0]
                  .split("-");
                return <td>{`${month}/${day}/${year}`}</td>;
              } else {
                return <td></td>;
              }
            }}
          />
          <GridColumn
            field="endDAte"
            title="End Date"
            editor="date"
            format="{0:MM/dd/yyyy}"
            cell={(props) => {
              if (props.dataItem.endDAte) {
                const [year, month, day] = props.dataItem.endDAte
                  .split("T")[0]
                  .split("-");
                return <td>{`${month}/${day}/${year}`}</td>;
              } else {
                return <td></td>;
              }
            }}
          />
          <GridColumn
            field="benefitRate"
            title="Percentage"
            cell={(props) => {
              if (props.dataItem?.benefitRate) {
                var rate = props.dataItem?.benefitRate || 0;
                rate = rate?.toFixed(2) + "%";

                return <td className="!k-text-right">{`${rate}`}</td>;
              } else {
                return <td></td>;
              }
            }}
          />
          <GridColumn
            field="benefitAmount"
            title="Amount"
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
              if (props.dataItem?.benefitAmount) {
                var amount = props.dataItem?.benefitAmount || 0;
                amount =
                  "$" +
                  amount?.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                return <td className="!k-text-right">{`${amount}`}</td>;
              } else {
                return <td></td>;
              }
            }}
          />
          <GridColumn
            field="cac"
            title="County Expense"
            cell={(props) => (
              <td>
                {
                  CACDDList?.find((i) => i.id == props.dataItem.cac)
                    ?.countyExpenseCode
                }
              </td>
            )}
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
          {columnShow && <GridColumn field="modifiedBy" title="Modified By" />}
          <GridColumn cell={CommandCell} />
        </Grid>
        <ContextMenu
          show={show}
          offset={offset.current}
          onSelect={handleOnSelect}
          onClose={handleCloseMenu}
        >
          {checkPrivialgeGroup("PRBEditCM", 3) && (
            <MenuItem
              text="Edit Benefit"
              data={{
                action: "edit",
              }}
              svgIcon={eyedropperIcon}
            />
          )}
          {isActiveBenefit && checkPrivialgeGroup("PRBMakeInactiveCM", 3) && (
            <MenuItem
              text="Make Inactive"
              data={{
                action: "inactive",
              }}
              svgIcon={eyeSlashIcon}
            />
          )}
          {!isActiveBenefit && checkPrivialgeGroup("PRBMakeInactiveCM", 3) && (
            <MenuItem
              text="Make Active"
              data={{
                action: "active",
              }}
              svgIcon={eyeSlashIcon}
            />
          )}
          <MenuItem
            text="Duplicate Benefit"
            data={{
              action: "duplicate",
            }}
            svgIcon={plusOutlineIcon}
          />
        </ContextMenu>
      </div>}
      <div>
        {addEditBenefit && (
          <Dialog
            width={600}
            title={
              <div className="d-flex align-items-center justify-content-center">
                <i className="fa-solid fa-plus"></i>
                <span className="ms-2">
                  {isEdit ? "Edit Benefit" : "Add New Benefit"}
                </span>
              </div>
            }
            onClose={addEditBenefitToggleDialog}
          >
            <Form
              onSubmit={addferBenefitHandleSubmit}
              initialValues={formInit}
              key={formKey}
              ref={formRef}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <div
                      style={{
                        border:
                          !formInit.id || !isEdit ? "1px solid" : "inherit",
                        padding: !formInit.id || !isEdit ? "15px" : "inherit",
                        borderRadius:
                          !formInit.id || !isEdit ? "10px" : "inherit",
                      }}
                    >
                      <div>
                        <Field
                          id={"id"}
                          name={"id"}
                          component={FormInput}
                          type={"hidden"}
                        />
                        <Field
                          id={"benefit"}
                          data={benefitsName}
                          name={"benefit"}
                          label={"Benefit*"}
                          textField="benefitsName"
                          dataItemKey="id"
                          component={FormDropDownList}
                          onChange={() => {
                            formRenderProps.onChange("benefitPachakeId", {
                              value: null,
                            });
                            setBenefitType("benefit");
                          }}
                          validator={
                            formRenderProps.valueGetter("benefitPachakeId")
                              ? null
                              : benefitValidator
                          }
                        />
                      </div>

                      {formInit.id == undefined && !isEdit && (
                        <>
                          <div className="mt-3 text-center d-flex gap-3 align-items-center">
                            <span
                              className="w-100 bg-dark"
                              style={{ height: "1px" }}
                            ></span>
                            OR
                            <span
                              className="w-100 bg-dark"
                              style={{ height: "1px" }}
                            ></span>
                          </div>

                          <div>
                            <Field
                              id={"id"}
                              name={"id"}
                              component={FormInput}
                              type={"hidden"}
                            />
                            <Field
                              id={"benefitPachakeId"}
                              data={benefitsPackage}
                              name={"benefitPachakeId"}
                              label={"Benefit Package*"}
                              textField="benMacroName"
                              dataItemKey="id"
                              component={FormDropDownList}
                              onChange={() => {
                                formRenderProps.onChange("benefit", {
                                  value: null,
                                });
                                setBenefitType("benefitPackage");
                              }}
                              validator={
                                formRenderProps.valueGetter("benefit")
                                  ? null
                                  : benefitPackageValidator
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
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
                      />
                      <div>
                        <Field
                          id={"endDate"}
                          name={"endDate"}
                          label={"End Date"}
                          component={FormDatePicker}
                          onChange={updateEndDate}
                          wrapperstyle={{ width: "100%" }}
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
                    </div>
                    {IHACDisplay && benefitType == "benefit" && (
                      <div onClick={() => setVisibleIHPO(true)}>
                        <Field
                          id={"ihac"}
                          name={"ihac"}
                          label={"IHAC"}
                          component={FormInput}
                        />
                      </div>
                    )}
                    {benefitType == "benefit" && (
                      <div
                        style={{ width: "100%", marginRight: "10px" }}
                        onClick={() => setVisibleSAC(true)}
                      >
                        <Field
                          id={"sac"}
                          name={"sac"}
                          label={"SAC"}
                          component={FormInput}
                        />
                      </div>
                    )}
                    {benefitType == "benefit" && (
                      <div>
                        {" "}
                        <Field
                          id={"id"}
                          name={"id"}
                          component={FormInput}
                          type={"hidden"}
                        />
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
                          placeholder="Search CAC..."
                        />
                      </div>
                    )}


                    {benefitType == "benefit" && (
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
                          id={"benefitAmount"}
                          name={"benefitAmount"}
                          label={"Amount*"}
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
                            formRenderProps.onChange("benefitRate", {
                              value: null,
                            });
                          }}
                          validator={amountPerValidation}
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
                          id={"benefitRate"}
                          name={"benefitRate"}
                          label={"Percentage*"}
                          component={FormNumericTextBox}
                          wrapperstyle={{ width: "60%" }}
                          spinners={false}
                          max={100}
                          onChange={() => {
                            formRenderProps.onChange("benefitAmount", {
                              value: null,
                            });
                          }}
                          validator={amountPerValidation}
                        />
                      </div>
                    )}

                    <div className="k-form-buttons">
                      <Button
                        themeColor={"primary"}
                        className={"col-12"}
                        type={"submit"}
                        disabled={!formRenderProps.allowSubmit || endDateError}
                      >
                        Save Benefit
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </Dialog>
        )}
        {visibleSAC && (
          <SacDialog
            toggleDialog={toggleDialogSAC}
            getSacCode={getSacCode}
            SACValue={sacCode}
            type={7}
          />
        )}
        {visibleIHPO && (
          <IHACDialog
            toggleIHPODialog={toggleIHPODialog}
            getIHACCode={getIHACCode}
            getSacCode={getSacCode}
            getCAC={() => handleFieldChange()}
            IHACValue={IHACCode}
            forihpo={false}
          >
            {" "}
          </IHACDialog>
        )}
      </div>
      {chengesStatus && (
        <Dialog
          title={<span>Please confirm</span>}
          onClick={() => setChangeStatus(null)}
        >
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure you want to change status ?
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={() => setChangeStatus(null)}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={getBenefitStatusChange}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
};

export default JobBenefits;
