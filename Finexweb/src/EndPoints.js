const config = {};

const response = await fetch("config.json");
const data = await response.json();
Object.assign(config, data);

const apiurl = config.REACT_APP_APIURL;
const authUrl = config.REACT_APP_AuthURL;
const reportUrl = config.REACT_APP_ReportURL;


const privilegeBaseUrl = apiurl;

export const AuthenticationEndPoints = {
  signIn: authUrl + "Authentication/Login",
  signOut: apiurl + "Authorization/LogOut",
  getMenuList: apiurl + "Authorization/GetMenuList",
  getPrivileges: apiurl + "Authorization/GetPrivileges",
  getPrivilegesByResourceGroupName:
    apiurl + "Authorization/GetPrivilegesByFunctionGroupName",
  getRegistrationLink: authUrl + "Authentication/GenerateRegistrationLink",
  Register: authUrl + "Authentication/Register",
  Activate: authUrl + "Authentication/Activate",
  GenerateOrgRegistrationLink:
    authUrl + "Authentication/GenerateOrgRegistrationLink",
  ActivateOrgAdmin: authUrl + "Authentication/ActivateOrgAdmin",
  AddRolesPermission: authUrl + "Authentication/DefaultRP",
  GetUserInfo: authUrl + "Authentication/MyInfo",
  forgotPassword: authUrl + "Authentication/forgotPassword",
  resetPassword: authUrl + "Authentication/resetPassword",
  changePassword: authUrl + "Authentication/changePassword",
};

export const roleEndPoints = {
  createRole: authUrl + "Authentication/CreateRole",
  removeRole: authUrl + "Authentication/DeleteRole/#ROLE#",
  addRole: authUrl + "Authentication/AddRoles",
  removeRoles: authUrl + "Authentication/RemoveRoles",
  getRoles: authUrl + "Authentication/roles",
  getUsersByRole: authUrl + "Authentication/users/#ROLE#",
  getUsers: authUrl + "Authentication/users",
  getRolesByUser: authUrl + "Authentication/GetRoles",
  addUsersToRole: authUrl + "Authentication/addUsersToRole/#ROLE#",
  removeUsersFromRole: authUrl + "Authentication/removeUsersFromRole/#ROLE#",
};
export const ReportsEndPoints = {
  GenerateReport: reportUrl + "GenerateReport",
  GenerateReportPayroll: reportUrl + "Payroll/GenerateReport",
  GenerateReportAR: reportUrl + "ReportAR/Generate",
  GenerateReportPO: reportUrl + "GenerateReportPO",
  GenerateReportVoucher: reportUrl + "GenerateReportVoucher",
  RunAutoPayroll: reportUrl + "Payroll/RunPayroll",
  PayrollBreakDown: reportUrl + "Payroll/PayrollBreakDown",
  ElectronicPOStringMFCD: reportUrl + "ElectronicPOStringMFCD",
  ElectronicVoucherString: reportUrl + "ElectronicVoucherString",
  ElectronicVoucherStringClark: reportUrl + "ElectronicVoucherStringClark",
  ElectronicVoucherStringMySotwareSolutions:
    reportUrl + "ElectronicVoucherStringMySotwareSolutions",
  AddSingleBenefitToPayroll: reportUrl + "payroll/AddSingleBenefitToPayroll",
};

export const PrevYear = {
  prevYearRevneue: apiurl + "Fund/PreYearBalanceRevenues",
  prevYearExpense: apiurl + "Fund/PreYearBalances",
};

export const FundEndPoints = {
  //GetMenuList: URL + "menu/get",
  GetFundList: apiurl + "fund",
  GetFundCodeList: apiurl + "fund/codes",
  GetFundListWithFilter: apiurl + "fund/Filter?",
  GetFundDetailList: apiurl + "fund/#ID#/cashbalance",
  GetFundBalanceByID: apiurl + "Fund/accountingcodes/#ID#/Balance",
  GetFundTotalBudgetByID: apiurl + "accountingcodes/#ID#/TotalBudgetamount",
  GetFundCashBalanceByID: apiurl + "fund/cashbalance/#cashBalanceID#",
  AddFund: apiurl + "Fund",
  EditDeleteFundById: apiurl + "Fund/",
  TransferFund: apiurl + "Fund/Transfer",
  AddCashBalance: apiurl + "Fund/#FundId#/cashbalance",
  CalculateAndStoreFundBalances: apiurl + "Fund/CalculateAndStoreFundBalances",
  CalculateCarryoverAmounts: apiurl + "Fund/CalculateCarryoverAmounts",
};

