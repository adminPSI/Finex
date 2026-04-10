import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useEffect, useState } from "react";
import { projectService } from "../../services/ProjectServices";
import {
  FormCheckbox,
  FormDatePicker,
  FormDropDownList
} from "../form-components";
import {
  endDateValidator,
  startDateValidator
} from "../validators";

const Reports = ({ project, checkPrivialgeGroup }) => {
  const [typeOfWorkList, setTypeOfWorkList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [optionsPara, setOptionsPara] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [endDateError, setEndDateError] = useState("");

  const [selectedStartDateActive, setSelectedStartDateActive] =
    React.useState();
  const [, setSelectedEndDateActive] = React.useState();
  const [endDateErrorActive, setEndDateErrorActive] = useState("");

  useEffect(() => {
    projectService.fetchTypeOfWorkList().then((data) => {
      setTypeOfWorkList(data);
    });
    projectService.fetchLocations().then((data) => {
      setLocationList(data);
    });
  }, [project]);

  const onCheckBoxPara = (e) => {
    if (e.target.value) {
      setOptionsPara((prev) => [...prev, e.target.name]);
    } else {
      setOptionsPara((prev) => prev.filter((item) => item !== e.target.name));
    }
  };

  const updateStartDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedStartDate(date.toString());
    localEndDateValidator({ startdate: dateformat });
  };

  const localEndDateValidator = ({ enddate, startdate }) => {
    const startDate = new Date(startdate ?? selectedStartDate);
    const endDate = new Date(enddate ?? selectedEndDate);
    if (!startDate) {
      setEndDateError("Please select start date first");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setEndDateError("End date should be greater than start date");
    } else {
      setEndDateError("");
    }
  };

  const updateEndDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedEndDate(date.toString());
    localEndDateValidator({ enddate: dateformat });
  };

  const localEndDateValidatorAvtive = ({ enddate, startdate }) => {
    const startDate = new Date(startdate ?? selectedStartDate);
    const endDate = new Date(enddate ?? selectedEndDate);
    if (!startDate) {
      setEndDateErrorActive("Please select start date first");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setEndDateErrorActive("End date should be greater than start date");
    } else {
      setEndDateErrorActive("");
    }
  };

  const updateStartDateActive = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedStartDateActive(date.toString());
    localEndDateValidatorAvtive({ startdate: dateformat });
  };

  const updateEndDateActive = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedEndDateActive(date.toString());
    localEndDateValidatorAvtive({ enddate: dateformat });
  };

  return (
    <>
      {checkPrivialgeGroup("ViewPCReportsForm", 1) && (
        <>
          <Form
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={"k-form-fieldset k-w-full"}>
                  <div className="row mb-2" style={{ gap: "15px 0" }}>
                    <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                      <Field
                        id={"startDate"}
                        name={"startDate"}
                        label={"Start Date*"}
                        component={FormDatePicker}
                        validator={startDateValidator}
                        onChange={updateStartDate}
                        value={selectedStartDate}
                        wrapperstyle={{
                          marginRight: "10px",
                        }}
                      />
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                      <div>
                        <Field
                          id={"endDate"}
                          name={"endDate"}
                          label={"End Date*"}
                          component={FormDatePicker}
                          onChange={updateEndDate}
                          wrapperstyle={{
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
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                      <Field
                        id={"type"}
                        name={"type"}
                        label={"Type Of Work"}
                        textField="type"
                        dataItemKey="id"
                        component={FormDropDownList}
                        data={typeOfWorkList}
                        value={typeOfWorkList.id}
                        wrapperstyle={{
                          marginRight: "10px",
                        }}
                      />
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                      <Field
                        id={"location"}
                        name={"location"}
                        label={"Location Details"}
                        textField="location"
                        dataItemKey="id"
                        component={FormDropDownList}
                        data={locationList}
                        value={locationList}
                        wrapperstyle={{
                          marginRight: "10px",
                        }}
                      />
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                      <Field
                        id={"activityStartDate"}
                        name={"activityStartDate"}
                        label={"Activity Start Date*"}
                        component={FormDatePicker}
                        validator={startDateValidator}
                        onChange={updateStartDateActive}
                        value={selectedStartDateActive}
                        wrapperstyle={{
                          marginRight: "10px",
                        }}
                      />
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                      <div>
                        <Field
                          id={"activityEndDate"}
                          name={"activityEndDate"}
                          label={"Activity End Date*"}
                          component={FormDatePicker}
                          validator={endDateValidator}
                          onChange={updateEndDateActive}
                          wrapperstyle={{
                            marginRight: "10px",
                          }}
                        />
                        {endDateErrorActive && (
                          <p
                            className="text-danger mb-0 p-0"
                            style={{ fontSize: "12px" }}
                          >
                            {endDateErrorActive}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-2 mb-3">
                    <div className="row">
                      <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                        <Field
                          id="projectDetail"
                          name="projectDetail"
                          label="Project Detail"
                          checked={optionsPara.includes("projectDetail")}
                          component={FormCheckbox}
                          onChange={onCheckBoxPara}
                        />
                      </div>
                      <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                        <Field
                          id="showNotes"
                          name="showNotes"
                          label="Show Notes"
                          checked={optionsPara.includes("showNotes")}
                          component={FormCheckbox}
                          onChange={onCheckBoxPara}
                        />
                      </div>
                      <div className="col-lg-3 col-md-4 col-sm-6  col-12">
                        <Field
                          id="dailyTotalHours"
                          name="dailyTotalHours"
                          label="Daily Total Hours"
                          checked={optionsPara.includes("dailyTotalHours")}
                          component={FormCheckbox}
                          onChange={onCheckBoxPara}
                        />
                      </div>
                    </div>
                  </div>
                  {checkPrivialgeGroup("PrintPCReports", 1) && (
                    <div className="k-form-buttons">
                      <Button
                        className="col-4"
                        themeColor={"primary"}
                        type={"submit"}
                        disabled={!formRenderProps.allowSubmit || endDateError}
                      >
                        Print
                      </Button>
                    </div>
                  )}
                </fieldset>
              </FormElement>
            )}
          />
        </>
      )}
    </>
  );
};

export default Reports;
