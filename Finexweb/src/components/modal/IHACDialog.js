import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import {
  MaskedTextBox,
  NumericTextBox
} from "@progress/kendo-react-inputs";
import { Error, Label } from "@progress/kendo-react-labels";
import React from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  IHACExpenseCodeEndPoints,
  ConfigurationEndPoints
} from "../../EndPoints";

export default function IHACDialog(props) {
  const [ProgramList, setProgramList] = React.useState([]);
  const [departmentList, setDepartmentList] = React.useState([]);
  const [accountList, setAccountList] = React.useState([]);
  const [subAccountList, setSubAccountList] = React.useState([]);
  const [selectedProgram, setSelectedProgram] = React.useState({});
  const [selectedDepartment, setSelectedDepartment] = React.useState({});
  const [selectedAccount, setSelectedAccount] = React.useState({});
  const [selectedSubAccount, setSelectedSubAccount] = React.useState({});
  const [validIHAC,] = React.useState(true);
  const [valueIHAC, setValueIHAC] = React.useState(props?.IHACValue ?? "");
  const [IhacBalance, setIhacBalance] = React.useState();
  const [, setIhacFlag] = React.useState(false);
  const [ihacValueSet, setIHACValueSet] = React.useState([]);
  const [isAutofillSacCacOnIHACSel, setIsAutofillSacCacOnIHACSel] = React.useState(false);
  const [error, setError] = React.useState({
    Program: "",
    Department: "",
    Account: "",
    SubAccount: ""
  })
  const [cacSacByIhacConfig, setCacSacByIhacConfig] = React.useState(false);
  const isDisabled = Object.values(error).some((e) => e !== "")
  React.useEffect(() => {
    if (props.forihpo) {
      setIhacFlag(true);
    }
    BindProgramDropdown();
    BindDepartmentDropdown();
    BindAccountDropdown();
    BindSubAccountDropdown();
    getIHACSacCacConfig();
    getAutofillSacCacOnIHACSelConfig()
  }, []);

  const BindProgramDropdown = () => {
    axiosInstance({
      method: "Get",
      url:
        IHACExpenseCodeEndPoints.GetIHCProgramList +
        "?forIhpo=" +
        props.forihpo,
      withCredentials: false,
    })
      .then((response) => {
        let data;
        if (props.type == 6) {
          data = response.data.filter((x) => x.revenueCheck == "Y");
        } else {
          data = response.data.filter((x) => x.expenseCheck == "Y");
        }

        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "00" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setProgramList(itemsData);
        if (ihacValueSet.indexOf('P') < 0) {
          if (valueIHAC.length >= 8) {
            var code = valueIHAC.split('-')[0];
            var items = itemsData.filter((item) => item.code == code)[0];
            setSelectedProgram(items);
          }

          var item = ihacValueSet;
          item.push('P');
          setIHACValueSet(item);
        }
      })
      .catch(() => { });
  };

  const BindDepartmentDropdown = () => {
    axiosInstance({
      method: "Get",
      url:
        IHACExpenseCodeEndPoints.GetIHCDepartmentList +
        "?forIhpo=" +
        (props.forDeptIhpo == undefined ? props.forihpo : props.forDeptIhpo),
      withCredentials: false,
    })
      .then((response) => {
        let data;
        if (props.type == 6) {
          data = response.data.filter((x) => x.revenueCheck == "Y");
        } else {
          data = response.data.filter((x) => x.expenseCheck == "Y");
        }
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "00" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setDepartmentList(itemsData);

        if (ihacValueSet.indexOf('D') < 0) {
          if (valueIHAC.length >= 8) {
            var code = valueIHAC.split('-')[1];
            var items = itemsData.filter((item) => item.code == code)[0];
            setSelectedDepartment(items);
          }

          var item = ihacValueSet;
          item.push('D');
          setIHACValueSet(item);
        }
      })
      .catch(() => { });
  };

  const BindAccountDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCAccountList,
      withCredentials: false,
    })
      .then((response) => {
        let data;
        if (props.type == 6) {
          data = response.data.filter((x) => x.revenueCheck == "Y");
        } else {
          data = response.data.filter((x) => x.expenseCheck == "Y");
        }
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "0000" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setAccountList(itemsData);
        if (ihacValueSet.indexOf('A') < 0) {
          if (valueIHAC.length >= 8) {
            var code = valueIHAC.split('-')[2];
            var items = itemsData.filter((item) => item.code == code)[0];
            setSelectedAccount(items);
          }

          var item = ihacValueSet;
          item.push('A');
          setIHACValueSet(item);
        }
      })
      .catch(() => { });
  };

  const BindSubAccountDropdown = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCSubAccountList,
      withCredentials: false,
    })
      .then((response) => {
        let data;
        if (props.type == 6) {
          data = response.data.filter((x) => x.revenueCheck == "Y");
        } else {
          data = response.data.filter((x) => x.expenseCheck == "Y");
        }
        let itemsData = [];
        data.forEach((data) => {
          let items = {
            text: data.code === "0000" ? data.code + " - " + data.description : data.description,
            code: data.code,
            id: data.id,
          };
          itemsData.push(items);
        });
        setSubAccountList(itemsData);
        if (ihacValueSet.indexOf('S') < 0) {
          if (valueIHAC.length >= 8) {
            var code = valueIHAC.split('-')[3];
            var items = itemsData.filter((item) => item.code == code)[0];
            setSelectedSubAccount(items);
          }

          var item = ihacValueSet;
          item.push('S');
          setIHACValueSet(item);
        }
      })
      .catch(() => { });
  };

  const getIhacBalance = (Ihaccode) => {
    if (props.type) {
      axiosInstance({
        method: "Get",
        url:
          IHACExpenseCodeEndPoints.GetIHACBalance +
          "/" +
          Ihaccode +
          "?typeCode=" +
          props.type,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data;
          setIhacBalance(data);
        })
        .catch(() => { });
    }
  };

  const getAutofillSacCacOnIHACSelConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/4",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setIsAutofillSacCacOnIHACSel(value);
      })
      .catch(() => { });
  };

  const getIHACSacCacConfig = async () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationById + "/96",
      withCredentials: false,
    })
      .then((response) => {
        let value = response.data.result.settingsValue == "1" ? true : false;
        setCacSacByIhacConfig(value);
      })
      .catch(() => { });
  };

  const appendIHACCode = () => {
    if (cacSacByIhacConfig) {
      axiosInstance({
        method: "Get",
        url:
          IHACExpenseCodeEndPoints.getCacSAcByIhac.replace("#ihacAccountingCode#", valueIHAC),
        withCredentials: true,
      })
        .then((response) => {
          let data = response.data;
            if (props.getSacCode != undefined)
              props.getSacCode(data?.ihacCodeData?.stateAccountingCode)
            if (props.getCAC != undefined) {
              props.getCAC({
                name: "cac",
                value: data?.cacData
              });
            }
          props.getIHACCode(valueIHAC);
          props.toggleIHPODialog();
        })
        .catch(() => { });
    } else {
      props.getIHACCode(valueIHAC);
      props.toggleIHPODialog();
    }
  };

  const handleProgramChange = (event) => {
    let Program = event.target.value;
    setSelectedProgram(Program);
    updateIHACValue(
      Program.code,
      selectedDepartment.code,
      selectedAccount.code,
      selectedSubAccount.code
    );
    setError((prev) => ({ ...prev, ["Program"]: "" }))
  };
  const handleDepartmentChange = (event) => {
    let department = event.target.value;
    setSelectedDepartment(department);
    updateIHACValue(
      selectedProgram.code,
      department.code,
      selectedAccount.code,
      selectedSubAccount.code
    );
    setError((prev) => ({ ...prev, ["Department"]: "" }))
  };
  const handleAccountChange = (event) => {
    let account = event.target.value;
    setSelectedAccount(account);
    updateIHACValue(
      selectedProgram.code,
      selectedDepartment.code,
      account.code,
      selectedSubAccount.code
    );
    setError((prev) => ({ ...prev, ["Account"]: "" }))
  };
  const handleSubAccountChange = (event) => {
    let subAccount = event.target.value;
    setSelectedSubAccount(subAccount);
    updateIHACValue(
      selectedProgram.code,
      selectedDepartment.code,
      selectedAccount.code,
      subAccount.code
    );
    setError((prev) => ({ ...prev, ["SubAccount"]: "" }))
  };
  const updateIHACValue = (d1, d2, d3, d4) => {
    const values = [d1, d2, d3, d4].filter(Boolean);
    setValueIHAC(values.join("-"));
    let combineCode = values.join("-")
    if (props.forihpo && combineCode.length > 14) {
      getIhacBalance(combineCode);
    }
  };

  const handleIHACChange = (event) => {
    let ihac = event.target.value;
    const ihacParts = ihac.length && ihac.split("-");
    setValueIHAC(ihac);
    let correctIHac = false;
    if (!ihacParts[0].includes("_")) {
      let index = ProgramList.findIndex(
        (program) => program.code == ihacParts[0]
      );
      if (index >= 0) {
        correctIHac = true;
        setSelectedProgram(ProgramList[index]);
        setError((prev) => ({ ...prev, ["Program"]: "" }))
      } else {
        correctIHac = false;
        setSelectedProgram({});
        setError((prev) => ({ ...prev, ["Program"]: "Program Required this field" }))
      }
    } else {
      correctIHac = false;
      setSelectedProgram({});
    }
    if (!ihacParts[1].includes("_")) {
      let index = departmentList.findIndex(
        (department) => department.code == ihacParts[1]
      );
      if (index >= 0) {
        correctIHac = true;
        setSelectedDepartment(departmentList[index]);
        setError((prev) => ({ ...prev, ["Department"]: "" }))
      } else {
        correctIHac = false;
        setSelectedDepartment({});
        setError((prev) => ({ ...prev, ["Department"]: "Department Required this field" }))
      }
    } else {
      correctIHac = false;
      setSelectedDepartment({});
    }
    if (!ihacParts[2].includes("_")) {
      let index = accountList.findIndex(
        (account) => account.code == ihacParts[2]
      );
      if (index >= 0) {
        correctIHac = true;
        setSelectedAccount(accountList[index]);
        setError((prev) => ({ ...prev, ["Account"]: "" }))
      } else {
        correctIHac = false;
        setSelectedAccount({});
        setError((prev) => ({ ...prev, ["Account"]: "Account Required this field" }))
      }
    } else {
      correctIHac = false;
      setSelectedAccount({});
    }
    if (!ihacParts[3].includes("_")) {
      let index = subAccountList.findIndex(
        (subAccount) => subAccount.code == ihacParts[3]
      );
      if (index >= 0) {
        setSelectedSubAccount(subAccountList[index]);
        correctIHac = true;
        let combineIhpo =
          ihacParts[0] +
          "-" +
          ihacParts[1] +
          "-" +
          ihacParts[2] +
          "-" +
          ihacParts[3];
        getIhacBalance(combineIhpo);
        setError((prev) => ({ ...prev, ["SubAccount"]: "" }))
      } else {
        correctIHac = false;
        setSelectedSubAccount({});
        setError((prev) => ({ ...prev, ["SubAccount"]: "SubAccount Required this field" }))
      }
    } else {
      correctIHac = false;
      setSelectedSubAccount({});
    }
  };

  return (
    <>
      <Dialog
        width={450}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-plus"></i>
            <span className="ms-2">IHAC Code</span>
          </div>
        }
        onClose={props.toggleIHPODialog}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            className="k-form-field"
            style={{ width: "50%", marginTop: "1rem" }}
          >
            <Label>Program</Label>
            <div className={"k-form-field-wrap"}>
              <DropDownList
                textField="text"
                dataItemKey="id"
                data={ProgramList.sort((a, b) => {
                  const isANumber = /^\d/.test(a["text"]);
                  const isBNumber = /^\d/.test(b["text"]);

                  if (isANumber && !isBNumber) return -1;
                  if (!isANumber && isBNumber) return 1;

                  return a["text"].localeCompare(b["text"]);
                })}
                value={selectedProgram}
                onChange={handleProgramChange}
                popupSettings={{ width: "auto" }}
                valid={error.Program == ""}
              />
            </div>
            {error.Program && <Error>{error.Program}</Error>}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            className="k-form-field"
            style={{ width: "50%", marginTop: "1rem" }}
          >
            <Label>Department</Label>
            <div className={"k-form-field-wrap"}>
              <DropDownList
                textField="text"
                dataItemKey="id"
                data={departmentList.sort((a, b) => {
                  const isANumber = /^\d/.test(a["text"]);
                  const isBNumber = /^\d/.test(b["text"]);

                  if (isANumber && !isBNumber) return -1;
                  if (!isANumber && isBNumber) return 1;

                  return a["text"].localeCompare(b["text"]);
                })}
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                popupSettings={{ width: "auto" }}
                valid={error.Department == ""}
              />
            </div>
            {error.Department && <Error>{error.Department}</Error>}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            className="k-form-field"
            style={{ width: "50%", marginTop: "1rem" }}
          >
            <Label>Account</Label>
            <div className={"k-form-field-wrap"}>
              <DropDownList
                textField="text"
                dataItemKey="id"
                data={accountList.sort((a, b) => {
                  const isANumber = /^\d/.test(a["text"]);
                  const isBNumber = /^\d/.test(b["text"]);

                  if (isANumber && !isBNumber) return -1;
                  if (!isANumber && isBNumber) return 1;

                  return a["text"].localeCompare(b["text"]);
                })}
                value={selectedAccount}
                onChange={handleAccountChange}
                popupSettings={{ width: "auto" }}
                valid={error.Account == ""}
              />
            </div>
            {error.Account && <Error>{error.Account}</Error>}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            className="k-form-field"
            style={{ width: "50%", marginRight: "10px", marginTop: "1rem" }}
          >
            <Label>SubAccount</Label>
            <div className={"k-form-field-wrap"}>
              <DropDownList
                textField="text"
                dataItemKey="id"
                data={subAccountList.sort((a, b) => {
                  const isANumber = /^\d/.test(a["text"]);
                  const isBNumber = /^\d/.test(b["text"]);

                  if (isANumber && !isBNumber) return -1;
                  if (!isANumber && isBNumber) return 1;

                  return a["text"].localeCompare(b["text"]);
                })}
                value={selectedSubAccount}
                onChange={handleSubAccountChange}
                popupSettings={{ width: "auto" }}
                valid={error.SubAccount == ""}
              />
            </div>
            {error.SubAccount && <Error>{error.SubAccount}</Error>}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <div className="k-form-field" style={{ width: "50%" }}>
            <Label>IHAC Code</Label>
            <div className={"k-form-field-wrap"}>
              <MaskedTextBox
                mask="AA-AA-AAAA-AAAA"
                defaultValue="__-__-___-___"
                wrapperstyle={{
                  width: "50%",
                }}
                value={valueIHAC}
                valid={validIHAC}
                onChange={handleIHACChange}
              />
            </div>
          </div>
          {props.forihpo && (
            <div
              className="k-form-field"
              style={{
                width: "40%",
              }}
            >
              <label className="k-label">IHAC Balance</label>
              <NumericTextBox
                format={"c"}
                spinners={false}
                value={IhacBalance}
                disabled={true}
              />
            </div>
          )}
        </div>

        <div className="k-form-buttons mt-3">
          <Button
            className="col-12"
            themeColor={"primary"}
            type={"button"}
            disabled={(!IhacBalance && props.forihpo) || valueIHAC.replace(/_/g, "").length < 15 || isDisabled}
            onClick={appendIHACCode}
          >
            Save
          </Button>
        </div>
      </Dialog>
    </>
  );
}
