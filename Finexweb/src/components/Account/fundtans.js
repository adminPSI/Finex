import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { fundTrans, RevenueEndPoints } from "../../EndPoints";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import Constants from "../common/Constants";
import { endDateCell } from "../../core/commanFunction";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { FormCheckbox, FormDatePicker, FormDropDownList, FormInput, FormMultiColumnComboBox, FormNumericTextBox, FormTextArea } from "../form-components";
import { currentDateValidator, startingBalanceValidator } from "../validators";
import SacDialog from "../modal/StateAccountCodeDialog";
import IHACDialog from "../Payroll/Job/modals/IHACpopup";
import usePrivilege from "../../helper/usePrivilege";
import { DropDownList } from "@progress/kendo-react-dropdowns";

const FundTrans = () => {
    const formRef = useRef();
    const yearOptions = Array.from(
        {
            length:
                new Date().getFullYear() - 2010 + 1
        },
        (_, i) =>
            new Date().getFullYear() - i
    );
    const years = ["Select Year", ...yearOptions];
    const [selectedYear, setSelectedYear] = React.useState(0)
    const { checkPrivialgeGroup, loading, error } = usePrivilege('Adjustments')
    const initialDataState = {
        skip: 0,
        take: Constants.KendoGrid.defaultPageSize,
    };
    const [visible, setVisible] = useState(false);
    const [CACDDList, setCACDDList] = useState([]);
    const CACVal = {
        value: {
            text: "Select County Expense Code",
            id: 0,
        },
    };
    const CACColumns = [
        {
            field: "countyExpenseCode",
            header: "Name",
            width: "300px",
        },
        {
            field: "countyExpenseDescription",
            header: "Description",
            width: "300px",
        },
    ];
    const [selectedRowId, setselectedRowId] = React.useState(0);
    const [selectedAddresRowId, setselectedAddresRowId] = React.useState(0);
    const [adressContextShow, setAdressContextShow] = React.useState(false);
    const [page, setPage] = React.useState(initialDataState)
    const [pageSizeValue, setPageSizeValue] = React.useState();
    const [pageTotal, setPageTotal] = React.useState(20);
    const [fundData, setFundData] = useState([])
    const [formInit, setFormInit] = useState([]);
    const [addFundVisible, setAddFundVisible] = useState(false);
    const [bindEmployeeGrid, setBindEmployeeGrid] = useState({});
    const [show, setShow] = React.useState(false);
    const [gridformInit, setGridformInit] = useState([]);
    const [visibleIHPO, setVisibleIHPO] = useState(false);
    const [IHACValueEdit, setIHACValueEdit] = useState("");
    const [SACValueEdit, setSACValueEdit] = useState("");
    const [deleteVisible, setDeleteVisible] = useState(null);
    const [AdYearFilter, setAdYearFilter] = React.useState(bindEmployeeGrid.yearFilter ? bindEmployeeGrid.yearFilter : years[0]);

    const eHandleSubmit = async (dataItem, e) => {
        const apiRequest = {
            id: dataItem.id || 0,
            trans_Amount: dataItem?.amount,
            isPayroll: dataItem?.payroll,
            trans_SAC_From: dataItem?.sac,
            trans_CAC_From: dataItem.cac ? dataItem.cac.id : 0,
            trans_IHAC_From: dataItem.ihac ? dataItem.ihac
                : "",
            trans_Description: dataItem?.description,
            trans_Date: dataItem?.startDate
            //             "createdBy": "string",
            //   "createdDate": "2025-11-12T10:31:42.811Z",
            //   "modifiedBy": "string",
            //   "modifiedDate": "2025-11-12T10:31:42.811Z",
            //   "id": 0,
            //   "trans_CAC_From": 0,
            //   "trans_IHAC_From": "string",
            //   "trans_Description": "string",
            //   "trans_Date": "2025-11-12T10:31:42.811Z",
            //   "trans_Amount": 0,
            //   "trans_SAC_From": "string",
            //   "transCACId": 0,
            //   "isPayroll": true,
            //   "orgAccountId": 0
        }
        if (dataItem.id > 0) {
            await axiosInstance({
                method: "PUT",
                url: fundTrans.GetFundTransList + "/" + dataItem.id,
                data: apiRequest,
                withCredentials: false,
            });
            getFundTansGrid(
                bindEmployeeGrid.cskip,
                bindEmployeeGrid.ctake,
                bindEmployeeGrid.yearFilter
            )
            setGridformInit({})
            setAddFundVisible(false);
        } else {
            await axiosInstance({
                method: "POST",
                url: fundTrans.GetFundTransList,
                data: apiRequest,
                withCredentials: false,
            });
            getFundTansGrid(
                bindEmployeeGrid.cskip,
                bindEmployeeGrid.ctake,
                bindEmployeeGrid.yearFilter
            )
            setGridformInit({})
            setAddFundVisible(false);
        }
    }

    const offset = React.useRef({
        left: 0,
        top: 0,
    });

    const handleAdressContextMenuOpen = (e, data) => {
        e.preventDefault();
        const id = typeof data === "number" ? { id: data?.id } : data?.id;
        setselectedAddresRowId(data?.id);
        setselectedRowId(data);
        offset.current = {
            left: e.pageX,
            top: e.pageY,
        };
        setAdressContextShow(true);
    };
    const getFundTansGrid = async (
        cskip = page.skip,
        ctake = page.take,
        yearFilter = ""
    ) => {
        await axiosInstance({
            method: "GET",
            url:
                fundTrans.GetFundTransList + "?skip=" + cskip + "&&take=" + ctake + "&&yearFilter=" + yearFilter,
            withCredentials: false,
        })
            .then((response) => {
                setFundData(response?.data)
                setPageTotal(response?.data.total)
            })
            .catch((error) => {
                console.log("error", error)
            });
    }
    const addFundTransferToggleDialog = () => {
        setAddFundVisible(!addFundVisible);
    }
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
                take: fundData.length,
            });
        }
    };
    const CommandCellAdress = (props) => {
        return (
            <>
                <td className="k-command-cell">
                    <Button
                        id={props.dataItem.id}
                        onClick={(event) => handleAdressContextMenuOpen(event, props.dataItem)}
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
    const openDeleteDialog = (id) => {
        setDeleteVisible(id);
    };
    const closeDeleteDialog = () => {
        setDeleteVisible(null);
    };
    const DeleteOnClick = () => {
        axiosInstance({
            method: "delete",
            url: fundTrans.deleteFundTransList + "/" + deleteVisible,
            withCredentials: false,
        })
            .then((response) => {
                closeDeleteDialog();
                getFundTansGrid(
                    bindEmployeeGrid.cskip,
                    bindEmployeeGrid.ctake,
                    bindEmployeeGrid.yearFilter
                )
            })
            .catch(() => { });
    };
    const handleOnAddressSelect = (e) => {
        let id = selectedRowId?.id;
        let action = e.item.data.action;
        if (id !== 0) {
            switch (action) {
                case "edit":
                    setGridformInit({
                        id: selectedRowId?.id,
                        description: selectedRowId?.trans_Description,
                        startDate: new Date(selectedRowId?.trans_Date),
                        sac: selectedRowId?.trans_SAC_From,
                        ihac: selectedRowId?.trans_IHAC_From,
                        cac: CACDDList.find((x) => x.id == selectedRowId?.trans_CAC_From),
                        payroll: selectedRowId?.isPayroll,
                        amount: selectedRowId?.trans_Amount
                    })
                    setAddFundVisible(!addFundVisible);
                    break;

                case "Delete":
                    openDeleteDialog(id);
                    break;
                default:
            }
        } else {
            console.log("Error ! data not found.");
        }
        setAdressContextShow(false);
    }
    const handleAdressCloseMenu = () => {
        setAdressContextShow(false);
        setselectedAddresRowId({});
    };

    const toggleDialog = () => {
        setVisible(!visible);
    };
    const toggleIHPODialog = () => {
        if (IHACValueEdit && IHACValueEdit.length > 10) {
            var ihacVal = IHACValueEdit.replace(/_/g, "-");
            setIHACValueEdit(ihacVal);
        }
        setVisibleIHPO(!visibleIHPO);
    };

    const getSacCode = (sac) => {
        if (formRef.current) {
            formRef.current.onChange("sac", {
                name: "sac",
                touched: true,
                value: sac,
            });
            setSACValueEdit(sac)
        }
    };

    const getIHACCode = (ihac) => {
        formRef.current.valueSetter("ihac", ihac);
        setIHACValueEdit(ihac)
    };

    const getCAC = async () => {
        const accountingcode =
            Constants.ExpenseOrRevenueIndicatorTypeCode.ExpenseIndicator.code;

        axiosInstance({
            method: "Post",
            url:
                RevenueEndPoints.GetAccountingCodesFilter +
                `accountingcodetype=${accountingcode}` +
                "&&description=" +
                "" +
                "&&code=" +
                "" +
                "&&fundCode=" +
                "" +
                "&&isActive=" +
                "Y" +
                "&&search=" +
                "" +
                "&&skip=" +
                0 +
                "&&take=" +
                0,
            withCredentials: false,
        })
            .then((response) => {
                let data = response.data.data;
                setCACDDList(data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const onIhacChange = (e, whichDate = "") => {
        // setformData({ ...formData, [e.target.name]: e.target.value });

        // const isValid = new Date(e?.value);
        // if (
        //     isValid &&
        //     whichDate &&
        //     !isNaN(isValid.getTime()) &&
        //     isValid.getFullYear() != 1969
        // ) {
        //     if (whichDate == "startDate") {
        //         updateStartDateFun({
        //             formRenderProps: e,
        //             enddate: formInit?.endDate || selectedEndDate,
        //         });
        //     } else if (whichDate == "endDate") {
        //         updateEndDateFun({
        //             formRenderProps: e,
        //             startdate: formInit?.startDate || selectedStartDate,
        //         });
        //     }
        // }
    };

    useEffect(() => {
        getFundTansGrid(
            bindEmployeeGrid.cskip,
            bindEmployeeGrid.ctake,
            bindEmployeeGrid.yearFilter
        )
        getCAC()
    }, [bindEmployeeGrid]);
    return (
        <React.Fragment>
            {checkPrivialgeGroup("AdjustmentM", 1) && (
                <>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item active" aria-current="page">
                                Accounting
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Adjustments
                            </li>
                        </ol>
                    </nav>
                    <div className="row d-flex justify-content-between">
                        <div className="col-sm-4 d-flex align-items-center">
                            <span className="page-title">Adjustments</span>
                        </div>
                        <div className="col-sm-8 text-end">
                            {
                                checkPrivialgeGroup("AddAdjustmentB", 2) && (
                                    <Button themeColor={"primary"} onClick={addFundTransferToggleDialog}>
                                        Add Adjustments
                                    </Button>
                                )
                            }
                        </div>
                    </div>
                    <div className="mt-3">
                        {checkPrivialgeGroup("AdjustmentG", 1) && (
                            <>
                                <Grid
                                    data={fundData}
                                    skip={page.skip}
                                    take={page.take}
                                    total={pageTotal} setAdYearFilter
                                    pageable={{
                                        buttonCount: 4,
                                        pageSizes: [10, 15, 50, "All"],
                                        pageSizeValue: pageSizeValue,
                                    }}
                                    onPageChange={pageChange}
                                >
                                    <GridToolbar>
                                        <div className="row col-sm-12">
                                            <div className="col-sm-12 d-flex align-items-center justify-content-end">
                                                <div style={{ margin: "5px" }}>
                                                    <DropDownList
                                                        data={years}
                                                        value={AdYearFilter}
                                                        onChange={(e) => {
                                                            setAdYearFilter(e.value)
                                                            setselectedRowId(0)
                                                            setBindEmployeeGrid({
                                                                ...bindEmployeeGrid,
                                                                yearFilter: e.target.value,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </GridToolbar>
                                    <GridColumn field="trans_Date" title="Combo" cell={endDateCell} />
                                    <GridColumn field="trans_Date" title="Date" cell={endDateCell} />
                                    <GridColumn field="trans_Amount" title="Amount" />
                                    <GridColumn field="countyExpenseCode" title="County Account" />
                                    <GridColumn field="trans_IHAC_From" title="IHAC" />
                                    <GridColumn field="trans_SAC_From" title="SAC" />
                                    <GridColumn field="trans_Description" title="Description" />
                                    <GridColumn cell={CommandCellAdress} />
                                </Grid>
                                <ContextMenu
                                    show={adressContextShow}
                                    offset={offset.current}
                                    onSelect={handleOnAddressSelect}
                                    onClose={handleAdressCloseMenu}
                                >
                                    {checkPrivialgeGroup("EditAdjustmentCM", 3) && (
                                        <MenuItem
                                            text="Edit"
                                            data={{
                                                action: "edit",
                                            }}
                                            icon="edit"
                                        />
                                    )}
                                    {checkPrivialgeGroup("DeleteAdjustmentCM", 4) && (
                                        <MenuItem
                                            text="Delete"
                                            data={{
                                                action: "Delete",
                                            }}
                                            icon="Delete"
                                        />
                                    )}
                                </ContextMenu>
                            </>
                        )}
                    </div>
                    {addFundVisible && (
                        <Dialog
                            width={500}
                            title={
                                <div className="d-flex align-items-center justify-content-center">
                                    <i
                                        className={
                                            "fa-solid " +
                                            " " +
                                            (formInit?.id > 0 ? "fa-edit" : "fa-plus")
                                        }
                                    ></i>
                                    <span className="ms-2">
                                        {formInit?.id > 0 ? "Edit Adjustment" : "Add New Adjustment"}
                                    </span>
                                </div>
                            }
                            onClose={() => {
                                setAddFundVisible(false)
                                setGridformInit({})
                            }}
                        >
                            <Form
                                onSubmit={eHandleSubmit}
                                initialValues={gridformInit}
                                ref={formRef}
                                render={(formRenderProps) => (
                                    <FormElement>
                                        <fieldset className={"k-form-fieldset"}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                {/* <Field
                                                    id={"year"}
                                                    name={"year"}
                                                    label={`Year`}
                                                    component={FormDropDownList}
                                                    data={[2025, 2024, 2023, 2022, 2021]}
                                                    placeholder="Select year"
                                                    wrapperstyle={{
                                                        width: "50%",
                                                        marginRight: "10px",
                                                    }}
                                                /> */}
                                                <Field
                                                    id={"date"}
                                                    name={"startDate"}
                                                    label={"Start Date*"}
                                                    component={FormDatePicker}
                                                    validator={currentDateValidator}
                                                    wrapperstyle={{
                                                        width: "50%",
                                                        marginRight: "10px",
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Field
                                                    id={"amount"}
                                                    name={"amount"}
                                                    label={"Amount*"}
                                                    format="c2"
                                                    placeholder={"$ Enter Amount"}
                                                    component={FormNumericTextBox}
                                                    validator={startingBalanceValidator}
                                                    step={0}
                                                    min={0}
                                                    spinners={false}
                                                    wrapperstyle={{
                                                        width: "50%",
                                                        marginRight: "10px",
                                                    }}
                                                />
                                                <Field
                                                    id={"cac"}
                                                    name={"cac"}
                                                    label={"CAC"}
                                                    textField="countyExpenseCode"
                                                    dataItemKey="id"
                                                    component={FormMultiColumnComboBox}
                                                    data={CACDDList}
                                                    value={CACVal}
                                                    columns={CACColumns}
                                                    onChange={onIhacChange}
                                                    wrapperstyle={{
                                                        width: "50%",
                                                        marginRight: "10px",
                                                    }}
                                                    placeholder="Search CAC..."
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <div
                                                    onClick={() => toggleIHPODialog()}
                                                    style={{
                                                        width: "50%",
                                                        marginRight: "10px",
                                                    }}
                                                >
                                                    <Field
                                                        id={"ihac"}
                                                        name={"ihac"}
                                                        label={"IHAC"}
                                                        component={FormInput}
                                                    />
                                                </div>
                                                <div
                                                    onClick={() => setVisible(true)}
                                                    style={{
                                                        width: "50%",
                                                        marginRight: "10px",
                                                    }}
                                                >
                                                    <Field
                                                        id={"sac"}
                                                        name={"sac"}
                                                        label={"SAC"}
                                                        component={FormInput}
                                                    />
                                                </div>
                                            </div>
                                            <Field
                                                id={"Description"}
                                                name={"description"}
                                                label={`Description`}
                                                component={FormTextArea}
                                            />
                                            <Field
                                                id="payroll"
                                                name="payroll"
                                                label="payroll"
                                                component={FormCheckbox}
                                            />
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
                                        </fieldset>
                                    </FormElement>
                                )
                                } />
                        </Dialog>)}
                    {visible && (
                        <SacDialog
                            toggleDialog={toggleDialog}
                            getSacCode={getSacCode}
                            SACValue={SACValueEdit}
                            type={7}
                        />
                    )}
                    {visibleIHPO && (
                        <IHACDialog
                            toggleIHPODialog={toggleIHPODialog}
                            getIHACCode={getIHACCode}
                            forihpo={false}
                            IHACValue={IHACValueEdit}
                        ></IHACDialog>
                    )}
                    {deleteVisible && (
                        <Dialog
                            title={<span>Please confirm</span>}
                            onClose={closeDeleteDialog}
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
                                    onClick={closeDeleteDialog}
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

        </React.Fragment>
    )
}
export default FundTrans;