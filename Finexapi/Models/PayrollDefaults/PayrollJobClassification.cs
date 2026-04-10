using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("PAYROLL_JOB_CLASSIFICATION")]
    public class PayrollJobClassification : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("JOB_CLASSIFICATION")]
        public string? jobClassification { set; get; }
        [Column("INACTIVE")]
        public bool inactive { set; get; }
    }
}