export const fundTrans = {
  GetFundTransList: apiurl + "fundTrans",
  postFundTransList: apiurl + "fundTrans",
  putFundTransList: apiurl + "fundTrans",
  deleteFundTransList: apiurl + "fundTrans",
}

export const ExpenseEndPoints = {
  AddBudgetAmount: apiurl + "accountingcodes/#AccountingCodeId#/budgetamount",
  AddExpense: apiurl + "accountingcodes",
  GetBudgetAmount: apiurl + "accountingcodes/#AccountingCodeId#/budgetamount",
  GetBudgetAmountByID: apiurl + "accountingcodes/budgetamount/#budgetID#",
  GetAccountingCodeDetailList: apiurl + "accountingcodes/6",
  GetAccountingCodesFilter: apiurl + "Fund/accountingcodesFilter?",
  GetAccountingCodesByID: apiurl + "accountingcode/",
  GetAccountingCodesList: apiurl + "accountingcodes/#AccountingTypeCode#",
  TransferAmount: apiurl + "accountingcode/Transfer",
  GetExpenseCodeList: apiurl + "accountingcodes/7",
};

export const RevenueEndPoints = {
  AddBudgetAmount: apiurl + "accountingcodes/#AccountingCodeId#/budgetamount",
  AddExpense: apiurl + "accountingcodes",
  GetBudgetAmount: apiurl + "accountingcodes/#AccountingCodeId#/budgetamount",
  GetAccountingCodeDetailList: apiurl + "accountingcodes/6",
  GetAccountingCodesFilter: apiurl + "Fund/accountingcodesFilter?",
  GetAccountingCodesByID: apiurl + "accountingcode/",
  TransferAmount: apiurl + "accountingcode/Transfer",
};

export const budgetamountEndPoints = {
  AddRevenue: apiurl + "accountingcodes",
  AddBudgetAmount: apiurl + "accountingcodes/#AccountingCodeId#/budgetamount",
  TotalBudgetAmount:
    apiurl + "accountingcodes/#AccountingCodeId#/TotalAmountAndBalance",
  GetAccountingCodeDetailList: apiurl + "accountingcodes/#CodeType#",
};

export const IHACExpenseCodeEndPoints = {
  GetIHACList: apiurl + "IHAC",
  GetIHACListWithFilter: apiurl + "IHAC/Filter?",
  GetIHACDetailList: apiurl + "IHACExpenseAmount?ihacCodeId=#ID#",
  AddIHACExpenseAmount: apiurl + "IHACExpenseAmount",
  IHACExpenseAmount: apiurl + "IHACExpenseAmount",
  DeleteIHACExpenseAmount: apiurl + "IHAC/IHACExpenseAmount",
  getIHACExpenseAmount: apiurl + "IHAC/IHACExpenseAmount",
  AddIHAC: apiurl + "IHAC",
  EditDeleteIAHCById: apiurl + "IHAC/",
  GetIHCProgramList: apiurl + "IHCProgram",
  GetIHCDepartmentList: apiurl + "IHCDepartment",
  GetIHCAccountList: apiurl + "IHCAccount",
  GetIHCSubAccountList: apiurl + "IHCSubAccount",
  CalculateCarryoverAmounts: apiurl + "IHAC/CalculateCarryoverAmounts",
  ReCalculateCarryoverAdjustment:
    apiurl + "IHAC/ReCalculateCarryoverAdjustment",
  GetIHACBalance: apiurl + "IHAC/GetIHACBalance",
  //TransferFund: apiurl + "Fund/Transfer",
  //AddCashBalance: apiurl + "Fund/#FundId#/cashbalance"
  AddProgDeptForEmployee: apiurl + "IHAC/AddProgDeptForEmployee",
  GetProgDeptForEmployee: apiurl + "IHAC/GetProgDeptForEmployee",
  getCacSAcByIhac: apiurl + "IHAC/getCacSacByIhac/#ihacAccountingCode#"
};

