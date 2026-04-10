using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("COUNTY_POTYPE")]
    public class CountyPOType : Common
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Column("POTYPE")]
        public string? poType { get; set; }

        [Column("POTYPEDESC")]
        public string? poTypeDesc { get; set; }

        [Column("AUTOSELECT_VENDOR")]
        public string? AutoSelectVendor { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }


    }
}
