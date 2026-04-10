using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLL_TOTAL_DISTRIBUTION")]
    public class PayrollTotalDistribution
    {
        [Column("ID")]
        public int ID { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("EMP_ID")]
        public int? empId { get; set; }
        [Column("JOB_DESC_ID")]
        public int? jobDescriptionId { get; set; }
        [Column("PRD_LINE_NO")]
        public int? payDistId { get; set; }
        [Column("PRTD_GROSS")]
        public decimal? gross { get; set; }
        [Column("PRTD_IHAC")]
        public string? ihac { get; set; }
        [Column("PRTD_SAC")]
        public string? sac { get; set; }
        [Column("PRTD_CAC")]
        public int? cac { get; set; }
        [Column("PRTD_PAY_START")]
        public DateTime? payStart { get; set; }
        [Column("PRTD_DATE_PAID")]
        public DateTime? datePaid { get; set; }
        [Column("PRTD_REG_HOURS")]
        public decimal? regHours { get; set; }
        [Column("PRTD_OT_HOURS")]
        public decimal? otHours { get; set; }
        [Column("PRTD_HOLIDAY_HOURS")]
        public decimal? holidayHours { get; set; }
        [Column("PRTD_ID")]
        public int? prtdId { get; set; }
        [Column("PRNO")]
        public Int16? poNo { get; set; }
        [Column("POSTED")]
        public bool? posted { get; set; }
        [Column("YEARCLOSE")]
        public bool? yearClose { get; set; }
        [Column("PRTD_OT_AMOUNT")]
        public decimal? otAmount { get; set; }
        [Column("PAYID")]
        public int? payId { get; set; }
        [Column("POSTDATE")]
        public DateTime? postDate { get; set; }
        [Column("PAYROLLGROUP1")]
        public bool? payrollGroup1 { get; set; }
        [Column("TRANSCACID")]
        public int? trasCACId { get; set; }
        [Column("IHACADJUSTMENTS")]
        public decimal ihacAdjustment { get; set; }
        [NotMapped]
        public string? jobName { get; set; }
        [NotMapped]
        public string? accountingCode { get; set; }
        [NotMapped]
        public bool primaryJob { get; set; }
        [NotMapped]
        public int? empPayType { get; set; }
    }
}
