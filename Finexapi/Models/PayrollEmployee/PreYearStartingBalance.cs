using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("PRE_YEARS_STARTING_BALANCE")]
    public class PreYearStartingBalance : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("DATE")]
        public DateTime? date { set; get; }
        [Column("END_DATE")]
        public DateTime? endDate { set; get; }
        [Column("PERSONAL_BAL")]
        public decimal personalBalance { set; get; }
        [Column("VAC_BAL")]
        public decimal vacBal { set; get; }
        [Column("SICK_BAL")]
        public decimal sickBal { set; get; }
        [Column("COMP_BAL")]
        public decimal compBal { set; get; }
        [Column("EMP_ID")]
        public int empId { set; get; }
        [Column("MEMO")]
        public string? memo { set; get; }
        [Column("BONUS_PERSONAL")]
        public decimal bonusPersonal { set; get; }
        [Column("FEDPAIDSICKBAL")]
        public decimal fedSickPaidBill { set; get; }
        [Column("EMERGENCY_FMLA_BAL")]
        public decimal emergencyFmlaBal { set; get; }
    }
}
