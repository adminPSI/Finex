using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("COUNTY")]
    public class County : Common
    {
        [Column("COUNTY_ID")]
        public int Id { set; get; }
        [Column("COUNTY_NAME")]
        public string? countyName { set; get; }
        //[Column("ORG_ACCOUNT_ID")]
        //[JsonPropertyName("orgAccountId")]
        //public int OrgAccountId { set; get; }
    }
}
