using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.SAC
{
    [Table("STATEACCOUNTCODEDETAILS")]
    public class StateAccountCodeDetails
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Column("TYPE")]
        public string type { get; set; }

        [Column("STATEACCOUNTDESC")]
        public string? stateAccountDesc { get; set; }

        [Column("STATEACCOUNTCODE")]
        public string? stateAccountCode { get; set; }

        [Column("PAGEID")]
        public int? pageId { get; set; }
        [Column("NEWSAC")]
        public bool NewSAC { get; set; }

        [Column("ORGTYPEID")]
        public int? OrgTypeId { get; set;}
        [Column("EXPENSEREVENUEIND")]
        public int? ExpenseRevenueInd { get; set; }

    }
}
