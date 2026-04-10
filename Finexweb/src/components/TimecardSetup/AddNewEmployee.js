import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useEffect, useState } from "react";
import { useTimecardContext } from "../../contexts/timecardContext";
import axiosInstance from "../../core/HttpInterceptor";
import { EmplTimecardEndPoints, HolidayEndPoints } from "../../EndPoints";
import {
  FormDropDownList,
  FormInput,
  FormRadioGroup,
} from "../form-components";
import {
  employeeNameValidator,
  groupNumberValidator,
  hasNonPaidValidator,
  levelApprovalValidator,
  PayrollSpecialistValidator,
  runPayrollValidator,
  scheduleNameValidator,
  supervisorValidator,
  suppressTimecardValidator,
  autoPopulatedScheduleValidator
} from "../validators";

const radioData = [
  {
    label: "Yes",
    value: true,
  },
  {
    label: "No",
    value: false,
  },
];

export default function AddNewEmployee(props) {
  const [TCEmployee, setTCEmployee] = useState([]);
  const { handleFormSubmit, formData, resetFormData } = useTimecardContext();
  const [, setSelectedEmp] = useState({});
  const [, setEditData] = useState();
  const [formInit, setFormInit] = useState({});
  let [formKey, setFormKey] = useState(1);
  const [holidayScheduleList, setHolidayScheduleList] = useState([]);

  useEffect(() => {
    getEmployeeName();
    getHolidayScheduleHeader();
    if (formData.formData) {
      formData.formData = {
        ...formData.formData,
        empName: {
          empId: formData.formData?.empId,
          empName:
            formData.formData?.employee?.displayName,
          
        },
      };
    }
    setFormInit(formData.formData);
    formKey += 1;
    setFormKey(formKey + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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
        if (formData.formData) {
          formData.formData.holidaySchedule = data.find(
            (x) => x.id == formData.formData.holidayScheduleId
          );
          setFormInit(formData.formData);
          formKey += 1;
          setFormKey(formKey + 1);
        }
      })
      .catch(() => { });
  };

  const getEmployeeName = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.Employee,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        data.forEach((element) => {
          element.empId = element.id;
          element.empName = element.displayName;
        });
        setTCEmployee(data);
      })
      .catch(() => { });
  };

  useEffect(() => {
    let employee = TCEmployee.map((item) => item.employee);
    setSelectedEmp(employee);
    if (Object.keys(formData).length !== 0) {
      setEditData(formData.formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TCEmployee]);

  const AddTCEmployee = (dataItem) => {
    let orgData = TCEmployee.find((item) => item.id == dataItem.empName.id);
    let EmployeeData = {
      empId: dataItem.empName?.id,
      orgAccId: orgData.orG_ID,
      groupNumber: dataItem.groupNumber,
      supervisorGroupNumber: dataItem.supervisorGroupNumber,
      isSupervisor: dataItem.isSupervisor,
      isTimecardSuppresed: dataItem.isTimecardSuppresed,
      isAppointingAuthorityEnabled: dataItem.isAppointingAuthorityEnabled,
      isTrueHourEnalbed: dataItem.isTrueHourEnalbed,
      isNonPaidLunchEnabled: dataItem.isNonPaidLunchEnabled,
      isAllotedLeaveEnabled: dataItem.isAllotedLeaveEnabled,
      isRunPayrollEnabled: dataItem.isRunPayrollEnabled,
      isPayrollSpecialist: dataItem.isPayrollSpecialist,
      holidayScheduleId: dataItem.holidaySchedule.id,
      maxLunchTime: dataItem.maxLunchTime,
      autoPopulatedSchedule:dataItem.autoPopulatedSchedule,
    };
    axiosInstance({
      method: "POST",
      url: EmplTimecardEndPoints.TCEmployee,
      data: EmployeeData,
      withCredentials: false,
    })
      .then((response) => {
        handleFormSubmit("tcEmployee");
        props.toggleDialog();
      })
      .catch(() => { });
  };

  const EditTCEmployee = (dataItem) => {
    let editableTcEmployee = {
      id: dataItem.id,
      empId: dataItem.empName.empId,
      orgAccId: dataItem.orgAccId,
      groupNumber: dataItem.groupNumber,
      supervisorGroupNumber: dataItem.supervisorGroupNumber,
      isSupervisor: dataItem.isSupervisor,
      isTimecardSuppresed: dataItem.isTimecardSuppresed,
      isAppointingAuthorityEnabled: dataItem.isAppointingAuthorityEnabled,
      isTrueHourEnalbed: dataItem.isTrueHourEnalbed,
      isNonPaidLunchEnabled: dataItem.isNonPaidLunchEnabled,
      isAllotedLeaveEnabled: dataItem.isAllotedLeaveEnabled,
      isRunPayrollEnabled: dataItem.isRunPayrollEnabled,
      lastModifiedDate: dataItem.lastModifiedDate,
      lastModifiedBy: dataItem.lastModifiedBy,
      isPayrollSpecialist: dataItem.isPayrollSpecialist,
      maxLunchTime: dataItem.maxLunchTime,
      autoPopulatedSchedule:dataItem.autoPopulatedSchedule,
      holidayScheduleId: dataItem.holidaySchedule?.id,
    };
    axiosInstance({
      method: "PUT",
      url: EmplTimecardEndPoints.TCEmployee + "/" + dataItem.id,
      data: editableTcEmployee,
      withCredentials: false,
    })
      .then((response) => {
        handleFormSubmit("tcEmployee");
        props.toggleDialog();
        resetFormData();
      })
      .catch(() => { });
  };

  const handleSubmit = (dataItem) => {
    if (formData.formMethod == "put") {
      EditTCEmployee(dataItem);
    } else {
      AddTCEmployee(dataItem);
    }
  };
  const handleClose = () => {
    resetFormData();
    props.toggleDialog();
  };

  return (
    <>
      <Dialog
        title={
          !formData?.formData?.id
            ? "Add Employee Timecard"
            : "Edit Employee Timecard"
        }
        onClose={handleClose}
        height={680}
        width={700}
      >
        <span>
          {!formData?.formData?.id ? "Add a new" : "Edit"} employee Timecard to
          create a schedule,
        </span>
        <br></br>
        <span>track timesheets, and manage leave requests</span>

        <Form
          onSubmit={handleSubmit}
          key={formKey}
          initialValues={formInit}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset mt-3"}>
                <Field
                  id={"empName"}
                  name={"empName"}
                  dataItemKey="empId"
                  textField="empName"
                  label={"Employee Name*"}
                  data={TCEmployee}
                  disabled={!formData?.formData?.id ? false : true}
                  component={FormDropDownList}
                  validator={employeeNameValidator}
                />
                <Field
                  id={"groupNumber"}
                  name={"groupNumber"}
                  label={"Group Number*"}
                  placeholder={""}
                  component={FormInput}
                  validator={groupNumberValidator}
                />
                <Field
                  id={"supervisorGroupNumber"}
                  name={"supervisorGroupNumber"}
                  label={"Supervisor Group Number"}
                  placeholder={""}
                  component={FormInput}
                />
                <Field
                  id={"isSupervisor"}
                  name={"isSupervisor"}
                  label={"Supervisor*"}
                  placeholder={""}
                  component={FormRadioGroup}
                  layout={"horizontal"}
                  data={radioData}
                  validator={supervisorValidator}
                />
                <Field
                  id={"isPayrollSpecialist"}
                  name={"isPayrollSpecialist"}
                  label={"Payroll Specialist*"}
                  placeholder={""}
                  component={FormRadioGroup}
                  layout={"horizontal"}
                  data={radioData}
                  validator={PayrollSpecialistValidator}
                />
                <Field
                  id={"isTimecardSuppresed"}
                  name={"isTimecardSuppresed"}
                  label={"Suppress Timecard*"}
                  placeholder={""}
                  data={radioData}
                  layout={"horizontal"}
                  component={FormRadioGroup}
                  validator={suppressTimecardValidator}
                />
                <Field
                  id={"isAppointingAuthorityEnabled"}
                  name={"isAppointingAuthorityEnabled"}
                  label={"2nd Level Approval Required*"}
                  placeholder={""}
                  data={radioData}
                  layout={"horizontal"}
                  component={FormRadioGroup}
                  validator={levelApprovalValidator}
                />
                <Field
                  id={"autoPopulatedSchedule"}
                  name={"autoPopulatedSchedule"}
                  label={"Auto Populated Schedule*"}
                  placeholder={""}
                  data={radioData}
                  layout={"horizontal"}
                  component={FormRadioGroup}
                  validator={autoPopulatedScheduleValidator}
                />
                <Field
                  id={"isNonPaidLunchEnabled"}
                  name={"isNonPaidLunchEnabled"}
                  label={"Has non-paid lunch*"}
                  placeholder={""}
                  data={radioData}
                  layout={"horizontal"}
                  component={FormRadioGroup}
                  validator={hasNonPaidValidator}
                />
                <Field
                  id={"maxLunchTime"}
                  name={"maxLunchTime"}
                  label={"Lunch Hours"}
                  placeholder={""}
                  layout={"horizontal"}
                  component={FormInput}
                  type="number"
                />
                <Field
                  id={"isRunPayrollEnabled"}
                  name={"isRunPayrollEnabled"}
                  label={"Run Payroll from Time Card*"}
                  placeholder={""}
                  data={radioData}
                  layout={"horizontal"}
                  component={FormRadioGroup}
                  validator={runPayrollValidator}
                />
                <Field
                  id={"holidaySchedule"}
                  name={"holidaySchedule"}
                  dataItemKey="id"
                  textField="holidayScheduleName"
                  label={"Holiday Schedule*"}
                  data={holidayScheduleList}
                  component={FormDropDownList}
                  validator={scheduleNameValidator}
                />
                <div className="k-form-buttons">
                  <Button
                    className="k-button k-button-lg k-rounded-lg k-w-full"
                    themeColor={"primary"}
                    disabled={!formRenderProps.allowSubmit}
                    type={"submit"}
                  >
                    {!formData?.formData?.id ? "Add Employee" : "Update Employee"}
                  </Button>
                </div>
              </fieldset>
            </FormElement>
          )}
        />
      </Dialog>
    </>
  );
}
