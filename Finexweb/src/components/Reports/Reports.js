import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  AccountReceivable,
  AuthenticationEndPoints,
  DepartmentEndPoints,
  ExpenseEndPoints,
  FundEndPoints,
  IHCAccountEndPoints,
  IHCSubAccountEndPoints,
  IHPOEndPoints,
  InventoryEndPoints,
  ProgramEndPoints,
  PurchaseOrderEndPOints,
  ReportsEndPoints,
  StateAccountCodeEndPoints,
  VendorEndPoints,
} from "../../EndPoints";
import { handleDropdownSearch } from "../common/Helper";
import {
  FormCheckbox,
  FormDatePicker,
  FormDropDownList,
  FormInput,
  FormMultiColumnComboBox,
  FormNumericTextBox,
  FormTextArea,
} from "../form-components";
import SacDialog from "../modal/StateAccountCodeDialog";
import { showErrorNotification } from "../NotificationHandler/NotificationHandler";
import { startDateValidator } from "../validators";
import PdfViewer from "./pdfViewer/PdfViewer";

export default function Reports() {
  React.useEffect(() => {
    BindFundDropdown();
    BindExpenseDropdown();
    SearchVendor();
    SearchCustomer();
    getStateAccountPage();
    BindProgramDropdown();
    BindDepartmentDropdown();
    BindAccountDropdown();
    BindSubAccountDropdown();
    BindCategoryDropdown();
    BindIHPODropdown();
    getAllOtherDescriptionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const transferColumns = [
    {
      field: "fundCode",
      header: "Fund Code",
      width: "200px",
    },
    {
      field: "fundname",
      header: "Fund Name",
      width: "200px",
    },
  ];
  const CACColumns = [
    {
      field: "text",
      header: "CAC",
      width: "150px",
    },
    {
      field: "desc",
      header: "Description",
      width: "150px",
    },
  ];
  const PageColumns = [
    {
      field: "sac",
      header: "SAC",
      width: "100px",
    },
    {
      field: "desc",
      header: "Description",
      width: "150px",
    },
  ];
  const [sacPageList, setSacPageList] = React.useState([]);
  const [sacPage, setSacPage] = React.useState([]);

  const [stateFund, setStateFund] = React.useState();
  const [stateVendor, setStateVendor] = React.useState();
  const [stateCustomer, setStateCustomer] = React.useState();
  const [stateProgram, setStateProgram] = React.useState();
  const [stateAccount, setStateAccount] = React.useState();
  const [stateDepartment, setStateDepartment] = React.useState();
  const [stateSubAccount, setStateSubAccount] = React.useState();
  const [stateIHPO, setStateIHPO] = React.useState();
  const [stateCategory, setStateCategory] = React.useState();
  const [programToExcludeId, setProgramToExcludeId] = React.useState();
  const [statePo, setStatePo] = React.useState();
  const [statePage, setStatePage] = React.useState();
  const [stateSacPage, setStateSacPage] = React.useState();
  const [otherRevPage, setOtherRevPage] = React.useState();
  const [reportFormKey, setReportFormKey] = React.useState(0);

  const [stateSAC, setStateSAC] = React.useState();

  const [CACDDList, setCACDDList] = React.useState([]);
  const [PODDList, setPODDList] = React.useState([]);
  const poRef = useRef([]);

  const [stateCAC, setStateCAC] = React.useState();
  const [VendorDDList, setVendorDDList] = React.useState([]);
  const [CustomerDDList, setCustomerDDList] = React.useState([]);
  const [formInit, setFormInit] = useState([]);
  const [formKey, setFormKey] = React.useState(1);
  const [visible, setVisible] = React.useState(false);
  const [programDropdownData, setProgramDropdownData] = useState([]);
  const [departmentDropdownData, setDepartmentDropdownData] = useState([]);
  const [accountDropdownData, setAccountDropdownData] = useState([]);
  const [subaccountDropdownData, setSubAccountDropdownData] = useState([]);
  const [ihpoDropdownData, setIHPODropdownData] = useState([]);
  const [reportChecked, setReportChecked] = useState(false);
  const [fileType, setFileType] = useState("PDF")

  const [programToExcludeDropdownData] = useState([
    {
      desc: "",
      text: "Program to Exclude 1",
      id: 11,
    },
    {
      desc: "",
      text: "Program to Exclude 2",
      id: 12,
    },
    {
      desc: "",
      text: "Program to Exclude 3",
      id: 13,
    },
    {
      desc: "",
      text: "Program to Exclude 4",
      id: 14,
    },
    {
      desc: "",
      text: "Program to Exclude 5",
      id: 15,
    },
    {
      desc: "",
      text: "Program to Exclude 6",
      id: 16,
    },
  ]);

  const formRef = useRef();
  const [categoryDropdownData, setCategoryDropdownData] = useState();
  const toggleDialog = () => {
    setVisible(!visible);
  };
  const [, setSacCode] = React.useState("");
  const getSacCode = (sac) => {
    setSacCode(sac);
    formInit.stateAccountingCode = sac;

    formInit.allowSubmit = true;
    setFormInit(formInit);
    setFormKey(formKey + 1);
  };

  const [selectedStartDate, setSelectedStartDate] = React.useState();
  const [selectedEndDate, setSelectedEndDate] = React.useState();
  const [, setEndDateError] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [fundFromDropdownData, setFundFromDropdownData] = useState([]);

  const [POSearch, setPOSearch] = useState("");
  React.useEffect(() => {
    const getData = setTimeout(() => {
      SearchPO(POSearch);
      BindFundDropdown(POSearch);
    }, 1000);
    return () => clearTimeout(getData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [POSearch]);
  const [searchTransferFromData, setSearchTransferFromData] = useState("");

  const [CACDDListSearch, setCACDDListSearch] = useState("");
  const [searchCACDDListData, setSearchCACDDListData] = useState("");

  const [SACSearch, setSACSearch] = useState("");
  const [searchCACListData, setSearchCACListData] = useState("");

  const onPOFilterChange = (event) => {
    let searchText = event.filter.value;
    setPOSearch(searchText);
  };

  const SACFilterChange = (event) => {
    let searchText = event.filter.value;
    setSACSearch(searchText);
  };

  const onCACDDFilterChange = (event) => {
    let searchText = event.filter.value;
    setCACDDListSearch(searchText);
  };

  const searchableField = ["fundCode", "fundname"];
  React.useEffect(() => {
    const result = handleDropdownSearch(
      fundFromDropdownData,
      searchableField,
      POSearch
    );
    setSearchTransferFromData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [POSearch]);

  const searchableFieldCACDD = ["desc", "text"];
  React.useEffect(() => {
    const result = handleDropdownSearch(
      CACDDList,
      searchableFieldCACDD,
      CACDDListSearch
    );
    setSearchCACDDListData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CACDDListSearch]);

  const searchableFieldSAC = ["desc", "sac"];
  React.useEffect(() => {
    const result = handleDropdownSearch(
      sacPageList,
      searchableFieldSAC,
      SACSearch
    );
    setSearchCACListData(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SACSearch]);

  const [privilegeResourceGroup, setPrivilegeResourceGroup] = useState([]);
  const handlePrivilageByGroup = () => {
    axiosInstance({
      method: "get",
      url:
        AuthenticationEndPoints.getPrivilegesByResourceGroupName +
        `?functionGroupName=Reports`,
      withCredentials: false,
    })
      .then((response) => {
        setPrivilegeResourceGroup(response.data);
      })
      .catch(() => { });
  };

  const checkPrivialgeGroup = (resourcesKey, privilageId) => {
    return privilegeResourceGroup.some(
      (item) =>
        item.resources_key == resourcesKey &&
        item.privileges_id == privilageId
    );
  };

  useEffect(() => {
    handlePrivilageByGroup();
  }, []);

  const downloadeElectronicPDF = (url, e) => {
    const submitButton = e?.target?.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let data = {
      DateWritten: "",
      CSO: "",
    };
    if (url == "ElectronicVoucherStringMySoftwareSolutions") {
      axiosInstance({
        method: "POST",
        maxBodyLength: Infinity,
        url: ReportsEndPoints.ElectronicVoucherStringMySotwareSolutions,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      })
        .then((response) => {
          const binaryString = window.atob(response.data);
          const byteArray = new Uint8Array(binaryString.length);

          for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([byteArray], { type: "text/csv:charset=utf-8" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `Voucher${moment(new Date()).format("MMDDYYYY")}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    } else {
      axiosInstance({
        method: "POST",
        maxBodyLength: Infinity,
        url: ReportsEndPoints.ElectronicPOStringMFCD,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      })
        .then((response) => {
          const binaryString = window.atob(response.data);
          const byteArray = new Uint8Array(binaryString.length);

          for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([byteArray], { type: "text/csv:charset=utf-8" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `PO${moment(new Date()).format("MMDDYYYYHHmm")}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    }
  };

  const Electronicpdf = (e) => {
    const submitButton = e?.target?.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let data = {
      CSO: "CLAROH1",
      DateWritten: "2024-07-01T12:06:46.987",
    };
    axiosInstance({
      method: "POST",
      maxBodyLength: Infinity,
      url: ReportsEndPoints.ElectronicVoucherStringClark,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    })
      .then((response) => {
        const binaryString = window.atob(response.data);
        const byteArray = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: "text/csv:charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Voucher${moment(new Date()).format("MMDDYYYY")}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const [isOpen, setIsOpen] = useState(false);
  const [pdfURL, setPdfURL] = useState("");
  const [otherDescOptions, setOtherDescOptions] = useState([]);
  useEffect(() => {
    if (pdfURL !== "") {
      setIsOpen(true);
    }
  }, [pdfURL]);

  const PDFViewer = (base64String, type) => {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: type });
    const url = URL.createObjectURL(blob);
    setPdfURL(url);
  };
  const handleTabSelect = (event) => {
    setPOSearch("");
    setCACDDListSearch("");
    setSACSearch("");
    setSelectedTab(event.selected);
    setOptionsPara(defaultSelected);
    setOptions({});
    setTextBoxValue("");
    setStateFund();
    setStateCAC();
    setStateVendor();
    setStateCustomer();
    setStateProgram();
    setStateDepartment();
    setStateAccount();
    setStateSubAccount();
    setStateIHPO();
    setStateCategory();
    setProgramToExcludeId();
    setVendorAmount("");
    setReportFormKey(0);
    setStateSAC();
    setStatePo();
    setStatePage();
    setOtherRevPage();
    setReportChecked(false);
  };
  const handleSubmit = (dataItem) => {
    alert(dataItem + " submitted");
  };

  const getStateAccountPage = async () => {
    axiosInstance({
      method: "GET",
      url: StateAccountCodeEndPoints.GetStateAccountPage.replace("#ORGID#", 7),
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            desc: data.stateAccountDesc,
            sac: data.stateAccountCode,
            pageId: data.pageId,
            id: data.id,
          };
          itemsData.push(items);
        });
        setSacPageList(itemsData);
        setSacPage(itemsData.map(({ id, desc }) => ({ id, desc })));
      })
      .catch((error) => { });
  };
  const getAllOtherDescriptionList = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: AccountReceivable.GetAllOtherDescription,
        withCredentials: false,
      });
      let data = response.data;
      let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.name,
            id: data.id,
          };
          itemsData.push(items);
        });
      setOtherDescOptions(itemsData);
    } catch (error) {
      console.log(error);
    }
  };
  const BindFundDropdown = (search = "") => {
    axiosInstance({
      method: "POST",
      url:
        FundEndPoints.GetFundListWithFilter +
        `code=${search}&&fundName=&&isActive=Y&&search=&&skip=0&&take=0`,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.fundName,
            fundCode: data.fundCode,
            fundname: data.fundName,
            id: data.id,
          };
          itemsData.push(items);
        });
        setFundFromDropdownData(itemsData);
      })
      .catch((error) => { });
  };

  const ddlFundHandleChange = async (event) => {
    if (event.target.value != null) {
      setStateFund(event.target.value);
    } else {
      setStateFund();
    }
  };
  const BindExpenseDropdown = () => {
    axiosInstance({
      method: "GET",
      url: ExpenseEndPoints.GetExpenseCodeList,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;

        let itemsData = [];
        data.forEach((data) => {
          let items = {
            desc: data.countyExpenseDescription,
            text: data.countyExpenseCode,
            id: data.id,
          };
          itemsData.push(items);
        });
        setCACDDList(itemsData);
      })
      .catch((error) => { });
  };
  const ddlProgramhandleChange = async (formRenderProps) => {
    if (formRenderProps.valueGetter("countyAccountingCode") != null) {
      setStateCAC(formRenderProps.valueGetter("countyAccountingCode"));
    } else {
      setStateCAC();
    }
  };

  const VendorddlOnChange = (event) => {
    let vendorIndex = VendorDDList.findIndex(
      (x) => x.id == event.target.value.id
    );
    if (vendorIndex >= 0) {
      setStateVendor(VendorDDList[vendorIndex]);
    } else {
      setStateVendor();
    }
  };
  const CustomerddlOnChange = (event) => {
    let customerIndex = CustomerDDList.findIndex(
      (x) => x.id == event.target.value.id
    );
    if (customerIndex >= 0) {
      setStateCustomer(CustomerDDList[customerIndex]);
    } else {
      setStateCustomer();
    }
  };

  const CategoryOnChange = (event) => {
    setStateCategory(event.target.value);
  };
  const FundOnChange = (event) => {
    setStateFund(event.target.value);
  };
  const itemRender = (li, itemProps) => {
    const itemChildren = (
      <div>
        <span
          style={{
            fontWeight: "bold",
          }}
        >
          {li.props.children}
        </span>
        <br></br>
        <span>{itemProps.dataItem.desc}</span>
      </div>
    );
    return React.cloneElement(li, li.props, itemChildren);
  };
  const SearchVendor = async (searchText) => {
    axiosInstance({
      method: "POST",
      url:
        VendorEndPoints.VendorFilter +
        "?isActive=" +
        "Y" +
        "&vendorType=vendor" +
        "&name=" +
        "",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        //vendorRef.current = data;
        setVendorDDList(data);
      })
      .catch(() => { });
  };

  const SearchCustomer = async (searchText) => {
    axiosInstance({
      method: "POST",
      url:
        VendorEndPoints.VendorFilter +
        "?isActive=" +
        "Y" +
        "&vendorType=customer" +
        "&name=" +
        "",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        //vendorRef.current = data;
        setCustomerDDList(data);
      })
      .catch(() => { });
  };
  const BindProgramDropdown = () => {
    axiosInstance({
      method: "Post",
      url:
        ProgramEndPoints.GetProgramFilter +
        "code=&&description=&&revenueCheck=&&expenseCheck=&&salaryBenefit=&&startDate=&&isActive=Y&&search=&&skip=0&&take=0&&desc=false",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "00" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setProgramDropdownData(itemsData);
      })
      .catch((error) => { });
  };

  const BindDepartmentDropdown = () => {
    axiosInstance({
      method: "Post",
      url:
        DepartmentEndPoints.GetDepartmenFilter +
        "code=&&description=&&revenueCheck=&&expenseCheck=&&salaryBenefit=&&startDate=&&isActive=Y&&search=&&skip=0&&take=0&&desc=false",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "00" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setDepartmentDropdownData(itemsData);
      })
      .catch((error) => { });
  };

  const BindAccountDropdown = () => {
    axiosInstance({
      method: "Post",
      url:
        IHCAccountEndPoints.GetIHCAccountFilter +
        "code=&&description=&&revenueCheck=&&expenseCheck=&&salaryBenefit=&&startDate=&&isActive=Y&&search=&&skip=0&&take=0&&desc=false",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "0000" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setAccountDropdownData(itemsData);
      })
      .catch((error) => { });
  };

  const BindSubAccountDropdown = () => {
    axiosInstance({
      method: "Post",
      url:
        IHCSubAccountEndPoints.GetIHCSubAccountFilter +
        "code=&&description=&&revenueCheck=&&expenseCheck=&&salaryBenefit=&&startDate=&&isActive=Y&&search=&&skip=0&&take=0&&desc=false",
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "0000" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setSubAccountDropdownData(itemsData);
      })
      .catch((error) => { });
  };
  const separateByTypeName = (arr) => {
    return arr.reduce((acc, obj) => {
      if (!acc[obj.typename]) {
        acc[obj.typename] = [];
      }
      acc[obj.typename].push(obj);
      return acc;
    }, {});
  };

  const BindCategoryDropdown = () => {
    axiosInstance({
      method: "GET",
      url: InventoryEndPoints.AssetLookup,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        const sortData = separateByTypeName(data);

        if (
          sortData["Inventory Category"] &&
          sortData["Inventory Category"].length
        ) {
          let itemsData = [];
          sortData["Inventory Category"].forEach((data) => {
            let items = {
              text: data.name,
              id: data.id,
            };
            itemsData.push(items);
          });
          setCategoryDropdownData(itemsData);
        }
      })
      .catch(() => { });
  };

  const BindIHPODropdown = () => {
    /*let url = `?ihpoNumber=&&vendorname=&&description=&&reTotal=&&reBalance=&&Status=&&search=&&poId=0&&reqDate=&&reqDateComplete=&&skip=0&&take=0&&desc=false&&sortKey=&&forApproval=false&&poNumber=`;

    axiosInstance({
      method: "GET",
      url: IHPOEndPoints.GetIHPO + url,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.reqNumber,
            id: data.id,
          };
          itemsData.push(items);
        });

        setIHPODropdownData(itemsData);
      })
      .catch(() => { });*/
  };

  const updateStartDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedStartDate(date.toString());
    localEndDateValidator({ startdate: dateformat });
  };

  const localEndDateValidator = ({ enddate, startdate }) => {
    const startDate = new Date(startdate ?? selectedStartDate);
    const endDate = new Date(enddate ?? selectedEndDate);
    if (!selectedStartDate) {
      setEndDateError("Please select end date");
      return;
    }
    if (selectedStartDate && endDate < startDate) {
      setEndDateError("End date should be greater than start date");
    } else {
      setEndDateError("");
    }
  };

  const updateEndDate = (formRenderProps) => {
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedEndDate(date.toString());
    localEndDateValidator({ enddate: dateformat });
  };

  const countyExpenceCAChandleChange = (formRenderProps) => {
    if (formRenderProps?.value?.id) {
      setStateCAC(formRenderProps.value);
    } else {
      setStateCAC();
    }
  };
  const PageOnchange = (event) => {
    if (event.target.value != null) {
      setStatePage(event.target.value);
    }
  };
  const sacPageOnchange = (event) => {
    let sacIndex = sacPageList.findIndex((x) => x.id == event.target.value.id);
    if (sacIndex >= 0) {
      setStateSacPage(event.target.value);
      let list = sacPageList.find((x) => x.id == event.target.value.id);
      setStatePage(list);
    }
  };
  const otherRevOnchange = (event) => {
    let revIndex = otherDescOptions.findIndex((x) => x.id == event.target.value.id);
    if (revIndex >= 0) {
      setOtherRevPage(event.target.value);
      let list = otherDescOptions.find((x) => x.id == event.target.value.id);
      setOtherRevPage(list);
    }
  };
  const ihacExpenceProgramhandleChange = (formRenderProps) => {
    setStateProgram(formRenderProps.value);
  };
  const ihacExpenceDepartmenthandleChange = (formRenderProps) => {
    setStateDepartment(formRenderProps.value);
  };
  const ihacExpenceAccounthandleChange = (formRenderProps) => {
    setStateAccount(formRenderProps.value);
  };
  const ihacExpenceSubAccounthandleChange = (formRenderProps) => {
    setStateSubAccount(formRenderProps.value);
  };
  const ihacExpenceIHPOhandleChange = (formRenderProps) => {
    setStateIHPO(formRenderProps.value);
  };
  const ihacExpenceVendorhandleChange = (formRenderProps) => {
    setStateVendor(formRenderProps.value);
  };
  const ihacExpenceProgramToExcludehandleChange = (formRenderProps) => {
    setProgramToExcludeId(formRenderProps.value.id);
  };

  const downloadReportsCommonFunction = (reportType, e) => {
    const submitButton = e?.target?.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    if (!selectedStartDate || !selectedEndDate) {
      showErrorNotification("Please select start and end dates");
    } else {
      if (reportType == undefined || reportType == null) {
        showErrorNotification("Please select report");
      } else {
        let data;
        //This is report changes by soma
        if (
          reportType == "Fund" ||
          reportType == "Expenditure" ||
          reportType == "RevenueCounty"
        ) {
          if (
            new Date(selectedStartDate).getMonth() !==
            new Date(selectedEndDate).getMonth() ||
            new Date(selectedStartDate).getFullYear() !==
            new Date(selectedEndDate).getFullYear()
          ) {
            showErrorNotification(
              "Please select start and end dates within same month"
            );
            return;
          }
        }
        if (
          reportType == "Fund" ||
          reportType == "Expenditure" ||
          reportType == "ExpenditureSummaryName" ||
          reportType == "ShowExpenseDetail" ||
          reportType == "ExpensePerMonth" ||
          reportType == "PreviousYearsBalance" ||
          reportType == "Adjustments" ||
          reportType == "VoucherByDateWritten" ||
          reportType == "VoucherByDatePosted" ||
          reportType == "VoucherByDatePostedSortDate" ||
          reportType == "VoucherUnapproved" ||
          reportType == "VoucherPrepaidListName" ||
          reportType == "VoucherWithoutPDF" ||
          reportType == "CustomVoucherList" ||
          reportType == "CustomExpenditure" ||
          reportType == "CustomExpenditure2" ||
          reportType == "CustomExpenditure3" ||
          reportType == "SACCACSummary" ||
          reportType == "IHACCACDetailGroupByCAC" ||
          reportType == "CheckReg"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };
          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            FundID: stateFund ? stateFund.id : "",
            CACID: stateCAC ? stateCAC.id : "",
            OptionsParameter: optionsPara,
          };
          if (reportType == "SACCACSummary") {
            data.DictionaryParameters.Tag = "s,o";
          } else if (reportType == "IHACCACDetailGroupByCAC") {
            data.DictionaryParameters.Tag = "s,i";
          } else {
            data.DictionaryParameters.Tag = "s";
          }
        }
        //here need to add Po Reports
        if (
          reportType == "POByNumber" ||
          reportType == "POsByCountyCode" ||
          reportType == "POHistory" ||
          reportType == "POHistoryVoucherPostDate" ||
          reportType == "POWithIHPOs" ||
          reportType == "POByCACEncumberedBalance" ||
          reportType == "POBalanceByDate" ||
          reportType == "CustomPOReport" ||
          reportType == "AskToClosePOCheckState"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };
          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            Vendor: stateVendor ? stateVendor.vendorNo : "",
            POID: statePo ? statePo.poNumber : "",
            CACID: stateCAC ? stateCAC.id : "",
            OptionsParameter: optionsPara,
            Tag: "",
          };
        }
        if (
          reportType == "OpenIHPOs" ||
          reportType == "ClosedIHPOs" ||
          reportType == "AllIHPOs" ||
          reportType == "OpenIHPOsWithPO" ||
          reportType == "OpenIHPOs07"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };
          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            ProgramID: stateProgram ? stateProgram.code : "",
            DepartmentID: stateDepartment ? stateDepartment.code : "",
            AccountID: stateAccount ? stateAccount.code : "",
            SubAccountID: stateSubAccount ? stateSubAccount.code : "",
            IHPOID: stateIHPO ? stateIHPO.text : "",
            Tag: "",
            OptionsParameter: optionsPara,
          };
        }
        if (
          reportType == "VendorSumByAmount" ||
          reportType == "VendorSumByVendor" ||
          reportType == "VendorSumByVendorByCAC" ||
          reportType == "Vendor1099Totals" ||
          reportType == "VendorList" ||
          reportType == "VendorExpenseDetail" ||
          reportType == "VendorExpenseDetailPortriat" ||
          reportType == "VendorExpenseByMonth" ||
          reportType == "VendorLabels" ||
          reportType == "VendorAddress" ||
          reportType == "VendorByPostDate" ||
          reportType == "VendorSumByVendorBySAC"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };
          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            Vendor: stateVendor ? stateVendor.vendorNo : "",
            VendorAmount: vendorAmount ?? "",
            OptionsParameter: optionsPara,
          };
          if (reportType == "VendorLabels" || reportType == "VendorAddress") {
            if (data.DictionaryParameters.VendorAmount == "") {
              showErrorNotification("Please enter amount");
              return;
            }
          }
          if (reportType == "VendorList") {
            data.DictionaryParameters.Tag = "";
          } else {
            data.DictionaryParameters.Tag = "s,v";
          }
        }

        //IHAC EMail
        if (
          reportType == "IHACDetailEmail" ||
          reportType == "IHACSummarEAEmail" ||
          reportType == "EmailAllActiveEmployees"
          //|| reportType == "Vendor1099Totals"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };
          let comments = "";
          if (textBoxValue != null) {
            comments = textBoxValue;
          }
          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            ProgramID: stateProgram ? stateProgram.code : "",
            DepartmentID: stateDepartment ? stateDepartment.code : "",
            AccountID: stateAccount ? stateAccount.code : "",
            SubAccountID: stateSubAccount ? stateSubAccount.code : "",
            Supervisor: "",
            Comments: comments,
            OptionsParameter: optionsPara,
          };
          if (
            reportType == "IHACDetailEmail" ||
            reportType == "IHACSummarEAEmail"
          ) {
            data.DictionaryParameters.Tag = "s,i";
          }
        }

        if (
          reportType == "IHACDetail" ||
          reportType == "IHACDetailWithWarrantNoCACName" ||
          reportType == "IHACDetailExport" ||
          reportType == "IHACDetailByName" ||
          reportType == "IHACDetailWithCAC" ||
          reportType == "IHACDetailNotPosted" ||
          reportType == "IHACAllocations" ||
          reportType == "IHACSummaryP" ||
          reportType == "IHACSummaryD" ||
          reportType == "IHACSummaryA" ||
          reportType == "IHACSummaryS" ||
          reportType == "IHACSubAccountSummary" ||
          reportType == "IHACSummaryPA" ||
          reportType == "IHACDetailPayrollBenefits" ||
          reportType == "IHACPayrollBenefitsSummary" ||
          reportType == "IHACAllocationsByCAC" ||
          reportType == "IHACAllocationsByCACDept" ||
          reportType == "IHACCACDetail" ||
          reportType == "ProjectDetail" ||
          reportType == "ProjectExpense" ||
          reportType == "IHACSummaryEP" ||
          reportType == "IHACSummaryED" ||
          reportType == "IHACSummaryEA" ||
          reportType == "IHACSummaryES" ||
          reportType == "IHACExpenseRevenueSummary" ||
          reportType == "IHACSummaryPayroll" ||
          reportType == "IHACSummaryBenefits" ||
          reportType == "IHACProg" ||
          reportType == "IHACDept" ||
          reportType == "IHACAcc" ||
          reportType == "IHACSub" ||
          reportType == "CustomIHACReport" ||
          reportType == "CustomIHACReport2" ||
          reportType == "CustomIHACReport3" ||
          reportType == "IHACBalance" ||
          reportType == "VouchersWithoutIHAC" ||
          reportType == "TransPODetailed" ||
          reportType == "TransPOSummary"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };
          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            ProgramID: stateProgram ? stateProgram.code : "",
            DepartmentID: stateDepartment ? stateDepartment.code : "",
            AccountID: stateAccount ? stateAccount.code : "",
            SubAccountID: stateSubAccount ? stateSubAccount.code : "",
            IHPO: stateIHPO ? stateIHPO.text : "",
            Vendor: stateVendor ? stateVendor.id : "",
            ProgramToExclude: programToExcludeId ?? "",
            OptionsParameter: optionsPara,
          };
          if (
            reportType == "ProjectDetail" ||
            reportType == "ProjectExpense"
          ) {
            data.DictionaryParameters.Tag = "";
          } else if (
            reportType == "IHACProg" ||
            reportType == "IHACDept" ||
            reportType == "IHACAcc" ||
            reportType == "IHACSub"
          ) {
            data.DictionaryParameters.Tag = "0";
          } else if (reportType == "VouchersWithoutIHAC") {
            data.DictionaryParameters.Tag = "s";
          } else {
            data.DictionaryParameters.Tag = "s,i";
          }
        }

        if (
          reportType == "SACDetail" ||
          reportType == "SACDetailByRow" ||
          reportType == "SACSummary" ||
          reportType == "SACSummaryByRow" ||
          reportType == "SACCACDetail" ||
          reportType == "SACPayDetail" ||
          reportType == "SACPayDetailByRow" ||
          reportType == "SACPaySummary" ||
          reportType == "SACPaySummaryByRow" ||
          reportType == "SACNoPayDetail" ||
          reportType == "SACNoPayDetailByRow" ||
          reportType == "SACNoPaySummary" ||
          reportType == "SACNoPaySummaryByRow" ||
          reportType == "SACOldExpenseCodes"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };

          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            FundID: stateFund ? stateFund.id : "",
            CACID: stateCAC ? stateCAC.id : "",
            SAC: stateSAC ?? "",
            Page: statePage ? statePage.sac : "",
            Tag: "s,o",
            OptionsParameter: optionsPara,
          };
        }

        if (
          reportType == "AssetDescription" ||
          reportType == "AssetLocation" ||
          reportType == "AssetByBuilding" ||
          reportType == "AssetByNumber" ||
          reportType == "AssetInventoryNo" ||
          reportType == "AssetSortedByBuilding" ||
          reportType == "AssetByArea" ||
          reportType == "AssetSortByAssetName" ||
          reportType == "AssetByTypeOfAsset" ||
          reportType == "AssetValueAmount" ||
          reportType == "AssetFullyDep" ||
          reportType == "AssetNotFullyDep" ||
          reportType == "AssetAllDep" ||
          reportType == "AssetFullyDepLegal" ||
          reportType == "AssetNotFullyDepLegal" ||
          reportType == "AssetAllDepLegal"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };

          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            OptionsParameter: optionsPara,
          };
          if (
            reportType == "AssetFullyDep" ||
            reportType == "AssetNotFullyDep" ||
            reportType == "AssetFullyDepLegal" ||
            reportType == "AssetNotFullyDepLegal"
          ) {
            data.DictionaryParameters.Tag = "s";
          } else {
            data.DictionaryParameters.Tag = "";
          }
        }

        //Inventory Report
        if (
          reportType == "InventoryByCatagory" ||
          reportType == "InventoryByCatagoryByBuilding" ||
          reportType == "InventoryByBuildingRoom" ||
          reportType == "InventoryByRoom" ||
          reportType == "InventoryByProgramBuilding" ||
          reportType == "InventoryValueAmount" ||
          reportType == "DuplicateTagNumbers"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };

          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            Category: stateCategory ? stateCategory.id : "",
            Tag: "",
            OptionsParameter: optionsPara,
          };
        }
        if (
          reportType == "RevenueCounty" ||
          reportType == "RevByMonth" ||
          reportType == "PreviousYearRev" ||
          reportType == "RevenueDrillDown" ||
          reportType == "CustomRevenue"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };

          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            CountyCode: "",
            Tag: "s",
            OptionsParameter: optionsPara,
          };
        }
        if (
          reportType == "RevReceived" ||
          reportType == "RevenueVendorList"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };

          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            Vendor: stateCustomer ? stateCustomer.id : "",
            OptionsParameter: optionsPara,
          };
          if (reportType == "RevenueVendorList") {
            data.DictionaryParameters.Tag = "";
          } else {
            data.DictionaryParameters.Tag = "s";
          }
        }

        //IHAC Revenue
        if (
          reportType == "IHACRevDetail" ||
          reportType == "IHACRevDetailExport" ||
          reportType == "IHACPSum" ||
          reportType == "IHACPDSum" ||
          reportType == "IHACPDASum" ||
          reportType == "IHACPDASSum" ||
          reportType == "IHACCacPDASSum" ||
          reportType == "IHACCACSACDetail" ||
          reportType == "ProjectRevenue"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };

          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            ProgramID: stateProgram ? stateProgram.code : "",
            DepartmentID: stateDepartment ? stateDepartment.code : "",
            AccountID: stateAccount ? stateAccount.code : "",
            SubAccountID: stateSubAccount ? stateSubAccount.code : "",
            Vendor: stateCustomer ? stateCustomer.id : "",
            ProjectRevenue: "",
            OptionsParameter: optionsPara,
          };
          if (reportType == "IHACPDASSum") {
            data.DictionaryParameters.Tag = "ii";
          } else if (reportType == "IHACCACSACDetail") {
            data.DictionaryParameters.Tag = "s,i";
          } else if (reportType == "ProjectRevenue") {
            data.DictionaryParameters.Tag = "";
          } else {
            data.DictionaryParameters.Tag = "i";
          }
        }

        if (
          reportType == "SACRevDetail" ||
          reportType == "SACRevDetailByRow" ||
          reportType == "SACRevDetWDesc" ||
          reportType == "SACRevDetWDescByRow" ||
          reportType == "SACRevSummary" ||
          reportType == "SACRevSummaryByRow" ||
          reportType == "SACIHACCACRevDetail"
        ) {
          data = {
            ReportName: reportType,
            DictionaryParameters: {},
            exportType: fileType,
          };

          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            Page: statePage ? statePage.sac : "",
            SAC: stateSAC,
            OtherRev: otherRevPage?.id,
            OptionsParameter: optionsPara,
          };
          if (
            reportType == "SACRevDetailByRow" ||
            reportType == "SACRevDetWDescByRow" ||
            reportType == "SACRevSummaryByRow"
          ) {
            data.DictionaryParameters.Tag = "s,o";
          } else {
            data.DictionaryParameters.Tag = "s";
          }
        }
        let url = null;
        if (
          reportType == "ARAging" ||
          reportType == "Statement" ||
          reportType == "StatementCurrent" ||
          reportType == "ARHistory" ||
          reportType == "UncollectedOnly"
        ) {
          url = ReportsEndPoints.GenerateReportAR;
          data = {
            ReportName: reportType,
            exportType: fileType,
            DictionaryParameters: {},
          };

          data.DictionaryParameters = {
            StartDate: selectedStartDate,
            EndDate: selectedEndDate,
            ComboRecFrom: stateCustomer?.id,
            ComboRecFrom_Column_0: stateCustomer?.name,
          };
        }

        axiosInstance({
          method: "POST",
          maxBodyLength: Infinity,
          url: url || ReportsEndPoints.GenerateReport,
          data: {
            ...data
          },
        })
          .then((response) => {
            if (fileType == "PDF") {
              PDFViewer(response.data, "application/pdf");
            } else if (fileType == "XLS") {
              const binaryString = window.atob(response.data);
              const byteArray = new Uint8Array(binaryString.length);

              for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
              }

              const blob = new Blob([byteArray], { type: "text/XLS" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `Report${moment(new Date()).format("MMDDYYYY")}.xls`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else if (fileType == "CSV") {
              const binaryString = window.atob(response.data);
              const byteArray = new Uint8Array(binaryString.length);

              for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
              }

              const blob = new Blob([byteArray], { type: "text/csv:charset=utf-8" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `Report${moment(new Date()).format("MMDDYYYY")}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {

            }

            setOptionsPara(defaultSelected);
            setTextBoxValue("");
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            if (submitButton) {
              submitButton.disabled = false;
            }
          });
      }
    }
  };

  const ResetDropdown = () => {
    setStateFund();
    setStateCAC();
    setStateVendor();
    setVendorAmount();
    setStatePo();
    setOtherRevPage();
    setStateProgram();
    setStateDepartment();
    setStateAccount();
    setStateSubAccount();
    setStateIHPO();
    setStateSAC();
    setStatePage();
    setStateCategory();
    setStateCustomer();
    setStateSacPage();
  };
  const [options, setOptions] = useState({});
  const onCheckBox = (e) => {
    if (e?.target?.value) {
      setOptions({ [e?.target?.name]: e?.target?.value });
      if (e?.target?.value) {
        if (reportChecked) {
          ResetDropdown();
        } else {
          setReportChecked(true);
        }
        setReportFormKey(reportFormKey + 2);
      }
    } else {
      setOptions({});
    }
  };

  const defaultSelected = [
    // "SuppressInactiveFunds",
    // "SuppressInactiveAccountCodes",
    // "VendorByPostDate",
    // "SuppressInactiveIHACs",
    // "SuppresZero",
    // "Surpress00",
    // "PayrollandBenefitsByPostDate",
  ];

  const [optionsPara, setOptionsPara] = useState(defaultSelected);

  const onCheckBoxPara = (e) => {
    ;
    if (e?.target?.value) {
      setOptionsPara((prev) => [...prev, e?.target?.name]);
    } else {
      setOptionsPara((prev) => prev.filter((item) => item !== e?.target?.name));
    }
  };
  const [textBoxValue, setTextBoxValue] = useState("");
  const [vendorAmount, setVendorAmount] = useState("")

  const downloadReport = (e) => {
    downloadReportsCommonFunction(Object.keys(options)[0]);
  };

  const SearchPO = (searchText) => {
    axiosInstance({
      method: "GET",
      url: PurchaseOrderEndPOints.GetPurchaseOrder + "?poNumber=" + searchText,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data.data;
        setPODDList(data);
        poRef.current = data;
      })
      .catch(() => { });
  };

  const POddlOnChange = async (event) => {
    if (event.syntheticEvent.type == "change") {
      SearchPO(event.target.value);
    } else {
      let poIndex = PODDList.findIndex(
        (x) => x.poNumber == event.target.value.poNumber
      );
      if (poIndex >= 0) {
        setStatePo(PODDList[poIndex]);
      } else {
        setStatePo();
      }
    }
  };

  const PoitemRender = (li, itemProps) => {
    const itemChildren = (
      <div className="d-flex flex-column">
        <span
          style={{
            fontWeight: "bold",
          }}
        >
          {li.props.children}
        </span>
      </div>
    );
    return React.cloneElement(li, li.props, itemChildren);
  };
  let IHACExpenseOptions = [
    {
      id: "NewPageAfterProg",
      label: "New Page After Program",
    },
    {
      id: "NewPageAfterDept",
      label: "New Page After Department",
    },
    {
      id: "SuppressInactiveIHACs",
      label: "Suppress Inactive IHACs",
    },
    {
      id: "SuppresZero",
      label: "Suppress Zero Amounts",
    },
    {
      id: "Surpress00",
      label: "Suppress 00-00-0000-0000",
    },
    {
      id: "SuppressSubAccounts",
      label: "Suppress SubAccounts",
    },
    {
      id: "OverRideCal",
      label: "Override Calendar Month",
    },
    {
      id: "VouchersByWrittenDate",
      label: "Vouchers By Written Date",
    },
    {
      id: "PayrollandBenefitsByPostDate",
      label: "Payroll and Benefits By Post Date",
    },
    {
      id: "ShowNegaUnspent",
      label: "Show Negative Unspent Amounts",
    },
    {
      id: "SuppressPayrollAndBenefits",
      label: "Suppress Payroll And Benefits",
    },
    {
      id: "DoNotShowVoucherNo",
      label: "Do Not Show Voucher No",
    },
    {
      id: "SupressDepartment",
      label: "Suppress Department",
    },
  ];
  let IHACExpenseCheckBoxesG1 = [
    {
      id: "IHACProg",
      label: "In House Programs",
    },
    {
      id: "IHACDept",
      label: "In House Departments",
    },
    {
      id: "IHACAcc",
      label: "In House Accounts",
    },
    {
      id: "IHACSub",
      label: "In House Sub-Accounts",
    },
  ];
  let IHACExpenseCheckBoxesG2 = [
    {
      id: "IHACAllocationsByCACDept",
      label: "Allocations By CAC (By Department)",
    },
    {
      id: "IHACCACDetail",
      label: "IHAC / CAC / SAC Expense Detail",
    },
  ];
  let IHACExpenseCheckBoxes = [
    {
      id: "IHACDetail",
      label: "IHAC Expense Detail",
    },
    {
      id: "IHACDetailExport",
      label: "IHAC Expense Detail (Export)",
    },
    {
      id: "IHACDetailByName",
      label: "IHAC Expense Detail Sorted By Name",
    },
    {
      id: "IHACDetailWithCAC",
      label: "IHAC Expense Detail With CAC",
    },
    {
      id: "IHACDetailWithWarrantNoCACName",
      label: "IHAC Expense Detail With Warrant No",
    },
    {
      id: "IHACDetailNotPosted",
      label: "IHAC Detail Not Posted by Date Written",
    },
    {
      id: "IHACAllocations",
      label: "IHAC Allocations",
    },
    {
      id: "IHACSummaryP",
      label: "IHAC Expense Summary (P)",
    },
    {
      id: "IHACSummaryD",
      label: "IHAC Expense Summary (P, D)",
    },
    {
      id: "IHACSummaryA",
      label: "IHAC Expense Summary (P, D, A)",
    },
    {
      id: "IHACSummaryS",
      label: "IHAC Expense Summary (P, D, A, S)",
    },
    {
      id: "IHACSubAccountSummary",
      label: "IHAC Expense Summary (S)",
    },
    {
      id: "IHACSummaryPA",
      label: "IHAC Expense Summary (P, A)",
    },
    {
      id: "IHACDetailPayrollBenefits",
      label: "IHAC Payroll / Benefits Detailed (P)",
    },
    {
      id: "IHACPayrollBenefitsSummary",
      label: "IHAC Payroll / Benefits Summary (Emp)",
    },
    {
      id: "IHACAllocationsByCAC",
      label: "Allocations By CAC (By Program)",
    },

    {
      id: "ProjectDetail",
      label: "Project Detail",
    },
    {
      id: "ProjectExpense",
      label: "Project Expenses",
    },
    {
      id: "IHACSummaryEP",
      label: "IHAC Expense Summary w/ Encumbrance (P)",
    },
    {
      id: "IHACSummaryED",
      label: "IHAC Expense Summary w/ Encumbrance (P, D)",
    },
    {
      id: "IHACSummaryEA",
      label: "IHAC Expense Summary w/ Encumbrance (P, D, A)",
    },
    {
      id: "IHACSummaryES",
      label: "IHAC Expense Summary w/ Encumbrance (P, D, A, S)",
    },
    {
      id: "IHACExpenseRevenueSummary",
      label: "IHAC Expense / Revenue Summary",
    },
    {
      id: "IHACSummaryPayroll",
      label: "IHAC Summary Employee Payroll Only",
    },
    {
      id: "IHACSummaryBenefits",
      label: "IHAC Summary Employee Benefits Only",
    },
    {
      id: "IHACBalance",
      label: "In House Balance",
    },
    {
      id: "VouchersWithoutIHAC",
      label: "Vouchers Without IHAC",
    },
  ];

  const IHACEmailCheckBoxes = [
    {
      id: "IHACDetailEmail",
      label: "IHAC Detail",
    },
    {
      id: "IHACSummarEAEmail",
      label: "IHAC Expense Summary With Encumbrance (PDA)",
    },
    {
      id: "NoPayrollOrBenEmail",
      label: "Suppress Payroll And Benefits",
    },
  ];
  const sacExpenseOptionsParameter = [
    {
      id: "SurpressCapitalCosts",
      label: "Suppress Capital Costs",
    },
    {
      id: "SACPageBreaks",
      label: "Page Breaks",
    },
    {
      id: "ShowVoucherNumberOnSAC",
      label: "Show Voucher Number",
    },
    {
      id: "SurpressZeroSAC",
      label: "Suppress $0.00 SAC Amounts",
    },
    {
      id: "UseInvoiceDescriptionforSACDetailReports",
      label: "Use Invoice Description for SAC Detail Reports",
    },
    {
      id: "OnlyShowMissingSACAmounts",
      label: "Only show missing SAC amounts",
    },
  ];
  const countyRevenueCheckboxes = [
    {
      id: "RevenueCounty",
      label: "Revenue",
    },
    {
      id: "RevByMonth",
      label: "Revenue Report By Month",
    },
    {
      id: "PreviousYearRev",
      label: "Revenue Comparison Previous Year",
    },
    {
      id: "RevenueDrillDown",
      label: "Revenue Drill Down",
    },
    {
      id: "CustomRevenue",
      label: "Custom Revenue",
    },
  ];
  const countyRevenueCheckboxes2 = [
    {
      id: "RevReceived",
      label: "Revenue Received",
    },
    {
      id: "RevenueVendorList",
      label: "Revenue Vendor List",
    },
  ];

  const ihacRevenueOptionsCheckboxes = [
    {
      id: "OverRideCalendarMonth",
      label: "Over Ride Calendar Month",
    },
    {
      id: "SuppressInactiveIHACRevenue",
      label: "Suppress Inactive IHACs",
    },
  ];
  const ihacRevenueCheckboxes = [
    {
      id: "IHACRevDetail",
      label: "In House Revenue Detailed",
    },
    {
      id: "IHACRevDetailExport",
      label: "In House Revenue Detailed (Export)",
    },
    {
      id: "IHACPSum",
      label: "IHAC Revenue Summary (Prog)",
    },
    {
      id: "IHACPDSum",
      label: "IHAC Revenue Summary (Prog, Dept)",
    },
    {
      id: "IHACPDASum",
      label: "IHAC Revenue Summary (Prog, Dept, Acc.)",
    },
    {
      id: "IHACPDASSum",
      label: "IHAC Revenue Summary (Prog, Dept, Acc., Sub)",
    },
    {
      id: "IHACCacPDASSum",
      label: "IHAC Revenue Summary (CAC, Prog, Dept, Acc., Sub)",
    },
    {
      id: "IHACCACSACDetail",
      label: "IHAC / CAC / SAC Revenue Detail",
    },
    {
      id: "ProjectRevenuesIhac",
      label: "Project Revenue",
    },
  ];
  const sacRevenueCheckboxes = [
    {
      id: "SACRevDetail",
      label: "State Revenue Detailed (CBCR)",
    },
    {
      id: "SACRevDetailByRow",
      label: "State Revenue Detailed",
    },
    {
      id: "SACRevDetWDesc",
      label: "State Revenue Detailed with Other Rev Description (CBCR)",
    },
    {
      id: "SACRevDetWDescByRow",
      label: "State Revenue Detailed with Other Rev Description",
    },
    {
      id: "SACRevSummary",
      label: "State Revenue Summary (CBCR)",
    },
    {
      id: "SACRevSummaryByRow",
      label: "State Revenue Summary ",
    },
    {
      id: "SACIHACCACRevDetail",
      label: "SAC / CAC / IHAC Revenue Detail",
    },
  ];
  const sacExpenseCheckboxes = [
    {
      id: "SACDetail",
      label: "State Expenses Detailed (CBCR)",
    },
    {
      id: "SACDetailByRow",
      label: "State Expenses Detailed",
    },
    {
      id: "SACSummary",
      label: "State Expenses Summary (CBCR)",
    },
    {
      id: "SACSummaryByRow",
      label: "State Expenses Summary",
    },
    {
      id: "SACPayDetail",
      label: "State Expenses Payroll Only (Detailed, CBCR)",
    },
    {
      id: "SACCACDetail",
      label: "State Expenses Detailed Grouped by CAC",
    },
    {
      id: "SACPayDetailByRow",
      label: "State Expenses Payroll Only (Detailed)",
    },
    {
      id: "SACPaySummary",
      label: "State Expenses Payroll Only By SAC/Employee (Summary, CBCR)",
    },
    {
      id: "SACPaySummaryByRow",
      label: "State Expenses Payroll Only By SAC/Employee (Summary)",
    },
    {
      id: "SACNoPayDetail",
      label: "State Expenses Without Payroll or Benefits (Detailed, CBCR)",
    },
    {
      id: "SACNoPayDetailByRow",
      label: "State Expenses Without Payroll or Benefits (Detailed)",
    },
    {
      id: "SACNoPaySummary",
      label: "State Expenses Without Payroll or Benefits (Summary, CBCR)",
    },
    {
      id: "SACNoPaySummaryByRow",
      label: "State Expenses Without Payroll or Benefits (Summary)",
    },
  ];
  const assetOptionsParameter = [
    {
      id: "SuppressInactiveAssets",
      label: "Suppress Inactive",
    },
  ];
  const assetCheckboxes = [
    {
      id: "AssetDescription",
      label: "Assets By Description",
    },
    {
      id: "AssetLocation",
      label: "Assets By Location",
    },
    {
      id: "AssetByBuilding",
      label: "Assets By Building",
    },
    {
      id: "AssetByNumber",
      label: "Assets By Asset Number",
    },
    {
      id: "AssetInventoryNo",
      label: "Assets Sorted By Inventory Number",
    },
    {
      id: "AssetSortedByBuilding",
      label: "Assets Sorted By Building",
    },
    {
      id: "AssetByArea",
      label: "Assets Sorted By Area",
    },
    {
      id: "AssetSortByAssetName",
      label: "Assets Sorted By Asset Name",
    },
    {
      id: "AssetByTypeOfAsset",
      label: "Assets Sorted By Type Of Asset",
    },
    {
      id: "AssetValueAmount",
      label: "Asset with Value Amount",
    },
    {
      id: "AssetFullyDep",
      label: "Assets Totally Depreciated (By Date Span)",
    },
    {
      id: "AssetNotFullyDep",
      label: "Assets Not Totally Depreciated (By Date Span)",
    },
    {
      id: "AssetAllDep",
      label: "All Assets",
    },
    {
      id: "AssetFullyDepLegal",
      label: "Assets Totally Depreciated Legal (By Date Span)",
    },
    {
      id: "AssetNotFullyDepLegal",
      label: "Assets Not Totally Depreciated Legal (By Date Span)",
    },

    {
      id: "AssetAllDepLegal",
      label: "All Assets",
    },
  ];
  const inventoryOptionsParameter = [
    {
      id: "PageBreaksInventory",
      label: "Page Breaks",
    },
    {
      id: "NoRemovedInventory",
      label: "Do Not Include Removed Inventory",
    },
  ];
  const inventoryCheckboxes = [
    {
      id: "InventoryByCatagory",
      label: "Inventory by Category / Inventory No",
    },
    {
      id: "InventoryByCatagoryByBuilding",
      label: "Inventory by Category / Building",
    },
    {
      id: "InventoryByBuildingRoom",
      label: "Inventory by Building / Room",
    },
    {
      id: "InventoryByRoom",
      label: "Inventory by Room",
    },
    {
      id: "InventoryByProgramBuilding",
      label: "Inventory by Program / Building / Room",
    },
    {
      id: "InventoryValueAmount",
      label: "Inventory with Value Amount",
    },
    {
      id: "DuplicateTagNumbers",
      label: "Duplicate Tag Numbers",
    },
  ];

  return (
    <>
      {checkPrivialgeGroup("ReportM", 1) && (
        <>
          {isOpen && (
            <PdfViewer
              pdfURL={pdfURL}
              setPdfURL={setPdfURL}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          )}

          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                Reports
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Crystal Reports
              </li>
            </ol>
          </nav>
          <Form
            className="d-flex align-items-start justify-content-center"
            onSubmit={handleSubmit}
            ref={formRef}
            render={(formRenderProps) => (
              <FormElement
                style={{
                  maxWidth: 650,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <fieldset className={""}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <Field
                      id={"startDate"}
                      name={"startDate"}
                      label={"Start Date*"}
                      component={FormDatePicker}
                      onChange={updateStartDate}
                      value={selectedStartDate}
                      validator={startDateValidator}
                      wrapperstyle={{
                        width: "50%",
                        marginRight: "10px",
                      }}
                    />
                    <div className="">
                      <Field
                        id={"endDate"}
                        name={"endDate"}
                        label={"End Date*"}
                        component={FormDatePicker}
                        onChange={updateEndDate}
                        wrapperstyle={{
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>
                </fieldset>
                {checkPrivialgeGroup("ReportShowB", 1) && (
                  <>
                    <div style={{
                      marginTop: "40px",
                      marginLeft: "10px"
                    }}>
                      <DropDownList data={["PDF", "XLS"]}
                        value={fileType} onChange={(e) => {
                          setFileType(e?.value)
                        }}
                        wrapperstyle={{
                          width: "150px",
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      themeColor={"primary"}
                      style={{
                        marginTop: "40px",
                        marginLeft: "10px"
                      }}
                      onClick={(e) => downloadReport(e)}
                    >
                      Show
                    </Button>
                  </>
                )}
              </FormElement>
            )}
          />

          <br></br>
          <TabStrip selected={selectedTab} onSelect={handleTabSelect}>
            {checkPrivialgeGroup("ViewRCETab", 1) && (
              <TabStripTab title={"County Expense"}>
                <Form
                  key={reportFormKey}
                  initialValues={{
                    transferFrom: stateFund,
                    countyAccountingCode: stateCAC,
                  }}
                  onSubmit={() => { }}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <div
                          style={{
                            display: "flex",
                            width: "100%",
                          }}
                        >
                          <Field
                            id={"transferFrom"}
                            name={"transferFrom"}
                            label={"Fund Code"}
                            textField="fundCode"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            data={
                              POSearch || searchTransferFromData.length
                                ? searchTransferFromData
                                : fundFromDropdownData
                            }
                            value={stateFund}
                            columns={transferColumns}
                            onChange={ddlFundHandleChange}
                            placeholder="Funds"
                            filterable={true}
                            onFilterChange={onPOFilterChange}
                            wrapperstyle={{
                              width: "37%",
                            }}
                          />
                          <Field
                            id={"countyAccountingCode"}
                            name={"countyAccountingCode"}
                            label={"County Expense Code"}
                            textField="text"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            value={stateCAC}
                            data={
                              CACDDListSearch || searchCACDDListData.length
                                ? searchCACDDListData
                                : CACDDList
                            }
                            columns={CACColumns}
                            filterable={true}
                            onFilterChange={onCACDDFilterChange}
                            placeholder="Search CAC..."
                            onChange={() =>
                              ddlProgramhandleChange(formRenderProps)
                            }
                            wrapperstyle={{
                              width: "37%",
                            }}
                          />
                        </div>
                      </fieldset>
                      <div
                        style={{
                          display: "flex",
                          width: "100%",
                          paddingTop: "20px",
                        }}
                      >
                        <div>
                          <h6>Reports</h6>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <h6>County Expense Report</h6>
                              <Field
                                id="Fund"
                                name="Fund"
                                label="Fund"
                                checked={options.Fund == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="Expenditure"
                                name="Expenditure"
                                label="Expenditure"
                                checked={options.Expenditure == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="ExpenditureSummaryName"
                                name="ExpenditureSummaryName"
                                label="Expenditure Summary"
                                checked={
                                  options.ExpenditureSummaryName == true
                                }
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="ExpensePerMonth"
                                name="ExpensePerMonth"
                                label="Expense Per Month"
                                checked={options.ExpensePerMonth == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="PreviousYearsBalance"
                                name="PreviousYearsBalance"
                                label="Expense Comparison Previous Year"
                                checked={options.PreviousYearsBalance == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="Adjustments"
                                name="Adjustments"
                                label="Adjustments"
                                checked={options.Adjustments == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                            </div>

                            <div>
                              <h6>Voucher Reports</h6>
                              <Field
                                id="VoucherByDateWritten"
                                name="VoucherByDateWritten"
                                label="Voucher Report (Date Written)"
                                checked={options.VoucherByDateWritten == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="VoucherByDatePosted"
                                name="VoucherByDatePosted"
                                label="Voucher Report (Date Posted)"
                                checked={options.VoucherByDatePosted == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="VoucherUnapproved"
                                name="VoucherUnapproved"
                                label="Voucher Report (Unapproved)"
                                checked={options.VoucherUnapproved == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="VoucherPrepaidListName"
                                name="VoucherPrepaidListName"
                                label="Voucher Prepaid List"
                                checked={
                                  options.VoucherPrepaidListName == true
                                }
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="VoucherWithoutPDF"
                                name="VoucherWithoutPDF"
                                label="Voucher Without a PDF"
                                checked={options.VoucherWithoutPDF == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="CustomVoucherList"
                                name="CustomVoucherList"
                                label="Custom Voucher Report"
                                checked={options.CustomVoucherList == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="CustomExpenditure"
                                name="CustomExpenditure"
                                label="Custom Expenditure"
                                checked={options.CustomExpenditure == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="CustomExpenditure2"
                                name="CustomExpenditure2"
                                label="Custom Expenditure2"
                                checked={options.CustomExpenditure2 == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="CustomExpenditure3"
                                name="CustomExpenditure3"
                                label="Custom Expenditure3"
                                checked={options.CustomExpenditure3 == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="SACCACSummary"
                                name="SACCACSummary"
                                label="Expenses Summary Grouped by CAC Report"
                                checked={options.SACCACSummary == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="IHACCACDetailGroupByCAC"
                                name="IHACCACDetailGroupByCAC"
                                label="CAC / IHAC /  SAC Expense Detail Grouped by CAC"
                                checked={
                                  options.IHACCACDetailGroupByCAC == true
                                }
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h6>Options Parameter</h6>
                          <div>
                            <Field
                              id="SuppressInactiveFunds"
                              name="SuppressInactiveFunds"
                              label="Suppress Inactive Funds"
                              checked={optionsPara.includes(
                                "SuppressInactiveFunds"
                              )}
                              component={FormCheckbox}
                              onChange={onCheckBoxPara}
                            />
                            <Field
                              id="SuppressInactiveAccountCodes"
                              name="SuppressInactiveAccountCodes"
                              label="Suppress Inactive Account Codes"
                              checked={optionsPara.includes(
                                "SuppressInactiveAccountCodes"
                              )}
                              component={FormCheckbox}
                              onChange={onCheckBoxPara}
                            />
                            <Field
                              id="ShowExpenseDetail"
                              name="ShowExpenseDetail"
                              label="Show Expense Detail"
                              checked={optionsPara.includes(
                                "ShowExpenseDetail"
                              )}
                              component={FormCheckbox}
                              onChange={onCheckBoxPara}
                            />
                            <Field
                              id="SortByDate"
                              name="SortByDate"
                              label="(Sort by Date)"
                              checked={optionsPara.includes("SortByDate")}
                              component={FormCheckbox}
                              onChange={onCheckBoxPara}
                            />
                          </div>
                        </div>
                      </div>
                    </FormElement>
                  )}
                />
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRPOTab", 1) && (
              <TabStripTab title={"Purchase Order"}>
                <Form
                  key={reportFormKey}
                  initialValues={{
                    Vendor: stateVendor,
                    poNumber: statePo,
                    countyAccountingCode: stateCAC,
                    program: stateProgram,
                    department: stateDepartment,
                    account: stateAccount,
                    subAccount: stateSubAccount,
                    ihpo: stateIHPO,
                  }}
                  onSubmit={() => { }}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Field
                            id={"Vendor"}
                            name={"Vendor"}
                            label={"Vendor"}
                            textField="name"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={VendorDDList}
                            value={stateVendor}
                            onChange={VendorddlOnChange}
                            placeholder="Search Vendor..."
                            wrapperstyle={{
                              width: "30%",
                            }}
                            //validator={supplierValidator}
                            filterable={true}
                            //onFilterChange={onFilterChange}
                            itemRender={itemRender}
                          />
                          <Field
                            id={"poNumber"}
                            name={"poNumber"}
                            label={"Purchase Order"}
                            textField="poNumber"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={PODDList}
                            value={statePo}
                            onChange={POddlOnChange}
                            placeholder="Search PO Number..."
                            itemRender={PoitemRender}
                            filterable={true}
                            onFilterChange={onPOFilterChange}
                            wrapperstyle={{
                              width: "30%",
                            }}
                          />
                          <Field
                            id={"countyAccountingCode"}
                            name={"countyAccountingCode"}
                            label={"County Expense Code"}
                            textField="text"
                            dataItemKey="id"
                            component={FormMultiColumnComboBox}
                            value={stateCAC}
                            data={
                              CACDDListSearch || searchCACDDListData.length
                                ? searchCACDDListData
                                : CACDDList
                            }
                            columns={CACColumns}
                            filterable={true}
                            onFilterChange={onCACDDFilterChange}
                            placeholder="Search CAC..."
                            onChange={() =>
                              ddlProgramhandleChange(formRenderProps)
                            }
                            wrapperstyle={{
                              width: "30%",
                            }}
                          />
                        </div>

                        <div className="mt-5">
                          <h6>County Purchase Order Reports</h6>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "70%",
                            }}
                          >
                            <div>
                              <Field
                                id="POByNumber"
                                name="POByNumber"
                                label="POs By PO Number"
                                checked={options.POByNumber == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="POsByCountyCode"
                                name="POsByCountyCode"
                                label="POs By County Code"
                                checked={options.POsByCountyCode == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="POHistory"
                                name="POHistory"
                                label="PO History"
                                checked={options.POHistory == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="POHistoryVoucherPostDate"
                                name="POHistoryVoucherPostDate"
                                label="PO History (By Voucher Post Date)"
                                checked={
                                  options.POHistoryVoucherPostDate == true
                                }
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />

                              <Field
                                id="POWithIHPOs"
                                name="POWithIHPOs"
                                label="POs With IHPO's"
                                checked={options.POWithIHPOs == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="POByCACEncumberedBalance"
                                name="POByCACEncumberedBalance"
                                label="PO Balance By CAC by Date Span"
                                checked={
                                  options.POByCACEncumberedBalance == true
                                }
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                            </div>
                            <div>
                              <Field
                                id="POBalanceByDate"
                                name="POBalanceByDate"
                                label="PO Balance by Date Span"
                                checked={options.POBalanceByDate == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="CustomPOReport"
                                name="CustomPOReport"
                                label="Custom PO Report"
                                checked={options.CustomPOReport == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                            </div>
                            <div>
                              <h6>Options Parameter</h6>
                              <Field
                                id="ClosedPOsOnly"
                                name="ClosedPOsOnly"
                                label="Closed PO's Only"
                                checked={optionsPara.includes("ClosedPOsOnly")}
                                component={FormCheckbox}
                                onChange={onCheckBoxPara}
                              />
                              <Field
                                id="OpenPOsOnly"
                                name="OpenPOsOnly"
                                label="Open PO's Only"
                                checked={optionsPara.includes("OpenPOsOnly")}
                                component={FormCheckbox}
                                onChange={onCheckBoxPara}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5">
                          <h6>In House Purchase Order Reports</h6>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Field
                              id={"program"}
                              name={"program"}
                              label={"Program"}
                              textField="text"
                              dataItemKey="id"
                              component={FormDropDownList}
                              data={programDropdownData}
                              value={stateProgram}
                              onChange={(value) =>
                                ihacExpenceProgramhandleChange(value)
                              }
                              placeholder="Search program..."
                              wrapperstyle={{
                                width: "19%",
                              }}
                              //validator={supplierValidator}
                              filterable={true}
                              //onFilterChange={onFilterChange}
                              itemRender={itemRender}
                            />

                            <Field
                              id={"department"}
                              name={"department"}
                              label={"Department"}
                              textField="text"
                              dataItemKey="id"
                              component={FormDropDownList}
                              data={departmentDropdownData}
                              value={stateDepartment}
                              placeholder="Search department..."
                              onChange={(value) =>
                                ihacExpenceDepartmenthandleChange(value)
                              }
                              wrapperstyle={{
                                width: "19%",
                              }}
                              //validator={supplierValidator}
                              filterable={true}
                              //onFilterChange={onFilterChange}
                              itemRender={itemRender}
                            />

                            <Field
                              id={"account"}
                              name={"account"}
                              label={"Account"}
                              textField="text"
                              dataItemKey="id"
                              component={FormDropDownList}
                              data={accountDropdownData}
                              value={stateAccount}
                              placeholder="Search account..."
                              onChange={(value) =>
                                ihacExpenceAccounthandleChange(value)
                              }
                              wrapperstyle={{
                                width: "19%",
                              }}
                              //validator={supplierValidator}
                              filterable={true}
                              //onFilterChange={onFilterChange}
                              itemRender={itemRender}
                            />

                            <Field
                              id={"subAccount"}
                              name={"subAccount"}
                              label={"Sub Account"}
                              textField="text"
                              dataItemKey="id"
                              component={FormDropDownList}
                              data={subaccountDropdownData}
                              value={stateSubAccount}
                              placeholder="Search sub account..."
                              onChange={(value) =>
                                ihacExpenceSubAccounthandleChange(value)
                              }
                              wrapperstyle={{
                                width: "19%",
                              }}
                              //validator={supplierValidator}
                              filterable={true}
                              //onFilterChange={onFilterChange}
                              itemRender={itemRender}
                            />

                            <Field
                              id={"ihpo"}
                              name={"ihpo"}
                              label={"IHPO"}
                              textField="text"
                              dataItemKey="id"
                              component={FormDropDownList}
                              data={ihpoDropdownData}
                              value={stateIHPO}
                              placeholder="Search IHPO..."
                              onChange={(value) =>
                                ihacExpenceIHPOhandleChange(value)
                              }
                              wrapperstyle={{
                                width: "19%",
                              }}
                              //validator={supplierValidator}
                              filterable={true}
                              //onFilterChange={onFilterChange}
                              itemRender={itemRender}
                            />
                          </div>
                        </div>

                        <Field
                          id="OpenIHPOs"
                          name="OpenIHPOs"
                          label="Open IHPO's"
                          checked={options.OpenIHPOs == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />

                        <Field
                          id="ClosedIHPOs"
                          name="ClosedIHPOs"
                          label="Closed IHPO's"
                          checked={options.ClosedIHPOs == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />

                        <Field
                          id="AllIHPOs"
                          name="AllIHPOs"
                          label="All IHPO's"
                          checked={options.AllIHPOs == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />

                        <Field
                          id="OpenIHPOsWithPO"
                          name="OpenIHPOsWithPO"
                          label="Open IHPO's With County PO Number"
                          checked={options.OpenIHPOsWithPO == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />

                        <Field
                          id="OpenIHPOs07"
                          name="OpenIHPOs07"
                          label="Open '07 IHPOs"
                          checked={options.OpenIHPOs07 == true}
                          component={FormCheckbox}
                          onChange={onCheckBox}
                        />
                      </fieldset>
                    </FormElement>
                  )}
                />

                <br></br>
                <div className="d-flex">
                  <div>
                  </div>
                </div>
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRVETab", 1) && (
              <TabStripTab title={"Vendor Expense"}>
                <Form
                  onSubmit={() => { }}
                  key={reportFormKey}
                  initialValues={{ Vendor: stateVendor, Amount: vendorAmount }}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "80%",
                          }}
                        >
                          <Field
                            id={"Vendor"}
                            name={"Vendor"}
                            label={"Vendor"}
                            textField="name"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={VendorDDList}
                            value={stateVendor}
                            onChange={VendorddlOnChange}
                            placeholder="Search Vendor..."
                            wrapperstyle={{
                              width: "40%",
                              marginRight: "10px",
                            }}
                            //validator={supplierValidator}
                            filterable={true}
                            //onFilterChange={onFilterChange}
                            itemRender={itemRender}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div>
                            <h6>Reports</h6>
                            <Field
                              id="VendorSumByAmount"
                              name="VendorSumByAmount"
                              label="Summary of Expenses by Amount"
                              checked={options.VendorSumByAmount == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                            <Field
                              id="VendorSumByVendor"
                              name="VendorSumByVendor"
                              label="Summary of Expenses by Vendor"
                              checked={options.VendorSumByVendor == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                            <Field
                              id="VendorSumByVendorByCAC"
                              name="VendorSumByVendorByCAC"
                              label="Summary of Expenses by Amount by CAC"
                              checked={options.VendorSumByVendorByCAC == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                            <Field
                              id="VendorList"
                              name="VendorList"
                              label="Vendor List"
                              checked={options.VendorList == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                            <Field
                              id="VendorExpenseDetail"
                              name="VendorExpenseDetail"
                              label="Vendor Expenses Detailed"
                              checked={options.VendorExpenseDetail == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                            <Field
                              id="VendorExpenseDetailPortriat"
                              name="VendorExpenseDetailPortriat"
                              label="Vendor Expenses Detailed (Portrait)"
                              checked={
                                options.VendorExpenseDetailPortriat == true
                              }
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                          </div>
                          <div>
                            <Field
                              id="VendorExpenseByMonth"
                              name="VendorExpenseByMonth"
                              label="Vendor Expenses by Month"
                              checked={options.VendorExpenseByMonth == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                            <Field
                              id="VendorLabels"
                              name="VendorLabels"
                              label="Vendor Mailing Labels =>"
                              checked={options.VendorLabels == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                            <Field
                              id="VendorAddress"
                              name="VendorAddress"
                              label="Vendor Address by Voucher Written Date Span =>"
                              checked={options.VendorAddress == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                            <Field
                              id="VendorSumByVendorBySAC"
                              name="VendorSumByVendorBySAC"
                              label="Summary of Expenses by Amount by SAC"
                              checked={options.VendorSumByVendorBySAC == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                          </div>
                          <div>
                            <Field
                              id="Amount"
                              name="Amount"
                              label="Amount"
                              spinners={false}
                              component={FormNumericTextBox}
                              value={vendorAmount}
                              onChange={(e) =>
                                setVendorAmount(e?.target?.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key == "Enter") {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>

                          <div>
                            <h6>Options Parameter</h6>
                            <Field
                              id="VendorByPostDate"
                              name="VendorByPostDate"
                              label="Vendor Reports by Post Date"
                              checked={optionsPara.includes("VendorByPostDate")}
                              component={FormCheckbox}
                              onChange={onCheckBoxPara}
                            />
                            <Field
                              id="ActiveVendorsOnly"
                              name="ActiveVendorsOnly"
                              label="Active Vendors Only"
                              checked={optionsPara.includes(
                                "ActiveVendorsOnly"
                              )}
                              component={FormCheckbox}
                              onChange={onCheckBoxPara}
                            />
                          </div>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRIHACETab", 1) && (
              <TabStripTab title={"IHAC Expense"}>
                <Form
                  onSubmit={() => { }}
                  key={reportFormKey}
                  initialValues={{
                    ProgramDropdown: stateProgram,
                    DepartmentDropdown: stateDepartment,
                    AccountDropdown: stateAccount,
                    SubAccountDropdown: stateSubAccount,
                    ihpo: stateIHPO,
                    Vendor: stateVendor,
                  }}
                  ignoreModified={true}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"ProgramDropdown"}
                            name={"ProgramDropdown"}
                            label={"Program"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={programDropdownData}
                            value={stateProgram}
                            onChange={(value) =>
                              ihacExpenceProgramhandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"DepartmentDropdown"}
                            name={"DepartmentDropdown"}
                            label={"Department"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={departmentDropdownData}
                            value={stateDepartment}
                            onChange={(value) =>
                              ihacExpenceDepartmenthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"AccountDropdown"}
                            name={"AccountDropdown"}
                            label={"Account"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={accountDropdownData}
                            value={stateAccount}
                            onChange={(value) =>
                              ihacExpenceAccounthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"SubAccountDropdown"}
                            name={"SubAccountDropdown"}
                            label={"SubAccount"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={subaccountDropdownData}
                            value={stateSubAccount}
                            onChange={(value) =>
                              ihacExpenceSubAccounthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "60%",
                          }}
                        >
                          <Field
                            id={"ihpo"}
                            name={"ihpo"}
                            label={"IHPO"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={ihpoDropdownData}
                            value={stateIHPO}
                            onChange={(value) =>
                              ihacExpenceIHPOhandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />
                          <Field
                            id={"Vendor"}
                            name={"Vendor"}
                            label={"Vendor"}
                            textField="name"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={VendorDDList}
                            value={stateVendor}
                            onChange={(value) =>
                              ihacExpenceVendorhandleChange(value)
                            }
                            placeholder="Search Vendor..."
                            wrapperstyle={{
                              width: "40%",
                              marginRight: "10px",
                            }}
                            //validator={supplierValidator}
                            filterable={true}
                            //onFilterChange={onFilterChange}
                            itemRender={itemRender}
                          />
                          <Field
                            id={"programToExclude"}
                            name={"programToExclude"}
                            label={"Program to Exclude"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={programToExcludeDropdownData}
                            value={programToExcludeId}
                            onChange={(value) =>
                              ihacExpenceProgramToExcludehandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            paddingTop: "20px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr ",
                            }}
                          >
                            {IHACExpenseCheckBoxes.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={options[p.id] == true}
                                  component={FormCheckbox}
                                  onChange={onCheckBox}
                                />
                              );
                            })}
                          </div>
                          <div>
                            {IHACExpenseCheckBoxesG1.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={options[p.id] == true}
                                  component={FormCheckbox}
                                  onChange={onCheckBox}
                                />
                              );
                            })}
                            <br />
                            {IHACExpenseCheckBoxesG2.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={options[p.id] == true}
                                  component={FormCheckbox}
                                  onChange={onCheckBox}
                                />
                              );
                            })}
                          </div>
                          <div>
                            <h6>Options Parameter</h6>
                            {IHACExpenseOptions.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={optionsPara.includes(p.id)}
                                  component={FormCheckbox}
                                  onChange={onCheckBoxPara}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRIHACEmailTab", 1) && (
              <TabStripTab title={"IHAC Email"}>
                <Form
                  onSubmit={() => { }}
                  initialValues={{
                    ProgramDropdown: stateProgram,
                    DepartmentDropdown: stateDepartment,
                    AccountDropdown: stateAccount,
                    SubAccountDropdown: stateSubAccount,
                  }}
                  key={reportFormKey}
                  ignoreModified={true}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"ProgramDropdown"}
                            name={"ProgramDropdown"}
                            label={"Program"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={programDropdownData}
                            value={stateProgram}
                            onChange={(value) =>
                              ihacExpenceProgramhandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"DepartmentDropdown"}
                            name={"DepartmentDropdown"}
                            label={"Department"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={departmentDropdownData}
                            value={stateDepartment}
                            onChange={(value) =>
                              ihacExpenceDepartmenthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"AccountDropdown"}
                            name={"AccountDropdown"}
                            label={"Account"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={accountDropdownData}
                            value={stateAccount}
                            onChange={(value) =>
                              ihacExpenceAccounthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"SubAccountDropdown"}
                            name={"SubAccountDropdown"}
                            label={"SubAccount"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={subaccountDropdownData}
                            value={stateSubAccount}
                            onChange={(value) =>
                              ihacExpenceSubAccounthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />
                          <Field
                            id={"emilComment"}
                            name={"emilComment"}
                            label={"Additional Email Comments"}
                            component={FormTextArea}
                            maxLength={255}
                            onChange={(e) => setTextBoxValue(e?.target?.value)}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />
                        </div>

                        {IHACEmailCheckBoxes.map((p, i) => {
                          return (
                            <Field
                              key={i}
                              id={p.id}
                              name={p.id}
                              label={p.label}
                              checked={options[p.id] == true}
                              component={FormCheckbox}
                              onChange={onCheckBox}
                            />
                          );
                        })}

                        <Button
                          type="button"
                          themeColor={"primary"}
                          className="mt-4"
                        >
                          Email
                        </Button>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRSACETab", 1) && (
              <TabStripTab title={"SAC Expense"}>
                <Form
                  onSubmit={() => { }}
                  initialValues={{
                    Page: statePage,
                    CountyExpenseCode: stateCAC,
                    fund: stateFund,
                    SAC: stateSAC,
                  }}
                  key={reportFormKey}
                  ignoreModified={true}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"Page"}
                            name={"Page"}
                            label={"Page"}
                            textField="sac"
                            dataItemKey="pageId"
                            component={FormMultiColumnComboBox}
                            data={
                              SACSearch || searchCACListData.length
                                ? searchCACListData
                                : sacPageList
                            }
                            filterable={true}
                            onFilterChange={SACFilterChange}
                            columns={PageColumns}
                            value={statePage}
                            onChange={PageOnchange}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"SAC"}
                            name={"SAC"}
                            label={"SAC"}
                            textField="text"
                            dataItemKey="id"
                            component={FormInput}
                            //data={sacDropdownData}
                            onChange={(e) => setStateSAC(e?.target?.value)}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"CountyExpenseCode"}
                            name={"CountyExpenseCode"}
                            label={"County Expense Code"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            value={stateCAC}
                            onChange={countyExpenceCAChandleChange}
                            data={CACDDList}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"fund"}
                            name={"fund"}
                            label={"Fund"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={fundFromDropdownData}
                            value={stateFund}
                            onChange={FundOnChange}
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            paddingTop: "20px",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              width: "80%",
                            }}
                          >
                            {sacExpenseCheckboxes.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={options[p.id] == true}
                                  component={FormCheckbox}
                                  onChange={onCheckBox}
                                />
                              );
                            })}
                          </div>
                          <div>
                            <h6>Options Parameter</h6>
                            {sacExpenseOptionsParameter.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={optionsPara.includes(p.id)}
                                  component={FormCheckbox}
                                  onChange={onCheckBoxPara}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
                {visible && (
                  <SacDialog
                    toggleDialog={toggleDialog}
                    getSacCode={getSacCode}
                    type={7}
                  >
                    {" "}
                  </SacDialog>
                )}
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRAITab", 1) && (
              <TabStripTab title={"Asset/Inventory"}>
                <Form
                  onSubmit={() => { }}
                  key={reportFormKey}
                  initialValues={{ category: stateCategory }}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <h6>Asset Reports</h6>
                        <div
                          style={{
                            display: "flex",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              width: "80%",
                            }}
                          >
                            {assetCheckboxes.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={options[p.id] == true}
                                  component={FormCheckbox}
                                  onChange={onCheckBox}
                                />
                              );
                            })}
                          </div>
                          <div>
                            <h6>Options Parameter</h6>
                            {assetOptionsParameter.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={optionsPara.includes(p.id)}
                                  component={FormCheckbox}
                                  onChange={onCheckBoxPara}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <div className="mt-3">
                          <h6>Inventory Reports</h6>
                          <Field
                            id={"category"}
                            name={"category"}
                            label={"Category"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={categoryDropdownData}
                            value={stateCategory}
                            onChange={CategoryOnChange}
                            wrapperstyle={{
                              width: "50%",
                              marginRight: "10px",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                width: "80%",
                              }}
                            >
                              {inventoryCheckboxes.map((p, i) => {
                                return (
                                  <Field
                                    key={i}
                                    id={p.id}
                                    name={p.id}
                                    label={p.label}
                                    checked={options[p.id] == true}
                                    component={FormCheckbox}
                                    onChange={onCheckBox}
                                  />
                                );
                              })}
                            </div>
                            <div>
                              <h6>Options Parameter</h6>
                              {inventoryOptionsParameter.map((p, i) => {
                                return (
                                  <Field
                                    key={i}
                                    id={p.id}
                                    name={p.id}
                                    label={p.label}
                                    checked={optionsPara.includes(p.id)}
                                    component={FormCheckbox}
                                    onChange={onCheckBoxPara}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRCRTab", 1) && (
              <TabStripTab title={"County Revenue"}>
                <Form
                  onSubmit={() => { }}
                  key={reportFormKey}
                  initialValues={{
                    RevenueReceivedFrom: stateCustomer,
                  }}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <h6>County Revenue Reports</h6>
                        <div>
                          <Field
                            id={"CountyCode"}
                            name={"CountyCode"}
                            label={"CountyCode"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            wrapperstyle={{
                              width: "30%",
                              marginRight: "10px",
                            }}
                          />
                          <div>
                            {countyRevenueCheckboxes.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={options[p.id] == true}
                                  component={FormCheckbox}
                                  onChange={onCheckBox}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <br />
                        <div>
                          <Field
                            id={"RevenueReceivedFrom"}
                            name={"RevenueReceivedFrom"}
                            label={"Revenue Received From"}
                            textField="name"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={CustomerDDList}
                            value={stateCustomer}
                            onChange={CustomerddlOnChange}
                            wrapperstyle={{
                              width: "30%",
                              marginRight: "10px",
                            }}
                          />
                          <div>
                            {countyRevenueCheckboxes2.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={options[p.id] == true}
                                  component={FormCheckbox}
                                  onChange={onCheckBox}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewARRTab", 1) && (
              <TabStripTab title={"Accounts Receivables Reports"}>
                <Form
                  key={reportFormKey}
                  initialValues={{
                    customer: stateCustomer,
                  }}
                  onSubmit={() => { }}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Field
                            id={"customer"}
                            name={"customer"}
                            label={"Customer"}
                            textField="name"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={CustomerDDList}
                            value={stateCustomer}
                            onChange={CustomerddlOnChange}
                            placeholder="Search Customer..."
                            wrapperstyle={{
                              width: "30%",
                            }}
                            //validator={supplierValidator}
                            filterable={true}
                            //onFilterChange={onFilterChange}
                            itemRender={itemRender}
                          />
                        </div>

                        <div className="mt-5">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "70%",
                            }}
                          >
                            <div>
                              <Field
                                id="ARAging"
                                name="ARAging"
                                label="Accounts Receivable Aging"
                                checked={options.ARAging == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="Statement"
                                name="Statement"
                                label="Statement"
                                checked={options.Statement == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="StatementCurrent"
                                name="StatementCurrent"
                                label="Statement with Current Receivables"
                                checked={options.StatementCurrent == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                              <Field
                                id="ARHistory"
                                name="ARHistory"
                                label="Customer History"
                                checked={options.ARHistory == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />

                              <Field
                                id="UncollectedOnly"
                                name="UncollectedOnly"
                                label="Uncollected Receivables"
                                checked={options.UncollectedOnly == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />

                <br></br>
                <div className="d-flex">
                  <div></div>
                </div>
              </TabStripTab>
            )}

            {checkPrivialgeGroup("ViewRIHACRTab", 1) && (
              <TabStripTab title={"IHAC Revenue"}>
                <Form
                  onSubmit={() => { }}
                  key={reportFormKey}
                  initialValues={{
                    ProgramDropdown: stateProgram,
                    DepartmentDropdown: stateDepartment,
                    AccountDropdown: stateAccount,
                    SubAccountDropdown: stateSubAccount,
                    RevenueReceivedFrom: stateCustomer,
                  }}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <h6>IHAC Revenue Reports</h6>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Field
                            id={"ProgramDropdown"}
                            name={"ProgramDropdown"}
                            label={"Program"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={programDropdownData}
                            value={stateProgram}
                            onChange={(value) =>
                              ihacExpenceProgramhandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"DepartmentDropdown"}
                            name={"DepartmentDropdown"}
                            label={"Department"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={departmentDropdownData}
                            value={stateDepartment}
                            onChange={(value) =>
                              ihacExpenceDepartmenthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"AccountDropdown"}
                            name={"AccountDropdown"}
                            label={"Account"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={accountDropdownData}
                            value={stateAccount}
                            onChange={(value) =>
                              ihacExpenceAccounthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />

                          <Field
                            id={"SubAccountDropdown"}
                            name={"SubAccountDropdown"}
                            label={"SubAccount"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={subaccountDropdownData}
                            value={stateSubAccount}
                            onChange={(value) =>
                              ihacExpenceSubAccounthandleChange(value)
                            }
                            wrapperstyle={{
                              width: "60%",
                              marginRight: "10px",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                          }}
                        >
                          <Field
                            id={"RevenueReceivedFrom"}
                            name={"RevenueReceivedFrom"}
                            label={"Revenue Received From"}
                            textField="name"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={CustomerDDList}
                            value={stateCustomer}
                            onChange={CustomerddlOnChange}
                            wrapperstyle={{
                              width: "30%",
                              marginRight: "10px",
                            }}
                          />
                          <Field
                            id={"ProjectRevenue"}
                            name={"ProjectRevenue"}
                            label={"Project Revenue"}
                            textField="text"
                            dataItemKey="id"
                            component={FormDropDownList}
                            wrapperstyle={{
                              width: "20%",
                              marginRight: "10px",
                            }}
                          />
                        </div>
                        <br></br>
                        <div
                          style={{
                            display: "flex",
                          }}
                        >
                          <div>
                            {ihacRevenueCheckboxes.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={options[p.id] == true}
                                  component={FormCheckbox}
                                  onChange={onCheckBox}
                                />
                              );
                            })}
                          </div>
                          <div>
                            <h6>Options Parameter</h6>
                            {ihacRevenueOptionsCheckboxes.map((p, i) => {
                              return (
                                <Field
                                  key={i}
                                  id={p.id}
                                  name={p.id}
                                  label={p.label}
                                  checked={optionsPara.includes(p.id)}
                                  component={FormCheckbox}
                                  onChange={onCheckBoxPara}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRSACRTab", 1) && (
              <TabStripTab title={"SAC Revenue"}>
                <Form
                  onSubmit={() => { }}
                  key={reportFormKey}
                  initialValues={{
                    Page: stateSacPage,
                    SAC: stateSAC,
                  }}
                  render={(formRenderProps) => (
                    <FormElement>
                      <fieldset className={""}>
                        <h6>SAC Revenue Reports</h6>
                        <div
                          style={{
                            display: "flex",
                          }}
                        >
                          <Field
                            id={"Page"}
                            name={"Page"}
                            label={"Page"}
                            textField="desc"
                            dataItemKey="id"
                            component={FormDropDownList}
                            data={sacPage}
                            value={stateSacPage}
                            onChange={sacPageOnchange}
                            wrapperstyle={{
                              width: "25%",
                              marginRight: "10px",
                            }}
                          />
                          <Field
                            id={"SAC"}
                            name={"SAC"}
                            label={"SAC"}
                            textField="text"
                            dataItemKey="id"
                            component={FormInput}
                            onChange={(e) => setStateSAC(e?.target?.value)}
                            wrapperstyle={{
                              width: "25%",
                              marginRight: "10px",
                            }}
                          />
                          <Field
                            id={"OtherRev"}
                            name={"OtherRev"}
                            label={"Other Rev"}
                            textField="text"
                            dataItemKey="id"
                            data={otherDescOptions}
                            component={FormDropDownList}
                            value={otherRevPage}
                            onChange={otherRevOnchange}
                            wrapperstyle={{
                              width: "25%",
                              marginRight: "10px",
                            }}
                          />
                        </div>
                        <br></br>
                        <div>
                          {sacRevenueCheckboxes.map((p, i) => {
                            return (
                              <Field
                                key={i}
                                id={p.id}
                                name={p.id}
                                label={p.label}
                                checked={options[p.id] == true}
                                component={FormCheckbox}
                                onChange={onCheckBox}
                              />
                            );
                          })}
                        </div>
                      </fieldset>
                    </FormElement>
                  )}
                />
              </TabStripTab>
            )}
            {checkPrivialgeGroup("ViewRMISCTab", 1) && (
              <TabStripTab title={"MISC"}>
                <div className="d-flex">
                  <div className="me-2">
                    {checkPrivialgeGroup("VoucherStringClarkB", 2) && (
                      <Button themeColor={"primary"} onClick={Electronicpdf}>
                        <i className="fa-solid fa-plus"></i> &nbsp; Electronic
                        Voucher String Clark
                      </Button>
                    )}
                  </div>
                  <div className="me-2">
                    {checkPrivialgeGroup("ElectronicB", 2) && (
                      <Button
                        themeColor={"primary"}
                        onClick={(e) =>
                          downloadeElectronicPDF(
                            "ElectronicVoucherStringMySoftwareSolutions",
                            e
                          )
                        }
                      >
                        <i className="fa-solid fa-plus"></i> &nbsp; Electronic
                        Voucher String My Software Solutions
                      </Button>
                    )}
                  </div>
                  <div>
                    {checkPrivialgeGroup("ElectronicPOB", 2) && (
                      <Button
                        themeColor={"primary"}
                        onClick={(e) =>
                          downloadeElectronicPDF("ElectronicPOStringMFCD", e)
                        }
                      >
                        <i className="fa-solid fa-plus"></i> &nbsp; Electronic
                        PO String MFCD{" "}
                      </Button>
                    )}
                  </div>
                </div>
              </TabStripTab>
            )}
          </TabStrip>
        </>
      )}
    </>
  );
}
