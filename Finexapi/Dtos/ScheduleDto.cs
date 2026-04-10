namespace FinexAPI.Dtos
{
    public class ScheduleDto
    {
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set;}
        public int ? ScheduleType { get; set; }
        public List<DayWeek> DayWeeks { get; set; }
        public int ? jobId { get; set; }
    }

    public class DayWeek
    {
        public int Id { get; set; }
        public string Text { get; set; }
    }
}
