using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.SAC
{
    [Table("SACR")]
    public class SACR
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }
        [Column("StateAccountCode")]
        public string stateAccountCode { get; set; }

        [Column("StateAccountDesc")]
        public string stateAccountDesc { get; set; }

        [Column("PageId")]
        public int pageId { get; set; }

        [Column("OrgId")]
        public int OrgId { get; set; }
    }
}
