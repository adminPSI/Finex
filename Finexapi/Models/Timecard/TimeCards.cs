using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("EMPLOYEE_TIMECARDS")]
    public class TimeCards : Common
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }
        [Column("EMP_ID")]
        public int empID { get; set; }
        [Column("START_DATE_TIME")]
        public DateTime startDateTime { get; set; }
        [Column("END_DATE_TIME")]
        public DateTime? endDateTime { get; set; }
        [Column("LEAVE_TYPE_ID")]
        public int? leaveTypeID { get; set; }
        [Column("LEAVE_CODE_ID")]
        public int? leaveCodeID { get; set; }
        [Column("TIMECARD_HEADER_ID")]
        public int? timeCardHeaderID { get; set; }
        //[JsonIgnore]
        public TimeCardHeaders? TimeCardHeaders { get; set; }
        [Column("HOURS")]
        public double hours { get; set; }
        [Column("HOUR_TYPE_ID")]
        public int hourTypeID { get; set; }
        [Column("JOB_DESCRIPTION_ID")]
        public int? jobID { get; set; }
        [Column("MEMO")]
        public string? memo { get; set; }
        [Column("IS_FMLA")]
        public bool? IsFMLA { get; set; }
        [Column("IHAC")]
        public string? IHAC { get; set; }
        [Column("SUPERVISOR_ID")]
        public int supervisorID { get; set; }
        [Column("DELETED_USER")]
        public string? deletedUser { get; set; }
        [Column("DELETED_DATE")]
        public DateTime? deletedDate { get; set; }
        [Column("SUP_APPROVED")]
        public bool? supApproved { get; set; }
        [Column("SUP_APPROVED_DATE")]
        public DateTime? supApprovedDate { get; set; }
        [Column("FMLA_ID")]
        public int? FMLAID { get; set; }
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("ORG_ACCOUNT_ID")]
        public int OrgAccountId { set; get; }

        [Column("HR_Approved")]
        public bool? HR_Approved { get; set; }
        [Column("HR_Approval_Date")]
        public DateTime? HR_Approval_Date { get; set; }
        [Column("HR_Approved_ID")]
        public int? HR_Approved_ID { get; set; }

        public Employee? Employee { get; set; }

        [NotMapped]
        public string? LeaveType { get; set; }
        [NotMapped]
        public string? HourlyType { get; set; }
        [NotMapped]
        public string? Job { get; set; }
        [NotMapped]
        public bool AddedByOthers { get; set; }

        public CodeValues? FMLAType { get; set; }
    }
}
