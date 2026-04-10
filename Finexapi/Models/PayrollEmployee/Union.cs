using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("PAYROLLUNION")]
    public class Union : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("DESCRIPTION")]
        public string? description { set; get; }
        [Column("ACTIVE_IND")]
        public string? activeInd { set; get; }
    }
}
