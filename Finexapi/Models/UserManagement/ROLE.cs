using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class ROLE
    {
        [Key]
        [Column("ROLE_ID")]
        public int ROLE_ID { get; set; }
        [Column("ROLES_KEY")]
        public string? ROLES_KEY { get; set; }
        [Column("ROLES_NAME")]
        public string? ROLES_NAME { get; set; }
        [Column("APPLICATION_ID")]
        public int? APPLICATION_ID { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? ORG_ACCOUNT_ID { get; set; }
    }
}
