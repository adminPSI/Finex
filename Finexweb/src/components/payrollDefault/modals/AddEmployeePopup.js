import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import {
  PayrollEmployee,
  PayrollEmployeeSetup,
  ReportsEndPoints,
} from "../../../EndPoints";
import { handleDropdownSearch } from "../../common/Helper";
import {
  FormDropDownList,
  FormMultiColumnComboBox,
} from "../../form-components";

function AddEmployeePopup({
  payrollTotalsData,
  toggleDialog,
  selectedEmployeeByRow,
  handleRefreshData,
}) {
  const [TCEmployee, setTCEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [, setJobDistribution] = useState(); 

  const [jobDescriptionList, setJobDescriptionList] = useState();
  const [selectedJobDescription, setJobDescription] = useState();
  const [key, setKey] = useState(0);
  const [initialValues, setInitialValues] = useState();
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [FilterDropdownData, setFilterDropdownData] = useState("");

  useEffect(() => {
    getEmployeeData();
  }, []);

  const employeeColumns = [
    {
      field: "fullName",
      header: "Name",
      width: "150px",
    },
    {
      field: "employee.employeeNumber",
      header: "Employee No",
      width: "150px",
    },
    {
      field: "employee.groupNumber",
      header: "Group No",
      width: "150px",
    },
  ];

  const getEmployeeData = () => {
    axiosInstance({
      method: "GET",
      url: PayrollEmployeeSetup.getEmployeeGridData + "?skip=0&take=0",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        data.map((employee) => {
          employee.fullName =
            employee.employee.displayName;
          return employee;
        });
        setTCEmployee(data);
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  useEffect(() => {
    if (selectedEmployeeByRow) {
      getJobDescriptions(selectedEmployeeByRow.id);
    }
  }, [selectedEmployeeByRow]);

  const getJobDescriptions = (empId) => {
    if (!empId) return;
    axiosInstance({
      method: "GET",
      url: PayrollEmployee.EmployeeJobs + "/" + empId + "?active=true",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setJobDistribution(data);
        data.map((job) => {
          job.description = job.jobDescription.empJobDescription;
          return job;
        });
        setJobDescriptionList(data);
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  const [notificationState, setNotificationState] = React.useState({
    none: false,
    success: false,
    error: false,
    warning: false,
    info: false,
    notificationMessage: "",
  });

  useEffect(() => {
    if (payrollTotalsData && Object.keys(payrollTotalsData).length) {
      const date = new Date(payrollTotalsData.prDatePaid)
        .toLocaleDateString()
        .split("/")
        .join("-");
      const test = new Date(payrollTotalsData.prDatePaid);
      const day = test.getDate();
      const month = test.getMonth() + 1;
      const year = test.getFullYear();
      const formatDate = `${month < 9 ? "0" + month : month}-${day < 9 ? "0" + day : day}-${year}`;
      let selectedJob = "";
      if (jobDescriptionList?.length) {
        selectedJob = jobDescriptionList?.find((item) => item.primaryJob);
      }

      let empName = undefined;
      if (selectedEmployee) {
        empName = TCEmployee.find((item) => item.empId == selectedEmployee);
      }
      if (selectedEmployeeByRow) {
        empName = TCEmployee.find(
          (item) => item.empId == selectedEmployeeByRow.id
        );
      }
      setInitialValues({
        paidDate: formatDate,
        payStart: new Date(payrollTotalsData.prStartDate),
        payEnd: new Date(payrollTotalsData.prEndDate),
        whichPay: payrollTotalsData.whichPay,
        postDate: new Date(payrollTotalsData.prEndDate),
        empTotal: payrollTotalsData.prTotalHours,
        empName: empName || null,
        Job: empName ? selectedJob : null,
      });
      setKey(key + 1);
    }
  }, [payrollTotalsData, TCEmployee, jobDescriptionList, selectedEmployee]);

  const adEmployeeToPayroll = () => {
    const apiRequest = {
      datePaid: initialValues?.paidDate,
      payPeriodStart: initialValues?.payStart,
      payPeriodEnd: initialValues?.payEnd,
      whichPay: initialValues?.whichPay,
      empId: selectedEmployee || initialValues?.empName?.empId,
      whichJob: selectedJobDescription || initialValues?.Job?.id,
    };

    axiosInstance({
      method: "POST",
      url: ReportsEndPoints.RunAutoPayroll,
      data: apiRequest,
    })
      .then((response) => {
        toggleDialog();
      })
      .catch(() => {});
  };

  const { success, error, notificationMessage } = notificationState;

  const handleSubmit = (value) => {
    adEmployeeToPayroll();
    handleRefreshData();
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value?.value?.empId);
    getJobDescriptions(value?.value?.empId);
  };

  const handleJobDescriptionChange = (value) => {
    setJobDescription(value.value?.jobDescripId);
  };
  const searchableField = ["fullName", "empId", "id"];

  const onFilterChange = (event) => {
    let searchText = event.filter.value;
    setDropdownSearch(searchText);
  };

  useEffect(() => {
    const result = handleDropdownSearch(
      TCEmployee,
      searchableField,
      dropdownSearch
    );
    setFilterDropdownData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownSearch]);

  return (
    <>
      <Dialog
        width={500}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-plus"></i>
            <span className="ms-2">Add</span>
          </div>
        }
        onClose={toggleDialog}
      >
        <Form
          onSubmit={handleSubmit}
          initialValues={initialValues}
          key={key}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field
                  id={"empName"}
                  name={"empName"}
                  label={"Select Employee*"}
                  textField="fullName"
                  dataItemKey="id"
                  component={FormMultiColumnComboBox}
                  data={
                    dropdownSearch || FilterDropdownData.length
                      ? FilterDropdownData
                      : TCEmployee
                  }
                  columns={employeeColumns}
                  placeholder="Search Employee..."
                  className="m-0"
                  onChange={(event) => handleEmployeeChange(event)}
                  filterable={true}
                  onFilterChange={onFilterChange}
                  disabled={!!selectedEmployeeByRow}
                />

                <Field
                  id={"job"}
                  name={"Job"}
                  label={"Job*"}
                  wrapperstyle={{ width: "100%" }}
                  data={jobDescriptionList}
                  textField="description"
                  dataItemKey="id"
                  component={FormDropDownList}
                  placeholder="Job Description"
                  className="m-0"
                  onChange={(event) => handleJobDescriptionChange(event)}
                />

                <div className="k-form-buttons">
                  <Button
                    themeColor={"primary"}
                    className={"col-12"}
                    type={"button"}
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
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
    </>
  );
}

export default AddEmployeePopup;
