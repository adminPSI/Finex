using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class FUNCTION_ALLOWED_PRIVILEGES
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        
        [Column("FUNCTION_ID")]
        public int FUNCTION_ID { get; set; }

        [Column("PRIVILEGES_ID")]
        public int PRIVILEGES_ID { get; set; }

    }
}
