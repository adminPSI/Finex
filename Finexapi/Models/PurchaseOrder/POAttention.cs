using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("COUNTY_POATTENTION")]
    public class POAttention
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("Attention")]
        public string? attention { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }
    }
}
