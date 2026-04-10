using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("COUNTYPOPRICING")]
    public class CountyPOPricing : Common
    {
        //11/28/2023
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Column("POID")]
        public int? poId { get; set; }

        [Column("POAMOUNT")]
        public decimal? poAmount { get; set; }

        [Column("POBALANCE")]
        public decimal? poBalance { get; set; }

        [Column("POQUANTITY")]
        public string? poQuantity { get; set; }

        [Column("PODISCOUNT")]
        public decimal? poDiscount { get; set; }

        [Column("DOUBLEENCUMERANCE")]
        public decimal? doubleEncumerance { get; set; }

        [Column("CLOSINGBALANCE")]
        public decimal? closingBalance { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

        [ForeignKey("poId")]
        public CountyPO? CountyPO { get; set; }
    }
}
