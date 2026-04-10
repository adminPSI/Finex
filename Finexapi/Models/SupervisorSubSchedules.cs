using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace FinexAPI.Models
{
    [Table("SUPERVISOR_SUB_SCHEDULES")]
    public class SupervisorSubSchedules : Common
    {
        [Key]
        [Column("SUPERVISOR_SUB_SCHEDULES_ID")]

        public int SupervisorSubScheduleId { get; set; }
        [Column("ORG_ACCOOUNT_ID")]

        public int OrgAccountId { get; set; }
        [Column("SUP_ID")]
        public int? supId { get; set; }

        [Column("SUP_SUB_ID")]
        public int? supSubId { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }
        [Column("END_DATE")]
        public DateTime endDate { get; set; }
        [Column("MEMO")]
        public string? memo { get; set; }
        public bool IsApproved { get; set; }
        public Employee? supervisor { get; set; }
        public Employee? subSupervisor { get; set; }

    }
}
