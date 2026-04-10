using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("TIMECARD_HEADERS")]
    public class TimeCardHeaders : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }
        [Column("HR_APPROVAL_DATE")]
        public DateTime? hRApprovalDate { get; set; }
        [Column("EMP_ID")]
        public int empID { get; set; }
        [Column("PAYROLL_DATE")]
        public DateTime? payRollDate { get; set; }
        [Column("START_DATE")]
        public DateTime startDate { get; set; }
        [Column("END_DATE")]
        public DateTime? endDate { get; set; }
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("OrgAccId")]
        public int OrgAccountId { set; get; }
        [Column("EMP_APPROVAL_DATE")]
        public DateTime? empApprovalDate { get; set; }
        [Column("SUP_APPROVAL_DATE")]
        public DateTime? supApprovalDate { get; set; }
        [Column("EMP_APPROVED")]
        public bool? empApproved { get; set; }
        [Column("HR_APPROVED")]
        public bool? hRApproved { get; set; }
        [Column("SUP_APPROVED")]
        public bool? supApproved { get; set; }
        [Column("SUP_APPROVED_ID")]
        public int? supApprovedID { get; set; }
        //[Column("EMP_APPROVED_ID")]
        //public int EmpApprovedID { get; set; }        ////////////////////
        [Column("HR_APPROVED_ID")]
        public int? hRApprovedID { get; set; }
        [Column("EMP_TIME_STAMP")]
        public DateTime? empTimeStamp { get; set; }
        [Column("HR_TIME_STAMP")]
        public DateTime? hRTimeStamp { get; set; }
        [Column("SUP_TIME_STAMP")]
        public DateTime? supTimeStamp { get; set; }
        [JsonIgnore]
        public List<TimeCards>? TimeCards { get; set; }

    }
}
