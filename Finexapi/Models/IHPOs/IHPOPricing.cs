using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.IHPOs
{
    [Table("IHPOPRICING")]
    public class IHPOPricing : Common
    {

        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("REQID")]
        public int? reqID { get; set; }

        [Column("REQTOTAL")]
        public decimal? reqTotal { get; set; }
        [Column("REQQUANTITY")]
        public string? reqQuantity { get; set; }
        [Column("REQDISCOUNT")]
        public decimal? reqDiscount { get; set; }
        [Column("REQTOTALPRICE")]
        public decimal? reqTotalPrice { get; set; }

        [Column("REQUNITPRICE")]
        public decimal? reqUnitPrice { get; set; }

        [Column("REQBALANCE")]
        public decimal? reqBalance { get; set; }

        [ForeignKey("reqID")]
        public IHPO? IHPO { get; set; }
    }
}
