using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("EMPLOYEE_PAYROLL_SETUP")]
    public class EmployeePayrollSetup : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("EMP_ID")]
        public int empId { set; get; }
        [Column("EMP_WRK_MONTHS")]
        public int? empWorkMonths { set; get; }
        [Column("EMP_WRK_YR_START")]
        public DateTime? workYrStart { set; get; }
        [Column("EMP_WRK_YR_STOP")]
        public DateTime? workYrStop { set; get; }
        [Column("EMP_DATE_COUNTY")]
        public DateTime? empDateCounty { set; get; }
        [Column("EMP_DATE_CURRENT_POS")]
        public DateTime? empDateCurrentPos { set; get; }
        [Column("EMP_DATE_HIRED")]
        public DateTime? empDateHired { set; get; }
        [Column("EMP_HOURS_WORKED")]
        public decimal? empHoursWorked { set; get; }
        [Column("EMP_HOURS_PAID")]
        public decimal? empHoursPaid { set; get; }
        [Column("EMP_ELG_VAC_TIME")]
        public bool empElgVacTime { set; get; }
        [Column("EMP_ELG_SICK_TIME")]
        public bool EmpElgSickTime { set; get; }
        [Column("EMP_ELG_COMP_TIME")]
        public bool empElgCompTime { set; get; }
        [Column("EMP_ELG_CALAMITY_TIME")]
        public bool empElgCalamityTime { set; get; }
        [Column("EMP_OVERTIME_RATE")]
        public decimal? empOverTimeRate { set; get; }
        [Column("EMP_HOLIDAY_RATE")]
        public decimal? empHolidayRate { set; get; }
        [Column("EMP_VACATION_RATE")]
        public decimal? empVacationRate { set; get; }
        [Column("EMP_SICKTIME_RATE")]
        public decimal? empSicktimeRate { set; get; }

        [Column("EMP_PERSONAL_RATE")]
        public decimal? empPersonalRate { set; get; }
        [Column("EMP_PERSONAL_START_DAYS")]
        public decimal? empPersonalStartDays { set; get; }
        [Column("EMP_VAC_START_DAYS")]
        public decimal? empVacStartDays { set; get; }
        [Column("EMP_SICK_START_DAYS")]
        public decimal? empSickStartDays { set; get; }
        [Column("EMP_COMP_START_DAYS")]
        public decimal? empCompStartDays { set; get; }
        [Column("EMP_CALAMITY_START_DAYS")]
        public decimal? empCalamityStartDays { set; get; }
        [Column("EMP_UNEXCUSED_START_DAYS")]
        public decimal? empUnexcusedStartDays { set; get; }
        [Column("EMP_CONTRACT_DAYS")]
        public int? empContractDays { set; get; }
        [Column("EMP_PAID_HOLIDAYS")]
        public int? empPaidHolidays { set; get; }
        [Column("EMP_TOTAL_HRS_YR")]
        public decimal? EmpTotalHrsYr { set; get; }
        [Column("EMP_HOURLY_RATE")]
        public decimal? empHourlyRate { set; get; }
        [Column("EMP_PAY_TYPE")]
        public int? empPayType { set; get; }
        [Column("EMP_ELG_PERSONAL_TIME")]
        public bool empELgPersonalTime { set; get; }
        [Column("EMP_TOTAL_YEARS")]
        public int? empTotalYears { set; get; }
        [Column("EMP_SALARY")]
        public decimal? empSalary { set; get; }
        [Column("EMP_HOURS_DAY")]
        public decimal? empHoursDays { set; get; }
        [Column("EMP_PAY_SALARY")]
        public decimal? empPaySalary { set; get; }
        [Column("EMP_STEP_DATE")]
        public DateTime? empStepDate { set; get; }
        [Column("EMP_VACA_LIMIT")]
        public decimal? empVacaLimit { set; get; }
        [Column("EMP_SICKTIME_LIMIT")]
        public decimal? empSickTimeLimit { set; get; }
        [Column("EMP_PERSONAL_LIMIT")]
        public decimal? empPersonalLimit { set; get; }
        [Column("EMP_TEMP")]
        public bool empTemp { set; get; }
        [Column("PREV_YEAR_EMP_SALARY")]
        public decimal? prevYearEmpSalary { set; get; }
        [Column("PREV_YEAR_EMP_PAY_SALARY")]
        public decimal? prevYearEmpPaySalary { set; get; }
        [Column("PREV_YEAR_EMP_HOURLY_RATE")]
        public decimal? prevYearEmpHourlyRate { set; get; }
        [Column("EMP_VACATION_YEARS")]
        public decimal? empVacationYears { set; get; }
        [Column("AUTO_RUN")]
        public bool autoRun { set; get; }
        [Column("EMP_VAC_SPEND_DAYS")]
        public decimal? empVacSpendDays { set; get; }
        [Column("EMP_SICK_SPEND_DAYS")]
        public decimal? empSickSpendDays { set; get; }
        [Column("EMP_PERS_SPEND_DAYS")]
        public decimal? empPersSpendDays { set; get; }
        [Column("ISUNION")]
        public bool iSUnion { set; get; }
        [Column("EMP_DATE_LAST")]
        public DateTime? empDateLast { set; get; }
        [Column("FULLTIME")]
        public bool fullTime { set; get; }
        [Column("EEO_JOB_CLASS")]
        public int? eEOJobClass { set; get; }
        [Column("EEO_RACE")]
        public int? eEORace { set; get; }
        [Column("UNLISTED")]
        public bool unlisted { set; get; }
        [Column("BONUS_START")]
        public decimal? bonusStart { set; get; }
        [Column("PRO_START")]
        public decimal? proStart { set; get; }
        [Column("MAX_VACATION")]
        public decimal? maxVaction { set; get; }
        [Column("LONGEVITY")]
        public string? longevity { set; get; }
        [Column("STEP")]
        public string? step { set; get; }
        /*        [Column("HOLIDAY_SCHEDULE1")]
                public bool holidaySchedule1 { set; get; }

                [Column("HOLIDAY_SCHEDULE2")]
                public bool holidaySchedule2 { set; get; }*/
        [Column("PAYROLLGROUP1")]
        public bool payrollGroup1 { set; get; }
        [Column("LWOP_START_DATE")]
        public DateTime? lwopStartDate { set; get; }
        [Column("FMLA_START_DATE")]
        public DateTime? fmlaStartDate { set; get; }
        [Column("UNION_ID")]
        public int? unionID { set; get; }
        [Column("SEASONAL")]
        public bool seasonal { set; get; }
        [Column("LOW_RATE")]
        public decimal? lowRate { set; get; }
        [Column("VACA_CARRYOVER")]
        public decimal? vacaCarryOver { set; get; }
        [Column("EMP_PERSONAL_START")]
        public DateTime? empPeraonalStart { set; get; }
        [Column("EMP_PERSONAL_END")]
        public DateTime? empPersonalEnd { set; get; }
        [Column("EX_EMPT")]
        public bool exEmpt { set; get; }
        [Column("INSURABLE")]
        public bool insurable { set; get; }
        [Column("CLASSIFIED")]
        public bool classified { set; get; }
        /*        [Column("SUPERVISOR")]
                public bool superVisor { set; get; }
                [Column("SUPER_ID")]
                public int? superID { set; get; }*/
        [Column("TERMINATION_DATE")]
        public DateTime? terminationDate { set; get; }
        [Column("NOTES")]
        public string? notes { set; get; }
        [Column("TCMID")]
        public int tcmId { set; get; }
        [Column("WACPERIODIC")]
        public bool wacperiodic { set; get; }
        [Column("WACCONYINUOUS")]
        public bool wacconyinuous { set; get; }
        [Column("VBALANCE")]
        public decimal vBalance { set; get; }
        [Column("SBALANCE")]
        public decimal sBalance { set; get; }
        [Column("YEARS")]
        public string? years { set; get; }
        [Column("DAYS")]
        public string? days { set; get; }
        /*        [Column("DEFAULT_START_TIME")]
                public string? defaultStartTime { set; get; }
                [Column("DEFAULT_END_TIME")]
                public string? defaultEndTime { set; get; }*/
        [Column("LOC_ID")]
        public int locId { set; get; }
        [Column("BUILDING_ID")]
        public int buildingId { set; get; }
        [Column("DAY_ARRAY_CERTIFIED")]
        public bool dayArrayCertified { set; get; }
        [Column("TYPEID")]
        public int typeId { set; get; }
        [Column("SUB")]
        public bool sub { set; get; }
        [Column("HOLIDAY_SID")]
        public int? holidaysID { set; get; }
        /*        [Column("LEAVE_TYPE_ID")]
                public int? leaveTypeID { set; get; }
                [Column("SUPERVISOR_NO")]
                public int? superVisorNo { set; get; }
                
                [Column("LUNCH_START")]
                public string? lunchStart { set; get; }
                [Column("LUNCH_END")]
                public string? lunchEnd { set; get; }
        [Column("OVERTIME_ELEGIBLE")]
        public bool overtimeEligible { set; get; }
        [Column("WEEKENDS")]
        public bool weekends { set; get; }
        [Column("MONDAY")]
        public bool monday { set; get; }
        [Column("TUESDAY")]
        public bool tuesday { set; get; }
        [Column("WEDNESDAY")]
        public bool wednesday { set; get; }
        [Column("THURSDAY")]
        public bool thursday { set; get; }
        [Column("FRIDAY")]
        public bool friday { set; get; }
        [Column("SATURDAY")]
        public bool saturday { set; get; }
        [Column("SUNDAY")]
        public bool sunday { set; get; }
        [Column("SUP_GROUP_NO")]
        public string? supGroupNo { set; get; }
        [Column("AM_PM_END")]
        public string? amPmEnd { set; get; }
        [Column("AM_PM_START")]
        public string? amPmStart { set; get; }
        [Column("MAX_LUNCH_TIME")]
        public decimal? maxLunchTime { set; get; } */
        [Column("LOGIN_ID")]
        public string? loginId { set; get; }
        /*        [Column("SUPPRESS_TIMECARD")]
                public bool supressTimeCard { set; get; }
                [Column("MONDAY2")]
                public bool monday2 { set; get; }
                [Column("TUESDAY2")]
                public bool tuesday2 { set; get; }
                [Column("WEDNESDAY2")]
                public bool wednesday2 { set; get; }
                [Column("THURSDAY2")]
                public bool thursday2 { set; get; }
                [Column("FRIDAY2")]
                public bool friday2 { set; get; }
                [Column("SATURDAY2")]
                public bool saturday2 { set; get; }
                [Column("SUNDAY2")]
                public bool sunday2 { set; get; }
                [Column("DEFAULT_START_TIME2")]
                public string? defaultStartTime2 { set; get; }
                [Column("DEFAULT_END_TIME2")]
                public string? defaultEndTime2 { set; get; }*/
        [Column("YEARSDD")]
        public string? yearsDD { set; get; }
        [Column("DAYSDD")]
        public string? daysDD { set; get; }
        [Column("ANNIVERSARY_DATEDD")]
        public DateTime? aniversaryDateDD { set; get; }
        [Column("FULL_TIME_HIRE")]
        public DateTime? fullTimeHire { set; get; }
        [Column("EMP_DEPTNO_ID")]
        public int empDeptNo { set; get; }
        [Column("DEFAULT_START_TIME3")]
        public string? defaultStartTime3 { set; get; }
        [Column("DEFAULT_END_TIME3")]
        public string? defaultEndTime3 { set; get; }
        [Column("IsTrulyHourly")]
        public bool isTrulyHourly { set; get; }
        [Column("RUN_PAYROLL_FROM_TIMECARD")]
        public bool runPayrollFromTimecard { set; get; }
        /*        [Column("NonPAIDLUNCH")]
                public bool nonPaidLunch { set; get; }
               
                [Column("SPLIT_SCHEDULE")]
                public bool splitSchedule { set; get; }
                [Column("STARTMON1")]
                public string? startMon1 { set; get; }
                [Column("STARTTUE1")]
                public string? startTue1 { set; get; }
                [Column("STARTWED1")]
                public string? startWed1 { set; get; }
                [Column("STARTTHU1")]
                public string? startThu1 { set; get; }
                [Column("STARTFRI1")]
                public string? startFri1 { set; get; }
                [Column("STARTSAT1")]
                public string? startSat1 { set; get; }
                [Column("STARTSUN1")]
                public string? startSun1 { set; get; }
                [Column("ENDMON1")]
                public string? endMon1 { set; get; }
                [Column("ENDTUE1")]
                public string? endTue1 { set; get; }
                [Column("ENDWED1")]
                public string? endWed1 { set; get; }
                [Column("ENDTHU1")]
                public string? endThu1 { set; get; }
                [Column("ENDFRI1")]
                public string? endFri1 { set; get; }
                [Column("ENDSAT1")]
                public string? endSat1 { set; get; }
                [Column("ENDSUN1")]
                public string? endSun1 { set; get; }

                [Column("STARTMON2")]
                public string? startMon2 { set; get; }
                [Column("STARTTUE2")]
                public string? startTue2 { set; get; }
                [Column("STARTWED2")]
                public string? startWed2 { set; get; }
                [Column("STARTTHU2")]
                public string? startThu2 { set; get; }
                [Column("STARTFRI2")]
                public string? startFri2 { set; get; }
                [Column("STARTSAT2")]
                public string? startSat2 { set; get; }
                [Column("STARTSUN2")]
                public string? startSun2 { set; get; }
                [Column("ENDMON2")]
                public string? endMon2 { set; get; }
                [Column("ENDTUE2")]
                public string? endTue2 { set; get; }
                [Column("ENDWED2")]
                public string? endWed2 { set; get; }
                [Column("ENDTHU2")]
                public string? endThu2 { set; get; }
                [Column("ENDFRI2")]
                public string? endFri2 { set; get; }
                [Column("ENDSAT2")]
                public string? endSat2 { set; get; }
                [Column("ENDSUN2")]
                public string? endSun2 { set; get; }*/
        [Column("EVAL_DATE")]
        public DateTime? evalDate { set; get; }
        [Column("EVAL_NOTICE_SENT_DATE")]
        public DateTime? evalNoticeSentDate { set; get; }
        [Column("EVAL_COMPLETION_DATE")]
        public DateTime? evalCompletionDate { set; get; }
        /*        [Column("PRint?_TIMESHEET")]
                public bool print?Timesheet { set; get; }

                [Column("STARTMON3")]
                public string? startMon3 { set; get; }
                [Column("STARTTUE3")]
                public string? startTue3 { set; get; }
                [Column("STARTWED3")]
                public string? startWed3 { set; get; }
                [Column("STARTTHU3")]
                public string? startThu3 { set; get; }
                [Column("STARTFRI3")]
                public string? startFri3 { set; get; }
                [Column("STARTSAT3")]
                public string? startSat3 { set; get; }
                [Column("STARTSUN3")]
                public string? startSun3 { set; get; }
                [Column("ENDMON3")]
                public string? endMon3 { set; get; }
                [Column("ENDTUE3")]
                public string? endTue3 { set; get; }
                [Column("ENDWED3")]
                public string? endWed3 { set; get; }
                [Column("ENDTHU3")]
                public string? endThu3 { set; get; }
                [Column("ENDFRI3")]
                public string? endFri3 { set; get; }
                [Column("ENDSAT3")]
                public string? endSat3 { set; get; }
                [Column("ENDSUN3")]
                public string? endSun3 { set; get; }
                [Column("TRACK_LUNCH_HOURS")]
                public bool trackLunchHours { set; get; }*/
        [Column("ORIGINAL_HIRED_DATE")]
        public DateTime? originalHiredDate { set; get; }
        [Column("REHIRE_DATE")]
        public DateTime? rehireDate { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("JOB_DESCRIPTION_ID")]
        public int? jobID { get; set; }
        public Employee? Employee { set; get; }
    }
}
