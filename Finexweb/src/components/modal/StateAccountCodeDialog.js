import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { MaskedTextBox } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import React, { useMemo } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { StateAccountCodeEndPoints } from "../../EndPoints";
import {
  SACColumnValidator,
  SACPageValidator,
  SACRowValidator,
} from "../validators";

export default function SacDialog(props) {
  const [sacPageList, setSacPageList] = React.useState([]);
  const [selectedPage, setSelectedPage] = React.useState({});
  const [sacRowList, setSacRowList] = React.useState([]);
  const [selectedRow, setSelectedRow] = React.useState({});
  const [sacColumnList, setSacColumnList] = React.useState([]);
  const [selectedColumn, setSelectedColumn] = React.useState({});
  const [validSac,] = React.useState(true);
  const [valueSac, setValueSac] = React.useState(props?.SACValue ?? "");
  const [sacValueSet, setSACValueSet] = React.useState([]);

  React.useEffect(() => {
    async function fetchData() {
      await getStateAccountPage();
    }
    fetchData();
  }, []);

  const getStateAccountPage = async () => {
    axiosInstance({
      method: "GET",
      url: StateAccountCodeEndPoints.GetStateAccountPage.replace(
        "#ORGID#",
        props.type
      ),
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setSacPageList(data);
        if (sacValueSet.indexOf('P') < 0) {
          if (valueSac.length >= 8) {
            var sacCodePage = valueSac.split('-')[0];
            var pageItem = data.filter((item) => item.stateAccountCode == sacCodePage)[0];
            setSelectedPage(pageItem);
            getStateAccountRow(pageItem.pageId);
            getStateAccountColumn(pageItem.pageId);
          }

          var item = sacValueSet;
          item.push('P');
          setSACValueSet(item);
        }
      })
      .catch(() => { });
  };
  const getStateAccountRow = (pageID) => {
    axiosInstance({
      method: "GET",
      url:
        StateAccountCodeEndPoints.GetStateAccountRow.replace(
          "#PAGEID#",
          pageID
        ) +
        "/" +
        props.type,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setSacRowList(data);
        if (sacValueSet.indexOf('R') < 0) {
          if (valueSac.length >= 8) {
            var sacCodeRow = valueSac.split('-')[1];
            var rowItem = data.filter((item) => item.stateAccountCode == sacCodeRow)[0];
            setSelectedRow(rowItem);
          }

          var item = sacValueSet;
          item.push('R');
          setSACValueSet(item);
        }
      })
      .catch(() => { });
  };
  const getStateAccountColumn = (rowId) => {
    axiosInstance({
      method: "GET",
      url:
        StateAccountCodeEndPoints.GetStateAccountColumn.replace(
          "#ROWID#",
          rowId
        ) +
        "/" +
        props.type,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setSacColumnList(data);
        if (sacValueSet.indexOf('C') < 0) {
          if (valueSac.length >= 8) {
            var sacCodeCol = valueSac.split('-')[2];
            var colItem = data.filter((item) => item.stateAccountCode == sacCodeCol)[0];
            setSelectedColumn(colItem);
          }

          var item = sacValueSet;
          item.push('C');
          setSACValueSet(item);
        }
      })
      .catch(() => { });
  };

  const appendSacCode = () => {
    if (selectedRow.id && selectedColumn.id && selectedPage.id) {
      let finalSac =
        selectedPage.stateAccountCode +
        "-" +
        selectedRow.stateAccountCode +
        "-" +
        selectedColumn.stateAccountCode
      props.getSacCode(finalSac);
      props.toggleDialog();
    }
  };
  const handleSacPageChange = (event) => {
    let page = event.target.value;
    setSelectedPage(page);
    setSelectedRow({});
    setSelectedColumn({});
    getStateAccountRow(page.pageId);
    setValueSac((prev) => {
      const parts = prev.split("-")
      parts[0] = page.stateAccountCode;
      return parts.join("-")
    });
  };
  const handleSacRowChange = (event) => {
    let row = event.target.value;
    setSelectedRow(row);
    setSelectedColumn({});
    getStateAccountColumn(selectedPage.pageId);
    setValueSac((prev) => {
      const parts = prev.split("-")
      parts[1] = row.stateAccountCode;
      return parts.join("-")
    });
  };
  const handleSacColumnChange = (event) => {
    let column = event.target.value;
    setSelectedColumn(column);
    setValueSac((prev) => {
      const parts = prev.split("-")
      parts[2] = column.stateAccountCode;
      return parts.join("-")
    });
  };

  const handleSacChange = async (event) => {
    let sac = event?.target?.value;
    setValueSac(sac);
    setSacData(sac)
  }
  const setSacData = (sac) => {
    const sacParts = sac.length && sac.split("-");
    let correctSAC = false;
    if (!sacParts[0].includes("_")) {
      let index = sacPageList.findIndex(
        (page) => page.stateAccountCode == sacParts[0]
      );
      if (index >= 0) {
        setSelectedPage(sacPageList[index]);
        getStateAccountRow(sacPageList[index].pageId);
        getStateAccountColumn(sacPageList[index].pageId);
        correctSAC = true;
      } else {
        setSelectedPage({});
        correctSAC = false;
      }
    } else {
      setSelectedPage({});
      correctSAC = false;
    }
    if (!sacParts[1].includes("_")) {
      let index = sacRowList.findIndex(
        (row) => row.stateAccountCode == sacParts[1]
      );
      if (index >= 0) {
        setSelectedRow(sacRowList[index]);
        correctSAC = true;
      } else {
        setSelectedRow({});
        correctSAC = false;
      }
    } else {
      setSelectedRow({});
      correctSAC = false;
    }
    if (!sacParts[2].includes("_")) {
      let index = sacColumnList.findIndex(
        (column) => column.stateAccountCode == sacParts[2]
      );
      if (index >= 0) {
        setSelectedColumn(sacColumnList[index]);
        correctSAC = true;
      } else {
        setSelectedColumn({});
        correctSAC = false;
      }
    } else {
      setSelectedColumn({});
      correctSAC = false;
    }
  };

  const MaskedTextBoxComponent = useMemo(() => {
    return (<MaskedTextBox
      mask="AA-AA-AA"
      wrapperstyle={{
        width: "50%",
      }}
      value={valueSac}
      valid={validSac}
      onChange={handleSacChange}
    />)
  }, [valueSac]);
  
  return (
    <>
      <Dialog
        width={450}
        title={
          <div className="d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-plus"></i>
            <span className="ms-2">State Account Codes</span>
          </div>
        }
        onClose={props.toggleDialog}
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
            <Label>Page</Label>
            <div className={"k-form-field-wrap"}>
              <DropDownList
                textField="stateAccountDesc"
                dataItemKey="id"
                data={sacPageList.sort((a, b) => {
                  const isANumber = /^\d/.test(a["stateAccountDesc"]);
                  const isBNumber = /^\d/.test(b["stateAccountDesc"]);

                  if (isANumber && !isBNumber) return -1;
                  if (!isANumber && isBNumber) return 1;

                  return a["stateAccountDesc"].localeCompare(
                    b["stateAccountDesc"]
                  );
                })}
                value={selectedPage}
                onChange={handleSacPageChange}
                popupSettings={{ width: "auto" }}
                validator={SACPageValidator}
              />
            </div>
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
            <Label>Row</Label>
            <div className={"k-form-field-wrap"}>
              <DropDownList
                textField="stateAccountDesc"
                dataItemKey="id"
                data={sacRowList.sort((a, b) => {
                  const isANumber = /^\d/.test(a["stateAccountDesc"]);
                  const isBNumber = /^\d/.test(b["stateAccountDesc"]);

                  if (isANumber && !isBNumber) return -1;
                  if (!isANumber && isBNumber) return 1;

                  return a["stateAccountDesc"].localeCompare(
                    b["stateAccountDesc"]
                  );
                })}
                value={selectedRow}
                onChange={handleSacRowChange}
                popupSettings={{ width: "auto" }}
                validator={SACRowValidator}
              />
            </div>
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
            <Label>Column</Label>
            <div className={"k-form-field-wrap"}>
              <DropDownList
                textField="stateAccountDesc"
                dataItemKey="id"
                data={sacColumnList.sort((a, b) => {
                  const isANumber = /^\d/.test(a["stateAccountDesc"]);
                  const isBNumber = /^\d/.test(b["stateAccountDesc"]);

                  if (isANumber && !isBNumber) return -1;
                  if (!isANumber && isBNumber) return 1;

                  return a["stateAccountDesc"].localeCompare(
                    b["stateAccountDesc"]
                  );
                })}
                value={selectedColumn}
                onChange={handleSacColumnChange}
                popupSettings={{ width: "auto" }}
                validator={SACColumnValidator}
              />
            </div>
          </div>

          <div
            className="k-form-field"
            style={{ width: "50%", marginTop: "1rem" }}
          >
            <Label>State Account Code</Label>
            <div className={"k-form-field-wrap"}>
              {MaskedTextBoxComponent}
            </div>
          </div>
        </div>

        <div className="k-form-buttons mt-3">
          <Button
            className="col-12"
            themeColor={"primary"}
            type={"button"}
            disabled={!selectedRow?.id || !selectedColumn?.id || !selectedPage?.id}
            onClick={appendSacCode}
          >
            Save
          </Button>
        </div>
      </Dialog>
    </>
  );
}
