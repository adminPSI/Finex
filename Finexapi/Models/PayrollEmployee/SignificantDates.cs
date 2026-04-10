using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("PAYROLL_SIGNIFICANT_DATES")]
    public class SignificantDates : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("PAY_DIST_ID")]
        public int payDistId { get; set; }
        [Column("EMP_DATE_HIRED")]
        public DateTime? hiredDate { get; set; }
        [Column("FULLTIMEHIRE")]
        public DateTime? fullTimeHire { get; set; }
        [Column("EMP_DATE_LAST")]
        public DateTime? lastDate { get; set; }
        [Column("YEARS")]
        public string? years { get; set; }
        [Column("DAYS")]
        public string? days { get; set; }
        [Column("EMP_DATE_COUNTY")]
        public DateTime? countyDate { get; set; }
        [Column("YEARSDD")]
        public string? yearsDD { get; set; }
        [Column("DAYSDD")]
        public string? daysDD { get; set; }
        [Column("ANNIVERSARYDATEDD")]
        public DateTime? anniversaryDateDD { get; set; }
        [Column("EMP_STEP_DATE")]
        public DateTime? empStepDate { get; set; }
        [Column("REHIREDATE")]
        public DateTime? rehireDate { get; set; }
        [Column("EMP_DATE_CURRENT_POS")]
        public DateTime? empDateCurrentPos { get; set; }
        [Column("EVALDATE")]
        public DateTime? evalDate { get; set; }
        [Column("EVALNOTICESENTDAT")]
        public DateTime? evalNoticeSentDate { get; set; }
        [Column("EVALCOMPLETIONDATE")]
        public DateTime? evalCompletionDate { get; set; }
        [NotMapped]
        public int jobId { get; set; }
        [NotMapped]
        public bool? fullTime { get; set; }
    }
}
