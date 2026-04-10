using FinexAPI.Models.IHPOs;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Voucher
{
    [Table("VOUCHER_INVOICE_LINE_ITEMS")]
    public class VoucherInvoiceLineItem : Common
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("OrgId")]
        public int OrgAccountId { set; get; }
        [Column("VOUCHER_ID")]
        public int voucherID { get; set; }
        [Column("INVOICE_DATE")]
        public DateTime invoiceDate { get; set; }
        [Column("INVOICE_NUMBER")]
        public string invoiceNumber { get; set; }
        [Column("AMOUNT")]
        public decimal amount { get; set; }
        [Column("IHPO_ID")]
        public int? ihpoId { get; set; }
        [Column("DESCRIPTION")]
        public string description { get; set; }
        [Column("SERVICE_START_DATE")]
        public DateTime? serviceStartDate { get; set; }
        [Column("SERVICE_END_DATE")]
        public DateTime? serviceEndDate { get; set; }
        [Column("DELETED_DATE")]
        public DateTime? deletedDate { get; set; }
        [Column("DELETED_USER")]
        public string? deletedUser { get; set; }
        [NotMapped]
        public string? ihpoNumber { get; set; }

        [Column("IHPOLINEITEMID")]
        public int? IhpoLineItemID { get; set; }
    }
}
