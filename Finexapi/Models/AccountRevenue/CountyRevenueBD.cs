using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.AccountRevenue
{
    [Table("COUNTY_REVENUE_BD")]
    public class CountyRevenueBD : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }
        [Column("REV_BD_AMOUNT")]
        public decimal? rev_BD_Amount { get; set; }
        [Column("REV_BD_CHECK_NO")]
        public string? rev_BD_Check_No { get; set; }
        [Column("REV_BD_CAC")]
        public int? rev_BD_CAC { get; set; }
        [Column("Rev_BD_IHAC")]
        public string? rev_BD_IHAC { get; set; }
        [Column("REV_BD_TYPE")]
        public int? rev_BD_Type { get; set; }
        [Column("Rev_BD_SACR")]
        public string? rev_BD_SACR { get; set; }
        [Column("REV_ID")]
        public int? rev_ID { get; set; }
        [Column("REV_DATE")]
        public DateTime? rev_Date { get; set; }
        [Column("BDDESCRIPTION")]
        public string? bdDescription { get; set; }
        [Column("INVOICE_ID")]
        public int? invoiceId { get; set; }
        [Column("CERTLICENSENO")]
        public string? certLicenseNo { get; set; }
        [Column("RECIEPTLINEID")]
        public int? recieptLineID { get; set; }
        [Column("CUSTOMERID")]
        public int? customerID { get; set; }
        [Column("INVOICELINEID")]
        public int? invoiceLineID { get; set; }

        [Column("PAYIN")]
        public string? payIn { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }

        [Column("PROJECTID")]
        public int? ProjectID { get; set; }
        [Column("OTHERDESCRIPTIONID")]
        public int? OtherDescriptionID { get; set; }
        /* [Column("MODIFIEDWHEN")]
         public DateTime? ModifiedWhen { get; set; }
         [Column("MODIFIEDBY")]
         public string? ModifiedBy { get; set; }*/

        [ForeignKey("rev_ID")]
        public CountyRevenue? CountyRevenue { get; set; }

        [ForeignKey("rev_BD_CAC")]
        public AccountingCode? CountyRevenueCode { get; set; }
        public AccountReceivables? AccountReceivables { get; set; }
    }
}
