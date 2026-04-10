using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLL_EMPLOYEE")]
    public class EEmployee
    {
        [Column("EMP_ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORG_ID { get; set; }
        [Column("EMP_NAME")]
        public string name { get; set; }
        [Column("EMP_NUMBER")]
        public string EmpNumber { get; set; }
        [Column("EMP_WRK_MONTHS")]
        public short EmpWprkMonths { get; set; }
        [Column("EMP_WRK_YR_START")]
        public DateTime EmpWorkYearStart { get; set; }
        [Column("EMP_WRK_YR_STOP")]
        public DateTime EmpWorkYearStop { get; set; }
        [Column("EMP_DATE_COUNTY")]
        public DateTime EmpDateCounty { get; set; }
        [Column("EMP_DATE_CURRENT_POS")]
        public DateTime EmpDateCurrentPost { get; set; }
        [Column("EMP_DATE_HIRED")]
        public DateTime EmpDateHired { get; set; }
        [Column("EMP_SSN")]
        public string EmpSSN { get; set; }
        [Column("EMP_TITLE_NO")]
        public int EmpTitleNo { get; set; }
        [Column("EMP_HOURS_WORKED")]
        public short EmpHoursWorked { get; set; }
        [Column("EMP_HOURS_PAID")]
        public short EmpHoursPaid { get; set; }
        [Column("EMP_ELG_VAC_TIME")]
        public bool EmpElgVacTime { get; set; }
        [Column("EMP_ELG_SICK_TIME")]
        public bool EmpElgSickTime { get; set; }
        [Column("EMP_ELG_COMP_TIME")]
        public bool EmpElgCompTime { get; set; }
        [Column("EMP_ELG_CALAMITY_TIME")]
        public bool EmpElgCalamityTime { get; set; }
        [Column("EMP_OVERTIME_RATE")]
        public decimal EmpOvertimeRate { get; set; }
        [Column("EMP_HOLIDAY_RATE")]
        public decimal EmpHolidayRate { get; set; }
        [Column("EMP_VACATION_RATE")]
        public decimal EmpVacationRate { get; set; }
        [Column("EMP_SICKTIME_RATE")]
        public decimal EmpSickTimeRate { get; set; }
        [Column("EMP_PERSONAL_RATE")]
        public decimal EmpPersonalRate { get; set; }
        [Column("EMP_PERSONAL_START_DAYS")]
        public short EmpPersonalStartDays { get; set; }
        [Column("EMP_VAC_START_DAYS")]
        public short EmpVacStartDays { get; set; }
        [Column("EMP_SICK_START_DAYS")]
        public short EmpSickStartDays { get; set; }
        [Column("EMP_COMP_START_DAYS")]
        public short EmpCompStartDays { get; set; }
        [Column("EMP_CALAMITY_START_DAYS")]
        public short EmpCalamityStartDays { get; set; }
        [Column("EMP_UNEXCUSED_START_DAYS")]
        public short EmpUnexcusedStartDays { get; set; }
        [Column("EMP_CONTRACT_DAYS")]
        public short EmpContractDays { get; set; }
        [Column("EMP_PAID_HOLIDAYS")]
        public short EmpPaidHolidays { get; set; }
        [Column("EMP_TOTAL_HRS_YR")]
        public short EmpTotalHoursYearly { get; set; }
        [Column("EMP_HOURLY_RATE")]
        public decimal EmpHourlyRate { get; set; }
        [Column("EMP_PAY_TYPE")]
        public short EmpPayType { get; set; }
        [Column("EMP_ELG_PERSONAL_TIME")]
        public bool EmpElgPersonalTime { get; set; }
        [Column("EMP_TOTALYEARS")]
        public short EmpTotalYears { get; set; }
        [Column("EMP_SALARY")]
        public decimal EmpSalary { get; set; }
        [Column("EMP_HOURS_DAY")]
        public short EmpHoursDay { get; set; }
        [Column("EMP_PAY_SALARY")]
        public decimal EmpPaySalary { get; set; }
        [Column("EMP_STEP_DATE")]
        public DateTime EmpStepDate { get; set; }
        [Column("EMP_VACA_LIMIT")]
        public decimal EmpVacaLimit { get; set; }
        [Column("EMP_SICKTIME_LIMIT")]
        public decimal EmpSickTimeLimit { get; set; }
        [Column("EMP_PERSONAL_LIMIT")]
        public decimal EmpPersonalLimit { get; set; }
        [Column("EMP_TEMP")]
        public bool EmpTemp { get; set; }
        [Column("EMP_GROUP_NO")]
        public string EmpGroupNo { get; set; }
        [Column("ACTIVE_EMPLOYEE")]
        public bool ActiveEmployee { get; set; }
        [Column("PREV_YEAR_EMP_SALARY")]
        public decimal PrevYearEmpSalary { get; set; }
        [Column("PREV_YEAR_EMP_PAY_SALARY")]
        public decimal PrevYearEmpPaySalary { get; set; }
        [Column("PREV_YEAR_EMP_HOURLY_RATE")]
        public decimal PrevYearEmpHoulryRate { get; set; }
        [Column("EMP_VACATION_YEARS")]
        public short EpmVacationYears { get; set; }
        [Column("AUTO_RUN")]
        public bool AutoRUn { get; set; }
        [Column("EMP_VAC_PEND_DAYS")]
        public short EmpVAcPendDays { get; set; }
        [Column("EMP_SICK_PEND_DAYS")]
        public short EmpSickPendDays { get; set; }
        [Column("EMP_PERS_PEND_DAYS")]
        public short EmpPersPendDays { get; set; }
        [Column("CLOCK_NO")]
        public string ClockNo { get; set; }
        [Column("JOB_CLASS")]
        public int JobClass { get; set; }
        [Column("ISUNION")]
        public bool IsUnion { get; set; }
        [Column("EMP_DATE_LAST")]
        public DateTime EmpDateLast { get; set; }
        [Column("FULLTIME")]
        public bool FullTime { get; set; }
        [Column("EEO_JOB_CLASS")]
        public int EEOJobClass { get; set; }
        [Column("EEO_RACE")]
        public int EEORace { get; set; }
        [Column("UNLISTED")]
        public bool UnListed { get; set; }
        [Column("BONUSSTART")]
        public decimal BonusStart { get; set; }
        [Column("PROSTART")]
        public decimal ProStart { get; set; }
        [Column("MAXVACATION")]
        public decimal MAxVacation { get; set; }
        [Column("LONGEVITY")]
        public string Longevity { get; set; }
        [Column("STEP")]
        public string Step { get; set; }
        [Column("HOLIDAYSCHEDULE1")]
        public bool HolydaySchedule1 { get; set; }
        [Column("HOLIDAYSCHEDULE2")]
        public bool HolidaySchedule2 { get; set; }
        [Column("PAYROLLGROUP1")]
        public bool PayrollGroup1 { get; set; }
        [Column("DRIVER_LICENSE")]
        public string DriverLicense { get; set; }
        [Column("LWOPSTARTDATE")]
        public DateTime LWOpStartDate { get; set; }
        [Column("FMLASTARTDATE")]
        public DateTime FMLAStartDate { get; set; }
        [Column("UNIONID")]
        public int UnionId { get; set; }
        [Column("SEASONAL")]
        public bool Seasonal { get; set; }
        [Column("LOWRATE")]
        public decimal LowRate { get; set; }
        [Column("VACACARRYOVER")]
        public decimal VacCarryOver { get; set; }
        [Column("EMPPERSONALSTART")]
        public DateTime EmpPersonalStart { get; set; }
        [Column("EMPPERSONALEND")]
        public DateTime EmpPersonalEnd { get; set; }
        [Column("CELLNUMBER")]
        public string CellNumber { get; set; }
        [Column("EXEMPT")]
        public bool Exempt { get; set; }
        [Column("INSURABLE")]
        public bool Insurable { get; set; }
        [Column("CLASSIFIED")]
        public bool Classified { get; set; }
        [Column("SUPERVISOR")]
        public bool Supervisor { get; set; }
        [Column("SUPERID")]
        public int SuperId { get; set; }
        [Column("TERMINATIONDATE")]
        public DateTime Terminationdate { get; set; }
        [Column("NOTES")]
        public string Notes { get; set; }
        [Column("TCMID")]
        public int TCMId { get; set; }
        [Column("WACPERIODIC")]
        public bool WAPPeriodic { get; set; }
        [Column("WACCONTINUOUS")]
        public bool WACContinuous { get; set; }
        [Column("VBALANCE")]
        public decimal VBalance { get; set; }
        [Column("SBALANCE")]
        public decimal SBalance { get; set; }
        [Column("YEARS")]
        public string Years { get; set; }
        [Column("DAYS")]
        public string Days { get; set; }
        [Column("DEFAULTSTARTTIME")]
        public string DefaultStartTime { get; set; }
        [Column("DEFAULTENDTIME")]
        public string DefaultEndTime { get; set; }
        [Column("LOCID")]
        public int LocId { get; set; }
        [Column("BUILDINGID")]
        public int BuildingId { get; set; }
        [Column("DAYARRAYCERTIFIED")]
        public bool DayArrayCertified { get; set; }
        [Column("TYPEID")]
        public int TypeId { get; set; }
        [Column("SUB")]
        public bool Sub { get; set; }
        [Column("LEAVETYPEID")]
        public int LeaveTypeId { get; set; }
        [Column("SUPERVISORNO")]
        public int SupervisorNo { get; set; }
        [Column("HOLIDAYSID")]
        public int HolidaySID { get; set; }
        [Column("LUNCHSTART")]
        public string LunchStart { get; set; }
        [Column("LUNCHEND")]
        public string LunchEnd { get; set; }
        [Column("OVERTIMEELIGIBLE")]
        public bool OverTimeEligible { get; set; }
        [Column("WEEKENDS")]
        public bool Weekends { get; set; }
        [Column("MONDAY")]
        public bool Monday { get; set; }
        [Column("TUESDAY")]
        public bool Tuesday { get; set; }
        [Column("WEDNESDAY")]
        public bool Wednesday { get; set; }
        [Column("THURSDAY")]
        public bool Thursday { get; set; }
        [Column("FRIDAY")]
        public bool Friday { get; set; }
        [Column("SATURDAY")]
        public bool Saturday { get; set; }
        [Column("SUNDAY")]
        public bool Sunday { get; set; }
        [Column("SUPGROUPNO")]
        public string SupGroupNo { get; set; }
        [Column("EMAILADDRESS")]
        public string EmailAddress { get; set; }
        [Column("AMPMEND")]
        public string APPMEnd { get; set; }
        [Column("AMPMSTART")]
        public string AMPMStart { get; set; }
        [Column("MAXLUNCHTIME")]
        public decimal MaxLunchTime { get; set; }
        [Column("LOGINID")]
        public string LoagInId { get; set; }
        [Column("SUPPRESSTIMECARD")]
        public bool SuppressTimeCard { get; set; }
        [Column("TUESDAY2")]
        public bool Tuesday2 { get; set; }
        [Column("MONDAY2")]
        public bool Monday2 { get; set; }
        [Column("WEDNESDAY2")]
        public bool Wednesday2 { get; set; }
        [Column("THURSDAY2")]
        public bool Thursday2 { get; set; }
        [Column("FRIDAY2")]
        public bool Friday2 { get; set; }
        [Column("SATURDAY2")]
        public bool Saturday2 { get; set; }
        [Column("SUNDAY2")]
        public bool Sunday2 { get; set; }
        [Column("DEFAULTSTARTTIME2")]
        public string DefaultStarttime2 { get; set; }
        [Column("DEFAULTENDTIME2")]
        public string DefaultEndTime2 { get; set; }
        [Column("YEARSDD")]
        public string YearsDD { get; set; }
        [Column("DAYSDD")]
        public string DaysDD { get; set; }
        [Column("ANNIVERSARYDATEDD")]
        public DateTime AnniversaryDateDD { get; set; }
        [Column("FULLTIMEHIRE")]
        public DateTime FullTimeHire { get; set; }
        [Column("EMPDEPTNOID")]
        public int EmpDeptNoId { get; set; }
        [Column("DEFAULTSTARTTIME3")]
        public string DefaultStartTime3 { get; set; }
        [Column("DEFAULTENDTIME3")]
        public string DefaultEndTime3 { get; set; }
        [Column("NONPAIDLUNCH")]
        public bool NonPaidLunch { get; set; }
        [Column("RUNPAYROLLFROMTIMECARD")]
        public bool RunPayrollFromTimeCard { get; set; }
        [Column("SPLITSCHEDULE")]
        public bool SplitSchedule { get; set; }
        [Column("STARTMON1")]
        public string StartMon1 { get; set; }
        [Column("STARTTUE1")]
        public string StartTue1 { get; set; }
        [Column("STARTWED1")]
        public string StartWed1 { get; set; }
        [Column("STARTTHU1")]
        public string StartThu1 { get; set; }
        [Column("STARTFRI1")]
        public string StartFri1 { get; set; }
        [Column("STARTSAT1")]
        public string StartSat1 { get; set; }
        [Column("STARTSUN1")]
        public string StartSun1 { get; set; }
        [Column("ENDMON1")]
        public string EndMon1 { get; set; }
        [Column("ENDTUE1")]
        public string EndTue1 { get; set; }
        [Column("ENDWED1")]
        public string EndWed1 { get; set; }
        [Column("ENDTHU1")]
        public string EndThu1 { get; set; }
        [Column("ENDFRI1")]
        public string EndFri1 { get; set; }
        [Column("ENDSAT1")]
        public string EndSat1 { get; set; }
        [Column("ENDSUN1")]
        public string EndSun1 { get; set; }
        [Column("STARTMON2")]
        public string StartMon2 { get; set; }
        [Column("STARTTUE2")]
        public string Starttue2 { get; set; }
        [Column("STARTWED2")]
        public string StartWed2 { get; set; }
        [Column("STARTTHU2")]
        public string StartThu2 { get; set; }
        [Column("STARTFRI2")]
        public string StartFri2 { get; set; }
        [Column("STARTSAT2")]
        public string StartSat2 { get; set; }
        [Column("STARTSUN2")]
        public string StartSun2 { get; set; }
        [Column("ENDMON2")]
        public string EndMon2 { get; set; }
        [Column("ENDTUE2")]
        public string EndTue2 { get; set; }
        [Column("ENDWED2")]
        public string EndWed2 { get; set; }
        [Column("ENDTHU2")]
        public string EndThu2 { get; set; }
        [Column("ENDFRI2")]
        public string EndFri2 { get; set; }
        [Column("ENDSAT2")]
        public string EndSat2 { get; set; }
        [Column("ENDSUN2")]
        public string EndSun2 { get; set; }
        [Column("PERSONALEMAILADDRESS")]
        public string PersonalEmailAddress { get; set; }
        [Column("EVALDATE")]
        public DateTime EvalDate { get; set; }
        [Column("EVALNOTICESENTDATE")]
        public DateTime EvalNoticeSentDate { get; set; }
        [Column("EVALCOMPLETIONDATE")]
        public DateTime EvalCompletionDate { get; set; }
        [Column("PRINTTIMESHEET")]
        public bool PrintTimeSheet { get; set; }
        [Column("STARTMON3")]
        public string StartMon3 { get; set; }
        [Column("STARTTUE3")]
        public string StartTue3 { get; set; }
        [Column("STARTWED3")]
        public string StartWed3 { get; set; }
        [Column("STARTTHU3")]
        public string StartThu3 { get; set; }
        [Column("STARTFRI3")]
        public string StartFri3 { get; set; }
        [Column("STARTSAT3")]
        public string StartSat3 { get; set; }
        [Column("STARTSUN3")]
        public string StartSun3 { get; set; }
        [Column("ENDMON3")]
        public string EndMon3 { get; set; }
        [Column("ENDTUE3")]
        public string EndTue3 { get; set; }
        [Column("ENDWED3")]
        public string EndWed3 { get; set; }
        [Column("ENDTHU3")]
        public string EndThu3 { get; set; }
        [Column("ENDFRI3")]
        public string EndFri3 { get; set; }
        [Column("ENDSAT3")]
        public string EndSat3 { get; set; }
        [Column("ENDSUN3")]
        public string EndSun3 { get; set; }
        [Column("TRACKLUNCHHOURS")]
        public bool TrackLunchHours { get; set; }
        [Column("ORIGINALHIREDATE")]
        public DateTime OriginalHiredDate { get; set; }
        [Column("REHIREDATE")]
        public DateTime RehiredDate { get; set; }
    }
}
