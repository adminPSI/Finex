using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("FUND")]
    public class Fund : Common
    {
        [Column("FUND_ID")]
        public int id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("CODE")]
        public string fundCode { get; set; }

        [Column("DESCRIPTION")]
        public string fundName { get; set; }

        [Column("START_DATE")]
        public DateTime activeDate { get; set; }

        [Column("END_DATE")]
        public DateTime? inactiveDate { get; set; }

        [Column("ACTIVE_IND")]
        public string? isActive { get; set; }

        //public List<CashBalance> cashBalances { get; set; }

    }
}
