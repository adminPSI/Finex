using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("PRE_YEAR_BALANCE_REVENUE")]
    public class PreYearBalanceRevenue : Common
    {

        [Column("ID")]
        public int Id { set; get; }
        [Column("CACID")]
        public int cACID { set; get; }
        [Column("JAN")]
        public decimal jan { set; get; }
        [Column("FEB")]
        public decimal feb { set; get; }
        [Column("MAR")]
        public decimal mar { set; get; }
        [Column("APR")]
        public decimal apr { set; get; }
        [Column("MAY")]
        public decimal may { set; get; }
        [Column("JUN")]
        public decimal jun { set; get; }
        [Column("JUL")]
        public decimal jul { set; get; }
        [Column("AUG")]
        public decimal aug { set; get; }
        [Column("Sep")]
        public decimal sep { set; get; }
        [Column("OCT")]
        public decimal oct { set; get; }
        [Column("NOV")]
        public decimal nov { set; get; }
        [Column("DEC")]
        public decimal dec { set; get; }
        [Column("YEAR")]
        public string? year { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

        public AccountingCode? accountingCode { get; set; }
    }
}
