using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("UploadDocument")]
    public class UploadDocument
    {
        [Column("Document_ID")]
        public int Id { get; set; }
        [NotMapped]
        public string fileData { get; set; }

        [Column("Document_Path")]
        public string fileName { get; set; }


        [Column("Document_Name")]
        public string docName { get; set; }

        [Column("Document_Type")]
        public string fileType { get; set; }
        [Column("Document_Description")]
        public string? fileDesc { get; set; }

        [Column("Created_Date")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgId")]
        public int OrgAccountId { set; get; }
    }
}