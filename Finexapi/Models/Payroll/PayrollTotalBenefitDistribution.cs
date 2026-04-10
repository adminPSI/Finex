using FinexAPI.Models.PayrollDefaults;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLL_TOTAL_BENEFIT_DISTRIBUTION")]
    public class PayrollTotalBenefitDistribution : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("EMP_ID")]
        public int? empId { get; set; }
        [Column("BENEFIT_ID")]
        public int benefitId { get; set; }
        [Column("PRD_LINE_NO")]
        public int? payDistId { get; set; }
        [Column("PRTBD_AMOUNT")]
        public decimal? prtbdAmount { get; set; }
        [Column("PRTBD_IHAC")]
        public string? prtbdIHAC { get; set; }
        [Column("PRTBD_SAC")]
        public string? prtbdSAC { get; set; }
        [Column("PRTBD_CAC")]
        public int? prtbdCAC { get; set; }
        [Column("PRTBD_PAY_START")]
        public DateTime? payStart { get; set; }
        [Column("PRTBD_DATE_PAID")]
        public DateTime? datePaid { get; set; }
        [Column("POSTED")]
        public bool? posted { get; set; }
        [Column("POST_DATE")]
        public DateTime? postDate { get; set; }
        [Column("PRTBD_ID")]
        public int? prtbdId { get; set; }
        [Column("PRNO")]
        public Int16? prNo { get; set; }
        [Column("PRTBD_JOBID")]
        public int? jobInfoId { get; set; }
        [Column("BENEFIT TYPE")]
        public int? benefitType { get; set; }
        [Column("YEARCLOSE")]
        public bool? yearClose { get; set; }
        [Column("MANUALADJUSTMENT")]
        public bool? manualAdjustment { get; set; }
        [Column("PAYROLLGROUP1")]
        public bool? payrollGroup1 { get; set; }
        [Column("SPECIALBENEFITRUN")]
        public bool? specialBenefitRun { get; set; }
        [Column("TRANSCACID")]
        public int? trasCACId { get; set; }
        [Column("MEMO")]
        public string? memo { get; set; }
        [NotMapped]
        public string? benefitName { get; set; }
        [NotMapped]
        public string? accountingCode { get; set; }
        [NotMapped]
        public string? firstName { get; set; }
        [NotMapped]
        public string? lastName { get; set; }
    }
}
