using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("OTHER_REVENUE_LOOKUP")]
    public class OtherRevenueLookup : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("NAME")]
        public string? name { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
    }
}
