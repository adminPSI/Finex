using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("IN_HOUSE_EXPENSE_ALLOCATIONS")]
    public class IHACExpenseAmount : Common
    {
        [Column("IN_HOUSE_EXPENSE_ALLOCATION_ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("OrgId")]
        public int OrgAccountId { set; get; }

        [Column("IN_HOUSE_ACCOUNTING_CODE_ID")]
        public int ihacCodeId { get; set; }

        [Column("AMOUNT")]
        public decimal amount { get; set; }

        [Column("TYPE_CODE")]
        public int typeCode { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }
        [Column("NOTES")]
        public string? notes { get; set; }
    }
}
