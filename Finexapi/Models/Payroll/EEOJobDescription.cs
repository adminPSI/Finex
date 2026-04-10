using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("EEO_JOB_DESCRIP")]
    public class EEOJobDescription
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORG_ID { get; set; }
        [Column("EEO_JOB_DESCRIP")]
        public string Description { get; set; }
        [Column("ACTIVE_IND")]
        public string Inactive { get; set; }
    }
}
