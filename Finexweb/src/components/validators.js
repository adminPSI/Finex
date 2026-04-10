import { getter } from "@progress/kendo-react-common";
const emailRegex = new RegExp(/\S+@\S+\.\S+/);
const onlyNumbersRegex = new RegExp(/^\d+$/);
const onlyNumberAndCharacters = /^[A-Za-z0-9]+$/;
const onlyNumAllowedReg = /^[0-9]*$/;
const onlyNumWithDecimalAllowedReg = /^\d+(\.\d+)?$/;
export const onlyCharAllowedReg = /^[a-zA-Z\s]+$/;
export const onlyNumbersRegexs = new RegExp(/^\d+$/);

export const onlyNumAllowed = (value) =>
  !onlyNumAllowedReg.test(value) && "It must contain only numbers";

export const emailValidator = (value) =>
  !value
    ? "Email field is required."
    : emailRegex.test(value)
      ? ""
      : "Email is not in a valid format.";
export const userNameValidator = (value) =>
  !value
    ? "User Name is required"
    : value.length < 5
      ? "User name should be atleast 5 characters long."
      : "";
export const requiredValidator = (value) =>
  value ? "" : "Error: This field is required.";
export const passwordValidator = (value) =>
  value && value.length >= 8 ? "" : "Password must be atleast 8 characters.";

export const phoneNumberVaidator = (value) =>
  !onlyNumbersRegex.test(value)
    ? "Phone number is required"
    : /^\d{10,20}$/.test(value)
      ? ""
      : "Must be between 10 and 20 digiits";
export const addressValidator = (value) =>
  value ? "" : "Address is required.";

export const fundCodeValidator = (value) =>
  !value
    ? "Fund Code is required."
    : onlyNumberAndCharacters.test(value)
      ? ""
      : "Fund Code is not Valid.";

export const expenseCodeValidator = (value) =>
  value ? "" : "Expense Code is required.";
export const reveneuCodeValidator = (value) =>
  value ? "" : "Revenue Code is required.";
export const fundNameValidator = (value) =>
  value ? "" : "Fund Name is required.";
export const DateValidator = (value) => (!value ? "Date is required" : "");
export const DOBValidator = (value) => (!value ? "Date of Birth is required" : "");
export const activeDateValidator = (value) =>
  !value ? "Date is required" : "";
export const currentDateValidator = (value) =>
  !value
    ? "Date is required" : "";
export const prevCurrNextYearDateValidator = (value) =>
  !value
    ? "Date is required" : "";
export const InvoiceToValidator = (value) =>
  value ? "" : "Invoice To is required.";
export const RevenueRecievedFromValidator = (value) =>
  value ? "" : "Revenue Received From is required.";
export const startingBalanceValidator = (value) => {
  
  return value && value > 0 ? "" : "Amount is required.";
}
export const startingAllBalanceValidator = (value) => {
  
  return value  ? "" : "Amount is required.";
}
export const AllocationAmountValidator = (value) =>
  value && value > 0 ? "" : "Allocation Amount is required.";
export const AnticipatedRevenueValidator = (value) =>
  value && value > 0 ? "" : "Anticipated Revenue Amount is required.";
export const transferAmtValidator = (value) =>
  value && value > 0
    ? ""
    : value < 0
      ? "Enter Valid Amount."
      : "Amount is required";
export const ddlFundValidator = (value) =>
  value && value.id > 0 ? "" : "Please select a Fund.";
export const ddlExpenseCodeValidator = (value) =>
  value && value.id > 0 ? "" : "Please select an Expense Code.";
export const ddlRevenueCodeValidator = (value) =>
  value && value.id > 0 ? "" : "Please select an Revenue Code.";
export const currencyAmountValidator = (value) =>
  !value
    ? "Amount is required"
    : value > 0
      ? ""
      : "Amount can't be negative number";
