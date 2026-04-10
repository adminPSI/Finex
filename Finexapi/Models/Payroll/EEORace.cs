using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("EEO_RACE")]
    public class EEORace : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORG_ID { get; set; }
        [Column("RACE")]
        public string Race { get; set; }
        [Column("ACTIVE_IND")]
        public bool Inactive { get; set; }
    }
}
