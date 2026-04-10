using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("COUNTY_POLIQUIDATE")]
    public class POLiquidate
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("CountyPOId")]
        public int? countyPOId { get; set; }

        [Column("Date")]
        public DateTime date { get; set; }

        [Column("Amount")]
        public decimal amount { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

        [ForeignKey("countyPOId")]
        public CountyPO? CountyPO { get; set; }
    }
}
