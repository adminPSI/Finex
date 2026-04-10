import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Form, FormElement } from "@progress/kendo-react-form";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import {
  ContextMenu,
  ExpansionPanelContent,
  MenuItem,
} from "@progress/kendo-react-layout";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { PayrollEndPoints } from "../../EndPoints";
import usePrivilege from "../../helper/usePrivilege";
import { AddContractPopup } from "./modals/AddContractPopup";
import { EditContractPopup } from "./modals/editContactPopup";

export const ContractYearsForm = () => {
  const [contractYear, setcontractYear] = useState([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedRowId, setselectedRowId] = useState(0);
  const [deleteVisiblePackage, setDeleteVisiblePackage] = useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const [editContractPopupVisible, setEditContractPopupVisible] =
    useState(false);
  const [contractPopupVisible, setContractPopupVisible] = useState(false);
  const [dataFilter, seDataFilter] = useState();

  const offset = useRef({
    left: 0,
    top: 0,
  });
  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setselectedRowId(e.currentTarget.id);
    offset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShowContextMenu(true);
  };

  const toggleDeleteDialogPackage = () => {
    setDeleteVisiblePackage(!deleteVisiblePackage);
  };

  const handleOnSelectInnerGrid = (e) => {
    let id = selectedRowId;
    if (id !== 0) {
      console.log("edit", e.item.data);
      switch (e.item.data.action) {
        case "edit":
          const dataFilter = e.item.data.data.filter(
            (el) => Number(el?.id) == Number(id)
          );
          seDataFilter(dataFilter[0]);
          setEditContractPopupVisible(true);
          break;
        case "delete":
          toggleDeleteDialogPackage();
          break;
        default:
      }
    }
  };

  const DeleteOnClickPackage = () => {
    let id = selectedRowId;
    (async () => {
      try {
        const r = await axiosInstance({
          method: "Delete",
          url: PayrollEndPoints.ContractYearDeleteById.replace("#ID#", id),
          withCredentials: false,
        });
        axiosInstance({
          method: "GET",
          url: PayrollEndPoints.ContractYears,
          withCredentials: false,
        })
          .then((response) => {
            let data = response.data.map((item) => item.benefitsName);
            setcontractYear(response.data);
          })
          .catch((e) => {
            console.log(e, "error");
          });
        toggleDeleteDialogPackage();
      } catch (e) {
        console.log(e, "error");
      }
    })();
  };

  const handleCloseMenuInnerGrid = () => {
    setShowContextMenu(false);
  };

  const onCheckBox = (event) => {
    const field = event.target.name;
    setColumnShow(!columnShow);
  };
  useEffect(() => {
    const getBenefitsName = () => {
      axiosInstance({
        method: "GET",
        url: PayrollEndPoints.ContractYears,
        withCredentials: false,
      })
        .then((response) => {
          let data = response.data.map((item) => item.benefitsName);
          setcontractYear(response.data);
        })
        .catch((e) => {
          console.log(e, "error");
        });
    };

    getBenefitsName();
  }, []);

  const editField = "inEdit";

  const CommandCell = (props) => (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={handleContextMenuOpen}
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

  const handleClick = () => {
    setContractPopupVisible(true);
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollOrganizationDataSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <ExpansionPanelContent>
      <div className=" d-flex justify-content-between mb-2">
        <div></div>
        <div></div>
        {checkPrivialgeGroup("AddPRCY", 2) && <div>
          <Button
            className="k-button k-button-lg k-rounded-lg"
            themeColor={"primary"}
            onClick={handleClick}
          >
            Add Contract Years
          </Button>
        </div>}
      </div>

      {checkPrivialgeGroup("PRCYG", 1) && <Form
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <div onKeyDown={(e) => e.stopPropagation()}>
                <Grid data={contractYear} editField={editField}>
                  {checkPrivialgeGroup("PRCYSMCB", 1) && <GridToolbar>
                    <div className="d-flex align-items-center justify-content-end w-100">
                      <div>
                        <Checkbox
                          type="checkbox"
                          name="modifiedBy"
                          defaultChecked={columnShow}
                          onChange={onCheckBox}
                          label={"Modified Info"}
                        />
                      </div>
                    </div>
                  </GridToolbar>}
                  <GridColumn
                    field="empYrStart"
                    title="Year Start"
                    cell={(props) => {
                      if (props.dataItem.empYrStart) {
                        const [year, month, day] = props.dataItem.empYrStart
                          .split("T")[0]
                          .split("-");
                        return <td>{`${month}/${day}/${year}`}</td>;
                      } else {
                        return <td></td>;
                      }
                    }}
                  />
                  <GridColumn
                    field="empYrEnd"
                    title="Year End"
                    cell={(props) => {
                      if (props.dataItem.empYrEnd) {
                        const [year, month, day] = props.dataItem.empYrEnd
                          .split("T")[0]
                          .split("-");
                        return <td>{`${month}/${day}/${year}`}</td>;
                      } else {
                        return <td></td>;
                      }
                    }}
                  />
                  <GridColumn field="months" title="Months" />

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

                  <GridColumn cell={CommandCell} width="240px" />
                </Grid>
                <ContextMenu
                  show={showContextMenu}
                  offset={offset.current}
                  onSelect={handleOnSelectInnerGrid}
                  onClose={handleCloseMenuInnerGrid}
                >
                  {checkPrivialgeGroup("EditPRCY", 3) && (
                    <MenuItem
                      text="Edit"
                      data={{
                        action: "edit",
                        data: contractYear,
                      }}
                      icon="edit"
                    />
                  )}
                  {checkPrivialgeGroup("DeletePRCY", 4) && (
                    <MenuItem
                      text="Delete"
                      data={{
                        action: "delete",
                      }}
                      icon="delete"
                    />
                  )}
                </ContextMenu>
              </div>
            </fieldset>
          </FormElement>
        )}
      />}
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
      {editContractPopupVisible && (
        <EditContractPopup
          setEditContractPopupVisible={setEditContractPopupVisible}
          id={selectedRowId}
          dataFilter={dataFilter}
          setcontractYear={setcontractYear}
        />
      )}

      {contractPopupVisible && (
        <AddContractPopup
          setContractPopupVisible={setContractPopupVisible}
          setcontractYear={setcontractYear}
        />
      )}
    </ExpansionPanelContent>
  );
};
