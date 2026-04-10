using System.ComponentModel.DataAnnotations.Schema;
namespace FinexAPI.Models.PayrollDefaults
{
    [Table("PAYROLL_DEFAULT_VALUES")]
    public class PayrollDefaultValues : Common
    {
        [Column("DEFAULT_ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("DEFAULT_OT_RATE", TypeName = "decimal(18,4)")]
        public decimal? defaultOtRates { set; get; }
        [Column("DEFAULT_HOLIDAY_RATE", TypeName = "decimal(18,4)")]
        public decimal? defaultHolidsayRate { set; get; }
        [Column("DEFAULT_VACATION_RATE", TypeName = "decimal(18,4)")]
        public decimal? defaultVacationRate { set; get; }
        [Column("DEFAULT_VACATION_LIMIT", TypeName = "decimal(18,4)")]
        public decimal? defaultVacationLimit { set; get; }
        [Column("DEFAULT_SICK_RATE",TypeName = "decimal(18,4)")]
        public decimal? defaultSickRate { set; get; }
        [Column("DEFAULT_SICK_LIMIT", TypeName = "decimal(18,4)")]
        public decimal? defaultSickLimit { set; get; }
        [Column("DEFAULT_PERSONAL", TypeName = "decimal(18,4)")]
        public decimal? defaultPersonal { set; get; }
        [Column("DEFAULT_CHECK")]
        public bool defaultCheck { set; get; }
        [Column("OVER_TIME")]
        public bool overTime { set; get; }
        [Column("PAYROLL_START_DATE")]
        public DateTime? payrollStartDate { set; get; }
        [Column("FIRST_PAY_DAY")]
        public DateTime? firstPayDay { set; get; }
        [Column("VACA_ROUNDING")]
        public Int16? vacaRounding { set; get; }
        [Column("DATE_DIFF_START_PAY")]
        public Int16? dateDiffStartPay { set; get; }
        [Column("1STAND3RD")]
        public bool firstand3rd { set; get; }
        [Column("ROUND_HOURLY")]
        public Int16? roundHourly { set; get; }
        [Column("ROUND_BI_WEEKLY")]
        public Int16? roundBiWeekly { set; get; }
        [Column("FIRST_PAY")]
        public bool firstPay { set; get; }
        [Column("SECOND_PAY")]
        public bool secondPay { set; get; }
        [Column("LAST_PAY")]
        public bool lastPay { set; get; }
        [Column("MIN_HRS", TypeName = "decimal(18,4)")]
        public decimal? minHrs { set; get; }
        [Column("PER_FISCAL_YEAR")]
        public bool perFiscalYear { set; get; }

        [Column("PER_START")]
        public DateTime? perStart { set; get; }
        [Column("PER_END")]
        public DateTime? perEnd { set; get; }
        [Column("ANN_DAYS")]
        public string? annDays { set; get; }
        [Column("STEP_DAYS")]
        public string? stepDays { set; get; }
        [Column("CERT_DAYS")]
        public string? certDays { set; get; }
        [Column("2NDAND3RD")]
        public bool secondand3rd { set; get; }
        [Column("COMPEARNEDAT15")]
        public bool compearnedat15 { set; get; }
        [Column("1STAND2ND")]
        public bool firstand2nd { set; get; }
        [Column("HOLIDAY_SCHEDULE1_NAME")]
        public string? holidaySchedule1Name { set; get; }
        [Column("HOLIDAY_SCHEDULE2_NAME")]
        public string? holidaySchedule2Name { set; get; }
        [Column("VACA_SICK_LIMIT_BY_RATE")]
        public bool vacaSickLimitByRate { set; get; }
        [Column("COMPTIMEEARNEDRATE", TypeName = "decimal(18,4)")]
        public decimal? compTimeEarnedRate { set; get; }
        [Column("DUTY_FREE_LUNCH")]
        public bool dutyFreeLunch { set; get; }
        [Column("LUNCH_MINUTES")]
        public string? lunchMinutes { set; get; }
        [Column("MIN_PERSONAL_TIME", TypeName = "decimal(18,4)")]
        public decimal? minPersonalTime { set; get; }
        [Column("MIN_VACA_TIME", TypeName = "decimal(18,4)")]
        public decimal? minVacaTime { set; get; }
        [Column("MIN_SICK_TIME", TypeName = "decimal(18,4)")]
        public decimal? minSickTime { set; get; }
        [Column("NUM_YEARS_MAX_VACACCURAL")]
        public int? numYearsMaxVacaccural { set; get; }
        [Column("MIN_COMPTIME", TypeName = "decimal(18,4)")]
        public decimal? minCompTime { set; get; }

    }
}
