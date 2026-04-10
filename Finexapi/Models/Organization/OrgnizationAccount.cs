using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Organization
{
    [Table("ORGANIZATION_ACCOUNT")]
    public class OrgnizationAccount :Common
    {
        [Key]
        [Column("ORG_ACCOUNT_ID")]
        public int Id { get; set; }
        [Column("ORG_ID")]
        public int orgId { get; set; }
        [Column("LOCATION_ID")]
        public int locationId { get; set; }
        [ForeignKey("orgId")]
        public Organization? Organization { get; set; }
    }
}
