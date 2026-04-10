using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("PAYROLL_DEFAULT_VACATION_RATES")]
    public class PayrollDefaultVacationrates : Common
    {
        [Column("ID")]
        public int ID { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("YEARS_WORKED_START")]
        public decimal? yearsWorkedStart { set; get; }
        [Column("YEARS_WORKED_END")]
        public decimal? yearsWorkedEnd { set; get; }
        [Column("VACATION_RATE", TypeName = "decimal(18,5)")]
        public decimal? vacationRate { set; get; }
        [Column("VACATION_LIMIT", TypeName = "decimal(18,5)")]
        public decimal? vacationLimit { set; get; }
        [Column("MAX_ACCRUAL")]
        public int? maxAccrual { set; get; }
        [Column("LUMPSUM")]
        public decimal? lumpsum { set; get; }

    }
}
