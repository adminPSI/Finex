using FinexAPI.Models.PayrollDefaults;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("EMPLOYEE_PAYROLL_BENEFITS")]
    public class EmployeePayrollBenefit : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        /*[Column("EMP_ID")]
        public int empId { set; get; }*/
        [Column("BENEFIT_ID")]
        public int benefitId { set; get; }
        [Column("BENEFIT_RATE")]
        public decimal? benefitRate { set; get; }
        [Column("CAC")]
        public int? Cac { set; get; }
        [Column("BENEFIT_AMOUNT")]
        public decimal? benefitAmount { set; get; }
        /* [Column("JOB_ID")]
         public int jobId { set; get; }*/
        [Column("SAC")]
        public string? sac { set; get; }
        [Column("START_DATE")]
        public DateTime? startDate { set; get; }
        [Column("END_DATE")]
        public DateTime? endDAte { set; get; }
        [Column("MEMO")]
        public string? memo { set; get; }
        [Column("EMP_ID")]
        public int? empID { set; get; }
        [Column("JOB_DESCRIPTION_ID")]
        public int jobDescriptionID { set; get; }
        [Column("BENEFIT_NO")]
        public int? benefitNo { set; get; }
        [NotMapped]
        public Benefits? benefit { set; get; }
        [NotMapped]
        public int? benefitPachakeId { set; get; }
        [NotMapped]
        public string? accountingCode { set; get; }
        public BenefitIHACDistribution? benefitIHACDistribution { set; get; }
    }
}
