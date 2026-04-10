import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useRef, useState } from "react";
import { FormDatePicker, FormDropDownList, FormInput, FormNumericTextBox } from "../../form-components";
import { showSuccessNotification } from "../../NotificationHandler/NotificationHandler";
import axiosInstance from "../../../core/HttpInterceptor";
import { payrollEndpoints } from "../../../EndPoints";
import { benefitsNameValidator, newRateValidator, salaryEndDateValidator } from "../../validators";
export const UpdateBenefitsrate = ({
    onClose,
    benefitData
}) => {
    const formRef = useRef();
    const [banefitAmount, setBanefitAmount] = useState()
    const [formKey,] = React.useState(0);

    const UpdatehandleSubmit = (dataItem) => {
        const data = {
            BenID: dataItem?.benefit?.id,
            CurrentRate: dataItem?.benefit?.amount == 0 ? dataItem?.benefit?.benefitsPercent : dataItem?.benefit?.amount,
            NewRate: dataItem?.newRate,
            PercentRate: dataItem?.benefit?.amount == 0 ? true : false,
            EndDate: dataItem?.endDate
        }
        axiosInstance({
            method: "POST",
            url: payrollEndpoints.BenefitRateChange,
            data: data,
            withCredentials: false,
        })
            .then((response) => {
                showSuccessNotification("Benefit rate update successfully");
                onClose()
            })
            .catch(() => { });
    }

    const endDenefithandleSubmit = (dataItem) => {
        const data = {
            BenID: dataItem?.benefit?.id,
            EndDate: dataItem?.endDate
        }
        axiosInstance({
            method: "POST",
            url: payrollEndpoints.setEndDatesOnBenefitsByBenefitNo,
            data: data,
            withCredentials: false,
        })
            .then((response) => {
                showSuccessNotification("Benefit enddate successfully");
                onClose()
            })
            .catch(() => { });
    }
    return (
        <Dialog
            width={600}
            title={
                <div className="d-flex align-items-center justify-content-center">
                    <span className="ms-2">
                        Update Benefit Rate
                    </span>
                </div>
            }
            onClose={onClose}
        >
            <Form
                onSubmit={UpdatehandleSubmit}
                initialValues={{
                    benefit: "",
                    currentRate: banefitAmount,
                    newRate: "",
                    endDate: ""
                }}
                key={formKey}
                ref={formRef}
                render={(formRenderProps) => {
                    return (
                        <FormElement>
                            <fieldset className={"k-form-fieldset"}>
                                <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3"
                                >
                                    <Field
                                        id={"benefit"}
                                        name={"benefit"}
                                        label={"Select Benefit"}
                                        textField="benefitsName"
                                        dataItemKey="id"
                                        component={FormDropDownList}
                                        data={benefitData?.data}
                                        onChange={(e) => {
                                            const { value } = e;
                                            const amount = value?.amount == 0 ? `${value?.benefitsPercent}%` : value?.amount;
                                            formRenderProps.onChange("currentRate", {
                                                value: amount,
                                            });
                                            setBanefitAmount(amount)
                                        }}
                                        wrapperstyle={{
                                            width: "45%",
                                        }}
                                        validator={benefitsNameValidator}
                                    />
                                    <Field
                                        id={"currentRate"}
                                        name={"currentRate"}
                                        label={"Current Rate"}
                                        component={FormInput}
                                        wrapperstyle={{
                                            width: "50%",
                                        }}
                                        disabled
                                    />
                                </div>
                                <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
                                    <Field
                                        id={"newRate"}
                                        name={"newRate"}
                                        label={"New Rate"}
                                        component={FormNumericTextBox}
                                        validator={newRateValidator}
                                    />
                                    <Field
                                        id={"endDate"}
                                        name={"endDate"}
                                        label={"End Date"}
                                        component={FormDatePicker}
                                        validator={salaryEndDateValidator}
                                    />
                                </div>
                                <div className="k-form-buttons">
                                    <Button
                                        themeColor={"primary"}
                                        className={"col-12"}
                                        type={"submit"}
                                        disabled={!formRenderProps.allowSubmit}
                                    >
                                        Update Benefit Rate
                                    </Button>
                                </div>
                            </fieldset>
                        </FormElement>
                    )
                }}
            />
            <Form
                onSubmit={endDenefithandleSubmit}
                key={formKey}
                ref={formRef}
                render={(formRenderProps) => (
                    <FormElement>
                        <fieldset className={"k-form-fieldset"}>
                            <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
                                <Field
                                    id={"benefit"}
                                    name={"benefit"}
                                    label={"Select Benefit"}
                                    component={FormDropDownList}
                                    textField="benefitsName"
                                    dataItemKey="id"
                                    data={benefitData?.data}
                                    wrapperstyle={{
                                        width: "45%",
                                    }}
                                    validator={benefitsNameValidator}
                                />
                                <Field
                                    id={"endDate"}
                                    name={"endDate"}
                                    label={"End Date"}
                                    component={FormDatePicker}
                                    validator={salaryEndDateValidator}
                                />
                            </div>
                            <div className="k-form-buttons">
                                <Button
                                    themeColor={"primary"}
                                    className={"col-12"}
                                    type={"submit"}
                                    disabled={!formRenderProps.allowSubmit}
                                >
                                    End Date Benefit
                                </Button>
                            </div>
                        </fieldset>
                    </FormElement>
                )}
            />
        </Dialog>
    );
};