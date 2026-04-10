using FinexAPI.Models.PayrollDefaults;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models
{
    [Table("LEAVE_REQUEST")]
    public class LeaveRequest : Common
    {
        [Column("ID")]
        public int ID { get; set; }
        [Column("ORG_ACCOUNT_ID")]

        [JsonPropertyName("OrgAccId")]
        public int OrgAccountId { set; get; }
        [Column("GROUP_ID")]
        public int? groupId { get; set; }
        [Column("EMP_ID")]
        public int empId { get; set; }
        [Column("IS_EMP_APPROVED")]
        public bool? empApproved { get; set; } ////////add this to sql
        [JsonIgnore]
        public Employee? employee { get; set; }
        [Column("LR_HEADER_ID")]
        public int lRHeaderID { get; set; }
        [Column("LR_DATE")]
        public DateTime? lRDate { get; set; }
        [Column("HOURS")]
        public decimal? hours { get; set; }
        [Column("REASON_FOR_LEAVE_ID")]
        public int reasonForLeaveID { get; set; }
        [Column("LEAVE_TYPE_ID")]
        public int leaveTypeID { get; set; }
        [Column("BEGIN_DATE")]
        public DateTime beginDate { get; set; }
        [Column("END_DATE")]
        public DateTime endDate { get; set; }
        [Column("RETURN_DATE")]
        public DateTime? returnDate { get; set; }
        [Column("REASON_FOR_LEAVE")]

        public string reasonForLeave { get; set; }
        [Column("FMLA_ID")]
        public int? FMLAID { get; set; }
        [Column("JOB_DESCRIPTION_ID")]

        public int? jobDescriptionId { get; set; }
        [Column("SUPERVISOR_ID")]
        public int supervisorID { get; set; }
        [Column("DELETED_DATE")]
        public DateTime? deletedDate { get; set; }
        [Column("DELETED_BY_ID")]
        public string? deletedByID { get; set; }
        [Column("LEAVE_CODE_ID")]
        public int leaveCodeID { get; set; }
        [Column("IS_SUPERVISOR_APPROVED")]
        public bool? isSupervisorApproved { get; set; }
        [Column("REASON_FOR_DISAPPROVAL")]
        public string? reasonForDisApproval { get; set; }
        [Column("SUPERVISOR_ACTION_DATE")]
        public DateTime? supervisorApprovedDate { get; set; }
        [Column("STATUS")]
        public string? status { get; set; }
        public LeaveType? leaveType { get; set; }

        [Column("EMPLOYEE_APPROVED_DATE")]
        public DateTime? employeeApprovedDate { get; set; }

        public CodeValues? FMLAType { get; set; }
        [NotMapped]
        public string? JobDescription { get; set; }

        [Column("AA_ID")]
        public int aaID { get; set; }
        [Column("IS_AA_APPROVED")]
        public bool? isAAApproved { get; set; }
        [Column("AA_APPROVED_DATE")]
        public DateTime? aaApprovedDate { get; set; }

    }
}
