import { orderBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  GridColumn as Column,
  Grid,
  GridToolbar,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import {
  ContextMenu,
  Drawer,
  DrawerContent,
  DrawerItem,
  MenuItem,
} from "@progress/kendo-react-layout";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../core/HttpInterceptor";
import {
  InventoryEndPoints,
  PayrollEndPoints
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";
import {
  ColumnDatePicker,
  ColumnFormCurrencyTextBox,
} from "../form-components";

const myCustomDateCell = (props) => {
  var myDate = props.dataItem.dateReceived;
  if (myDate) {
    const [year, month, day] = myDate.split("T")[0].split("-");
    return (
      <td
        colspan="1"
        class="k-table-td"
        role="gridcell"
        aria-colindex="2"
        aria-selected="false"
        data-grid-col-index="1"
      >
        {`${month}/${day}/${year}`}
      </td>
    );
  } else {
    return (
      <td
        colspan="1"
        class="k-table-td"
        role="gridcell"
        aria-colindex="2"
        aria-selected="false"
        data-grid-col-index="1"
      ></td>
    );
  }
};

export default function Assets() {
  const [filter, setFilter] = useState();
  const [showFilter, setshowFilter] = useState(false);
  const [addCashVisible, setAddCashVisible] = useState(false);
  const [AssetsData, setAssetsData] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [responsibleList, setResponsibleList] = useState([]);
  const [showInactive, setshowInactive] = useState(false);
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = useState(initialDataState);

  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);
  const [pageTotal, setPageTotal] = useState();
  const [, setsearchText] = useState("");
  const [show, setShow] = useState(false);
  const offset = useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = useState(0);
  const [columnShow, setColumnShow] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      await BindDataGrid();
    }

    fetchData();

    getAssetsLookup();
    getResPerson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const separateByTypeName = (arr) => {
    return arr.reduce((acc, obj) => {
      if (!acc[obj.typename]) {
        acc[obj.typename] = [];
      }
      acc[obj.typename].push(obj);
      return acc;
    }, {});
  };
  const getAssetsLookup = async () => {
    axiosInstance({
      method: "GET",
      url: InventoryEndPoints.AssetLookup,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;

        const sortData = separateByTypeName(data);

        setBuildingList(sortData["Building"]);

        setProgramList(sortData["Program"]);
        setAreaList(sortData["Area"]);
      })
      .catch(() => { });
  };

  const getResPerson = () => {
    return axiosInstance({
      method: "GET",
      url: PayrollEndPoints.Employee,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setResponsibleList(
          data.map((item) => {
            return {
              name: item.displayName,
              id: item.id,
            };
          })
        );
      })
      .catch(() => { });
  };

  const DetailComponent = (props) => {
    const ldata = [props.dataItem.assetLocation];
    if (ldata && ldata != null) {
      return (
        <div>
          <section
            style={{
              width: "200px",
              float: "left",
            }}
          >
            <p>
              <strong>County Tag Number:</strong> {props.dataItem.countyNo}
            </p>
          </section>
          <Grid resizable={true} data={ldata}>
            <Column field="program" title="Program" />
            <Column field="building" title="Building" />
            <Column field="area" title="Area" />
            <Column field="resPer" title="Reponsible Person" />
          </Grid>
        </div>
      );
    }
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  // Sorting changes
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "desc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const [bindDataGrid, setBindDataGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.AssetsNo,
          bindDataGrid.description,
          bindDataGrid.dateReceived,
          bindDataGrid.value,
          bindDataGrid.search,
          bindDataGrid.cskip,
          bindDataGrid.ctake == "All" ? 0 : bindDataGrid.ctake,
          bindDataGrid.desc,
          bindDataGrid.isActive,
          bindDataGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindDataGrid]);
  const onInactiveCheckBox = (event) => {
    setshowInactive(event.target.value);

    let iactive = event.target.value ? "N" : "Y";
    setBindDataGrid({
      ...bindDataGrid,
      isActive: iactive,
    });
  };
  // Sorting changes
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindDataGrid({
      ...bindDataGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };
  // Sorting changes
  const BindDataGrid = async (
    AssetsNo = "",
    description = "",
    dateReceived = "",
    value = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    isActive= "Y",
    sortKey = "modifiedDate"
  ) => {
    axiosInstance({
      method: "Post",
      url:
        InventoryEndPoints.InventoryListWithFilter +
        "AssetsNo=" +
        AssetsNo +
        "&&description=" +
        description +
        "&&assetFlag=" +
        true +
        "&&dateReceived=" +
        dateReceived +
        "&&value=" +
        value +
        "&&isActive=" +
        isActive +
        "&&search=" +
        search +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setPageTotal(response.data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: response.data.total,
          });
        }
        setAssetsData(data);
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.AssetsNo,
            id: data.id,
          };
          itemsData.push(items);
        });
      })
      .catch(() => { });
  };

  const filterChange = (event) => {
    var AssetsNo = "";
    var description = "";
    var dateReceived = "";
    let value = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "AssetsNo") {
          AssetsNo = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "description") {
          description = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "dateReceived") {
          let startDateValue = event.filter.filters[i].value;
          let dateformat = new Date(startDateValue);
          let month =
            dateformat.getMonth() < 9
              ? "0" + (dateformat.getMonth() + 1)
              : dateformat.getMonth() + 1;
          let date =
            dateformat.getFullYear() + "-" + month + "-" + dateformat.getDate();
          dateReceived = date;
        }
        if (event.filter.filters[i].field == "cost") {
          value = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindDataGrid({
      ...bindDataGrid,
      cskip: 0,
      AssetsNo,
      description,
      dateReceived,
      value,
      search: undefined,
    });
    setFilter(event.filter);
  };
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindDataGrid({
        ...bindDataGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindDataGrid({
        ...bindDataGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: AssetsData.length,
      });
    }
  };

  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    setBindDataGrid({
      ...bindDataGrid,
      cskip: 0,
      AssetsNo: undefined,
      description: undefined,
      dateReceived: undefined,
      value: undefined,
      search: value,
    });
  };

  const addAssetsToggleDialog = () => {
    let id = 0;
    let action = "add";
    navigate("/addassets", { state: { id, action, page } });
  };

  const addCashToggleDialog = () => {
    setAddCashVisible(!addCashVisible);
  };

  const getAssetById = (id) => {
    axiosInstance({
      method: "GET",
      url: InventoryEndPoints.Inventory.replace("#InventoryId#", id),
      withCredentials: false,
    })
      .then((response) => {
        let data = AssetsData.slice();
        let index = data.findIndex((d) => d.id == id);
        if (response.data.assetLocation != null) {
          if (response.data.assetLocation?.program) {
            const tmpData = programList.find(
              (c) => c.id == response.data.assetLocation.program
            );
            if (tmpData) {
              response.data.assetLocation.program = tmpData.name;
            }
          }

          if (response.data.assetLocation?.building) {
            const tmpData = buildingList.find(
              (c) => c.id == response.data.assetLocation.building
            );
            if (tmpData) {
              response.data.assetLocation.building = tmpData.name;
            }
          }

          if (response.data.assetLocation?.area) {
            const tmpData = areaList.find(
              (c) => c.id == response.data.assetLocation.area
            );
            if (tmpData) {
              response.data.assetLocation.area = tmpData.name;
            }
          }

          if (response.data.assetLocation?.resPer) {
            const tmpData = responsibleList.find(
              (c) => c.id == response.data.assetLocation.resPer
            );
            if (tmpData) {
              response.data.assetLocation.resPer = tmpData.name;
            }
          } else {
            response.data.assetLocation.resPer = "";
          }

          data[index].assetLocation = response.data.assetLocation;
        }

        setAssetsData(data);
      })
      .catch(() => { });
  };

  const expandChange = (event) => {
    setAssetsData([...AssetsData]);
    let id = event.dataItem.id;
    getAssetById(id);
    event.dataItem.expanded = event.value;
    if (!event.value) {
      return;
    }
  };

  const CommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleContextMenu}
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

  const items = [];

  const CustomItem = (props) => {
    return (
      <DrawerItem {...props}>
        <img
          src={props.profileimg}
          height={50}
          width={50}
          alt={props.profileimg}
        ></img>
        <div className="item-descr-wrap">
          <div className="row">
            <div className="col-8">{props.text}</div>
            <div className="col-4 item-date">{"10/02/23"}</div>
          </div>
          <span className="item-descr">
            Modified <span className="text-success">{props.desc}</span>
          </span>
        </div>
      </DrawerItem>
    );
  };

  const [drawerexpanded, setDrawerExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState(
    items.findIndex((x) => x.selected == true)
  );

  const drawerhandleSelect = (ev) => {
    setSelectedId(ev.itemIndex);
    setDrawerExpanded(false);
  };

  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };

  const handleOnSelect = (e) => {
    let id = selectedRowId;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          navigate("/addassets", { state: { id, action, page } });
          break;
        case "inactive":
          axiosInstance({
            method: "GET",
            url: InventoryEndPoints.Inventory + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              let convertDate = new Date(response.data.activeDate);
              data.inactiveDate = convertDate;
              data.isActive = "N";
            })
            .catch(() => { });
          break;

        case "AddCashBalance":
          axiosInstance({
            method: "GET",
            url: InventoryEndPoints.Inventory + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.amount = "";
              data.activeDate = "";
              data.startDate = new Date(response.data.startDate);
              data.modifiedDate = new Date(response.data.modifiedDate);
              addCashToggleDialog();
            })
            .catch(() => { });
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const [selectedState, setSelectedState] = useState({});
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const onSelectionChange = (event) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    let tmpId;
    let newData = AssetsData.map((item) => {
      if (item.id == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
        tmpId = item.id;
        setselectedRowId(tmpId);
        getAssetById(tmpId);
      } else {
        item.expanded = false;
      }
      return item;
    });
    if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
      setSelectedState(newSelectedState);
    } else {
      setSelectedState({});
    }
    setAssetsData(newData);
  };

  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Assets')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("AssetsM", 1) && (
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
                Assets
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8">
              <figure>
                <blockquote className="blockquote">
                  <h1>Assets</h1>
                </blockquote>
              </figure>
            </div>
            <div className="col-sm-8 d-flex align-items-center">
              <h3>Assets</h3>
            </div>
            <div className="col-sm-4 text-end">
              {checkPrivialgeGroup("AddAssetsB", 2) && (
                <Button themeColor={"primary"} onClick={addAssetsToggleDialog}>
                  <i className="fa-solid fa-plus"></i> Add New Assets
                </Button>
              )}
            </div>
          </div>

          <div>
            <Drawer
              expanded={drawerexpanded}
              position={"end"}
              mode={"overlay"}
              width={400}
              items={items.map((item) => ({
                ...item,
                selected: item.text == selectedId,
              }))}
              item={CustomItem}
              onSelect={drawerhandleSelect}
              onOverlayClick={drawerhandleSelect}
            >
              <DrawerContent></DrawerContent>
            </Drawer>
          </div>
          {checkPrivialgeGroup("AssetsG", 1) && (
            <div className="row mt-3">
              <Grid
                resizable={true}
                filterable={showFilter}
                detail={DetailComponent}
                expandField="expanded"
                onExpandChange={expandChange}
                filter={filter}
                onFilterChange={filterChange}
                data={orderBy(AssetsData, sort)}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, 50, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                onPageChange={pageChange}
                selectedField={SELECTED_FIELD}
                onSelectionChange={onSelectionChange}
                dataItemKey={DATA_ITEM_KEY}
                selectable={{
                  enabled: true,
                  drag: false,
                  mode: "multiple",
                  cell: false,
                }}
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
                        <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                        &nbsp; More Filter
                      </Button>
                    </div>
                    <div className="col-sm-6 d-flex align-items-center justify-content-center">
                      <div className="col-3">
                        {checkPrivialgeGroup("AssetSMICB", 1) && (
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
                      <div className="col-3">
                        <Checkbox
                          type="checkbox"
                          id="showInactive"
                          name="showInactive"
                          defaultChecked={showInactive}
                          value={showInactive}
                          onChange={onInactiveCheckBox}
                          label={"Show Inactive"}
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
                <Column
                  field="dateReceived"
                  title="Date Received"
                  filter="date"
                  editor="date"
                  format="{0:MM/dd/yyyy}"
                  filterCell={ColumnDatePicker}
                  cell={myCustomDateCell}
                />
                <Column field="areaName" title="Area Name" />
                <Column field="buildingName" title="Building Name" />
                <Column field="description" title="Asset Name" />
                <Column
                  field="cost"
                  title="Value"
                  format="{0:c2}"
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
                  cell={ColumnFormCurrencyTextBox}
                />
                {columnShow && (
                  <Column
                    field="createdDate"
                    title="Created Date"
                    filterable={false}
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
                  <Column
                    field="createdBy"
                    title="Created By"
                    filterable={false}
                  />
                )}
                {columnShow && (
                  <Column
                    field="modifiedDate"
                    title="Modified Date"
                    filterable={false}
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
                {columnShow && (
                  <Column
                    field="modifiedBy"
                    title="Modified By"
                    filterable={false}
                  />
                )}
                <Column cell={CommandCell} filterable={false} />
              </Grid>

              <ContextMenu
                show={show}
                offset={offset.current}
                onSelect={handleOnSelect}
                onClose={handleCloseMenu}
              >
                {checkPrivialgeGroup("EditAssetsCM", 3) && (
                  <MenuItem
                    text="Edit Assets"
                    data={{
                      action: "edit",
                    }}
                    icon="edit"
                  />
                )}
              </ContextMenu>
            </div>
          )}
        </>
      )}
    </>
  );
}