export const ProgramEndPoints = {
  GetProgram: apiurl + "IHCProgram",
  GetProgramFilter: apiurl + "IHAC/IHCProgramFilter?",
  AddProgram: apiurl + "IHCProgram",
  GetAccountingCodeDetailList: apiurl + "accountingcodes/#CodeType#",

  GetProgramList: apiurl + "IHCProgram",
  GetProgramListWithFilter: apiurl + "IHCProgram/12?",
  GetProgramDetailList: apiurl + "fund/#ID#/cashbalance",
  EditDeleteProgramById: apiurl + "IHCProgram/",
  TransferProgram: apiurl + "Fund/Transfer",
  AddCashBalance: apiurl + "Fund/#FundId#/cashbalance",
};

export const DepartmentEndPoints = {
  GetDepartment: apiurl + "IHCDepartment",
  GetDepartmenFilter: apiurl + "IHAC/IHCDepartmentFilter?",
  AddDepartment: apiurl + "IHCDepartment",
  GetAccountingCodeDetailList: apiurl + "accountingcodes/#CodeType#",
};

export const IHCSubAccountEndPoints = {
  GetIHCSubAccount: apiurl + "IHCSubAccount",
  GetIHCSubAccountFilter: apiurl + "IHAC/IHCSubAccountFilter?",
  AddIHCSubAccount: apiurl + "IHCSubAccount",
};
export const IHCAccountEndPoints = {
  GetIHCAccount: apiurl + "IHCAccount",
  GetIHCAccountFilter: apiurl + "IHAC/IHCAccountFilter?",
  AddIHCAccount: apiurl + "IHCAccount",
  GetAccountingCodeDetailList: apiurl + "accountingcodes/#CodeType#",
};

export const HolidayEndPoints = {
  HolidaySchedule: apiurl + "HolidaySchedule",
  HolidayScheduleClone: apiurl + "HolidaySchedule/clone",
  HolidayScheduleYear: apiurl + "HolidaySchedule/years",
  HolidayScheduleDate: apiurl + "HolidaySchedule/Header",
  DeleteHolidayScheduleDate: apiurl + "HolidaySchedule/Date",
  Holiday: apiurl + "HolidaySchedule/Date",
};

export const LeaveTypeEndPoints = {
  getLeaveType: apiurl + "LeaveType/Filter",
  LeaveType: apiurl + "LeaveType",
};

export const PayRoll = {
  PREmployee: apiurl + "PREmployee",
  PRLeaveType: apiurl + "PRLeaveType",
  PRGroups: apiurl + "PREmployee/groups",
};

export const PayrollEndPoints = {
  setInActiveEmployee: apiurl + "Employee/SetInactive/#ID#",
  setActiveEmployee: apiurl + "Employee/SetActive/#ID#",
  Employee: apiurl + "Employee",
  EmployeeFilter: apiurl + "Employee/Filter",
  EmployeeById: apiurl + "Employee/ID",
  Address: apiurl + "Employee/#EmployeeID#/Address",
  AllEmployeesAddress: apiurl + "Employee/Address",
  PutEmployeesAddress: apiurl + "Employee/Address/#ID#",
  EmployeeFamily: apiurl + "Employee/#ID#/Family",
  PutEmployeeFamily: apiurl + "Employee/Family/#ID#",
  EmployeesFamily: apiurl + "Employee/Family",
  Defaults: apiurl + "PayrollDefaults",
  Vacation: apiurl + "PayrollDefaults/VacationRates",
  ContractYears: apiurl + "PayrollDefaults/PayrollEmpYears",
  ContractYearsList: apiurl + "PayrollDefaults/PayrollEmpYearsList",
  ContractYearDeleteById: apiurl + "PayrollDefaults/PayrollEmpYears/#ID#",
  GetContractYearById: apiurl + "PayrollDefaults/PayrollEmpYears/#ID#",
  UpdateYearDeleteById: apiurl + "PayrollDefaults/PayrollEmpYears/#ID#",
  PostAttendanceBulk: apiurl + "Attendance/UpdateAttendanceBulk",
  Benefits: apiurl + "PayrollDefaults/Benefits",
  BenefitTypes: apiurl + "PayrollDefaults/BenefitTypes",
  BenefitsById: apiurl + "PayrollDefaults/Benefits/#ID#",
  BenefitPackageLinkById: apiurl + "PayrollDefaults/BenefitPackageLink/#ID#",
  Packages: apiurl + "PayrollDefaults/BenefitPackages",
  PackagesById: apiurl + "PayrollDefaults/BenefitPackages/#ID#",
  JobCodes: apiurl + "PayrollDefaults/JobCodes",
  PayrollJobClassification: apiurl + "PayrollDefaults/PayrollJobClassification",
  PayrollUnion: apiurl + "PayrollDefaults/PayrollUnion",
  BenefitsByPackageID: apiurl + "PayrollDefaults/BenefitsByPackage/#ID#",
  AddBenefitToPackage: apiurl + "PayrollDefaults/AddBenefitToPackage",
  UpdateBenefitToPackage: apiurl + "PayrollDefaults/UpdateBenefitToPackage",
  Attendence: apiurl + "Payroll/Attendance",
  BenefitUpdateStatus: apiurl + "PayrollDefaults/Benefits/updatestatus",
  getCountyDate: apiurl + "PREmployee/counties",

  addHolidayHours: apiurl + "Payroll/addHolidayHours",
};

