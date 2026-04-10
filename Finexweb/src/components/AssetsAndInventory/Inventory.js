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

export default function Inventory() {
  const [filter, setFilter] = useState();
  const [showFilter, setshowFilter] = useState(false);
  const [InventoryData, setInventoryData] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [responsibleList, setResponsibleList] = useState([]);
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = useState(initialDataState);

  const [pageSizeValue, setPageSizeValue] = useState(initialDataState.take);

  const [pageTotal, setPageTotal] = useState();
  const [, setsearchText] = useState("");
  const [show, setShow] = useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [showInactive, setshowInactive] = useState(false);
  const offset = useRef({
    left: 0,
    top: 0,
  });

  const vendorRef = useRef([]);
  const [selectedRowId, setselectedRowId] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchData() {
      await getResPerson();
      await BindDataGrid();
      await getAssetsLookup();
    }
    fetchData();
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
        setProgramList(sortData["Program"]);
        setBuildingList(sortData["Building"]);
        setAreaList(sortData["Area"]);
      })
      .catch(() => { });
  };

  const getResPerson = async () => {
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
  const onInactiveCheckBox = (event) => {
    setshowInactive(event.target.value);

    let iactive = event.target.value ? "N" : "Y";
    setBindDataGrid({
      ...bindDataGrid,
      isActive: iactive,
    });
  };

  const DetailComponent = (props) => {
    const ldata = [props.dataItem.assetLocation];
    if (ldata) {
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
            <Column
              field="program"
              title="Program"
              cell={(props) => {
                return <td>{props.dataItem?.program || ""}</td>;
              }}
            />
            <Column
              field="building"
              title="Building"
              cell={(props) => {
                return <td>{props.dataItem?.building || ""}</td>;
              }}
            />
            <Column
              field="area"
              title="Area"
              cell={(props) => {
                return <td>{props.dataItem?.area || ""}</td>;
              }}
            />
            <Column
              field="resPer"
              title="Reponsible Person"
              cell={(props) => {
                return <td>{props.dataItem?.resPer || ""}</td>;
              }}
            />
          </Grid>
        </div>
      );
    }
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "asc",
    },
  ];

  const [sort, setSort] = useState(initialSort);
  const [bindDataGrid, setBindDataGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindDataGrid) {
        BindDataGrid(
          bindDataGrid.inventoryNo,
          bindDataGrid.itemDescription,
          bindDataGrid.dateReceived,
          bindDataGrid.manufacturer,
          bindDataGrid.supplier,
          bindDataGrid.search,
          bindDataGrid.cskip,
          bindDataGrid.ctake == "All" ? 0 : bindDataGrid.ctake,
          bindDataGrid.desc,
          bindDataGrid.sortKey,
          bindDataGrid.isActive
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindDataGrid]);

  const onSortChange = (event) => {
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setSort(event.sort);

    setBindDataGrid({
      ...bindDataGrid,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const BindDataGrid = async (
    inventoryNo = "",
    itemDescription = "",
    dateReceived = "",
    manufacturer = "",
    supplier = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "modifiedDate",
    isActive = 'Y'
  ) => {
    axiosInstance({
      method: "Post",
      url:
        InventoryEndPoints.InventoryListWithFilter +
        "inventoryNo=" +
        inventoryNo +
        "&&itemDescription=" +
        itemDescription +
        "&&dateReceived=" +
        dateReceived +
        "&&manufacturer=" +
        manufacturer +
        "&&supplier=" +
        supplier +
        "&&assetFlag=" +
        false +
        "&&isActive="+ 
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
        data.map((e) => {
          e.supplier = e?.supplier
            ? vendorRef.current.find((c) => c.id == e.supplier)?.name
            : "";
          return e;
        });
        setInventoryData(data);
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.inventoryNo,
            id: data.id,
          };
          itemsData.push(items);
        });
      })
      .catch(() => { });
  };

  const filterChange = (event) => {
    var inventoryNo = "";
    var itemDescription = "";
    var dateReceived = "";
    var manufacturer = "";
    var supplier = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "inventoryNo") {
          inventoryNo = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "itemDescription") {
          itemDescription = event.filter.filters[i].value;
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
        if (event.filter.filters[i].field == "manufacturer") {
          manufacturer = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "vendor.name") {
          supplier = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindDataGrid({
      ...bindDataGrid,
      inventoryNo,
      itemDescription,
      dateReceived,
      manufacturer,
      supplier,
      search: undefined,
      cskip: 0,
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
        take: InventoryData.length,
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
      search: value,
      inventoryNo: undefined,
      itemDescription: undefined,
      dateReceived: undefined,
      manufacturer: undefined,
      supplier: undefined,
    });
  };

  const addInventoryToggleDialog = () => {
    let id = 0;
    let action = "add";
    navigate("/addinventory", { state: { id, action, page } });
  };

  const getInventoryById = (id) => {
    axiosInstance({
      method: "GET",
      url: InventoryEndPoints.Inventory.replace("#InventoryId#", id),
      withCredentials: false,
    })
      .then((response) => {
        let data = InventoryData.slice();
        let index = data.findIndex((d) => d.id == id);
        if (response.data.assetLocation != null) {
          if (response.data.assetLocation.program) {
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
        setInventoryData(data);
      })
      .catch(() => { });
  };

  const expandChange = (event) => {
    setInventoryData([...InventoryData]);

    let id = event.dataItem.id;
    getInventoryById(id);
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

  const CustomItem = (props) => {
    return (
      <DrawerItem {...props}>
        <img src={props.profileimg} height={50} width={50} alt={""}></img>
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

  const drawerhandleClick = () => {
    setDrawerExpanded((prevState) => !prevState);
  };

  const drawerhandleSelect = (ev) => {
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
          navigate("/addinventory", { state: { id, action, page } });
          break;

        case "history":
          drawerhandleClick();
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
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
    let newData = InventoryData.map((item) => {
      if (item.id == Object.keys(newSelectedState)) {
        item.expanded = !item.expanded;
        tmpId = item.id;
        setselectedRowId(tmpId);
        getInventoryById(tmpId);
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
    setInventoryData(newData);
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Inventory')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("InventoryM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Assets/Inventory
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Inventory
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Inventory
              </li>
            </ol>
          </nav>
          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>Inventory</h3>
            </div>
            <div className="col-sm-4 text-end">
              {checkPrivialgeGroup("AddInventoryB", 2) && (
                <Button
                  themeColor={"primary"}
                  onClick={addInventoryToggleDialog}
                >
                  <i className="fa-solid fa-plus"></i> Add New Inventory
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
              item={CustomItem}
              onSelect={drawerhandleSelect}
              onOverlayClick={drawerhandleSelect}
            >
              <DrawerContent></DrawerContent>
            </Drawer>
          </div>

          {checkPrivialgeGroup("InventoryG", 1) && (
            <div className="row mt-3">
              <Grid
                resizable={true}
                filterable={showFilter}
                detail={DetailComponent}
                expandField="expanded"
                onExpandChange={expandChange}
                filter={filter}
                onFilterChange={filterChange}
                data={InventoryData}
                skip={page.skip}
                take={page.take}
                total={pageTotal}
                pageable={{
                  buttonCount: 4,
                  pageSizes: [10, 15, 50, "All"],
                  pageSizeValue: pageSizeValue,
                }}
                onPageChange={pageChange}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                onSelectionChange={onSelectionChange}
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
                        {checkPrivialgeGroup("ISMICB", 1) && (
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

                <Column field="inventoryNo" title="Inventory Number" />
                <Column field="itemDescription" title="Inventory Description" />
                <Column field="areaName" title="Area Name" />
                <Column field="buildingName" title="Building Name" />
                <Column
                  field="dateReceived"
                  title="Date Received"
                  filter="date"
                  editor="date"
                  format="{0:MM/dd/yyyy}"
                  cell={myCustomDateCell}
                  filterCell={ColumnDatePicker}
                />
                <Column field="manufacturer" title="Manufacturer" />
                {/* <Column field="vendor.name" title="Vendor Name" /> */}
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
                {checkPrivialgeGroup("EditInventoryCM", 3) && (
                  <MenuItem
                    text="Edit Inventory"
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
