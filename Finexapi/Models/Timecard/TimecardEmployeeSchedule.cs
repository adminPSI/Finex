using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("TIMECARD_SCHEDULE")]
    public class TimecardEmployeeSchedule : Common
    {
        [Column("TIMECARD_SCHEDULE_ID")]
        public int id { get; set; }

        [Column("EMP_ID")]
        public int employeeId { get; set; }

        [Column("DAY_OF_WEEK")]
        public int? dayOfWeek { get; set; }  //1 -monday 
        [Column("DAY_OF_MONTH")]
        public int? dayOfMonth { get; set; }

        [Column("START_DATETIME")]
        public DateTime startDateTime { get; set; } //1/01/0001 07:00:00

        [Column("END_DATETIME")]
        public DateTime endDateTime { get; set; }
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
    }
}