export const PayrollEmployee = {
  Setup: apiurl + "PayrollEmployee/EmployeePayrollSetup",
  Salary: apiurl + "PayrollEmployee/Salary",
  UpdateSalary: apiurl + "PayrollEmployee/UpdateSalary",
  AddSalaryToJob: apiurl + "PayrollEmployee/AddSalaryToJob",
  getSalary: apiurl + "PayrollEmployee/Salary",
  job: apiurl + "PayrollEmployee/EmployeeJobInfosByEmpId",
  EmployeeJobs: apiurl + "PayrollEmployee/GetEmployeeJobsByEmpId",
  jobList: apiurl + "PayrollDefaults/PayrollJobDescription",
  distribution: apiurl + "PayrollEmployee/PayrollDistributionByJobId",
  PayrollDistribution: apiurl + "PayrollEmployee/PayrollDistribution",
  BenefitsByJobID: apiurl + "PayrollEmployee/EmployeePayrollBenefitsByJobId",
  BenefitsByDistID:
    apiurl + "PayrollEmployee/EmployeePayrollBenefitsByPayDistId",
  EmployeeJobInfo: apiurl + "PayrollEmployee/EmployeeJobInfo",
  PostEmployeePayrollBenefits:
    apiurl + "PayrollEmployee/EmployeePayrollBenefits",

  EmployeePayrollBenefits: apiurl + "PayrollEmployee/EmployeePayrollBenefits",
  EmployeePayrollSetup: apiurl + "PayrollEmployee/EmployeePayrollSetup",
  Common: apiurl + "Common",
  EmployeeBenefitStatusChange:
    apiurl +
    "PayrollEmployee/EmployeePayrollBenefits/UpdateStaus/#Id#/#inactive#",
};

export const PayrollEmployeeSetup = {
  getEmployeeGridData: apiurl + "PayrollEmployee/EmployeePayrollSetup",
  GetPayRaiseSalaryData: apiurl + "Payroll/GetPayRaiseSalaryData",
  applyPayRaise: apiurl + "Payroll/ApplyPayRaise"
};

export const EmplTimecardEndPoints = {
  Employee: apiurl + "Employee",
  TCEmployee: apiurl + "TCEmployee",
  EditEmployeeById: apiurl + "TCEmployee/employee/",
  EmployeeSchedule: apiurl + "TCEmployee/schedules/calendar-view/",
  EmployeeScheduleTime: apiurl + "TCEmployee/schedules/post",
  SupervisorList: apiurl + "TCEmployee/supervisors/",
  Reportees: apiurl + "TCEmployee/Reportees",
  GroupNumber: apiurl + "TCEmployee/GroupNumber",
  SupervisorGroupNumber: apiurl + "TCEmployee/SupervisorGroupNumber",
  EmpScheduleName: apiurl + "TCEmployee/EmpSchedule/post",
  Schedules: apiurl + "TCEmployee/Schedules",
  ByScheduleId: apiurl + "TCEmployee/ByScheduleId?",
  EmployeeDetail: apiurl + "TCEmployee/EmployeeDetail",
  ByGroupNumber: apiurl + "TCEmployee/ByGroupNumber",
};

