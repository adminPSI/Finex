using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class PRIVILEGES
    {
        [Key]
        [Column("PRIVILEGES_ID")]
        public int privileges_id { get; set; }

        [Column("PRIVILEGES_NAME")]
        public string? privileges_name { get; set; }
        [Column("PRIVILEGES_KEY")]
        public string? privileges_key { get; set; }

        [Column("APPLICATIONS_ID")]
        public int applications_id { get; set; }

    }
}
