import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { HolidayEndPoints } from "../../../EndPoints";
import { FormDatePicker, FormDropDownList, FormTimePicker } from "../../form-components";
import { applyLeaveEndDateValidator, applyLeaveStartDateValidator, timeEntryEndTimeValidator, timeEntryStartTimeValidator } from "../../validators";

const HolidayHours = ({ setIsHolidayModelShow, onSubmit }) => {
    const formRef = useRef();
    const [holidayScheduleList, setHolidayScheduleList] = useState([]);
    const [formInit, ] = useState(null);
    const [formKey, ] = useState(1);
    const [holidayType, setHolidayType] = useState("");
    const getHolidayScheduleHeader = () => {
        axiosInstance({
            method: "GET",
            url: HolidayEndPoints.HolidaySchedule + "/ByYear",
            withCredentials: false,
        })
            .then((response) => {
                let data = response.data.map((x) => {
                    return { id: x.id, holidayScheduleName: x.holidayScheduleName };
                });
                setHolidayScheduleList(data);
            })
            .catch(() => { });
    };

    useEffect(() => {
        getHolidayScheduleHeader();
    }, []);
    return (
        <Dialog width={600} title={"Apply Holiday Hours"} onClose={() => setIsHolidayModelShow(false)}>
            <Form
                onSubmit={onSubmit}
                initialValues={formInit}
                ref={formRef}
                key={formKey}
                render={(formRenderProps) => (
                    <FormElement>
                        <fieldset className={"k-form-fieldset"}>
                            <Field
                                id={"comboHolidaySchedule"}
                                name={"comboHolidaySchedule"}
                                dataItemKey="id"
                                textField="holidayScheduleName"
                                label={"Holiday Schedule*"}
                                data={holidayScheduleList}
                                component={FormDropDownList}
                            />
                            <Field
                                id={"comboHolidayType"}
                                name={"comboHolidayType"}
                                label={"Holiday Type"}
                                data={["Calamity", "Holiday"]}
                                component={FormDropDownList}
                                onChange={(e) => {
                                    setHolidayType(e.value)
                                }}
                            />
                            <div className="d-flex mt-3">
                                <div className="d-flex me-3 ">
                                    <Field
                                        name={"startDate"}
                                        label={"Start Date*"}
                                        component={FormDatePicker}
                                        validator={applyLeaveStartDateValidator}
                                    />
                                </div>
                                {holidayType !== "Calamity" && <div className="d-flex">
                                    <Field
                                        name={"endDate"}
                                        label={"End Date*"}
                                        component={FormDatePicker}
                                        validator={applyLeaveEndDateValidator}
                                    />
                                </div>}
                            </div>
                            {holidayType !== "Holiday" && <div className="d-flex mt-3">
                                <div className="d-flex me-3 ">
                                    <Field
                                        name={"startDateTime"}
                                        label={"Start Time*"}
                                        component={FormTimePicker}
                                        validator={timeEntryStartTimeValidator}
                                    />
                                </div>
                                <div className="d-flex">
                                    <Field
                                        name={"endDateTime"}
                                        label={"End Time*"}
                                        component={FormTimePicker}
                                        validator={timeEntryEndTimeValidator}
                                        startTime={formRenderProps.valueGetter("startDateTime")}
                                    />
                                </div>
                            </div>}
                            <div className="k-form-buttons">
                                <Button
                                    themeColor={"primary"}
                                    className={"col-12"}
                                    type={"submit"}
                                    disabled={!formRenderProps.allowSubmit}
                                >
                                    Update Holiday Hours
                                </Button>
                            </div>
                            <div>
                                <p>Note: Calamity will not remove existing Leave</p>
                            </div>
                        </fieldset>
                    </FormElement>
                )}
            />
        </Dialog>
    )
}

export default HolidayHours;