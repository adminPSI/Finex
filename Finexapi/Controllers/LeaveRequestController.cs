using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Formulas;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.BatchProcessModel;
using FinexAPI.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class LeaveRequestController : BaseController
    {
        private readonly ILogger<TimeCardController> _logger;
        private readonly ILogger<TCEmployeeController> _tclogger;

        private readonly FinexAppContext _context;
        private readonly EmailNotification _emailNotification;

        public LeaveRequestController(IHttpContextAccessor httpContextAccessor, FinexAppContext context,
            ILogger<TimeCardController> logger, ILogger<TCEmployeeController> tclogger, EmailNotification emailNotification)
            : base(httpContextAccessor)
        {
            _context = context;
            _logger = logger;
            _tclogger = tclogger;
            _emailNotification = emailNotification;
        }

        [HttpGet("FutureLeave")]
        public async Task<ActionResult<List<LeaveRequest>>> GetEmployeeFutureLeaves(bool desc, int skip = 0, int take = 0, string sortKey = "modifiedDate", DateTime? startDate = null, DateTime? endDate = null, string? groupId = "", string? supervisorId = "")
        {
            try
            {
                /* if (!startDate.HasValue)
                {
                    startDate = DateTime.Now;
                }
                if (!endDate.HasValue)
                {
                    endDate = DateTime.Now.AddYears(1);
                } */
                var timcardEmployee = await _context.TimecardEmployeeDetails
                    .Where(x => x.empId == MemberId)
                    .FirstOrDefaultAsync();
                if (timcardEmployee == null)
                {
                    return BadRequest("Invalid supervisor Id");
                }
                /* var employeeFutureLeaves = await _context.LeaveRequest.Include(x => x.Employee)
                    .Where(x => supervisorId.HasValue ? x.SupervisorID == supervisorId : true && x.BeginDate >= startDate.Value
                    && (string.IsNullOrEmpty(groupId) || x.GroupId.ToString().Contains(string.IsNullOrEmpty(groupId) ? "" : groupId))
                    && x.EndDate <= endDate.Value && x.OrgAccId == OrgAccountId)
                    .ToListAsync(); */
                List<LeaveRequest> leaveRequests = new List<LeaveRequest>();
                var empIds = TimecardCommon.GetSupervisorsEmployeeIds(DateTime.Today, MemberId, _context);
                //var empList = await _context.TimecardEmployeeDetails.Where(x => (x.groupNumber == timcardEmployee.groupNumber || timcardEmployee.IsPayrollSpecialist || x.supervisorGroupNumber == timcardEmployee.groupNumber) &&
                //(string.IsNullOrEmpty(groupId) || x.groupNumber.ToString() == groupId) &&
                //(string.IsNullOrEmpty(supervisorId) || x.supervisorGroupNumber.ToString() == supervisorId)).Select(x => x.empId).ToListAsync();

                leaveRequests = await _context.LeaveRequest.Include(x => x.employee)
                  .Where(x => empIds.Contains(x.empId)
                  && (string.IsNullOrEmpty(supervisorId) || x.supervisorID.ToString().Contains(string.IsNullOrEmpty(supervisorId) ? "" : supervisorId))
                  && x.isSupervisorApproved.HasValue && x.isSupervisorApproved.Value  
                  && (startDate == null || x.beginDate.Date >= startDate.Value.Date)
                  && (string.IsNullOrEmpty(groupId) || x.groupId.ToString().Contains(string.IsNullOrEmpty(groupId) ? "" : groupId))
                  && (endDate == null || x.endDate.Date <= endDate.Value.Date)
                  ).OrderByCustom(sortKey, desc).ToListAsync();
                foreach (var leaveRequest in leaveRequests)
                {
                    //var empJobInfo = await _payrollEmployeeContext.EmployeeJobInfos.FindAsync(leaveRequest.job);
                    if (leaveRequest != null)
                    {
                        leaveRequest.JobDescription = await _context.PayrollJobDescriptions.Where(x => x.Id == leaveRequest.jobDescriptionId).Select(x => x.empJobDescription).FirstOrDefaultAsync();
                    }
                }
                var totalCount = leaveRequests.Count();
                if (take != 0)
                {
                    leaveRequests = leaveRequests.Skip(skip).Take(take).ToList();
                }
               
                return Ok(new { data = leaveRequests, Total = totalCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message + ", " + ex.StackTrace);
                throw;
            }
        }
        /// <summary>
        /// get TimeCard LeaveRequest by empId and dates
        /// </summary>
        /// <param name="orgId"></param>
        /// <param name="groupId"></param>
        /// <param name="empId"></param>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <returns></returns>

        private List<LeaveRequest> GetFMLAupdatedLeaveRequests(List<LeaveRequest> lrs)
        {
            lrs.ForEach(item =>
            {
                if (item.FMLAID != null)
                {
                    item.reasonForLeave = "";
                }
            });
            return lrs;
        }
        [HttpGet("filter")]
        public async Task<ActionResult<List<LeaveRequest>>> GetTimeCardLeaveRequest(bool desc, string sortKey = "modifiedDate", DateTime? startDate = null, DateTime? endDate = null, string? isSupervisorApproved = "", bool supervisor = false, int skip = 0, int take = 0, int empId = 0, string? search = "", string leaveType = "", string reasonForLeave = "", DateTime? employeeApprovedDate = null, DateTime? lrDate = null, DateTime? supervisorApprovedDate = null, string? fmlaType = "", string? reasonForDisApproval = "", string? status = "", string? employeeId = "", string? fullName = "", int? hours = null)
        {
            try
            {
                if (!TimecardCommon.HasTimecardDataAccess(_context, MemberId, empId))
                {
                    return Forbid();
                }

                var timcardLoggedInUser = await _context.TimecardEmployeeDetails.Where(x => x.empId == MemberId).FirstOrDefaultAsync();
                supervisor = MemberId!=empId && (timcardLoggedInUser.isSupervisor || timcardLoggedInUser.IsPayrollSpecialist);

                var selectedEmpId = empId;
                empId = (empId != 0 && empId != -1) ? empId : MemberId;
                var timcardEmployee = await _context.TimecardEmployeeDetails.Where(x => x.empId == empId).FirstOrDefaultAsync();
                if (timcardEmployee == null)
                {
                    return BadRequest("Employee not found");
                }
                if (!supervisor)
                {
                    if (search == "")
                    {
                        var leaveRequests = await _context.LeaveRequest.Include(x => x.employee).Include(x => x.leaveType).Include(x => x.FMLAType)
                        .Where(x => x.empId == empId
                        //&& (string.IsNullOrEmpty(supId) || x.supervisorID.ToString().Contains(string.IsNullOrEmpty(supId) ? "" : supId))
                        && (string.IsNullOrEmpty(leaveType) || x.leaveType.description.ToString().Contains(leaveType))
                        && (employeeApprovedDate == null || x.employeeApprovedDate.Value.Date == employeeApprovedDate.Value.Date)
                        && (lrDate == null || x.lRDate.Value.Date == lrDate.Value.Date)
                        && (supervisorApprovedDate == null || x.supervisorApprovedDate.Value.Date == supervisorApprovedDate.Value.Date)
                        && (string.IsNullOrEmpty(fmlaType) || x.FMLAType.value.Contains(fmlaType))
                        && (string.IsNullOrEmpty(reasonForLeave) || x.reasonForLeave.ToString().Contains(reasonForLeave))
                        && (string.IsNullOrEmpty(reasonForDisApproval) || x.reasonForDisApproval.ToString().Contains(reasonForDisApproval))
                        && (string.IsNullOrEmpty(status) || x.status.Contains(status))
                        && (string.IsNullOrEmpty(isSupervisorApproved) || x.isSupervisorApproved.ToString().Contains(string.IsNullOrEmpty(isSupervisorApproved) ? "" : isSupervisorApproved))
                        && (startDate == null || x.beginDate.Date == startDate.Value.Date)
                        && (endDate == null || x.endDate.Date == endDate.Value.Date)
                        && x.OrgAccountId == OrgAccountId).OrderByCustom(sortKey, desc).ToListAsync();

                        if (take == 0)
                        {
                            leaveRequests = GetFMLAupdatedLeaveRequests(leaveRequests);
                            return Ok(new { data = leaveRequests, Total = leaveRequests.Count });
                        }
                        else
                        {
                            leaveRequests = GetFMLAupdatedLeaveRequests(leaveRequests);
                            return Ok(new { data = leaveRequests.Skip(skip).Take(take).ToList(), Total = leaveRequests.Count });

                        }
                    }
                    else
                    {
                        var leaveRequests = await _context.LeaveRequest.Include(x => x.employee).Include(x => x.leaveType).Include(x => x.FMLAType)
                        .Where(x => x.empId == empId
                        //&& (string.IsNullOrEmpty(supId) || x.supervisorID.ToString().Contains(string.IsNullOrEmpty(supId) ? "" : supId))
                        && ((string.IsNullOrEmpty(search) || x.leaveType.description.ToString().Contains(search))
                        || (string.IsNullOrEmpty(search) || x.reasonForLeave.Contains(search))
                        || (string.IsNullOrEmpty(search) || x.status.Contains(search))
                        || (string.IsNullOrEmpty(search) || x.FMLAType.value.ToString().Contains(search))
                        || (string.IsNullOrEmpty(search) || x.reasonForDisApproval.Contains(search)))
                        && (string.IsNullOrEmpty(isSupervisorApproved) || x.isSupervisorApproved.ToString().Contains(string.IsNullOrEmpty(isSupervisorApproved) ? "" : isSupervisorApproved))
                        && (startDate == null || x.beginDate.Date == startDate.Value.Date)
                        && (endDate == null || x.endDate.Date == endDate.Value.Date)
                        && x.OrgAccountId == OrgAccountId).OrderByCustom(sortKey, desc).ToListAsync();

                        if (take == 0)
                        {
                            leaveRequests = GetFMLAupdatedLeaveRequests(leaveRequests);
                            return Ok(new { data = leaveRequests, Total = leaveRequests.Count });
                        }
                        else
                        {
                            leaveRequests = GetFMLAupdatedLeaveRequests(leaveRequests);
                            return Ok(new { data = leaveRequests.Skip(skip).Take(take).ToList(), Total = leaveRequests.Count });

                        }
                    }
                }
                else
                {
                    List<int> empList = new List<int>();
                    if ((timcardLoggedInUser.isSupervisor || timcardLoggedInUser.IsPayrollSpecialist) && selectedEmpId == -1)
                    {
                        empList = TimecardCommon.GetSupervisorsEmployeeIds(DateTime.Today, MemberId, _context);
                        //empList = await _context.TimecardEmployeeDetails.Where(x => x.groupNumber == timcardEmployee.groupNumber || timcardEmployee.IsPayrollSpecialist || x.supervisorGroupNumber == timcardEmployee.groupNumber).Select(x => x.empId).ToListAsync();
                    }
                    else
                    {
                        empList.Add(timcardEmployee.empId);
                    }
                    var leaveRequests = await _context.LeaveRequest.Include(x => x.employee).Include(x => x.leaveType).Include(x => x.FMLAType)
                     .Where(x =>
                     (empList.Contains(x.empId))
                     && (string.IsNullOrEmpty(employeeId) || x.empId.ToString().Contains(employeeId))
                     && (string.IsNullOrEmpty(fullName) || (x.employee.firstName.Contains(fullName) || x.employee.lastName.Contains(fullName)))
                     && ((string.IsNullOrEmpty(isSupervisorApproved) || (isSupervisorApproved.ToLower() == "false") && (string.IsNullOrEmpty(x.status) || x.status.ToLower() == "pending"))
                     || (isSupervisorApproved.ToLower() == "true" && (string.IsNullOrEmpty(x.status) || x.status.ToLower() != "pending")))
                     && (string.IsNullOrEmpty(leaveType) || x.leaveType.description.ToString().Contains(leaveType))
                     && (employeeApprovedDate == null || x.employeeApprovedDate.Value.Date == employeeApprovedDate.Value.Date)
                     && (lrDate == null || x.lRDate.Value.Date == lrDate.Value.Date)
                     && (supervisorApprovedDate == null || x.supervisorApprovedDate.Value.Date == supervisorApprovedDate.Value.Date)
                     && (hours == null || x.hours == hours)
                     && (string.IsNullOrEmpty(fmlaType) || x.FMLAType.value.Contains(fmlaType))
                     && (string.IsNullOrEmpty(reasonForLeave) || x.reasonForLeave.ToString().Contains(reasonForLeave))
                     && (string.IsNullOrEmpty(reasonForDisApproval) || x.reasonForDisApproval.ToString().Contains(reasonForDisApproval))
                     && (string.IsNullOrEmpty(status) || x.status.Contains(status))
                     && (startDate == null || x.beginDate.Date == startDate.Value.Date)
                     && (endDate == null || x.endDate.Date == endDate.Value.Date)
                     && x.empApproved.Value).OrderByCustom(sortKey, desc).ToListAsync();

                    if (take == 0)
                    {
                        leaveRequests = GetFMLAupdatedLeaveRequests(leaveRequests);
                        return Ok(new { data = leaveRequests, Total = leaveRequests.Count });
                    }
                    else
                    {
                        leaveRequests = GetFMLAupdatedLeaveRequests(leaveRequests);
                        return Ok(new { data = leaveRequests.Skip(skip).Take(take).ToList(), Total = leaveRequests.Count });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message + ", " + ex.StackTrace);
                throw;
            }
        }

        /// <summary>
        /// Create TimeCard LeaveRequest 
        /// </summary>
        /// <param name="leaveRequest"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPost]
        public async Task<ActionResult<List<LeaveRequest>>> CreateTimeCardLeaveRequest(LeaveRequest leaveRequest)
        {
            //email should be sent to his supervisor for approval(this is a configuration in employee preferesnces to enable/disable) once clecked on submit for approval
            //add the leave time in the attendence window of payroll window
            //email should be sent to empoyee if its disapproved
            if (!TimecardCommon.HasTimecardDataAccess(_context, MemberId, leaveRequest.empId))
            {
                return Forbid();
            }

            leaveRequest.beginDate = leaveRequest.beginDate.AddSeconds(-1 * leaveRequest.beginDate.Second);
            leaveRequest.endDate = leaveRequest.endDate.AddSeconds(-1 * leaveRequest.endDate.Second);

            var leaveStartDate = leaveRequest.beginDate;
            var leaveEndDate = leaveRequest.endDate;

            try
            {
                if (leaveRequest == null || leaveRequest.endDate <= leaveRequest.beginDate)
                {
                    return BadRequest("Please Enter valid start date and end date");
                }
                if (leaveRequest == null || leaveRequest.beginDate < DateTime.Now.AddDays(-30))
                {
                    return BadRequest("Cannot add leave requests for older than 30 days.");
                }

                //leaveRequest.empId = MemberId;
                var employee = await _context.TimecardEmployeeDetails.FirstOrDefaultAsync(x => x.empId == leaveRequest.empId && x.OrgAccountId == OrgAccountId);
                if (employee == null)
                {
                    return BadRequest("Employee does not exists");
                }
                var setting = await _context.SettingsValue.Where(x => x.settingsId == 85 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
                if (!string.IsNullOrEmpty(setting) && setting.Equals("1"))
                {
                    var donotAllowleaveRequest = LeaveBalanceCalculations.DoNotAllowLeaveRequestsForPostedPeriods(leaveRequest.beginDate, leaveRequest.endDate, leaveRequest.empId, OrgAccountId, _context);
                    if (donotAllowleaveRequest)
                    {
                        return BadRequest("Date Span overlaps with an already Posted Payroll. Leave Requests may not be submitted for any dates that fall in the Pay Period of an already posted Payroll.");
                    }
                }
                var primarySalary = await _context.Salaries.FirstOrDefaultAsync(x => x.empId == leaveRequest.empId && !x.endDate.HasValue);
                var dayOfWeekLeaveStart = (int)leaveStartDate!.DayOfWeek;
                List<Schedules> schedules = new List<Schedules>();
                var startDaySchedule = _context.TimecardEmployeeScheduleOverrides.Where(x => x.employeeId == leaveRequest.empId && x.dayofWeek.Value == dayOfWeekLeaveStart).ToList();
                var hasEmpSchedule = startDaySchedule.Any();

                if (!hasEmpSchedule && primarySalary == null)
                {
                    return BadRequest("Primary Job not found!");
                }

                if (!hasEmpSchedule && leaveRequest.beginDate.Date != leaveRequest.endDate.Date)
                {
                    return BadRequest("Leave request for one day is allowed.");
                }

                var tempLeaveStartDate = leaveRequest.beginDate;
                var tempLeaveEndDate = leaveRequest.endDate;

                while (tempLeaveStartDate.Date <= tempLeaveEndDate.Date)
                {
                    int dayOfWeek = (int)tempLeaveStartDate.DayOfWeek;
                    if (hasEmpSchedule)
                    {
                        var scheduleData = _context.TimecardEmployeeScheduleOverrides.AsNoTracking()
                            .Where(x => x.employeeId == leaveRequest.empId && x.dayofWeek == dayOfWeek).ToList();

                        if (scheduleData.Any())
                        {
                            var minStartDate = scheduleData.Min(x => x.startDateTime);
                            var maxEndDate = scheduleData.Max(x => x.endDateTime);

                            schedules.Add(new Schedules
                            {
                                createTimecardEntries = true,
                                startDateTime = tempLeaveStartDate.Date.Add(minStartDate.TimeOfDay),
                                endDateTime = tempLeaveStartDate.Date.Add(maxEndDate.TimeOfDay),
                                jobDescriptionId = scheduleData.First().jobDescriptionId!.Value,
                            });
                        }
                    }
                    else
                    {
                        var customSchedule = new Schedules
                        {
                            createTimecardEntries = false,
                            startDateTime = tempLeaveStartDate, // consider schedule starts at 8 am
                            endDateTime = tempLeaveEndDate, //tempLeaveStartDate.Date.AddHours(8 + (double)primarySalary!.hoursPerDay!.Value),
                            jobDescriptionId = primarySalary.jobDescId!.Value,
                        };

                        schedules.Add(customSchedule);
                    }
                    tempLeaveStartDate = tempLeaveStartDate.AddDays(1);
                }
                decimal requestedTotalHrs = Convert.ToDecimal((leaveRequest.endDate - leaveRequest.beginDate).TotalHours);
                if (hasEmpSchedule)
                {
                    var validBeginSchedule = schedules.Any(emp =>
                   leaveRequest.beginDate >= emp.startDateTime &&
                   leaveRequest.beginDate <= emp.endDateTime);

                    var validEndSchedule = schedules.Any(emp =>
                    leaveRequest.endDate >= emp.startDateTime &&
                    leaveRequest.endDate <= emp.endDateTime);

                    if (!validBeginSchedule || !validEndSchedule)
                    {
                        return BadRequest("Enter valid start/end time");
                    }

                    requestedTotalHrs = Convert.ToDecimal(schedules.Sum(x => (x.endDateTime - x.startDateTime).TotalHours));
                }

                
                var leaveType = _context.LeaveTypes.FirstOrDefault(x => x.id == leaveRequest.leaveTypeID);
                var leaveTypeDesc = (leaveType?.description ?? "").ToLower();

                if (leaveTypeDesc.Contains("sick")
                    || leaveTypeDesc.Contains("vacation")
                    || leaveTypeDesc.Contains("personal")
                    || leaveTypeDesc.Contains("comp")
                    || leaveTypeDesc.Contains("fed")
                    || leaveTypeDesc.Contains("emergency fmla")
                    )
                {
                    var availableHrs = LeaveBalanceCalculations.GetLeaveBalanceByType(_context, leaveRequest.empId, leaveTypeDesc);

                    if (!(leaveTypeDesc.Contains("sick") || leaveTypeDesc.Contains("vacation")) && availableHrs != -1000 && availableHrs < requestedTotalHrs)
                        return BadRequest("Negative leave balance is not allowed");

                    var allowNegative = await _context.SettingsValue.Where(x => x.settingsId == 62).Select(x => x.settingValue).FirstOrDefaultAsync();
                    if (availableHrs != -1000 && availableHrs < requestedTotalHrs && !string.IsNullOrEmpty(allowNegative) && allowNegative == "1")
                        return BadRequest("Negative leave balance is not allowed");
                }

                var existingLeaveRequest = _context.LeaveRequest.AsEnumerable()
                    .Where(y => y.status != "Rejected" && y.empId == leaveRequest.empId && y.OrgAccountId == OrgAccountId
                    && ((y.beginDate <= leaveEndDate && leaveStartDate <= y.endDate))
                ).ToList();

                if (existingLeaveRequest.Any())
                {
                    return Conflict("Employee timecard Leave Request already exists");
                }

                leaveRequest.OrgAccountId = OrgAccountId;
                leaveRequest.lRDate = DateTime.Now;
                leaveRequest.isSupervisorApproved = null;
                leaveRequest.supervisorApprovedDate = null;
                leaveRequest.isAAApproved = null;
                leaveRequest.aaApprovedDate = null;

                var totalHours = 0M;
                var attendance = false;

                var enforce7MinRule = await _context.SettingsValue.Where(x => x.settingsId == 60).Select(x => x.settingValue).FirstOrDefaultAsync();
                var enforce3MinRule = await _context.SettingsValue.Where(x => x.settingsId == 61).Select(x => x.settingValue).FirstOrDefaultAsync();


                foreach (var schedule in schedules)
                {
                    if (leaveStartDate.Date == leaveEndDate.Date)
                    {
                        if (leaveRequest.beginDate < schedule.startDateTime)
                            leaveRequest.beginDate = schedule.startDateTime;
                        if (leaveRequest.endDate > schedule.endDateTime)
                            leaveRequest.endDate = schedule.endDateTime;
                    }
                    else if (leaveStartDate.Date == schedule.startDateTime.Date)
                    {
                        leaveRequest.beginDate = leaveStartDate;
                        if (leaveRequest.beginDate < schedule.startDateTime)
                            leaveRequest.beginDate = schedule.startDateTime;
                        leaveRequest.endDate = schedule.endDateTime;
                    }
                    else if (leaveEndDate.Date == schedule.startDateTime.Date)
                    {
                        leaveRequest.beginDate = schedule.startDateTime;
                        leaveRequest.endDate = leaveEndDate;
                        if (leaveRequest.endDate > schedule.endDateTime)
                            leaveRequest.endDate = schedule.endDateTime;
                    }
                    else
                    {
                        leaveRequest.beginDate = schedule.startDateTime;
                        leaveRequest.endDate = schedule.endDateTime;
                    }

                    attendance = LeaveBalanceCalculations.InsertIntoAttendanceAndTimecard(leaveRequest, _context, true, false);

                    DateTime entryStartTime = DateTime.Now;
                    DateTime entryEndTime = DateTime.Now;

                    if (enforce7MinRule != null && enforce7MinRule == "1")
                    {
                        entryStartTime = LeaveBalanceCalculations.SevenMinuteRule(leaveRequest.beginDate);
                        entryEndTime = LeaveBalanceCalculations.SevenMinuteRule(leaveRequest.endDate);
                        leaveRequest.hours = (decimal)(entryEndTime - entryStartTime).TotalHours;
                    }
                    else if (enforce3MinRule != null && enforce3MinRule == "1")
                    {
                        entryStartTime = LeaveBalanceCalculations.ThreeMinuteRule(leaveRequest.beginDate);
                        entryEndTime = LeaveBalanceCalculations.ThreeMinuteRule(leaveRequest.endDate);
                        leaveRequest.hours = (decimal)(entryEndTime - entryStartTime).TotalHours;
                    }

                    totalHours += leaveRequest.hours!.Value;
                }

                if (totalHours <= 0)
                    return BadRequest("Invalid leave request hours.");

                if (attendance)
                {
                    leaveRequest.beginDate = leaveStartDate;
                    leaveRequest.endDate = leaveEndDate;
                    leaveRequest.hours = Math.Round(totalHours, 2);

                    _context.LeaveRequest.Add(leaveRequest);
                    await _context.SaveChangesAsync();

                    //Send leave request email notification to emp supervisor
                    string leaveTypeName = "";
                    var leavTypeDetails = await _context.LeaveTypes.FirstOrDefaultAsync(x => x.id == leaveRequest.leaveTypeID);
                    if (leavTypeDetails != null)
                        leaveTypeName = leavTypeDetails.description;

                    StringBuilder sb = new StringBuilder();
                    sb.Clear();
                    sb.AppendFormat("Leave request for {0} {1}.", leaveRequest.reasonForLeave, " is pending approval");

                    string subject = sb.ToString();
                    sb.Clear();
                    sb.AppendFormat("{0} time from {1} to {2} for {3} hours.{4}", leaveTypeName, leaveRequest.beginDate.ToString("MM/dd/yyyy hh:mm tt"),
                        leaveRequest.endDate.ToString("MM/dd/yyyy hh:mm tt"), leaveRequest.hours.ToString(), "<br>");
                    string body = sb.ToString();
                    var gettimecardEmployeeDetails = await _context.TimecardEmployeeDetails.FirstOrDefaultAsync(x => x.empId == leaveRequest.empId);
                    if (gettimecardEmployeeDetails != null)
                    {
                        var getSupervisors = await _context.TimecardEmployeeDetails.Where(x => x.groupNumber == gettimecardEmployeeDetails.groupNumber &&
                        x.isSupervisor && x.OrgAccountId == OrgAccountId).ToListAsync();
                        if (getSupervisors != null && getSupervisors.Count() > 0)
                        {
                            foreach (var item in getSupervisors)
                            {
                                await _emailNotification.SendEmail(leaveRequest.empId, item.empId, subject, body, "", "", -1);
                                var getSuperVisorSubs = await _context.SupervisorSubSchedules.FirstOrDefaultAsync(x => x.supId == item.empId);
                                if (getSuperVisorSubs != null && getSuperVisorSubs.supSubId > 0)
                                {
                                    await _emailNotification.SendEmail(leaveRequest.empId, getSuperVisorSubs.supSubId.Value, subject, body, "", "", -1);
                                }
                            }
                        }
                    }

                    ////Get mobjEmployees.GetFMLANotify(gConn) if records found then trigger below
                    //if (leaveRequest.FMLAID != null && leaveRequest.FMLAID > 0)
                    //{
                    //    sb.Append(" (FMLA)");
                    //    SendEmail1(gWhoID, row3("ID"), Subject, Body, "", row3("EmployeeID"), "", -1);
                    //}
                }
                else
                {
                    return BadRequest("Internal Server error while making timecard and attendance entry");
                }
                return Ok(leaveRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message + ", " + ex.StackTrace);
                throw new Exception(ex.Message);
            }
        }
        /// <summary>
        /// Edit TimeCard LeaveRequest by id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="leaveRequest"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPut("{id}")]
        public async Task<ActionResult<List<LeaveRequest>>> EditTimeCardLeaveRequest(int id, LeaveRequest leaveRequest)
        {
            try
            {
                if (!TimecardCommon.HasTimecardDataAccess(_context, MemberId, leaveRequest.empId))
                {
                    return Forbid();
                }
                //email should be sent to his supervisor for approval once clecked on submit for approval
                //add the leave time in the attendence window of payroll window
                if (leaveRequest == null || leaveRequest.endDate <= leaveRequest.beginDate)
                {
                    return BadRequest("Please Enter valid start date and end date");
                }
                var employee = await _context.Employees.FirstOrDefaultAsync(x => x.id == leaveRequest.empId && x.OrgAccountId == OrgAccountId);
                if (employee == null)
                {
                    return BadRequest("Employee does not exists");
                }
                var leaveReuestEntity = await _context.LeaveRequest.FirstOrDefaultAsync(x => x.ID == id && x.OrgAccountId == OrgAccountId);
                if (leaveReuestEntity == null)
                {
                    return BadRequest("Leave Request does not exists");
                }
                var setting = await _context.SettingsValue.Where(x => x.settingsId == 85 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
                if (setting.Equals("1"))
                {
                    var donotAllowleaveRequest = LeaveBalanceCalculations.DoNotAllowLeaveRequestsForPostedPeriods(leaveRequest.beginDate, leaveRequest.endDate, leaveRequest.empId, OrgAccountId, _context);
                    if (donotAllowleaveRequest)
                    {
                        return BadRequest("Date Span overlaps with an already Posted Payroll. Leave Requests may not be submitted for any dates that fall in the Pay Period of an already posted Payroll.");
                    }
                }
                /*
                var existingLeaveRequest = _context.LeaveRequest.AsEnumerable().Where(y => y.ID != leaveRequest.ID
                && y.OrgAccId == OrgAccountId
                && y.EmpId == leaveRequest.EmpId
                && y.BeginDate <= leaveRequest.BeginDate
                && y.EndDate >= leaveRequest.EndDate
                 &&
                 (
                    (y.BeginDate.TimeOfDay == leaveRequest.BeginDate.TimeOfDay && y.EndDate.TimeOfDay == leaveRequest.EndDate.TimeOfDay)
                    ||
                    (y.BeginDate.TimeOfDay > leaveRequest.BeginDate.TimeOfDay && y.EndDate.TimeOfDay < leaveRequest.EndDate.TimeOfDay)
                    ||
                    (y.BeginDate.TimeOfDay > leaveRequest.BeginDate.TimeOfDay && y.EndDate.TimeOfDay < leaveRequest.EndDate.TimeOfDay)
                    ||
                    (y.BeginDate.TimeOfDay < leaveRequest.BeginDate.TimeOfDay && y.EndDate.TimeOfDay > leaveRequest.EndDate.TimeOfDay)
                    ||
                    (y.BeginDate.TimeOfDay > leaveRequest.BeginDate.TimeOfDay && y.EndDate.TimeOfDay < leaveRequest.EndDate.TimeOfDay)
                )).ToList();

                //var existingLeaveRequestWithRecord = await _context.LeaveRequest.FirstOrDefaultAsync(y => y.ID == leaveRequest.ID && y.EmpId == leaveRequest.EmpId);
                if (existingLeaveRequest != null && existingLeaveRequest.Any())
                {
                    return Conflict("Employee timecard leave request already exists");
                }
                else
                {
                    leaveRequest.OrgAccId = OrgAccountId;
                    leaveRequest.AddedBy = leaveReuestEntity.AddedBy;
                    leaveRequest.AddedWhenDate = leaveReuestEntity.AddedWhenDate;
                    leaveRequest.ModifiedBy = "modifieduser";
                    leaveRequest.ModifiedDate = DateTime.Now;
                    _context.Entry(leaveReuestEntity).State = EntityState.Detached;
                    leaveReuestEntity = leaveRequest;
                    _context.LeaveRequest.Update(leaveRequest);
                    await _context.SaveChangesAsync();

                } */

                leaveRequest.OrgAccountId = OrgAccountId;
                leaveRequest.createdBy = leaveReuestEntity.createdBy;
                leaveRequest.createdDate = leaveReuestEntity.createdDate;
                _context.Entry(leaveReuestEntity).State = EntityState.Detached;
                leaveReuestEntity = leaveRequest;

                var attendance = LeaveBalanceCalculations.InsertIntoAttendanceAndTimecard(leaveRequest, _context, false, false);

                DateTime entryStartTime = DateTime.Now;
                DateTime entryEndTime = DateTime.Now;

                var enforce7MinRule = await _context.SettingsValue.Where(x => x.settingsId == 60).Select(x => x.settingValue).FirstOrDefaultAsync();
                var enforce3MinRule = await _context.SettingsValue.Where(x => x.settingsId == 61).Select(x => x.settingValue).FirstOrDefaultAsync();

                if (enforce7MinRule != null && enforce7MinRule == "1")
                {
                    entryStartTime = LeaveBalanceCalculations.SevenMinuteRule(leaveRequest.beginDate);
                    entryEndTime = LeaveBalanceCalculations.SevenMinuteRule(leaveRequest.endDate);
                    leaveRequest.hours = (decimal)(entryEndTime - entryStartTime).TotalHours;
                }
                else if (enforce3MinRule != null && enforce3MinRule == "1")
                {
                    entryStartTime = LeaveBalanceCalculations.ThreeMinuteRule(leaveRequest.beginDate);
                    entryEndTime = LeaveBalanceCalculations.ThreeMinuteRule(leaveRequest.endDate);
                    leaveRequest.hours = (decimal)(entryEndTime - entryStartTime).TotalHours;
                }

                if (attendance)
                {
                    _context.LeaveRequest.Update(leaveRequest);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    return BadRequest("Internal Server error while making timecard and attendance entry");
                }

                return Ok(leaveRequest);


            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message + ", " + ex.StackTrace);
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Delete TimeCard LeaveRequest by id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteTimeCardLeaveRequest(int id)
        {
            try
            {
                var leaveRequest = await _context.LeaveRequest.FirstOrDefaultAsync(x => x.ID == id && x.OrgAccountId == OrgAccountId);
                if (leaveRequest == null)
                {
                    return Conflict("Employee timecard leave request does not exists");
                }
                if (!TimecardCommon.HasTimecardDataAccess(_context, MemberId, leaveRequest.empId))
                {
                    return Forbid();
                }

                var attendance = LeaveBalanceCalculations.InsertIntoAttendanceAndTimecard(leaveRequest, _context, false, true);
                if (attendance)
                {

                    _context.LeaveRequest.Remove(leaveRequest);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    return BadRequest("Internal Server error while making delete entry in  timecard and attendance");
                }
                
            }

            catch (Exception ex)
            {
                _logger.LogError(ex.Message + ", " + ex.StackTrace);
                throw new Exception(ex.Message + ", " + ex.StackTrace);
            }
            return Ok(true);
        }
        [Route("LeaveRequestApproveOrReject")]
        [HttpPost]
        public async Task<ActionResult<string>> LeaveUpdate(List<int> ids, string? status, string approveType, string? message = null)
        {
            var leaves = await _context.LeaveRequest.Where(x => ids.Contains(x.ID) && x.OrgAccountId == OrgAccountId).ToListAsync();
            var supervisorEmpIds = TimecardCommon.GetSupervisorsEmployeeIds(DateTime.Now,MemberId,_context);
            if (approveType.ToLower() == "aa")
            {
                if (status == "Approved")
                {
                    foreach (var leave in leaves)
                    {
                        if (!supervisorEmpIds.Any(x=>x == leave.empId))
                        {
                            return Forbid();
                        }
                        if (leave.empApproved.Value && leave.isSupervisorApproved.Value)
                        {
                            leave.isAAApproved = true;
                            leave.aaApprovedDate = DateTime.Now;
                            leave.status = "Approved";
                            //leave.aaID = MemberId;

                        }
                    }
                }
                if (status == "Rejected")
                {
                    foreach (var leave in leaves)
                    {
                        if (!supervisorEmpIds.Any(x => x == leave.empId))
                        {
                            return Forbid();
                        }

                        if (leave.empApproved.Value && leave.isSupervisorApproved.Value)
                        {
                            leave.isAAApproved = false;
                            leave.aaApprovedDate = DateTime.Now;
                            leave.reasonForDisApproval = message;
                            leave.status = "Rejected";
                            //leave.aaID = MemberId;

                            var attendance = LeaveBalanceCalculations.InsertIntoAttendanceAndTimecard(leave, _context, false, true);
                        }
                    }
                }
            }
            else if (approveType.ToLower() == "supervisor")
            {
                if (status == "Approved")
                {
                    foreach (var leave in leaves)
                    {
                        if (!supervisorEmpIds.Any(x => x == leave.empId))
                        {
                            return Forbid();
                        }

                        if (leave.empApproved.Value)
                        {
                            leave.status = "Approved";
                            var timcardEmployee = await _context.TimecardEmployeeDetails
                        .Where(x => x.empId == leave.empId && x.OrgAccountId == OrgAccountId)
                        .FirstOrDefaultAsync();
                            if (timcardEmployee != null && timcardEmployee.isAppointingAuthorityEnabled)
                            {
                                leave.status = "Sup Approved";
                            }
                            leave.isSupervisorApproved = true;
                            leave.supervisorApprovedDate = DateTime.Now;
                            //leave.supervisorID = MemberId;
                        }
                    }
                }
                if (status == "Rejected")
                {
                    foreach (var leave in leaves)
                    {
                        if (!supervisorEmpIds.Any(x => x == leave.empId))
                        {
                            return Forbid();
                        }

                        if (leave.empApproved.Value)
                        {
                            leave.isSupervisorApproved = false;
                            leave.supervisorApprovedDate = DateTime.Now;
                            leave.reasonForDisApproval = message;
                            leave.status = "Rejected";

                            var attendance = LeaveBalanceCalculations.InsertIntoAttendanceAndTimecard(leave, _context, false, true);
                        }
                        //leave.supervisorID = MemberId;
                    }
                }
            }
            else if (approveType.ToLower() == "employee")
            {
                foreach (var leave in leaves)
                {
                    if (!supervisorEmpIds.Any(x => x == leave.empId))
                    {
                        return Forbid();
                    }

                    leave.empApproved = true;
                    leave.employeeApprovedDate = DateTime.Now;
                }
            }
            if ((approveType.ToLower() == "supervisor" || approveType.ToLower() == "aa"))
            {
                if (status == "Approved")
                {
                    foreach (var leave in leaves)
                    {
                        if (!supervisorEmpIds.Any(x => x == leave.empId))
                        {
                            return Forbid();
                        }

                        string leaveTypeName = "";
                        var leavTypeDetails = await _context.LeaveTypes.FirstOrDefaultAsync(x => x.id == leave.leaveTypeID);
                        if (leavTypeDetails != null)
                            leaveTypeName = leavTypeDetails.description;

                        StringBuilder sb = new StringBuilder();
                        StringBuilder l_sb = new StringBuilder();
                        l_sb.AppendFormat("{0} {1} {2} {3}", leave.beginDate.ToString("MM/dd/yyyy hh:mm tt"),
                    leave.endDate.ToString("MM/dd/yyyy hh:mm tt"), leaveTypeName, "<br>");

                        sb.AppendFormat("Leave Request for {0}{1}{1}{2}{1} has been approved{1}", leave.reasonForLeave, "<br>", l_sb.ToString());
                        string body = sb.ToString();
                        string subject = "Leave request for " + leave.reasonForLeave + "." + leave.beginDate + " to " + leave.endDate;
                        string CC = "";
                        //string CC = mLRHeader.GetCC(gConn, gWhoID);
                        await _emailNotification.SendEmail(MemberId, leave.empId, subject, body, "", CC, -1);
                    }
                }
                if (status == "Rejected")
                {
                    foreach (var leave in leaves)
                    {
                        if (!supervisorEmpIds.Any(x => x == leave.empId))
                        {
                            return Forbid();
                        }

                        string body = "Leave request for " + leave.beginDate.ToString("MM/dd/yyyy hh:mm tt") + " to " + leave.endDate.ToString("MM/dd/yyyy hh:mm tt") + " disapproved for the following reason:";
                        body += "\r\n" + leave.reasonForDisApproval;
                        string subject = "Leave request for " + leave.beginDate + " to " + leave.endDate;
                        string CC = "";
                        //string CC = mLRHeader.GetCC(gConn, gWhoID);
                        await _emailNotification.SendEmail(MemberId, leave.empId, subject, body, "", CC, -1);
                    }
                }
            }
            _context.LeaveRequest.UpdateRange(leaves);
            await _context.SaveChangesAsync();
            return Ok(true);
        }
    }

}
