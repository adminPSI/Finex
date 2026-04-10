using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Voucher
{
    [Table("VOUCHER_IHPO")]
    public class VoucherIHPO
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }
        [Column("VOUCHER_ID")]
        public int? VoucherID { get; set; }
        [Column("IHPOLINE_ID")]
        public int? IHPOLineID { get; set; }
        [Column("VOUCHER_IHPOLINE_ID")]
        public int? VoucherIHPOLineID { get; set; }
        
        [Column("QUANTITY_REC")]
        public decimal? QuantityRec { get; set; }
        [Column("VOUCHERED_AMOUNT")]
        public decimal? VoucheredAmont { get; set; }
        [Column("INVOICE_ID")]
        public int? InvoiceID { get; set; }
        [Column("Description")]
        public string? Description { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }
    }
}
