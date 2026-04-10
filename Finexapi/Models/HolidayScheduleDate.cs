using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("HOLIDAY_SCHEDULES_DATES")]
    public class HolidayScheduleDate : Common
    {
        [Column("HOLIDAY_SCHEDULE_DATE_ID")]
        public int id { get; set; }

        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("HOLIDAY_SCHEDULE_ID")]
        public int holidayScheduleId { get; set; }

        [Column("HOLIDAY_NAME")]
        public string holidayName { get; set; }

        [Column("HOLIDAY_SCHEDULE_DATE")]
        public DateTime date { get; set; }

        [Column("CALCULATE_VAC_SICK")]
        public bool calculateVacationSick { get; set; }
    }
}
