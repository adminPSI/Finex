using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("EMPLOYEE_DEPARTMENT")]
    public class EmployeeDepartment:Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("DESCRIPTION")]
        public string? Description { set; get; }
        [Column("INACTIVE")]
        public bool inactive { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }
    }
}
