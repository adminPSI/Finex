using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("PROGRAM")]
    public class IHCProgram : Common
    {
        [Column("ID")]
        public int Id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { get; set; }
        [Column("CODE")]
        public string code { get; set; }

        [Column("DESCRIPTION")]
        public string description { get; set; }

        [Column("REV_CHECK")]
        public string revenueCheck { get; set; }

        [Column("EXP_CHECK")]
        public string expenseCheck { get; set; }

        [Column("SALARY_BENEFITS")]
        public string salaryBenefits { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }

        [Column("START_DATE")]
        public DateTime startDate { get; set; }

        [Column("END_DATE")]
        public DateTime? endDate { get; set; }

    }
}