export const TimecardEndPoints = {
  TimecardList: apiurl + "TimeCard",
  TimeCardEmployeeDay: apiurl + "TimeCard/EmployeeeForDay",
  TimeCardLeaveRequest: apiurl + "LeaveRequest",
  TimeCardEntry: apiurl + "TimeCard/Detail",
  TimeCardHeader: apiurl + "TimeCard/time-card-header",
  TimeCardReport: apiurl + "TimeCard/filter",
  TimeCardStatus: apiurl + "TimeCard/TimeCardStatus",
  FutureLeave: apiurl + "LeaveRequest/FutureLeave",
  LeaveRequest: apiurl + "LeaveRequest/filter",
  clockIn: apiurl + "TimeCard/TimeCardClockIn",
  clockOut: apiurl + "TimeCard/TimeCardClockOut",
  TimeCardApprove: apiurl + "TimeCard/ApproveTimesheet",
  LeaveRequestOrReject: apiurl + "LeaveRequest/LeaveRequestApproveOrReject",
  RunTimeCard: apiurl + "BatchProcess/RunTimecard",
  RunTimecardInactive: apiurl + "BatchProcess/RunInactive",
};

export const SupervisorEndPoints = {
  SupervisorSubSchedule: apiurl + "SupervisorSubSchedule",
};
export const projectCostingEndPoints = {
  Project: apiurl + "Project",
  GetLocations: apiurl + "Project/ProjectLocations",
  GetTypeOfWorkList: apiurl + "Project/ProjectWorkTypes",
  Labour: apiurl + "Project/#ProjectId#/ProjectLabor",
  MaterialSupplies: apiurl + "Project/#ProjectId#/ProjectMaterial",
  Equipment: apiurl + "Project/#ProjectId#/ProjectEquipment",
  Revenue: apiurl + "Project/#ProjectId#/ProjectRevenue",
  GetMaterialSuppliesListWithFilter:
    apiurl + "Project/#ProjectId#/GetMaterialWithFilter?",
  GetLaborWithFilter: apiurl + "Project/#ProjectId#/GetLaborWithFilter?",
  GetEquipmentWithFilter:
    apiurl + "Project/#ProjectId#/GetEquipmentWithFilter?",
  GetRevenueWithFilter: apiurl + "Project/#ProjectId#/GetRevenueWithFilter?",
  GetVendors: apiurl + "Vendor",
};
export const equipmentSetupEndPoints = {
  EquipmentSetup: apiurl + "Project/ProjectEquipmentSetup",
  EquipmentSetupWithFilter: apiurl + "Project/ProjectEquipmentSetupWithFilter",
};

export const InventoryEndPoints = {
  InventoryListWithFilter:
    apiurl + "AssetsAndInventory/GetAssetsAndInventoriesWithFilter?",
  Inventory: apiurl + "AssetsAndInventory/#InventoryId#",
  GetProgram: apiurl + "AssetsAndInventory/Programs",
  GetBuilding: apiurl + "AssetsAndInventory/Building",
  GetResPerson: apiurl + "AssetsAndInventory/ResPerson",
  GetAssetsArea: apiurl + "AssetsAndInventory/AssetArea",
  GetAssetsType: apiurl + "AssetsAndInventory/AssetType",
  GetInventoryCategory: apiurl + "AssetsAndInventory/InventoryCategories",
  GetAssetSACAmount: apiurl + "AssetsAndInventory/AssetSacAmount",
  GetAssetSACAmountByAssetId:
    apiurl + "AssetsAndInventory/AssetSacAmountByAssetId",
  AssetSACAmount: apiurl + "AssetsAndInventory/AssetSacAmount",
  GetAssetFunding: apiurl + "AssetsAndInventory/AssetFunding",
  AssetLookup: apiurl + "AssetsAndInventory/AssetLookups",
  AddAssetLookup: apiurl + "AssetsAndInventory/AssetLookup",
  EditAssetLookup: apiurl + "AssetsAndInventory/AssetLookup",
};

