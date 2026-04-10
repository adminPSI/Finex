using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class FUNCTION_PRIVILEGE_ROLE
    {
        [Key]
        [Column("FUNCTION_PRIVILEGE_ROLE_ID")]
        public int FUNCTION_PRIVILEGE_ROLE_ID { get; set; }
     
        [Column("FUNCTION_ID")]
        public int FUNCTION_ID { get; set; }

        [Column("PRIVILEGES_ID")]
        public int PRIVILEGES_ID { get; set; }
        [Column("ROLE_ID")]
        public int ROLE_ID { get; set; }

        [Column("STATUS")]
        public string? STATUS { get; set; }
      
        [Column("START_DATE")]
        public DateTime? START_DATE { get; set; }
        [Column("END_DATE")]
        public DateTime? END_DATE { get; set; }
    }
}
