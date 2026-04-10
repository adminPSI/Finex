using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("PAYROLL_SIGNIFICANT_RATES")]
    public class SignificantRates : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("PAY_DIST_ID")]
        public int payDistId { get; set; }
        [Column("HOURS_WORKED",TypeName ="decimal(18,4)")]
        public decimal? hoursWorked { get; set; }
        [Column("HOURS_PAID", TypeName = "decimal(18,4)")]
        public decimal? hoursPaid { get; set; }
        [Column("HOURS_PER_DAY", TypeName = "decimal(18,4)")]
        public decimal hoursPerDay { get; set; }
        [Column("OVERTIME_RATE", TypeName = "decimal(18,4)")]
        public decimal? overTimeRate { get; set; }
        [Column("HOLIDAY_RATE", TypeName = "decimal(18,4)")]
        public decimal? holidayRate { get; set; }
        [Column("VACATION_RATE", TypeName = "decimal(18,4)")]
        public decimal? vacationRate { get; set; }
        [Column("VACATION_LIMIT", TypeName = "decimal(18,4)")]
        public decimal? vacationLimit { get; set; }
        [Column("SICK_RATE", TypeName = "decimal(18,4)")]
        public decimal? sickRate { get; set; }
        [Column("SICK_LIMIT", TypeName = "decimal(18,4)")]
        public decimal? sickLimit { get; set; }
        [Column("PERSONAL_RATE", TypeName = "decimal(18,4)")]
        public decimal? personalRate { get; set; }
        [Column("PERSONAL_LIMIT", TypeName = "decimal(18,4)")]
        public decimal? personalLimit { get; set; }
        [Column("VACATION_YEARS", TypeName = "decimal(18,4)")]
        public decimal? vacationYears { get; set; }
        [Column("MAX_VACATION", TypeName = "decimal(18,4)")]
        public decimal? maxVacation { get; set; }
        [Column("LOW_RATE", TypeName = "decimal(18,4)")]
        public decimal? lowRate { get; set; }
        [NotMapped]
        public int jobId { get; set; }
    }
}
