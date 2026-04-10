using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("PAYROLL_BEN_IHAC_DISTRIBUTION_TABLE")]
    public class BenefitIHACDistribution : Common
    {
        [Column("ID")]
        public int ID { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("PRD_LINE_NO")]
        public int? payDistId { get; set; }
        [Column("BENEFIT_NO")]
        public int? benefitNo { get; set; }
        [Column("IHAC")]
        public string? IHAC { get; set; }
        [Column("BENID")]
        public int benId { get; set; }
        [Column("CACID")]
        public int? cacId { get; set; }
        [Column("TRANSCACID")]
        public int? trasnsacId { get; set; }
        [ForeignKey("benId")]
        public EmployeePayrollBenefit? EmployeePayrollBenefit { get; set; }
    }
}