export const amountValidator = (value) =>
  value == null || value == undefined
    ? ""
    : value >= 0
      ? ""
      : "Amount can't be negative number";

export const currencyBalanceValidator = (value) =>
  !value
    ? "Balance is required"
    : value > 0
      ? ""
      : "Please Enter Positive Balance.";

export const expenseAmountTypeValidator = (value) =>
  value ? "" : "Type is required.";
export const descriptionValidator = (value) =>
  value ? "" : "Description is required.";
export const salaryBenefitsValidator = (value) =>
  value ? "" : "Program salary benefits is required.";
export const endDateValidator = (value, startDate) => {
  if (!startDate) {
    return "Please select start date first.";
  } else if (!value) {
    return "End Date is required.";
  } else if (value) {
    return new Date(value) < new Date(startDate)
      ? "End Date cannot be earlier then start date."
      : "";
  }
  return value ? "" : "End Date is required.";
};
export const startDateValidator = (value) =>
  value ? "" : "Start Date is required.";
export const postDateValidator = (value) => {
  if (!value) {
    return "Post Date is required.";
  }
  const year = value.getFullYear();
  const currectYear = new Date().getFullYear();
  if (year !== currectYear) {
    return `Date must be in ${currectYear}.`
  }
  return ""
}
export const idValidator = (value) => (value ? "" : "Program id is required.");
export const revenueCheckValidator = (value) =>
  value ? "" : "Program revenue check is required.";
export const expenseCheckValidator = (value) =>
  value ? "" : "Program expense check is required.";
export const inactiveValidator = (value) =>
  value ? "" : "Program inactive check is required.";
export const modifiedByValidator = (value) =>
  value ? "" : "Program inactive check is required.";
export const ihacCodeValidator = (value) =>
  value ? "" : "IHAC code is required.";

export const programDropdownValidator = (value) =>
  value ? "" : "Program is required.";
export const departmentDropdownValidator = (value) =>
  value ? "" : "Department is required.";
export const accountDropdownValidator = (value) =>
  value ? "" : "Account is required.";
export const subAccountDropdownValidator = (value) =>
  value ? "" : "Sub Account is required.";

export const programCodeValidator = (value) =>
  value ? "" : "Program inactive check is required.";
export const programNameValidator = (value) =>
  value ? "" : "Program inactive check is required.";
const userNameGetter = getter("username");
const emailGetter = getter("email");
export const formValidator = (values) => {
  const userName = userNameGetter(values);
  const emailValue = emailGetter(values);
  if (userName && emailValue && emailRegex.test(emailValue)) {
    return {};
  }
  return {
    VALIDATION_SUMMARY: "Please fill in the following fields.",
    ["username"]: !userName ? "User Name is required." : "",
    ["email"]:
      emailValue && emailRegex.test(emailValue)
        ? ""
        : "Email is required and should be in a valid format.",
  };
};

export const leaveTypeValidator = (value) =>
  value ? "" : "Leave Type is required.";
export const leaveNameValidator = (value) =>
  value ? "" : "Leave Name is required.";
export const allowEmployeeSelectValidator = (value) =>
  !value ? "Allow employee to select is required" : "";
export const requireReasonValidator = (value) =>
  !value ? "Require reason is required" : "";

export const yearValidator = (value) => (value ? "" : "Year is required.");
export const scheduleNameValidator = (value) =>
  !value ? "Holiday Schedule is required" : "";

export const supervisorNameValidator = (value) =>
  value ? "" : "Supervisor name is required.";
export const backupSupervisorValidator = (value) =>
  value ? "" : "Backup Supervisor is required.";
export const ApprovedValidator = (value) =>
  value ? "" : "Approved is required.";

export const locationValidator = (value) =>
  value ? "" : "Location is required.";
export const typeOfWorkValidator = (value) =>
  value ? "" : "Type of Work is required.";

