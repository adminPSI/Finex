using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLL_EMP_YR")]
    public class EmployeeYear
    {
        [Column("EMP_YR_ID")]
        public short Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORGID { get; set; }
        [Column("EMP_YR_START")]
        public DateTime YearStart { get; set; }
        [Column("EMP_YR_STOP")]
        public DateTime YearStop { get; set; }

    }
}
