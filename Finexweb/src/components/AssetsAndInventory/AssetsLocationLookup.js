import { orderBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { GridColumn as Column, Grid } from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  CommonEndPoints,
  InventoryEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import MyCommandCell from "../cells/CommandCell";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../NotificationHandler/NotificationHandler";

const AssetsLocationLookup = () => {
  const [AssetLookup, setAssetLookup] = useState([]);
  const [masterAssetLookup, setMasterAssetLookup] = useState([]);
  const [TypeList, setTypeList] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedWorkTypeId, setSelectedWorkTypeId] = useState();

  const initialSort = [
    {
      field: "name",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    getType();
    getAssetsLookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAssetLookup(orderBy(AssetLookup, sort));
    setMasterAssetLookup(orderBy(AssetLookup, sort));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const getType = () => {
    axiosInstance({
      method: "GET",
      url: CommonEndPoints.Getcommon + "?id=" + 12,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setTypeList(data);
      })
      .catch(() => { });
  };
  const getAssetsLookup = () => {
    axiosInstance({
      method: "GET",
      url: InventoryEndPoints.AssetLookup,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        const newDataItem = {
          inEdit: true,
          id: 0,
        };
        setAssetLookup(orderBy([...data, newDataItem], sort));
        setMasterAssetLookup(orderBy([...data, newDataItem], sort));
      })
      .catch(() => { });
  };

  const editField = "inEdit";

  const itemChange = (event) => {
    const newData = AssetLookup.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [event.field || ""]: event.value,
        }
        : item
    );
    setAssetLookup(newData);
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
    let newData = AssetLookup.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );

    setAssetLookup(newData);
  };

  const discard = (dataItem) => {
    const newData = [...AssetLookup];
    newData.splice(0, 1);
    setAssetLookup(newData);
  };

  const cancel = (dataItem) => {
    setAssetLookup(masterAssetLookup);
  };

  const update = (dataItem) => {
    let apiRequest = {
      id: dataItem.id,
      type: dataItem?.type?.id || dataItem?.type,
      name: dataItem.name,
    };
    axiosInstance({
      method: "PUT",
      url: InventoryEndPoints.EditAssetLookup + "/" + dataItem.id,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        showSuccessNotification("Asset lookup updated successfully");
        getAssetsLookup();
      })
      .catch(() => { });
  };

  const add = (dataItem) => {
    if (dataItem.name && dataItem?.type?.id) {
      let apiRequest = {
        id: 0,
        type: dataItem?.type?.id,
        name: dataItem.name,
      };
      axiosInstance({
        method: "POST",
        url: InventoryEndPoints.AddAssetLookup,
        data: apiRequest,
        withCredentials: false,
      })
        .then((response) => {
          showSuccessNotification("Asset lookup added successfully");
          getAssetsLookup();
        })
        .catch(() => { });
    } else {
      showErrorNotification("Please fill in all the fields");
    }
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
        url: InventoryEndPoints.AddAssetLookup + "/" + selectedWorkTypeId,
        withCredentials: false,
      })
        .then((response) => {
          toggleDeleteDialog();
          getAssetsLookup();
          showSuccessNotification("Asset lookup deleted successfully");
        })
        .catch(() => { });
    }
  };
  const DropDownCommandCell = (props) => {
    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value,
        });
      }
    };
    const { dataItem } = props;
    const field = props.field || "";
    let dataValue = dataItem[field] == null ? "" : dataItem[field];
    if (typeof dataValue == "number") {
      let index = TypeList.findIndex((type) => type.id == dataValue);
      dataValue = TypeList[index];
    }
    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            onChange={handleChange}
            id={"Type"}
            name={"Type"}
            textField="value"
            dataItemKey="id"
            data={TypeList.sort((a, b) => {
              const isANumber = /^\d/.test(a["value"]);
              const isBNumber = /^\d/.test(b["value"]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a["value"].localeCompare(b["value"]);
            })}
            value={dataValue}
          />
        ) : (
          dataValue?.value
        )}
      </td>
    );
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Asset Lookup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("AssetLookupM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Assets/Inventory
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Assets
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Assets Lookup
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8">
              <figure>
                <blockquote className="blockquote">
                  <h1>Asset Lookup</h1>
                </blockquote>
              </figure>
            </div>
          </div>
          <br />

          <div>
            {checkPrivialgeGroup("AssetLookupG", 1) && (
              <Grid
                resizable={true}
                style={{
                  height: "500px",
                }}
                data={AssetLookup}
                dataItemKey={"id"}
                editField={editField}
                onItemChange={itemChange}
                sortable={true}
                sort={sort}
                onSortChange={(e) => {
                  setSort(e.sort);
                }}
              >
                <Column field="name" title="Name" />
                <Column field="type" title="Type" cell={DropDownCommandCell} />
                {checkPrivialgeGroup("AssetLookupCC", 3) && (
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

export default AssetsLocationLookup;
