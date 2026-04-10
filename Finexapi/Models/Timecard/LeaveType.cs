using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("LEAVE_TYPES")]
    public class LeaveType : Common
    {
        [Column("LEAVE_TYPE_ID")]
        public int id { get; set; }

        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("organizationId")]
        public int OrgAccountId { set; get; }

        [Column("LEAVE_TYPE_DESCRIPTION")]
        public string description { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }

        [Column("ALLOW_EMP_SELECT")]
        public bool allowEmployeeSelect { get; set; }

        [Column("REQUIRE_REASON")]
        public bool isReasonRequired { get; set; }
    }
}