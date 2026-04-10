using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("PAY_CODES")]
    public class PayCodes : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("REG_HOURS")]
        public string? regHours { set; get; }
        [Column("OT_HOURS")]
        public string? otHours { set; get; }
        [Column("HOLIDAY_WORK")]
        public string? holidayWork { set; get; }
        [Column("ST_HOURS")]
        public string? stHours { set; get; }
        [Column("JOB_VACA")]
        public string? jobVaca { set; get; }
        [Column("JOB_SICK")]
        public string? jobSick { set; get; }
        [Column("PAID_HOLIDAY")]
        public string? paidHoliday { set; get; }
        [Column("ADJUSTMENT")]
        public string? adjustment { set; get; }
        [Column("VACATION_PAYOUT")]
        public string? vacationPayout { set; get; }
        [Column("SICK_PAYOUT")]
        public string? sickPayout { set; get; }
        [Column("COMP_TIME")]
        public string? compTime { set; get; }
        [Column("PERSONAL_HOURS")]
        public string? personalHours { set; get; }
        [Column("LWOP")]
        public string? lwop { set; get; }
        [Column("SUMMARY_DATA_CODE")]
        public string? sumaryDataCode { set; get; }
        [Column("PROFESSIONAL_HOURS")]
        public string? profrssionalHours { set; get; }
        [Column("COMP_HOURS")]
        public string? compHours { set; get; }
        [Column("BONUS")]
        public string? bonus { set; get; }
        [Column("COMP_EARNED")]
        public string? compEarned { set; get; }
    }
}
