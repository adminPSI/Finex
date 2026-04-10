import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { GridColumn as Column, Grid } from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import { TypeOfWorkEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import { projectService } from "../../services/ProjectServices";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";
import MyCommandCell from "../cells/CommandCell";

const TypeOfWork = () => {
  const [typeOfWorkList, setTypeOfWorkList] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedWorkTypeId, setSelectedWorkTypeId] = useState();
  const [selectedRowObject, setSelectedRowObject] = useState(null);
  const initialSort = [
    {
      field: "type",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    getTypeOfWorkList();
  }, []);
  const getTypeOfWorkList = () => {
    projectService.fetchTypeOfWorkList().then((data) => {
      const newDataItem = {
        inEdit: true,
        id: 0,
      };

      setTypeOfWorkList([...data, newDataItem]);
    });
  };

  const editField = "inEdit";

  const itemChange = (event) => {
    const newData = typeOfWorkList.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [event.field || ""]: event.value,
        }
        : item
    );
    setTypeOfWorkList(newData);
  };

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      update={update}
      cancel={cancel}
      remove={remove}
      add={add}
      discard={discard}
      editField={editField}
    />
  );

  const enterEdit = (dataItem) => {
    let newData = typeOfWorkList.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    const matchItem = newData.find((item) => item.id == dataItem.id);
    setSelectedRowObject(matchItem);
    setTypeOfWorkList(newData);
  };

  const discard = (dataItem) => {
    const newData = [...typeOfWorkList];
    newData.splice(0, 1);
    setTypeOfWorkList(newData);
  };

  const cancel = (dataItem) => {
    let newData = typeOfWorkList.map((item) =>
      item.id == dataItem.id
        ? {
          ...selectedRowObject,
          inEdit: false,
        }
        : item
    );
    setTypeOfWorkList(newData);
  };

  const update = (dataItem) => {
    let apiRequest = {
      id: dataItem.id,
      orG_ID: dataItem.orG_ID,
      type: dataItem.type,
    };
    axiosInstance({
      method: "PUT",
      url: TypeOfWorkEndPoints.TypeOfWork + "/" + dataItem.id,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Work Type updated successfully");
        getTypeOfWorkList();
      })
      .catch(() => { });
  };

  const add = (dataItem) => {
    if (!dataItem?.type) {
      return showErrorNotification("Work Type can't be empty");
    }
    let apiRequest = {
      type: dataItem.type,
    };
    axiosInstance({
      method: "POST",
      url: TypeOfWorkEndPoints.TypeOfWork,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Work Type added successfully");
        getTypeOfWorkList();
      })
      .catch(() => { });
  };

  const remove = (dataItem) => {
    setSelectedWorkTypeId(dataItem.id);
    toggleDeleteDialog();
  };

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };

  const DeleteOnClick = () => {
    if (selectedWorkTypeId) {
      axiosInstance({
        method: "DELETE",
        url: TypeOfWorkEndPoints.TypeOfWork + "/" + selectedWorkTypeId,
        withCredentials: false,
      })
        .then((response) => {
          toggleDeleteDialog();
          getTypeOfWorkList();
          showSuccessNotification("Work Type deleted successfully");
        })
        .catch(() => { });
    }
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Work Setup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("ViewWSetupM", 1) && (
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
                Work Setup
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8">
              <figure>
                <blockquote className="blockquote">
                  <h1>Type of Work</h1>
                </blockquote>
              </figure>
            </div>
          </div>
          <br />

          <div>
            {checkPrivialgeGroup("WSetupG", 1) && (
              <Grid
                resizable={true}
                style={{
                  height: "500px",
                }}
                data={typeOfWorkList}
                dataItemKey={"id"}
                editField={editField}
                onItemChange={itemChange}
                sortable={true}
                sort={sort}
                onSortChange={(e) => {
                  setSort(e.sort);
                }}
              >
                <Column field="type" title="Work Type" format="{0:c}" />
                {checkPrivialgeGroup("AddWsetupCC", 2) && (
                  <Column cell={CommandCell} width="240px" filterable={false} />
                )}
              </Grid>
            )}
          </div>

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
                  onClick={DeleteOnClick}
                >
                  Yes
                </Button>
              </DialogActionsBar>
            </Dialog>
          )}
        </>
      )}
    </>
  );
};

export default TypeOfWork;
