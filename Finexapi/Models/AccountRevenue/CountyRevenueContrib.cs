using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.AccessControl;

namespace FinexAPI.Models.AccountRevenue
{
    [Table("COUNTY_REVENUE_CONTRIB")]
    public class CountyRevenueContrib : Common

    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("REVENUE_CONTIB")]
        public string revenue_Contib { get; set; }

        [Column("ADDRESS")]
        public string? address { get; set; }

        [Column("CITY")]
        public string? city { get; set; }
        [Column("STATE")]
        public string? state { get; set; }
        [Column("ZIP")]
        public string? zip { get; set; }
        [Column("PHONE")]
        public string? phone { get; set; }
        [Column("ATTENTO")]
        public string? attenTo { get; set; }

        [Column("INACTIVE")]
        public bool? inactive { get; set; }

        [Column("VENDORNO")]
        public string? vendorNo { get; set; }

        [Column("ADDRESSLINE2")]
        public string? addressLine2 { get; set; }

        [Column("CLIENTID")]
        public int? clientID { get; set; }
        [Column("PAYEEADDRESS")]
        public bool? payeeAddress { get; set; }

        [Column("CONSUMERADDRESS")]
        public bool? consumerAddress { get; set; }

        [Column("EMAIL")]
        public string? eMail { get; set; }

        [Column("EMAIL2")]
        public string? email2 { get; set; }

        [Column("PHONENUMBER")]
        public string? honeNumber { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

    }
}
