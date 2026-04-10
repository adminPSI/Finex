using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.AccountRevenue
{
    [Table("COUNTY_REVENUE_DETAILS")]
    public class CountyRevenueDetails : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("COUNTYREVENUEID")]
        public int? countyRevenueId { get; set; }

        [Column("INVOICENO")]
        public string? invoiceNo { get; set; }

        [Column("REV_CAC")]
        public int? rev_Cac { get; set; }

        [Column("REV_IHAC")]
        public string? rev_Ihac { get; set; }

        [Column("REV_TYPE")]
        public int? rev_Type { get; set; }
        /// <summary>
        /// Used for SAC Pages
        /// </summary>
        [Column("REV_SACR")]
        public string? rev_Sacr { get; set; }

        [Column("PAYOUTNUM")]
        public string? payoutnum { get; set; }

        [Column("NODAYTAPE")]
        public bool? noDayTape { get; set; }

        [Column("PRINTQUE")]
        public bool? printQue { get; set; }

        [ForeignKey("countyRevenueId")]
        public CountyRevenue? CountyRevenue { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }
    }
}
