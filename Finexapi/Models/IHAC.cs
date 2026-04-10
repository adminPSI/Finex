using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("IN_HOUSE_ACCOUNTING_CODES")]
    public class IHAC : Common
    {
        [Column("IN_HOUSE_ACCOUNTING_CODE_ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int orgAccountId { get; set; }

        [Column("NUMBER")]
        public string number { get; set; }

        [Column("DESCRIPTION")]
        public string description { get; set; }

        [Column("TYPE_CODE")]
        public int typeCode { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }

        [Column("END_DATE")]
        public DateTime endDate { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }

        [Column("REVENUE_IND")]
        public char revenueInd { get; set; }

        [Column("EXPENSE_IND")]
        public char expenseInd { get; set; }

        [Column("SALARY_IND")]
        public char salaryInd { get; set; }

    }
}
