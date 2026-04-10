using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.SAC
{
    [Table("SACP")]
    public class SACP
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }
        [Column("StateAccountCode")]
        public string stateAccountCode { get; set; }
        [Column("StateAccountDesc")]
        public string stateAccountDesc { get; set; }
        [Column("OrgId")]
        public int OrgId { get; set; }
    }
}
