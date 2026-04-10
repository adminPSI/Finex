using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("ASSET_LOCATION_LOOKUP")]
    public class AssetLookup : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("TYPE")]
        public int? type { get; set; }
        [Column("NAME")]
        public string? name { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [NotMapped]
        public string? typename { get; set; }
    }
}
