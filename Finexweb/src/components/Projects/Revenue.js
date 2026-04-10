import {
  GridColumn as Column,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { AccountReceivable } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import { projectService } from "../../services/ProjectServices";
import Constants from "../common/Constants";
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

const MyCommandCell = (props) => {
  const { dataItem } = props;
  const inEdit = dataItem[props.editField];
  const isNewItem = dataItem.id == undefined || dataItem.id == 0;
  return inEdit ? (
    <td className="k-command-cell">
      <button
        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-grid-save-command"
        onClick={() =>
          isNewItem ? props.update(dataItem) : props.update(dataItem)
        }
      >
        {isNewItem ? "Add" : "Update"}
      </button>
      {!isNewItem && (
        <button
          className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-grid-cancel-command"
          onClick={() =>
            isNewItem ? props.discard(dataItem) : props.cancel(dataItem)
          }
        >
          Cancel
        </button>
      )}
    </td>
  ) : (
    <td className="k-command-cell">
    </td>
  );
};

const Revenue = ({ project }) => {
  const [data, setData] = useState(null);
  const [typeOfWorkList, setTypeOfWorkList] = useState([]);
  const [filter, setFilter] = React.useState();
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageTotal, setPageTotal] = React.useState();
  const [searchText, setsearchText] = React.useState("");
  const [showFilter, setshowFilter] = React.useState(false);
  const [columnShow, setColumnShow] = useState(false);

  useEffect(() => {
    BindRevenueGrid();
    projectService
      .fetchTypeOfWorkList()
      .then((data) => {
        setTypeOfWorkList(data);
      })
      .catch(() => { });
  }, [project]);
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const getRevenueList = () => {
    projectService
      .getRevenueList(project.id)
      .then((data) => {
        data = data.map((element) => {
          element.revDate = new Date(element.revDate);
          return element;
        });
        const newDataItem = {
          inEdit: true,
          Discontinued: false,
          id: 0,
        };
        setData([...data, newDataItem]);
      })
      .catch(() => { });
  };
  const initialSort = [
    {
      field: "dateReceived",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";

    setBindRevenueGrid({
      ...bindRevenueGrid,
      search: searchText,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindRevenueGrid, setBindRevenueGrid] = useState(null);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindRevenueGrid) {
        BindRevenueGrid(
          bindRevenueGrid.RevenueContrib,
          bindRevenueGrid.dateReceived,
          bindRevenueGrid.revreceiptno,
          bindRevenueGrid.revAmount,
          bindRevenueGrid.description,
          bindRevenueGrid.search,
          bindRevenueGrid.cskip,
          bindRevenueGrid.ctake == "All" ? 0 : bindRevenueGrid.ctake,
          bindRevenueGrid.desc,
          bindRevenueGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindRevenueGrid]);

  const BindRevenueGrid = (
    RevenueContrib = "",
    dateReceived = "",
    revreceiptno = "",
    revAmount = "",
    description = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "dateReceived"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        AccountReceivable.accountRevenueByProject +
        `/${project.id}?skip=${cskip}&take=${ctake}&description=${description}&sortKey=${sortKey}&RevenueContrib=${RevenueContrib}&dateReceived=${dateReceived}&revreceiptno=${revreceiptno}&search=${search}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        data = data.map((element) => {
          element.revDate = new Date(element.revDate);
          return element;
        });
        setPageTotal(response.data.total);
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: response.data.total,
          });
        }
        if (pageSizeValue == 0) {
          setPageSizeValue(initialDataState);
        }
        setData([...data]);
      })
      .catch(() => { });
  };
  const editField = "inEdit";

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      remove={remove}
      discard={discard}
      update={update}
      cancel={cancel}
      editField={editField}
    />
  );
  const remove = (dataItem) => {
    projectService
      .deleteRevenueList(dataItem.id)
      .then((data) => {
        BindRevenueGrid();
      })
      .catch(() => { });
  };
  const update = (dataItem) => {
    dataItem.inEdit = false;
    if (dataItem.id != 0) {
      let newRevenueData = {
        id: dataItem.id,
        orG_ID: 7,
        revBDAmount: dataItem.revBDAmount,
        revBDCheckNo: dataItem.revBDCheckNo,
        revBDCAC: 1,
        revBDIHAC: "12482383",
        revBDType: 1,
        revBDSACR: "26236474272",
        revId: 1,
        revDate: dataItem.revDate,
        bdDescription: dataItem.bdDescription,
        invoiceNo: "1267236234",
        certLicenseNo: "2838248",
        recieptLineId: 1,
        customerId: 1,
        invoicelineId: 1,
        payIn: "test",
        projectId: project.id,
        otherDescriptionId: 1,
      };
      projectService
        .editRevenueList(project.id, newRevenueData)
        .then((data) => {
          getRevenueList();
        })
        .catch(() => { });
    } else {
      let newRevenueData = {
        id: 0,
        orG_ID: 7,
        revBDAmount: dataItem.revBDAmount,
        revBDCheckNo: dataItem.revBDCheckNo,
        revBDCAC: 1,
        revBDIHAC: "12482383",
        revBDType: 1,
        revBDSACR: "26236474272",
        revId: 1,
        revDate: dataItem.revDate,
        bdDescription: dataItem.bdDescription,
        invoiceNo: "1267236234",
        certLicenseNo: "2838248",
        recieptLineId: 1,
        customerId: 1,
        invoicelineId: 1,
        payIn: "test",
        projectId: project.id,
        otherDescriptionId: 1,
      };
      projectService
        .addRevenueList(project.id, newRevenueData)
        .then((data) => {
          BindRevenueGrid();
        })
        .catch(() => { });
    }
  };

  const discard = (dataItem) => {
    const newData = [...data];
    newData.splice(0, 1);
    setData(newData);
  };
  const cancel = (dataItem) => {
    let newData = data.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: false,
        }
        : item
    );
    setData(newData);
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
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({ ...page, skip: 0 });
    setBindRevenueGrid({
      ...bindRevenueGrid,
      cskip: 0,
      search: value,
      RevenueContrib: undefined,
      dateReceived: undefined,
      revreceiptno: undefined,
      revAmount: undefined,
      description: undefined,
    });
  };
  const filterChange = (event) => {
    var RevenueContrib = "";
    var dateReceived = "";
    var revreceiptno = "";
    var revAmount = "";
    var description = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (
          event.filter.filters[i].field ==
          "countyRevenueContrib.revenue_Contib"
        ) {
          RevenueContrib = event.filter.filters[i].value;
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
        if (event.filter.filters[i].field == "rev_Receipt_No") {
          revreceiptno = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "rev_Amount") {
          revAmount = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "rev_Description") {
          description = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindRevenueGrid({
      ...bindRevenueGrid,
      RevenueContrib: RevenueContrib,
      dateReceived: dateReceived,
      revreceiptno: revreceiptno,
      revAmount: revAmount,
      description: description,
      search: undefined,
      cskip: 0,
    });
    setFilter(event.filter);
  };
  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindRevenueGrid({
        ...bindRevenueGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindRevenueGrid({
        ...bindRevenueGrid,
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
      {checkPrivialgeGroup("PCRG", 1) && (
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
                    {checkPrivialgeGroup("RSMICB", 1) && (
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
              field="dateReceived"
              title="Date Received"
              editor="date"
              format="{0:d}"
              cell={(props) => {
                const [year, month, day] = props.dataItem?.dateReceived
                  ? props.dataItem?.dateReceived.split("T")[0].split("-")
                  : [null, null, null];
                return (
                  <td>
                    {props.dataItem?.dateReceived
                      ? `${month}/${day}/${year}`
                      : null}
                  </td>
                );
              }}
            />
            <Column field="rev_Receipt_No" title="Receipt" />
            <Column
              field="countyRevenueContrib.revenue_Contib"
              title="Received From"
            />
            <Column field="rev_Description" title="Description" />
            <Column
              field="rev_Amount"
              title="Amount"
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
                var amount = props.dataItem?.rev_Amount || 0;
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
            {checkPrivialgeGroup("PCRCC", 3) && (
              <Column cell={CommandCell} width="150px" filterable={false} />
            )}
          </Grid>
        </>
      )}
    </>
  );
};

export default Revenue;
