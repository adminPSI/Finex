import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  Breadcrumb,
  TabStrip,
  TabStripTab,
} from "@progress/kendo-react-layout";
import React, { memo, useEffect, useState } from "react";
import Distribution from "./Job/Distribution";
import JobBenefits from "./Job/JobBenefits";
import Jobs from "./Job/Jobs";

import { Button } from "@progress/kendo-react-buttons";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import { PayrollEmployeeSetup } from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import { FormMultiColumnComboBox } from "../form-components";
import StartingBalance from "./StartingBalance";

const items = [
  {
    id: "home",
    text: "",
    iconClass: "k-i-home",
  },
  {
    id: "payroll",
    text: "Payroll",
  },
  {
    id: "Employee Payroll Setup",
    text: "Employee Payroll Setup",
  },
];

const JobHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState(null);
  const [selectedJob, setSelectedJob] = useState();
  const [jobSelectedState, setJobSelectedState] = useState({});

  const [selectedDistribution, setSelectedDistribution] = useState();
  const [distributionSelectedState, setDistributionSelectedState] = useState(
    {}
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const [formEmployeeInit, setFormEmployee] = useState({});
  const [FormKey, setFormKey] = useState(0);
  const [employeeList, setEmployeeList] = useState([]);
  const [searchTransfer, setSearchTransferTo] = useState("");
  const [isFilter, setIsFilter] = useState(false)
  const onJobSelected = (data) => {
    if (data.dataItem) {
      setSelectedJob(data.dataItem);
      setSelectedDistribution();
    }
  };

  const handleTabSelect = (event) => {
    setSelectedTab(event.selected);
  };

  const handleFilterChangeTo = (event) => {
    if (event) {
      const filter = event.filter.value.toLowerCase() || "";
      if (filter.length == 0) {
        setIsFilter(false)
        setEmployeeList(employeeList);
      } else {
        setIsFilter(true)
        const filtered = employeeList.filter((el) => el.fullName.toLowerCase().includes(filter))
        setSearchTransferTo(filtered);

      }
    }
  };

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

  const employeeHandleChange = (data) => {
    setSelectedEmployeeId(data.value ? data.value.empId : null);
  };

  const getEmployeeData = () => {
    axiosInstance({
      method: "GET",
      url: PayrollEmployeeSetup.getEmployeeGridData + "?take=0&skip=0",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        data.map((employee) => {
          employee.fullName =
            employee.employee.displayName;
          return employee;
        });
        setEmployeeList(data);
        if (location?.state?.id) {
          let index = data.findIndex((emp) => emp.empId == location?.state?.id);
          if (index > -1) {
            setSelectedEmployeeId(location?.state?.id);
            setSelectedEmployeeName(data[index].employee.displayName);
            setFormEmployee({ employeeList: data[index] });
            setFormKey(FormKey + 1);
          }
        }
      })
      .catch((e) => {
        console.log(e, "error");
      });
  };

  useEffect(() => {
    getEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <React.Fragment>
      {checkPrivialgeGroup("PRSM", 1) && <React.Fragment>
        <Breadcrumb size={"large"} data={items} />
        <div className="d-flex  k-flex-row k-w-full k-justify-content-between align-items-center">
          <div className="d-flex k-flex-column" style={{marginBottom:"10px"}}>
            <h1>Employee Setup </h1>
            <span style={{fontSize:"24px", fontWeight:"600"}}> {selectedEmployeeName}</span>
          </div>
          {checkPrivialgeGroup("GoToEmployeeSB", 1) && <div>
            <Button
              className="me-1 py-2"
              themeColor={"primary"}
              onClick={() => navigate("/payroll/payroll-employee-info")}
            >
              Go To Employee Setup
            </Button>
          </div>}
        </div>

        {checkPrivialgeGroup("PRSEmployeeDD", 1) && <div className="d-flex mb-3 k-flex-row k-w-full gap-3 align-items-center justify-content-between">
          <div
            className="d-flex mb-3 k-flex-row k-w-full gap-3 align-items-end justify-content-between"
            style={{ width: "125%" }}
          >
            <Form
              initialValues={formEmployeeInit}
              key={FormKey}
              render={(formRenderProps) => (
                <FormElement className="m-0">
                  <fieldset className={"k-form-fieldset"}>
                    <div className="d-flex justify-content ">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            flexShrink: "0",
                            marginTop: "7px",
                          }}
                        >
                          Payroll Employee List:{" "}
                        </span>
                        <Field
                          id={"employeeList"}
                          name={"employeeList"}
                          textField="fullName"
                          dataItemKey="id"
                          component={FormMultiColumnComboBox}
                          data={!isFilter ? employeeList : searchTransfer}
                          filterable={true}
                          onFilterChange={handleFilterChangeTo}
                          columns={employeeColumns}
                          placeholder="Search Employee..."
                          wrapperstyle={{
                            width: "115%",
                          }}
                          className="m-0"
                          onChange={employeeHandleChange}
                        />{" "}
                      </div>
                    </div>
                  </fieldset>
                </FormElement>
              )}
            />
          </div>
        </div>}

        <TabStrip selected={selectedTab} onSelect={handleTabSelect}>
          {checkPrivialgeGroup("PRSSRTab", 1) && <TabStripTab title={"Significant Rate"}>
            <Jobs
              onJobSelected={onJobSelected}
              setSelectedJob={setSelectedJob}
              jobSelectedState={jobSelectedState}
              setJobSelectedState={setJobSelectedState}
              setSelectedEmployeeId={setSelectedEmployeeId}
              selectedEmployeeId={selectedEmployeeId}
              empWorkMonths={formEmployeeInit?.employeeList?.empWorkMonths}
              employeeList={employeeList}
            />
          </TabStripTab>}
          {checkPrivialgeGroup("PRSDBTab", 1) && <TabStripTab title={"Distributions & Benefits"}>
            <div className="mt-3">
              <Distribution
                selectedJob={selectedJob}
                jobSelectedState={jobSelectedState}
                distributionSelectedState={distributionSelectedState}
                setDistributionSelectedState={setDistributionSelectedState}
                selectedDistribution={selectedDistribution}
                setSelectedDistribution={setSelectedDistribution}
                selectedEmployeeId={selectedEmployeeId}
              />
            </div>

            <div className="mt-3">
              <JobBenefits
                selectedJob={selectedJob}
                selectedDistribution={selectedDistribution}
                selectedEmployeeId={selectedEmployeeId}
              />
            </div>
          </TabStripTab>}
          {checkPrivialgeGroup("PRSSBTab", 1) && <TabStripTab title={"Starting Balance"}>
            <StartingBalance selectedEmployeeId={selectedEmployeeId} />
          </TabStripTab>}
        </TabStrip>
      </React.Fragment>}
    </React.Fragment >
  );
};

export default memo(JobHome);
