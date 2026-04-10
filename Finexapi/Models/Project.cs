using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    // test the git 
    [Table("PROJECT")]
    public class Project : Common
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("NAME")]
        public required string name { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }

        [Column("END_DATE")]
        public DateTime? endDate { get; set; }

        [Column("WORK_TYPE_ID")]
        public int? workTypeId { get; set; }

        [Column("BUDGET")]
        public decimal budget { get; set; }

        [Column("NOTES")]
        public string? notes { get; set; }

        [Column("LOCATION_ID")]
        public int? locationId { get; set; }

        [NotMapped]
        public decimal materialCost { get; set; }

        [NotMapped]
        public decimal equipmentCost { get; set; }

        [NotMapped]
        public decimal laborCost { get; set; }

        [NotMapped]
        public string? workType { get; set; }

        [NotMapped]
        public string? location { get; set; }
        [NotMapped]
        public decimal totalCost { get; set; }
        [NotMapped]
        public decimal revenue { get; set; }
    }
}
