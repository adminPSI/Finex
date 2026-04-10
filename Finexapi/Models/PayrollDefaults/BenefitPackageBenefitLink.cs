using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("BENEFIT_PACKAGE_BENEFIT_LINK")]
    public class BenefitPackageBenefitLink : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("CAC_ID")]
        public int cacId { set; get; }
        [Column("BENNYID")]
        public int bennyId { set; get; }
        [Column("MACRO_NAME_ID")]
        public int macroNameId { set; get; }
    }
}
