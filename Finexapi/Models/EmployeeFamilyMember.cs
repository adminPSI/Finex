using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("EMPLOYEE_FAMILY_MEMBERS")]
    public class EmployeeFamilyMember : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("EMPLOYEE_ID")]
        public int employeeId { set; get; }
        [Column("NAME")]
        public string? name { set; get; }
        [Column("DATE_OF_BIRTH")]
        public DateTime? dateOfBirth { set; get; }
        [Column("RELATIONSHIP")]
        public string? relationship { set; get; }
        [Column("DEPENDENT")]
        public string? dependent { set; get; }
    }
}
