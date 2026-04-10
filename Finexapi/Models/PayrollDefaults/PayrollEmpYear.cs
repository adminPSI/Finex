using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Contracts;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("PAYROLL_EMP_YEAR")]
    public class PayrollEmpYear : Common
    {
        [Column("EMP_YR_ID")]
        public int Id { set; get; }
        [Column("EMP_YR_START")]
        public DateTime? empYrStart { set; get; }
        [Column("EMP_YR_STOP")]
        public DateTime? empYrEnd { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("MONTHS")]
        public int? months { get; set; }
    }
}
