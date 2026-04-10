import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useCallback, useEffect, useState } from "react";
import { EmplTimecardEndPoints, SupervisorEndPoints } from "../../EndPoints";
import { useTimecardContext } from "../../contexts/timecardContext";
import axiosInstance from "../../core/HttpInterceptor";
import { useStartEndDateValidatorForSingle } from "../../helper/useStartEndDateValidatorForSingle";
import {
  FormDatePicker,
  FormDropDownList,
  FormRadioGroup,
} from "../form-components";
import {
  ApprovedValidator,
  backupSupervisorValidator,
  endDateValidator,
  startDateValidator,
  supervisorNameValidator,
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

export default function AddBackupSupervisor(props) {
  const {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
  } = useStartEndDateValidatorForSingle();

  const [supervisorList, setSupervisorList] = useState([]);
  const { handleFormSubmit, formData, resetFormData } = useTimecardContext();

  useEffect(() => {
    getSupervisorList();
  }, []);

  const addSupervisor = (dataItem) => {
    let apiRequest = {
      orgAccountId: 7,
      supId: dataItem.supId?.empId,
      supSubId: dataItem.supSubId?.empId,
      startDate: dataItem.startDate,
      endDate: dataItem.endDate,
      memo: "",
      isApproved: dataItem.isApproved,
    };
    axiosInstance({
      method: "POST",
      url: SupervisorEndPoints.SupervisorSubSchedule,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        handleFormSubmit("supervisorSubSchedule");
        props.toggleDialog();
      })
      .catch(() => { });
  };
  const editSupervisor = (dataItem) => {
    let apiRequest = {
      supervisorSubScheduleId: dataItem.supervisorSubScheduleId,
      orgAccountId: 7,
      supId: dataItem.supId.id,
      supSubId: dataItem.supSubId.id,
      startDate: dataItem.startDate,
      endDate: dataItem.endDate,
      memo: dataItem.memo,
      lastModifiedDate: dataItem.lastModifiedDate,
      lastModifiedBy: dataItem.lastModifiedBy,
      isApproved: dataItem.isApproved,
    };
    axiosInstance({
      method: "PUT",
      url:
        SupervisorEndPoints.SupervisorSubSchedule +
        "/" +
        dataItem.supervisorSubScheduleId,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        handleFormSubmit("supervisorSubSchedule");
        props.toggleDialog();
        resetFormData();
      })
      .catch(() => { });
  };

  const getSupervisorList = () => {
    axiosInstance({
      method: "GET",
      url: EmplTimecardEndPoints.TCEmployee + "?supervisor=" + true,
      withCredentials: false,
      params: {
        isSupervisor: true,
      },
    })
      .then((response) => {
        let data = response.data.data;
        let employeeData = [];
        data.map((employee) => {
          employee.fullName =
            employee.employee.displayName;
          employeeData.push(employee);
          return employee;
        });
        setSupervisorList(employeeData);
      })
      .catch(() => { });
  };

  const handleSubmit = (dataItem) => {
    if (formData.formMethod == "put") {
      editSupervisor(dataItem);
    } else {
      addSupervisor(dataItem);
    }
  };

  const handleClose = () => {
    resetFormData();
    props.toggleDialog();
  };

  const supSubList = useCallback(
    (supId) => {
      if (supId) {
        return supervisorList.filter((sup) => sup.empId !== supId.empId);
      }
    },
    [supervisorList]
  );

  const updateStartDate = (formRenderProps) =>
    updateStartDateFun({
      formRenderProps,
      enddate: formData.formData?.endDate || selectedEndDate,
    });
  const updateEndDate = (formRenderProps) =>
    updateEndDateFun({
      formRenderProps,
      startdate: formData.formData?.startDate || selectedStartDate,
    });

  return (
    <Dialog
      title={
        !formData?.formData?.supervisorSubScheduleId
          ? "Add backup supervisor"
          : "Edit backup supervisor"
      }
      onClose={handleClose}
    >
      <Form
        onSubmit={handleSubmit}
        initialValues={formData?.formData}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"supId"}
                name={"supId"}
                label={"Supervisor Name*"}
                data={supervisorList}
                textField="fullName"
                dataItemKey="id"
                disabled={formData?.formData?.id}
                component={FormDropDownList}
                validator={supervisorNameValidator}
              />
              <Field
                id={"supSubId"}
                name={"supSubId"}
                label={"Backup Supervisor*"}
                data={supSubList(formRenderProps.valueGetter("supId"))}
                textField="fullName"
                dataItemKey="id"
                component={FormDropDownList}
                validator={backupSupervisorValidator}
              />

              <div className="d-flex k-flex-row k-w-full justify-content-between">
                <div className="k-w-full me-2">
                  <Field
                    id={"startDate"}
                    name={"startDate"}
                    label={"Start Date*"}
                    validator={startDateValidator}
                    component={FormDatePicker}
                    onChange={updateStartDate}
                    value={selectedStartDate}
                  />
                </div>
                <div className="k-w-full">
                  <Field
                    id={"endDate"}
                    name={"endDate"}
                    label={"End Date*"}
                    validator={endDateValidator}
                    component={FormDatePicker}
                    onChange={updateEndDate}
                    startDate={formRenderProps.valueGetter("startDate")}
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
                id={"isApproved"}
                name={"isApproved"}
                label={"Approved*"}
                placeholder={""}
                component={FormRadioGroup}
                layout={"horizontal"}
                data={radioData}
                validator={ApprovedValidator}
              />

              <div className="k-form-buttons">
                <Button
                  className="col-12"
                  themeColor={"primary"}
                  disabled={!formRenderProps.allowSubmit || endDateError}
                  type={"submit"}
                >
                  {!formData?.formData?.supervisorSubScheduleId
                    ? "Add Supervisor Backup"
                    : "Edit Supervisor Backup"}
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
}
