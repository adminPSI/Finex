namespace FinexAPI.Dtos
{
    public class PayrollEmpSetupDto
    {
        public int empId { get; set; }
        public DateTime? fmlaStartDate { get; set; }
        public DateTime? lwopStartDate { get; set; }
        public decimal leaeWOPay { get; set; }
        public decimal fmlaHoursUsed { get; set; }
    }
}
