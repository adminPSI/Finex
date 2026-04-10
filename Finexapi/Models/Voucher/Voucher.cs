using FinexAPI.Models.PurchaseOrder;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Voucher
{
    [Table("VOUCHER")]
    public class Voucher : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("PO_ID")]
        public int? poId { get; set; }

        [Column("IHPO_ID")]
        public int? ihpoId { get; set; }

        [Column("VOUCHER_AMOUNT")]
        public decimal? voucherAmount { get; set; }
        [Column("VOUCHER_BALANCE")]
        public decimal? voucherBalance { get; set; }
        [Column("VOUCHER_INVOICE")]
        public string? voucherInvoice { get; set; }
        [Column("VOUCHER_DATE")]
        public DateTime? voucherDate { get; set; }
        [Column("VOUCHER_PRINT")]
        public bool voucherPrint { get; set; }
        [Column("PO_CAC_ID")]
        public int? poCACId { get; set; }
        [Column("VENDOR_NO")]
        public int? vendorNo { get; set; }
        [Column("VOUCHER_WRITTEN_DATE")]
        public DateTime voucherWrittenDate { get; set; }
        [Column("VOUCHER_VOUCH_NO")]
        public string? voucherVouchNo { get; set; }
        [Column("1099")]
        public bool v1099 { get; set; }
        [Column("INVOICE_DATE")]
        public DateTime? invoiceDate { get; set; }
        [Column("POSTED")]
        public bool posted { get; set; }
        [Column("YEAR_CLOSE")]
        public bool yearClose { get; set; }
        [Column("WARRANT_NO")]
        public string? warrantNo { get; set; }
        [Column("WARRANT_DATE")]
        public DateTime? warrantDate { get; set; }
        [Column("MAILED_DATE")]
        public DateTime? mailedDate { get; set; }
        [Column("TRACK1099")]
        public bool track1099 { get; set; }
        [Column("FINAL_VOUCHER")]
        public bool finalVoucher { get; set; }
        [Column("REQ_NO")]
        public int? reqNo { get; set; }
        [Column("AP_DATE")]
        public DateTime? apDate { get; set; }
        [Column("DATE_CLEARED")]
        public DateTime? dateCleared { get; set; }
        [Column("VOIDED")]
        public bool voided { get; set; }
        [Column("DATE_RECIEVED")]
        public DateTime? dateReceived { get; set; }
        [Column("PRIOR_YEAR_OBLIGATION")]
        public bool priorYearObligation { get; set; }
        [Column("APPROVED")]
        public bool approved { get; set; }
        [Column("DISAPPROVED")]
        public bool disapproved { get; set; }
        [Column("DISAPPROVAL_MEMO")]
        public string? disapprovedMemo { get; set; }
        [Column("CORRECTED")]
        public bool corrected { get; set; }
        [Column("CHECKEDOUTBYWHOID")]
        public int checkDoutbyWoId { get; set; }
        [Column("NOW_AND_THEN")]
        public bool nowAndThen { get; set; }
        [Column("TRANS_CODE")]
        public string? transCode { get; set; }
        [Column("CLAIM_NUMBER")]
        public string? claimNumber { get; set; }
        [Column("SUPER_DATE")]
        public DateTime? superDate { get; set; }
        [Column("SUPER_ID")]
        public int superId { get; set; }
        [Column("SUPER_DISAPPROVED")]
        public bool superDisapproved { get; set; }
        [Column("SUPER_CORRECTED")]
        public bool superCorrected { get; set; }
        [Column("FISCALDATE")]
        public DateTime? fiscalDate { get; set; }
        [Column("REMOVEDFROMPRINTQUEBYWHOID")]
        public int removedFromPrintQuebyWhoId { get; set; }
        [Column("VOUCHER_DESCRIPTION")]
        public string? voucherDescription { get; set; }
        [Column("PREPAID")]
        public bool prepaid { get; set; }
        [Column("POST_DATE")]
        public DateTime? postDate { get; set; }
        [Column("APPROVAL_DATE")]
        public DateOnly? approvalDate { get; set; }
        //   [NotMapped]
        //    public string VendorName { get; set; }
        public Vendor? vendor { set; get; }
        public CountyPO? CountyPO { get; set; }
        public AccountingCode? accountingCode { get; set; }
    }
}
