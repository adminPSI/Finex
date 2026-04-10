using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("PAYROLL_JOB_CLASSIFICATION")]
    public class JobClassification : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORG_ID { get; set; }
        [Column("JOB_CLASSIFICATION")]
        public string name { get; set; }
        [Column("ACTIVE_IND")]
        public string inactive { get; set; }

    }
}
