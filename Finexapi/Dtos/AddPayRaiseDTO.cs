using Newtonsoft.Json.Linq;

namespace FinexAPI.Dtos
{
    public class AddPayRaiseDTO
    {
        public Decimal? FlatRaise { get; set; }
        public Decimal? PercentRaise { get; set; }
        public String? GroupNo { get; set; }
        public DateTime? HiredOnOrBeforeDate { get; set; }
        public Int32? PrimaryJobDescriptionId { get; set; }
        public DateTime? TakesEffectOn { get; set; }

    }
    public class ApplyPayRaiseDTO
    {
        public DateTime TakesEffectOn { get; set; }
        public required List<SalaryRaiseDTO> SalaryData { get; set; }
    }

    public class SalaryRaiseDTO { 
        public int Id { get; set; }
        public string PayType { get; set; }
        public Decimal ProposedSalary { get; set; }
        public Decimal? ProposedPayDaySalary { get; set; }
        public Decimal ProposedHourlyRate { get; set; }
    }
    public class PayRaiseListResponse {
        public PayRaiseListResponse() { 
            Data = new List<AddPayRaiseListDTO> ();
        }
        public DateTime TakesEffectOn { get; set; }
        public List<AddPayRaiseListDTO> Data { get; set; }
    }
    public class AddPayRaiseListDTO
    {
        private decimal? currentHourly = 0;
        private decimal? percentIncrease = 0;
        private decimal? proposedSalary = 0;
        private decimal? proposedHourly = 0;
        private decimal? currentSalary = 0;
        private decimal? proposedPayDaySalary = 0;
        
        public int SalaryID { get; set; }
        public int PayType { get; set; }
        public string PayTypeValue { get; set; }
        public string EmployeeName { get; set; }
        public int EmployeeID { get; set; }
        public string PrimaryJob { get; set; }
        public int PrimaryJobID { get; set; }
        public string GroupNo { get; set; }
        public DateTime? DateHired { get; set; }
        public decimal? CurrentSalary { get { return Math.Round(currentSalary ?? 0,2); } set { currentSalary = value; } }
        public decimal? CurrentHourly { get { return Math.Round(currentHourly ?? 0, 2); } set { currentHourly = value; } }
        public decimal? PercentIncrease { get { return Math.Round(percentIncrease ?? 0, 2); } set { percentIncrease = value; } }
        public decimal? ProposedSalary { get { return Math.Round(proposedSalary ?? 0, 2); } set { proposedSalary = value; } }
        public decimal? ProposedHourly { get { return Math.Round(proposedHourly ?? 0, 2); } set { proposedHourly = value; } }
        public decimal? ProposedPayDaySalary { get { return Math.Round(proposedPayDaySalary ?? 0, 2); } set { proposedPayDaySalary = value; } }
        
    }
}

