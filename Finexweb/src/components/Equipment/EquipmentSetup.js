import { orderBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  GridColumn as Column,
  Grid
} from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import usePrivilege from "../../helper/usePrivilege";
import { equipmentService } from "../../services/EquipmentService";
import {
  ColumnFormCurrencyTextBox,
  FormDatePicker,
  FormInput,
  FormNumericTextBox,
  FormTextArea,
} from "../form-components";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import { MyCommandCell } from "../Projects/myCommandCell";
import {
  EquipmentNameValidator,
  hourlyRateValidator,
  startDateValidator
} from "../validators";
const initialDataState = {
  skip: 0,
  take: 10,
};
const EquipmentSetup = () => {
  const [addEquipmentSetupVisible, setaddEquipmentSetupVisible] =
    React.useState(false);
  const [showAddEquipmentSetupDialog, setShowAddEquipmentSetupDialog] =
    useState(false);
  const [formInit, setFormInit] = useState([]);
  const [data, setData] = useState([]);
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState();
  const [pageTotal, setPageTotal] = React.useState(0);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [selectedRowObject, setSelectedRowObject] = useState(null);

  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [endDateError, setEndDateError] = useState("");

  const handleAddEquipmentSetupDialogClose = () => {
    setShowAddEquipmentSetupDialog(false);
  };

  useEffect(() => {
    if (data.length == 0 && page.skip > page.take) {
      page.skip = page.skip - page.take;
      getEquipmentSetupListFilter(page);
    } else {
      getEquipmentSetupListFilter(page);
    }
  }, []);

  // Sorting changes
  const initialSort = [
    {
      field: "name",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  // Sorting changes
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    getEquipmentSetupListFilter({ skip: 0, take: 10 }, direction, sortColumn);
  };
  const getEquipmentSetupListFilter = (
    page,
    desc = "true",
    sortKey = "name"
  ) => {
    equipmentService
      .getEquipmentSetupWithFilter(page.skip, page.take, desc, sortKey)
      .then((data) => {
        setHourlyRate([]);
        setPageTotal(data.total);
        const newDataItem = {
          inEdit: true,
          Discontinued: false,
          id: 0,
        };
        let HourlyRate = [];
        data.data.forEach((element) => {
          let obj = {
            dataItem: element,
            value: element.hourlyRate,
          };
          HourlyRate.push(obj);
        });
        HourlyRate.push({ dataItem: newDataItem, value: null });
        setHourlyRate(HourlyRate);
        setData([...data.data]);
      })
      .catch(() => { });
  };

  const [gridHourlyRate, setHourlyRate] = useState([]);
  
  const editField = "inEdit";

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      remove={openDeleteConfirmDialog}
      discard={discard}
      update={update}
      cancel={cancel}
      editField={editField}
    />
  );
  const openDeleteConfirmDialog = (dataItem) => {
    setDeleteVisible(dataItem);
  };
  const closeDeleteDialog = () => {
    setDeleteVisible(null);
  };
  const remove = () => {
    equipmentService
      .deleteEquipmentSetup(deleteVisible.id)
      .then((dataI) => {
        setDeleteVisible(null);
        if (data.length == 1 && page.skip > page.take) {
          page.skip = page.skip - page.take;
          getEquipmentSetupListFilter(page);
        } else {
          getEquipmentSetupListFilter(page);
        }
      })
      .catch(() => { });
  };
  const update = (dataItem) => {
    let hourindex = gridHourlyRate.findIndex(
      (price) => price.dataItem.id == dataItem.id
    );

    dataItem.inEdit = false;
    let deepCopyObj = JSON.parse(JSON.stringify(data));
    deepCopyObj.map((item) => {
      if (item.startDate) {
        item.startDate = new Date(item.startDate);
        item.endDate = new Date(item.endDate);
      }
    });
    let index = deepCopyObj.findIndex((record) => record.id == dataItem.id);
    deepCopyObj[index] = dataItem;
    if (dataItem.id !== undefined) {
      let apirequest = {
        id: dataItem.id,
        orG_ID: 7,
        name: dataItem.name,
        isActive: "Y",
        startDate: dataItem.startDate,
        endDate: dataItem.endDate,
        hourlyRate: gridHourlyRate[hourindex].value,
        notes: dataItem.notes,
        assetId: 1,
      };
      equipmentService
        .editEquipmentSetup(apirequest)
        .then((AddEquipmentSetupResponce) => {
          getEquipmentSetupListFilter(page);
          handleAddEquipmentSetupDialogClose();
          showSuccessNotification("Equipment updated successfully");
        })
        .catch(() => { });
    } else {
      // this customer model use for give any custome values.

      let apirequest = {
        id: 0,
        orG_ID: 7,
        name: dataItem.name,
        isActive: "Y",
        startDate: dataItem.startDate,
        endDate: dataItem.endDate,
        hourlyRate: dataItem.hourlyRate,
        notes: dataItem.notes,
        assetId: 1,
      };

      equipmentService
        .addEquipmentSetup(apirequest)
        .then((editProjectResponce) => {
          getEquipmentSetupListFilter(page);
          handleAddEquipmentSetupDialogClose();
          showSuccessNotification("Equipment added successfully");
        })
        .catch(() => { });
    }
  };

  // Local state operations
  const discard = (dataItem) => {
    const newData = [...data];
    newData.splice(0, 1);
    setData(newData);
  };
  const cancel = (dataItem) => {
    if (dataItem.id) {
      let newData = data.map((item) =>
        item.id == dataItem.id
          ? {
            ...selectedRowObject,
            inEdit: false,
          }
          : item
      );
      setData(newData);
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
    const matchItem = newData.find((item) => item.id == dataItem.id);
    setSelectedRowObject(matchItem);
    setData(newData);
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

  const handleAddEquipmentSetup = () => {
    setaddEquipmentSetupVisible(!addEquipmentSetupVisible);
    setShowAddEquipmentSetupDialog(true);
    if (addEquipmentSetupVisible) {
      setFormInit([]);
    }
  };
  const pageChange = (event) => {
    let sortDetail = sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      getEquipmentSetupListFilter(
        {
          skip: 0,
          take: data.length,
        },
        direction,
        sortColumn
      );
      setPage({
        skip: 0,
        take: data.length,
      });
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
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Equipment Setup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("ViewESetupM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Project Costing
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Setup
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Equipment Setup
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>Equipment Setup</h3>
            </div>
            <div className="col-sm-4 text-end">
              {checkPrivialgeGroup("AddEsetupB", 2) && (
                <Button
                  themeColor={"primary"}
                  onClick={handleAddEquipmentSetup}
                >
                  <i className="fa-solid fa-plus"></i> &nbsp; Add Equipment
                  Setup
                </Button>
              )}
            </div>
          </div>
          <br />
          {checkPrivialgeGroup("ESetupG", 1) && (
            <Grid
              resizable={true}
              data={orderBy(data, sort)}
              onItemChange={itemChange}
              editField={editField}
              dataItemKey={"id"}
              skip={page.skip}
              take={page.take}
              total={pageTotal}
              pageable={{
                buttonCount: 4,
                pageSizes: [10, 15, 50, "All"],
                pageSizeValue: pageSizeValue,
              }}
              onPageChange={pageChange}
              sortable={true}
              sort={sort}
              onSortChange={(e) => {
                onSortChange(e);
              }}
            >
              <Column field="name" title="Name" />
              <Column
                field="startDate"
                title="Start Date"
                editor="date"
                cell={(props) => {
                  const [year, month, day] = props.dataItem?.startDate
                    ? props.dataItem?.startDate?.split("T")[0].split("-")
                    : [null, null, null];
                  return (
                    <td>
                      {props.dataItem?.startDate
                        ? `${month}/${day}/${year}`
                        : null}
                    </td>
                  );
                }}
              />
              <Column
                field="endDate"
                title="End Date"
                editor="date"
                cell={(props) => {
                  const [year, month, day] = props.dataItem?.endDate
                    ? props.dataItem?.endDate?.split("T")[0].split("-")
                    : [null, null, null];
                  return (
                    <td>
                      {props.dataItem?.endDate
                        ? `${month}/${day}/${year}`
                        : null}
                    </td>
                  );
                }}
              />
              <Column field="notes" title="Note" />
              <Column
                field="hourlyRate"
                title="Hourly Rate"
                format="{0:c2}"
                headerClassName="header-right-align"
                cell={ColumnFormCurrencyTextBox}
              />
              {checkPrivialgeGroup("ESetupCC", 3) && (
                <Column cell={CommandCell} width="240px" />
              )}
            </Grid>
          )}
          <div>
            {showAddEquipmentSetupDialog && (
              <Dialog
                width={500}
                title={
                  <span>
                    {" "}
                    <i className="fa-solid fa-plus"></i> &nbsp; Add Equipment
                    Setup
                  </span>
                }
                onClose={handleAddEquipmentSetupDialogClose}
              >
                <Form
                  onSubmit={update}
                  initialValues={formInit}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={"k-form-fieldset"}>
                        <Field
                          id={"name"}
                          name={"name"}
                          label={"Equipment Name*"}
                          component={FormInput}
                          validator={EquipmentNameValidator}
                        />

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
                            value={selectedStartDate}
                            onChange={updateStartDate}
                            component={FormDatePicker}
                            validator={startDateValidator}
                            wrapperstyle={{
                              marginRight: "10px",
                            }}
                          />
                          <div>
                            <Field
                              id={"endDate"}
                              name={"endDate"}
                              label={"End Date"}
                              onChange={updateEndDate}
                              component={FormDatePicker}
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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"hourlyRate"}
                            name={"hourlyRate"}
                            label={"Hourly Rate $*"}
                            component={FormNumericTextBox}
                            wrapperstyle={{
                              width: "100%",
                            }}
                            format={"c"}
                            validator={hourlyRateValidator}
                            step={0}
                            min={0}
                            spinners={false}
                          />
                        </div>
                        <Field
                          id={"notes"}
                          name={"notes"}
                          label={"Notes"}
                          component={FormTextArea}
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
                            Save Equipment Setup
                          </Button>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </Dialog>
            )}
            {deleteVisible && (
              <Dialog
                title={<span>Please confirm</span>}
                onClose={closeDeleteDialog}
              >
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
                    onClick={remove}
                  >
                    Yes
                  </Button>
                </DialogActionsBar>
              </Dialog>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default EquipmentSetup;
