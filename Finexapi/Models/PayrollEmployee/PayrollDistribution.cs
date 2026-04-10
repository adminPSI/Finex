using FinexAPI.Models.Payroll;
using System.ComponentModel.DataAnnotations.Schema;
namespace FinexAPI.Models.PayrollEmployee
{
    [Table("PAYROLL_DISTRIBUTION")]
    public class PayrollDistribution : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        /*        [Column("EMPLOYEE_ID")]
                public int employeeId { set; get; }*/
        [Column("CAC")]
        public int? cac { set; get; }
        [Column("IHAC")]
        public string? ihac { set; get; }
        [Column("SAC")]
        public string? sac { set; get; }
        [Column("EMP_ID")]
        public int? empID { set; get; }
        [Column("JOB_DESCRIPTION_ID")]
        public int? jobDescriptionID { set; get; }
        [Column("PERCENTAGE")]
        public decimal? percentage { set; get; }
        [Column("LINE_RATE")]
        public decimal? lineRate { set; get; }
        [Column("DEFAULT_JOB")]
        public bool defaultJob { set; get; }
        [Column("ACTIVE_JOB")]
        public bool activeJob { set; get; }
        [Column("DEPT")]
        public string? dept { set; get; }
        [Column("BEN_SAC")]
        public int? benSac { set; get; }
        [Column("BEN_IHAC")]
        public string? benIhac { set; get; }
        [Column("JOB_CLASS")]
        public string? jobClass { set; get; }
        [Column("VACA")]
        public bool vaca { set; get; }
        [Column("SICK")]
        public bool sick { set; get; }
        [Column("NO_BENEFITS")]
        public bool noBenefits { set; get; }
        [Column("TRANSCAC_ID")]
        public int? transcacId { set; get; }
        [Column("DELETED")]
        public bool deleted { set; get; }
        [Column("NOT_USED_IN_REGHOURS")]
        public bool notUsedInRegHours { set; get; }
        [Column("VACA_PAYOUT")]
        public bool vacaPayout { set; get; }
        [Column("SICK_PAYOUT")]
        public bool sickPayout { set; get; }
        [Column("VACA_START_DATE")]
        public DateTime? vacaStartDate { set; get; }
        [Column("START_DATE")]
        public DateTime? startDate { set; get; }
        [Column("END_DATE")]
        public DateTime? endDate { set; get; }
        [Column("DONOT_SHOW_TOUCHSCREEN_CLOCK")]
        public bool touchScreenClock { set; get; }
        [Column("FLAT_RATE_NO_HOURS")]
        public bool flatRateNoHours { set; get; }
        [Column("DONOT_SHOW_ON_PAY_REPORT")]
        public bool showOnPayReport { set; get; }
        [Column("COST_CENTER")]
        public string? costCenter { set; get; }
        [Column("SECONDARY_VACA_START_DATE")]
        public DateTime? secondaryVacaStartDate { set; get; }
        [Column("SHIFT_DIFF_START")]
        public string? shiftDiffStart { set; get; }
        [Column("SHIFT_DIFF_END")]
        public string? shiftDiffEnd { set; get; }
        [Column("SUPERVISORID")]
        public int? supervisorID { set; get; }
        [Column("DISTRIBUTION_NAME")]
        public string? distributionName { set; get; }
        [NotMapped]
        public string? jobName { set; get; }
        [NotMapped]
        public PayrollTotals? PayrollTotals { set; get; }
        [NotMapped]
        public string? AccountingCode { set; get; }
        [NotMapped]
        public bool primaryJob { get; set; }
    }
}
