import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { GridColumn as Column, Grid } from "@progress/kendo-react-grid";
import React, { useState } from "react";
import { CheckBoxCell } from "../../cells/CheckBoxCell";
import MyCommandCell from "../../cells/CommandCell";
export default function Permission() {
  const [detailData, setDetailData] = useState([]);
  const [testdata, setTestdata] = useState([
    {
      id: 1,
      title: "Fund",
      funName: [
        {
          title: "Manage Fund",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "FundM",
              resourceName: "Fund",
              allowedPermission: 1,
              hr: "Y",
              administrator: "N",
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "FundG",
              resourceName: "",
              allowedPermission: 1,
              hr: "Y",
              administrator: "Y",
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: false,
              payroll: "N",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddFundB",
              resourceName: "Add Fund",
              allowedPermission: 2,
              hr: "Y",
              administrator: "Y",
              employee: "N",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "N",
              supervisor: "Y",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditFundCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "Y",
            },
          ],
        },
        {
          title: "Transfer Fund",
          funName: [
            {
              resourceType: "Button",
              resourceKey: "TransferFundB",
              resourceName: "Transfer Fund",
              allowedPermission: 1,
              hr: "Y",
              administrator: "Y",
              employee: "N",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "N",
              supervisor: "Y",
            },
          ],
        },
        {
          title: "Calculate Balance",
          funName: [
            {
              resourceType: "Button",
              resourceKey: "CalculateFundB",
              resourceName: "Caluclate Balance",
              allowedPermission: 1,
              hr: "Y",
              administrator: "Y",
              employee: "Y",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Manage Amount",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "AddAmountCM",
              resourceName: "Add Amout",
              allowedPermission: 2,
              hr: "Y",
              administrator: "Y",
              employee: "Y",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditAmountCM",
              resourceName: "Edit Amout",
              allowedPermission: 3,
              hr: "Y",
              administrator: "Y",
              employee: "Y",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "DeleteAmountCM",
              resourceName: "Delete Amout",
              allowedPermission: 4,
              hr: "Y",
              administrator: "Y",
              employee: "Y",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive Fund",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "ShowInactiveCB",
              resourceName: "Show Inactive",
              allowedPermission: 1,
              hr: "Y",
              administrator: "Y",
              employee: "Y",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "MakeFundInactiveCM",
              resourceName: "Make Fund Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: "Y",
              employee: "Y",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: "Y",
              employee: "Y",
              fiscalOffice: "N",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "CAC Expense Code",
      funName: [
        {
          title: "Manage CAC Expense",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "CACEM",
              resourceName: "County Expense Code",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "CACEG",
              resourceName: "",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddExpenseCodeB",
              resourceName: "Add Expense Code",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditFundCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Transfer Amount",
          funName: [
            {
              resourceType: "Button",
              resourceKey: "TransferCACEAmountB",
              resourceName: "Transfer Amount",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Calculate Expense Carryover",
          funName: [
            {
              resourceType: "Button",
              resourceKey: "CACECarryoverB",
              resourceName: "Caluclate Carryover",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Manage Amount",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "AddCACEAmountCM",
              resourceName: "Add Amout",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditCACEAmountCM",
              resourceName: "Edit Amout",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "DeleteCACEAmountCM",
              resourceName: "Delete Amout",
              allowedPermission: 4,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive Fund",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "ShowCACEInactiveCB",
              resourceName: "Show Inactive",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "MakeCACEInactiveCM",
              resourceName: "Make Expense Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 3,
      title: "CAC Revenue Code",
      funName: [
        {
          title: "Manage CAC Revenue",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "CACRM",
              resourceName: "County Revenue Code",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "CACRG",
              resourceName: "County Revenue Code Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddRevenueCodeB",
              resourceName: "Add Revenue Code",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditRevenueCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "AddCACRAmountCM",
              resourceName: "Add Amount",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "MakeCACRInactiveCM",
              resourceName: "Make Revenue Code Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditCACRCM",
              resourceName: "Edit Revenue Code",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Manage Amount",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "EditCACRAmountCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "DeleteCACRAmountCM",
              resourceName: "Delete",
              allowedPermission: 4,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive Fund",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "ShowCACRInactiveCB",
              resourceName: "Show Inactive",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 4,
      title: "Program",
      funName: [
        {
          title: "Manage Program ",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "ProgramM",
              resourceName: "Program Code",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "ProgramG",
              resourceName: "Program Code Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddProgramCodeB",
              resourceName: "Add Program Code",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditProgramCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive Program",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "MakeProgramInactiveCM",
              resourceName: "Make Program Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 5,
      title: "Department",
      funName: [
        {
          title: "Manage Department",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "DepartmentM",
              resourceName: "Department Code",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "DepartmentG",
              resourceName: "Department Code Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddDepartmentCodeB",
              resourceName: "Add Department Code",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditDepartmentCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive Department",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "MakeDepartmentInactiveCM",
              resourceName: "Make Department Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 6,
      title: "Account",
      funName: [
        {
          title: "Manage Account",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "AccountM",
              resourceName: "Account Code",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "AccountG",
              resourceName: "Account Code Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddAccountCodeB",
              resourceName: "Add Account Code",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditAccountCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive Account",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "MakeAccountInactiveCM",
              resourceName: "Make Account Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 7,
      title: "SubAccount",
      funName: [
        {
          title: "Manage Sub Account ",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "SubAccountM",
              resourceName: "Sub Account Code",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "SubAccountG",
              resourceName: "Sub Account Code Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddSubAccountCodeB",
              resourceName: "Add Sub Account Code",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditSubAccountCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive Sub Account",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "MakeSubAccountInactiveCM",
              resourceName: "Make Sub Account Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 8,
      title: "IHAC Expense",
      funName: [
        {
          title: "Manage IHAC Expense",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "IHACEM",
              resourceName: "IHAC Expense",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "IHACEG",
              resourceName: "IHAC Expense Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddIHACExpenseB",
              resourceName: "Add IHAC Expense Code",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "CalculateIHACExpenseCarryoverB",
              resourceName: "Calculate IHAC Expense",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "RecalculateCarryoverAdjustmentB",
              resourceName: "Recalculate Carryover Adjustment",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditIHACExpenseCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "AddIHACEAmountCM",
              resourceName: "Add Amount",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "MakeIHACEInactiveCM",
              resourceName: "Make IHAC Expense Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditIHACECM",
              resourceName: "Edit IHAC Expense Code",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Transfer Amount",
          funName: [
            {
              resourceType: "",
              resourceKey: "",
              resourceName: "",
              allowedPermission: "",
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Calculate Expense Carryover",
          funName: [
            {
              resourceType: "",
              resourceKey: "",
              resourceName: "",
              allowedPermission: "",
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Manage Amount",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "EditIHACEAmountCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "DeleteIHACEAmountCM",
              resourceName: "Delete",
              allowedPermission: 4,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive IHAC",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "ShowIHACEInactiveCB",
              resourceName: "Show Inactive",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 9,
      title: "IHAC Revenue",
      funName: [
        {
          title: "Manage IHAC Revenue",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "IHACRM",
              resourceName: "IHAC Revenue",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "IHACRG",
              resourceName: "IHAC Revenue Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddIHACRevenueCodeB",
              resourceName: "Add IHAC Revenue Code",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditIHACRevenueCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "AddIHACRAmountCM",
              resourceName: "Add Amount",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "MakeIHACRInactiveCM",
              resourceName: "Make IHAC Revenue Inactive",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditIHACRCM",
              resourceName: "Edit IHAC Revenue Code",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Manage Amount",
          funName: [
            {
              resourceType: "Context Menu",
              resourceKey: "EditIHACRAmountCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "DeleteIHACRAmountCM",
              resourceName: "Delete",
              allowedPermission: 4,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Inactive IHAC",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "ShowIHACRInactiveCB",
              resourceName: "Show Inactive",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 10,
      title: "Account Receivable",
      funName: [
        {
          title: "Manage Account Receivable",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "AccountReceivableM",
              resourceName: "Account Receivable",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "AccountReceivableG",
              resourceName: "Account Receivable Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddAccountReceivableB",
              resourceName: "Add Account Receivable",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditAccountReceivableCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "DeleteAccountReceivableCM",
              resourceName: "Delete",
              allowedPermission: 4,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditAccountReceivableCM",
              resourceName: "Delete",
              allowedPermission: 4,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 11,
      title: "Account Receivable Revenue",
      funName: [
        {
          title: "Manage Account Receivable Revenue",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "AccountReceivableRevenueM",
              resourceName: "Account Receivable Revenue",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "ARRevenueG",
              resourceName: "Account Receivable Revenue Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "AddARRevenueB",
              resourceName: "Add Revenue",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditAccountReceivableCM",
              resourceName: "Edit",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "DeleteAccountReceivableCM",
              resourceName: "Delete",
              allowedPermission: 4,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditAccountReceivableCM",
              resourceName: "Delete",
              allowedPermission: 4,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
        {
          title: "Show Modified Info",
          funName: [
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
    {
      id: 12,
      title: "Organisation",
      funName: [
        {
          title: "Manage Organisation",
          funName: [
            {
              resourceType: "Menu",
              resourceKey: "ORGM",
              resourceName: "Organization",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Grid",
              resourceKey: "ORGG",
              resourceName: "Organization Grid",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Button",
              resourceKey: "ORGB",
              resourceName: "Add Organization",
              allowedPermission: 2,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "EditORGCM",
              resourceName: "Edit Organization",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "ViewORGCM",
              resourceName: "View Organization",
              allowedPermission: 3,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "ActivateORGCM",
              resourceName: "Activate Organization",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Context Menu",
              resourceKey: "GetRegistrationLinkORGCM",
              resourceName: "Get Organization Registration Link",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
            {
              resourceType: "Check Box",
              resourceKey: "SMICB",
              resourceName: "Show Modified Info",
              allowedPermission: 1,
              hr: "Y",
              administrator: false,
              employee: "N",
              fiscalOffice: "Y",
              departmentHead: "Y",
              payroll: "Y",
              supervisor: "N",
            },
          ],
        },
      ],
    },
  ]);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [, setSelectedWorkTypeId] = useState();

  const expandChange = (event) => {
    let newData = testdata.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setTestdata(newData);

    event.dataItem.expanded = event.value;
    setTestdata([...testdata]);
    if (!event.value || event.dataItem.amountDetails) {
      return;
    }
  };

  const expandChange2 = (event) => {
    const data = event.dataItem.funName;

    let newData = data?.map((item) => {
      if (item.expanded) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    setDetailData(newData);

    event.dataItem.expanded = event.value;
    setDetailData([...data]);
    if (!event.value || event.dataItem.amountDetails) {
      return;
    }
  };

  const editField = "inEdit";

  const itemChange = (event) => {
    const newData = detailData.map((item) =>
      item.id == event.dataItem.id
        ? {
            ...item,
            [event.field || ""]: event.value,
          }
        : item
    );
    setDetailData(newData);
  };

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      update={update}
      cancel={cancel}
      remove={remove}
      add={add}
      discard={discard}
      editField={editField}
    />
  );

  const enterEdit = (dataItem) => {
    let newData = detailData.map((item) =>
      item.resourceKey == dataItem.resourceKey
        ? {
            ...item,
            inEdit: true,
          }
        : item
    );

    setDetailData(newData);
  };

  const discard = (dataItem) => {
    const newData = [...testdata];
    newData.splice(0, 1);
    setDetailData(newData);
  };

  const cancel = (dataItem) => {
    let newData = detailData.map((item) =>
      item.resourceKey == dataItem.resourceKey
        ? {
            ...item,
            inEdit: false,
          }
        : item
    );
    setDetailData(newData);
  };

  const update = (dataItem) => {};
  const add = (dataItem) => {};

  const remove = (dataItem) => {
    setSelectedWorkTypeId(dataItem.id);
    toggleDeleteDialog();
  };

  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };

  const DeleteOnClick = () => {
  };

  const Detail2Component = (props) => {
    const data = props.dataItem.funName;

    return (
      <>
        {data && (
          <div className="d-flex flex-column gap-3">
            <Grid
              resizable={true}
              onItemChange={itemChange}
              data={detailData}
              editField={editField}
              dataItemKey={"id"}
            >
              <Column field="resourceType" title="Resource Type" />
              <Column field="resourceKey" title="Resource Key" />
              <Column field="resourceName" title="Resource Name" />
              <Column field="hr" title="HR" cell={CheckBoxCell} />
              <Column
                field="administrator"
                title="Administrator"
                cell={CheckBoxCell}
              />
              <Column field="employee" title="Employee" cell={CheckBoxCell} />
              <Column
                field="fiscalOffice"
                title="fiscal Office"
                cell={CheckBoxCell}
              />
              <Column
                field="departmentHead"
                title="Department Head"
                cell={CheckBoxCell}
              />
              <Column field="payroll" title="Payroll" cell={CheckBoxCell} />
              <Column
                field="supervisor"
                title="Supervisor"
                cell={CheckBoxCell}
              />
              <Column cell={CommandCell} width="130px" filterable={false} />
            </Grid>
          </div>
        )}
      </>
    );
  };

  const DetailComponent = (props) => {
    const data = props.dataItem.funName;
    return (
      <>
        {data && (
          <div className="d-flex flex-column gap-3">
            <Grid
              resizable={true}
              data={data}
              detail={Detail2Component}
              expandField="expanded"
              onExpandChange={expandChange2}
            >
              <Column field="title" title="Sub Parent" />
            </Grid>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Accounting
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            CAC Codes
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Permission
          </li>
        </ol>
      </nav>

      <div className="mt-3">
        <Grid
          resizable={true}
          data={testdata}
          detail={DetailComponent}
          expandField="expanded"
          onExpandChange={expandChange}
          dataItemKey={"id"}
          selectable={{
            enabled: true,
            drag: false,
            mode: "multiple",
            cell: false,
          }}
        >
          <Column field="title" title="parent" />
        </Grid>
      </div>

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
    </>
  );
}
