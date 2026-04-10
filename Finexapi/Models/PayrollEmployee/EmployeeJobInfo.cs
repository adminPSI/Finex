using FinexAPI.Models.PayrollDefaults;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.PayrollEmployee
{
    [Table("EMPLOYEE_JOB_INFO")]
    public class EmployeeJobInfo : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("EMP_ID")]
        public int empId { set; get; }
        [Column("JOB_DESCRIPTION_ID")]
        public int? jobDescripId { set; get; }
        [Column("JOB_CLASS_ID")]
        public int? jobClassId { set; get; }
        [Column("START_DATE")]
        public DateTime? startDate { set; get; }
        [Column("END_DATE")]
        public DateTime? endDate { set; get; }
        [Column("PRIMARY_JOB")]
        public bool? primaryJob { set; get; }
        public PayrollJobDescription? JobDescription { set; get; }
    }


}
