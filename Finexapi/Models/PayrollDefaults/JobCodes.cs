using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("JOB_CODES")]
    public class JobCodes : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("JOB_CODE")]
        public string? jobCode { set; get; }
        [Column("JOB_DESCRIPTION_ID")]
        public int jobId { set; get; }
        public PayrollJobDescription? PayrollJobDescription { set; get; }
    }
}
