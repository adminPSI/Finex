using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("PROJECT_EQUIPMENT_SETUP")]
    public class ProjectEquipmentSetup : Common
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("NAME")]
        public string name { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }

        [Column("HOURLY_RATE")]
        public decimal hourlyRate { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }

        [Column("END_DATE")]
        public DateTime? endDate { get; set; }

        [Column("NOTES")]
        public string? notes { get; set; }

        [Column("ASSET_ID")]
        public int assetId { get; set; }
    }
}