export const projectNameValidator = (value) =>
  !value
    ? "Project Name is required."
    : stringValidationRegex.test(value)
      ? false
      : "Value Should be AlphaNumeric.";

export const budgetValidator = (value) => (value ? "" : "Budget is required.");
export const notesValidator = (value) => (value ? "" : "Notes is required.");
export const EquipmentNameValidator = (value) =>
  value ? "" : "Equipment Name is required.";
export const hourlyRateValidator = (value) =>
  value ? "" : "Hourly Rate is required.";
export const InventoryNameValidator = (value) =>
  value ? "" : "Equipment Name is required.";

export const inventoryNoValidator = (value) =>
  value ? "" : "Inventory Number is required.";
export const inventoryDescriptionValidator = (value) =>
  value ? "" : "Inventory Description is required.";
export const recievedDateValidator = (value) =>
  value ? "" : "Received Date is required.";
export const manufacturerValidator = (value) =>
  value ? "" : "Manufacturer is required.";
export const supplierValidator = (value) =>
  value ? "" : "Vendor is required.";
export const countryNoValidator = (value) =>
  value ? "" : "Country Tab Number is required.";
export const costValidator = (value) => (value ? "" : "Cost is required.");
export const categoryValidator = (value) =>
  value ? "" : "category is required.";
export const modelNoValidator = (value) =>
  value ? "" : "Modal Number is required.";
export const poValidator = (value) => (value ? "" : "PO Number is required.");
export const serialNoValidator = (value) =>
  value ? "" : "Serial Number is required.";

const stringValidationRegex = /^[A-Za-z0-9 ]+$/;
const nameValidationRegex = /^[A-Za-z0-9_-]+$/;
const numberAndDotValidatorRegex = /^\d+(\.\d{1,4})?$/;

export const numberWithDotValidator = (value) => {
  return value === undefined || value === null || value === ""
    ? "Field Required."
    : numberAndDotValidatorRegex.test(String(value))
      ? false
      : "invalid Value.";
}

export const alphaNumericWithSpaceValidator = (value) =>
  !value
    ? false
    : stringValidationRegex.test(value)
      ? false
      : "Value Should be AlphaNumeric.";
export const nameWithSpaceANDUnderScoreValidator = (value) =>
  !value
    ? false
    : nameValidationRegex.test(value)
      ? false
      : "Value Should be AlphaNumeric and only includes '-' or '_'.";

export const alphaNumericWithSpaceValidatorRequired = (value) =>
  !value
    ? "Field Required."
    : stringValidationRegex.test(value)
      ? false
      : "Value Should be AlphaNumeric.";
export const nameWithSpaceANDUnderScoreValidatorRequired = (value) =>
  !value
    ? "Field Required."
    : nameValidationRegex.test(value)
      ? false
      : "Value Should be AlphaNumeric and only includes '-' or '_'.";

export const AssetValidator = (value) =>
  !value
    ? "Asset is required."
    : stringValidationRegex.test(value)
      ? false
      : "Asset Should be AlphaNumeric.";
const programCodeRegex = /^[A-Za-z0-9]{2}$/;
export const programCodeValidator1 = (value) =>
  !value
    ? "Program code is required."
    : programCodeRegex.test(value)
      ? ""
      : "Program code should be 2 Digits.";
const departmentCodeRegex = /^[A-Za-z0-9]{2}$/;
export const departmentCodeValidator = (value) =>
  !value
    ? "Department code is required."
    : departmentCodeRegex.test(value)
      ? ""
      : "Department code should be 2 Digits.";
const accountCodeRegex = /^[A-Za-z0-9]{4}$/;
export const accountCodeValidator = (value) =>
  !value
    ? "Account code is required."
    : accountCodeRegex.test(value)
      ? ""
      : "Account code should be 4 Digits.";
const subAccountCodeRegex = /^[A-Za-z0-9]{4}$/;
export const subAccountCodeValidator = (value) =>
  !value
    ? "Sub Account code is required."
    : subAccountCodeRegex.test(value)
      ? ""
      : "Sub Account code should be 4 Digits.";

