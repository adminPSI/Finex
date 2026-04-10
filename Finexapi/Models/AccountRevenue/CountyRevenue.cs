using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.AccountRevenue
{
    [Table("COUNTYREVENUE")]
    public class CountyRevenue : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("REV_FROM")]
        public int? rev_From { get; set; }

        [Column("REV_DATE")]
        public DateTime? rev_Date { get; set; }

        [Column("REV_AMOUNT")]
        public decimal rev_Amount { get; set; }

        [Column("REV_DESCRIPTION")]
        public string? rev_Description { get; set; }

        [Column("REV_RECEIPT_NO")]
        public string? rev_Receipt_No { get; set; }

        [Column("DATERECEIVED")]
        public DateTime dateReceived { get; set; }

        [Column("RECEIPTEDBYID")]
        public int? ReceiptedByID { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("POST_DATE")]
        public DateTime? postDate { get; set; }
        [Column("STATUS")]
        public int? status { get; set; }
        [Column("STATUS_CHANGE_DATE")]
        public DateTime? statusChangeDate { get; set; }
        [NotMapped]
        public decimal? totalBDAmount { get; set; }

        public Vendor? CountyRevenueContrib { get; set; }

        public CountyRevenueDetails? CountyRevenueDetails { get; set; }

        public List<CountyRevenueBD>? CountyRevenueBD { get; set; }

        public RevenueReceivableApproval? RevenueReceivableApproval { get; set; }
        public CodeValues? CodeValues { get; set; }


    }
}
