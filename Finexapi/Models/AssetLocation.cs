using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("ASSET_LOCATION")]
    public class AssetLocation : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("ASSET_ID")]
        public int? assetId { get; set; }
        [Column("PROGRAM")]
        public int? program { get; set; }
        [Column("BUILDING")]
        public int? building { get; set; }
        [Column("AREA")]
        public int? area { get; set; }
        [Column("RES_PER")]
        public int? resPer { get; set; }
        [Column("INSTALlED_ON")]
        public string? installedOn { get; set; }
    }
}
