import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  ConfigurationEndPoints,
  IHACExpenseCodeEndPoints,
  PayrollEmployee,
  RevenueEndPoints,
} from "../../../EndPoints";
import Constants from "../../common/Constants";
import {
  FormDropDownList,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
  FormRadioGroup,
  radioData,
} from "../../form-components";
import SacDialog from "../../modal/StateAccountCodeDialog";
import IHACDialog from "../../Payroll/Job/modals/IHACpopup";

function AddPayrollExpandPopup({
  toggleDialog,
  selectedRowData,
  empId,
  selectedPayrollExpandData,
}) {
  const [CACDDList, setCACDDList] = React.useState([]);
  const [IHACDisplay, setIHACDisplay] = useState(false);
  const [visibleIHPO, setVisibleIHPO] = useState(false);
  const [, setIHACDDList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [distribution, setDistribution] = useState([]);

  const [key, setKey] = useState(0);

  const cacRef = useRef([]);
  const formRef = useRef();

  useEffect(() => {
    if (distribution.length && Object.keys(selectedPayrollExpandData)?.length) {
      const initValues = {
        ...selectedPayrollExpandData,
        grossPay: selectedPayrollExpandData.gross,
        primary: selectedPayrollExpandData?.primaryJob ?? false,
        job: distribution?.find(
          (job) => job.id == selectedPayrollExpandData.payDistId
        ),
        cac: CACDDList?.find((cac) => cac.id == selectedPayrollExpandData.cac),
      };
      setFormInit(initValues);
      setKey(key + 1);
    }
  }, [selectedPayrollExpandData, distribution.length]);

  const getSacCode = (sac) => {
    if (formRef.current) {
      formRef.current.onChange("sac", {
        name: "sac",
        touched: true,
        value: sac,
      });
    }
  };

  const toggleIHPODialog = () => {
    setVisibleIHPO(!visibleIHPO);
  };

  const getIHACCode = (ihac) => {
    formRef.current.valueSetter("ihac", ihac);
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
      .catch(() => {});
  };

  useEffect(() => {
    getihac();
    getIHACConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CACColumns = [
    {
      field: "countyExpenseCode",
      header: "Name",
      width: "210px",
    },
    {
      field: "countyExpenseDescription",
      header: "Description",
      width: "210px",
    },
  ];
  const [formInit, setFormInit] = useState({});
  const [notificationState, setNotificationState] = React.useState({
    none: false,
    success: false,
    error: false,
    warning: false,
    info: false,
    notificationMessage: "",
  });
  const [CACVal, setCACVal] = React.useState({
    value: {
      text: "Select County Expense Code",
      id: 0,
    },
  });

  const onToggle = (flag, notificationMessage) =>
    setNotificationState({
      ...notificationState,
      [flag]: !notificationState[flag],
      notificationMessage: notificationMessage,
    });
  const { success, error, notificationMessage } = notificationState;

  useEffect(() => {
    getDistributionList();
    getCAC();
  }, []);

  const getDistributionList = async () => {
    try {
      if (selectedRowData || empId) {
        let url =
          PayrollEmployee.PayrollDistribution +
          `/?active=${true}&empId=${selectedRowData?.empId || empId}`;

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
        if (selectedRowData && distribution?.length) {
          setFormInit(() => ({
            ...formInit,
            cac: data.find((c) => c.id == selectedRowData.cac) || null,
            distribution: selectedRowData.distribution,
            grossPay: selectedRowData.gross,
            job:
              distribution?.find((j) => j.id == selectedRowData.payDistId) ||
              null,
            nots: selectedRowData.nots,
          }));
          setCACVal(selectedRowData.accountingCode || null);
          setKey(key + 1);
        }
        cacRef.current = data;
      })
      .catch((error) => {
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
      });
  };

  const handleSubmit = (value) => {
    toggleDialog();
  };

  return (
    <>
      <Dialog
        width={600}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-plus"></i>
            <span className="ms-2">
              {selectedRowData?.empId ? "View Distribution" : "Add"}
            </span>
          </div>
        }
        onClose={toggleDialog}
      >
        <Form
          onSubmit={handleSubmit}
          initialValues={formInit}
          ref={formRef}
          key={key}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field
                  id={"job"}
                  name={"job"}
                  label={"Job"}
                  textField="jobName"
                  dataItemKey="id"
                  component={FormDropDownList}
                  data={distribution}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  disabled
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
                  placeholder="Search CAC..."
                  disabled
                />

                <div>
                  {IHACDisplay && (
                    <div
                      onClick={() => setVisibleIHPO(true)}
                      style={{ flex: "1" }}
                    >
                      <Field
                        id={"ihac"}
                        name={"ihac"}
                        label={"IHAC"}
                        component={FormInput}
                        disabled
                      />
                    </div>
                  )}
                </div>
                <div onClick={() => setVisible(true)}>
                  <Field
                    id={"sac"}
                    name={"sac"}
                    label={"SAC"}
                    component={FormInput}
                    disabled
                  />
                </div>
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ gap: "15px" }}
                >
                  <Field
                    id={"grossPay"}
                    name={"grossPay"}
                    label={"Gross Pay"}
                    format="c2"
                    component={FormNumericTextBox}
                    step={0}
                    min={0}
                    spinners={false}
                    wrapperstyle={{ flex: "1" }}
                    disabled
                  />
                  <Field
                    id={"salary"}
                    name={"salary"}
                    label={"Salary"}
                    format="c2"
                    component={FormNumericTextBox}
                    step={0}
                    min={0}
                    spinners={false}
                    wrapperstyle={{ flex: "1" }}
                    disabled
                  />
                </div>

                <Field
                  id={"nots"}
                  name={"nots"}
                  label={"Notes"}
                  component={FormInput}
                  disabled
                />
                {selectedRowData && selectedRowData.id && (
                  <Field
                    id={"primaryJob"}
                    name={"primaryJob"}
                    label={"Primary"}
                    placeholder={""}
                    data={radioData}
                    layout={"horizontal"}
                    component={FormRadioGroup}
                    disabled={true}
                  />
                )}

                <div className="k-form-buttons">
                </div>
              </fieldset>
            </FormElement>
          )}
        />
      </Dialog>
      <NotificationGroup
        style={{
          top: "50%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: "9999999",
        }}
      >
        {success && (
          <Notification
            type={{
              style: "success",
              icon: true,
            }}
            closable={true}
            onClose={() =>
              setNotificationState({
                ...notificationState,
                success: false,
                notificationMessage: "",
              })
            }
          >
            {notificationMessage}
          </Notification>
        )}
        {error && (
          <Notification
            type={{
              style: "error",
              icon: true,
            }}
            closable={true}
            onClose={() =>
              setNotificationState({
                ...notificationState,
                success: false,
                notificationMessage: "",
              })
            }
          >
            {notificationMessage}
          </Notification>
        )}
      </NotificationGroup>
      {visible && (
        <SacDialog
          toggleDialog={toggleDialog}
          getSacCode={getSacCode}
          type={7}
        />
      )}
      {visibleIHPO && (
        <IHACDialog
          toggleIHPODialog={toggleIHPODialog}
          getIHACCode={getIHACCode}
          forihpo={false}
        ></IHACDialog>
      )}
    </>
  );
}

export default AddPayrollExpandPopup;
