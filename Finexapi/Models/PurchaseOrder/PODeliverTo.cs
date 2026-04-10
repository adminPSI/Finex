using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("COUNTY_PODELIVERTO")]
    public class PODeliverTo
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("DeliverTo")]
        public string? deliverTo { get; set; }

        [Column("AddressLine1")]
        public string? addressLine1 { get; set; }

        [Column("AddressLine2")]
        public string? addressLine2 { get; set; }

        [Column("City")]
        public string? city { get; set; }

        [Column("State")]
        public string? state { get; set; }

        [Column("Zip")]
        public string? zip { get; set; }

        [Column("ACTIVE_IND")]
        public string? isActive { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

    }
}
