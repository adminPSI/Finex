using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("CountyPOLineItem")]
    public class CountyPOLineItem : Common
    {
        [Key]
        [Column("ID")]
        public int cId { get; set; }

        [Column("COUNTYPOID")]
        public int? countyPOId { get; set; }

        [Column("POQUANTITY")]
        public string? poQuantity { get; set; }

        [Column("POLINENUMBER")]
        public string? poLineNumber { get; set; }

        [Column("PODESCRIPTION")]
        public string? poDescription { get; set; }

        [Column("POPRICE")]
        public decimal poPrice { get; set; }
        [Column("POAMOUNT")]
        public decimal poAmount { get; set; }

        [Column("PODISCOUNT")]
        public decimal poDiscount { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }

        [ForeignKey("countyPOId")]
        public CountyPO? CountyPO { get; set; }
    }
}
