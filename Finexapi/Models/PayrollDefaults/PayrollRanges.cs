using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("PAYROLL_RANGES")]
    public class PayrollRanges : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("MIN")]
        public decimal min { set; get; }
        [Column("MAX")]
        public decimal max { set; get; }
        [Column("RANGE")]
        public string? range { set; get; }
        [Column("EXTENSION")]
        public decimal extension { set; get; }
    }
}
