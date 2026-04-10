using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("SETTINGS")]
    public class Settings : Common
    {
        [Column("SETTINGS_ID")]
        public int Id { get; set; }
        [Column("CATEGORY_ID")]
        public int CategoryId { get; set; }
        [Column("NAME")]
        public string? name { get; set; } = "";
        [Column("SECTION")]
        public string? section { get; set; } = "";
        [Column("DISPLAY_NAME")]
        public string? displayName { get; set; } = "";
        [Column("TYPE")]
        public string? type { get; set; } = "";
        [Column("SETTING_KEY")]
        public int settingKey { get; set; }
        [Column("ACTIVE_IND")]
        public string? isActive { get; set; }
        [NotMapped]
        public string? SettingsValue { get; set; }
    }
}
