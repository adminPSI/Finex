import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import {
  ContextMenu,
  ExpansionPanelContent,
  MenuItem
} from "@progress/kendo-react-layout";
import { useState } from "react";
import { PayrollEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import { MyCommandCell } from "../Projects/myCommandCell";
import {
  ColumnFormNumericTextBox
} from "../form-components";

export const VacationRatesForm = ({
  contractData: data,
  setContractData: setData,
  setVacationPopupVisible,
}) => {
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [columnShow, setColumnShow] = useState(false);
  const [editData, setEditData] = useState();

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const itemChange = (event) => {
    const field = event.field || "";
    const newData = data.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [field]: event.value,
        }
        : item
    );
    setData(newData);
  };

  const editField = "inEdit";

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      remove={openDeleteDialog}
      discard={discard}
      update={update}
      cancel={cancel}
      editField={editField}
    />
  );

  const openDeleteDialog = (record) => {
    setDeleteVisible(record.id);
  };
  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };

  const DeleteOnClick = () => {
    axiosInstance({
      method: "DELETE",
      url: `${PayrollEndPoints.Vacation}/${deleteVisible}`,
      withCredentials: false,
    })
      .then((response) => {
        closeDeleteDialog();
        const newData = data.filter((item) => item.id !== deleteVisible);
        setData(newData);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };
  const update = (dataItem) => {
    if (dataItem.id != undefined) {
      let updateRequest = {
        id: dataItem.id,
        orgAccountId: 0,
        yearsWorkedStart: dataItem.yearsWorkedStart,
        yearsWorkedEnd: dataItem.yearsWorkedEnd,
        vacationRate: dataItem.vacationRate,
        vacationLimit: dataItem.vacationLimit,
        maxAccrual: dataItem.maxAccrual,
        lumpsum: dataItem.lumpsum,
      };

      axiosInstance({
        method: dataItem.id ? "PUT" : "POST",
        url: dataItem.id
          ? `${PayrollEndPoints.Vacation}/${dataItem.id}`
          : `${PayrollEndPoints.Vacation}`,
        data: updateRequest,
        withCredentials: false,
      })
        .then((response) => {
          const newData = data.map((item) =>
            item.id == dataItem.id
              ? {
                ...dataItem,
                inEdit: false,
              }
              : item
          );

          setData(newData);
          setEditData([]);
        })
        .catch((error) => {
          console.log(error, "error");
          const newData = data.map((item) =>
            item.id == dataItem.id
              ? {
                ...item,
                inEdit: true,
              }
              : item
          );

          setData(newData);
        });
    } else {
    }
  };

  const discard = (dataItem) => {
    const newData = [...data];
    newData.splice(0, 1);
    setData(newData);
  };
  const cancel = async (dataItem) => {
    if (dataItem.id) {
      const newData = editData.map((item) =>
        item.id == dataItem.id
          ? {
            ...item,
            inEdit: false,
          }
          : item
      );
      setData([...newData]);
      setEditData([]);
    }
  };
  const enterEdit = (dataItem) => {
    let newData = data.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    setEditData(newData);
    setData(newData);
  };

  const handleClick = () => {
    setVacationPopupVisible(true);
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollOrganizationDataSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <ExpansionPanelContent>
      <div className="d-flex justify-content-end ">
        {checkPrivialgeGroup("AddCVRB", 2) && <Button
          className="k-button k-button-lg k-rounded-lg mb-2"
          themeColor={"primary"}
          onClick={handleClick}
        >
          Add Contract/Vacation Rate
        </Button>}
      </div>

      <Form
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <div onKeyDown={(e) => e.stopPropagation()}>
                {checkPrivialgeGroup("PRVRG", 1) && <Grid
                  data={data}
                  onItemChange={itemChange}
                  editField={editField}
                >
                  <GridToolbar>
                    <div className="d-flex align-items-center justify-content-end w-100">
                      <div>
                        <Checkbox
                          type="checkbox"
                          name="modifiedBy"
                          defaultChecked={columnShow}
                          onChange={onCheckBox}
                          label={"Modified Info"}
                        />
                      </div>
                    </div>
                  </GridToolbar>

                  <GridColumn
                    field="yearsWorkedStart"
                    title="Years Start"
                    cell={ColumnFormNumericTextBox}
                  />
                  <GridColumn
                    field="yearsWorkedEnd"
                    title="Years End"
                    cell={ColumnFormNumericTextBox}
                  />
                  <GridColumn
                    field="vacationRate"
                    title="Vacation Rate"
                    cell={ColumnFormNumericTextBox}
                  />
                  <GridColumn
                    field="vacationLimit"
                    title="Vacation Limit"
                    cell={ColumnFormNumericTextBox}
                  />
                  <GridColumn
                    field="lumpsum"
                    title="Weeks Given"
                    cell={ColumnFormNumericTextBox}
                  />
                  <GridColumn
                    field="maxAccrual"
                    title="Max Accrual"
                    cell={ColumnFormNumericTextBox}
                  />
                  {columnShow && (
                    <GridColumn
                      field="createdDate"
                      title="Created Date"
                      cell={(props) => {
                        const [year, month, day] = props.dataItem?.createdDate
                          ? props.dataItem?.createdDate.split("T")[0].split("-")
                          : [null, null, null];
                        return (
                          <td>
                            {props.dataItem?.createdDate
                              ? `${month}/${day}/${year}`
                              : null}
                          </td>
                        );
                      }}
                    />
                  )}
                  {columnShow && (
                    <GridColumn field="createdBy" title="Created By" />
                  )}
                  {columnShow && (
                    <GridColumn field="modifiedBy" title="Modified By" />
                  )}
                  <GridColumn cell={CommandCell} width="240px" />
                </Grid>}
                <ContextMenu>
                  {checkPrivialgeGroup("EditVRCM", 3) && (
                    <MenuItem
                      text="Edit"
                      data={{
                        action: "edit",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("DeleteVRCM", 4) && (
                    <MenuItem
                      text="Delete"
                      data={{
                        action: "delete",
                      }}
                      icon="delete"
                    />
                  )}
                </ContextMenu>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
      {deleteVisible && (
        <Dialog title={<span>Please confirm</span>} onClose={closeDeleteDialog}>
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure you want to Delete?
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={closeDeleteDialog}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={DeleteOnClick}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </ExpansionPanelContent>
  );
};
