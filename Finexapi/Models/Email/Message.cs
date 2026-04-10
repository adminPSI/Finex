using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FinexAPI.Models.Email
{
    [Table("IN_Messages ")]
    public class Message
    {
        [Key]
        [Column("Message_ID")]
        public int MessageID { get; set; }
        [Column("Msg_From")]
        public string? MsgFrom { get; set; }
        [Column("Msg_To")]
        public string? MsgTo { get; set; }
        [Column("Msg_CC")]
        public string? MsgCC { get; set; }
        [Column("Msg_BCC")]
        public string? MsgBCC { get; set; }
        [Column("Msg_Body")]
        public string? MsgBody { get; set; }
        [Column("Msg_Subject")]
        public string? MsgSubject { get; set; }
        [Column("When_Sent")]
        public DateTime? WhenSent { get; set; }
        [Column("When_Received")]
        public DateTime? WhenReceived { get; set; }
        /*        [Column("Attachment")]
                public FormFile? Attachment { get; set; }*/
        [Column("Extension_Type")]
        public string? ExtensionType { get; set; }
        [Column("File_Length")]
        public string? FileLength { get; set; }
        [Column("File_Name")]
        public string? FileName { get; set; }
        [Column("Report_Server")]
        public bool ReportServer { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }

        public List<MessageAttachment>? Attachments { get; set; }
    }
}
