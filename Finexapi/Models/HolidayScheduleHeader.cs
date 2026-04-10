using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("HOLIDAY_SCHEDULES")]
    public class HolidayScheduleHeader : Common
    {
        [Column("HOLIDAY_SCHEDULE_ID")]
        public int id { get; set; }

        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("organizationId")]
        public int OrgAccountId { set; get; }

        [Column("HOLIDAY_SCHEDULE_YEAR")]
        public int year { get; set; }

        [Column("HOLIDAY_SCHEDULE_NAME")]
        public string holidayScheduleName { get; set; }
    }
}