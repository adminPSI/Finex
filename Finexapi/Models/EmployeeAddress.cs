using FinexAPI.Models.PayrollEmployee;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models
{
    [Table("EMPLOYEE_ADDRESS")]
    public class EmployeeAddress : Common
    {
        [Column("ID")]
        public int Id { set; get; }
        [Column("EMPLOYEE_ID")]
        public int employeeId { set; get; }
        [Column("ADDRESS")]
        public string? address { set; get; }
        [Column("PO_BOX")]
        public string? poBox { set; get; }
        [Column("CITY")]
        public string? city { set; get; }
        [Column("STATE")]
        public string? state { set; get; }
        [Column("ZIP_CODE")]
        public string? zipCode { set; get; }
        //[Column("COUNTY")]
        //public string? county { set; get; }
        [Column("COUNTYID")]
        public int? countyId { set; get; }
        [Column("ACTIVE_IND")]
        public string? activeInd { set; get; }
        [Column("ORG_ACCOUNT_ID")]
        public int? OrgAccountId { set; get; }

        public County? County { set; get; }

    }
}
