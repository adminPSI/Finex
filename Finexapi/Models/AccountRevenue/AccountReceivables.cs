using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.AccountRevenue
{
    [Table("ACCOUNTRECEIVABLES")]
    public class AccountReceivables : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("VENDORID")]
        public int? vendorID { get; set; }

        [Column("ARDATE")]
        public DateTime arDate { get; set; }

        [Column("INVOICENO")]
        public string invoiceNo { get; set; }

        [Column("AMOUNT")]
        public decimal amount { get; set; }

        [Column("BALANCE")]
        public decimal? balance { get; set; }

        [Column("UNCOLLECTEDDEBT")]
        public bool? uncollectedDebt { get; set; }

        //[Column("APPROVED")]
        //public bool? Approved { get; set; }

        //[Column("DISAPPROVED")]
        //public bool? DisApproved { get; set; }

        //[Column("DISAPPROVALMEMO")]
        //public string? DisApprovalMemo { get; set; }

        [Column("CORRECTED")]
        public bool? corrected { get; set; }

        [Column("PRINTED")]
        public bool? printed { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        public Vendor? CountyRevenueContrib { get; set; }

        public List<AccountReceivableDesc>? AccountReceivableDescs { get; set; }

        public RevenueReceivableApproval? RevenueReceivableApproval { get; set; }

    }
}
