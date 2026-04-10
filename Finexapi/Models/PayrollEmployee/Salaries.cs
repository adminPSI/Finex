using FinexAPI.Models.PayrollDefaults;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("PAYROLLSALARIES")]
    public class Salaries : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("EMP_ID")]
        public int? empId { set; get; }
        [Column("JOB_DESCRIPTION_ID")]
        public int? jobDescId { set; get; }
        //[Column("PAY_DIST_ID")]
        //public int? payDistId { set; get; }
        [Column("START_DATE")]
        public DateTime? startDate { set; get; }
        [Column("END_DATE")]
        public DateTime? endDate { set; get; }
        [Column("SALARY", TypeName = "decimal(18,4)")]
        public decimal? salary { set; get; }
        [Column("PAY_DAY_SALARY", TypeName = "decimal(18,4)")]
        public decimal? payDaySalary { set; get; }
        [Column("HOURLY_RATE", TypeName = "decimal(18,4)")]
        public decimal? hourlyRate { set; get; }
        [Column("LONGEVITY")]
        public string? longevity { set; get; }
        [Column("STEP")]
        public string? step { set; get; }
        [Column("CONTRACT_DAYS")]
        public int? contractDays { set; get; }
        [Column("PAID_HOLIDAYS")]
        public int? paidHolidays { set; get; }
        [Column("HOURS_PER_YEAR", TypeName = "decimal(18,4)")]
        public decimal? hoursPerYear { set; get; }
        [Column("CURRENT_POS_START_DATE")]
        public DateTime? currentPosStartDate { set; get; }
        [Column("HOURS_WORKED", TypeName = "decimal(18,4)")]
        public decimal? hoursWorked { set; get; }
        [Column("MEMO")]
        public string? memo { set; get; }
        [Column("HOURS_PAID", TypeName = "decimal(18,4)")]
        public decimal? hoursPaid { set; get; }
        [Column("HOURS_PER_Day", TypeName = "decimal(18,4)")]
        public decimal? hoursPerDay { set; get; }
        [Column("OVER_TIME_RATE", TypeName = "decimal(18,4)")]
        public decimal? overTimeRate { set; get; }
        [Column("HOLIDAY_RATE", TypeName = "decimal(18,4)")]
        public decimal? holidayRate { set; get; }
        [Column("VACATION_RATE", TypeName = "decimal(18,4)")]
        public decimal? vacationRate { set; get; }
        [Column("VACATION_LIMIT", TypeName = "decimal(18,4)")]
        public decimal? vacationLimit { set; get; }
        [Column("SICK_RATE", TypeName = "decimal(18,4)")]
        public decimal? sickRate { set; get; }
        [Column("SICK_LIMIT", TypeName = "decimal(18,4)")]
        public decimal? sickLimit { set; get; }
        [Column("PERSONAL_RATE", TypeName = "decimal(18,4)")]
        public decimal? personalRate { set; get; }
        [Column("PERSONAL_LIMIT", TypeName = "decimal(18,4)")]
        public decimal? personalLimit { set; get; }
        [Column("VACATION_YEARS", TypeName = "decimal(18,4)")]
        public decimal? vacationYears { set; get; }
        [Column("MAX_VACATION", TypeName = "decimal(18,4)")]
        public decimal? maxVacation { set; get; }
        [Column("LOW_RATE", TypeName = "decimal(18,4)")]
        public decimal? lowRate { set; get; }
        [Column("PERSONAL_YEAR_START_DATE")]
        public DateTime? personalYearStartDate { set; get; }
        [Column("PERSONAL_YEAR_END_DATE")]
        public DateTime? personalYearEndDate { set; get; }
        [Column("BASE_RATE", TypeName = "decimal(18,4)")]
        public decimal? baseRate { set; get; }
        [Column("PAY_RATE_ID")]
        public int? payRateId { set; get; }
        [Column("NON_STANDARD_PER_YEAR")]
        public bool nonStandardPerYear { set; get; } = false;
        [Column("PAYROLL_RANGE_ID")]
        public int? payrollRangeId { set; get; }
        //[NotMapped]
        //public int jobId { set; get; }

        public PayrollJobDescription? JobDescription { set; get; }
    }

    public class AddSalaryToJob
    {
        public int Id { set; get; }
        public DateTime? startDate { set; get; }
        public decimal? payDaySalary { set; get; }
        public decimal? hourlyRate { set; get; }
    }
}
