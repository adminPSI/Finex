using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("PAYROLL_BENEFIT_PACKAGE")]
    public class BenefitPackage : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("BEN_MACRO_NAME")]
        public string? benMacroName { set; get; }
        [Column("ACTIVE_IND")]
        public bool activeInd { set; get; }

    }
}
