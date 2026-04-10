import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useEffect, useMemo, useState } from "react";

import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Tooltip } from "@progress/kendo-react-tooltip";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  Payroll,
  PayrollAttendance,
  ReportsEndPoints,
} from "../../../EndPoints";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
} from "../../form-components";
import { postDateValidator } from "../../validators";

const PayrollFilterForm = ({
  handleFormDatePicker,
  payrollTotalsData,
  setDatePaid,
  payrollDetails,
  setBindDataGrid,
  PayrollToatals,
  checkPrivialgeGroup
}) => {
  const [formKey, setFormKey] = useState(1);
  const [paidDates, setPaidDates] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [runAutoPayrollPopupVisible, setRunAutoPayrollPopupVisible] =
    useState(false);

  const [filterData, setFilterData] = useState({
    payStart: null,
    payEnd: null,
  });
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedPaidDate, setSelectedPaidDate] = useState("");
  const [isOpenModel, setIsOpenModel] = useState(null);
  const [selectPostDate, setSelectPostDate] = useState("");

  useEffect(() => {
    if (paidDates?.length && !selectedPaidDate) {
      const test = new Date(paidDates[0]);
      const day = test.getDate();
      const month = test.getMonth() + 1;
      const year = test.getFullYear();
      const formatDate = `${month <= 9 ? "0" + month : month}/${day <= 9 ? "0" + day : day}/${year}`;
      setSelectedPaidDate(formatDate);
    }
  }, [paidDates]);

  const toggleRunAutoPayrollDialog = () => {
    if (paidDates[0] !== selectedPaidDate) {
      return setRunAutoPayrollPopupVisible(!runAutoPayrollPopupVisible);
    }
    handleRunAutoPayroll();
  };

  useEffect(() => {
    setFormKey(formKey + 1);
  }, [filterData]);

  useEffect(() => {
    getPaidDates(true);
  }, []);

  const getPaidDates = (setDefault) => {
    axiosInstance({
      method: "GET",
      url: PayrollAttendance.GetDatePaid,
      withCredentials: false,
    })
      .then((response) => {
        if (response?.data.data) {
          setPaidDates(response.data.data);
          if (setDefault) {
            let firstRecord = response.data.data[0];
            setDatePaid(firstRecord);
            setFilterData({ paidDate: firstRecord });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const initialValues = useMemo(() => {
    if (
      payrollDetails &&
      payrollDetails &&
      Object.keys(payrollDetails).length
    ) {
      setFormKey(Math.floor(Math.random() * 100001));
      const date = new Date(payrollDetails?.prDatePaid)
        .toLocaleDateString()
        .split("/")
        .join("-");
      const test = new Date(selectedPaidDate || payrollDetails?.prDatePaid);
      const day = test.getDate();
      const month = test.getMonth() + 1;
      const year = test.getFullYear();
      const formatDate = `${month <= 9 ? "0" + month : month}/${day <= 9 ? "0" + day : day}/${year}`;
      setDatePaid(date);
      setSelectedDay(payrollDetails.whichPay);
      return {
        paidDate: formatDate,
        payStart: new Date(payrollDetails.payStartDate),
        payEnd: new Date(payrollDetails.payEndDate),
        whichPay: payrollDetails.whichPay,
        postDate:
          payrollDetails && payrollDetails.postDate
            ? new Date(payrollDetails.postDate)
            : null,
        empTotal: payrollDetails?.prTotalHours,
      };
    }
    setFormKey(Math.floor(Math.random() * 100001));
    return {
      paidDate: filterData.paidDate ?? null,
      payStart: null,
      payEnd: null,
      whichPay: selectedDay ?? 0,
      postDate: null,
      empTotal: 0,
    };
  }, [payrollTotalsData, setDatePaid, selectedPaidDate, payrollDetails]);

  useEffect(() => {
    if (paidDates.length > 0) {
      if (!selectedPaidDate) {
        handleFormDatePicker(paidDates[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidDates]);

  const getFieldData = (e) => {
    setSelectedPaidDate(e.value);
    handleFormDatePicker(e.value);
  };
  const getFieldDataByDate = (e) => {
    setSelectedPaidDate(e);
    handleFormDatePicker(e);
  };

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };

  const formateDate = (initDate) => {
    const date = new Date(initDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formatDate = `${month <= 9 ? "0" + month : month}/${day <= 9 ? "0" + day : day}/${year}`;
    return formatDate;
  };

  const handlePayrollPost = () => {
    const postDate = formateDate(selectPostDate);
    const apiRequest = {
      datePaid: initialValues?.paidDate,
      postDate,
    };
    axiosInstance({
      method: "POST",
      url: Payroll.PostPayroll,
      data: apiRequest,
    })
      .then((response) => {
        getFieldDataByDate(apiRequest.datePaid);
        setIsOpenModel(null);
        setSelectPostDate("");
      })
      .catch(() => { });
  };

  const handleRunAutoPayroll = () => {
    setRunAutoPayrollPopupVisible(false);
    const apiRequest = {
      datePaid: initialValues.paidDate,
      payPeriodStart: initialValues.payStart,
      payPeriodEnd: initialValues.payEnd,
      whichPay: initialValues.whichPay,
      runHourly: true,
      manualPay: 1,
    };
    axiosInstance({
      method: "POST",
      url: ReportsEndPoints.RunAutoPayroll,
      data: apiRequest,
    })
      .then((response) => {
        getPaidDates(false);
        PayrollToatals(initialValues.paidDate);
        setBindDataGrid((prev) => ({ ...prev }));
      })
      .catch(() => { });
  };

  const handlePayrollUnPost = () => {
    toggleDeleteDialog();
    const apiRequest = {
      datePaid: initialValues.paidDate,
    };
    axiosInstance({
      method: "POST",
      url: Payroll.PostPayroll,
      data: apiRequest,
    })
      .then((response) => {
        getFieldDataByDate(apiRequest.datePaid);
      })
      .catch(() => { });
  };
  const currentYear = new Date().getFullYear()
  const minDate = new Date(currentYear, 0, 1);

  return (
    <>
      <div>
        <Form
          onSubmit={{}}
          initialValues={initialValues}
          key={formKey}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <div
                  className="d-flex justify-content align-items-end"
                  style={{
                    gap: "10px",
                    flexWrap: "wrap",
                    margin: 0,
                  }}
                >
                  <Field
                    id={"paidDate"}
                    name={"paidDate"}
                    label={"Date Paid"}
                    component={FormDropDownList}
                    data={paidDates}
                    value={selectedPaidDate}
                    onChange={getFieldData}
                    wrapperstyle={{
                      width: "150px",
                    }}
                    filterable={false}
                  />
                  <Field
                    id={"payStart"}
                    name={"payStart"}
                    label={"Pay Start"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "150px",
                    }}
                    disabled={true}
                  />
                  <Field
                    id={"payEnd"}
                    name={"payEnd"}
                    label={"Pay End"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "150px",
                    }}
                    disabled={true}
                  />
                  <Field
                    id={"whichPay"}
                    name={"whichPay"}
                    label={"Which Pay"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "80px",
                    }}
                    disabled={true}
                  />
                  <Field
                    id={"postDate"}
                    name={"postDate"}
                    label={"Post Date"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "150px",
                    }}
                    disabled={true}
                  />
                  <div className="d-flex gap-2">
                    {initialValues.postDate ? (
                      <>
                        {checkPrivialgeGroup("PRPUPB", 4) && <Tooltip anchorElement="target" parentTitle={true}>
                          <Button
                            className="k-button k-button-lg k-rounded-lg"
                            themeColor={"primary"}
                            title={"Un-post payroll"}
                            onClick={toggleDeleteDialog}
                          >
                            Un-Post
                          </Button>
                        </Tooltip>}
                      </>
                    ) : (
                      <>
                        {checkPrivialgeGroup("PRPPB", 2) && <Tooltip anchorElement="target" parentTitle={true}>
                          <Button
                            className="k-button k-button-lg k-rounded-lg"
                            themeColor={"primary"}
                            title={"Post Payroll"}
                            onClick={() => {
                              setIsOpenModel(true);
                            }}
                          >
                            Post
                          </Button>
                        </Tooltip>}
                        <Tooltip anchorElement="target" parentTitle={true}>
                          <Button
                            className="k-button k-button-lg k-rounded-lg"
                            themeColor={"primary"}
                            title={"Run Auto payroll"}
                            onClick={toggleRunAutoPayrollDialog}
                          >
                            Run Auto payroll
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              </fieldset>
            </FormElement>
          )}
        />
      </div>
      {isOpenModel && (
        <Dialog
          width={650}
          title={
            <div className="d-flex align-items-center justify-content-center">
              <i className="fa-solid fa-right-left"></i>
              <span className="ms-2">Post date</span>
            </div>
          }
          onClose={() => {
            setIsOpenModel(null);
          }}
        >
          <Form
            onSubmit={handlePayrollPost}
            
            key={formKey}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={"k-form-fieldset"}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Field
                      id={"pastDate"}
                      name={"pastDate"}
                      label={"Post Date*"}
                      component={FormDatePicker}
                      validator={postDateValidator}
                      onChange={(e) => setSelectPostDate(e.value)}
                      startDate={minDate}
                      wrapperstyle={{
                        width: "100%",
                        marginRight: "10px",
                      }}
                    />
                  </div>

                  <div className="k-form-buttons">
                    <Button
                      themeColor={"primary"}
                      onClick={handlePayrollPost}
                    >
                      Post
                    </Button>
                  </div>
                </fieldset>
              </FormElement>
            )}
          />
        </Dialog>
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
            Are you sure you want to Un-Post?
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
              onClick={handlePayrollUnPost}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
      {runAutoPayrollPopupVisible && (
        <Dialog
          title={<span>Please confirm</span>}
          onClose={toggleRunAutoPayrollDialog}
        >
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure to re-run the payroll, any previous data will be wiped
            out.
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={toggleRunAutoPayrollDialog}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={handleRunAutoPayroll}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
};

export default PayrollFilterForm;
