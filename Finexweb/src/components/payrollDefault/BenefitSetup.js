import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import {
  ContextMenu,
  MenuItem,
  TabStrip,
  TabStripTab,
} from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  payrollEndpoints,
  PayrollEndPoints
} from "../../EndPoints";
import { AddBenefitPackage } from "./modals/AddBenefitPackage";
import { AddBenefits } from "./modals/AddBenefits";
import { AddBenefitSetup } from "./modals/AddBenefitSetup";

import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";
import { UpdateBenefitsrate } from "./modals/UpdateBenefitsRate";

export default function BenefitSetup() {
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };

  const [cacId, setCacId] = useState("");
  const [benefitPackageLinkID, setBenefitPackageLinkID] = useState("");

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteVisiblePackage, setDeleteVisiblePackage] = useState(false);
  const [selected, setSelected] = React.useState(0);
  const [benefitSetupData, setBenefitSetupData] = React.useState([]);
  const [packageData, setPackageData] = React.useState([]);
  const [editBenefitPackages, setEditBenefitPackages] = useState(false);
  const [pageTitle, setPageTitle] = useState("Benefit Setup");
  const [benefitSetupPopupVisible, setBenefitSetupPopupVisible] =
    useState(false);
  const [updateBenefitSetupPopupVisible, setUpdateBenefitSetupPopupVisible] =
    useState(false);
  const [benefitsPopupVisible, setBenefitsPopupVisible] = useState(false);
  const [benefitPackagePopupVisible, setBenefitPackagePopupVisible] =
    useState(false);
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageTotal, ] = React.useState();
  const [, setsearchText] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [showPackage, setShowPackage] = React.useState(false);
  const [selectedBenefitRowId, setSelectedBenefitRowId] = React.useState(0);
  const [selectedPackageRowId, setSelectedPackageRowId] = React.useState(0);
  const [filter, setFilter] = React.useState();
  const [columnShowBenefitSetup, setColumnShowBenefitSetup] = useState(false);
  const [columnShowBenefitPackage, setColumnShowBenefitPackage] =
    useState(false);

  const BenefitSetupOffset = React.useRef({
    left: 0,
    top: 0,
  });

  const [page, setPage] = useState(initialDataState);
  const [bindBenefitSetupGrid, setBindBenefitSetupGrid] = useState({});
  const [showFilter, setshowFilter] = useState(false);
  const [showInactive, setshowInactive] = useState(false);

  const [pageSizeValuePackage, setPageSizeValuePackage] = useState(
    initialDataState.take
  );
  const [bindBenefitPackageGrid, setBindBenefitPackageGrid] = useState({});
  const [showInactivePackage, setshowInactivePackage] = useState(false);
  const [pagePackage, setPagePackage] = useState(initialDataState);
  const [PackagePageTotal,] = useState();
  const [showFilterPackage, setShowFilterPackage] = useState(false);
  const [BenefitPackageFilter, setBenefitPackageFilter] = React.useState();

  const [, setsearchTextPackage] = React.useState("");

  const BenefitPackageOffset = React.useRef({
    left: 0,
    top: 0,
  });

  useEffect(() => {

    const getData = setTimeout(() => {
      if (bindBenefitSetupGrid) {
        handleBindBenefitSetup(
          bindBenefitSetupGrid.benefit,
          bindBenefitSetupGrid.percent,
          bindBenefitSetupGrid.description,
          bindBenefitSetupGrid.search,
          bindBenefitSetupGrid.benefitType,
          bindBenefitSetupGrid.amount,
          bindBenefitSetupGrid.cskip,
          bindBenefitSetupGrid.ctake,
          bindBenefitSetupGrid.isActive
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindBenefitSetupGrid]);

  const handleBindBenefitSetup = async (
    benefit = "",
    percent = "",
    description = "",
    search = "",
    benefitType = "",
    amount = "",
    cskip = page.skip,
    ctake = page.take,
    isActive = false,
    desc = "true",
    sortKey = "modifiedDate"
  ) => {
    try {
      const result = await axiosInstance({
        method: "GET",
        url:
          PayrollEndPoints.Benefits +
          `?inActive=${isActive}&skip=${cskip}&take=${ctake}&search=${search}&benefitFilter=${benefit}&benefitsPercentFilter=${percent}&amountFilter=${amount}&typeOfBenefitFilter=${benefitType}`,
        withCredentials: false,
      });
      setBenefitSetupData(result?.data);
    } catch (e) {
      console.log(e, "error");
    }
  };

  //  bebefit  package
  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindBenefitPackageGrid) {
        handleBindBenefitPackage(
          bindBenefitPackageGrid.search,
          bindBenefitPackageGrid.cskip,
          bindBenefitPackageGrid.ctake,
          bindBenefitPackageGrid.isActive,
          bindBenefitPackageGrid.benMacroName
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindBenefitPackageGrid]);

  const handleBindBenefitPackage = async (
    search = "",
    cskip = page.skip,
    ctake = page.take,
    isActive = false,
    benMacroName = "",
    desc = "true",
    sortKey = "modifiedDate"
  ) => {
    try {
      if (!benefitPackagePopupVisible) {
        const result = await axiosInstance({
          method: "GET",
          url:
            PayrollEndPoints.Packages +
            `?isActive=${isActive}&skip=${cskip}&take=${ctake}&search=${search}&benMacroNameFilter=${benMacroName}`,
          withCredentials: false,
        });
        setPackageData(result?.data?.data);
      }
    } catch (e) {
      console.log(e, "error");
    }
  };

  const handleSelect = (e) => {
    setSelected(e.selected);

    switch (e.selected) {
      case 0:
        setPageTitle("Benefit Setup");
        break;
      case 1:
        (async () => {
          try {
            const result = await axiosInstance({
              method: "GET",
              url: PayrollEndPoints.Packages,
              withCredentials: false,
            });

            setPackageData(result?.data?.data || []);
          } catch (e) {
            console.log(e, "error");
          }
        })();
        setPageTitle("Benefit Packages");
        break;
      default:
    }
  };
  const addBenefitSetup = () => {
    setSelectedBenefitRowId(0);
    setBenefitSetupPopupVisible(true);
  };

  const UpdateBenefitSetup = () => {
    setSelectedBenefitRowId(0);
    setUpdateBenefitSetupPopupVisible(true);
  };

  const addBenefitPackage = () => {
    setBenefitPackagePopupVisible(true);
  };

  // Set More Filters
  const MoreFilterBenefitSetup = () => {
    setshowFilter(!showFilter);
  };
  const MoreFilterBenefitPackage = () => {
    setShowFilterPackage(!showFilterPackage);
  };

  const onCheckBoxBenefitSetup = (event) => {
    setColumnShowBenefitSetup(!columnShowBenefitSetup);
  };
  const onCheckBoxBenefitPackage = (event) => {
    setColumnShowBenefitPackage(!columnShowBenefitPackage);
  };

  const getPackageBenefitsById = (id) => {
    (async () => {
      try {
        const result = await axiosInstance({
          method: "GET",
          url: PayrollEndPoints.BenefitsByPackageID.replace("#ID#", id),
          withCredentials: false,
        });
        let data = packageData.slice();
        let index = data.findIndex((d) => d.id == id);
        if (data && data.length) {
          data[index].benefits = result.data;
        }

        setPackageData(data);
      } catch (e) {
        console.log(e, "error");
      }
    })();
  };

  const expandChange = (event) => {
    let id = event.dataItem.id;
    getPackageBenefitsById(id);
    event.dataItem.expanded = event.value;
    if (!event.value) {
      return;
    }
  };

  const DetailComponent = (props) => {
    const ldata = props.dataItem.benefits;

    if (ldata && ldata != null) {
      return (
        <div>
          <Grid data={ldata} dataItemKey={"id"}>
            <GridColumn field="benefitsName" title="Benefit Name" />
            <GridColumn
              field="benefitsPercent"
              title="Percent"
              cell={(props) => {
                let Percent = props.dataItem?.benefitsPercent
                  ? props.dataItem?.benefitsPercent + "%"
                  : null;
                return <td>{Percent}</td>;
              }}
            />
            <GridColumn
              field="amount"
              title="Amount"
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
              cell={(props) => {
                var amount = props.dataItem?.amount;
                amount =
                  "$" +
                  amount?.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                return <td className="!k-text-right">{`${amount}`}</td>;
              }}
            />
            <GridColumn field="countyAccountCode" title="County Account Code" />
            <GridColumn cell={CommandCell} filterable={false} />
          </Grid>
          <ContextMenu
            show={show}
            offset={BenefitSetupOffset.current}
            onSelect={getSelectedBenefitRowIdDetails}
            onClose={handleCloseMenu}
          >
            {checkPrivialgeGroup("EditBPCM", 3) && (
              <MenuItem
                text="Edit Benefit"
                data={{
                  action: "edit-benefit-package",
                  listData: ldata,
                }}
                icon="edit"
                onClick={(e) => {
                  console.log("ContextMenu", e);
                }}
              />
            )}

            {checkPrivialgeGroup("DeleteBPCM", 4) && (
              <MenuItem
                text="Delete Benefit"
                data={{
                  action: "delete-benefit-package",
                  listData: ldata,
                }}
                icon="delete"
              />
            )}
          </ContextMenu>
        </div>
      );
    }
  };

  //---------- benefit package code start ------------
  const handleContextMenuOpenPackage = (e) => {
    e.preventDefault();
    setSelectedPackageRowId(e.currentTarget.id);
    BenefitPackageOffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShowPackage(true);
  };
  const handleContextMenuPackage = (props) => {
    handleContextMenuOpenPackage(props);
  };
  const handleCloseMenuPackage = () => {
    setShowPackage(false);
    setBenefitPackagePopupVisible(false);
    setSelectedPackageRowId(0);
  };

  const CommandCellPackage = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleContextMenuPackage}
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
  const toggleDeleteDialogPackage = () => {
    setDeleteVisiblePackage(!deleteVisiblePackage);
  };
  const DeleteOnClickPackage = () => {
    let id = selectedPackageRowId;
    (async () => {
      try {
        await axiosInstance({
          method: "Delete",
          url: PayrollEndPoints.PackagesById.replace("#ID#", id),
          withCredentials: false,
        });
        const result1 = await axiosInstance({
          method: "GET",
          url: PayrollEndPoints.Packages,
          withCredentials: false,
        });

        setPackageData(result1?.data?.data || []);
        toggleDeleteDialogPackage();
      } catch (e) {
        console.log(e, "error");
      }
    })();
  };

  const onInactiveCheckBox = (event) => {
    setShow(false);
    setshowInactive(!showInactive);
    setBindBenefitSetupGrid({
      ...bindBenefitSetupGrid,
      isActive: event.value,
    });
  };

  const onInactiveCheckBoxPackage = (event) => {
    setShow(false);
    setshowInactivePackage(!showInactivePackage);
    setBindBenefitPackageGrid({
      ...bindBenefitPackageGrid,
      isActive: event.value,
    });
  };

  const getSelectedPackageRowIdDetails = (e) => {
    let id = selectedPackageRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          addBenefitPackage();
          setShowPackage(false);
          break;
        case "delete":
          toggleDeleteDialogPackage();
          break;
        case "addPackageBenefit":
          setBenefitSetupPopupVisible(true);
          break;
        case "addBenefits":
          setBenefitsPopupVisible(true);
          break;
        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShowPackage(false);
  };
  // ---------- benefit package code end ------------
  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setSelectedBenefitRowId(e.currentTarget.id);
    BenefitSetupOffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };
  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };
  const handleCloseMenu = () => {
    setShow(false);
    setBenefitSetupPopupVisible(false);
    setSelectedBenefitRowId(0);
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
  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };
  const DeleteOnClick = () => {
    let id = selectedBenefitRowId;
    (async () => {
      try {

        if (benefitPackageLinkID > 0) {
          await axiosInstance({
            method: "Delete",
            url: PayrollEndPoints.BenefitPackageLinkById.replace("#ID#", benefitPackageLinkID),
            withCredentials: false,
          });
        } else {
          await axiosInstance({
            method: "Delete",
            url: PayrollEndPoints.BenefitsById.replace("#ID#", id),
            withCredentials: false,
          });
        }
        //setPackageData(data)
        const result1 = await axiosInstance({
          method: "GET",
          url: PayrollEndPoints.Benefits,
          withCredentials: false,
        });
        setBenefitSetupData(result1);
        toggleDeleteDialog();
        handleBindBenefitSetup();
      } catch (e) {
        console.log(e, "error");
      }
    })();
  };
  const getSelectedBenefitRowIdDetails = (e) => {
    let id = selectedBenefitRowId;
    let filterData;
    if (e.item.data?.listData) {
      filterData = e.item.data.listData.filter((el) => el.id == Number(id));
    }

    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          setBenefitSetupPopupVisible(true);
          setShow(false);
          break;
        case "edit-benefit-package":
          setCacId(filterData[0].countyAccountCode);
          setBenefitPackageLinkID(filterData[0].benefitPackageLinkID);
          setEditBenefitPackages(true);
          setShow(false);
          break;
        case "delete":
          setBenefitPackageLinkID(0);
          toggleDeleteDialog();
          break;
        case "delete-benefit-package":
          setBenefitPackageLinkID(filterData[0].benefitPackageLinkID);
          toggleDeleteDialog();
          break;
        case "inactive":
          axiosInstance({
            method: "PUT",
            url: payrollEndpoints.BenefitUpdateStatus + `/${id}?status=true`,
            withCredentials: false,
          })
            .then((response) => {
              handleBindBenefitSetup();
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

  const searchBenefitSetup = (e) => {
    let value = e.target.value;
    setsearchText(value);

    setBindBenefitSetupGrid({
      ...bindBenefitSetupGrid,
      search: value,
      cskip: 0,
      benefit: undefined,
      percent: undefined,
      description: undefined,
      benefitType: undefined,
      amount: undefined,
    });

    setPage({
      ...page,
      skip: 0,
    });
  };

  const searchBenefitPackage = (e) => {
    let value = e.target.value;
    setsearchTextPackage(value);

    setBindBenefitPackageGrid({
      ...bindBenefitPackageGrid,
      search: value,
      cskip: 0,
    });

    setPagePackage({
      ...pagePackage,
      skip: 0,
    });
  };

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindBenefitSetupGrid({
        ...bindBenefitSetupGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindBenefitSetupGrid({
        ...bindBenefitSetupGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: benefitSetupData?.total,
      });
    }
  };

  const packagePageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValuePackage(event.page.take);
      setBindBenefitPackageGrid({
        ...bindBenefitPackageGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPagePackage({
        ...event.page,
      });
    } else {
      setPageSizeValuePackage("All");
      setBindBenefitPackageGrid({
        ...bindBenefitPackageGrid,
        cskip: 0,
        ctake: 0,
      });
      setPagePackage({
        skip: 0,
        take: packageData?.length,
      });
    }
  };

  const benefitSetupFilterChange = (event) => {
    var benefit = "";
    var percent = "";
    var description = "";
    var benefitType = "";
    var amount = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "benefitsName") {
          benefit = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "benefitsPercent") {
          percent = +event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "amount") {
          amount = +event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "benefitType.typeOfBenefit") {
          benefitType = event.filter.filters[i].value;
        }
      }
    }

    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindBenefitSetupGrid({
      ...bindBenefitSetupGrid,
      search: undefined,
      cskip: 0,
      benefit,
      percent,
      description,
      benefitType,
      amount,
    });
    setFilter(event.filter);
  };

  const benefitPackageFilterChange = (event) => {
    var benMacroName = "";

    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "benMacroName") {
          benMacroName = event.filter.filters[i].value;
        }
      }
    }
    setPagePackage({
      skip: 0,
      take: pageSizeValuePackage,
    });
    setBindBenefitPackageGrid({
      ...bindBenefitPackageGrid,
      search: undefined,
      benMacroName,
      cskip: 0,
    });
    setBenefitPackageFilter(event.filter);
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollOrganizationDataSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <React.Fragment>
      {checkPrivialgeGroup('BSM', 1) &&
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Payroll
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Payroll Details
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Benefit Setup
              </li>
            </ol>
          </nav>
          <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
            <div className="d-flex k-flex-column">
              <h1>{pageTitle}</h1>
            </div>
            {checkPrivialgeGroup("AddPRBSB", 4) && <div>
              <Button
                className="k-button k-button-lg k-rounded-lg"
                style={{ marginRight: '10px' }}
                themeColor={"primary"}
                onClick={UpdateBenefitSetup}
              >
                Update Benefit Rate
              </Button>
              {selected == 0 && (
                <Button
                  className="k-button k-button-lg k-rounded-lg"
                  themeColor={"primary"}
                  onClick={addBenefitSetup}
                >
                  Add Benefit Setup
                </Button>
              )}

              {selected == 1 && (
                <Button
                  className="k-button k-button-lg k-rounded-lg"
                  themeColor={"primary"}
                  onClick={addBenefitPackage}
                >
                  Add Benefit Package
                </Button>
              )}
            </div>}
          </div>

          <TabStrip className="app-tab" selected={selected} onSelect={handleSelect}>
            {checkPrivialgeGroup("BSTab", 1) && <TabStripTab title="Benefit Setup">
              <div className="mt-3">
                {checkPrivialgeGroup("BSG", 3) && <Grid
                  resizable={true}
                  data={benefitSetupData}
                  expandField="expanded"
                  dataItemKey={"id"}
                  filterable={showFilter}
                  selectable={{
                    enabled: true,
                    drag: false,
                    mode: "multiple",
                    cell: true,
                  }}
                  filter={filter}
                  onFilterChange={benefitSetupFilterChange}
                  skip={page.skip}
                  take={page.take}
                  total={pageTotal}
                  onPageChange={pageChange}
                  pageable={{
                    buttonCount: 4,
                    pageSizes: [10, 15, 50, "All"],
                    pageSizeValue: pageSizeValue,
                  }}
                >
                  <GridToolbar>
                    <div className="row col-sm-12 d-flex justify-content-between">
                      <div className="col-sm-6 d-grid gap-3 d-md-block">
                        <Button
                          className="buttons-container-button"
                          fillMode="outline"
                          themeColor={"primary"}
                          onClick={MoreFilterBenefitSetup}
                        >
                          <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                          &nbsp; More Filter
                        </Button>
                      </div>
                      <div className="col-sm-6 gap-5 d-flex align-items-center justify-content-center">
                        <div className="col-sm-6 gap-5 d-flex align-items-end justify-content-end">
                          <Checkbox
                            type="checkbox"
                            name="showInactive"
                            defaultChecked={showInactive}
                            value={showInactive}
                            onChange={onInactiveCheckBox}
                            label={"Show Inactive"}
                          />
                          <Checkbox
                            type="checkbox"
                            name="modifiedBy"
                            defaultChecked={columnShowBenefitSetup}
                            onChange={onCheckBoxBenefitSetup}
                            label={"Modified Info"}
                          />
                        </div>
                        <div className="input-group">
                          <Input
                            className="form-control border-end-0 border"
                            onChange={searchBenefitSetup}
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
                  <GridColumn field="benefitsName" title="Benefit" />
                  <GridColumn
                    field="benefitsPercent"
                    title="Percent"
                    cell={(props) => {
                      let Percent = props.dataItem?.benefitsPercent
                        ? props.dataItem?.benefitsPercent + "%"
                        : null;
                      return <td>{Percent}</td>;
                    }}
                  />
                  <GridColumn
                    field="amount"
                    title="Amount"
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
                    cell={(props) => {
                      var amount = props.dataItem?.amount;
                      amount =
                        "$" +
                        amount
                          ?.toFixed(2)
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                      return <td className="!k-text-right">{`${amount}`}</td>;
                    }}
                  />
                  <GridColumn
                    field="benefitType.typeOfBenefit"
                    title="Benefit Type"
                  />
                  {columnShowBenefitSetup && (
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
                  {columnShowBenefitSetup && (
                    <GridColumn field="createdBy" title="Created By" />
                  )}
                  {columnShowBenefitSetup && (
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
                  {columnShowBenefitSetup && (
                    <GridColumn field="modifiedBy" title="Modified By" />
                  )}
                  <GridColumn cell={CommandCell} filterable={false} />
                </Grid>}
                <ContextMenu
                  show={show}
                  offset={BenefitSetupOffset.current}
                  onSelect={getSelectedBenefitRowIdDetails}
                  onClose={handleCloseMenu}
                >
                  {checkPrivialgeGroup("EditBSCM", 3) && (
                    <MenuItem
                      text="Edit Benefit"
                      data={{
                        action: "edit",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("Fund Grid", 3) && !showInactive && (
                    <MenuItem
                      text="Make Benefit Inactive"
                      data={{
                        action: "inactive",
                      }}
                    />
                  )}
                  {checkPrivialgeGroup("DeleteBSCM", 3) && (
                    <MenuItem
                      text="Delete Benefit"
                      data={{
                        action: "delete",
                      }}
                      icon="delete"
                    />
                  )}
                </ContextMenu>
              </div>
            </TabStripTab>}
            {checkPrivialgeGroup("BPTab", 1) && <TabStripTab title="Benefit Packages">
              <div className="mt-3">
                <fieldset>
                  <div className="row">
                    <div className="col-sm-8 d-flex align-items-center">
                      <h4>Benefit Packages</h4>
                    </div>
                    <div className="col-sm-4 text-end">
                    </div>
                  </div>
                  <br></br>

                  {checkPrivialgeGroup("BPG", 1) && <Grid
                    resizable={true}
                    data={packageData}
                    dataItemKey={"id"}
                    filter={BenefitPackageFilter}
                    filterable={showFilterPackage}
                    detail={DetailComponent}
                    expandField="expanded"
                    onExpandChange={expandChange}
                    onFilterChange={benefitPackageFilterChange}
                    skip={pagePackage.skip}
                    take={pagePackage.take}
                    total={PackagePageTotal}
                    onPageChange={packagePageChange}
                    pageable={{
                      buttonCount: 4,
                      pageSizes: [10, 15, 50, "All"],
                      pageSizeValue: pageSizeValuePackage,
                    }}
                  >
                    <GridToolbar>
                      <div className="row col-sm-12">
                        <div className="col-sm-6 d-grid gap-3 d-md-block">
                          <Button
                            className="buttons-container-button"
                            fillMode="outline"
                            themeColor={"primary"}
                            onClick={MoreFilterBenefitPackage}
                          >
                            <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                            &nbsp; More Filter
                          </Button>
                        </div>
                        <div className="col-sm-6 d-flex align-items-center justify-content-center">
                          <div className="col-3">
                            <Checkbox
                              type="checkbox"
                              name="showInactive"
                              defaultChecked={showInactivePackage}
                              value={showInactivePackage}
                              onChange={onInactiveCheckBoxPackage}
                              label={"Show Inactive"}
                            />

                            {checkPrivialgeGroup("BPSMICB", 1) && (
                              <Checkbox
                                type="checkbox"
                                name="modifiedBy"
                                defaultChecked={columnShowBenefitPackage}
                                onChange={onCheckBoxBenefitPackage}
                                label={"Modified Info"}
                              />
                            )}
                          </div>
                          <div className="input-group">
                            <Input
                              className="form-control border-end-0 border"
                              onChange={searchBenefitPackage}
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
                    <GridColumn field="benMacroName" title="Package Name" />
                    {columnShowBenefitPackage && (
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
                    {columnShowBenefitPackage && (
                      <GridColumn field="createdBy" title="Created By" />
                    )}
                    {columnShowBenefitPackage && (
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
                    {columnShowBenefitPackage && (
                      <GridColumn field="modifiedBy" title="Modified By" />
                    )}
                    <GridColumn cell={CommandCellPackage} filterable={false} />
                  </Grid>}
                  <ContextMenu
                    show={showPackage}
                    offset={BenefitPackageOffset.current}
                    onSelect={getSelectedPackageRowIdDetails}
                    onClose={handleCloseMenuPackage}
                  >
                    {checkPrivialgeGroup("EditBPCM", 3) && (
                      <MenuItem
                        text="Edit Package"
                        data={{
                          action: "edit",
                        }}
                        icon="edit"
                      />
                    )}
                    {checkPrivialgeGroup("DeleteBPCM", 4) && (
                      <MenuItem
                        text="Delete Package"
                        data={{
                          action: "delete",
                        }}
                        icon="delete"
                      />
                    )}

                    {checkPrivialgeGroup("AddBPCM", 2) && (
                      <MenuItem
                        text="Add Benefit"
                        data={{
                          action: "addBenefits",
                        }}
                        icon="plusOutlineIcon"
                      />
                    )}
                  </ContextMenu>
                  <br></br>
                </fieldset>
              </div>
            </TabStripTab>}
          </TabStrip>
          {editBenefitPackages && (
            <AddBenefits
              setBenefitsPopupVisible={setEditBenefitPackages}
              setPackageData={setPackageData}
              selectedPackageRowId={selectedPackageRowId}
              selectedBenefitRowId={selectedBenefitRowId}
              setSelectedPackageRowId={setSelectedPackageRowId}
              cacId={cacId}
              benefitPackageLinkID={benefitPackageLinkID}
            />
          )}
          {benefitSetupPopupVisible && (
            <AddBenefitSetup
              setBenefitSetupPopupVisible={setBenefitSetupPopupVisible}
              setPackageData={setPackageData}
              selectedBenefitRowId={selectedBenefitRowId}
              selectedPackageRowId={selectedPackageRowId}
              handleBindBenefitSetup={handleBindBenefitSetup}
            />
          )}
          {
            updateBenefitSetupPopupVisible && (
              <UpdateBenefitsrate
                onClose={() => setUpdateBenefitSetupPopupVisible(false)}
                benefitData={benefitSetupData}
              />
            )
          }
          {benefitPackagePopupVisible && (
            <AddBenefitPackage
              setBenefitPackagePopupVisible={setBenefitPackagePopupVisible}
              setPackageData={setPackageData}
              selectedPackageRowId={selectedPackageRowId}
              setSelectedPackageRowId={setSelectedPackageRowId}
            />
          )}
          {benefitsPopupVisible && (
            <AddBenefits
              setBenefitsPopupVisible={setBenefitsPopupVisible}
              setPackageData={setPackageData}
              selectedPackageRowId={selectedPackageRowId}
            />
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
                  onClick={DeleteOnClick}
                >
                  Yes
                </Button>
              </DialogActionsBar>
            </Dialog>
          )}
          {deleteVisiblePackage && (
            <Dialog
              title={<span>Please confirm</span>}
              onClose={toggleDeleteDialogPackage}
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
                  onClick={toggleDeleteDialogPackage}
                >
                  No
                </Button>
                <Button
                  themeColor={"primary"}
                  className={"col-12"}
                  onClick={DeleteOnClickPackage}
                >
                  Yes
                </Button>
              </DialogActionsBar>
            </Dialog>
          )}
        </div>}
    </React.Fragment>
  );
}
