using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.IHPOs
{
    [Table("IHPODETAILS")]
    public class IHPODetails : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("REQID")]
        public int? reqID { get; set; }

        [Column("REQVENDOR")]
        public int? reqVendor { get; set; }

        [Column("REQIHAC")]
        public string? reqIHAC { get; set; }
        [Column("DELIVERTOID")]
        public int? deliverToID { get; set; }
        [Column("REQCATALOGNO")]
        public string? reqCatalogNo { get; set; }
        [Column("PRNO")]
        public Int16? pRno { get; set; }
        [Column("REQPRINT")]
        public bool? reqPrint { get; set; }
        [Column("COMBINE")]
        public bool? combine { get; set; }
        [Column("WHOID")]
        public int? whoID { get; set; }
        [Column("FISCALDATE")]
        public DateTime? fiscalDate { get; set; }
        [Column("SUPERDATE")]
        public DateTime? superDate { get; set; }
        [Column("REQREQUESTBY")]
        public string? reqRequestBy { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

        [ForeignKey("reqID")]
        public IHPO? IHPO { get; set; }

        [ForeignKey("reqVendor")]
        public Vendor? Vendor { get; set; }
    }
}
