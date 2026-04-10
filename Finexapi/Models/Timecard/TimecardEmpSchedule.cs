using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("TIMECARD_EMPLOYEE_SCHEDULE")]
    public class TimecardEmpSchedule : Common
    {
        [Key]
        [Column("TIMECARD_EMPLOYEE_SCHEDULE_ID")]
        public int timecardEmployeeScheduleId { get; set; }

        [Column("TIMECARD_EMPLOYEE_SCHEDULE_NAME")]
        public string timecardEmployeeScheduleName { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int ORG_ID { get; set; }
        [Column("EMP_ID")]
        public int employeeId { get; set; }

        [Column("SCHEDULE_TYPE")]
        public int? scheduleType { get; set; }

    }
}
