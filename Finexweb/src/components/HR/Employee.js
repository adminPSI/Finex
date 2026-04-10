import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { AuthenticationEndPoints, PayrollEndPoints } from "../../EndPoints";
import { OnlyNumberStringValidator } from "../validators";
import { AddRoleToUser } from "./AddRolestoUser";
import { EditEmployeeAdress } from "./AdressEditPopup";
import { AddEmployeeDependent } from "./DependentAddPopup";

import usePrivilege from "../../helper/usePrivilege";
import Constants from "../common/Constants";
import { FormInput } from "../form-components";
import { showSuccessNotification } from "../NotificationHandler/NotificationHandler";
import { AddProgramDepartment } from "./AddProgramDepartment";
import EditEmployeePopup from "./EditEmployeePopup";

export default function Employee() {
  const [, setSearchValue] = useState("");

  const [searchText, setsearchText] = useState();

  const [employeeData, setEmployeeData] = useState([]);

  const [show, setShow] = React.useState(false);
  const [adressContextShow, setAdressContextShow] = React.useState(false);
  const [dependentContextShow, setDependentContextShow] = React.useState(false);

  const [adressPopupVisible, setAdressPopupVisible] = useState();

  const [dependantPopupVisible, setDependentPopupVisible] = useState();

  const [pageSizeValue, setPageSizeValue] = React.useState();
  const [iSActive, setIsActive] = useState(false)
  const [inActiveTitle, setInActiveTitle] = useState("")
  const [addRoleToUserPopupVisible, setAddRoleToUserPopupVisible] =
    useState(false);
  const [
    addProgramDepartmentPopupVisible,
    setAddProgramDepartmentPopupVisible,
  ] = useState(false);
  const [activeUservisible, setActiveUservisible] = useState(false);
  const initialDataState = {
    skip: 0,
    take: Constants.KendoGrid.defaultPageSize,
  };
  const [page, setPage] = React.useState(initialDataState);
  const [pageTotal, setPageTotal] = React.useState();

  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [isDependentEditing, setIsDependentEditing] = useState(false);

  const [showFilter, setshowFilter] = React.useState(false);
  const [registrationLink, setRegistrationLink] = React.useState(null);
  const [filter, setFilter] = React.useState({});
  const [columnShow, setColumnShow] = useState(false);
  const offset = React.useRef({
    left: 0,
    top: 0,
  });
  const [showInactive, setShowInactive] = useState(false);

  const [, setDataState] = React.useState({
    skip: 0,
    take: 20,
    sort: [
      {
        field: "orderDate",
        dir: "asc",
      },
    ],
  });

  const [selectedRowId, setselectedRowId] = React.useState(0);
  const [selectedAddresRowId, setselectedAddresRowId] = React.useState(0);
  const [selectedDependentRowId, setselectedDependentRowId] = React.useState(0);
  const [, setSelectedEmployeeRowId] = React.useState();
  const [addEmployeeVisible, setAddEmployeeVisible] = React.useState(false);
  const [commandCellAction, setCommandCellAction] = React.useState("");

  const [editID, setEditID] = React.useState(null);
  const handleClick = (employee) => {
    setCommandCellAction("add");
    setAddEmployeeVisible(true);
  };
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };
  const rowClick = (event) => {
    setShowInactive(false);
    onSelectionChange(event);
    if (editID) {
      setEditID(null);
    } else {
      setEditID(event.dataItem.id);
    }
  };

  const [currentAddressData, setCurrentAddressData] = useState([]);
  const [bindEmployeeGrid, setBindEmployeeGrid] = useState({
    cskip: 0,
    ctake: 10,
  });
  const [activeInd, setActiveInd] = useState("Y");

  const [filterActiveInd, setFilterActiveInd] = useState(false)
  const [checkCondition, setCheckCondition] = useState("Y");
  useEffect(() => {
    const getData = setTimeout(() => {
      if (bindEmployeeGrid) {
        getEmployeeData(
          bindEmployeeGrid.FirstName,
          bindEmployeeGrid.LastName,
          bindEmployeeGrid.EmployeeNumber,
          bindEmployeeGrid.phoneNumber,
          bindEmployeeGrid.email,
          bindEmployeeGrid.userName,
          bindEmployeeGrid.search,
          bindEmployeeGrid.cskip,
          bindEmployeeGrid.ctake == "All" ? 0 : bindEmployeeGrid.ctake,
          bindEmployeeGrid.desc,
          bindEmployeeGrid.sortKey,
          bindEmployeeGrid.activeInd
        );
      }
    }, 500);

    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindEmployeeGrid]);

  const pageChange = (event) => {
    if (event.page.take <= 50) {
      setPageSizeValue(event.page.take);

      setBindEmployeeGrid({
        ...bindEmployeeGrid,
        cskip: event.page.skip,
        ctake: event.page.take,
      });
      setPage({
        ...event.page,
      });
    } else {
      setPageSizeValue("All");

      setBindEmployeeGrid({
        ...bindEmployeeGrid,
        cskip: 0,
        ctake: 0,
      });
      setPage({
        skip: 0,
        take: employeeData.length,
      });
    }
  };

  const handleSetInactive = () => {
    let id = selectedRowId?.id;
    if (inActiveTitle !== "Active") {
      axiosInstance({
        method: "PUT",
        url: PayrollEndPoints.setInActiveEmployee.replace("#ID#", id),
        withCredentials: false,
      })
        .then(() => {
          setBindEmployeeGrid({
            ...bindEmployeeGrid
          });
          setIsActive(false)
        })
        .catch(() => { });
    } else {
      axiosInstance({
        method: "PUT",
        url: PayrollEndPoints.setActiveEmployee.replace("#ID#", id),
        withCredentials: false,
      })
        .then(() => {
          setBindEmployeeGrid({
            ...bindEmployeeGrid
          });
          setIsActive(false)
        })
        .catch(() => { });
    }
  }

  const handleOnSelect = async (e) => {
    const config = {};
    const response = await fetch("config.json");
    const data = await response.json();
    Object.assign(config, data);
    let id = selectedRowId?.id;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (e.item.data.action) {
        case "addAddress":
          setAdressPopupVisible(true);
          break;

        case "addDependent":
          setDependentPopupVisible(true);
          break;

        case "edit":
          setCommandCellAction(action);
          setAddEmployeeVisible(true);
          break;
        case "view":
          setCommandCellAction(action);
          setAddEmployeeVisible(true);
          break;
        case "delete":
          setEmployeeData((prev) => {
            const newCopy = prev.filter((item) => {
              return item.id !== id;
            });
            return newCopy;
          });
          break;
        case "dependent":
          setDependentPopupVisible(true);
          break;
        case "addRoleToUser":
          setAddRoleToUserPopupVisible(true);
          break;
        case "addProgramsDepartment":
          setAddProgramDepartmentPopupVisible(true);
          break;
        case "getRegistrationLink":
          const selectedOrg = employeeData?.find((emp) => emp?.id == id);
          axiosInstance({
            method: "GET",
            url:
              AuthenticationEndPoints.getRegistrationLink +
              "?orgaccountid=" +
              selectedOrg?.orG_ID +
              "&employeeid=" +
              id,
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
        case "activateuser":
          toggleDialog();
          break;
        case "setActive":
          setInActiveTitle("Active")
          toggleDialogInActive();
          break;
        case "setInActive":
          setInActiveTitle("Inactive")
          toggleDialogInActive();
          break;
        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setShow(false);
  };

  const handleOnAddressSelect = (e) => {
    let id = selectedRowId?.id;
    let action = e.item.data.action;
    if (id !== 0) {
      switch (action) {
        case "edit":
          setAdressPopupVisible(true);
          setIsAddressEditing(true);
          break;

        case "inactive":
          editAddressSubmitHandlers("N");

          break;
        case "active":
          editAddressSubmitHandlers("Y");
          break;

        default:
      }
    } else {
      console.log("Error ! data not found.");
    }
    setAdressContextShow(false);
  };

  const editAddressSubmitHandlers = (activeInActive) => {
    const CurrentData = currentAddressData?.find(
      (item) => item.id == selectedAddresRowId?.id
    );
    const data = {
      activeInd: activeInActive,
      id: CurrentData.id,
      employeeId: CurrentData.employeeId,
      address: CurrentData.address,
      poBox: CurrentData.poBox,
      city: CurrentData.city,
      state: CurrentData.state,
      zipCode: CurrentData.zipCode,
      county: CurrentData.county,
    };

    axiosInstance({
      method: "PUT",
      url: PayrollEndPoints.PutEmployeesAddress.replace("#ID#", CurrentData.id),
      data: data,
      withCredentials: false,
    })
      .then(() => {
        if (activeInActive == "Y") {
          showSuccessNotification("Address Activated successfully.");
        } else if (activeInActive == "N") {
          showSuccessNotification("Address Deactivated successfully.");
        } else {
          showSuccessNotification("Address updated successfully");
        }
        setActiveInd(activeInActive);
        EmployeeAddressList(CurrentData.employeeId, {
          ActiveInd: activeInActive == "Y" ? true : false,
        });
      })
      .catch(() => { });
    return;
  };

  const handleOnDependentSelect = (e) => {
    let id = selectedRowId?.id;
    let action = e.item.data.action;

    if (id !== 0) {
      switch (action) {
        case "edit":
          setDependentPopupVisible(true);
          setIsDependentEditing(true);
          break;

        case "delete":
          break;

        default:
      }
    } else {
      alert("Error ! data not found.");
    }
    setAdressContextShow(false);
  };

  const handleCloseMenu = () => {
    setShow(false);
    setselectedRowId({});
  };

  const handleAdressCloseMenu = () => {
    setAdressContextShow(false);
    setselectedAddresRowId({});
  };

  const handleDependentCloseMenu = () => {
    setselectedDependentRowId({});
    setDependentContextShow(false);
  };

  const startDateCell = (props) => {
    var myDate = props.dataItem.dateOfBirth;
    if (myDate) {
      const [year, month, day] = myDate
        ? myDate.split("T")[0].split("-")
        : ["", "", ""];

      return <td>{`${month}/${day}/${year}`}</td>;
    }
    return <td></td>;
  };

  useEffect(() => {
    if (searchText?.length == 0) {
      setSearchValue("");
    }
  }, [searchText]);

  const dataStateChange = (event) => {
    setDataState(event.dataState);
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

  const CommandCellAdress = (props) => {
    return (
      <>
        <td className="k-command-cell">
          <Button
            id={props.dataItem.id}
            onClick={handleAdressContextMenu}
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
  };

  const CommandCellDependent = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleDependentContextMenu}
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

  const onInactiveCheckBox = (event) => {
    const { value } = event.target;
    setShowInactive(event.target.value);
    let isActive = value ? "Y" : "N";
    setActiveInd(isActive);
    let employeeId = selectedRowId?.id;
    EmployeeAddressList(employeeId, { ActiveInd: value });
  };

  const AddcheckBox = (props) => {
    const { dataItem } = props
    return (
      <td>
        <input type="checkbox" checked={dataItem?.dependent} />
      </td>
    )
  }
  const AddressDetailComponent = (props) => {
    const data = props.dataItem.details;
    setCurrentAddressData(data);

    return (
      <div className="d-flex flex-column gap-3">
        {props.dataItem.details && (
          <div>
            {checkPrivialgeGroup("HREmployeeAddressG", 1) && (
              <>
                <span className="k-table-title">Addresses</span>
                <Grid resizable={true} data={data}>
                  <GridToolbar>
                    {checkPrivialgeGroup("ShowHREInactiveCB", 1) && (
                      <>
                        <div className="row col-sm-12">
                          <div className="col-2 ms-auto">
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
                        </div>
                      </>
                    )}
                  </GridToolbar>
                  <GridColumn field="address" title="Address" />
                  <GridColumn field="poBox" title="PO Box" />
                  <GridColumn field="city" title="City" />
                  <GridColumn field="state" title="State" />
                  <GridColumn field="zipCode" title="ZipCode" />
                  <GridColumn field="county.countyName" title="County" />
                  <GridColumn cell={CommandCellAdress} />
                </Grid>
                <ContextMenu
                  show={adressContextShow}
                  offset={offset.current}
                  onSelect={handleOnAddressSelect}
                  onClose={handleAdressCloseMenu}
                >
                  {checkPrivialgeGroup("EditHREAddressCM", 3) && (
                    <MenuItem
                      text="Edit Address"
                      data={{
                        action: "edit",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("MakeInactiveHREAddressCM", 2) &&
                    !showInactive && (
                      <MenuItem
                        text="Inactive Address"
                        data={{
                          action: "inactive",
                        }}
                        icon="edit"
                      />
                    )}
                  {checkPrivialgeGroup("MakeActivateHREAddressCM", 2) &&
                    showInactive && (
                      <MenuItem
                        text="Activate Address"
                        data={{
                          action: "active",
                        }}
                        icon="edit"
                      />
                    )}
                </ContextMenu>
              </>
            )}
          </div>
        )}
        {props.dataItem.dependentDetails && (
          <div>
            {checkPrivialgeGroup("HREmployeeRelationG", 1) && (
              <>
                <span className="k-table-title">Relationships</span>

                <Grid resizable={true} data={props.dataItem.dependentDetails}>
                  <GridColumn field="name" title="Name" />
                  <GridColumn
                    field="dateOfBirth"
                    title="Date Of Birth"
                    cell={startDateCell}
                  />
                  <GridColumn field="relationship" title="Relationship" />
                  <GridColumn field="dependent" title="Dependent" cell={AddcheckBox} />
                  <GridColumn cell={CommandCellDependent} />
                </Grid>

                <ContextMenu
                  show={dependentContextShow}
                  offset={offset.current}
                  onSelect={handleOnDependentSelect}
                  onClose={handleDependentCloseMenu}
                >
                  {checkPrivialgeGroup("EditHRDependenceCM", 3) && (
                    <MenuItem
                      text="Edit Dependent"
                      data={{
                        action: "edit",
                      }}
                      icon="edit"
                    />
                  )}
                </ContextMenu>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const ActivateExpenseOnClick = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    try {
      axiosInstance({
        method: "POST",
        url:
          AuthenticationEndPoints.Activate +
          "?Employeeid=" +
          selectedRowId?.id +
          "&&username=" +
          dataItem.username,
        withCredentials: false,
      })
        .then((response) => {
          setBindEmployeeGrid({ ...bindEmployeeGrid });
          toggleDialog();
          showSuccessNotification(
            "User activated successfully. Please add roles to the employee"
          );
        })
        .catch(() => { })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    } catch (error) {
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  };
  const initialSort = [
    {
      field: "lastName",
      dir: "asc",
    },
  ];
  const [sort, setSort] = useState(initialSort);
  const onSortChange = (event) => {
    setSort(event.sort);
    let sortDetail = event.sort[0];
    let direction = sortDetail?.dir == "desc" ? true : false;
    let sortColumn = sortDetail?.field ? sortDetail.field : "lastName";
    setBindEmployeeGrid({
      ...bindEmployeeGrid,
      search: searchText,
      desc: direction,
      sortKey: sortColumn,
    });
  };
  const getEmployeeData = async (
    FirstName = "",
    LastName = "",
    EmployeeNumber = "",
    phoneNumber = "",
    email = "",
    userName = "",
    search = "",
    cskip = page.skip,
    ctake = page.take,
    desc = "false",
    sortKey = "lastName",
    activeInd = filterActiveInd
  ) => {
    const activeInds = !activeInd ? "Y" : "N";
    setCheckCondition(activeInds)
    axiosInstance({
      method: "Post",
      url:
        PayrollEndPoints.EmployeeFilter +
        "?FirstName=" +
        FirstName +
        "&&LastName=" +
        LastName +
        "&&EmployeeNumber=" +
        EmployeeNumber +
        "&&phoneNumber=" +
        phoneNumber +
        "&&email=" +
        email +
        "&&userName=" +
        userName +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey +
        "&&activeInd=" + activeInds,
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
        setEmployeeData(data);
      })
      .catch(() => { });
  };

  const expandChange = (event) => {
    setShowInactive(false);
    let newData = employeeData.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });

    setEmployeeData(newData);

    event.dataItem.expanded = event.value;
    setselectedRowId(event.dataItem);
    setEmployeeData([...employeeData]);
    if (!event.value || event.dataItem.amountDetails) {
      return;
    }

    let id = event.dataItem.id;
    EmployeeAddressList(id, { ActiveIn: activeInd });
    EmployeeDependentList(id);
  };

  const EmployeeAddressList = (id, activeValue) => {
    let employeeId = id ? id : selectedRowId?.id;
    let active = "";
    if (activeValue?.ActiveInd) {
      active = activeValue?.ActiveInd ? "N" : "Y";
    } else {
      active = activeInd;
    }

    axiosInstance({
      method: "GET",
      url:
        PayrollEndPoints.Address.replace("#EmployeeID#", employeeId) +
        `?activeind=${active}`,
      withCredentials: false,
    })
      .then((response) => {
        let data = employeeData.slice();
        let index = data.findIndex((d) => d.id == employeeId);
        data[index].details = response.data;
        setActiveInd(data[index].details.activeInd == "Y" ? "N" : "Y");
        setEmployeeData(data);
      })
      .catch(() => { });
  };

  const EmployeeDependentList = (id) => {
    let employeeId = id ? id : selectedRowId?.id;
    axiosInstance({
      method: "GET",
      url: PayrollEndPoints.EmployeeFamily.replace("#ID#", employeeId),
      withCredentials: false,
    })
      .then((response) => {
        let data = employeeData.slice();
        let index = data.findIndex((d) => d.id == employeeId);
        data[index].dependentDetails = response.data;
        setEmployeeData(data);
      })
      .catch(() => { });
  };

  const handleContextMenu = (props, data) => {
    handleContextMenuOpen(props, data);
  };

  const handleAdressContextMenu = (props) => {
    handleAdressContextMenuOpen(props);
  };

  const handleDependentContextMenu = (props) => {
    handleDependentContextMenuOpen(props);
  };

  const handleContextMenuOpen = (e, data) => {
    e.preventDefault();
    const id = typeof data == "number" ? { id: data } : data;
    setSelectedEmployeeRowId(id);

    setselectedRowId(e.currentTarget);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };

  const handleAdressContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedAddresRowId(e.currentTarget);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setAdressContextShow(true);
  };

  const handleDependentContextMenuOpen = (e) => {
    e.preventDefault();

    setselectedDependentRowId(e.currentTarget);

    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setDependentContextShow(true);
  };

  const toggleDialog = () => {
    setActiveUservisible(!activeUservisible);
  };

  const filterChange = (event) => {
    var FirstName = "";
    var LastName = "";
    var EmployeeNumber = "";
    var phoneNumber = "";
    var email = "";
    var userName = "";
    if (!!event.filter) {
      for (var i = 0; i < event.filter.filters.length; i++) {
        if (event.filter.filters[i].field == "firstName") {
          FirstName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "lastName") {
          LastName = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "employeeNumber") {
          EmployeeNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "mobilePhoneNumber") {
          phoneNumber = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "emailAddress") {
          email = event.filter.filters[i].value;
        }
        if (event.filter.filters[i].field == "userName") {
          userName = event.filter.filters[i].value;
        }
      }
    }
    setPage({
      skip: 0,
      take: pageSizeValue,
    });
    setBindEmployeeGrid({
      ...bindEmployeeGrid,
      search: undefined,
      FirstName: FirstName,
      LastName: LastName,
      EmployeeNumber: EmployeeNumber,
      phoneNumber: phoneNumber,
      email: email,
      userName: userName,
      cskip: 0,
    });
    setFilter(event.filter);
  };

  const moreFilter = () => {
    setshowFilter(!showFilter);
  };

  const filterOperators = {
    text: [
      {
        text: "grid.filterContainsOperator",
        operator: "contains",
      },
    ],
  };
  const timeRef = React.useRef(null);
  const filterData = (e) => {
    let value = e.target.value;
    setsearchText(value);
    setPage({
      ...page,
      skip: 0,
    });
    timeRef.current = setTimeout(() => {
      setBindEmployeeGrid({
        ...bindEmployeeGrid,
        cskip: 0,
        search: value,
        FirstName: undefined,
        LastName: undefined,
        EmployeeNumber: undefined,
        phoneNumber: undefined,
        email: undefined,
        userName: undefined,
      });
    }, 1000);
  };

  const [selectedState, setSelectedState] = useState({});
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";

  const onSelectionChange = (event) => {
    setShowInactive(false);

    let tmpId = event.dataItem.id;
    let newData = employeeData.map((item) => {
      if (item.id == tmpId) {
        item.expanded = !item.expanded;
        tmpId = item.id;
        setselectedRowId(item);
        EmployeeAddressList(tmpId);
        EmployeeDependentList(tmpId);
      } else {
        item.expanded = false;
      }
      return item;
    });
    if (Object.keys(selectedState)[0] !== tmpId) {
      setSelectedState({ [`${tmpId}`]: true });
    } else {
      setSelectedState({});
    }
    setEmployeeData(newData);
  };

  const addEmployeeVisibleToggle = () => {
    setAddEmployeeVisible(!addEmployeeVisible);
    setBindEmployeeGrid({
      ...bindEmployeeGrid,
    });
  };
  const toggleDialogInActive = () => {
    setIsActive(true)
  }

  const handleCheckBox = (e) => {
    setFilterActiveInd(!e.value)
    setBindEmployeeGrid({
      ...bindEmployeeGrid,
      activeInd: e.value
    });
  }
  const { checkPrivialgeGroup, loading, error } = usePrivilege('EmployeeManagement')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("HREmployeeM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                HR
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Employee
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Employee
              </li>
            </ol>
          </nav>
          <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
            <div className="d-flex k-flex-column">
              <h1>Employee</h1>
            </div>

            <div>
              {checkPrivialgeGroup("HREmployeeB", 2) && (
                <Button
                  className="k-button k-button-lg k-rounded-lg"
                  themeColor={"primary"}
                  onClick={handleClick}
                >
                  Add Employee
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3">
            {checkPrivialgeGroup("HREmployeeG", 1) && (
              <>
                <Grid
                  resizable={true}
                  filterable={showFilter}
                  filter={filter}
                  onFilterChange={filterChange}
                  filterOperators={filterOperators}
                  detail={AddressDetailComponent}
                  expandField="expanded"
                  onExpandChange={expandChange}
                  data={employeeData}
                  skip={page.skip}
                  take={page.take}
                  total={pageTotal}
                  pageable={{
                    buttonCount: 4,
                    pageSizes: [10, 15, 50, "All"],
                    pageSizeValue: pageSizeValue,
                  }}
                  onPageChange={pageChange}
                  onDataStateChange={dataStateChange}
                  editField="inEdit"
                  onRowClick={rowClick}
                  selectedField={SELECTED_FIELD}
                  onSelectionChange={onSelectionChange}
                  dataItemKey={DATA_ITEM_KEY}
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
                          onClick={moreFilter}
                        >
                          <i className="fa-solid fa-arrow-down-wide-short"></i>{" "}
                          &nbsp;Filter
                        </Button>
                      </div>
                      <div className="col-sm-6 d-flex align-items-center justify-content-center">
                        <div className="col-3">
                          {checkPrivialgeGroup("HRESMICB", 1) && (
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
                          {checkPrivialgeGroup("HRESMICB", 1) && (
                            <Checkbox
                              type="checkbox"
                              id="setInactive"
                              name="setInactive"
                              defaultChecked={filterActiveInd}
                              onChange={handleCheckBox}
                              label={"Show Inactive"}
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
                  <GridColumn field="lastName" title="Last Name" />
                  <GridColumn field="firstName" title="First Name" />
                  <GridColumn field="employeeNumber" title="Employee Number" />
                  <GridColumn
                    field="mobilePhoneNumber"
                    title="Phone Number"
                    width={"125px"}
                  />
                  <GridColumn
                    field="emailAddress"
                    title="Email Address"
                    width={"300px"}
                  />
                  <GridColumn
                    field="userName"
                    title="User Name"
                    width={"200px"}
                  />
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
                  {columnShow && (
                    <GridColumn field="createdBy" title="Created By" />
                  )}
                  {columnShow && (
                    <GridColumn
                      field="modifiedDate"
                      title="Modified Date"
                      cell={(props) => {
                        const [year, month, day] = props.dataItem?.modifiedDate
                          ? props.dataItem?.modifiedDate
                            .split("T")[0]
                            .split("-")
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
                    <GridColumn field="modifiedBy" title="Modified By" />
                  )}
                  <GridColumn
                    cell={CommandCell}
                    width={"100px"}
                    filterable={false}
                  />
                </Grid>
                <ContextMenu
                  show={show}
                  offset={offset.current}
                  onSelect={handleOnSelect}
                  onClose={handleCloseMenu}
                >
                  {checkPrivialgeGroup("ViewHREmployeeCM", 1) && (
                    <MenuItem
                      text="View Record"
                      data={{
                        action: "view",
                      }}
                      icon="eye"
                    />
                  )}
                  {checkPrivialgeGroup("EditHREmployeeCM", 3) && (
                    <MenuItem
                      text="Edit Record"
                      data={{
                        action: "edit",
                      }}
                      icon="edit"
                    />
                  )}

                  {checkPrivialgeGroup("AddAddressHREmployeeCM", 2) && (
                    <MenuItem
                      text="Add Address"
                      data={{
                        action: "addAddress",
                      }}
                      icon="edit"
                    />
                  )}

                  {checkPrivialgeGroup("AddDependentHREmployeeCM", 2) && (
                    <MenuItem
                      text="Add Dependent"
                      data={{
                        action: "addDependent",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("ActivateUserHREmployeeCM", 2) && (
                    <MenuItem
                      text="Activate User"
                      data={{
                        action: "activateuser",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("ManageRolesHREmployeeCM", 2) && checkCondition == "N" && (
                    <MenuItem
                      text="Set Active"
                      data={{
                        action: "setActive",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("ManageRolesHREmployeeCM", 2) && checkCondition == "Y" && (
                    <MenuItem
                      text="Set Inactive"
                      data={{
                        action: "setInActive",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("ManageRolesHREmployeeCM", 2) && (
                    <MenuItem
                      text="Manage Roles"
                      data={{
                        action: "addRoleToUser",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("ManageHREmployeeCM", 2) && (
                    <MenuItem
                      text="Manage IHAC Program/Department"
                      data={{
                        action: "addProgramsDepartment",
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("GetLinkHREmployeeCM", 2) && (
                    <MenuItem
                      text="Get Registration Link"
                      data={{
                        action: "getRegistrationLink",
                      }}
                      icon="edit"
                    />
                  )}
                </ContextMenu>
              </>
            )}
          </div>
          <div>
            {adressPopupVisible && (
              <EditEmployeeAdress
                EmployeeAddressList={() => EmployeeAddressList()}
                setAdressPopupVisible={setAdressPopupVisible}
                selectedRowId={selectedRowId?.id}
                selectedAddresRowId={selectedAddresRowId?.id}
                employeeData={employeeData}
                isAddressEditing={isAddressEditing}
                setIsAddressEditing={setIsAddressEditing}
                activeInd={activeInd}
              />
            )}

            {dependantPopupVisible && (
              <AddEmployeeDependent
                EmployeeDependentList={() => EmployeeDependentList()}
                setDependentPopupVisible={setDependentPopupVisible}
                selectedRowId={selectedRowId?.id}
                selectedDependentRowId={selectedDependentRowId?.id}
                employeeData={employeeData}
                isDependentEditing={isDependentEditing}
                setIsDependentEditing={setIsDependentEditing}
              />
            )}
            {addRoleToUserPopupVisible && (
              <AddRoleToUser
                setAddRoleToUserPopupVisible={setAddRoleToUserPopupVisible}
                selectedRowId={selectedRowId?.id}
                employeeData={employeeData}
              />
            )}
            {addProgramDepartmentPopupVisible && (
              <AddProgramDepartment
                setAddProgramDepartmentPopupVisible={
                  setAddProgramDepartmentPopupVisible
                }
                selectedRowId={selectedRowId?.id}
                employeeData={employeeData}
              />
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
                  onSubmit={ActivateExpenseOnClick}
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
                        </div>

                        <div className="k-form-buttons mt-4">
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
            {addEmployeeVisible && (
              <EditEmployeePopup
                addEmployeeVisibleToggle={addEmployeeVisibleToggle}
                id={selectedRowId?.id}
                employeeData={employeeData}
                action={commandCellAction}
              />
            )}
            {
              iSActive && (
                <Dialog
                  title={<span>Set User {inActiveTitle} </span>}
                  onClose={() => {
                    setIsActive(false);
                  }}
                >
                  <p
                    style={{
                      margin: "25px",
                      textAlign: "center",
                    }}
                  >
                    Confirm that you want to {checkCondition !== "Y" ? "activate" : "inactivate"} this user?
                  </p>
                  <DialogActionsBar>
                    <div className="d-flex justify-content-end">
                      <Button className="me-3" onClick={() => setIsActive(false)}>
                        No
                      </Button>
                      <Button themeColor={"primary"} onClick={handleSetInactive}>
                        Yes
                      </Button>
                    </div>
                  </DialogActionsBar>
                </Dialog>
              )
            }
          </div>
        </>
      )}
    </>
  );
}
