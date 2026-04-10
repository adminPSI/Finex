using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.PurchaseOrder
{
    [Table("COUNTYPODETAILS")]
    public class CountyPODetails : Common
    {
        //11/28/2023
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Column("POID")]
        public int? poId { get; set; }

        [Column("POCACID")]
        public int pocacid { get; set; }

        [Column("POVENDORNO")]
        public int? poVendorNo { get; set; }

        [Column("PODELIVERTO")]
        public int? poDeliverTo { get; set; }

        [Column("POATTENTION")]
        public int? poAttention { get; set; }

        [Column("POATTENTIONVALUE")]
        public string? poAttentionValue { get; set; }

        [Column("PODIRECTINQ")]
        public int? poDirectInq { get; set; }

        [Column("DEPUTYID")]
        public int? deputyID { get; set; }

        [Column("LOCALPONO")]
        public string? localPONo { get; set; }

        [Column("CARRYOVER")]
        public bool? carryOver { get; set; }

        [Column("POPRINTED")]
        public bool? poPrinted { get; set; }

        [Column("POCOMPLETE")]
        public bool? poComplete { get; set; }

        [Column("RECURRING")]
        public bool? recurring { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

        [ForeignKey("poId")]
        public CountyPO? CountyPO { get; set; }

        [ForeignKey("poVendorNo")]
        public Vendor? Vendor { get; set; }
        public AccountingCode? AccountingCode { get; set; }
    }
}
