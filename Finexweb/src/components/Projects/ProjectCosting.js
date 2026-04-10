import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import usePrivilege from "../../helper/usePrivilege";
import { projectService } from "../../services/ProjectServices";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormNumericTextBox,
  FormTextArea,
} from "../form-components";
import {
  budgetValidator,
  notesValidator,
  projectNameValidator,
  startDateValidator
} from "../validators";
import Equipment from "./Equipment";
import MaterialSupplies from "./MaterialSupplies";
import ProjectDetails from "./ProjectDetails";
import Reports from "./Reports";
import Revenue from "./Revenue";
import Labour from "./labour";

const ProjectCosting = () => {
  const [selectedProject, setSelectedProject] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [addProjectVisible, setAddProjectVisible] = React.useState(false);
  const [projectOptions, setProjectOptions] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [typeOfWorkList, setTypeOfWorkList] = useState([]);
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [formInit, setFormInit] = useState([]);
  const [formKey, setFormKey] = useState(0);

  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [endDateError, setEndDateError] = useState("");

  const handleTabSelect = (event) => {
    if (selectedProject?.id) {
      setSelectedTab(event.selected);
    }
  };

  const handleProjectChange = (event) => {
    let p = event.target.value;
    setSelectedProject(p);
  };

  const handleAddProjectDialogClose = () => {
    setShowAddProjectDialog(false);
    setFormInit([]);
    setFormKey(formKey + 1);
  };

  const handleAddProjectDialogSave = () => {
    setShowAddProjectDialog(false);
  };
  const getAllProjectList = () => {
    projectService
      .fetchProjects()
      .then((data) => {
        let arr = data.map((item) => ({
          ...item,
          projectLabel: item?.endDate
            ? `${item.name} (End Date: ${new Date(item.endDate).toLocaleDateString()})`
            : `${item.name}`,
        }));
        arr.sort(
          (a, b) =>
            (b.isActive == "Y") - (a.isActive == "Y") ||
            (a.endDate == null) - (b.endDate == null) ||
            new Date(a.endDate) - new Date(b.endDate)
        );
        setProjectOptions(arr);
        arr[0] = {
          ...arr[0],
          projectLabel: arr[0]?.endDate
            ? `${arr[0].name} (End Date: ${new Date(arr[0].endDate).toLocaleDateString()})`
            : `${arr[0].name}`,
        };
        setSelectedProject(
          selectedProject.hasOwnProperty("id") ? selectedProject : arr[0]
        );
      })
      .catch(() => { });
  };
  useEffect(() => {
    getAllProjectList();
    projectService
      .fetchLocations()
      .then((data) => {
        setLocationList([
          {
            id: null,
            location: "Select Location",
          },
          ...data,
        ]);
      })
      .catch(() => { });
    projectService
      .fetchTypeOfWorkList()
      .then((data) => {
        setTypeOfWorkList([{ type: "Select Type of Work", id: null }, ...data]);
      })
      .catch(() => { });
  }, []);
  const handleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (dataItem.id != undefined) {
      let apirequest = {
        id: dataItem.id,
        orG_ID: 7,
        name: dataItem.name,
        isActive: "Y",
        startDate: dataItem.startDate,
        endDate: dataItem.endDate || null,
        workTypeId: dataItem?.type?.id,
        budget: dataItem.budget,
        notes: dataItem.notes || null,
        locationId: dataItem?.location?.id,
        materialCost: 0,
        equipmentCost: 0,
        laborCost: 0,
      };
      projectService
        .editProject(apirequest)
        .then((addProjectResponce) => {
          showSuccessNotification("Project update successfully");
          handleAddProjectDialogSave();
          getAllProjectList();
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    } else {
      let apirequest = {
        id: 0,
        orG_ID: 7,
        name: dataItem.name,
        isActive: "Y",
        startDate: dataItem.startDate,
        endDate: dataItem.endDate || null,
        workTypeId: dataItem?.type?.id || null,
        budget: dataItem.budget,
        notes: dataItem?.notes || null,
        locationId: dataItem?.location?.id || null,
        materialCost: 0,
        equipmentCost: 0,
        laborCost: 0,
      };

      projectService
        .addProject(apirequest)
        .then((editProjectResponce) => {
          showSuccessNotification("New project created successfully");
          handleAddProjectDialogSave();
          getAllProjectList();
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    }
  };
  const handleAddProject = () => {
    setAddProjectVisible(!addProjectVisible);
    setShowAddProjectDialog(true);
    if (addProjectVisible) {
      setFormInit([]);
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

  const handleEditProject = () => {
    setAddProjectVisible(true);
    setShowAddProjectDialog(true);
    let currentProject = { ...selectedProject };
    currentProject.startDate = currentProject.startDate
      ? new Date(currentProject.startDate)
      : null;
    currentProject.endDate = currentProject.endDate
      ? new Date(currentProject.endDate)
      : null;
    currentProject.type = currentProject.workType
      ? typeOfWorkList.find((work) => work.type == currentProject.workType)
      : typeOfWorkList.find((work) => !work.id);

    currentProject.location = currentProject.locationId
      ? locationList.find(
        (location) => location.id == currentProject.locationId
      )
      : locationList.find((location) => !location.id);
    setFormInit(currentProject);
    setFormKey(formKey + 1);
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Project Costing')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("PCM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Project Costing
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Project Costing
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Project Costing
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8">
              <figure>
                <blockquote className="blockquote">
                  <h1>Project Costing</h1>
                </blockquote>
              </figure>
              {projectOptions &&
                projectOptions.length > 0 &&
                checkPrivialgeGroup("PCD", 1) && (
                  <>
                    <label htmlFor={"project"}>Project List:</label>
                    <br />

                    <DropDownList
                      id={"project"}
                      data={projectOptions.sort((a, b) => {
                        const isANumber = /^\d/.test(a["projectLabel"]);
                        const isBNumber = /^\d/.test(b["projectLabel"]);

                        if (isANumber && !isBNumber) return -1;
                        if (!isANumber && isBNumber) return 1;

                        return a["projectLabel"].localeCompare(
                          b["projectLabel"]
                        );
                      })}
                      value={selectedProject}
                      textField="projectLabel"
                      dataItemKey="id"
                      onChange={handleProjectChange}
                      popupSettings={{ width: "auto" }}
                      style={{ width: "200px" }}
                    />
                  </>
                )}
              {projectOptions &&
                projectOptions.length > 0 &&
                checkPrivialgeGroup("EditPCB", 3) && (
                  <>
                    <Button
                      themeColor={"primary"}
                      className="ms-3"
                      onClick={handleEditProject}
                    >
                      <i className="fa-solid fa-edit me-1"></i>Edit Project
                    </Button>
                  </>
                )}
            </div>
            {selectedTab == 0 && (
              <div className="col-sm-4 text-end">
                {checkPrivialgeGroup("AddPCB", 2) && (
                  <Button themeColor={"primary"} onClick={handleAddProject}>
                    <i className="fa-solid fa-plus me-1"></i>Add Project
                  </Button>
                )}
              </div>
            )}
          </div>
          <br />
          {projectOptions && projectOptions.length > 0 && (
            <TabStrip selected={selectedTab} onSelect={handleTabSelect}>
              {checkPrivialgeGroup("ViewPCTab", 1) && (
                <TabStripTab title={"Project Details"}>
                  <ProjectDetails project={selectedProject} />
                </TabStripTab>
              )}
              {checkPrivialgeGroup("ViewPCMSTab", 1) && (
                <TabStripTab title={"Material/Supplies"}>
                  <MaterialSupplies project={selectedProject} />
                </TabStripTab>
              )}
              {checkPrivialgeGroup("ViewPCLTab", 1) && (
                <TabStripTab title={"Labor"}>
                  <Labour project={selectedProject} />
                </TabStripTab>
              )}
              {checkPrivialgeGroup("ViewPCETab", 1) && (
                <TabStripTab title={"Equipment"}>
                  <Equipment project={selectedProject} />
                </TabStripTab>
              )}
              {checkPrivialgeGroup("ViewPCRTab", 1) && (
                <TabStripTab title={"Revenue"}>
                  <Revenue project={selectedProject} />
                </TabStripTab>
              )}
              {checkPrivialgeGroup("ViewPCReportsTab", 1) && (
                <TabStripTab title={"Reports"}>
                  <Reports
                    project={selectedProject}
                    checkPrivialgeGroup={checkPrivialgeGroup}
                  />
                </TabStripTab>
              )}
            </TabStrip>
          )}
          {projectOptions && projectOptions.length < 1 && (
            <div>
              <h3>No Project Found</h3>
            </div>
          )}
          <div>
            {showAddProjectDialog && (
              <Dialog
                width={450}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    {formInit?.id ? (
                      <i className="fa-solid fa-edit"></i>
                    ) : (
                      <i className="fa-solid fa-plus"></i>
                    )}
                    <span className="ms-2">
                      {formInit?.id ? "Edit Project" : "Add Project"}
                    </span>
                  </div>
                }
                onClose={handleAddProjectDialogClose}
              >
                <Form
                  onSubmit={handleSubmit}
                  initialValues={formInit}
                  key={formKey}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"name"}
                            name={"name"}
                            label={"Project Name*"}
                            component={FormInput}
                            validator={projectNameValidator}
                            wrapperstyle={{
                              width: "100%",
                              marginRight: "10px",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"budget"}
                            name={"budget"}
                            label={"Budget $*"}
                            component={FormNumericTextBox}
                            wrapperstyle={{
                              width: "50%",
                              marginRight: "10px",
                            }}
                            validator={budgetValidator}
                            format={"c"}
                            step={0}
                            min={0}
                            spinners={false}
                          />
                          <Field
                            id={"location"}
                            name={"location"}
                            label={"Location"}
                            textField="location"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={locationList}
                            value={locationList.id}
                            wrapperstyle={{
                              width: "50%",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"startDate"}
                            name={"startDate"}
                            label={"Start Date*"}
                            component={FormDatePicker}
                            onChange={updateStartDate}
                            value={selectedStartDate}
                            validator={startDateValidator}
                            wrapperstyle={{
                              width: "50%",
                              marginRight: "10px",
                            }}
                          />
                          <div className="w-50">
                            <Field
                              id={"endDate"}
                              name={"endDate"}
                              label={"End Date"}
                              component={FormDatePicker}
                              onChange={updateEndDate}
                              wrapperstyle={{
                                width: "100%",
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
                        <Field
                          id={"notes"}
                          name={"notes"}
                          label={"Notes*"}
                          component={FormTextArea}
                          validator={notesValidator}
                        />
                        <div className="k-form-buttons">
                          <Button
                            className="col-12"
                            themeColor={"primary"}
                            type={"submit"}
                            disabled={
                              !formRenderProps.allowSubmit || endDateError
                            }
                          >
                            Save Project
                          </Button>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </Dialog>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ProjectCosting;
