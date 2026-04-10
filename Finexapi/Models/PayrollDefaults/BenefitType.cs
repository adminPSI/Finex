using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollDefaults
{
    [Table("BENEFIT_TYPE")]
    public class BenefitType : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("TYPE_OF_BENEFIT")]
        public string? typeOfBenefit { set; get; }
        //[Column("ORG_ACCOUNT_ID")]
        //public int ORG_ID { get; set; }
    }
}
