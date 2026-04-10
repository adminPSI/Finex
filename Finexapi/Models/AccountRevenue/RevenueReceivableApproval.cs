using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.AccountRevenue
{
    [Table("REVENUE_RECEIVABLE_APPROVAL")]
    public class RevenueReceivableApproval : Common
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("OrgId")]
        public int OrgAccountId { set; get; }
        [Column("REF_ID")]
        public int? refId { get; set; }
        [Column("ACCOUNTTYPE")]
        public string accountType { get; set; }
        [Column("APPROVED_DATE")]
        public DateTime? approvedDate { get; set; }
        [Column("REQ_STATUS")]
        public bool? status { get; set; }
        [Column("REQ_STATUS_MESSAGE")]
        public string? statusMessage { get; set; }
        [ForeignKey("refId")]
        public CountyRevenue? CountyRevenue { get; set; }
        [ForeignKey("refId")]
        public AccountReceivables? AccountReceivable { get; set; }

    }
}
