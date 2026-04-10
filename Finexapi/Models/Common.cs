using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    public class Common
    {
        //11/28/2023
        [Column("CREATED_BY")]
        public string? createdBy { get; set; }
        [Column("CREATED_DATE")]
        public DateTime? createdDate { get; set; }
        [Column("MODIFIED_BY")]
        public string? modifiedBy { get; set; }
        [Column("MODIFIED_DATE")]
        public DateTime? modifiedDate { get; set; }
    }
}
