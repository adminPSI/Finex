using FinexAPI.Models.PayrollEmployee;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("FUND_TRANS")]
    public class FundTrans : Common
    {
        [Column("TRANS_ID")]
        public int Id { set; get; }
        [Column("TRANS_CAC_FROM")]
        public int? Trans_CAC_From { set; get; }
        [Column("TRANS_IHAC_FROM")]
        public string? Trans_IHAC_From { set; get; }
        [Column("TRANS_DESCRIPTION")]
        public string? Trans_Description { set; get; }
        [Column("TRANS_DATE")]
        public DateTime? Trans_Date { set; get; }
        [Column("TRANS_AMOUNT")]
        public decimal? Trans_Amount { set; get; }
        [Column("TRANS_SAC_FROM")]
        public string? Trans_SAC_From { set; get; }
        [Column("TRANSCACID")]
        public int? TransCACId { set; get; }
        [Column("Payroll")]
        public bool? IsPayroll { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }
        [NotMapped]
        public int? TransYear {
            get { 
                return Trans_Date.HasValue ? Trans_Date.Value.Year : null;
            }
                }
        [NotMapped]
        public string? countyExpenseCode { set; get; }
    }
}
