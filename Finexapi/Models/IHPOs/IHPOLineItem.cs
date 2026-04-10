using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.IHPOs
{
    [Table("IHPOLINEITEM")]
    public class IHPOLineItem : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("REQID")]
        public int? reqID { get; set; }

        [Column("REQDNUMBER")]
        public string? reqDNumber { get; set; }

        [Column("REQDQUANTITY")]
        public string? reqDQuantity { get; set; }

        [Column("REQDCATNO")]
        public string? reqDCatNo { get; set; }

        [Column("REQDDESCRIPTION")]
        public string? reqDDescription { get; set; }

        [Column("REQDUNITPRICE")]
        public decimal? reqDUnitPrice { get; set; }

        [Column("REQDDISCOUNT")]
        public decimal? reqDDiscount { get; set; }

        [Column("REQDTOTAL")]
        public decimal? reqDTotal { get; set; }

        [Column("REQIHAC")]
        public string? reqIHAC { get; set; }

        [Column("BALANCE")]
        public decimal? balance { get; set; }

        [Column("PO_ID")]
        public long? poid { get; set; }

        [Column("COMPLETE")]
        public bool? complete { get; set; }

        [Column("APPROVEDBY")]
        public string? approvedBy { get; set; }

        [Column("APPROVEDDATE")]
        public DateTime? approvedDate { get; set; }

        [Column("DATECOMPLETE")]
        public DateTime? dateComplete { get; set; }

        [Column("SAC")]
        public string? sAC { get; set; }

        [Column("VOUCHERAMOUNT")]
        public decimal? voucherAmount { get; set; }

        [Column("LINEDATE")]
        public DateTime? lineDate { get; set; }

        [Column("CLIENTID")]
        public int? clientID { get; set; }

        [Column("FUNDINGSOURCEID")]
        public int? fundingSourceID { get; set; }

        [Column("LISTOFOTHERSID")]
        public int? listOfOthersID { get; set; }

        [Column("CATEGORYID")]
        public int? categoryID { get; set; }

        [Column("SERVICEDATE")]
        public DateTime? serviceDate { get; set; }

        [Column("UNITDESC")]
        public string? unitDesc { get; set; }

        [Column("PARTNUMBER")]
        public string? partNumber { get; set; }

        [Column("PROJECTID")]
        public int? projectID { get; set; }

        [Column("QUANTITYREC")]
        public decimal? quantityRec { get; set; }

        [Column("SERVICEDATEEND")]
        public DateTime? serviceDateEnd { get; set; }

        [Column("REQRECEIVE")]
        public decimal? reqReceive { get; set; }

        [ForeignKey("reqID")]
        public IHPO? IHPO { get; set; }
        [NotMapped]
        public string? poNumber { get; set; }
    }
}
