using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class FUNCTIONS_RESOURCES
    {
        [Key]
        [Column("FUNCTIONS_RESOURCES_ID")]
        public int FUNCTIONS_RESOURCES_ID { get; set; }
        [Column("FUNCTIONS_ID")]
        public int? FUNCTIONS_ID { get; set; }
        [Column("RESOURCES_ID")]
        public int? RESOURCES_ID { get; set; }
        [Column("PRIVILEGE_ID")]
        public int? PRIVILEGE_ID { get; set; }
    }
}
