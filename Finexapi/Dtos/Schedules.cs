namespace FinexAPI.Dtos
{
    public class Schedules
    {
        public DateTime startDateTime { get; set; }
        public DateTime endDateTime { get; set; }
        public int? employeeId { get; set; }
        public int? jobDescriptionId { get; set; }
        public bool createTimecardEntries { get; set; }
    }
}
