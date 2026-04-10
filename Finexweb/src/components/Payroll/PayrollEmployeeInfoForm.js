import { Reveal } from "@progress/kendo-react-animation";
import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  ExpansionPanel,
  ExpansionPanelContent, TabStrip, TabStripTab
} from "@progress/kendo-react-layout";
import React from "react";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormTextArea,
} from "../form-components";

export default function PayrollEmployeeInfoForm() {
  const [selected, setSelected] = React.useState(0);
  const handleSelect = (e) => {
    setSelected(e.selected);
  };

  const handleOnSubmit = (dataItem) => {
    console.log("dataItem", dataItem);
  };

  const [expanded, setExpanded] = React.useState(1);

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Timecard
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Timecard Setup
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Payroll Employee Info
          </li>
        </ol>
      </nav>
      <TabStrip
        className="app-tab k-w-full mt-3"
        selected={selected}
        onSelect={handleSelect}
      >
        <TabStripTab title="Employee Info">
          <div className="mt-4 k-w-full">
            <Form
              onSubmit={handleOnSubmit}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <div className="d-flex">
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"First Name"}
                        placeholder={""}
                        component={FormInput}
                      />
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"Last Name"}
                        placeholder={""}
                        component={FormInput}
                      />
                    </div>
                    <div className="d-flex">
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"AKA (Also Known As"}
                        placeholder={""}
                        component={FormInput}
                      />
                      <Field
                        id={"startDate"}
                        name={"startDate"}
                        label={"Date of Birth (DOB)"}
                        format="MM/dd/yyyy"
                        formatPlaceholder={{
                          year: "YYYY",
                          month: "MM",
                          day: "DD",
                        }}
                        component={FormDatePicker}
                      />
                    </div>
                    <div className="d-flex">
                      <Field
                        id={"backupSupervisor"}
                        name={"backupSupervisor"}
                        label={"Gender"}
                        defaultItem="Gender"
                        data={["Man", "Female"]}
                        wrapperstyle={{ width: "50%" }}
                        component={FormDropDownList}
                      />
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"Social Security Number (SSN)"}
                        placeholder={""}
                        component={FormInput}
                      />
                    </div>
                    <div className="d-flex">
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"EEO Race Classification"}
                        placeholder={""}
                        component={FormInput}
                      />
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"Phone Number"}
                        placeholder={""}
                        component={FormInput}
                      />
                    </div>
                    <div className="d-flex">
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"Cell Number"}
                        placeholder={""}
                        component={FormInput}
                      />
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"Spouse Name"}
                        placeholder={""}
                        component={FormInput}
                      />
                    </div>
                    <div className="d-flex">
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"License Number"}
                        placeholder={""}
                        component={FormInput}
                      />
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"Email Address"}
                        placeholder={""}
                        component={FormInput}
                      />
                    </div>
                    <div className="d-flex">
                      <Field
                        id={"holidayScheduleName"}
                        name={"holidayScheduleName"}
                        label={"Personal Email Address"}
                        placeholder={""}
                        component={FormInput}
                      />
                    </div>
                    <div className="k-form-buttons d-flex justify-content-end">
                      <Button
                        className="k-button k-button-lg k-rounded-lg "
                        themeColor={"primary"}
                        disabled={!formRenderProps.allowSubmit}
                        type={"submit"}
                      >
                        Add Schedule
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </div>
        </TabStripTab>
        <TabStripTab title="Significant Rates">
          <div className="mt-4">
            <Form
              onSubmit={handleOnSubmit}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <div className="p-1 bg-light">Employee Personal Info</div>

                    <div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"First Name"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Last Name"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"AKA (Also Known As"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"startDate"}
                          name={"startDate"}
                          label={"Date of Birth (DOB)"}
                          format="MM/dd/yyyy"
                          formatPlaceholder={{
                            year: "YYYY",
                            month: "MM",
                            day: "DD",
                          }}
                          component={FormDatePicker}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"backupSupervisor"}
                          name={"backupSupervisor"}
                          label={"Gender"}
                          defaultItem="Gender"
                          data={["Man", "Female"]}
                          wrapperstyle={{ width: "50%" }}
                          component={FormDropDownList}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Social Security Number (SSN)"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"EEO Race Classification"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Phone Number"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Cell Number"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Spouse Name"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"License Number"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Email Address"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Personal Email Address"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-1 bg-light">Employee Address</div>

                    <div>
                      <Field
                        id={"leaveReason"}
                        name={"leaveReason"}
                        label={"Street Address"}
                        component={FormTextArea}
                      />

                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"P.0. Box"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"City"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>

                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"State"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Zip Code"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Country"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-1 bg-light">Employee Job Info</div>

                    <div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Primary Job Description"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Job Classification"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>

                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Employee Number"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Group Number"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"leaveType"}
                          name={"leaveType"}
                          label={"Clock Number"}
                          data={[]}
                          wrapperstyle={{ width: "50%" }}
                          defaultItem="Sick Leave"
                          component={FormDropDownList}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Salary/Hourly"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Number of Months Worked"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"startDate"}
                          name={"startDate"}
                          label={"Contract Start Date"}
                          format="MM/dd/yyyy"
                          formatPlaceholder={{
                            year: "YYYY",
                            month: "MM",
                            day: "DD",
                          }}
                          component={FormDatePicker}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"startDate"}
                          name={"startDate"}
                          label={"Contract End Date"}
                          formatPlaceholder={{
                            year: "YYYY",
                            month: "MM",
                            day: "DD",
                          }}
                          component={FormDatePicker}
                        />
                        <Field
                          id={"startDate"}
                          name={"startDate"}
                          label={"Original Hire Date"}
                          format="MM/dd/yyyy"
                          formatPlaceholder={{
                            year: "YYYY",
                            month: "MM",
                            day: "DD",
                          }}
                          component={FormDatePicker}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Employee Department Number"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Supervisor"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>
                      <div className="d-flex flex-wrap justify-content-between">
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Username"}
                          placeholder={""}
                          component={FormInput}
                        />
                        <Field
                          id={"holidayScheduleName"}
                          name={"holidayScheduleName"}
                          label={"Holiday Schedule"}
                          placeholder={""}
                          component={FormInput}
                        />
                      </div>

                      <div className="d-flex flex-wrap ">
                        <Field
                          id={"startDate"}
                          name={"startDate"}
                          label={"Termination Date"}
                          format="MM/dd/yyyy"
                          formatPlaceholder={{
                            year: "YYYY",
                            month: "MM",
                            day: "DD",
                          }}
                          component={FormDatePicker}
                        />
                      </div>
                    </div>

                    <div className="k-form-buttons d-flex justify-content-end">
                      <Button
                        className="k-button k-button-lg k-rounded-lg "
                        themeColor={"primary"}
                        disabled={!formRenderProps.allowSubmit}
                        type={"submit"}
                      >
                        Submit
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </div>
        </TabStripTab>
        <TabStripTab title="Significant Date" className>
          <Form
            onSubmit={handleOnSubmit}
            render={(formRenderProps) => (
              <div
                style={{
                  width: "700px",
                }}
              >
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <ExpansionPanel
                      title={"Employee Personal Info"}
                      expanded={expanded == 1}
                      tabIndex={0}
                      key={1}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : 1);
                      }}
                    >
                      {expanded == 1 && (
                        <Reveal>
                          <ExpansionPanelContent>
                            <div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"First Name"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Last Name"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"AKA (Also Known As"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Date of Birth (DOB)"}
                                  format="MM/dd/yyyy"
                                  formatPlaceholder={{
                                    year: "YYYY",
                                    month: "MM",
                                    day: "DD",
                                  }}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"backupSupervisor"}
                                  name={"backupSupervisor"}
                                  label={"Gender"}
                                  defaultItem="Gender"
                                  data={["Man", "Female"]}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDropDownList}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Social Security Number (SSN)"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"EEO Race Classification"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Phone Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Cell Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Spouse Name"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"License Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Email Address"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Personal Email Address"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                            </div>
                          </ExpansionPanelContent>
                        </Reveal>
                      )}
                    </ExpansionPanel>
                    <ExpansionPanel
                      title={"Employee Address"}
                      expanded={expanded == 2}
                      tabIndex={0}
                      key={2}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : 2);
                      }}
                    >
                      {expanded == 2 && (
                        <Reveal>
                          <ExpansionPanelContent>
                            <div>
                              <Field
                                id={"leaveReason"}
                                name={"leaveReason"}
                                label={"Street Address"}
                                wrapperstyle={{ width: "45%" }}
                                component={FormTextArea}
                              />

                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"P.0. Box"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"City"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>

                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"State"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Zip Code"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Country"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                            </div>
                          </ExpansionPanelContent>
                        </Reveal>
                      )}
                    </ExpansionPanel>
                    <ExpansionPanel
                      title={"Employee Job Info"}
                      expanded={expanded == 3}
                      tabIndex={0}
                      key={3}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : 3);
                      }}
                    >
                      {expanded == 3 && (
                        <Reveal>
                          <ExpansionPanelContent>
                            <div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Primary Job Description"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Job Classification"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>

                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Employee Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Group Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"leaveType"}
                                  name={"leaveType"}
                                  label={"Clock Number"}
                                  data={[]}
                                  wrapperstyle={{ width: "45%" }}
                                  defaultItem="Sick Leave"
                                  component={FormDropDownList}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Salary/Hourly"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Number of Months Worked"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Contract Start Date"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                  format="MM/dd/yyyy"
                                  formatPlaceholder={{
                                    year: "YYYY",
                                    month: "MM",
                                    day: "DD",
                                  }}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Contract End Date"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                  format="MM/dd/yyyy"
                                  formatPlaceholder={{
                                    year: "YYYY",
                                    month: "MM",
                                    day: "DD",
                                  }}
                                />
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Original Hire Date"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                  format="MM/dd/yyyy"
                                  formatPlaceholder={{
                                    year: "YYYY",
                                    month: "MM",
                                    day: "DD",
                                  }}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Employee Department Number"}
                                  wrapperstyle={{ width: "45%" }}
                                  placeholder={""}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Supervisor"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Username"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Holiday Schedule"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>

                              <div className="d-flex flex-wrap ">
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Termination Date"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                  format="MM/dd/yyyy"
                                  formatPlaceholder={{
                                    year: "YYYY",
                                    month: "MM",
                                    day: "DD",
                                  }}
                                />
                              </div>
                            </div>
                          </ExpansionPanelContent>
                        </Reveal>
                      )}
                    </ExpansionPanel>
                    <div className="k-form-buttons d-flex justify-content-end">
                      <Button
                        className="k-button k-button-lg k-rounded-lg "
                        themeColor={"primary"}
                        disabled={!formRenderProps.allowSubmit}
                        type={"submit"}
                      >
                        Submit
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              </div>
            )}
          />
        </TabStripTab>
        <TabStripTab title="Salaries">
          <Form
            onSubmit={handleOnSubmit}
            render={(formRenderProps) => (
              <div
                style={{
                  width: "100%",
                }}
              >
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <ExpansionPanel
                      title={"Employee Personal Info"}
                      expanded={expanded == 1}
                      tabIndex={0}
                      key={1}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : 1);
                      }}
                    >
                      {expanded == 1 && (
                        <Reveal>
                          <ExpansionPanelContent>
                            <div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"First Name"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Last Name"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"AKA (Also Known As"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Date of Birth (DOB)"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                  format="MM/dd/yyyy"
                                  formatPlaceholder={{
                                    year: "YYYY",
                                    month: "MM",
                                    day: "DD",
                                  }}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"backupSupervisor"}
                                  name={"backupSupervisor"}
                                  label={"Gender"}
                                  defaultItem="Gender"
                                  data={["Man", "Female"]}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDropDownList}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Social Security Number (SSN)"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"EEO Race Classification"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Phone Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Cell Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Spouse Name"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"License Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Email Address"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Personal Email Address"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                            </div>
                          </ExpansionPanelContent>
                        </Reveal>
                      )}
                    </ExpansionPanel>
                    <ExpansionPanel
                      title={"Employee Address"}
                      expanded={expanded == 2}
                      tabIndex={0}
                      key={2}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : 2);
                      }}
                    >
                      {expanded == 2 && (
                        <Reveal>
                          <ExpansionPanelContent>
                            <div>
                              <Field
                                id={"leaveReason"}
                                name={"leaveReason"}
                                label={"Street Address"}
                                wrapperstyle={{ width: "45%" }}
                                component={FormTextArea}
                              />

                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"P.0. Box"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"City"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>

                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"State"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Zip Code"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Country"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                            </div>
                          </ExpansionPanelContent>
                        </Reveal>
                      )}
                    </ExpansionPanel>
                    <ExpansionPanel
                      title={"Employee Job Info"}
                      expanded={expanded == 3}
                      tabIndex={0}
                      key={3}
                      onAction={(event) => {
                        setExpanded(event.expanded ? "" : 3);
                      }}
                    >
                      {expanded == 3 && (
                        <Reveal>
                          <ExpansionPanelContent>
                            <div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Primary Job Description"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Job Classification"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>

                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Employee Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Group Number"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"leaveType"}
                                  name={"leaveType"}
                                  label={"Clock Number"}
                                  data={[]}
                                  wrapperstyle={{ width: "45%" }}
                                  defaultItem="Sick Leave"
                                  component={FormDropDownList}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Salary/Hourly"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Number of Months Worked"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Contract Start Date"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Contract End Date"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                />
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Original Hire Date"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Employee Department Number"}
                                  wrapperstyle={{ width: "45%" }}
                                  placeholder={""}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Supervisor"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>
                              <div className="d-flex flex-wrap justify-content-between">
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Username"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                                <Field
                                  id={"holidayScheduleName"}
                                  name={"holidayScheduleName"}
                                  label={"Holiday Schedule"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormInput}
                                />
                              </div>

                              <div className="d-flex flex-wrap ">
                                <Field
                                  id={"startDate"}
                                  name={"startDate"}
                                  label={"Termination Date"}
                                  placeholder={""}
                                  wrapperstyle={{ width: "45%" }}
                                  component={FormDatePicker}
                                />
                              </div>
                            </div>
                          </ExpansionPanelContent>
                        </Reveal>
                      )}
                    </ExpansionPanel>
                    <div className="k-form-buttons d-flex justify-content-end">
                      <Button
                        className="k-button k-button-lg k-rounded-lg "
                        themeColor={"primary"}
                        disabled={!formRenderProps.allowSubmit}
                        type={"submit"}
                      >
                        Submit
                      </Button>
                    </div>
                  </fieldset>
                </FormElement>
              </div>
            )}
          />
        </TabStripTab>
      </TabStrip>
    </div>
  );
}
