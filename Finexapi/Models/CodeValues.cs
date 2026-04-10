using FinexAPI.Models.IHPOs;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("CODE_VALUES")]
    public class CodeValues
    {
        [Column("CODE_VALUE_ID")]
        public int Id { get; set; }

        [Column("CODE_TYPE_ID")]
        public int CODE_TYPE_ID { get; set; }

        [Column("VALUE")]
        public string value { get; set; }
        [Column("DESCRIPTION")]
        public string description { get; set; }

        [ForeignKey("CODE_TYPE_ID")]
        public CodeTypes? CodeTypes { get; set; }

        
    }
}
