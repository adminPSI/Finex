using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLL_TOTALS")]
    public class PayrollTotals : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("EMP_ID")]
        public int empId { set; get; }
        [Column("PR_REG_HOURS")]
        public decimal prRegHours { set; get; }
        [Column("PR_OT_HOURS")]
        public decimal prOtHours { set; get; }
        [Column("PR_BEN_HOURS")]
        public decimal prBenHours { set; get; }
        [Column("PR_HOLIDAY_HOURS")]
        public decimal prHolidayHours { set; get; }
        [Column("PR_TOTAL_HOURS")]
        public decimal prTotalHours { set; get; }
        [Column("PR_SALARY")]
        public decimal prSalary { set; get; }
        [Column("PR_HOURLY_RATE")]
        public decimal prHourlyRate { set; get; }
        [Column("PR_OT_RATE")]
        public decimal prOtRate { set; get; }
        [Column("PR_HOLIDAY_RATE")]
        public decimal prHolidayRate { set; get; }
        [Column("PR_VACA_USED")]
        public decimal prVacaUsed { set; get; }
        [Column("PR_SICK_USED")]
        public decimal prSickUsed { set; get; }
        [Column("PR_PERSONAL_USED")]
        public decimal prPersonalUsed { set; get; }
        [Column("PR_PRODAY_USED")]
        public decimal prProdayUsed { set; get; }
        [Column("PR_UNEXCUSED")]
        public decimal prUnexcused { set; get; }
        [Column("PR_OTHER")]
        public decimal prOther { set; get; }
        [Column("PR_START_DATE")]
        public DateTime? prStartDate { set; get; }
        [Column("PR_END_DATE")]
        public DateTime? prEndDate { set; get; }
        [Column("PR_DATE_PAID")]
        public DateTime? prDatePaid { set; get; }

        //above working

        [Column("PR_EMPLOYEE_NO")]
        public string? prEmployeeNo { set; get; }
        [Column("PR_VACA_EARNED")]
        public decimal prVacaEarned { set; get; }
        [Column("PR_SICKTIME_EARNED")]
        public decimal prSickTimeEarned { set; get; }
        [Column("PR_PERSONAL_EARNED")]
        public decimal prPersonalEarned { set; get; }
        [Column("PR_GROSS")]
        public decimal prGross { set; get; }
        [Column("PR_VACA_RATE")]
        public decimal prVacaRate { set; get; }
        [Column("PR_SICK_RATE")]
        public decimal prSickRate { set; get; }
        [Column("PR_PERSONAL_RATE")]
        public decimal prPersonalRate { set; get; }
        [Column("PR_S/T_HOURS")]
        public decimal prSTHours { set; get; }
        [Column("PR_NONS/T_HOURS")]
        public decimal prNonSTHours { set; get; }
        [Column("PR_REG_AMOUNT")]
        public decimal prRegAmount { set; get; }
        [Column("PR_OT_AMOUNT")]
        public decimal prOTAmount { set; get; }
        [Column("PR_HOLIDAY_AMOUNT")]
        public decimal prHolidayAmount { set; get; }
        [Column("PR_ADJUSTMENT")]
        public decimal pradjustment { set; get; }
        [Column("PR_S/T_HOURS_AMOUNT")]
        public decimal prSTHoursAmount { set; get; }
        [Column("PR_NONS/T_HOURS_AMOUNT")]
        public decimal prNonSTHoursAmount { set; get; }
        [Column("ADJUSTMENT_HOURS")]
        public decimal adjustmentHours { set; get; }
        [Column("JOB_DESC_ID")]
        public int? jobDescriptionId { set; get; }
        [Column("ONCE_PER_MONTH")]
        public bool oncePerMonth { set; get; }
        [Column("PR_CAC")]
        public int prCAC { set; get; }
        [Column("TWICE_PER_MONTH")]
        public bool twicePerMonth { set; get; }
        [Column("FLA")]
        public decimal FLA { set; get; }
        [Column("WORKED1")]
        public bool worked1 { set; get; }
        [Column("WORKED2")]
        public bool worked2 { set; get; }
        [Column("POSTED")]
        public bool posted { set; get; }
        [Column("YEARCLOSE")]
        public bool yearClose { set; get; }
        [Column("PAYOUT")]
        public decimal payOut { set; get; }
        [Column("VACAADD")]
        public decimal vacaAdd { set; get; }
        [Column("SICKADD")]
        public decimal sickAdd { set; get; }
        [Column("PAYMEMO")]
        public string? payMemo { set; get; }
        [Column("PERSONADD")]
        public decimal personAdd { set; get; }
        [Column("LEAVEWITHOUTPAYAMOUNT")]
        public decimal leaveWithoutPayAmount { set; get; }
        [Column("HOLIDAYPAID")]
        public decimal holidayPaid { set; get; }
        [Column("WHICHPAY")]
        public int whichPay { set; get; }
        [Column("POSTDATE")]
        public DateTime? postDate { set; get; }
        [Column("PAYROLLGROUP1")]
        public bool payrollGroup1 { set; get; }
        [Column("BREAKTIME")]
        public decimal breakTime { set; get; }
        [Column("REBATEADJUST")]
        public decimal rebateadjust { set; get; }
        [Column("CUSTOMPAY")]
        public bool customPay { set; get; }
        [Column("VACAPAYOUT")]
        public bool vacaPayOut { set; get; }
        [Column("SICKPAYOUT")]
        public bool sickPayOut { set; get; }
        [Column("HOLIDAYOT")]
        public decimal holidayOT { set; get; }
        [Column("HOLIDAYOTAMOUNT")]
        public decimal holidayotamount { set; get; }
        [Column("SICKTIMEPAYOUT")]
        public decimal sickTimePayOut { set; get; }
        [Column("BONUSPAYROLL")]
        public bool bonusPayroll { set; get; }
        [Column("NONPAIDBREAK")]
        public decimal nonPaidBreak { set; get; }
        [Column("ADDITIONALADJUSTMENT")]
        public decimal additionalAdjustment { set; get; }
        [Column("TAXABLEFRINGE")]
        public decimal taxableFringe { set; get; }
        [Column("UNIONID")]
        public int unionID { set; get; }
        [Column("GROUPNO")]
        public string? groupNo { set; get; }
        [Column("ADJUSTMENTTYPEID")]
        public int adjustmentTypeId { set; get; }
        [Column("VACABO")]
        public decimal vacaBO { set; get; }
        [Column("SICKBO")]
        public decimal sickBo { set; get; }
        [Column("PERSONALBO")]
        public decimal personalBo { set; get; }
        [Column("DEPTID")]
        public int deptId { set; get; }
        [Column("APPROVALID")]
        public int approvalId { set; get; }
        [Column("APPROVALTIMESTAMP")]
        public DateTime? approvalDateTime { set; get; }
        [Column("CALIMITY")]
        public decimal calimity { set; get; }
        [Column("OTHER_USED")]
        public decimal otherUsed { set; get; }
        [Column("FEDPAIDSICKUSED")]
        public decimal fedPaidSickUsed { set; get; }
        [Column("EMERGENCYFMLAUSED")]
        public decimal emergencyFmlaUsed { set; get; }
        //[Column("PAY_DIST_ID")]
        //public int? payDistId { set; get; }
        [NotMapped]
        public Employee? employee { set; get; }
        [NotMapped]
        public string? jobName { set; get; }
        [NotMapped]
        public List<PayrollTotalDistribution>? payrollTotalDistributions { set; get; }
    }
}