export const PurchaseOrderEndPOints = {
  GetPurchaseOrder: apiurl + "PurchaseOrder/CountyPO",
  PurchaseOrder: apiurl + "PurchaseOrder",
  GetPurchaseOrderCountyPOTypes: apiurl + "PurchaseOrder/CountyPo/POTypes",
  GetTemporaryPONumber: apiurl + "PurchaseOrder/TemporaryPONumber",
  getCAC: apiurl + "accountingcodes",
  DeletePurchaseOrder: apiurl + "PurchaseOrder",
  POBalance: apiurl + "PurchaseOrder/POBalance",
  UnencumberedBalance: apiurl + "PurchaseOrder/UnencumberedBalance",
  POLiquidate: apiurl + "PurchaseOrder/POLiquidate",
  DoubleEncumerance: apiurl + "PurchaseOrder/DoubleEncumerance/#PONUM#",
  ClosePO: apiurl + "PurchaseOrder/ClosePo",
  CloseCurrentPo: apiurl + "PurchaseOrder/CloseCurrentPo",
  OpenPo: apiurl + "PurchaseOrder/OpenPo",
};

export const PurchaseOrderLineItemEndPoints = {
  GetLineItems: apiurl + "PurchaseOrder/PurchaseOrderLineItem",
  AddLineItem: apiurl + "PurchaseOrder/PurchaseOrderLineItem",
  LineItem: apiurl + "PurchaseOrder/PurchaseOrderLineItem",
  purchaseOrder: apiurl + "PurchaseOrder",
};

export const VendorEndPoints = {
  GetVendor: apiurl + "Vendor",
  VendorFilter: apiurl + "Vendor/Filter",
  AddVendor: apiurl + "Vendor",
  DeleteVendor: apiurl + "Vendor",
};
export const VoucherEndPoints = {
  GetVoucher: apiurl + "Voucher",
  GetVoucherFilter: apiurl + "Voucher/Filter",
  GetVoucherByVoucherNumber: apiurl + "Voucher/VoucherByNo",
  PostVoucher: apiurl + "Voucher",
  DeleteVoucher: apiurl + "Voucher",
  UnPostVoucher: apiurl + "Voucher/UnPostVoucher",
  VoucherLineItemForm: apiurl + "Voucher/VoucherInvoiceLineItem",
  VoucherLineItem: apiurl + "Voucher/VoucherInvoiceLineItemByVoucherId",
  VoucherBasedPO: apiurl + "Voucher/Voucher",
  VoucherBasedIHPO: apiurl + "Voucher/VoucherIHPO",
  VoucherBreakdown: apiurl + "Voucher/VoucherBreakdown",
  GetTemporaryVoucherL: apiurl + "Voucher/TemporaryVoucherNumber",
  BatchPostVouchers: apiurl + "Voucher/BatchPostVouchers",
};

export const BatchEndPoints = {
  GetBatch: apiurl + "Voucher/BatchVoucher?",
  PostORUpdateBatch: apiurl + "Voucher/BatchVoucher",
  CreateBatch: apiurl + "Voucher/BatchVoucher",
  PutBatch: apiurl + "Voucher/BatchVoucher",
  GetVoucher: apiurl + "Voucher/BatchVoucher",
  DeleteVoucher: apiurl + "Voucher/BatchVoucher",
  GetVouchersByDateSpan: apiurl + "Voucher/GetVouchersByDateSpan",
  AddVouhersToBatch: apiurl + "Voucher/AddVouhersToBatch",
  GetBatchVoucherByBatchId: apiurl + "Voucher/GetBatchVoucherByBatchId",
  RemoveVouhersFromBatch: apiurl + "Voucher/RemoveVouhersFromBatch",
  PostBatchVouchers: apiurl + "Voucher/PostBatchVouchers",
  ApproveBatchVouchers: apiurl + "Voucher/ApproveBatchVouchers",
};

