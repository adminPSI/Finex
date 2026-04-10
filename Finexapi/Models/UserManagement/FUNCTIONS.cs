using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class FUNCTIONS
    {
        [Key]
        [Column("FUNCTIONS_ID")]
        public int FUNCTIONS_ID { get; set; }
       
        [Column("FUNCTIONS_KEY")]
        public string? FUNCTIONS_KEY { get; set; }
        [Column("FUNCTIONS_NAME")]
        public string? FUNCTIONS_NAME { get; set; }

        [Column("APPLICATIONS_ID")]
        public int? APPLICATIONS_ID { get; set; }

        [Column("FUNCTIONS_GROUPS_ID")]
        public int? FUNCTIONS_GROUPS_ID { get; set; }
    }
}
