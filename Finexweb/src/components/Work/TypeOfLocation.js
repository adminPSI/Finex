import { orderBy } from "@progress/kendo-data-query";
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

const TypeOfLocation = () => {
  const [TypeOfLocationList, setTypeOfLocationList] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedLocationTypeId, setSelectedLocationTypeId] = useState();
  const [selectedRowObject, setSelectedRowObject] = useState(null);

  const initialSort = [
    {
      field: "type",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    getTypeOfLocationList();
  }, []);

  const getTypeOfLocationList = () => {
    projectService.fetchLocations().then((data) => {
      const newDataItem = {
        inEdit: true,
        id: 0,
      };

      setTypeOfLocationList([...data, newDataItem]);
    });
  };

  const editField = "inEdit";

  const itemChange = (event) => {
    const newData = TypeOfLocationList.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [event.field || ""]: event.value,
        }
        : item
    );
    setTypeOfLocationList(newData);
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
    let newData = TypeOfLocationList.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    const matchItem = newData.find((item) => item.id == dataItem.id);
    setSelectedRowObject(matchItem);
    setTypeOfLocationList(newData);
  };

  const discard = (dataItem) => {
    const newData = [...TypeOfLocationList];
    newData.splice(0, 1);
    setTypeOfLocationList(newData);
  };

  const cancel = (dataItem) => {
    let newData = TypeOfLocationList.map((item) =>
      item.id == dataItem.id
        ? {
          ...selectedRowObject,
          inEdit: false,
        }
        : item
    );
    setTypeOfLocationList(newData);
  };

  const update = (dataItem) => {
    let apiRequest = {
      id: dataItem.id,
      orG_ID: dataItem.orG_ID,
      location: dataItem.location,
    };
    axiosInstance({
      method: "PUT",
      url: TypeOfWorkEndPoints.TypeOfLocation + "/" + dataItem.id,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Location updated successfully");
        getTypeOfLocationList();
      })
      .catch(() => { });
  };

  const add = (dataItem) => {
    if (!dataItem?.location) {
      return showErrorNotification("Location can't be empty");
    }
    let apiRequest = {
      location: dataItem.location,
    };
    axiosInstance({
      method: "POST",
      url: TypeOfWorkEndPoints.TypeOfLocation,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Location added successfully");
        getTypeOfLocationList();
      })
      .catch(() => { });
  };

  const remove = (dataItem) => {
    setSelectedLocationTypeId(dataItem.id);
    toggleDeleteDialog();
  };

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };

  const DeleteOnClick = () => {
    if (selectedLocationTypeId) {
      axiosInstance({
        method: "DELETE",
        url: TypeOfWorkEndPoints.TypeOfLocation + "/" + selectedLocationTypeId,
        withCredentials: false,
      }).then((response) => {
        toggleDeleteDialog();
        getTypeOfLocationList();
        showSuccessNotification("Location deleted successfully");
      });
    }
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Location Setup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("ViewLSetupM", 1) && (
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
                Location Setup
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8">
              <figure>
                <blockquote className="blockquote">
                  <h1>Location</h1>
                </blockquote>
              </figure>
            </div>
          </div>
          <br />

          <div>
            {checkPrivialgeGroup("LSetupG", 1) && (
              <Grid
                resizable={true}
                style={{
                  height: "500px",
                }}
                data={orderBy(TypeOfLocationList, sort)}
                dataItemKey={"id"}
                editField={editField}
                onItemChange={itemChange}
                sortable={true}
                sort={sort}
                onSortChange={(e) => {
                  setSort(e.sort);
                }}
              >
                <Column field="location" title="Location" format="{0:c}" />
                {checkPrivialgeGroup("LsetupCC", 2) && (
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

export default TypeOfLocation;
