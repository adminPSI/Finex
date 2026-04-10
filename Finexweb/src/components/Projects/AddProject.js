import React, { useState } from "react";

import {
  Field,
  FieldWrapper,
  Form,
  FormElement,
} from "@progress/kendo-react-form";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
} from "../form-components";
import { startDateValidator } from "../validators";

const AddProject = () => {
  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [endDateError, setEndDateError] = useState("");

  const [formData, setFormData] = useState({
    projectName: "",
    typeOfWork: "",
    budget: "",
    startDate: "",
    endDate: "",
    location: "",
  });

  const typeOfWorkOptions = [
    {
      text: "Web Development",
      id: "Web Development",
    },
    {
      text: "Mobile Development",
      id: "Mobile Development",
    },
    {
      text: "UI/UX Design",
      id: "UI/UX Design",
    },
    {
      text: "Backend Development",
      id: "Backend Development",
    },
  ];

  const locationOptions = [
    {
      text: "New York",
      id: "New York",
    },
    {
      text: "Los Angeles",
      id: "Los Angeles",
    },
    {
      text: "Chicago",
      id: "Chicago",
    },
    {
      text: "Houston",
      id: "Houston",
    },
  ];

  const handleSubmit = (dataItem) => {
    alert(dataItem + " submitted");
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

  return (
    <Form
      onSubmit={handleSubmit}
      render={(formRenderProps) => (
        <FormElement style={{ maxWidth: 650 }}>
          <fieldset className={"k-form-fieldset"}>
            <FieldWrapper>
              <div className="k-form-field-wrap">
                <Field
                  name={"projectName"}
                  label={"Project Name"}
                  component={FormInput}
                  labelClassName={"k-form-label"}
                  value={formData.projectName}
                  onChange={handleInputChange}
                />
              </div>
            </FieldWrapper>
            <FieldWrapper>
              <div className="k-form-field-wrap">
                <Field
                  name={"typeOfWork"}
                  value={formData.typeOfWork}
                  label={"Type of Work"}
                  component={FormDropDownList}
                  data={typeOfWorkOptions}
                  textField="text"
                  dataItemKey="id"
                  onChange={handleInputChange}
                />
              </div>
            </FieldWrapper>
            <FieldWrapper>
              <div className="k-form-field-wrap">
                <Field
                  name={"budget"}
                  label={"Budget "}
                  component={FormInput}
                  labelClassName={"k-form-label"}
                  value={formData.budget}
                  onChange={handleInputChange}
                />
              </div>
            </FieldWrapper>
            <Field
              id={"startDate"}
              name={"StartDate"}
              label={"Start date"}
              component={FormDatePicker}
              value={formData.startDate}
              onChange={updateStartDate}
              wrapperstyle={{ width: "50%" }}
              validator={startDateValidator}
            />
            <div>
              <Field
                id={"endDate"}
                name={"endDate"}
                label={"End date"}
                component={FormDatePicker}
                value={formData.endDate}
                onChange={updateEndDate}
                wrapperstyle={{ width: "50%" }}
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
            <FieldWrapper>
              <div className="k-form-field-wrap">
                <Field
                  name={"locaiton"}
                  value={formData.location}
                  label={"Location"}
                  component={FormDropDownList}
                  data={locationOptions}
                  textField="text"
                  dataItemKey="id"
                  onChange={handleInputChange}
                />
              </div>
            </FieldWrapper>
          </fieldset>
          <div className="k-form-buttons">
            <button
              type={"submit"}
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
              disabled={!formRenderProps.allowSubmit || endDateError}
            >
              Submit
            </button>
          </div>
        </FormElement>
      )}
    />
  );
};

export default AddProject;
