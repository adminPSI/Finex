using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("ASSET_DEPRECIATION")]
    public class Asset : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }
        [Column("DESCRIPTION")]
        public string? description { get; set; }
        [Column("PURCHASE_DATE")]
        public DateTime? purchaseDate { get; set; }
        [Column("USEFUL_LIFE")]
        public int? usefulLife { get; set; }
        [Column("COST")]
        public decimal? cost { get; set; }
        [Column("DEPRECIATION_AMOUNT")]
        public decimal? depreciationAmount { get; set; }
        [Column("ACCOUNT")]
        public string? account { get; set; }
        [Column("LAST_YEAR_DEPRECIATION")]
        public DateTime? lastYearDepreciation { get; set; }
        [Column("YEAR_REMOVED")]
        public DateTime? yearRemoved { get; set; }
        [Column("PROPERTY_NO")]
        public string? propertyNo { get; set; }
        [Column("SERIAL_NO")]
        public string? serialNo { get; set; }
        [Column("LOCATION")]
        public string? location { get; set; }
        [Column("INVENTORY_NO")]
        public string? inventoryNo { get; set; }
        [Column("ITEM_DESCRIPTION")]
        public string? itemDescription { get; set; }
        [Column("MANUFACTURER")]
        public string? manufacturer { get; set; }
        [Column("FUNDING")]
        public int? funding { get; set; }
        [Column("SUPPLIER")]
        public int? supplier { get; set; }
        [Column("COLOR")]
        public string? color { get; set; }
        [Column("SIZE")]
        public string? size { get; set; }
        [Column("VOUCHER_NO")]
        public string? voucherNo { get; set; }
        [Column("MODEL_NO")]
        public string? modelNo { get; set; }
        [Column("VOUCHER_DATE")]
        public DateTime? voucherDate { get; set; }
        [Column("PO_NUMBER")]
        public string? poNO { get; set; }
        [Column("PO_DATE")]
        public DateTime? poDate { get; set; }
        [Column("COUNTY_NO")]
        public string? countyNo { get; set; }
        [Column("DATE_RECEIVED")]
        public DateTime? dateReceived { get; set; }
        [Column("ASSET_TYPE")]
        public int? assetType { get; set; }
        [Column("ASSET_AREA")]
        public int? assetArea { get; set; }
        [Column("INSTALL_ON")]
        public string? installOn { get; set; }
        [Column("SOURCE")]
        public string? source { get; set; }
        [Column("LEASED")]
        public bool? leased { get; set; }
        [Column("MANUAL")]
        public bool? manual { get; set; }
        [Column("ORIGINAL_DISK")]
        public bool? originalDisk { get; set; }
        [Column("DISK_ON_SITE")]
        public bool? diskOnSite { get; set; }
        [Column("COM_CODE")]
        public string? comCode { get; set; }
        [Column("COMMENTS")]
        public string? comments { get; set; }
        [Column("OTHERS")]
        public bool? others { get; set; }
        [Column("REP_VALUE")]
        public decimal? repValue { get; set; }
        [Column("MEMO")]
        public string? memo { get; set; }
        [Column("PROJECT_CAC")]
        public string? projectCas { get; set; }
        [Column("ACTIVE_IND")]
        public string isActive { get; set; }
        [Column("DISPOSAL_VENDOR")]
        public string? disposalVendor { get; set; }
        [Column("DISPOSAL_PRICE")]
        public decimal? disposalPrice { get; set; }
        [Column("ASSET")]
        public bool assetFlag { get; set; }
        [Column("SALVAGE_VALUE")]
        public decimal? salvageValue { get; set; }
        [Column("INV_CAT_ID")]
        public int? invCatId { get; set; }
        [Column("FIRST_YEAR_TO_DEPRECIATE")]
        public DateTime? firstYearToDepreciate { get; set; }
        [Column("MRDD_NO")]
        public string? mrddNo { get; set; }
        [Column("CISCO_SERVICE_ID")]
        public int? ciscoServiceId { get; set; }
        [Column("CISCO_CONTRACT")]
        public string? ciscoContract { get; set; }
        [Column("CISCO_EXPIRATION_DATE")]
        public DateTime? ciscoExpirationDate { get; set; }
        [Column("DATE_REMOVED")]
        public DateTime? dateRemoved { get; set; }
        [Column("INVENTORY_MEMO")]
        public string? inventoryMemo { get; set; }
        [NotMapped]
        public AssetLocation? AssetLocation { get; set; }
        public Vendor? Vendor { get; set; }
    }
}
