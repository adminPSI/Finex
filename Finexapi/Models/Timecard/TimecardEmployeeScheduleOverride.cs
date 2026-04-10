using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("TIMECARD_SCHEDULE_OVERRIDE")]
    public class TimecardEmployeeScheduleOverride : Common
    {
        [Key]
        [Column("TIMECARD_SCHEDULE_OVERRIDE_ID")]
        public int id { get; set; }

        [Column("EMP_ID")]
        public int employeeId { get; set; }

        //why do we need seperate column for date and time can we have only datetime; can a employee have both override and normal schedule? if so then we might get a conflict if the start date/end date has same normal and override schedule
        [Column("START_DATETIME")]
        public DateTime startDateTime { get; set; }  //01-01-00 07:00:00 

        [Column("END_DATETIME")]
        public DateTime endDateTime { get; set; }   //01-01-00 08:00:00 
        [Column("DAY_OF_WEEK")]
        public int? dayofWeek { get; set; }  //1      //null
        [Column("DAY_OF_MONTH")]
        public int? dayofMonth { get; set; } //null    //30
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [NotMapped]
        public bool? isLeave { get; set; }
        [JsonIgnore]
        public Employee? Employee { get; set; }

        [Column("TIMECARD_EMPLOYEE_SCHEDULE_ID")]
        public int timecardEmployeeScheduleId { get; set; }
        [Column("JOB_ID")]
        public int? jobDescriptionId { get; set; }


    }
}