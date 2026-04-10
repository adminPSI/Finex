using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class ROLE_RESOURCES
    {
        [Key]
        [Column("ROLE_RESOURCES_ID")]
        public int ROLE_RESOURCES_ID { get; set; }
        [Column("ROLE_ID")]
        public int? ROLE_ID { get; set; }

        [Column("PRIVILEGES_ID")]
        public int? PRIVILEGES_ID { get; set; }
        [Column("RESOURCES_ID")]
        public int? RESOURCES_ID { get; set; }
        [Column("STATUS")]
        public string? STATUS { get; set; }
        [Column("START_DATE")]
        public DateTime? START_DATE { get; set; }
        [Column("END_DATE")]
        public DateTime? END_DATE { get; set; }
    }
}
