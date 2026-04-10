


using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace FinexAPI.Models
{
    [Table("EMPLOYEE_USER_MAPPING")]
    public class EmployeeUserMapping : Common
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("EMP_ID")]
        public int EmpId { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("OrganizationId")]
        public int OrgAccountId { set; get; }

        [Column("USERID")]
        public string? UserId { get; set; }
        [ForeignKey("EmpId")]
        public Employee? Employee { get; set; }
    }
}
