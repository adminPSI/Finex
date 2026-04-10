using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("TIMECARD_EMPLOYEE_DETAILS")]
    public class TimecardEmployeeDetails : Common
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }
        [Column("EMP_ID")]
        public int empId { get; set; }

        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("OrgAccId")]
        public int OrgAccountId { set; get; }

        [Column("GROUP_NUMBER")]
        public int groupNumber { get; set; }
        [Column("SUPERVISOR_GROUP_NUMBER")]
        public int? supervisorGroupNumber { get; set; }

        [Column("IS_SUPERVISOR")]
        public bool isSupervisor { get; set; }
        [Column("IsPayrollSpecialist")]
        public bool IsPayrollSpecialist { get; set; }

        [Column("IS_SUPPRESSED")]
        public bool isTimecardSuppresed { get; set; }

        [Column("IS_APPOINTING_AUTHORITY")]
        public bool isAppointingAuthorityEnabled { get; set; }

        [Column("IS_TRUE_HOUR")]
        public bool isTrueHourEnalbed { get; set; }

        [Column("IS_NON_PAID_LUNCH")]
        public bool isNonPaidLunchEnabled { get; set; }

        [Column("IS_ALLOTED_LEAVE")]
        public bool isAllotedLeaveEnabled { get; set; }

        [Column("IS_RUN_PAYROLL")]
        public bool isRunPayrollEnabled { get; set; }
        [Column("AUTOPOPULATED_SCHEDULE")]
        public bool autoPopulatedSchedule { get; set; }

        [Column("MAX_LUNCH_TIME", TypeName = "decimal(18,4)")]
        public decimal? maxLunchTime { get; set; }
        [JsonIgnore]
        public Employee? Employee { get; set; }
        //[Column("HOLIDAY_SCHEDULE_YEAR")]
        //public int? holidayScheduleYear { get; set; }
        [Column("HOLIDAY_SCHEDULE_ID")]
        public int? holidayScheduleId { get; set; } 

    }

}