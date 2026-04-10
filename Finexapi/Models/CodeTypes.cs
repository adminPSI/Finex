using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("CODE_TYPES")]
    public class CodeTypes
    {
        [Column("CODE_TYPE_ID")]
        public int Id { get; set; }
        [Column("DESCRIPTION")]
        public string description { get; set; }
    }
}
