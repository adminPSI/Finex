using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("FUND_AMOUNT")]
    public class CashBalance : Common
    {
        [Column("FUND_AMOUNT_ID")]
        public int id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("AMOUNT")]
        public decimal amount { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }

        [Column("FUND_ID")]
        public int fundId { get; set; }

        [Column("TYPE_CODE")]
        public int typeCode { get; set; } = 0;

        public string typeDesc { get { return typeCode == 2 ? "Transfer" : typeCode == 1 ? "Cash Balance" : string.Empty; } }

        [Column("NOTES")]
        public string? notes { get; set; }

        //public string isTransfer { get; set; }

    }
}
