using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.UserManagement
{
    [Table("RESOURCES")]
    public class RESOURCES
    {
        [Key]
        [Column("RESOURCES_ID")]
        public int RESOURCES_ID { get; set; }
        [Column("RESOURCES_TYPE")]
        public string? RESOURCES_TYPE { get; set; }

        [Column("RESOURCES_KEY")]
        public string? RESOURCES_KEY { get; set; }
        [Column("RESOURCES_NAME")]
        public string? RESOURCES_NAME { get; set; }
        [Column("RESOURCES_URI")]
        public string? RESOURCES_URI { get; set; }
        [Column("PARENT_RESOURCES_ID")]
        public int? PARENT_RESOURCES_ID { get; set; }
        [Column("SORT_KEY")]
        public int? SORT_KEY { get; set; }
        [Column("APPLICATIONS_ID")]
        public int? APPLICATIONS_ID { get; set; }
        [Column("ICON")]
        public string? ICON { get; set; }
        [Column("RESOURCES_LEVEL")]
        public string? RESOURCES_LEVEL { get; set; }
    }
}
