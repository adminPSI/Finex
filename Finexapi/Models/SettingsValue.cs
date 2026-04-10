using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("SETTINGS_VALUE")]
    public class SettingsValue : Common
    {
        [Column("SETTINGS_VALUE_ID")]
        public int? Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("SETTINGS_ID")]
        public int settingsId { get; set; }
        [Column("SETTINGS_VALUE")]
        public string? settingValue { get; set; } = null;
    }
}
