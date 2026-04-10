import { orderBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import {
  GridColumn as Column,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input
} from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import usePrivilege from "../../helper/usePrivilege";
import { projectService } from "../../services/ProjectServices";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";
import Constants from "../common/Constants";
import {
  ColumnDatePicker,
  ColumnFormCurrencyTextBox,
  ColumnFormNumericTextBox,
} from "../form-components";
import {
  notesValidator
} from "../validators";
import { DatePickerCell } from "./DatePickerCell";
import { MyCommandCell } from "./myCommandCell";
import { DropDownCell } from "./myDropDownCell";
const filterOperators = {
  text: [
    {
      text: "grid.filterContainsOperator",
      operator: "contains",
    },
  ],
};
const initialDataState = {
  skip: 0,
  take: Constants.KendoGrid.defaultPageSize,
};

const MaterialSupplies = ({ project }) => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = React.useState();
  const [typeOfWorkList, setTypeOfWorkList] = useState([]);
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageTotal, setPageTotal] = React.useState();
  const [searchText, setsearchText] = React.useState("");
  const [showFilter, setshowFilter] = React.useState(false);
  const [vendorList, setVendorListList] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [columnShow, setColumnShow] = useState(false);
  const [selectedRowObject, setSelectedRowObject] = useState(null);

  const DropDownCommandCell = (props) => {
    const localizedData = vendorList;
    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value.vendorId,
        });
      }
    };
    const { dataItem } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] == null ? "" : dataItem[field];
    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            onChange={handleChange}
            id={"vendorName"}
            name={"vendorName"}
            textField="vendorName"
            dataItemKey="vendorId"
            data={localizedData.sort((a, b) => {
              const isANumber = /^\d/.test(a["vendorName"]);
              const isBNumber = /^\d/.test(b["vendorName"]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a["vendorName"].localeCompare(b["vendorName"]);
            })}
            popupSettings={{ width: "auto" }}
            value={localizedData.find((c) => c.vendorId == dataValue)}
          />
        ) : (
          localizedData.find((c) => c.vendorId == dataValue)?.vendorName
        )}
      </td>
    );
  };
  const [unitPrice, setUnitPrice] = useState([]);
  useEffect(() => {
    if (project?.id) {
      BindMaterialSuppliesGrid();
      projectService
        .fetchTypeOfWorkList()
        .then((data) => {
          setTypeOfWorkList([
            { type: "Select Type of Work", id: null },
            ...data,
          ]);
        })
        .catch(() => { });
      projectService
        .fetchVendorList()
        .then((data) => {
          if (data.data.length) {
            data = data.data.map((element) => {
              element.vendorId = element.id;
              element.vendorName = element.name;
              return element;
            });
            setVendorListList(data);
          }
        })
        .catch(() => { });
    }
  }, [project]);

  const initialSort = [
    {
      field: "vendorId",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onCheckBox = (event) => {
    const field = event.target.name;
    setColumnShow(!columnShow);
  };
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";

    setBindMaterialSuppliesGrid({
      ...bindMaterialSuppliesGrid,
      quantity: 0,
      unitCost: 0,
      totalCost: 0,
      search: searchText,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindMaterialSuppliesGrid, setBindMaterialSuppliesGrid] =
    useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindMaterialSuppliesGrid) {
        BindMaterialSuppliesGrid(
          bindMaterialSuppliesGrid.material,
          bindMaterialSuppliesGrid.vendorName,
          bindMaterialSuppliesGrid.quantity,
          bindMaterialSuppliesGrid.unitCost,
          bindMaterialSuppliesGrid.totalCost,
          bindMaterialSuppliesGrid.notes,
          bindMaterialSuppliesGrid.workType,
          bindMaterialSuppliesGrid.search,
          bindMaterialSuppliesGrid.cskip,
          bindMaterialSuppliesGrid.ctake == "All"
            ? 0
            : bindMaterialSuppliesGrid.ctake,
          bindMaterialSuppliesGrid.desc,
          bindMaterialSuppliesGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindMaterialSuppliesGrid]);

  const BindMaterialSuppliesGrid = (
    material = "",
    vendorName = "",
    quantity = "",
    unitCost = "",
    totalCost = "",
    notes = "",
    workType = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "vendorId"
  ) => {
    projectService
      .getMaterialSuppliesListWithFilter(
        project.id,
        material,
        vendorName,
        quantity,
        unitCost,
        totalCost,
        notes,
        workType,
        search,
        cskip,
        ctake,
        desc,
        sortKey
      )
      .then((materialResponce) => {
        setUnitPrice([]);
        let data = materialResponce.data;
        data = data.map((element) => {
          element.date = new Date(element.date);
          element.projectEnded = project.endDate ? true : false;
          return element;
        });
        setPageTotal(materialResponce.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: materialResponce.total,
          });
        }
        let unitAmount = [];
        data.forEach((element) => {
          let obj = {
            dataItem: element,
            value: element.unitCost,
          };
          unitAmount.push(obj);
        });

        if (!project.endDate) {
          const newDataItem = {
            inEdit: true,
            Discontinued: false,
            id: 0,
          };
          unitAmount.push({ dataItem: newDataItem, value: null });
          setUnitPrice(unitAmount);
          setData(orderBy([...data, newDataItem], sort));
        } else {
          setUnitPrice(unitAmount);
          setData(orderBy(data, sort));
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    setData(orderBy(data, sort));
  }, [sort]);
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
    projectService
      .deleteMaterialSuppliesList(deleteVisible.id)
      .then((data) => {
        setDeleteVisible(null);
        if (pageTotal != "All" && pageTotal - 1 == page.skip) {
          page.skip = page.skip - page.take;
          setPage({ page });
          setBindMaterialSuppliesGrid({
            quantity: 0,
            unitCost: 0,
            totalCost: 0,
            cskip: page.skip,
            ctake: page.take,
          });
        } else {
          setBindMaterialSuppliesGrid({
            quantity: 0,
            unitCost: 0,
            totalCost: 0,
            cskip: page.skip,
            ctake: page.take,
          });
        }
      })
      .catch(() => { });
  };
  const update = (dataItem) => {
    let index = unitPrice.findIndex(
      (price) => price.dataItem.id == dataItem.id
    );
    if (
      !dataItem.date ||
      !dataItem.material ||
      !dataItem.vendorId ||
      dataItem.vendorId == 0 ||
      !dataItem.unitCost ||
      !dataItem.quantity ||
      index == -1
    ) {
      showErrorNotification("Please fill in all the fields");
      return;
    } else if (dataItem.quantity < 0) {
      showErrorNotification("Quantity can't be negative number");
    } else if (+dataItem.unitCost < 0) {
      showErrorNotification("Unit cost can't be negative number");
    } else {
      dataItem.inEdit = false;
      if (dataItem.id != 0) {
        let newMaterialSuppliesData = {
          id: dataItem.id,
          orG_ID: 7,
          projectId: project.id,
          date: dataItem.date,
          material: dataItem.material,
          vendorId: dataItem.vendorId,
          quantity: dataItem.quantity,
          unitCost: dataItem.unitCost,
          totalCost: dataItem.totalCost,
          notes: dataItem.notes,
          workTypeId: dataItem.workTypeId,
        };
        projectService
          .editMaterialSuppliesList(project.id, newMaterialSuppliesData)
          .then((data) => {
            BindMaterialSuppliesGrid();
          })
          .catch(() => { });
      } else {
        let newMaterialSuppliesData = {
          id: 0,
          orG_ID: 7,
          projectId: project.id,
          date: dataItem.date,
          material: dataItem.material,
          vendorId: dataItem.vendorId !== 0 ? dataItem.vendorId : "",
          quantity: dataItem.quantity,
          unitCost: dataItem.unitCost,
          totalCost: dataItem.totalCost,
          notes: dataItem.notes,
          workTypeId: dataItem.workTypeId,
        };
        projectService
          .addMaterialSuppliesList(project.id, newMaterialSuppliesData)
          .then((data) => {
            BindMaterialSuppliesGrid();
          })
          .catch(() => { });
      }
    }
  };

  const discard = (dataItem) => {
  };
  const cancel = (dataItem) => {
    let newData = data.map((item) =>
      item.id == dataItem.id
        ? {
          ...selectedRowObject,
          inEdit: false,
        }
        : item
    );
    setData(newData);
  };
  const enterEdit = (dataItem) => {
    let newData = data.map((item) => {
      if (item.id == dataItem.id) {
        return {
          ...item,
          inEdit: true,
        };
      } else {
        return item;
      }
    });
    const matchItem = data.find((item) => item.id == dataItem.id);
    setSelectedRowObject(matchItem);
    setData(newData);
  };
  const itemChange = (event) => {
    if (event.field == "quantity" || event.field == "unitCost") {
      data.map((item) => {
        if (
          item.id == event.dataItem.id &&
          ((item.quantity && event.value && event.field == "unitCost") ||
            (item.unitCost && event.value && event.field == "quantity"))
        ) {
          item.totalCost =
            event.field == "quantity"
              ? event.value * item.unitCost
              : item.quantity * event.value;
        } else if (item.id == event.dataItem.id) {
          item.totalCost = 0;
        }
      });
    }
    const field = event.field || "";
    if (field == "material" || field == "notes") {
      let errorMessage = notesValidator(event.value);

      if (!errorMessage) {
        const newData = data.map((item) =>
          item.id == event.dataItem.id
            ? {
              ...item,
              [field]: event.value,
            }
            : item
        );
        setData(newData);
      } else {
        showErrorNotification(errorMessage);
      }
    } else {
      const newData = data.map((item) =>
        item.id == event.dataItem.id
          ? {
            ...item,
            [field]: event.value,
          }
          : item
      );
      setData(newData);
    }
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };

  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindMaterialSuppliesGrid({
      search: value,
      material: undefined,
      vendorName: undefined,
      quantity: undefined,
      totalCost: undefined,
      unitCost: undefined,
      notes: undefined,
      workType: undefined,
      cskip: 0,
    });
  };
  const filterChange = (event) => {
    var material = "";
    var vendorName = "";
    var quantity = "";
    var totalCost = "";
    var unitCost = "";
    var notes = "";
    var workType = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "material") {
          material = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "vendorId") {
          vendorName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "quantity") {
          quantity = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "totalCost") {
          var totalCost = 0;
          totalCost = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "unitCost") {
          unitCost = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "notes") {
          notes = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "workTypeId") {
          workType = event.filter.filters[i].value;
        }
      }
    }

    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindMaterialSuppliesGrid({
      material: material,
      vendorName: vendorName,
      quantity: quantity,
      unitCost: unitCost,
      totalCost: totalCost,
      notes: notes,
      workType: workType,
      search: undefined,
      cskip: 0,
    });
    setFilter(event.filter);
  };
  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindMaterialSuppliesGrid({
        ...bindMaterialSuppliesGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindMaterialSuppliesGrid({
        ...bindMaterialSuppliesGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: data.length,
      });
    }
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Project Costing')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("PCMSG", 1) && (
        <>
          <Grid
            resizable={true}
            filterable={showFilter}
            expandField="expanded"
            filter={filter}
            filterOperators={filterOperators}
            onFilterChange={filterChange}
            skip={page.skip}
            take={page.take}
            total={pageTotal}
            pageable={{
              buttonCount: 4,
              pageSizes: [10, 15, 50, "All"],
              pageSizeValue: pageSizeValue,
            }}
            data={data}
            onPageChange={pageChange}
            editField={editField}
            dataItemKey={"id"}
            onItemChange={itemChange}
            sortable={true}
            sort={sort}
            onSortChange={(e) => {
              onSortChange(e);
            }}
          >
            <GridToolbar>
              <div className="row col-sm-12">
                <div className="col-sm-6 d-grid gap-3 d-md-block">
                  <Button
                    className="buttons-container-button"
                    fillMode="outline"
                    themeColor={"primary"}
                    onClick={MoreFilter}
                  >
                    <i className="fa-solid fa-arrow-down-wide-short"></i> &nbsp;
                    More Filter
                  </Button>
                </div>
                <div className="col-sm-6 d-flex align-items-center justify-content-center">
                  <div className="col-3">
                    {checkPrivialgeGroup("MSSMICB", 1) && (
                      <Checkbox
                        type="checkbox"
                        id="modifiedBy"
                        name="modifiedBy"
                        defaultChecked={columnShow}
                        onChange={onCheckBox}
                        label={"Modified Info"}
                      />
                    )}
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

            <Column
              field="date"
              title="Date"
              width={160}
              format="{0:MM/dd/yyyy}"
              filterCell={ColumnDatePicker}
              cell={DatePickerCell}
              filterable={false}
            />
            <Column
              field="vendorId"
              title="Vendor Name"
              cell={DropDownCommandCell}
            />
            <Column field="material" title="Materials" />
            <Column
              field="workTypeId"
              title="Type Of Work"
              cell={(dataItem) => DropDownCell(dataItem, typeOfWorkList)}
            />
            <Column field="notes" title="Notes" />
            <Column
              field="quantity"
              title="Quantity"
              cell={ColumnFormNumericTextBox}
            />
            <Column
              field="unitCost"
              title="Unit Cost"
              format="{0:c2}"
              className="text-end"
              cell={ColumnFormCurrencyTextBox}
              headerCell={(props) => {
                return (
                  <span className="k-cell-inner">
                    <span className="k-link !k-cursor-default d-flex justify-content-end">
                      <span className="k-column-title">{props.title}</span>
                      {props.children}
                    </span>
                  </span>
                );
              }}
            />
            <Column
              field="totalCost"
              title="Total Cost"
              editable={false}
              headerCell={(props) => {
                return (
                  <span className="k-cell-inner">
                    <span className="k-link !k-cursor-default d-flex justify-content-end">
                      <span className="k-column-title">{props.title}</span>
                      {props.children}
                    </span>
                  </span>
                );
              }}
              cell={(props) => {
                var amount = props.dataItem?.totalCost || 0;
                amount =
                  "$" +
                  amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                return <td className="!k-text-right">{`${amount}`}</td>;
              }}
            />
            {columnShow && (
              <Column
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
            {columnShow && <Column field="createdBy" title="Created By" />}
            {columnShow && (
              <Column
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
            {columnShow && <Column field="modifiedBy" title="Modified By" />}
            {checkPrivialgeGroup("PCMSCC", 3) && (
              <Column cell={CommandCell} width="150px" filterable={false} />
            )}
          </Grid>
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
        </>
      )}
    </>
  );
};
export default MaterialSupplies;