export const IHPOEndPoints = {
  GetIHPO: apiurl + "IHPO/IHPO",
  MyIHPO: apiurl + "IHPO/MYIHPO",
  IHPO: apiurl + "IHPO/IHPO",
  OpenIHPO: apiurl + "IHPO/OpenIHPO",
  ApproveAsSuperintendent: apiurl + "IHPO/ApproveAsSuperintendent",
  CloseIHPO: apiurl + "IHPO/CloseIHPO",
  IHPOLineItem: apiurl + "IHPO/IHPOLineItem",
  IHPOTemporary: apiurl + "IHPO/TemporaryIHPONumber",
  IHPOApproveStatus: apiurl + "IHPO/IHPOApproveStatus",
  IHPOBasedPO: apiurl + "IHPO/IHPOBasedPO",
  IHPOBalance: apiurl + "IHPO/IHPOBalance",
};

export const ConfigurationEndPoints = {
  GetConfigurationData: apiurl + "Fund/GetConfigurationMasterData",
  GetConfigurationById: apiurl + "Fund/GetConfigurationBySettingId",
  SaveConfiguration: apiurl + "Fund/SaveConfigurationData",
};

export const StateAccountCodeEndPoints = {
  GetStateAccountPage: apiurl + "StateAccountCode/#ORGID#",
  GetStateAccountRow: apiurl + "StateAccountCode/#PAGEID#/Row",
  GetStateAccountColumn: apiurl + "StateAccountCode/#ROWID#/Column",
};

export const CommonEndPoints = {
  Getcommon: apiurl + "Common",
};
export const VoucherBD = {
  GetBD: apiurl + "Voucher/get-voucher-bd-org-id",
};

export const AccountReceivable = {
  GetRevenue: apiurl + "AccountRevenue",
  GetAllOtherDescription: apiurl + "AccountRevenue/GetAllOtherDescription",
  GetRevenueFilter: apiurl + "AccountRevenue/Filter",
  Revenue: apiurl + "AccountRevenue",
  getAccountReceivableFilter:
    apiurl + "AccountRevenue/FilterAccountReceivables",
  getAccountReceivable: apiurl + "AccountRevenue/AccountReceivables",
  AccountReceivable: apiurl + "AccountRevenue/AccountReceivables",
  getRevenueReceived: apiurl + "AccountRevenue/RevenueReceived",
  GetTemporaryReceiptNumber: apiurl + "AccountRevenue/TemporaryReceiptNumber",
  GetTemporaryInvoiceNumber: apiurl + "AccountRevenue/TemporaryInvoiceNumber",
  getCAC: apiurl + "accountingcodes",
  BatchPostRevenue: apiurl + "AccountRevenue/PostRevenue",

  getPendingInvoice: apiurl + "AccountRevenue/GetPendingInvoicesForCustomer",
  approveRevenues: apiurl + "AccountRevenue/ApproveRevenues",
  accountRevenueByProject: apiurl + "AccountRevenue/RevenuesByProject",
};

export const RevenueDetailsBD = {
  CountyRevenueBD: apiurl + "AccountRevenue/CountyRevenueBD",
  revenueDetails: apiurl + "AccountRevenue/RevenueDetailsBD",
};
export const AccountReceivablesDesc = {
  getAccountReceivablesDesc: apiurl + "AccountRevenue/AccountReceivablesDesc",
  getAccountReceivableDesc: apiurl + "AccountRevenue/AccountReceivableDesc",
  revenueDetails: apiurl + "AccountRevenue/RevenueDetailsBD",
};

export const EmployeeEndPoints = {
  employeeByOrg: apiurl + "Employee/Organization",
};

export const TypeOfWorkEndPoints = {
  TypeOfWork: apiurl + "Project/ProjectWorkTypes",
  TypeOfLocation: apiurl + "Project/ProjectLocations",
};

export const UploadDocumentEndPoints = {
  SaveUploadDocument: apiurl + "UploadDocument/UploadDoc",
  GetUploadDocumentList: apiurl + "UploadDocument/GetUploadDocumentList?",
};
export const OrganizationEndPoints = {
  Organization: apiurl + "Organization",
  OrganizationLocation: apiurl + "Organization/OrganizationLocation",
};

export const SignificantRates = {
  SignificantRatesByPayDistId: apiurl + "PayrollEmployee/SignificantRates",
  SignificantDatesByPayDistId: apiurl + "PayrollEmployee/SignificantDates",
};

