using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("PROJECT_MATERIAL")]
    public class ProjectMaterial : Common
    {
        [Column("Id")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("PROJECT_ID")]
        public int projectId { get; set; }

        [Column("START_DATE")]
        public DateTime date { get; set; }

        [Column("MATERIAL")]
        public string material { get; set; }

        [Column("VENDOR_ID")]
        public int vendorId { get; set; }

        [Column("QUANTITY")]
        public decimal quantity { get; set; }

        [Column("UNIT_COST")]
        public decimal unitCost { get; set; }

        [Column("TOTAL_COST")]
        public decimal totalCost { get; set; }

        [Column("NOTES")]
        public string? notes { get; set; }

        [Column("WORK_TYPE_ID")]
        public int? workTypeId { get; set; }
        public Vendor? Vendor { get; set; }
        public ProjectWorkTypes? WorkType { get; set; }
    }
}
