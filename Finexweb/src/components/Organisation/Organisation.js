import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  GridColumn as Column,
  Grid,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import {
  ContextMenu,
  MenuItem
} from "@progress/kendo-react-layout";
import {
  eyedropperIcon
} from "@progress/kendo-svg-icons";
import React, { useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  AuthenticationEndPoints,
  CommonEndPoints,
  OrganizationEndPoints,
} from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";
import {
  FormDropDownList,
  FormInput
} from "../form-components";
import {
  showSuccessNotification
} from "../NotificationHandler/NotificationHandler";
import {
  OnlyNumberStringValidator,
  addressValidator,
  contactNumberValidator,
  countyNameValidator,
  emailValidator,
  organisationTypeValidator,
  organisationValidator,
  phoneNumberVaidator,
  taxExemptNumValidator,
  vendorCityAddressValidator,
  vendorStateAddressValidator,
  zipValidator
} from "../validators";

export default function Organization() {
  //Filter
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = React.useState(initialDataState);
  const [pageSizeValue, setPageSizeValue] = React.useState(
    initialDataState.take
  );
  const [pageTotal, setPageTotal] = React.useState();
  const [searchText, setsearchText] = React.useState("");
  const [filter, setFilter] = React.useState();
  const [showFilter, setshowFilter] = React.useState(false);
  const [organizationData, setOrganizationData] = useState([]);
  const [addOrganizationVisible, setAddOrganizationVisible] = useState(false);
  const [viewOrganizationVisible, setViewOrganizationVisible] = useState(false);
  const [formInit, setFormInit] = useState([]);
  const [show, setShow] = React.useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [orgTypeList, setOrgTypeList] = useState([]);
  const [registrationLink, setRegistrationLink] = React.useState(null);
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [selectedRowId, setselectedRowId] = React.useState(0);
  const [deleteVisible, setDeleteVisible] = useState(false);

  React.useEffect(() => {
    BindOrganizationGrid();
    getOrgTypeList();
  }, []);
  const getOrgTypeList = () => {
    axiosInstance({
      method: "GET",
      url: CommonEndPoints.Getcommon + "?id=" + 14,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setOrgTypeList(data);
      })
      .catch(() => { });
  };
  // Sorting changes
  const initialSort = [
    {
      field: "modifiedDate",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  // Sorting changes
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    setBindOrganizationGrid({
      ...bindOrganizationGrid,
      search: searchText,
      cskip: 0,
      ctake: 10,
      desc: direction,
      sortKey: sortColumn,
    });
  };

  const [bindOrganizationGrid, setBindOrganizationGrid] = useState(null);

  React.useEffect(() => {
    const getData = setTimeout(() => {
      if (bindOrganizationGrid) {
        BindOrganizationGrid(
          bindOrganizationGrid.name,
          bindOrganizationGrid.countyName,
          bindOrganizationGrid.addressLine,
          bindOrganizationGrid.contactNumber,
          bindOrganizationGrid.city,
          bindOrganizationGrid.state,
          bindOrganizationGrid.zipCode,
          bindOrganizationGrid.phoneNumber,
          bindOrganizationGrid.taxExemptNum,
          bindOrganizationGrid.search,
          bindOrganizationGrid.cskip,
          bindOrganizationGrid.ctake == "All" ? 0 : bindOrganizationGrid.ctake,
          bindOrganizationGrid.desc,
          bindOrganizationGrid.sortKey
        );
      }
    }, 500);

    return () => clearTimeout(getData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindOrganizationGrid]);

  const BindOrganizationGrid = (
    name = "",
    countyName = "",
    addressLine = "",
    contactNumber = "",
    city = "",
    state = "",
    zipCode = "",
    phoneNumber = "",
    taxExemptNum = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "true",
    sortKey = "name"
  ) => {
    axiosInstance({
      method: "GET",
      url:
        OrganizationEndPoints.Organization +
        `?name=${name}&countyName=${countyName}&addressLine=${addressLine}&contactNumber=${contactNumber}&city=${city}&state=${state}&zipCode=${zipCode}&phoneNumber=${phoneNumber}&taxExemptNum=${taxExemptNum}&search=${search}&skip=${cskip}&take=${ctake}&desc=${desc}&sortKey=${sortKey}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;

        setPageTotal(response.data.total);
        data.map((e) => {
          e.orgnizationLocation.LocId = e.orgnizationLocation.id;
          delete e.orgnizationLocation["id"];
          e = { ...e, ...e.orgnizationLocation };
          return e;
        });
        data.orgType = data?.orgType
          ? orgTypeList.find((c) => c.id == data.orgType)
          : "";
        if (ctake == 0) {
          setPage({
            skip: 0,
            take: response.data.data.length,
          });
        }

        setOrganizationData(data);
      })
      .catch(() => { });
  };

  // Event for Funds Grid Change Filters
  const filterChange = (event) => {
    var name = "";
    var countyName = "";
    var addressLine = "";
    var contactNumber = "";
    var city = "";
    var state = "";
    var zipCode = "";
    var phoneNumber = "";
    var taxExemptNum = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "name") {
          name = event.filter.filters[i].value;
        }
        if (
          event.filter.filters[i].field == "orgnizationLocation.countyName"
        ) {
          countyName = event.filter.filters[i].value;
        }
        if (
          event.filter.filters[i].field == "orgnizationLocation.addressLine"
        ) {
          addressLine = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "orgnizationLocation.city") {
          city = event.filter.filters[i].value;
        }
        if (
          event.filter.filters[i].field == "orgnizationLocation.contactNumber"
        ) {
          contactNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "orgnizationLocation.state") {
          state = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "orgnizationLocation.zipCode") {
          zipCode = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "phoneNumber") {
          phoneNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "taxExemptNum") {
          taxExemptNum = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindOrganizationGrid({
      name: name,
      countyName: countyName,
      addressLine: addressLine,
      contactNumber: contactNumber,
      city: city,
      state: state,
      zipCode: zipCode,
      phoneNumber: phoneNumber,
      taxExemptNum: taxExemptNum,
      cskip: 0,
      ctake: pageSizeValue,
    });
    setFilter(event.filter);
  };
  // Set More Filters
  const MoreFilter = () => {
    setshowFilter(!showFilter);
  };
  //Event of grid page change
  const pageChange = (event) => {
    let sortDetail = sort[0];
    let direction = sortDetail?.dir == "asc" ? false : true;
    let sortColumn = sortDetail?.field ? sortDetail.field : "modifiedDate";
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);
      setBindOrganizationGrid({
        search: searchText,
        cskip: event.page.skip,
        ctake: event.page.take,
        desc: direction,
        sortKey: sortColumn,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");
      setBindOrganizationGrid({
        search: searchText,
        cskip: 0,
        ctake: 0,
        desc: direction,
        sortKey: sortColumn,
      });
      setPage({
        skip: 0,
        take: organizationData.length,
      });
    }
  };
  //Event of grid filter change
  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      skip: 0,
      take: 10,
    });
    setBindOrganizationGrid({
      search: value,
    });
  };
  const addOrganizationToggleDialog = () => {
    setViewOrganizationVisible(false);
    setAddOrganizationVisible(!addOrganizationVisible);

    if (addOrganizationVisible) {
      setFormInit([]);
    }
  };
  const viewOrganizationToggleDialog = () => {
    setViewOrganizationVisible(true);
    setAddOrganizationVisible(!addOrganizationVisible);

    if (addOrganizationVisible) {
      setFormInit([]);
    }
  };

  const addOrganizationCodeHandleSubmit = async (dataItem) => {
    if (dataItem.edit) {
      try {
        let orgRequest = {
          id: dataItem.id,
          name: dataItem.name,
          fein: "",
          phoneNumber: dataItem.phoneNumber,
          taxExemptNum: dataItem.taxExemptNum,
          orgType: dataItem.orgType ? dataItem.orgType?.id : null,
        };
        await axiosInstance({
          method: "PUT",
          url: OrganizationEndPoints.Organization + "?id=" + dataItem.id,
          data: orgRequest,
          withCredentials: false,
        });
        let locRequest = {
          id: dataItem.LocId,
          orgId: dataItem.id,
          name: dataItem.name,
          locationNum: "",
          countyName: dataItem.countyName,
          addressLine: dataItem.addressLine,
          contactNumber: dataItem?.contactNumber || "",
          city: dataItem.city,
          state: dataItem.state,
          zipCode: dataItem.zipCode,
        };
        await axiosInstance({
          method: "PUT",
          url:
            OrganizationEndPoints.OrganizationLocation +
            "?id=" +
            dataItem.LocId,
          data: locRequest,
          withCredentials: false,
        });
        showSuccessNotification("Organization Updated Successfully.");
        BindOrganizationGrid(
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          searchText,
          0,
          10,
          "true",
          "name"
        );
        addOrganizationToggleDialog();
      } catch (error) { }
    } else {
      try {
        let orgRequest = {
          id: dataItem.id,
          name: dataItem.name,
          fein: "",
          phoneNumber: dataItem.phoneNumber,
          taxExemptNum: dataItem.taxExemptNum,
          orgType: dataItem.orgType ? dataItem.orgType?.id : null,
        };
        const response = await axiosInstance({
          method: "POST",
          url: OrganizationEndPoints.Organization,
          data: orgRequest,
          withCredentials: false,
        });
        if (response) {
          let locationRequest = {
            id: dataItem.id,
            orgId: response.data.id,
            locationNum: "",
            name: dataItem.name,
            fein: "",
            countyName: dataItem.countyName,
            addressLine: dataItem.addressLine,
            contactNumber: dataItem?.contactNumber || "",
            city: dataItem.city,
            state: dataItem.state,
            zipCode: dataItem.zipCode,
            phoneNumber: dataItem.phoneNumber,
            taxExemptNum: dataItem.taxExemptNum,
            orgType: dataItem.orgType ? dataItem.orgType?.id : null,
          };
          try {
            await axiosInstance({
              method: "POST",
              url: OrganizationEndPoints.OrganizationLocation,
              data: locationRequest,
              withCredentials: false,
            });
            showSuccessNotification("Organization Saved Successfully.");
            BindOrganizationGrid(
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              searchText,
              0,
              10,
              "true",
              "name"
            );
            addOrganizationToggleDialog();
          } catch (error) { }
        }
      } catch (error) { }
    }
  };

  //open ContextMenu for Organization Grid
  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };
  //close ContextMenu for Organization Grid
  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId(0);
  };

  const DeleteOnClick = () => {
    let id = selectedRowId;

    axiosInstance({
      method: "Delete",
      url: OrganizationEndPoints.Organization + "?id=" + id,
      withCredentials: false,
    })
      .then((response) => {
        BindOrganizationGrid();
      })
      .catch(() => { });
  };
  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };

  //Event for Select ContextMenu Item of Grid Data
  const handleOnSelect = async (e) => {
    const config = {};
    const response = await fetch("config.json");
    const data = await response.json();
    Object.assign(config, data);
    let id = selectedRowId;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "edit":
          axiosInstance({
            method: "GET",
            url: OrganizationEndPoints.Organization + "/" + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data.orgnizationLocation.LocId = data.orgnizationLocation.id;
              delete data.orgnizationLocation["id"];
              data = { ...data, ...data.orgnizationLocation };
              data.orgType = data.orgType
                ? orgTypeList.find((c) => c.id == data.orgType)
                : "";
              data.edit = true;
              setFormInit(data);
              addOrganizationToggleDialog();
            })
            .catch(() => { });
          break;
        case "view":
          axiosInstance({
            method: "GET",
            url: OrganizationEndPoints.Organization + "/" + id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              data = { ...data, ...data.orgnizationLocation };
              data.orgType = data.orgType
                ? orgTypeList.find((c) => c.id == data.orgType)
                : "";
              data.edit = true;
              setFormInit(data);
              viewOrganizationToggleDialog();
            })
            .catch(() => { });
          break;
        case "delete":
          toggleDeleteDialog();
          break;
        case "getRegistrationLink":
          const selectedOrg = organizationData.find(
            (org) => org?.id == selectedRowId
          );
          axiosInstance({
            method: "GET",
            url:
              AuthenticationEndPoints.GenerateOrgRegistrationLink +
              "?orgaccountid=" +
              selectedOrg.orgnizationAccount?.id,
            withCredentials: false,
          })
            .then((response) => {
              let data = response.data;
              let link =
                config?.BASE_URL + "/registration?token=" + data.token;
              setRegistrationLink(link);
            })
            .catch(() => { });
          break;
        case "addrolespermission":
          try {
            const selectedOrg = organizationData.find(
              (org) => org?.id == selectedRowId
            );
            axiosInstance({
              method: "POST",
              url:
                AuthenticationEndPoints.AddRolesPermission +
                "?orgaccounttoken=" +
                selectedOrg.orgnizationAccount?.id,
              withCredentials: false,
            })
              .then((response) => {
                showSuccessNotification(
                  "Successfully Added Roles and Permission"
                );
              })
              .catch(() => { });
            break;
          } catch (error) { }
          break;
        case "activateuser":
          toggleDialog();
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };
  const [activeUservisible, setActiveUservisible] = useState(false);
  const toggleDialog = () => {
    setActiveUservisible(!activeUservisible);
  };
  const ActivateUserOnClick = (dataItem) => {
    try {
      const selectedOrg = organizationData.find(
        (org) => org?.id == selectedRowId
      );
      axiosInstance({
        method: "POST",
        url:
          AuthenticationEndPoints.ActivateOrgAdmin +
          "?OrgAccountId=" +
          selectedOrg.orgnizationAccount?.id +
          "&&username=" +
          dataItem.username +
          "&&emailid=" +
          dataItem.email,
        withCredentials: false,
      })
        .then((response) => {
          BindOrganizationGrid();
          toggleDialog();
          showSuccessNotification("Organization Admin Activated Successfully.");
        })
        .catch(() => { });
    } catch (error) { }
  };
  //Click Event bind ContextMenu for Organization Grid
  const handleContextMenu = (props) => {
    handleContextMenuOpen(props);
  };

  //Custom Cell to bind ContextMenu for Organization Grid
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

  const { checkPrivialgeGroup, loading, error } = usePrivilege('Organization')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("ORGM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Organization
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Organization
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Agency Info
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-sm-8 d-flex align-items-center">
              <h3>Organization</h3>
            </div>
            {checkPrivialgeGroup("ORGB", 2) && (
              <div className="col-sm-4 text-end">
                <Button
                  themeColor={"primary"}
                  onClick={addOrganizationToggleDialog}
                >
                  <i className="fa-solid fa-plus"></i> Add New Organization
                </Button>
              </div>
            )}
          </div>
          {checkPrivialgeGroup("ORGG", 1) && (
            <div className="mt-3">
              <Grid
                resizable={true}
                data={organizationData}
                filterable={showFilter}
                filter={filter}
                onFilterChange={filterChange}
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
                        {checkPrivialgeGroup("ORGSMICB", 1) && (
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

                <Column field="name" title="Organization" />
                <Column
                  field="orgnizationLocation.countyName"
                  title="County Name"
                />
                <Column
                  field="orgnizationLocation.addressLine"
                  title="Address Line"
                />
                <Column
                  field="orgnizationLocation.contactNumber"
                  title="Contract No"
                />
                <Column field="orgnizationLocation.city" title="City" />
                <Column field="orgnizationLocation.state" title="State" />
                <Column field="orgnizationLocation.zipCode" title="ZipCode" />
                <Column field="phoneNumber" title="Phone" />
                <Column field="taxExemptNum" title="Tax Exempt No" />
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
                {columnShow && (
                  <Column field="modifiedBy" title="Modified By" />
                )}
                <Column cell={CommandCell} filterable={false} />
              </Grid>

              <ContextMenu
                show={show}
                offset={offset.current}
                onSelect={handleOnSelect}
                onClose={handleCloseMenu}
              >
                {checkPrivialgeGroup("EditORGCM", 3) && (
                  <MenuItem
                    text="Edit Organization"
                    data={{
                      action: "edit",
                    }}
                    svgIcon={eyedropperIcon}
                  />
                )}
                {checkPrivialgeGroup("ViewORGCM", 1) && (
                  <MenuItem
                    text="View Organization"
                    data={{
                      action: "view",
                    }}
                    svgIcon={eyedropperIcon}
                  />
                )}
                {checkPrivialgeGroup("ActivateORGCM", 1) && (
                  <MenuItem
                    text="Activate User"
                    data={{
                      action: "activateuser",
                    }}
                    svgIcon={eyedropperIcon}
                  />
                )}
                {checkPrivialgeGroup("GetRegistrationLinkORGCM", 1) && (
                  <MenuItem
                    text="Get Registration Link"
                    data={{
                      action: "getRegistrationLink",
                    }}
                    svgIcon={eyedropperIcon}
                  />
                )}
                {checkPrivialgeGroup("DefaultRPORGCM", 1) && (
                  <MenuItem
                    text="Add Default Roles&Persmission"
                    data={{
                      action: "addrolespermission",
                    }}
                    svgIcon={eyedropperIcon}
                  />
                )}
              </ContextMenu>
            </div>
          )}

          <div>
            {addOrganizationVisible && (
              <Dialog
                width={500}
                height={"90%"}
                title={
                  <div className="d-flex align-items-center justify-content-center">
                    {viewOrganizationVisible ? (
                      <>
                        <i className="fa-solid fa-eye"></i>
                        <span className="ms-2">View Organization</span>
                      </>
                    ) : formInit?.id ? (
                      <>
                        <i className="fa-solid fa-edit"></i>
                        <span className="ms-2">Edit Organization</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus"></i>
                        <span className="ms-2">Add New Organization</span>
                      </>
                    )}
                  </div>
                }
                onClose={addOrganizationToggleDialog}
              >
                <div className="h-full">
                  <Form
                    onSubmit={addOrganizationCodeHandleSubmit}
                    initialValues={formInit}
                    render={(formRenderProps) => (
                      <FormElement>
                        <fieldset className={"k-form-fieldset"}>
                          <Field
                            id={"name"}
                            name={"name"}
                            label={"Organization*"}
                            component={FormInput}
                            disabled={viewOrganizationVisible}
                            validator={organisationValidator}
                          />
                          <Field
                            id={"countyName"}
                            name={"countyName"}
                            label={"County Name*"}
                            component={FormInput}
                            disabled={viewOrganizationVisible}
                            validator={countyNameValidator}
                          />
                          <Field
                            id={"orgType"}
                            name={"orgType"}
                            label={"Organization Type*"}
                            textField="value"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={orgTypeList}
                            value={orgTypeList.id}
                            validator={organisationTypeValidator}
                            disabled={viewOrganizationVisible}
                          />
                          <Field
                            id={"contactNumber"}
                            name={"contactNumber"}
                            label={"Contract Number"}
                            component={FormInput}
                            disabled={viewOrganizationVisible}
                            validator={contactNumberValidator}
                          />

                          <Field
                            id={"addressLine"}
                            name={"addressLine"}
                            label={"Address Line*"}
                            component={FormInput}
                            disabled={viewOrganizationVisible}
                            validator={addressValidator}
                          />

                          <Field
                            id={"city"}
                            name={"city"}
                            label={"City*"}
                            component={FormInput}
                            disabled={viewOrganizationVisible}
                            validator={vendorCityAddressValidator}
                          />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Field
                              id={"state"}
                              name={"state"}
                              label={"State*"}
                              component={FormInput}
                              wrapperstyle={{
                                marginRight: "10px",
                              }}
                              disabled={viewOrganizationVisible}
                              validator={vendorStateAddressValidator}
                            />
                            <Field
                              id={"zipCode"}
                              name={"zipCode"}
                              type="number"
                              label={"Zip Code*"}
                              component={FormInput}
                              disabled={viewOrganizationVisible}
                              validator={zipValidator}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Field
                              id={"phoneNumber"}
                              name={"phoneNumber"}
                              label={"Phone Number*"}
                              component={FormInput}
                              wrapperstyle={{
                                width: "50%",
                                marginRight: "10px",
                              }}
                              disabled={viewOrganizationVisible}
                              validator={phoneNumberVaidator}
                            />

                            <Field
                              id={"taxExemptNum"}
                              name={"taxExemptNum"}
                              label={"Tax Exempt No"}
                              component={FormInput}
                              disabled={viewOrganizationVisible}
                              validator={taxExemptNumValidator}
                            />
                          </div>
                          {!viewOrganizationVisible && (
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
                          )}
                        </fieldset>
                      </FormElement>
                    )}
                  />
                </div>
              </Dialog>
            )}
          </div>
          {activeUservisible && (
            <Dialog title={<span>Please confirm</span>} onClose={toggleDialog}>
              <p
                style={{
                  margin: "25px",
                  textAlign: "center",
                }}
              >
                Are you sure you want to Activate User?
              </p>
              <DialogActionsBar>
                <Button
                  themeColor={"secondary"}
                  className={"col-12"}
                  onClick={toggleDialog}
                >
                  No
                </Button>
                <Button
                  themeColor={"primary"}
                  className={"col-12"}
                  onClick={ActivateUserOnClick}
                >
                  Yes
                </Button>
              </DialogActionsBar>
            </Dialog>
          )}
          {activeUservisible && (
            <Dialog
              width={400}
              title={
                <div className="d-flex align-items-center justify-content-center">
                  <i className="fa-solid fa-plus"></i>
                  <span className="ms-2">Activate</span>
                </div>
              }
              onClose={toggleDialog}
            >
              <Form
                onSubmit={ActivateUserOnClick}
                render={(formRenderProps) => (
                  <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                      <div>
                        <Field
                          id={"username"}
                          name={"username"}
                          label={"Username*"}
                          component={FormInput}
                          validator={OnlyNumberStringValidator}
                        />
                        <Field
                          id={"email"}
                          name={"email"}
                          label={"Email*"}
                          component={FormInput}
                          validator={emailValidator}
                        />
                      </div>

                      <div className="k-form-buttons">
                        <Button
                          className={"col-5 me-2"}
                          type={"button"}
                          onClick={toggleDialog}
                        >
                          Cancel
                        </Button>
                        <Button
                          themeColor={"primary"}
                          className={"col-5"}
                          type={"submit"}
                          disabled={!formRenderProps.allowSubmit}
                        >
                          Activate
                        </Button>
                      </div>
                    </fieldset>
                  </FormElement>
                )}
              />
            </Dialog>
          )}
          {registrationLink && (
            <Dialog
              title={<span>Registration Link</span>}
              onClose={() => {
                setRegistrationLink(null);
              }}
            >
              <p
                style={{
                  margin: "15px",
                  textAlign: "center",
                }}
              >
                {registrationLink}
              </p>
              <DialogActionsBar>
                <div
                  className={"col-6"}
                  style={{
                    textAlign: "center",
                  }}
                >
                  <Button
                    themeColor={"primary"}
                    onClick={() => {
                      setRegistrationLink(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </DialogActionsBar>
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
                Are you sure you want to delete?
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
}
