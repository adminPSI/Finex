using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLLUNION")]
    public class Union : Common
    {

        [Column("ID")]
        public int ID { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORG_ID { get; set; }
        [Column("DESCRIPTION")]
        public string Description { get; set; }
        [Column("ACTIVE_IND")]
        public string Inactive { get; set; }
    }
}
