using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("CATEGORY")]
    public class Category : Common
    {
        [Column("CATEGORY_ID")]
        public int Id { get; set; }
        [Column("NAME")]
        public string? name { get; set; }
        [Column("ICON")]
        public string? icon { get; set; }
        [Column("ACTIVE_IND")]
        public string? isActive { get; set; }
        [NotMapped]
        public List<Settings> Settings { get; set; } = new List<Settings>();
        [NotMapped]
        public object SettingsObj { get; set; }
    }
}
