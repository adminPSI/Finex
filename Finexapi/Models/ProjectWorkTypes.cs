using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("PROJECT_WORK_TYPES")]
    public class ProjectWorkTypes : Common
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("TYPE")]
        public string type { get; set; }

    }
}