export const numbersOnlyValidator = (value) =>
  onlyNumbersRegex.test(value)
    ? Number(value) >= 1000
      ? "Enter value under 1000"
      : ""
    : !value
      ? "Required"
      : "It must contain only numbers";

export const numbersOnlyValidatorNotRequired = (value) =>
  !value
    ? ""
    : onlyNumbersRegex.test(value)
      ? Number(value) >= 1000
        ? "Enter value under 1000"
        : ""
      : "It must contain only numbers";

export const numbersWithDecimalValidator = (value) =>
  !value
    ? ""
    : onlyNumWithDecimalAllowedReg.test(value)
      ? parseFloat(value) >= parseFloat(1000)
        ? "Enter value under 1000"
        : ""
      : "It must contain only numbers";

export const lessThanThreeSymbols = (value) =>
  value.length < 3 ? "" : "Number of symbols must be less than 3";

export const ssnValidator = (value) =>
  !onlyNumbersRegex.test(value)
    ? "Only numbers is required"
    : value.length == 9
      ? ""
      : "Required 9 digits";
export const genderValidator = (value) => (value ? "" : "Gender is required.");

export const ssnValidatorNotRequired = (value) =>
  value &&
  (!onlyNumbersRegex.test(value)
    ? "Only numbers is required"
    : value.length == 9
      ? ""
      : "Required 9 digits");

export const vendorNameValidator = (value) =>
  value ? "" : "Vendor Name is required.";
export const vendorTypeValidator = (value) =>
  value ? "" : "Select Vendor Type is required.";
export const vendorNumberValidator = (value) =>
  value ? "" : "Vendor Number is required.";
export const vendorAddressValidator = (value) =>
  value ? "" : "Vendor Address is required.";
export const vendorCityAddressValidator = (value) =>
  value ? "" : "City is required.";
export const vendorStateAddressValidator = (value) =>
  value ? "" : "State is required.";
export const vendorZipAddressValidator = (value) =>
  value ? "" : "Zip Code is required.";
export const vendorAccountNoValidator = (value) =>
  !value
    ? "Vendor Account Number is required."
    : onlyNumbersRegex.test(value)
      ? ""
      : "Vendor Account Number should be only Digits.";

export const vendorTaxIdValidator = (value) =>
  value ? "" : "Federal Tax ID is required.";
export const vendorPOCValidator = (value) => (value ? "" : "POC is required.");
export const vendorPhoneValidator = (value) =>
  value ? "" : "Phone Number is required.";
export const vendorFaxValidator = (value) =>
  value ? "" : "Fax Number is required.";

export const cacexpenseCodeValidator = (value) =>
  value ? "" : "County Expense Code is required.";

export const doctypeValidator = (value) =>
  value ? "" : "Document Type is required.";
export const docDescValidator = (value) =>
  value ? "" : "Document Description is required.";
export const docsValidator = (value) => (value ? "" : "Document is required.");
export const docnameValidator = (value) =>
  value ? "" : "Document Name is required.";

export const firstNameValidator = (value) =>
  value ? "" : "First Name is required.";
export const lastNameValidator = (value) =>
  value ? "" : "Last Name is required.";

export const payrollJobDescValidator = (value) =>
  value ? "" : "Job Description is required.";

export const takesEffectOn = (value) =>
  value ? "" : "Takes Effect On is required.";

export const voucherAmountValidator = (value) =>
  value && value > 0 ? "" : "Voucher Amount is required.";

export const organisationValidator = (value) =>
  value ? "" : "Organization Name is required.";
export const countyNameValidator = (value) =>
  value ? "" : "County Name is required.";
export const cotractNumberValidator = (value) =>
  value ? "" : "Contract number is required.";
export const organisationTypeValidator = (value) =>
  value ? "" : "Organization Type is required.";

