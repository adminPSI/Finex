using FinexAPI.Models.Payroll;
using FinexAPI.Models.PayrollEmployee;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace FinexAPI.Models
{
    [Table("EMPLOYEES")]
    public class Employee : Common
    {
        [Column("EMP_ID")]
        public int id { get; set; }

        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("ORG_ID")]
        public int OrgAccountId { set; get; }

        [Column("FIRST_NAME")]
        public string firstName { get; set; }

        [Column("LAST_NAME")]
        public string lastName { get; set; }

        [NotMapped]
        public string DisplayName { get { return lastName + ", " + firstName; } }
        [Column("MIDDLE_NAME")]
        public string? middleName { set; get; }
        [Column("ALSO_KNOWN_AS")]
        public string? alsoKnownAs { set; get; }
        [Column("DATE_OF_BIRTHDAY")]
        public DateTime? dateOfBirth { set; get; }
        [Column("GENDER_CODE ")]
        public int? genderCode { set; get; }
        [Column("SSN")]
        public string? ssn { set; get; }
        [Column("EMPLOYEE_NUMBER")]
        public string? employeeNumber { set; get; }
        [Column("GROUP_NUMBER")]
        public string? groupNumber { set; get; }
        [Column("CLOCK_NUMBER")]
        public string? clockNumber { set; get; }
        [Column("AUTO_RUN_PRIMARY_JOB_IND ")]
        public string? autoRunPrimaryJonInd { set; get; }
        [Column("ACTIVE_IND")]
        public string? activeInd { set; get; }
        [Column("SUPERVISOR_IND")]
        public string? supervisorInd { set; get; }
        [Column("EMAIL_ADDRESS")]
        public string emailAddress { set; get; }
        [Column("PERSONAL_EMAIL_ADDRESS")]
        public string? personalEmailAddress { set; get; }
        [Column("HOME_PHONE_NUMBER")]
        public string? homePhoneNumber { set; get; }
        [Column("MOBILE_PHONE_NUMBER")]
        public string? mobilePhoneNumber { set; get; }
        [Column("SPOUSE_NAME")]
        public string? spouseName { set; get; }
        [Column("RACE_CODE")]
        public int raceCode { set; get; }
        [Column("DRIVER_LICENSE_NUMBER")]
        public string? driverLicenseNumber { set; get; }
        [Column("USER_NAME")]
        public string? userName { set; get; }
        [NotMapped]
        public List<PayrollTotalDistribution>? payrollTotalDistributions { set; get; }
        [NotMapped]
        public decimal? total { set; get; }
        public List<EmployeeAddress>? employeeAddresses { set; get; }
    }
}