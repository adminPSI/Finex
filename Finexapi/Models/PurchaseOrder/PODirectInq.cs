using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("PODirectInq")]
    public class PODirectInq
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("DirectInq")]
        public string directInq { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }
    }
}