export const SACPageValidator = (value) =>
  value ? "" : "Please select correct Page.";
export const SACRowValidator = (value) =>
  value ? "" : "Please select correct Row.";
export const SACColumnValidator = (value) =>
  value ? "" : "Please select correct Column.";

export const OnlyNumberStringValidator = (value) =>
  !value
    ? "Username is required."
    : onlyNumberAndCharacters.test(value)
      ? ""
      : "Username is not Valid.";

export const zipValidator = (value) => {
  if (!value) {
    return "Zip Code field is required."
  }
  if (!/^\d{5,10}$/.test(value)) {
    return "Zip Code must be between 5 and 10 digits."
  }
  return ""
}

export const contactNumberValidator = (value) => {
  if (!onlyNumbersRegex.test(value)) {
    return ""
  }
  if (!/^\d{1,15}$/.test(value)) {
    return "Contact Number max value 15."
  }
  return ""
}

export const taxExemptNumValidator = (value) => {
  if (!onlyNumbersRegex.test(value)) {
    return ""
  }
  if (!/^\d{1,15}$/.test(value)) {
    return "Tax Exempt No max value 15."
  }
  return ""
}
export const onlyCharactersAllowed = (value) =>
  value && (onlyCharAllowedReg.test(value) ? "" : "Only characters allowed");

export const onlyCharactersAllowedRequired = (value, field) => {
  return !value
    ? `${field || "Field"} is required.`
    : value &&
    (onlyCharAllowedReg.test(value) ? "" : "Only characters allowed");
};
//TImecard
export const employeeNameValidator = (value) =>
  value ? "" : "Employee name is required.";

export const empSalaryHourly = (value) => (value ? "" : "Please select value.");
export const noMonthsWorked = (value) =>
  value ? "" : "No. of months worked is required.";
export const groupNumberValidator = (value) =>
  !value
    ? "Group number is required."
    : onlyNumbersRegex.test(value)
      ? ""
      : "It must contain only numbers";
export const supervisorGroupNumberValidator = (value) =>
  !value
    ? "Supervisor group number is required."
    : onlyNumbersRegex.test(value)
      ? ""
      : "It must contain only numbers";
export const supervisorValidator = (value) =>
  value !== undefined ? "" : "Supervisor is required.";
export const PayrollSpecialistValidator = (value) =>
  value !== undefined ? "" : "Payroll Specialist is required.";
export const suppressTimecardValidator = (value) =>
  value !== undefined ? "" : "Suppress timecard is required.";
export const levelApprovalValidator = (value) =>
  value !== undefined ? "" : "2nd level approval is required.";
export const autoPopulatedScheduleValidator = (value) =>
  value !== undefined ? "" : "Auto Populated Schedule is required.";
export const trueHourValidator = (value) =>
  value !== undefined ? "" : "True hour is required.";
export const hasNonPaidValidator = (value) =>
  value !== undefined ? "" : "Has non-paid lunch is required.";
export const allottedHourValidator = (value) =>
  value !== undefined ? "" : "Allotted lunch hour is required.";
export const lunchHourValidator = (value) =>
  !value
    ? "Lunch hour is required."
    : onlyNumbersRegex.test(value)
      ? ""
      : "It must contain only numbers";
export const runPayrollValidator = (value) =>
  value !== undefined ? "" : "Run payroll from time card is required.";
export const approvedValidator = (value) =>
  value ? "" : "Approved is required.";

export const timeEntryDateValidator = (value) =>
  value ? "" : "Date is required.";
export const timeEntryStartTimeValidator = (value) =>
  value ? "" : "Start time is required.";
export const timeEntryEndTimeValidator = (value) =>
  value ? "" : "End time is required.";
export const timeEntryJobValidator = (value) =>
  value ? "" : "Job is required.";
export const mamoValidator = (value) =>
  value ? "" : "Memo is required.";
