using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("COUNTY_BUDGET_AMOUNTS")]
    public class BudgetAmount : Common
    {
        [Column("COUNTY_BUDGET_AMOUNT_ID")]
        public int Id { get; set; }

        [Column("COUNTY_ACCOUNTING_CODE_ID")]
        public int accountingCodeId { get; set; }

        [Column("AMOUNT")]
        public decimal amount { get; set; }

        [Column("TYPE_CODE")]
        public int typeCode { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }
        [Column("NOTES")]
        public string? notes { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

    }
}
