using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    public class FunctionPrivilegeRoleStatusWise
    {
        public List<FUNCTION_PRIVILEGE_ROLE_LOOKUP> functionPrivilegeRoles 
        {
            get; set; 
        }
        public List<FUNCTION_PRIVILEGE_ROLE_LOOKUP> inactivefunctionPrivilegeRoles
        {
            get; set;
        }
    }
    public class FUNCTION_PRIVILEGE_ROLE_LOOKUP
    {
        [Key]
        [Column("FUNCTION_PRIVILEGE_ROLE_LOOKUP_ID")]
        public int FUNCTION_PRIVILEGE_ROLE_LOOKUP_ID { get; set; }

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
        [Column("ROLE_NAME")]
        public string? ROLE_NAME { get; set; }
    }
}
