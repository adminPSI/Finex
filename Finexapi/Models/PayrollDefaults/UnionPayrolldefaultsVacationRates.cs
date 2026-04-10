using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("UNION_PAYROLL_DEFAULT_VACTION_RATES")]
    public class UnionPayrolldefaultsVacationRates : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("LUMPSUM")]
        public decimal lumpSum { set; get; }
        [Column("MAX_ACCRUAL")]
        public int maxAccrual { set; get; }
        [Column("YEARS_WORKED_START")]
        public decimal yearsWorkedStart { set; get; }
        [Column("YEARS_WORKED_END")]
        public decimal yearsWorkedEnd { set; get; }
        [Column("VACATION_RATE")]
        public decimal vacationRate { set; get; }
        [Column("VACATION_LIMIT")]
        public decimal vacationLimit { set; get; }

    }
}
