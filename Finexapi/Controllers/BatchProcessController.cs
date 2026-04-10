using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Formulas;
using FinexAPI.Models;
using FinexAPI.Models.BatchProcessModel;
using FinexAPI.Models.Payroll;
using FinexAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Data;
using System.Linq;
using System.Reflection;
using FinexAPI.Dtos;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BatchProcessController : BaseController
    {
        private readonly FinexAppContext _finexContext;

        public BatchProcessController(FinexAppContext finexContext, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _finexContext = finexContext;
        }

        [Route("RunTimecard")]
        [HttpGet]
        public async Task<ActionResult> RunTimecard()
        {
            try
            {
                var payrollTotal = await _finexContext.PayrollTotals.FirstOrDefaultAsync(x => x.prStartDate <= DateTime.Now.Date && x.prEndDate >= DateTime.Now.Date);
                DateTime? runDateStart;
                DateTime? runDateEnd;
                if (payrollTotal != null)
                {
                    runDateStart = payrollTotal.prStartDate;
                    runDateEnd = payrollTotal.prEndDate;
                }
                else
                {
                    var payrollDefault = await _finexContext.PayrollDefaultValues.FirstOrDefaultAsync();
                    if (payrollDefault == null)
                        throw new Exception("Payroll Defaults not exists");

                    var dateDiff = payrollDefault.dateDiffStartPay;//date paid
                    var payPeriodStart = payrollDefault.payrollStartDate;
                    var payPeriodEnd = payPeriodStart.Value.AddDays(13);
                    var datePaid = payPeriodEnd.AddDays(dateDiff ?? 0);

                    while (payPeriodEnd.Date < DateTime.Now.Date)
                    {
                        payPeriodStart = payPeriodEnd.AddDays(1);
                        payPeriodEnd = payPeriodStart.Value.AddDays(13);
                    }

                    runDateStart = payPeriodStart;
                    runDateEnd = payPeriodEnd;
                }

                DateTime? runDate;
                string runDateStr = DateTime.Today.ToString("yyyy-MM-dd");
                if (DateTime.TryParse(runDateStr, out DateTime parsedDate))
                {
                    runDate = runDateStart;
                    List<Employee> employees = _finexContext.Employees.Where(x => x.activeInd == "Y").ToList();

                    foreach (Employee employee in employees)
                    {
                        try
                        {
                            DateTime? startDate;
                            DateTime? endDate;

                            var primaryJob = _finexContext.Salaries.FirstOrDefault(x => x.empId == employee.id && !x.endDate.HasValue);

                            var employeeTimecardDetail = _finexContext.TimecardEmployeeDetails.Where(x => x.empId == employee.id).FirstOrDefault();
                            if (employeeTimecardDetail != null)
                            {
                                var employeeHolidayScheduleId = employeeTimecardDetail.holidayScheduleId;
                                var timecardHeader = _finexContext.TimeCardHeaders.Where(x => x.empID == employee.id && x.startDate <= runDate && x.endDate >= runDate).ToList();

                                if (timecardHeader == null || !timecardHeader.Any())
                                {
                                    startDate = runDate;
                                    endDate = startDate.Value.AddDays(13);

                                    var timecardHeaderCount = _finexContext.TimeCardHeaders.Where(x => x.empID == employee.id && x.startDate <= startDate && x.endDate >= endDate).ToList();

                                    int headerId = 0;
                                    if (timecardHeaderCount.Count == 0 && startDate != null)
                                    {
                                        headerId = AddTimeCard(employee.id, startDate, endDate, employee.OrgAccountId);
                                    }

                                    var hoursType = _finexContext.CodeValues.Where(x => x.value == "Regular").Select(h => h.Id).FirstOrDefault();
                                    var holidaySchedule = _finexContext.HolidayScheduleDates.Where(h => h.holidayScheduleId == employeeHolidayScheduleId).Select(x => x.date.Date).ToList();
                                    for (int i = 0; i <= 13; i++)
                                    {
                                        DateTime WorkDate = startDate.Value.AddDays(i);
                                        int dayOfWeek = (int)WorkDate.DayOfWeek;

                                        var timeCardScheduleOverRide = _finexContext.TimecardEmployeeScheduleOverrides
                                            .Where(x => x.employeeId == employee.id && x.jobDescriptionId.HasValue && x.dayofWeek.HasValue && x.dayofWeek == dayOfWeek).ToList();

                                        List<Schedules> schedules = new List<Schedules>();

                                        if (timeCardScheduleOverRide != null && timeCardScheduleOverRide.Count > 0)
                                        {
                                            foreach (var item in timeCardScheduleOverRide)
                                            {
                                                Schedules schedule = new Schedules();
                                                schedule.startDateTime = item.startDateTime;
                                                schedule.endDateTime = item.endDateTime;
                                                schedule.jobDescriptionId = item.jobDescriptionId!.Value;
                                                schedule.createTimecardEntries = !employeeTimecardDetail.autoPopulatedSchedule;
                                                schedules.Add(schedule);
                                            }
                                        }
                                        else
                                        {
                                            if (primaryJob != null)
                                            {
                                                Schedules schedule = new Schedules();
                                                schedule.startDateTime = WorkDate.Date;
                                                schedule.endDateTime = WorkDate.Date.AddDays(1).AddSeconds(-1);
                                                schedule.jobDescriptionId = primaryJob.jobDescId!.Value;
                                                schedule.createTimecardEntries = false;
                                                schedules.Add(schedule);
                                            }
                                        }

                                        if (schedules.Any())
                                        {
                                            var starttime = WorkDate.Date + schedules.Min(e => e.startDateTime.TimeOfDay);
                                            var endtime = WorkDate.Date + schedules.Max(e => e.endDateTime.TimeOfDay);

                                            var leaveRequest = _finexContext.LeaveRequest.Where(e => e.empId == employee.id && ((e.beginDate >= starttime && e.beginDate <= endtime)
                                                                             || (e.endDate >= starttime && e.beginDate <= endtime))).ToList();

                                            foreach (var item in schedules)
                                            {
                                                item.startDateTime = WorkDate.Date + item.startDateTime.TimeOfDay;
                                                item.endDateTime = WorkDate.Date + item.endDateTime.TimeOfDay;
                                            }
                                            LeaveBalanceCalculations.GetScheduleWithMultipleLeave(schedules, leaveRequest, headerId, holidaySchedule, hoursType, employee.id, _finexContext, false, true);
                                        }
                                    }
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            return BadRequest(ex.Message);
                        }
                    }
                    return Ok();
                }
                else
                {
                    return BadRequest($"Invalid date retrived from agument {runDateStr}");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private int AddTimeCard(int empId, DateTime? startDate, DateTime? endDate, int orgId)
        {
            try
            {
                TimeCardHeaders timeCardHeaders = new TimeCardHeaders();
                timeCardHeaders.startDate = (DateTime)startDate;
                timeCardHeaders.endDate = endDate;
                timeCardHeaders.empID = empId;
                timeCardHeaders.OrgAccountId = orgId;
                _finexContext.TimeCardHeaders.Add(timeCardHeaders);
                _finexContext.SaveChanges();
                return timeCardHeaders.ID;
            }
            catch (Exception ex)
            {

                Console.WriteLine(ex.Message);
                return 0;
            }
        }
        /*
        private void GetScheduleWithMultipleLeave(List<Schedules> timecardEmployeeSchedules, List<LeaveRequest> leaveRequests, int headerId, List<DateTime> holidayScheduleDate, int hoursType, int empId)
        {
            foreach (var timecardEmployeeSchedule in timecardEmployeeSchedules)
            {
                DateTime currentStart = timecardEmployeeSchedule.startDateTime;

                var relevantLeaves = leaveRequests.Where(lr => lr.endDate > timecardEmployeeSchedule.startDateTime && lr.beginDate < timecardEmployeeSchedule.endDateTime)
                    .OrderBy(lr => lr.beginDate).ToList();

                foreach (var leave in relevantLeaves)
                {

                    if (leave.beginDate > currentStart && timecardEmployeeSchedule.createTimecardEntries)
                    {
                        CreateTimeCard(currentStart, leave.beginDate < timecardEmployeeSchedule.endDateTime ? leave.beginDate :
                             timecardEmployeeSchedule.endDateTime, 0, timecardEmployeeSchedule.jobDescriptionId.Value, headerId, hoursType, empId);
                    }

                    if (leave.beginDate < timecardEmployeeSchedule.endDateTime && leave.endDate > timecardEmployeeSchedule.startDateTime)
                    {
                        var startDateTime = leave.beginDate > timecardEmployeeSchedule.startDateTime ? leave.beginDate : timecardEmployeeSchedule.startDateTime;
                        var endDateTime = leave.endDate < timecardEmployeeSchedule.endDateTime ? leave.endDate : timecardEmployeeSchedule.endDateTime;

                        CreateTimeCard(startDateTime, endDateTime, leave.leaveTypeID, timecardEmployeeSchedule.jobDescriptionId.Value, headerId, 0, empId);

                    }
                    currentStart = leave.endDate > currentStart ? leave.endDate : currentStart;
                }
                if (holidayScheduleDate.Any(h => h.Date >= timecardEmployeeSchedule.startDateTime.Date && h.Date <= timecardEmployeeSchedule.endDateTime.Date))
                {
                    var holidayLeaveType = _finexContext.LeaveTypes.FirstOrDefault(x => x.description.ToLower() == "holiday");
                    var holidayHoursType = _finexContext.CodeValues.Where(x => x.value == "Holiday").Select(h => h.Id).FirstOrDefault();
                    if (holidayLeaveType == null)
                    {
                        holidayLeaveType = new LeaveType
                        {
                            description = "Holiday",
                            isActive = "Y",
                            allowEmployeeSelect = false,
                            isReasonRequired = false
                        };

                        _finexContext.LeaveTypes.Add(holidayLeaveType);
                        _finexContext.SaveChanges();
                    }

                    //leaveTypeID value hardcode
                    CreateTimeCard(currentStart, timecardEmployeeSchedule.endDateTime, holidayLeaveType!.id, timecardEmployeeSchedule.jobDescriptionId.Value, headerId, holidayHoursType, empId,true);
                    continue;
                }
                if (currentStart < timecardEmployeeSchedule.endDateTime && timecardEmployeeSchedule.createTimecardEntries)
                {
                    CreateTimeCard(currentStart, timecardEmployeeSchedule.endDateTime, 0, timecardEmployeeSchedule.jobDescriptionId.Value, headerId, hoursType, empId);
                }
            }
        }
        
        private void CreateTimeCard(DateTime startdatetime, DateTime enddatetime, int leaveTypeId, int employeeJobId, int headerId, int hoursType, int empId, bool isHoliday=false)
        {
            try
            {
                DateTime entryStartTime = DateTime.Now;
                DateTime entryEndTime = DateTime.Now;

                double timehours = 0;

                var enforce7MinRule = _finexContext.SettingsValue.Where(x => x.settingsId == 60).Select(x => x.settingValue).FirstOrDefault();
                if (enforce7MinRule != null && enforce7MinRule == "1")
                {
                    entryStartTime = LeaveBalanceCalculations.SevenMinuteRule(startdatetime);
                    entryEndTime = LeaveBalanceCalculations.SevenMinuteRule(enddatetime);
                    timehours = (entryEndTime - entryStartTime).TotalHours;
                }
                var enforce3MinRule = _finexContext.SettingsValue.Where(x => x.settingsId == 61).Select(x => x.settingValue).FirstOrDefault();
                if (enforce3MinRule != null && enforce3MinRule == "1")
                {
                    entryStartTime = LeaveBalanceCalculations.ThreeMinuteRule(startdatetime);
                    entryEndTime = LeaveBalanceCalculations.ThreeMinuteRule(enddatetime);
                    timehours = (entryEndTime - entryStartTime).TotalHours;
                }

                if (isHoliday)
                    timehours = Math.Min((double)LeaveBalanceCalculations.GetScheduledEmpHours(_finexContext, empId, startdatetime), timehours);

                var lunchHrs = LeaveBalanceCalculations.GetEmployeeLunchTime(_finexContext, empId);
                if (timehours >= 4 && leaveTypeId > 0)
                    timehours = timehours + (double)lunchHrs;
                if (timehours >= 4 && leaveTypeId == 0)
                    timehours = timehours - (double)lunchHrs;

                //var timehours = (enddatetime - startdatetime).TotalHours;

                //if(isHoliday && timehours>8)
                //    timehours = 8;

                var timeCards = (new TimeCards
                {
                    empID = empId,
                    startDateTime = startdatetime,
                    endDateTime = enddatetime,
                    leaveTypeID = leaveTypeId,
                    hourTypeID = hoursType,
                    jobID = employeeJobId,
                    timeCardHeaderID = headerId,
                    hours = timehours
                });

                _finexContext.TimeCards.Add(timeCards);
                _finexContext.SaveChanges();
            }
            catch (Exception ex)
            {

            }
        }
        */


        [Route("RunInactive")]
        [HttpGet]
        public ActionResult RunInactiveBatchProgram()
        {
            try
            {
                DateTime? runDate;
                string runDateStr = DateTime.Today.ToString("yyyy-MM-dd");
                if (DateTime.TryParse(runDateStr, out DateTime parsedDate))
                {
                    runDate = parsedDate;
                    /// PROJECT_EQUIPMENT_SETUP
                    var sql = "Update PROJECT_EQUIPMENT_SETUP set ACTIVE_IND='N' where CAST(END_DATE as DATE) <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "PROJECT_EQUIPMENT_SETUP");


                    /// PROJECT
                    sql = "Update PROJECT set ACTIVE_IND='N' where CAST(END_DATE as DATE)  <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "PROJECT");

                    /// IN_HOUSE_ACCOUNTING_CODES
                    sql = "Update IN_HOUSE_ACCOUNTING_CODES set ACTIVE_IND='N' where CAST(END_DATE as DATE)  <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "IN_HOUSE_ACCOUNTING_CODES");

                    ///IHC_ACCOUNT
                    sql = "Update IHC_ACCOUNT set ACTIVE_IND='N' where CAST(ENDDATE as DATE)  <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "IHC_ACCOUNT");

                    ///IHC_SUB_ACCOUNT
                    sql = "Update IHC_SUB_ACCOUNT set ACTIVE_IND='N' where CAST(ENDDATE as DATE)  <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "IHC_SUB_ACCOUNT");

                    ///PROGRAM
                    sql = "Update PROGRAM set ACTIVE_IND='N' where CAST(END_DATE as DATE)  <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "PROGRAM");

                    ///COUNTY_ACCOUNTING_CODES
                    sql = "Update COUNTY_ACCOUNTING_CODES set ACTIVE_IND='N' where CAST(END_DATE as DATE) <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "COUNTY_ACCOUNTING_CODES");

                    ///DEPARTMENT 
                    sql = "Update DEPARTMENT set ACTIVE_IND='N' where CAST(ENDDATE as DATE) <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "DEPARTMENT");

                    ///FUND
                    sql = "Update FUND set ACTIVE_IND='N' where CAST(END_DATE as DATE) <='" + runDate + "' and ACTIVE_IND='Y'";
                    ExecuteUpdateStatement(sql, "FUND");

                    return Ok();
                }
                else
                {
                    return BadRequest($"Invalid date retrived from agument {runDateStr}");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private void ExecuteUpdateStatement(string sql, string tableName)
        {
            try
            {
                int recordUpdated = 0;
                //_logger.LogInformation($"Batch Started for: {tableName}");
                recordUpdated = _finexContext.Database.ExecuteSqlRaw(sql, tableName);
                //_logger.LogInformation($"{recordUpdated} records were updated for:{tableName}");
                //_logger.LogInformation($"Batch Ended for: {tableName}");
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex.Message+", "+ex.StackTrace);
            }

        }

    }
}
