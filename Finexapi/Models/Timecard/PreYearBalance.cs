using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("PRE_YEAR_BALANCE")]

    public class PreYearBalance : Common
    {
        [Column("BAL_ID")]
        public int Id { set; get; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("OrgId")]
        public int OrgAccountId { set; get; }
        [Column("BAL_CACID")]
        public int balCACID { set; get; }
        [Column("BAL_JAN")]
        public decimal balJan { set; get; }
        [Column("BAL_FEB")]
        public decimal balFeb { set; get; }
        [Column("BAL_MAR")]
        public decimal balMar { set; get; }
        [Column("BAL_APR")]
        public decimal balApr { set; get; }
        [Column("BAL_MAY")]
        public decimal balMay { set; get; }
        [Column("BAL_JUN")]
        public decimal balJun { set; get; }
        [Column("BAL_JUL")]
        public decimal balJul { set; get; }
        [Column("BAL_AUG")]
        public decimal balAug { set; get; }
        [Column("BAL_Sep")]
        public decimal balSep { set; get; }
        [Column("BAL_OCT")]
        public decimal balOct { set; get; }
        [Column("BAL_NOV")]
        public decimal balNov { set; get; }
        [Column("BAL_DEC")]
        public decimal balDec { set; get; }
        [Column("BAL_YEAR")]
        public string? balYear { set; get; }

        public AccountingCode? AccountingCode { get; set; }
    }
}
