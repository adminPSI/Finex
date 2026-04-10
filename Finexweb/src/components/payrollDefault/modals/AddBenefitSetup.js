import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { PayrollEndPoints } from "../../../EndPoints";
import {
  FormCheckbox,
  FormDropDownList,
  FormInput,
  FormNumericTextBox,
} from "../../form-components";
import { benefitNameValidator, benefitTypeValidator } from "../../validators";
export const AddBenefitSetup = ({
  setBenefitSetupPopupVisible,
  selectedBenefitRowId,
  selectedPackageRowId,
  setPackageData,
  handleBindBenefitSetup,
}) => {
  const formRef = useRef();
  const [benefitSetupFormInit, setBenefitSetupFormInit] = React.useState({});
  const [benefitTypeList, setBenefitTypeList] = React.useState([]);
  const [amountKey, setAmountKey] = React.useState(0);
  const [formKey, setformKey] = React.useState(0);

  const [options, setOptions] = useState({
    firstPayPeriod: false,
    secondPayPeriod: false,
    firstAndSecondPayPeriod: false,
    firstAndLastPayPeriod: false,
    lastPayPeriod: false,
    allPayPeriods: false,
    quaterly: false,
    benefitsExclude: false,
  });
  const [optionsForType, setOptionsForType] = useState({
    benefitsPers: false,
    medicare: false,
    workersComp: false,
  });

  const [payPeriodError, setPayPeriodError] = useState(false);
  const [payPeriodErrorCheck, setPayPeriodErrorCheck] = useState(true);

  const onCheckBox = (e) => {
    setOptions({ [e.target.name]: e.target.value });
    setPayPeriodError(!e.target.value);
  };

  const onCheckBoxForType = (e) => {
    setOptionsForType({ ...optionsForType, [e.target.name]: e.target.value });
  };

  const closeMenuHandler = () => {
    (async () => {
      try {
        const result = await axiosInstance({
          method: "GET",
          url: PayrollEndPoints.Packages,
          withCredentials: false,
        });

        setPackageData(result?.data?.data || []);
      } catch (error) {
        console.log(error);
      }
    })();
    setBenefitSetupPopupVisible(false);
  };

  useEffect(() => {
    (async () => {
      const result1 = await axiosInstance({
        method: "GET",
        url: PayrollEndPoints.BenefitTypes,
        withCredentials: false,
      });
      setBenefitTypeList(result1.data);
      try {
        if (selectedBenefitRowId) {
          const result = await axiosInstance({
            method: "GET",
            url: PayrollEndPoints.BenefitsById.replace(
              "#ID#",
              selectedBenefitRowId
            ),
            withCredentials: false,
          });
          setOptions({
            benefitsExclude: result.data.benefitsExclude,
            inactive: result.data.inactive,
            firstPayPeriod: result.data.firstPayPeriod,
            secondPayPeriod: result.data.secondPayPeriod,
            lastPayPeriod: result.data.lastPayPeriod,
            firstAndSecondPayPeriod: result.data.firstAndSecondPayPeriod,
            firstAndLastPayPeriod: result.data.firstAndLastPayPeriod,
            allPayPeriods: result.data.allPayPeriods,
            quaterly: result.data.quaterly,
          });

          setOptionsForType({
            benefitsPers: result.data.benefitsPers,
            medicare: result.data.medicare,
            workersComp: result.data.workersComp,
          });
          setPayPeriodError(false);
          setBenefitSetupFormInit(result.data);
          if (result.data) {
            const {
              firstPayPeriod,
              secondPayPeriod,
              firstAndSecondPayPeriod,
              firstAndLastPayPeriod,
              lastPayPeriod,
              allPayPeriods,
              quaterly,
            } = result.data;
            if (
              firstPayPeriod ||
              secondPayPeriod ||
              firstAndSecondPayPeriod ||
              firstAndLastPayPeriod ||
              lastPayPeriod ||
              allPayPeriods ||
              quaterly
            ) {
              setPayPeriodErrorCheck(false);
            } else {
              setPayPeriodErrorCheck(true);
            }
          }

          setformKey(formKey + 1);
        } else {
          setBenefitSetupFormInit({});
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleSubmit = (dataItem) => {
    if (payPeriodErrorCheck) {
      let tmpCheck = false;
      Object.keys(options).map((item) => {
        if (!options[item]) {
          setPayPeriodError(true);
          tmpCheck = true;
        }
      });
      if (tmpCheck) return;
    }

    if (dataItem.id != undefined) {
      const data = {
        id: dataItem.id,
        orgAccountId: 7,
        benefitsName: dataItem.benefitsName,
        benefitsType: dataItem.benefitType?.id,
        benefitsPerMonth: 0,
        amount: dataItem.amount ?? 0,
        benefitsPercent: dataItem.benefitsPercent || 0,
        payPeriods: dataItem?.payPeriods?.id,
        type: dataItem?.payPeriods?.id,
        firstPayPeriod: false,
        secondPayPeriod: false,
        firstAndSecondPayPeriod: false,
        firstAndLastPayPeriod: false,
        lastPayPeriod: false,
        allPayPeriods: false,
        quaterly: false,
        benefitsExclude: false,
        ...options,
        ...optionsForType,
      };

      axiosInstance({
        method: "PUT",
        url: PayrollEndPoints.BenefitsById.replace("#ID#", dataItem.id),
        data: data,
        withCredentials: false,
      })
        .then((response) => {
          closeMenuHandler();
          handleBindBenefitSetup();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      const data = {
        id: 0,
        orgAccountId: 7,
        benefitsName: dataItem.benefitsName,
        benefitsType: dataItem.benefitType?.id,
        benefitsPerMonth: 0,
        amount: dataItem.amount ?? 0,
        benefitsPercent: dataItem.benefitsPercent || 0,
        payPeriods: dataItem?.payPeriods?.id,
        type: dataItem?.payPeriods?.id,
        firstPayPeriod: false,
        secondPayPeriod: false,
        firstAndSecondPayPeriod: false,
        firstAndLastPayPeriod: false,
        lastPayPeriod: false,
        allPayPeriods: false,
        quaterly: false,
        benefitsExclude: false,
        ...options,
        ...optionsForType,
      };
      if (selectedPackageRowId !== 0) {
        var Url = PayrollEndPoints.AddBenefitToPackage.replace(
          "#ID#",
          selectedPackageRowId
        );
      } else {
        var Url = PayrollEndPoints.Benefits;
      }
      axiosInstance({
        method: "POST",
        url: Url,
        data: data,
        withCredentials: false,
      })
        .then((response) => {
          closeMenuHandler();
          handleBindBenefitSetup();
        })
        .catch((error) => {
          console.log(error, "error");
        });
    }
  };

  const amountPerValidation = () => {
    const amount = formRef.current.valueGetter("amount");
    const percentage = formRef.current.valueGetter("benefitsPercent");
    return !amount && !percentage ? "Field is Required" : "";
  };

  return (
    <Dialog
      width={600}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i
            className={
              "fa-solid " +
              " " +
              (benefitSetupFormInit.id > 0 ? "fa-edit" : "fa-plus")
            }
          ></i>
          <span className="ms-2">
            {benefitSetupFormInit.id > 0 ? "Edit Benefit" : "Add Benefit"}
          </span>
        </div>
      }
      onClose={closeMenuHandler}
    >
      <Form
        onSubmit={handleSubmit}
        initialValues={benefitSetupFormInit}
        key={formKey}
        ref={formRef}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"benefitsName"}
                name={"benefitsName"}
                label={"Benefit Name*"}
                component={FormInput}
                wrapperstyle={{
                  width: "100%",
                }}
                validator={benefitNameValidator}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between ",
                  alignItems: "center",
                  gap: "15px",
                  border: "1px solid",
                  padding: "15px",
                  borderRadius: "10px",
                  marginTop: "15px",
                }}
              >
                <Field
                  id={"benefitsPercent"}
                  name={"benefitsPercent"}
                  label={"Benefit Percent*"}
                  component={FormNumericTextBox}
                  step={0}
                  spinners={false}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  key={amountKey}
                  onChange={() => {
                    formRenderProps.onChange("amount", {
                      value: null,
                    });
                  }}
                  max={100}
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
                  id={"amount"}
                  name={"amount"}
                  label={"Amount*"}
                  wrapperstyle={{
                    width: "100%",
                  }}
                  step={0}
                  spinners={false}
                  format="c2"
                  component={FormNumericTextBox}
                  onChange={() => {
                    formRenderProps.onChange("benefitsPercent", {
                      value: null,
                    });
                    setAmountKey(amountKey + 1);
                  }}
                  validator={amountPerValidation}
                />
              </div>
              <Field
                id={"benefitType"}
                name={"benefitType"}
                label={"Benefit Type*"}
                textField="typeOfBenefit"
                dataItemKey="id"
                component={FormDropDownList}
                data={benefitTypeList}
                value={benefitTypeList.id}
                wrapperstyle={{
                  width: "100%",
                }}
                validator={benefitTypeValidator}
              />

              <div className="d-flex justify-content-between gap-2">
                <div className="mt-3">
                  <h6>Type</h6>
                  <Field
                    id="benefitsPers"
                    name="benefitsPers"
                    label="PERS/STRS"
                    checked={optionsForType.benefitsPers == true}
                    component={FormCheckbox}
                    onChange={onCheckBoxForType}
                  />
                  <Field
                    id="medicare"
                    name="medicare"
                    label="Medicare"
                    checked={optionsForType.medicare == true}
                    component={FormCheckbox}
                    onChange={onCheckBoxForType}
                  />
                  <Field
                    id="workersComp"
                    name="workersComp"
                    label="Workers Comp"
                    checked={optionsForType.workersComp == true}
                    component={FormCheckbox}
                    onChange={onCheckBoxForType}
                  />
                </div>

                <div className="mt-3">
                  <h6>Pay Period*</h6>
                  <Field
                    id="firstPayPeriod"
                    name="firstPayPeriod"
                    label="1st Pay Period"
                    checked={options.firstPayPeriod == true}
                    component={FormCheckbox}
                    onChange={onCheckBox}
                  />
                  <Field
                    id="secondPayPeriod"
                    name="secondPayPeriod"
                    label="2nd Pay Period"
                    checked={options.secondPayPeriod == true}
                    component={FormCheckbox}
                    onChange={onCheckBox}
                  />
                  <Field
                    id="firstAndSecondPayPeriod"
                    name="firstAndSecondPayPeriod"
                    label="1st and 2nd Pay Period"
                    checked={options.firstAndSecondPayPeriod == true}
                    component={FormCheckbox}
                    onChange={onCheckBox}
                  />
                  <Field
                    id="firstAndLastPayPeriod"
                    name="firstAndLastPayPeriod"
                    label="1st and Last Pay Period"
                    checked={options.firstAndLastPayPeriod == true}
                    component={FormCheckbox}
                    onChange={onCheckBox}
                  />
                  <Field
                    id="lastPayPeriod"
                    name="lastPayPeriod"
                    label="Last Pay Period"
                    checked={options.lastPayPeriod == true}
                    component={FormCheckbox}
                    onChange={onCheckBox}
                  />
                  <Field
                    id="allPayPeriods"
                    name="allPayPeriods"
                    label="All Pay Periods"
                    checked={options.allPayPeriods == true}
                    component={FormCheckbox}
                    onChange={onCheckBox}
                  />
                  <Field
                    id="quaterly"
                    name="quaterly"
                    label="Quarterly"
                    checked={options.quaterly == true}
                    component={FormCheckbox}
                    onChange={onCheckBox}
                  />
                  {payPeriodError && (
                    <p
                      className="text-danger mt-2"
                      style={{ fontSize: "12px" }}
                    >
                      Pay period required
                    </p>
                  )}
                </div>
              </div>
              <div className="k-form-buttons">
                <Button
                  themeColor={"primary"}
                  className={"col-12"}
                  type={"submit"}
                  disabled={!formRenderProps.allowSubmit || payPeriodError}
                >
                  Save
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
};
