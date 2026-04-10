using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.UserManagement
{
    [Table("APIAUTHORIZATION_RESOURCES")]
    public class APIAUTHORIZATIONRESOURCES
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }
        [Column("RESOURCES_ID")]
        public int RESOURCES_ID { get; set; }

        [Column("API_ENDPOINT")]
        public string? API_ENDPOINT { get; set; }
        [Column("API_METHOD")]
        public string? API_METHOD { get; set; }

        [Column("APPLICATIONS_ID")]
        public int? APPLICATIONS_ID { get; set; }
    }
}