export const TimeCardLeaveBalance = {
  UpdateHolidayCalamityHours: reportUrl + "UpdateHolidayCalamityHours",
  TimecardLeaveBalance: reportUrl + "TimecardLeaveBalance",
  AttendanceDetails: reportUrl + "AttendanceDetails",
  AttendanceDetails: reportUrl + "AttendanceDetails",
  GetVSP: apiurl + "TimeCard/GetVSP",
};

export const PayrollAttendance = {
  DatePaid: apiurl + "Attendance/DatePaid",
  EmployeeByPaidDate: apiurl + "Attendance/EmployeeByPaidDate",
  UpdateAttendance: apiurl + "Attendance/UpdateAttendance",
  DeleteAttendance: apiurl + "Attendance",
  UpdateAttendancePayrollFMLAandLWOP:
    apiurl + "Attendance/UpdateAttendancePayrollFMLAandLWOP",
  GetAttendancePayrollFMLAandLWOP:
    apiurl + "Attendance/GetAttendancePayrollFMLAandLWOP",
  GetDatePaid: reportUrl + "Payroll/GetDatePaid",
  GetDatePaidDetailData: reportUrl + "Payroll/GetDatePaidDetailData",
};

export const payrollEndpoints = {
  PayrollTotals: apiurl + "Payroll/PayrollTotals",
  PREmployeeList: apiurl + "Payroll/PREmployeeList",
  PREmployeeDistributions: apiurl + "Payroll/PREmployeeDistributions",
  BenefitAdjustment: apiurl + "Payroll/BenefitAdjustment",
  EmployeePaidHistory: apiurl + "Payroll/EmployeePaidHistory",
  EmployeePaidDistributions: apiurl + "Payroll/EmployeePaidDistributions",
  EmployeeHistoryBenefits: apiurl + "Payroll/EmployeeHistoryBenefits",
  PayrollToatals: apiurl + "Payroll/PayrollToatals",
  PayrollTotalDeatial: apiurl + "Payroll/PayrollTotalDeatial",
  PayrollTotalDetail: apiurl + "Payroll/PayrollTotalDetail",
  RefreshPayrollTotalDetail: apiurl + "Payroll/RefreshPayrollTotalDetail",
  CalcHoursAndDollars: reportUrl + "CalcHoursAndDollars",
  BenefitUpdateStatus: apiurl + "PayrollDefaults/Benefits/updatestatus",
  //DeletePayrollRow: apiurl + "PayrollDefaults/payroll/delete",
  BenefitRateChange: reportUrl + "Payroll/BenefitRateChange",
  setEndDatesOnBenefitsByBenefitNo: reportUrl + "Payroll/SetEndDatesOnBenefitsByBenefitNo",
};

export const PrivilegeEndPoints = {
  GetFunctionGroupsTree:
    privilegeBaseUrl + "Authorization/GetFunctionGroupsTree",
  Privileges: privilegeBaseUrl + "Authorization/Privileges",
  FunctionWithAllowedPrivileges:
    privilegeBaseUrl + "Authorization/FunctionWithAllowedPrivileges",
  FunctionsResources: privilegeBaseUrl + "Authorization/FunctionsResources",
  FunctionGroups: privilegeBaseUrl + "Authorization/FunctionGroups",
  Functions: privilegeBaseUrl + "Authorization/Functions",
  Privileges: privilegeBaseUrl + "Authorization/Privileges",
  Resources: privilegeBaseUrl + "Authorization/Resources",
  FunctionResourcePrivilege:
    privilegeBaseUrl + "Authorization/FunctionResourcePrivilege",
};

export const StartingBalanceEndPoints = {
  PreYearStartingBalanceByEmpId:
    apiurl + "PayrollEmployee/PreYearStartingBalanceByEmpId",
  PreYearStartingBalance: apiurl + "PayrollEmployee/PreYearStartingBalance",
};

export const Payroll = {
  PostPayroll: reportUrl + "Payroll/PostPayroll",
  PostBenefits: reportUrl + "Payroll/PostBenefits",
  UpdateAdjustedPayroll: reportUrl + "Payroll/UpdateAdjustedPayroll",
  UnPostPayroll: reportUrl + "Payroll/UnPostPayroll",
};