export const timeEntryLeaveTypeValidator = (value) =>
  value ? "" : "Leave type is required.";
export const timeEntryHourTypeValidator = (value) =>
  value ? "" : "Hour type is required.";

export const applyLeaveStartDateValidator = (value) =>
  value ? "" : "Start date is required.";
export const firstPayDayValidator = (value) =>
  value ? "" : "First Pay Day is required";
export const applyLeaveEndDateValidator = (value) =>
  value ? "" : "End date is required.";
export const applyLeaveTypeValidator = (value) =>
  value ? "" : "Leave type is required.";
export const applyLeaveReasonValidator = (value) =>
  value ? "" : "Leave reason is required.";

export const empApprovedValidator = (value) =>
  value !== undefined ? "" : "This field is required.";

export const rejectReasonValidator = (value) =>
  value ? "" : "Reject reason is required.";

export const scheduleNameForTimeValidator = (value) =>
  value ? "" : "Schedule name is required.";
export const scheduleTypeForTimeValidator = (value) =>
  value ? "" : "Schedule type is required.";

//Distribution
export const distributionNameForValidator = (value) =>
  value ? "" : "Distribution Name is required.";
export const sacForValidator = (value) => (value ? "" : "Sac is required.");
export const cacForValidator = (value) => (value ? "" : "Cac is required.");
export const IhacForValidator = (value) => (value ? "" : "Ihac is required.");

//Salary

export const salaryContracYearValidator = (value) =>
  value ? "" : "Contract year start is required.";
export const salaryContracEndYearValidator = (value) => {
  return value ? "" : "Contract year end is required.";
};
export const salaryStartDateValidator = (value) =>
  value ? "" : "Start date is required.";
export const salaryEndDateValidator = (value) =>
  value ? "" : "End date is required.";
export const salaryCurrentPositionDateValidator = (value) =>
  value ? "" : "Current Position Start date is required.";
export const salaryLongevityValidator = (value) =>
  value ? "" : "Longevity is required.";
export const salaryStepValidator = (value) =>
  value ? "" : "Step is required.";
export const salaryContractDaysValidator = (value) =>
  value ? "" : "Contract Days is required.";
export const salaryPaidHolidaysValidator = (value) =>
  value ? "" : "Paid Holidays is required.";
export const salaryHoursPerYearValidator = (value) =>
  value ? "" : "Hours Per Year is required.";
export const salaryHourlyRateValidator = (value) =>
  value ? "" : "Hourly Rate is required.";
export const salaryPersonalYearStartDateValidator = (value) =>
  value ? "" : "Personal Year Start Date is required.";
export const salaryPersonalYearEndDateValidator = (value) =>
  value ? "" : "Personal Year End Date is required.";
export const benefitPercentageValidator = (value) =>
  value ? "" : "Percentage Hour is required.";
export const benefitValidator = (value) =>
  value ? "" : "Benefit is required.";
export const benefitPackageValidator = (value) =>
  value ? "" : "Benefit Package is required.";
export const benefitNameValidator = (value) =>
  value ? "" : "Benefit Name is required.";
export const benefitPercentValidator = (value) =>
  value ? "" : "Benefit Percent is required.";
export const benefitAmountValidator = (value) =>
  value ? "" : "Benefit Amount is required.";
export const benefitPayPeriodValidator = (value) =>
  value ? "" : "Pay Period is required.";
export const benefitTypeValidator = (value) =>
  value ? "" : "Pay Period is required.";

export const hiredDateValidator = (value) =>
  value ? "" : "Date hired is required.";

export const fullTimeHireValidator = (value) =>
  value ? "" : "Full time hired is required.";

export const countyDateValidator = (value) =>
  value ? "" : "Anniversary Date hired is required.";

export const benefitsNameValidator = (value) =>
  value ? "" : "Benefit is required.";
export const newRateValidator = (value) =>
  value ? "" : "New rate is required.";

