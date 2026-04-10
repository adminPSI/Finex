import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";
import React, { useState } from "react";
import Constants from "../common/Constants";
import { FormInput } from "../form-components";

function JobDescriptions() {
  const [showFilter, setshowFilter] = React.useState(false);
  const [filter, ] = React.useState({});
  const [descriptions, setDescriptions] = React.useState([
    { id: 1, name: "Description 1" },
    { id: 2, name: "Description 2" },
  ]);
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, ] = React.useState(initialDataState);
  const [pageTotal, ] = React.useState();
  const [pageSizeValue, ] = React.useState();
  const [columnShow, setColumnShow] = useState(false);
  const [, setSearchText] = useState();
  const [selectedDescription, setSelectedDescription] = React.useState();
  const [selectedRowId, setSelectedRowId] = React.useState(0);
  const offset = React.useRef({
    left: 0,
    top: 0,
  });

  const [show, setShow] = React.useState(false);
  const [notificationState, setNotificationState] = React.useState({
    none: false,
    success: false,
    error: false,
    warning: false,
    info: false,
    notificationMessage: "",
  });
  const { success, error,notificationMessage } =
    notificationState;
  const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);
  const [formInit, setFormInit] = useState({
    name: "",
  });

  const [deleteVisible, setDeleteVisible] = useState(false);
  const moreFilter = () => {
    setshowFilter(!showFilter);
  };

  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const filterData = (e) => {
    let value = e.target.value;
    setSearchText(value);
  };

  const CommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={(event) => handleContextMenu(event, props.dataItem)}
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </Button>
      </td>
    </>
  );

  const handleContextMenu = (props, data) => {
    handleContextMenuOpen(props, data);
  };

  const handleContextMenuOpen = (e, data) => {
    e.preventDefault();
    setSelectedDescription(data);
    setSelectedRowId(e.currentTarget);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const handleOnSelect = (e) => {
    let id = selectedRowId?.id;
    let action = e.item.data.action;

    if (id !== 0) {
      switch (action) {
        case "edit":
          setFormInit({
            name: selectedDescription.name,
            id: id,
          });
          toggleDialog();
          break;

        case "delete":
          toggleDeleteDialog();

          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const handleCloseMenu = () => {
    setShow(false);
    setSelectedRowId(null);
  };

  const toggleDialog = () => {
    setOpenDescriptionDialog(!openDescriptionDialog);
  };

  const handleDelete = () => {
    setDescriptions((prev) => {
      const newCopy = prev.filter((item) => {
        return item.id !== selectedRowId?.id;
      });
      return newCopy;
    });
    toggleDeleteDialog();
  };

  const handleSubmit = (data) => {
    if (formInit.id) {
      setDescriptions((prev) => {
        const newCopy = prev.map((item) => {
          if (item.id == formInit.id) {
            item.name = data.name;
          }
          return item;
        });
        return newCopy;
      });
    } else {
      data.id = descriptions.length + 1;

      setDescriptions([data, ...descriptions]);
    }
    setSelectedRowId(null);
    setFormInit({
      name: "",
      id: null,
    });
    toggleDialog();
  };

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Payroll Details
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Job Description
          </li>
        </ol>
      </nav>
      <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
        <div className="d-flex k-flex-column">
          <h1>Job Description</h1>
        </div>

        <div>
          <Button
            className="k-button k-button-lg k-rounded-lg"
            themeColor={"primary"}
            onClick={toggleDialog}
          >
            <i className="fa-solid fa-plus"></i> Add Job Description
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <Grid
          filterable={showFilter}
          filter={filter}
          data={descriptions}
          total={pageTotal}
          skip={page.skip}
          take={page.take}
          editField="inEdit"
          pageable={{
            buttonCount: 4,
            pageSizes: [10, 15, "All"],
            pageSizeValue: pageSizeValue,
          }}
          sortable={true}
        >
          <GridToolbar>
            <div className="row col-sm-12">
              <div className="col-sm-6 d-grid gap-3 d-md-block">
                <Button
                  className="buttons-container-button"
                  fillMode="outline"
                  themeColor={"primary"}
                  onClick={moreFilter}
                >
                  <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                  &nbsp;Filter
                </Button>
              </div>
              <div className="col-sm-6 d-flex align-items-center justify-content-center">
                <div className="col-3">
                  <Checkbox
                    type="checkbox"
                    id="modifiedBy"
                    name="modifiedBy"
                    defaultChecked={columnShow}
                    onChange={onCheckBox}
                    label={"Modified Info"}
                  />
                </div>
                <div className="input-group">
                  <Input
                    className="form-control border-end-0 border"
                    onChange={filterData}
                  />
                  <span className="input-group-append">
                    <button
                      className="btn btn-outline-secondary bg-white rounded-0 border-start-0 rounded-end-2 border ms-n5"
                      type="button"
                    >
                      <i className="fa fa-search"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </GridToolbar>
          <GridColumn field="name" title="Description" />

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
          {columnShow && <GridColumn field="createdBy" title="Created By" />}
          {columnShow && (
            <GridColumn
              field="modifiedDate"
              title="Modified Date"
              cell={(props) => {
                const [year, month, day] = props.dataItem?.modifiedDate
                  ? props.dataItem?.modifiedDate.split("T")[0].split("-")
                  : [null, null, null];
                return (
                  <td>
                    {props.dataItem?.modifiedDate
                      ? `${month}/${day}/${year}`
                      : null}
                  </td>
                );
              }}
            />
          )}
          {columnShow && <GridColumn field="modifiedBy" title="Modified By" />}
          <GridColumn cell={CommandCell} width={"100px"} filterable={false} />
        </Grid>
        <ContextMenu
          show={show}
          offset={offset.current}
          onSelect={handleOnSelect}
          onClose={handleCloseMenu}
        >
          <MenuItem
            text="Edit Job Description"
            data={{
              action: "edit",
            }}
            icon="edit"
          />
          <MenuItem
            text="Delete Job Description"
            data={{
              action: "delete",
            }}
            icon="edit"
          />
        </ContextMenu>
      </div>
      <div>
        {openDescriptionDialog && (
          <Dialog
            width={600}
            title={
              <div className="d-flex align-items-center justify-content-center">
                <i
                  className={
                    "fa-solid " +
                    " " +
                    (formInit.id > 0 ? "fa-edit" : "fa-plus")
                  }
                ></i>
                <span className="ms-2">
                  {formInit.id > 0
                    ? "Edit Job Description"
                    : "Add new Job Description"}
                </span>
              </div>
            }
            onClose={toggleDialog}
          >
            <Form
              onSubmit={handleSubmit}
              initialValues={formInit}
              render={(formRenderProps) => (
                <FormElement>
                  <fieldset className={"k-form-fieldset"}>
                    <div>
                      <Field
                        id={"name"}
                        name={"name"}
                        label={"Job Description"}
                        component={FormInput}
                      />
                    </div>

                    <div className="k-form-buttons">
                      <Button
                        themeColor={"primary"}
                        className={"col-12"}
                        type={"submit"}
                        disabled={!formRenderProps.allowSubmit}
                      >
                        Save
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
            onClose={toggleDeleteDialog}
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
                onClick={toggleDeleteDialog}
              >
                No
              </Button>
              <Button
                themeColor={"primary"}
                className={"col-12"}
                onClick={handleDelete}
              >
                Yes
              </Button>
            </DialogActionsBar>
          </Dialog>
        )}

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
      </div>
    </>
  );
}

export default JobDescriptions;
