using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.Email
{
    [Table("IN_Attachment")]
    public class MessageAttachment
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }
        [Column("Message_ID")]
        public int MessageID { get; set; }
        /*        [Column("Attachment")]
                public FormFile? Attachment { get; set; }*/
        [Column("Extension_Type")]
        public string? ExtensionType { get; set; }
        [Column("File_Length")]
        public int FileLength { get; set; }
        [Column("File_Name")]
        public string? FileName { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }
        [ForeignKey("MessageID")]
        public Message? Message { get; set; }

    }
}
