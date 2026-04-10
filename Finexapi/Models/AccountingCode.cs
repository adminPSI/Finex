using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("COUNTY_ACCOUNTING_CODES")]
    public class AccountingCode : Common
    {
        [Column("COUNTY_ACCOUNTING_CODE_ID")]
        public int Id { get; set; }

        [Column("FUND_ID")]
        public int FundId { get; set; }

        public Fund? Fund { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { get; set; }

        [Column("CODE")]
        public string countyExpenseCode { get; set; }

        [Column("DESCRIPTION")]
        public string countyExpenseDescription { get; set; }

        [Column("TYPE_CODE")]
        public int typeCode { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }

        [Column("END_DATE")]
        public DateTime? endDate { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }

    }
}
