using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.Payroll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class AttendanceController : BaseController
    {
        private readonly FinexAppContext _payrollContext;
        private readonly ILogger<AttendanceController> _logger;


        public AttendanceController(IHttpContextAccessor httpContextAccessor, FinexAppContext payrollContext,
            ILogger<AttendanceController> logger)
            : base(httpContextAccessor)
        {
            _payrollContext = payrollContext;
            _logger = logger;
        }

        [HttpGet("DatePaid")]
        public async Task<ActionResult<List<PayrollTotals>>> GetPayrollDatePaid()
        {
            try
            {
                var dates = await _payrollContext.PayrollTotals
                    .Select(pr => pr.prDatePaid)
                    .Distinct()
                    .OrderByDescending(date => date)
                    .ToListAsync();
                var formattedDates = dates.Select(date => date.HasValue ? date.Value.ToString("MM-dd-yyyy") : string.Empty).ToList();
                return Ok(formattedDates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace+", "+ex.StackTrace);
                throw;
            }
        }
        [HttpGet("EmployeeByPaidDate")]
        public async Task<ActionResult<List<PayrollTotals>>> EmployeeByPaidDate(DateTime paidDate, int skip = 0, int take = 0, bool desc = false, string sortKey = "modifiedDate", string empId = "",string fullName = "")
        {
            try
            {
                var result = await _payrollContext.PayrollTotals
                    .Include(e => e.employee)
                    .Where(pt => pt.prDatePaid == paidDate
                        && (string.IsNullOrEmpty(empId) || pt.empId.ToString().Contains(empId))
                        && (string.IsNullOrEmpty(fullName) || (pt.employee.firstName.Contains(fullName) || pt.employee.lastName.Contains(fullName))))
                    .Select(pt => new
                    {
                        pt.Id,
                        pt.empId,
                        fullName = pt.employee.lastName+", "+pt.employee.firstName,
                        pt.prStartDate,
                        pt.postDate,
                        pt.prEndDate,
                        pt.prDatePaid,
                        pt.prEmployeeNo,
                        pt.modifiedDate,
                        pt.employee.employeeNumber
                    })
                    .OrderByCustom(sortKey, desc)
                    .ToListAsync();

                var totalCount = result.Count();

                if (take != 0)
                {
                    result = result.Skip(skip).Take(take).ToList();
                }

                return Ok(new { data = result, Total = totalCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
        [HttpPost("UpdateAttendanceBulk")]
        public async Task<ActionResult> UpdateAttendanceBulk(List<AttendanceDto> attendances)
        {
            try
            {
                string result = "";
                foreach (var attendance in attendances)
                {
                    result = await SaveAttendance(attendance);
                    if (result != "")
                        break;
                }

                if (result != "")
                    return BadRequest(new { message = result });

                await _payrollContext.SaveChangesAsync();
                return Ok(new { message = "Attendance entry saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpPost("UpdateAttendance")]
        public async Task<ActionResult> UpdateAttendance(AttendanceDto attendance)
        {
            try
            {
                var result = await SaveAttendance(attendance);

                if (result != "")
                    return BadRequest(new { message = result });

                await _payrollContext.SaveChangesAsync();

                return Ok(new { id = attendance.AttendanceId, message = "Attendance entry saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        private async Task<string> SaveAttendance(AttendanceDto attendance)
        {
            var attendanceEntry = new Attendance();
            attendanceEntry.employeeId = attendance.EmpId;
            attendanceEntry.Id = attendance.AttendanceId;
            attendanceEntry.date = attendance.AttendanceDate.Date;
            attendanceEntry.notes = attendance.Notes;
            attendanceEntry.familyLeaveAct = attendance.familyLeaveAct;
            attendanceEntry.noEmployeeRequest = attendance.noEmployeeRequest;
            attendanceEntry.wcTrack = attendance.wcTrack;
            attendanceEntry.lockedRecord = attendance.lockedRecord;

            if (attendance.LeaveType == null)
            {
                return "Leave Request does not exists";
            }

            var leaveType = await _payrollContext.LeaveTypes.FirstOrDefaultAsync(x => x.description == attendance.LeaveType);

            if (leaveType != null) {
                attendanceEntry.type = leaveType.description;
                attendanceEntry.leaveCodeId = leaveType.id;
            }

            if (attendance.LeaveType == "Sick")
            {
                attendanceEntry.sickLeave = true;
                attendanceEntry.sickLeaveHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Vacation")
            {
                attendanceEntry.vacation = true;
                attendanceEntry.vacationHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Personal")
            {
                attendanceEntry.personalTime = true;
                attendanceEntry.personalTimeHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Comp Earned (1.0)")
            {
                attendanceEntry.compEarned = true;
                attendanceEntry.compEarnedHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Comp Earned (1.5)")
            {
                attendanceEntry.compEarned = true;
                attendanceEntry.compEarnedHours = attendance.LeaveHours * 1.5m;
            }
            if (attendance.LeaveType == "Comp Time Used")
            {
                attendanceEntry.unexcused = true;
                attendanceEntry.unexcusedHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Professional")
            {
                attendanceEntry.proDay = true;
                attendanceEntry.proDayHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Holiday")
            {
                attendanceEntry.holiday = true;
                attendanceEntry.holidayHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Administrative Leave")
            {
                attendanceEntry.other = true;
                attendanceEntry.otherHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Jury Duty")
            {
                attendanceEntry.other = true;
                attendanceEntry.otherHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Military Leave")
            {
                attendanceEntry.other = true;
                attendanceEntry.otherHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Educational Leave")
            {
                attendanceEntry.other = true;
                attendanceEntry.otherHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Bereavement")
            {
                attendanceEntry.other = true;
                attendanceEntry.otherHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Other")
            {
                attendanceEntry.other = true;
                attendanceEntry.otherHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Workers Comp")
            {
                attendanceEntry.workersComp = true;
                attendanceEntry.workersCompHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Wage Continuation")
            {
                attendanceEntry.wageContIn = true;
                attendanceEntry.wageContInHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "LWOP")
            {
                attendanceEntry.leaeWOPay = true;
                attendanceEntry.leaveWOPayHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Bonus Personal Used")
            {
                attendanceEntry.bonusPer = true;
                attendanceEntry.bonusPerUsed = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Bonus Per Earned")
            {
                attendanceEntry.bonusPerE = true;
                attendanceEntry.bonusPerEarned = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Break")
            {
                attendanceEntry.Break = true;
                attendanceEntry.breakHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Calamity")
            {
                attendanceEntry.snow = true;
                attendanceEntry.snowHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Sick Comp")
            {
                attendanceEntry.sickCompensation = true;
                attendanceEntry.sickCompensationHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Reserve Vaca")
            {
                attendanceEntry.reserve = true;
                attendanceEntry.reserveHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Fed Paid Sick")
            {
                attendanceEntry.fedPaidSick = true;
                attendanceEntry.fedPaidSickHours = attendance.LeaveHours;
            }
            if (attendance.LeaveType == "Emergency FMLA")
            {
                attendanceEntry.emergencyFMLA = true;
                attendanceEntry.emergencyFMLAHours = attendance.LeaveHours;
            }

            //Lunch ,Parental Leave  need to check
            if (attendance.AttendanceId == 0)
            {
                await _payrollContext.Attendances.AddAsync(attendanceEntry);
            }
            else
            {
                _payrollContext.Attendances.Update(attendanceEntry);
            }

            return "";
        }
        

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAttendance(int id)
        {
            try
            {
                var attendance = await _payrollContext.Attendances.FirstOrDefaultAsync(x => x.Id == id);
                if (attendance == null)
                {
                    return BadRequest("Attendance is not exist");
                }
                _payrollContext.Attendances.Remove(attendance);
                await _payrollContext.SaveChangesAsync();

                return Ok("Attendance is deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
        [HttpPost("UpdateAttendancePayrollFMLAandLWOP")]
        public async Task<ActionResult> UpdateAttendancePayrollFMLAandLWOP([FromBody] PayrollEmpSetupDto payrollEmpSetupDto)
        {
            try
            {
                var empPayroll = await _payrollContext.EmployeePayrollSetups.Where(ep => ep.empId == payrollEmpSetupDto.empId).FirstOrDefaultAsync();

                if (empPayroll == null)
                {
                    return BadRequest("Payroll employee setup does not exists");
                }
                empPayroll.fmlaStartDate = payrollEmpSetupDto.fmlaStartDate;
                empPayroll.lwopStartDate = payrollEmpSetupDto.lwopStartDate;
                await _payrollContext.SaveChangesAsync();
                return Ok("Payroll employee setup updated");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }

        }
        [HttpGet("GetAttendancePayrollFMLAandLWOP")]
        public async Task<ActionResult> GetAttendancePayrollFMLAandLWOP(int empId)
        {
            try
            {
                var empPayroll = await _payrollContext.EmployeePayrollSetups.Where(ep => ep.empId == empId).FirstOrDefaultAsync();
                int lwopCount = 0;
                decimal? fmlaHoursUsed = 0;
                if (empPayroll != null && empPayroll.fmlaStartDate != null)
                {
                    lwopCount = await _payrollContext.Attendances.CountAsync(ep => ep.employeeId == empId && ep.leaeWOPay == true && ep.date.Value >= empPayroll.fmlaStartDate.Value && ep.date.Value <= empPayroll.fmlaStartDate.Value.AddYears(1));

                    fmlaHoursUsed = await _payrollContext.Attendances.Where(ep => ep.employeeId == empId && ep.familyLeaveAct == true && ep.date.Value >= empPayroll.fmlaStartDate.Value && ep.date.Value <= empPayroll.fmlaStartDate.Value.AddYears(1))
                       .SumAsync(l => l.vacationHours +
                       l.sickLeaveHours +
                       l.personalTimeHours +
                       l.unexcusedHours +
                       l.proDayHours +
                       l.snowHours + l.bonusPerUsed + l.sickCompensationHours +
                       l.leaveWOPayHours + l.otherHours + l.workersCompHours + l.holidayHours + l.fedPaidSickHours + l.emergencyFMLAHours);
                }

                var result = new PayrollEmpSetupDto
                {
                    fmlaStartDate = empPayroll?.fmlaStartDate,
                    lwopStartDate = empPayroll?.lwopStartDate,
                    leaeWOPay = lwopCount,
                    fmlaHoursUsed = fmlaHoursUsed.Value
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
    }

}
