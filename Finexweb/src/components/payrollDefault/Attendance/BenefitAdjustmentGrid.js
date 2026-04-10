import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  IHACExpenseCodeEndPoints,
  Payroll,
  PayrollEmployee,
  PayrollEmployeeSetup,
  PayrollEndPoints,
  RevenueEndPoints,
} from "../../../EndPoints";
import { useStartEndDateValidatorForSingle } from "../../../helper/useStartEndDateValidatorForSingle";
import MyCommandCell from "../../cells/CommandCell";
import Constants from "../../common/Constants";
import {
  ColumnFormCurrencyTextBox,
  FormDropDownList,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
} from "../../form-components";
import SacDialog from "../../modal/StateAccountCodeDialog";
import IHACDialog from "../../Payroll/Job/modals/IHACpopup";
import {
  cacForValidator
} from "../../validators";

const DATA_ITEM_KEY = "id";
const editField = "inEdit";

const employeeColumns = [
  {
    field: "fullName",
    header: "Name",
    width: "150px",
  },
  {
    field: "employee.employeeNumber",
    header: "Employee No",
    width: "150px",
  },
  {
    field: "employee.groupNumber",
    header: "Group No",
    width: "150px",
  },
];

const BenefitAdjustmentGrid = ({
  data,
  benefitList,
  setProjectOptions,
  paginationData,
  getBenefitAdjustmentGrid,
  fetchBenefit,
  checkPrivialgeGroup
}) => {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };

  const [showFilter, ] = useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [, setIHACDDList] = React.useState([]);
  const [, setSelectedRowId] = useState(null);

  const [, setSearchText] = useState("");
  const [page, setPage] = useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);
  const [bindBenefitAdjustmentGrid, setBindBenefitAdjustmentGrid] =
    useState(null);
  const [addBenefit, setAddBenefit] = useState(false);
  const [formInit, setFormInit] = useState([]);
  const [formKey, ] = useState(0);
  const [dropdownSearch, ] = useState("");
  const [FilterDropdownData, ] = useState("");
  const [TCEmployee, setTCEmployee] = useState([]);
  const [benefitsName, setBenefitsName] = useState([]);
  const [jobList, setJobList] = useState();
  const [CACDDList, setCACDDList] = useState([]);
  let [formData, setformData] = useState({});

  const [visibleIHPO, setVisibleIHPO] = useState(false);
  const [visibleSAC, setVisibleSAC] = useState(false);
  const [isEditData, setIsEditData] = useState({});
  const [filter, setFilter] = useState();

  const formRef = useRef();

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

  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };

  const toggleDialogSAC = () => {
    setVisibleSAC(!visibleSAC);
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

  const getIHACCode = (ihac) => {
    formRef.current.valueSetter("ihac", ihac);
  };
  const onIhacChange = (e) => {
    setformData({ ...formData, [e.target.name]: e.target.value });
  };
  const {
    endDateError,
  } = useStartEndDateValidatorForSingle();
  useEffect(() => {
    getihac();
  }, []);

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

  const onCheckBox = () => {
    setColumnShow(!columnShow);
  };

  const filterData = (e) => {
    let value = e.target.value;
    setSearchText(value);
  };

  const DropDownCommandCell = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    let dataValue = dataItem[field] == null ? "" : dataItem[field];
    if (typeof dataValue == "number") {
      dataValue = benefitList.find((type) => type.id == dataValue);
    }
    return (
      <td>
        {benefitList.find((item) => item.id == dataItem[field])?.benefitsName}
      </td>
    );
  };

  const CommandCell = (props) => {
    const { dataItem } = props;
    if (!dataItem.postDate) {
      return (
        <MyCommandCell
          {...props}
          edit={enterEdit}
          update={update}
          cancel={cancel}
          remove={toggleDeleteDialog}
          add={add}
          discard={discard}
          editField={editField}
        />
      );
    } else {
      return <td></td>;
    }
  };

  const formateDate = (initDate) => {
    const date = new Date(initDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formatDate = `${month < 9 ? "0" + month : month}/${day < 9 ? "0" + day : day}/${year}`;
    return formatDate;
  };

  const update = (dataItem) => {
    const newData = data.map((item) =>
      item.id == dataItem.id ? { ...dataItem } : item
    );
    setProjectOptions(newData);

    const apiRequest = {
      id: isEditData.id,
      EmpID: isEditData.empId,
      JobID: isEditData?.jobInfoId || "",
      cac: dataItem?.cac?.id || null,
      sac: dataItem?.sac || "",
      ihac: dataItem?.ihac || "",
      DatePaid: formateDate(isEditData?.datePaid) || null,
      GrossAmount: dataItem?.benefitAmount || "",
      NewGrossAmount: dataItem?.benefitAmount || "",
    };
    axiosInstance({
      method: "POST",
      url: Payroll.UpdateAdjustedPayroll,
      data: apiRequest,
    })
      .then((response) => {
        setIsEditData({});
        setAddBenefit(false);
        fetchBenefit();
      })
      .catch(() => { });
  };

  const cancel = (dataItem) => {
    let newData = data.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: false,
        }
        : item
    );
    setProjectOptions(newData);
  };

  const toggleDeleteDialog = (dataItem) => {
    setDeleteVisible(!deleteVisible);
    setSelectedRowId(dataItem.id);
  };

  const add = (dataItem) => { };

  const discard = () => { };

  const remove = () => {};

  const itemChange = (event) => {
    const newData = data.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [event.field || ""]: event.value,
        }
        : item
    );
    setProjectOptions(newData);
  };

  const myCustomDateCell = (props) => {
    var myDate = props.dataItem.postDate;
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");
      return <td>{`${month}/${day}/${year} `}</td>;
    } else {
      return <td />;
    }
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindBenefitAdjustmentGrid) {
        getBenefitAdjustmentGrid(
          bindBenefitAdjustmentGrid.cskip,
          bindBenefitAdjustmentGrid.ctake == "All"
            ? 0
            : bindBenefitAdjustmentGrid.ctake,
            bindBenefitAdjustmentGrid.sort,
            bindBenefitAdjustmentGrid.desc
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindBenefitAdjustmentGrid]);

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindBenefitAdjustmentGrid({
        ...bindBenefitAdjustmentGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindBenefitAdjustmentGrid({
        ...bindBenefitAdjustmentGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: paginationData.pageTotal,
      });
    }
  };
  const initialSort = [
    {
      field: "lastName",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const filterChange = (event) => {
    var code = "";
    var fundName = "";
    var startDate = "";
    var inactiveDate = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "fundCode") {
          code = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "fundName") {
          fundName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "activeDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          startDate = date;
        }
        if (event.filter.filters[i].field == "inactiveDate") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          inactiveDate = date;
        }
      }
    }
    setFilter(event.filter);
  };
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "desc" ? true : false;
    let sortColumn = sortDetail?.field ? sortDetail.field : "lastName";
    setBindBenefitAdjustmentGrid({
      ...bindBenefitAdjustmentGrid,
      sort: sortColumn,
      desc: direction,
    });
  };

  const addEditBenefitToggleDialog = () => {
    setAddBenefit(null);
  };

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
        .catch((error) => {
          console.log(error);
        });
    };

    getBenefitsName();
  }, []);

  const getJob = async (id) => {
    try {
      const { data } = await axiosInstance({
        method: "GET",
        url: PayrollEmployee.EmployeeJobs + "/" + id + "?active=true",
        withCredentials: false,
      });

      data.map((job) => {
        job.description = job.jobDescription.empJobDescription;
        return job;
      });
      setJobList(data);
    } catch (e) { }
  };

  const getEmployeeData = () => {
    axiosInstance({
      method: "GET",
      url: PayrollEmployeeSetup.getEmployeeGridData + "?skip=0&take=0",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        data.map((employee) => {
          employee.fullName =
            employee.employee.displayName;
          return employee;
        });
        setTCEmployee(data);
      })
      .catch((error) => {
        console.log(error);
      });
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

  useEffect(() => {
    getEmployeeData();
    getCAC();
  }, []);

  const enterEdit = (dataItem) => {
    setAddBenefit(true);
    setIsEditData(dataItem);
    getJob(dataItem?.empId);
    const jobDataFind = jobList?.filter(
      (el) => Number(el.id) == Number(dataItem?.jobInfoId)
    );
    const benefitDataFind = benefitsName?.filter(
      (el) => Number(el.id) == Number(dataItem?.benefitId)
    );
    const TCEmployeeData = TCEmployee?.filter(
      (el) => Number(el.empId) == Number(dataItem?.empId)
    );

    const CACDDATA = CACDDList?.filter(
      (el) => el.countyExpenseCode == dataItem?.accountingCode
    );

    setFormInit({
      empName: TCEmployeeData?.[0] ?? {},
      job: jobDataFind?.[0] ?? {},
      benefit: benefitDataFind?.[0] ?? {},
      benefitAmount: dataItem?.prtbdAmount,
      cac: CACDDATA?.[0],
      sac: dataItem?.prtbdSAC,
      ihac: dataItem?.prtbdIHAC,
    });
  };

  const amountPerValidation = () => {
    const amount = formRef.current.valueGetter("benefitAmount");
    const percentage = formRef.current.valueGetter("benefitRate");
    return !amount && !percentage ? "Field is Required" : "";
  };
  return (
    <>
      <Grid
        data={data}
        filterable={showFilter}
        filter={filter}
        onFilterChange={filterChange}
        scrollable="scrollable"
        dataItemKey={DATA_ITEM_KEY}
        selectable={{
          enabled: true,
          drag: false,
          mode: "multiple",
          cell: false,
        }}
        sortable={true}
        editField={editField}
        onItemChange={itemChange}
        skip={page.skip}
        take={page.take}
        total={paginationData?.pageTotal}
        pageable={{
          buttonCount: 4,
          pageSizes: [10, 15, 50, "All"],
          pageSizeValue: pageSizeValue,
        }}
        sort={sort}
        onSortChange={(e) => {
          onSortChange(e);
        }}
        onPageChange={pageChange}
      >
        <GridToolbar>
          <div className="row col-sm-12">
            <div className="col-sm-5 d-grid gap-3 d-md-block">
            </div>
            <div className="col-sm-7 d-flex align-items-center justify-content-center">
              {checkPrivialgeGroup("PRBASMICB", 1) && <div className="col-4">
                <Checkbox
                  type="checkbox"
                  id="modifiedBy"
                  name="modifiedBy"
                  defaultChecked={columnShow}
                  onChange={onCheckBox}
                  label={"Modified Info"}
                />
              </div>}
              <div className="input-group">
                <Input
                  className="form-control border-end-0 border"
                  onChange={filterData}
                />
                <span className="input-group-append">
                  <button
                    className="btn btn-outline-secondary bg-white rounded-0 border-start-0 rounded-end-2 border ms-n5"
                    type="button"
                  >
                    <i className="fa fa-search"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </GridToolbar>

        <GridColumn
          field="lastName"
          title="Last Name"
          cell={(props) => {
            return <td>{props.dataItem.lastName}</td>;
          }}
        />
        <GridColumn
          field="firstName"
          title="First Name"
          cell={(props) => {
            return <td>{props.dataItem.firstName}</td>;
          }}
        />
        <GridColumn
          field="benefitId"
          title="Benefit Name"
          width="250px"
          cell={DropDownCommandCell}
        />
        <GridColumn
          field="prtbdAmount"
          title="Amount"
          format="{0:c2}"
          headerClassName="header-right-align"
          // headerCell={(props) => {
          //   return (
          //     <span className="k-cell-inner">
          //       <span className="k-link !k-cursor-default d-flex justify-content-end">
          //         <span className="k-column-title">{props.title}</span>
          //         {props.children}
          //       </span>
          //     </span>
          //   );
          // }}
          cell={ColumnFormCurrencyTextBox}
        />
        <GridColumn
          field="prtbdIHAC"
          title="IHAC"
        />
        <GridColumn
          field="prtbdSAC"
          title="SAC"
        />

        <GridColumn
          field="accountingCode"
          title="CAC"
        />
        <GridColumn
          field="postDate"
          title="Post Date"
          cell={myCustomDateCell}
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
        {checkPrivialgeGroup('PRBACC', 3) && <GridColumn cell={CommandCell} filterable={false} />}
      </Grid>
      {addBenefit && (
        <Dialog
          width={600}
          title={
            <div className="d-flex align-items-center justify-content-center">
              <i className="fa-solid fa-plus"></i>
              <span className="ms-2">Edit Benefit</span>
            </div>
          }
          onClose={addEditBenefitToggleDialog}
        >
          <Form
            onSubmit={update}
            initialValues={formInit}
            key={formKey}
            ref={formRef}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={"k-form-fieldset"}>
                  <div>
                    <div>
                      <Field
                        id={"id"}
                        name={"id"}
                        component={FormInput}
                        type={"hidden"}
                      />
                      <Field
                        id={"empName"}
                        name={"empName"}
                        label={"Employee"}
                        textField="fullName"
                        dataItemKey="id"
                        component={FormMultiColumnComboBox}
                        data={
                          dropdownSearch || FilterDropdownData.length
                            ? FilterDropdownData
                            : TCEmployee
                        }
                        columns={employeeColumns}
                        defaultValue={formInit?.empName ?? {}}
                        placeholder="Search Employee..."
                        className="m-0"
                        filterable={true}
                        disabled={true}
                      />
                    </div>
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
                        label={"Benefit"}
                        textField="benefitsName"
                        dataItemKey="id"
                        component={FormDropDownList}
                        onChange={() => {
                          formRenderProps.onChange("benefitPachakeId", {
                            value: null,
                          });
                        }}
                        defaultValue={formInit?.benefit ?? {}}
                        disabled={true}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 8,
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
                        id={"cac"}
                        name={"cac"}
                        label={"CAC"}
                        textField="countyExpenseCode"
                        dataItemKey="id"
                        component={FormMultiColumnComboBox}
                        data={CACDDList}
                        value={CACVal}
                        columns={CACColumns}
                        defaultValue={formInit?.cac}
                        onChange={onIhacChange}
                        placeholder="Search CAC..."
                        validator={cacForValidator}
                      />
                    </div>
                    <div
                      style={{ width: "100%", marginRight: "10px" }}
                      onClick={() => setVisibleSAC(true)}
                    >
                      <Field
                        id={"sac"}
                        name={"sac"}
                        label={"SAC"}
                        component={FormInput}
                        defaultValue={formInit?.sac}
                      />
                    </div>
                    <div onClick={() => setVisibleIHPO(true)}>
                      <Field
                        id={"ihac"}
                        name={"ihac"}
                        label={"IHAC"}
                        component={FormInput}
                        defaultValue={formInit?.ihac}
                      />
                    </div>
                    <div>
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
                    </div>
                  </div>
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
          type={7}
        />
      )}
      {visibleIHPO && (
        <IHACDialog
          toggleIHPODialog={toggleIHPODialog}
          getIHACCode={getIHACCode}
          forihpo={false}
        />
      )}
      {deleteVisible && (
        <Dialog
          title={<span>Please confirm</span>}
          onClose={toggleDeleteDialog}
        >
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure you want to Delete?
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={toggleDeleteDialog}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={remove}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
};

export default BenefitAdjustmentGrid;
