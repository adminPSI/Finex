using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.Voucher
{
    [Table("VOUCHER_BATCH_LINK")]
    public class VoucherBatchLink : Common
    {
        [Column("ID")]
        public int ID { get; set; }
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("orgAccountId")]
        public int OrgAccountId { set; get; }
        [Column("BATCH_ID")]
        public int batchId { get; set; }
        [Column("VOUCHER_ID")]
        public int voucherId { get; set; }
    }
}
