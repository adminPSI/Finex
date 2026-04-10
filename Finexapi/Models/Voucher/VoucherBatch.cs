using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Voucher
{
    [Table("VOUCHER_BATCH")]
    public class VoucherBatch : Common
    {
        [Column("ID")]
        public int ID { get; set; }
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("DATE_WRITTEN")]
        public DateOnly? dateWritten { get; set; }
        [Column("DATE_POSTED")]
        public DateOnly? datePosted { get; set; }
        [Column("DATE_PRINTED")]
        public DateOnly? datePrinted { get; set; }
        [Column("APPROVAL_DATE")]
        public DateOnly? approvalDate { get; set; }

    }
}
