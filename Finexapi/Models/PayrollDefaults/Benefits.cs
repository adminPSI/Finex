using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("PAYROLL_BENEFITS")]
    public class Benefits : Common
    {
        [Column("BENEFITS_ID")]
        public int Id { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [Column("BENEFITS_NAME")]
        public string? benefitsName { set; get; }
        [Column("BENEFITS_TYPE")]
        public int benefitsType { set; get; }
        [Column("BENEFITS_PER_MONTH")]
        public int? benefitsPerMonth { set; get; }
        [Column("AMOUNT", TypeName = "decimal(18,2)")]
        public decimal? amount { set; get; }
        [Column("BENEFITS_PERS")]
        public bool benefitsPers { set; get; }
        [Column("BENEFITS_EXCLUDE")]
        public bool benefitsExclude { set; get; }
        [Column("BENEFITS_PERCENT", TypeName = "decimal(18,2)")]
        public decimal? benefitsPercent { set; get; }
        [Column("INACTIVE")]
        public bool inactive { set; get; }
        [Column("FIRST_PAY_PERIOD")]
        public bool firstPayPeriod { set; get; }
        [Column("SECOND_PAY_PERIOD")]
        public bool secondPayPeriod { set; get; }
        [Column("LAST_PAY_PERIOD")]
        public bool lastPayPeriod { set; get; }
        [Column("FIRST_AND_SECOND_PAY_PERIOD")]
        public bool firstAndSecondPayPeriod { set; get; }
        [Column("FIRST_AND_LAST_PAY_PERIOD")]
        public bool firstAndLastPayPeriod { set; get; }
        [Column("ALL_PAY_PERIODS")]
        public bool allPayPeriods { set; get; }
        [Column("WORKERS_COMP")]
        public bool workersComp { set; get; }
        [Column("MEDICARE")]
        public bool medicare { set; get; }
        [Column("QUATERLY")]
        public bool quaterly { set; get; }
        public BenefitType? BenefitType { set; get; }

        [NotMapped]
        public string? CountyAccountCode { get; set; }
        [NotMapped]
        public int? BenefitPackageLinkID { get; set; }

    }
}
