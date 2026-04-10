using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("IHC_SUB_ACCOUNT")]
    public class IHCSubAccount : Common
    {
        [Column("IHC_SUB_ACCOUNT")]
        public int Id { get; set; }
        [Column("CODE")]
        public string code { get; set; }

        [Column("IHC_SUB_ACCOUNT_DESCRIPTION")]
        public string description { get; set; }

        [Column("REV_CHECK")]
        public string revenueCheck { get; set; }

        [Column("EXP_CHECK")]
        public string expenseCheck { get; set; }

        [Column("SALARYBENEFITS")]
        public string salaryBenefits { get; set; }

        [Column("ACTIVE_IND")]
        public string isActive { get; set; }

        [Column("STARTDATE")]
        public DateTime startDate { get; set; }

        [Column("ENDDATE")]
        public DateTime? endDate { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { get; set; }
    }
}