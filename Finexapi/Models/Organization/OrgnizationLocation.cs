using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Organization
{
    [Table("ORGANIZATION_LOCATION")]
    public class OrgnizationLocation : Common
    {
        [Key]
        [Column("LOCATION_ID")]
        public int Id { get; set; }
        [Column("ORG_ID")]
        public int orgId { get; set; }
        [Column("NAME")]
        public string name { get; set; }
        [Column("LOCATION_NUM")]
        public string? locationNum { get; set; }
        [Column("COUNTY_NAME")]
        public string? countyName { get; set; }
        [Column("ADDRESS_LINE")]
        public string? addressLine { get; set; }
        [Column("CONTACT_NUMBER")]
        public string? contactNumber { get; set; }
        [Column("CITY")]
        public string? city { get; set; }
        [Column("STATE")]
        public string? state { get; set; }
        [Column("ZIP_CODE")]
        public string? zipCode { get; set; }
        [ForeignKey("orgId")]
        public Organization? Organization { get; set; }
    }
}
