using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("PAYROLLJOBDESCRIPTION")]
    public class PayrollJobDescription : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("EMP_JOB_DESCRIPTION")]
        public string? empJobDescription { set; get; }
        [Column("INACTIVE")]
        public bool inactive { set; get; }
        [Column("JOB_NO")]
        public string? jobNo { set; get; }
        [Column("REGULAR_HRS")]
        public string? regularHrs { set; get; }
        [Column("OT_HRS")]
        public string? otHrs { set; get; }
        [Column("HOLIDAY_WORK")]
        public string? holidayWork { set; get; }
        [Column("ST_HOURS")]
        public string? stHours { set; get; }
        [Column("NON_ST_HOURS")]
        public string? nonStHours { set; get; }
        [Column("VACATION")]
        public string? vacation { set; get; }
        [Column("SICK")]
        public string? sick { set; get; }
        [Column("PAID_HOLIDAY")]
        public string? paidHoliday { set; get; }
        [Column("ADJUSTMENT")]
        public string? adjustment { set; get; }
        [Column("PAYOUT")]
        public string? payOut { set; get; }

        [Column("VAC_PAYOUT")]
        public string? vacPayOut { set; get; }

        [Column("SICK_PAYOUT")]
        public string? sickPayOut { set; get; }
        [Column("PERSONAL_HOURS")]
        public decimal personalHours { set; get; }
        [Column("DONOT_SHOW_IN_PAY_REP")]
        public bool showInPayRep { set; get; }

    }
}
