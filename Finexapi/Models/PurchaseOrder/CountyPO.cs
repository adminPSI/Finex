using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("COUNTYPO")]
    public class CountyPO : Common
    {
        //11/28/2023
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Column("PONUMBER")]
        public string poNumber { get; set; }

        [Column("POAMOUNT")]
        public decimal poAmount { get; set; }

        [Column("POOPENDATE")]
        public DateTime poOpenDate { get; set; }

        [Column("POCOMPLETEDATE")]
        public DateTime? poCompleteDate { get; set; }

        [Column("POCOMPLETE")]
        public bool? poComplete { get; set; }

        [Column("PODESCRIPTION")]
        public string? poDescription { get; set; }

        [Column("POTYPE")]
        public string? poType { get; set; }

        [Column("POMEMO")]
        public string? poMemo { get; set; }

        [Column("POSHIPVIA")]
        public string? poShipVia { get; set; }

        [Column("POFOB")]
        public string? pofob { get; set; }

        [Column("PODATEREQUIRED")]
        public DateTime? poDateRequired { get; set; }

        [Column("POTRANSMITTDATE")]
        public DateTime? poTransmittDate { get; set; }

        [Column("WHOID")]
        public int? whoID { get; set; }

        [Column("AUTHORZIEDSIGNATURE")]
        public string? authorziedSignature { get; set; }

        [Column("IHAC")]
        public string? ihac { get; set; }

        [Column("SAC")]
        public string? sac { get; set; }
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        public CountyPODetails? CountyPODetails { get; set; }
        public CountyPOPricing? CountyPOPricing { get; set; }

        public List<CountyPOLineItem>? CountyPOLineItem { get; set; }

    }
}
