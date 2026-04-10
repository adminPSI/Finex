import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { Error } from "@progress/kendo-react-labels";
import "@progress/kendo-theme-default/dist/all.css";
import React, { useState } from "react";

export default function FormDemo() {
  const emailRegex = new RegExp(/\S+@\S+\.\S+/);
  const emailValidator = (value) =>
    emailRegex.test(value) ? "" : "Please enter a valid email.";
  const EmailInput = (fieldRenderProps) => {
    const { validationMessage, visited, ...others } = fieldRenderProps;
    return (
      <div>
        <Input {...others} />
        {visited && validationMessage && <Error>{validationMessage}</Error>}
      </div>
    );
  };

  const nameValidator = (value) => (value ? "" : "Please enter name.");
  const NameInput = (fieldRenderProps) => {
    const { validationMessage, visited, ...others } = fieldRenderProps;
    return (
      <div>
        <Input {...others} />
        {visited && validationMessage && <Error>{validationMessage}</Error>}
      </div>
    );
  };

  const sizes = ["X-Small", "Small", "Medium", "Large", "X-Large", "2X-Large"];
  const [value, setValue] = React.useState("X-Small");
  const handleChange = (event) => {
    setValue(event.target.value);
  };
  const SizeDropdown = (fieldRenderProps) => {
    const { validationMessage, visited, ...others } = fieldRenderProps;
    return (
      <div>
        <DropDownList
          data={sizes}
          value={value}
          onChange={handleChange}
          {...others}
        />
        {visited && validationMessage && <Error>{validationMessage}</Error>}
      </div>
    );
  };

  const [dateValue, setDateValue] = React.useState(new Date());
  const handleDateChange = (event) => {
    setDateValue(event.value);
  };
  const DateControll = (fieldRenderProps) => {
    const { validationMessage, visited, ...others } = fieldRenderProps;
    return (
      <div>
        <DatePicker value={dateValue} onChange={handleDateChange} {...others} />
        {visited && validationMessage && <Error>{validationMessage}</Error>}
      </div>
    );
  };

  const [data, setData] = useState([]);
  const [dataState, setDataState] = useState({ take: 5, skip: 0, group: [] });

  const handleSubmit = (dataItem) => {
    setData((array) => [...array, dataItem]);
  };

  const handleDataStateChange = (event) => {
    setDataState(event.dataState);
  };

  return (
    <>
      <div className="p-3">
        <Form
          onSubmit={handleSubmit}
          render={(formRenderProps) => (
            <FormElement
              style={{
                maxWidth: 650,
              }}
            >
              <fieldset className={"k-form-fieldset"}>
                <div className="mb-3">
                  <Field
                    name={"name"}
                    type={"name"}
                    component={NameInput}
                    label={"Name"}
                    validator={nameValidator}
                  />
                </div>

                <div className="mb-3">
                  <Field
                    name={"email"}
                    type={"email"}
                    component={EmailInput}
                    label={"Email"}
                    validator={emailValidator}
                  />
                </div>

                <div className="mb-3">
                  <Field
                    name={"size"}
                    type={"size"}
                    component={SizeDropdown}
                    label={"Size Select"}
                  />
                </div>

                <div className="mb-3">
                  <Field
                    name={"date"}
                    type={"date"}
                    component={DateControll}
                    label={"Date Select"}
                  />
                </div>
              </fieldset>

              <div className="k-form-buttons">
                <button
                  type={"submit"}
                  className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
                  disabled={!formRenderProps.allowSubmit}
                >
                  Submit
                </button>
                <button
                  type={"button"}
                  className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
                  onClick={formRenderProps.onFormReset}
                >
                  Clear
                </button>
              </div>
            </FormElement>
          )}
        />
      </div>

      <div className="my-5 p-3">
        <Grid
          resizable={true}
          data={data}
          onDataStateChange={handleDataStateChange}
          {...dataState}
        >
          <GridColumn field="name" title="Name" />
          <GridColumn field="email" title="Email" />
          <GridColumn field="size" title="Size" />
          <GridColumn field="date" title="Date" format={"{0:d}"} />
        </Grid>
      </div>
    </>
  );
}
