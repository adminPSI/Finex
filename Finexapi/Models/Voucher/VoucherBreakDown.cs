using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Voucher
{
    [Table("VOUCHER_BREAKDOWNS")]
    public class VoucherBreakDown : Common
    {
        [Column("ID")]
        public int ID { get; set; }
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("OrgId")]
        public int OrgAccountId { set; get; }
        [Column("VOUCHERAMOUNT")]
        public decimal? voucherAmount { get; set; }
        [Column("VOUCHERIHAC")]
        public string? voucherIHAC { get; set; }
        [Column("VOUCHERSAC")]
        public string? voucherSAC { get; set; }
        [Column("VOUCHERID")]
        public int? voucherID { get; set; }
        [Column("VOUCHERPERCENT", TypeName = "decimal(18,4)")]
        public decimal? voucherPercent { get; set; }
        [Column("VOUCHERDATE")]
        public DateTime? voucherDate { get; set; }
        [Column("REQNUMBER")]
        public string? reqNumber { get; set; }
        [Column("PONUMBER")]
        public string? pONumber { get; set; }
        [Column("PRNO")]
        public short? pRno { get; set; }
        [Column("POS")]
        public bool? pos { get; set; }
        [Column("VOUCHERNOTES")]
        public string? voucherNotes { get; set; }
        [Column("FAMRESFAMILY")]
        public int? famResFamily { get; set; }
        [Column("FAMRESCATEGORY")]
        public int? famResCategory { get; set; }
        [Column("FAMRESOTHER")]
        public int? famResOther { get; set; }
        [Column("ICFMR")]
        public int? iCFMR { get; set; }
        [Column("YEARCLOSE")]
        public bool? yearClose { get; set; }
        [Column("ENGPROJECTID")]
        public int? engProjectID { get; set; }
        [Column("ENGFUNDINGSOURCEID")]
        public int? engFundingSourceID { get; set; }
        [Column("ENGWORKORDERID")]
        public int? engWorkOrderID { get; set; }
        [Column("POREQID")]
        public int? pOReqID { get; set; }
        [Column("FUNDID")]
        public int? fundID { get; set; }
        [Column("INDIVIDUALNAME")]
        public string? individualName { get; set; }
        [Column("PREVIOUSYEAREXPENSE")]
        public bool? previousYearExpense { get; set; }
        [Column("FRDATE")]
        public DateTime? frDate { get; set; }
        [Column("TRANSCACID")]
        public int? transCACID { get; set; }
        [Column("FRDATE2")]
        public DateTime? frDate2 { get; set; }
        [Column("INVOICEID")]
        public int? invoiceID { get; set; }

        [Column("DELETEDBY")]
        public string? deletedBy { get; set; }
        [Column("DELETEDDATE")]
        public DateTime? deletedDate { get; set; }

        [Column("IHPOLINEITEMID")]
        public int? IhpoLineItemID { get; set; }
    }
}
