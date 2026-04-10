using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("EMPLOYEE_DEPT")]
    public class EmployeeDepartment
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORG_ID { get; set; }
        [Column("ACTIVE_IND")]
        public string Inactive { get; set; }
        [Column("DESCRIPTION")]
        public string name { get; set; }
    }
}
