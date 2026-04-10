using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLL_ATTENDANCE")]
    public class Attendance
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("EMP_ID")]
        public int? employeeId { set; get; }
        [Column("DATE")]
        public DateTime? date { set; get; }
        [Column("ABSENT")]
        public bool absent { set; get; }
        [Column("TARDY")]
        public bool tardy { set; get; }
        [Column("PRESENT")]
        public bool present { set; get; }
        [Column("PRESENT_FIRST_HALF")]
        public bool presentFirstHalf { set; get; }
        [Column("PRESENT_SECOND_HALF")]
        public bool presentSecondHalf { set; get; }
        [Column("NO_ATTENDANCE_ENTERED")]
        public bool noAttendanceEntered { set; get; }
        [Column("VACATION")]
        public bool vacation { set; get; }
        [Column("SICK_LEAVE")]
        public bool sickLeave { set; get; }
        [Column("PERSONAL_TIME")]
        public bool personalTime { set; get; }
        [Column("UNEXCUSED")]
        public bool unexcused { set; get; }
        [Column("NOTES")]
        public string? notes { set; get; }
        [Column("HOURS")]
        public decimal? hours { set; get; }
        [Column("FAMILY_LEAVE_ACT")]
        public bool familyLeaveAct { set; get; }
        [Column("LEAVE_W/O_PAY")]
        public bool leaeWOPay { set; get; }
        [Column("PRO_DAY")]
        public bool proDay { set; get; }
        [Column("VACATION_HOURS")]
        public decimal? vacationHours { set; get; }
        [Column("SICK_LEAVE_HOURS")]
        public decimal? sickLeaveHours { set; get; }
        [Column("PERSONAL_TIME_HOURS")]
        public decimal? personalTimeHours { set; get; }
        [Column("UNEXCUSED_HOURS")]
        public decimal? unexcusedHours { set; get; }
        [Column("FAMILY_LEAVE_ACT_HOURS")]
        public decimal? familyLeaveActHours { set; get; }
        [Column("LEAVE_W/O_PAY_HOURS")]
        public decimal? leaveWOPayHours { set; get; }
        [Column("PRO_DAY_HOURS")]
        public decimal? proDayHours { set; get; }
        [Column("COMP_EARNED")]
        public bool compEarned { set; get; }
        [Column("COMP_EARNED_HOURS")]
        public decimal? compEarnedHours { set; get; }
        [Column("SNOW")]
        public bool snow { set; get; }
        [Column("SNOW_HOURS")]
        public decimal? snowHours { set; get; }
        [Column("BREAK")]
        public bool Break { set; get; }
        [Column("BREAK_HOURS")]
        public decimal? breakHours { set; get; }
        [Column("BONUS_PER")]
        public bool bonusPer { set; get; }
        [Column("BONUS_PER_USED")]
        public decimal? bonusPerUsed { set; get; }
        [Column("BONUS_PER_E")]
        public bool bonusPerE { set; get; }
        [Column("BONUS_PER_EARNED")]
        public decimal? bonusPerEarned { set; get; }
        [Column("HOLIDAY")]
        public bool holiday { set; get; }
        [Column("SICK_COMPENSATION")]
        public bool sickCompensation { set; get; }
        [Column("HOLIDAY_HOURS")]
        public decimal? holidayHours { set; get; }
        [Column("SICK_COMPENSATION_HOURS")]
        public decimal? sickCompensationHours { set; get; }
        [Column("DAY_OF_WEEK")]
        public string? dayOfWeek { set; get; }
        [Column("OTHER")]
        public bool other { set; get; }
        [Column("OTHER_HOURS")]
        public decimal? otherHours { set; get; }
        [Column("RESERVE_HOURS")]
        public decimal? reserveHours { set; get; }
        [Column("RESERVE")]
        public bool reserve { set; get; }
        [Column("WORKERS_COMP")]
        public bool workersComp { set; get; }
        [Column("WORKERS_COMP_HOURS")]
        public decimal? workersCompHours { set; get; }
        [Column("TYPE")]
        public string? type { set; get; }
        [Column("WC_TRACK")]
        public bool wcTrack { set; get; }
        [Column("NO_EMPLOYEE_REQUEST")]
        public bool noEmployeeRequest { set; get; }
        [Column("COMPLETED")]
        public bool completed { set; get; }
        [Column("LOCKED_RECORD")]
        public bool lockedRecord { set; get; }
        [Column("WAGE_CONTIN")]
        public bool wageContIn { set; get; }
        [Column("WAGE_CONTIN_HOURS")]
        public decimal? wageContInHours { set; get; }
        [Column("LEAVE_CODE_ID")]
        public int? leaveCodeId { set; get; }
        [Column("FED_PAID_SICK")]
        public bool fedPaidSick { set; get; }
        [Column("FED_PAID_SICK_HOURS")]
        public decimal? fedPaidSickHours { set; get; }
        [Column("EMERGENCY_FMLA")]
        public bool emergencyFMLA { set; get; }
        [Column("EMERGENCY_FMLA_HOURS")]
        public decimal? emergencyFMLAHours { set; get; }
        [Column("FMLA_START_DATE")]
        public DateTime? fmlaStartDate { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
    }
}
