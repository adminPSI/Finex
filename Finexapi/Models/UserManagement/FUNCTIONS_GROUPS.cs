using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class FUNCTIONS_GROUPS
    {
        [Key]
        [Column("FUNCTIONS_GROUPS_ID")]
        public int FUNCTIONS_GROUPS_ID { get; set; }
        [Column("FUNCTION_GROUPS_NAME")]
        public string? FUNCTION_GROUPS_NAME { get; set; }

        [Column("APPLICATIONS_ID")]
        public int? APPLICATIONS_ID { get; set; }

        [Column("PARENT_FUNCTION_GROUPS_ID")]
        public int PARENT_FUNCTION_GROUPS_ID { get; set; }

        
        

    }
}
