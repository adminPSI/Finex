using FinexAPI.Models.IHPOs;
using FinexAPI.Models.PurchaseOrder;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("VENDOR")]
    public class Vendor : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("NAME")]
        public string name { get; set; }
        [Column("ADDRESS1")]
        public string? address1 { get; set; }
        [Column("ADDRESS2")]
        public string? address2 { get; set; }
        [Column("CITY")]
        public string? city { get; set; }
        [Column("STATE")]
        public string? state { get; set; }
        [Column("ZIP")]
        public string? zip { get; set; }
        [Column("PHONE")]
        public string? phone { get; set; }
        [Column("SAC")]
        public string? sac { get; set; }
        [Column("CAC")]
        public string? cac { get; set; }
        [Column("VENDOR_NO")]
        public string? vendorNo { get; set; }
        [Column("ACCOUNT_NO")]
        public string? accountNo { get; set; }
        [Column("POC")]
        public string? poc { get; set; }
        [Column("TAX_ID")]
        public string? taxId { get; set; }
        [Column("VENDORB_ADDRESS1")]
        public string? vendorBAddress1 { get; set; }
        [Column("VENDORB_ADDRESS2")]
        public string? vendorBAddress2 { get; set; }
        [Column("VENDORB_CITY")]
        public string? vendorBCity { get; set; }
        [Column("VENDORB_STATE")]
        public string? vendorBState { get; set; }
        [Column("VENDORB_ZIP")]
        public string? vendorBZip { get; set; }
        [Column("VENDORB_PHONE")]
        public string? vendorBPhone { get; set; }
        [Column("VENDORCAT")]
        public int? vendorCat { get; set; }
        [Column("1099")]
        public bool? V1099 { get; set; }
        [Column("FAX_NUMBER")]
        public string? faxNumber { get; set; }
        [Column("CUSTOMER_NUM")]
        public string? customerNumber { get; set; }
        [Column("ACTIVE_IND")]
        public string isActive { get; set; }
        [Column("REMITT_INVOICE")]
        public bool? remittInvoice { get; set; }
        [Column("W9Date")]
        public DateTime? wDate { get; set; }
        [Column("REMITT_INVOICE_YN")]
        public string? remittInvoiceYn { get; set; }
        [Column("AFFIDAVIT_DATE")]
        public DateTime? affidavitDate { get; set; }
        [Column("EMAIL_ADDRESS")]
        public string? email { get; set; }
        [Column("MEMO")]
        public string? memo { get; set; }
        [Column("VENDOR_TYPE")]
        public int? vendorTypeId { get; set; }
        public CodeValues? VendorType { get; set; }

        // public List<CountyPODetails>? CountyPODetails { get; set; }

        // public List<IHPODetails>? IHPODetails { get; set; }
    }
}
