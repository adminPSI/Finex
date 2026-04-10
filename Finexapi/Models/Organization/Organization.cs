using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Organization
{
    [Table("ORGANIZATION")]
    public class Organization : Common
    {
        [Key]
        [Column("ORG_ID")]
        public int Id { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("FEIN")]
        public string? fein { get; set; }
        [Column("PHONE_NUMBER")]
        public string? phoneNumber { get; set; }
        [Column("TAX_EXEMPT_NUM")]
        public string? taxExemptNum { get; set; }
        [Column("ORG_TYPE")]
        public int? orgType { get; set; }
        public OrgnizationLocation? OrgnizationLocation { get; set; }
        public OrgnizationAccount? OrgnizationAccount { get; set; }
    }
}
