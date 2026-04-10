using FinexAPI.Models.PurchaseOrder;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.IHPOs
{
    [Table("IHPO")]
    public class IHPO : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("REQNUMBER")]
        public string? reqNumber { get; set; }

        [Column("REQDATE")]
        public DateTime? reqDate { get; set; }

        [Column("REQDATEREQUIRED")]
        public DateTime? reqDateRequired { get; set; }

        [Column("REQDATECOMPLETE")]
        public DateTime? reqDateComplete { get; set; }

        [Column("REQCHECK")]
        public bool? reqCheck { get; set; }

        [Column("REQ_PO_ID")]
        public int? reqPOid { get; set; }

        [Column("REQDESCRIPTION")]
        public string? reqDescription { get; set; }

        [Column("REQPRINT")]
        public bool? reqPrint { get; set; }

        [Column("COMBINE")]
        public bool? combine { get; set; }

        [Column("REQIHPONO")]
        public string? reqIHPONo { get; set; }

        [Column("INHOUSEPOMEMO")]
        public string? inHousePoMemo { get; set; }

        [Column("CORRECTED")]
        public bool? corrected { get; set; }

        [Column("ATTENTO")]
        public string? attenTo { get; set; }

        [Column("CHECKOUT")]
        public bool? checkOut { get; set; }

        [Column("CHECKOUTBYID")]
        public int? checkOutByID { get; set; }

        [Column("PREPAREDBY")]
        public string? preparedBy { get; set; }

        [Column("COMPLETE")]
        public bool? complete { get; set; }

        [Column("STATUS")]
        public int? status { get; set; }

        [Column("SHIPTO")]
        public string? shipTo { get; set; }

        [Column("WORKFLOWSTEPSEQ")]
        public int workflowStepSeq { get; set; }
        [Column("STATUS_MESSAGE")]
        public string? statusMessage { get; set; }
        [ForeignKey("status")]
        public CodeValues? CodeValues { get; set; }
        [ForeignKey("workflowStepSeq")]
        public IHPOWorkflowStep? IHPOWorkflowStep { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        public IHPODetails? IHPODetails { get; set; }
        public IHPOPricing? IHPOPricing { get; set; }
        public List<IHPOApproval>? IHPOApproval { get; set; }

        public IEnumerable<IHPOLineItem>? IHPOLineItem { get; set; }

        public CountyPO? countyPO { get; set; }

    }
}
