using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("ASSET_SAC_AMOUNT")]
    public class AssetSacAmount : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("SAC")]
        public string? sac { get; set; }
        [Column("AMOUNT")]
        public decimal? amount { get; set; }
        [Column("DEP_DATE")]
        public DateTime? depDate { get; set; }
        [Column("ASSET_ID")]
        public int? assetId { get; set; }
        [Column("LAST_YEAR_DEPT")]
        public DateTime? lastYearDept { get; set; }
        [Column("YEAR_REMOVED")]
        public DateTime? yearRemoved { get; set; }
    }
}
