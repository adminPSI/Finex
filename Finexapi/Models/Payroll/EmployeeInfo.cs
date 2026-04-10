using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("EMPLOYEE_INFO")]
    public class EmployeeInfo
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("EMPLOYEE_ID")]
        public int EmployeeId { get; set; }
        [Column("AKA")]
        public string AKA { get; set; }
        [Column("DATE_OF_BIRTH")]
        public DateTime DateOfBirth { get; set; }
        [Column("GENDER")]
        public string Gender { get; set; }
        [Column("ST_ADDRESS")]
        public string StAddress { get; set; }
        [Column("PO_BOX")]
        public string PoBox { get; set; }
        [Column("CITY")]
        public string City { get; set; }
        [Column("STATE")]
        public string Sate { get; set; }
        [Column("ZIP")]
        public string Zip { get; set; }
        [Column("COUNTY")]
        public int County { get; set; }
        [Column("TELEPHONE_NUMBER")]
        public string TelephoneNumber { get; set; }
        [Column("PICTURE_PATH")]
        public string PicturePath { get; set; }
        [Column("SPOUSE_NAME")]
        public string SpouseName { get; set; }
        [Column("PICTURE_NAME")]
        public byte[] PictureName { get; set; }
    }
}
