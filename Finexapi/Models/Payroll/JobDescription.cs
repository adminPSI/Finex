using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLL_JOB_DESCRIPTION")]
    public class JobDescription : Common
    {
        [Column("EMP_JOB_ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORG_Id { get; set; }
        [Column("EMP_JOB_DESCRIPTION")]
        public string EmpJobDescription { get; set; }
        [Column("ACTIVE_IND")]
        public string Inactive { get; set; }
        [Column("JOB_NO")]
        public string JobNo { get; set; }
        [Column("REGULAR_HRS")]
        public string RegularHours { get; set; }
        [Column("OTHRS")]
        public string Other { get; set; }
        [Column("HOLIDAY_WORK")]
        public string HolidayWork { get; set; }
        [Column("ST_HOURS")]
        public string STHours { get; set; }
        [Column("NON_ST_HOURS")]
        public string NonSTHours { get; set; }
        [Column("VACATION")]
        public string Vacation { get; set; }
        [Column("SICK")]
        public string Sick { get; set; }
        [Column("PAID_HOLIDAY")]
        public string PaidHoliday { get; set; }
        [Column("ADJUSTMENT")]
        public string Adjustment { get; set; }
        [Column("PAYOUT")]
        public string Payout { get; set; }
        [Column("VAC_PAYOUT")]
        public string VacPayout { get; set; }
        [Column("SICK_PAYOUT")]
        public string SickPayout { get; set; }
        [Column("PERSONAL_HOURS")]
        public decimal PersonalHours { get; set; }
        [Column("DONOTSHOWINPAYREP")]
        public bool DoNotShowInpayRep { get; set; }
    }
}
