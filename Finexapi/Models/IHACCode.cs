using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("IN_HOUSE_ACCOUNTING_CODES")]
    public class IHACCode : Common
    {
        [Column("IN_HOUSE_ACCOUNTING_CODE_ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }

        [Column("IN_HOUSE_ACCOUNTING_CODE")]
        public string ihacCode { get; set; }

        [Column("DESCRIPTION")]
        public string? description { get; set; }

        [Column("TYPE_CODE")]
        public int typeCode { get; set; }

        [Column("COUNTY_ACCOUNTING_CODE_ID")]
        public int? countyAccountingCode { get; set; }

        [Column("STATE_ACCOUNTING_CODE")]
        public string? stateAccountingCode { get; set; }

        [Column("PROGRAM_ACCOUNTING_CODE_ID")]
        public int? programAccountingCode { get; set; }

        [Column("ACCOUNT_ACCOUNTING_CODE_ID")]
        public int? ihcAccountCode { get; set; }

        [Column("DEPTARTMENT_ACCOUNTING_CODE_ID")]
        public int? departmentAccountingCode { get; set; }

        [Column("SUB_ACCOUNT_ACCOUNTING_CODE_ID")]
        public int? subAccountAccountingCode { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }

        [Column("END_DATE")]
        public DateTime? endDate { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }

        [Column("REVENUE_IND")]
        public char revenueInd { get; set; }

        [Column("EXPENSE_IND")]
        public char expenseInd { get; set; }

        [Column("SALARY_IND")]
        public char salaryInd { get; set; }
        public IHCAccount? IHACAccount { get; set; }
        public IHCDepartment? IHACDepartment { get; set; }
        public IHCSubAccount? IHACSubAccount { get; set; }
        public IHCProgram? IHACProgram { get; set; }
        public AccountingCode? AccountingCode { get; set; }
    }
}
