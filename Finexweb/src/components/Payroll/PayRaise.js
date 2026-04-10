import { Button } from "@progress/kendo-react-buttons"
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs"
import { Grid, GridColumn } from "@progress/kendo-react-grid"
import { Checkbox } from "@progress/kendo-react-inputs"
import { useState } from "react"
import axiosInstance from "../../core/HttpInterceptor"
import { PayrollEmployeeSetup } from "../../EndPoints"
import { showErrorNotification, showSuccessNotification } from "../NotificationHandler/NotificationHandler"
import AddPayRaise from "./Job/modals/AddPayRaise"
import usePrivilege from "../../helper/usePrivilege"

const PayRaise = () => {
    const [dataGrid, setDataGrid] = useState([])
    const [takesEffectOn, setTakesEffectOn] = useState()
    const [applyConfirm, setApplyConfirm] = useState(false)
    const [selectedRemoveEmp, setSelectedRemoveEmp] = useState([]);
    const handleClick = async () => {
        if (takesEffectOn == null || takesEffectOn == undefined || takesEffectOn == "") {
            showErrorNotification("Select Takes effect on date")
            return;
        }

        setApplyConfirm(true);
    }

    const handleApplyOK = async () => {
        const data = {
            "takesEffectOn": dataGrid.takesEffectOn,
            "salaryData": dataGrid.data.map((el) => {
                if (selectedRemoveEmp.includes(el?.salaryID)) {
                    return {
                        id: el?.salaryID,
                        proposedSalary: el?.proposedSalary,
                        proposedPaySayDalary: el?.proposedPayDaySalary,
                        proposedHourlyRate: el?.proposedHourly,
                        payType: el?.payTypeValue
                    }
                } else {
                    return null
                }
            }).filter(Boolean)
        }

        await axiosInstance({
            method: "POST",
            url: PayrollEmployeeSetup.applyPayRaise,
            withCredentials: false,
            data: data
        })
            .then((response) => {
                const seData = dataGrid.data.map((el) => {
                    if (selectedRemoveEmp.includes(el?.salaryID)) {
                        return null
                    } else {
                        return el
                    }
                }).filter(Boolean)
                setDataGrid(seData)
                showSuccessNotification("Pay raise applied successfully");
                setApplyConfirm(false)
            })
            .catch(() => { });
    }

    const startDateCell = (props) => {
        var myDate = props.dataItem.dateHired;
        if (myDate) {
            const [year, month, day] = myDate
                ? myDate.split("T")[0].split("-")
                : ["", "", ""];

            return <td>{`${month}/${day}/${year}`}</td>;
        }
        return <td></td>;
    };
    const isAllSelected =
        dataGrid?.length == selectedRemoveEmp.length;
    const toggleCheckBox = (empId, checked) => {
        setSelectedRemoveEmp((prevSelected) =>
            prevSelected.includes(empId) ? prevSelected.filter((x) => x !== empId) : [...prevSelected, empId]
        )
    };

    const toggleSelectAll = (checked) => {
        if (selectedRemoveEmp.length == dataGrid.length) {
            setSelectedRemoveEmp([])
        }
        setSelectedRemoveEmp(
            checked ? dataGrid.map((item) => item?.salaryID) : []
        );
    };

    const CheckboxHeaderCell = () => {
        return (
            <td>
                <Checkbox
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => toggleSelectAll(e.target?.value)}
                />
            </td>
        );
    };
    const CheckboxCell = (props) => {
        const { dataItem } = props;
        return (
            <td>
                <Checkbox
                    type="checkbox"
                    checked={selectedRemoveEmp.includes(dataItem?.salaryID)}
                    onChange={(e) => toggleCheckBox(dataItem?.salaryID, e.target?.value)}
                />
            </td>
        );
    };

    const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollEmployeeSetup')
    if (loading) return <div>Loading privileges...</div>
    if (error) return <div>Error: {error}</div>
    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page">
                        Payroll
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Payroll
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Pay Raise Setup
                    </li>
                </ol>
            </nav>
            <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
                <div className="d-flex k-flex-column">
                    <h1>Pay Raise Setup</h1>
                </div>
            </div>
            <div>
                <AddPayRaise setDataGrid={setDataGrid} setTakesEffectOn={setTakesEffectOn} />
            </div>
            <div className="mt-3">
                {checkPrivialgeGroup("PayraiseG", 1) && (
                    <Grid resizable={true} data={dataGrid}>
                        <GridColumn title=""
                            width={"60px"}
                            headerCell={CheckboxHeaderCell}
                            cell={CheckboxCell}
                        />
                        <GridColumn field="employeeName" title="Name" />
                        <GridColumn field="primaryJob" title="Primary Job Description" />
                        {/* <GridColumn field="groupNo" title="Group No." /> */}
                        <GridColumn field="dateHired" title="Date Hired" cell={startDateCell} />
                        <GridColumn field="currentSalary" title="Current Salary" format="{0:c2}" headerCell={(props) => {
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
                                var amount = props.dataItem?.currentSalary;
                                amount =
                                    "$" +
                                    amount
                                        ?.toFixed(2)
                                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                                return <td className="!k-text-right">{`${amount}`}</td>;
                            }}
                        />
                        <GridColumn field="currentHourly" title="Current Hourly" format="{0:c2}" headerCell={(props) => {
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
                                var amount = props.dataItem?.currentHourly;
                                amount =
                                    "$" +
                                    amount
                                        ?.toFixed(2)
                                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                                return <td className="!k-text-right">{`${amount}`}</td>;
                            }} />
                        <GridColumn field="percentIncrease" title="% Increase" headerCell={(props) => {
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
                                var amount = props.dataItem?.percentIncrease;
                                amount = amount
                                    ?.toFixed(2)
                                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "1") + '%';
                                return <td className="!k-text-right">{`${amount}`}</td>;
                            }} />
                        <GridColumn field="proposedSalary" title="Proposed Salary" format="{0:c2}" headerCell={(props) => {
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
                                var amount = props.dataItem?.proposedSalary;
                                amount =
                                    "$" +
                                    amount
                                        ?.toFixed(2)
                                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                                return <td className="!k-text-right">{`${amount}`}</td>;
                            }} />
                        <GridColumn field="proposedHourly" title="Proposed Hourly" format="{0:c2}" headerCell={(props) => {
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
                                var amount = props.dataItem?.proposedHourly;
                                amount =
                                    "$" +
                                    amount
                                        ?.toFixed(2)
                                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                                return <td className="!k-text-right">{`${amount}`}</td>;
                            }} />
                    </Grid>
                )}
            </div>
            <div style={{
                display: "flex",
                justifyContent: "center",
                padding: "10px"
            }}>
                {checkPrivialgeGroup("ApplyPayraiseB", 2) && (
                    <Button themeColor={"primary"} onClick={(e) => handleClick()} disabled={selectedRemoveEmp.length == 0}>Apply Raise</Button>
                )}
            </div>
            {applyConfirm && (
                <Dialog
                    title={<span>Please confirm</span>}
                    onClose={() => setApplyConfirm(false)}
                >
                    <p
                        style={{
                            margin: "25px",
                            textAlign: "center",
                        }}
                    >
                        Are you sure to apply pay raise?
                    </p>
                    <DialogActionsBar>
                        <Button
                            themeColor={"secondary"}
                            className={"col-12"}
                            onClick={() => setApplyConfirm(false)}
                        >
                            No
                        </Button>
                        <Button
                            themeColor={"primary"}
                            className={"col-12"}
                            onClick={handleApplyOK}
                        >
                            Yes
                        </Button>
                    </DialogActionsBar>
                </Dialog>
            )}
        </div>
    )
}
export default PayRaise