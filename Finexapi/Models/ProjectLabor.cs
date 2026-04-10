using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("PROJECT_LABOR")]
    public class ProjectLabor : Common
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("PROJECT_ID")]
        public int projectId { get; set; }

        [Column("START_DATE")]
        public DateTime date { get; set; } = DateTime.Now;

        [Column("EMP_ID")]
        public int empId { get; set; }

        [Column("HOURS")]
        public decimal hours { get; set; }

        [Column("HOURLY_RATE")]
        public decimal hourlyRate { get; set; }

        [Column("TOTAL_COST")]
        public decimal totalCost { get; set; }

        [Column("WORK_TYPE_ID")]
        public int? workTypeId { get; set; }
        public Employee? Employee { get; set; }
        public ProjectWorkTypes? WorkType { get; set; }
    }
}
