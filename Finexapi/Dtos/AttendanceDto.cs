namespace FinexAPI.Dtos
{
    public class AttendanceDto
    {
        public int AttendanceId { get; set; }
        public int EmpId { get; set; }
        public DateTime AttendanceDate { get; set; }
        public string? LeaveType { get; set; }
        public bool LeaveTypeCheckBox { get; set; }
        public decimal LeaveHours { get; set; }
        public string? Day { get; set; }
        public string? Notes { get; set; }
        public bool familyLeaveAct { get; set; }
        public bool noEmployeeRequest { get;set; }
        public bool wcTrack { get; set;}
        public bool lockedRecord { get; set; }

    }
}
