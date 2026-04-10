using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.IHPOs
{
    [Table("IHPOAPPROVAL")]
    public class IHPOApproval : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("REQID")]
        public int? reqID { get; set; }

        [Column("REQ_APPROVED_ROLE")]
        public string? reqApprovedRole { get; set; }

        [Column("REQ_COMMENT")]
        public string? reqComment { get; set; }



        [Column("REQ_APPROVEDBY")]
        public int? reqApprovedBy { get; set; }

        [Column("REQ_STATUS")]
        public bool? reqStatus { get; set; }

        [Column("REQ_STATUS_MESSAGE")]

        public string? reqStatusMessage { get; set; }
        [NotMapped]
        public bool selfApprove { get; set; }

        [ForeignKey("reqID")]
        public IHPO? IHPO { get; set; }


    }
}


