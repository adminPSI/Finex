import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { cloneElement, useEffect, useRef, useState } from "react";
import axiosInstance from "../../../../core/HttpInterceptor";
import { PayrollEmployee, PayrollEmployeeSetup } from "../../../../EndPoints";
import { FormDatePicker, FormDropDownList, FormInput } from "../../../form-components";
import usePrivilege from "../../../../helper/usePrivilege";

const AddPayRaise = ({ setDataGrid, setTakesEffectOn }) => {
    const formRef = useRef();
    const [formInit, ] = useState(null);
    const [formKey, ] = useState(1);
    const [JobList, setJobList] = useState([]);
    const [selectedJob, setSelectedJob] = useState();

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

    useEffect(() => {
        getJobList();
    }, []);

    const handleSubmit = async (dataItem) => {
        const mapData = {
            flatRaise: dataItem.flatRaise ?? null,
            groupNo: dataItem.groupNo ?? null,
            hiredOnOrBefore: dataItem.hiredOnOrBefore ?? null,
            percentRaise: dataItem.percentRaise ?? null,
            primaryJobDescriptionId: dataItem?.primaryJobDescription?.id ?? null,
            takesEffectOn: dataItem?.takesEffectOn ?? null,
        }
        await axiosInstance({
            method: "POST",
            url: PayrollEmployeeSetup.GetPayRaiseSalaryData,
            withCredentials: false,
            data: mapData
        })
            .then((response) => {
                setDataGrid(response?.data)
            })
            .catch(() => { });

    }


    const JobddlOnChange = (event) => {
        // eslint-disable-next-line eqeqeq
        if (event.syntheticEvent.type == "click") {
            let jobIndex = JobList.findIndex((x) => x.id == event.target.value.id);
            if (jobIndex > -1) {
                setSelectedJob(JobList[jobIndex]);
            }
        }
    };

    useEffect(() => {
        handleSubmit({})
    }, []);

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

    const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
    if (loading) return <div>Loading privileges...</div>
    if (error) return <div>Error: {error}</div>
    return (
        <div className="d-flex k-justify-content-between k-align-items-between w-100 mb-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <Form
                    onSubmit={handleSubmit}
                    initialValues={formInit}
                    ref={formRef}
                    key={formKey}
                    render={(formRenderProps) => {
                        return (
                            <FormElement>
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-1" style={{ borderRadius: "10px" }}>
                                    <Field
                                        id={"percentRaise"}
                                        name={"percentRaise"}
                                        label={"Percent Raise"}
                                        component={FormInput}
                                        onChange={(e) => {
                                            formRenderProps.onChange("flatRaise", {
                                                value: ""
                                            })
                                        }}
                                        value={0}
                                        wrapperstyle={{
                                            width: "10%",
                                        }}
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
                                                background: "#fff",
                                            }}
                                        ></span>
                                        <strong>OR</strong>

                                    </div>
                                    <Field
                                        id={"flatRaise"}
                                        name={"flatRaise"}
                                        label={"Flat Raise"}
                                        component={FormInput}
                                        onChange={(e) => {
                                            formRenderProps.onChange("percentRaise", {
                                                value: ""
                                            })
                                        }}
                                        value={0}
                                        wrapperstyle={{
                                            width: "10%",
                                        }}
                                    />
                                    <Field
                                        id={"takesEffectOn"}
                                        name={"takesEffectOn"}
                                        label={"Takes Effect On"}
                                        component={FormDatePicker}
                                        onChange={(e) => {
                                            setTakesEffectOn(e?.value)
                                        }}
                                        wrapperstyle={{
                                            width: "15%",
                                        }}
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
                                                background: "#fff",
                                            }}
                                        ></span>
                                        <strong>Apply To</strong>

                                    </div>
                                    <Field
                                        id={"primaryJobDescription"}
                                        name={"primaryJobDescription"}
                                        label={"Primary Job Description"}
                                        component={FormDropDownList}
                                        textField="empJobDescription"
                                        dataItemKey="id"
                                        data={JobList}
                                        value={selectedJob}
                                        onChange={JobddlOnChange}
                                        wrapperstyle={{
                                            width: "20%",
                                        }}
                                        placeholder=""
                                        itemRender={itemRender}
                                    />
                                    <Field
                                        id={"groupNo"}
                                        name={"groupNo"}
                                        label={"Group No"}
                                        component={FormInput}
                                        wrapperstyle={{
                                            width: "10%",
                                        }}
                                    />

                                    <Field
                                        id={"hiredOnOrBefore"}
                                        name={"hiredOnOrBefore"}
                                        label={"Hired On Or Before"}
                                        component={FormDatePicker}
                                        wrapperstyle={{
                                            width: "15%",
                                        }}
                                    />
                                    <div className="k-form-buttons" style={{
                                        marginTop: "35px"
                                    }}>
                                        {checkPrivialgeGroup("PayraiseShowB", 1) && (
                                            <Button
                                                themeColor={"primary"}
                                                className={"col-12"}
                                                type={"submit"}
                                            >
                                                Show
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </FormElement>
                        )
                    }}
                />
            </div>
        </div>
    )
}
export default AddPayRaise