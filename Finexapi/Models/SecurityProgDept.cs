using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("SECURITY_PROG_DEPT")]
    public class SecurityProgDept : Common
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("OrgId")]
        public int OrgAccountId { set; get; }
        [Column("EMP_ID")]
        public int empId { get; set; }
        [Column("SELECTED_PROGRAMS")]
        public string? selectedPrograms { get; set; }
        [Column("SELECTED_DEPARTMENTS")]
        public string? selectedDepartments { get; set; }
    }
}
