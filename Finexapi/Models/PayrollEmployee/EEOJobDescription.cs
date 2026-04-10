using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("EEO_JOB_DESCRIPTION")]
    public class EEOJobDescription : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("EEO_JOB_DESCRIPTION")]
        public string? eeoJobDescription { set; get; }
        [Column("ACTIVE_IND")]
        public string? activeInd { set; get; }
    }
}
