using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.AccountRevenue
{
    [Table("ACCOUNT_RECEIVABLE_DESC")]
    public class AccountReceivableDesc : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }
        [Column("ARID")]
        public int? arID { get; set; }
        [Column("AMOUNT")]
        public decimal? amount { get; set; }
        [Column("DESCRIPTION")]
        public string? description { get; set; }
        [Column("QUANTITY")]
        public string? quantity { get; set; }
        [Column("PRICEPERUNIT")]
        public decimal? pricePerUnit { get; set; }
        [Column("UNIT")]
        public string? unit { get; set; }
        [Column("CUSTOMERID")]
        public int? customerID { get; set; }
        [Column("SAC")]
        public string? sac { get; set; }
        [Column("IHAC")]
        public string? ihac { get; set; }
        [Column("LINEBALANCE")]
        public decimal? lineBalance { get; set; }
        [Column("CACID")]
        public int? cacId { get; set; }

        [Column("RECEIVED")]
        public decimal? received { get; set; }

        [ForeignKey("customerID")]
        public Vendor? CountyRevenueContrib { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

        [ForeignKey("arID")]
        public AccountReceivables? AccountReceivable { get; set; }

    }
}
