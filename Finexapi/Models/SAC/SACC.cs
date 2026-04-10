using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.SAC
{
    [Table("SACC")]
    public class SACC
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("StateAccountDesc")]
        public string? stateAccountDesc { get; set; }

        [Column("StateAccountCode")]
        public string? stateAccountCode { get; set; }

        [Column("PageId")]
        public int pageId { get; set; }
        [Column("OrgId")]
        public int OrgId { get; set; }

    }
}
