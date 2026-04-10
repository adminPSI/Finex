using AutoMapper;
using Azure;
using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Formulas;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class TCEmployeeController : BaseController
    {
        private readonly ILogger<TCEmployeeController> _logger;
        private readonly FinexAppContext _timecardContext;

        public TCEmployeeController(IHttpContextAccessor httpContextAccessor, FinexAppContext context, ILogger<TCEmployeeController> logger)
            : base(httpContextAccessor)
        {
            _timecardContext = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TimecardEmployeeDetails>>> GetTimecardEmployeesDetails(bool desc, string sortKey = "employee.lastName", string? employeeName = "", string? activeIND = "", string? supervisor = "", string? groupNumber = "", string? supGroupNumber = "", string? search = "", int skip = 0, int take = 0)
        {
            try
            {
                if (search == "")
                {
                    var list = await _timecardContext.TimecardEmployeeDetails.Include(x => x.Employee)
                        .Where(x => (x.Employee.firstName.Contains(string.IsNullOrEmpty(employeeName) ? "" : employeeName)
                        || x.Employee.lastName.Contains(string.IsNullOrEmpty(employeeName) ? "" : employeeName))
                        && x.isSupervisor.ToString().Contains(string.IsNullOrEmpty(supervisor) ? "" : supervisor)
                        && (string.IsNullOrEmpty(groupNumber) || (x.groupNumber != null && x.groupNumber.ToString()==groupNumber))
                        && (activeIND == "" ? 1 == 1 : x.Employee.activeInd == activeIND)
                        && (string.IsNullOrEmpty(supGroupNumber) || (x.supervisorGroupNumber != null && x.supervisorGroupNumber.ToString()==supGroupNumber))
                        //&& x.supervisorGroupNumber.ToString().Contains(string.IsNullOrEmpty(supGroupNumber) ? "" : supGroupNumber)
                        && (x.OrgAccountId == OrgAccountId)).OrderByCustom(sortKey, desc).ToListAsync();
                    if (take == 0)
                    {
                        return Ok(new { data = list, Total = list.Count });
                    }
                    else
                    {
                        return Ok(new { data = list.Skip(skip).Take(take).ToList(), Total = list.Count });

                    }
                }
                else
                {
                    var list = await _timecardContext.TimecardEmployeeDetails.Include(x => x.Employee)
                        .Where(x => (x.Employee.firstName.Contains(string.IsNullOrEmpty(search) ? "" : search)
                        || x.Employee.lastName.Contains(string.IsNullOrEmpty(search) ? "" : search)
                        || x.isSupervisor.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                        || x.groupNumber.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                        || (string.IsNullOrEmpty(search) || (x.supervisorGroupNumber != null && x.supervisorGroupNumber.ToString().Contains(search))))
                        //|| x.supervisorGroupNumber.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search))
                        && (activeIND == "" ? 1 == 1 : x.Employee.activeInd == activeIND) 
                        && (x.OrgAccountId == OrgAccountId)).OrderByCustom(sortKey, desc).ToListAsync();
                    if (take == 0)
                    {
                        return Ok(new { data = list, Total = list.Count });
                    }
                    else
                    {
                        return Ok(new { data = list.Skip(skip).Take(take).ToList(), Total = list.Count });

                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpPost]
        public async Task<ActionResult<TimecardEmployeeDetails>> AddEmployee(TimecardEmployeeDetails employeeDetails)
        {
            try
            {
                if (employeeDetails == null)
                {
                    return BadRequest();
                }
                if (employeeDetails.supervisorGroupNumber == employeeDetails.groupNumber)
                {
                    return BadRequest("Cannot have same group numberas that of supervisor group number");
                }

                var employee = await _timecardContext.Employees.Where(x => x.id == employeeDetails.empId && x.OrgAccountId == OrgAccountId).ToListAsync();
                if (employee.Count() == 0)
                {
                    return BadRequest("Employee not found in payroll system");
                }
                var emp = await _timecardContext.TimecardEmployeeDetails.Where(x => x.empId == employeeDetails.empId && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (emp != null)
                {
                    return BadRequest("Employee Already Added To Timecard");
                }
                if (employeeDetails.supervisorGroupNumber == null)
                {
                    employeeDetails.supervisorGroupNumber = 0;
                }
                employeeDetails.OrgAccountId = OrgAccountId;
                _timecardContext.TimecardEmployeeDetails.Add(employeeDetails);
                await _timecardContext.SaveChangesAsync();
                return employeeDetails;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult<TimecardEmployeeDetails>> DeleteEmployeeById(int id)
        {
            try
            {
                var employeeDetails = await _timecardContext.TimecardEmployeeDetails.FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);
                if (employeeDetails == null)
                {
                    return BadRequest("Timecard employee details not found");
                }
                var timecardHeaders = await _timecardContext.TimeCardHeaders.Where(x => x.OrgAccountId == OrgAccountId && x.empID == employeeDetails.empId).ToListAsync();
                var timecards = await _timecardContext.TimeCards.Where(x => x.empID == employeeDetails.empId).ToListAsync();
                var timcardSchedule = await _timecardContext.TimecardEmployeeSchedules.Where(x => x.employeeId == employeeDetails.empId).ToListAsync();
                var timcardScheduleOverride = await _timecardContext.TimecardEmployeeScheduleOverrides.Where(x => x.employeeId == employeeDetails.empId).ToListAsync();
                var leaverequests = await _timecardContext.LeaveRequest.Where(x => x.empId == employeeDetails.empId).ToListAsync();
                if (leaverequests.Any() || timecardHeaders.Any() || timecards.Any() || timcardSchedule.Any() || timcardScheduleOverride.Any())
                {
                    return BadRequest("Timecard Employee is Associated with timcard Data");
                }
                _timecardContext.TimecardEmployeeDetails.Remove(employeeDetails);
                await _timecardContext.SaveChangesAsync();

                return employeeDetails;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TimecardEmployeeDetails>> EditEmployee(int id, TimecardEmployeeDetails employeeDetails)
        {
            try
            {
                if (!EmployeeDetailsExists(employeeDetails.empId, id))
                {
                    return BadRequest("Timecard employee details not found");
                }
                if (employeeDetails.supervisorGroupNumber == employeeDetails.groupNumber)
                {
                    return BadRequest("Cannot have same group numberas that of supervisor group number");
                }
                var timecardEmployeeRef = await _timecardContext.TimecardEmployeeDetails.FindAsync(id);
                if (timecardEmployeeRef == null)
                {
                    return BadRequest("Timecard employee details not found");
                }
                employeeDetails.OrgAccountId = OrgAccountId;
                employeeDetails.createdDate = timecardEmployeeRef.createdDate;
                employeeDetails.createdBy = timecardEmployeeRef.createdBy;
                _timecardContext.TimecardEmployeeDetails.Entry(timecardEmployeeRef).State = EntityState.Detached;
                _timecardContext.TimecardEmployeeDetails.Update(employeeDetails);
                await _timecardContext.SaveChangesAsync();

                return employeeDetails;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }


        [HttpGet("Schedule/{employeeId}")]
        public async Task<ActionResult<IEnumerable<TimecardEmployeeSchedule>>> GetEmployeeSchedule(int employeeId)
        {
            try
            {
                return await _timecardContext.TimecardEmployeeSchedules.Where(z => z.employeeId == employeeId && z.OrgAccountId == OrgAccountId).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
        [HttpPost("schedules")]
        public async Task<ActionResult<TimecardEmployeeSchedule>> EditEmployeeSchedule(TimecardEmployeeSchedule employeeSchedule)
        {
            try
            {
                employeeSchedule.OrgAccountId = OrgAccountId;
                _timecardContext.TimecardEmployeeSchedules.Add(employeeSchedule);
                await _timecardContext.SaveChangesAsync();
                return CreatedAtAction("GetSchedule", new { id = employeeSchedule.id }, employeeSchedule);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }


        [HttpPut("schedule")]
        public async Task<ActionResult<TimecardEmployeeSchedule>> UpdateEmployeeSchedule(int id, TimecardEmployeeSchedule employeeSchedule)
        {
            try
            {
                if (id != employeeSchedule.id)
                {
                    return BadRequest();
                }
                var empScheduleRef = await _timecardContext.TimecardEmployeeSchedules.FindAsync(id);
                if (empScheduleRef == null)
                {
                    return BadRequest("TimecardEmployeeSchedule not found with Id:" + id);
                }

                try
                {
                    employeeSchedule.OrgAccountId = OrgAccountId;
                    employeeSchedule.createdDate = empScheduleRef.createdDate;
                    employeeSchedule.createdBy = empScheduleRef.createdBy;
                    _timecardContext.TimecardEmployeeSchedules.Entry(empScheduleRef).State = EntityState.Detached;
                    _timecardContext.TimecardEmployeeSchedules.Update(employeeSchedule);
                    await _timecardContext.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)

                {

                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
            return CreatedAtAction("GetSchedule", new { id = employeeSchedule.id }, employeeSchedule);
        }

        /// <summary>
        /// create a schedule for employee
        /// </summary>
        /// <param name="employeeSchedules"></param>
        /// <returns></returns>
        [HttpPost("schedules/post")]
        public async Task<ActionResult<List<TimecardEmployeeScheduleOverride>>> CreateEmployeeSchedule([FromBody] List<TimecardEmployeeScheduleOverride> employeeSchedules, int scheduleType)
        {

            try
            {
                var timecardEmployeeSchedule = employeeSchedules.Select(x => x.timecardEmployeeScheduleId).FirstOrDefault();


                var schedule = await _timecardContext.TimecardEmpSchedules.FindAsync(timecardEmployeeSchedule);

                if (schedule == null)
                {
                    return BadRequest("Employee schedule not found with id:" + timecardEmployeeSchedule);
                }

                schedule.scheduleType = scheduleType;
                _timecardContext.TimecardEmpSchedules.Entry(schedule).State = EntityState.Detached;
                _timecardContext.TimecardEmpSchedules.Update(schedule);
                await _timecardContext.SaveChangesAsync();

                List<int> empScheduleIds = employeeSchedules.Select(x => x.timecardEmployeeScheduleId).Distinct().ToList();

                foreach (int empScheduleId in empScheduleIds)
                {
                    var scheduleId = await _timecardContext.TimecardEmployeeScheduleOverrides.Where(x => x.timecardEmployeeScheduleId == empScheduleId).ToListAsync();

                    if (scheduleId != null)
                    {
                        _timecardContext.TimecardEmployeeScheduleOverrides.RemoveRange(scheduleId);
                        await _timecardContext.SaveChangesAsync();
                    }
                }




                var isMultipleCalendarTypeRequest = employeeSchedules.Any(obj =>
            (obj.dayofWeek.HasValue ? 1 : 0) + ((obj.dayofMonth.HasValue) ? 1 : 0) + ((obj.startDateTime.Date != DateTime.MinValue || obj.endDateTime.Date != DateTime.MinValue) ? 1 : 0) > 1);
                var isMinimumCalendarTypeRequest = employeeSchedules.Any(obj =>
            (!obj.dayofWeek.HasValue ? 1 : 0) + (!obj.dayofMonth.HasValue ? 1 : 0) + ((obj.startDateTime.Date == DateTime.MinValue || obj.endDateTime.Date == DateTime.MinValue) ? 1 : 0) == 3);
                var outOfRangeValues = employeeSchedules.Any(x => x.dayofWeek > 6 || x.dayofWeek < 0 || x.dayofMonth > 31 || x.dayofMonth < 1);
                if (outOfRangeValues || employeeSchedules == null || employeeSchedules.Count < 1 || employeeSchedules.Any(x => x.employeeId <= 0) || employeeSchedules.GroupBy(x => x.employeeId).Count() > 1 || isMinimumCalendarTypeRequest || isMultipleCalendarTypeRequest || employeeSchedules.Any(x => x.startDateTime >= x.endDateTime))
                {
                    return BadRequest("Invalid request");
                }
                var employee = await _timecardContext.Employees.FirstOrDefaultAsync(x => x.id == employeeSchedules.FirstOrDefault().employeeId && x.OrgAccountId == OrgAccountId);
                if (employee == null)
                {
                    return BadRequest("Employee does not exists");
                }
                var timecardEmployeeScheduleOverride = _timecardContext.TimecardEmployeeScheduleOverrides.AsEnumerable().Where(y => y.employeeId == employeeSchedules.FirstOrDefault().employeeId
                 && employeeSchedules.Any(x =>
                 (
                     (
                         (x.dayofWeek.HasValue && y.dayofWeek.HasValue
                         && y.dayofWeek.Value == x.dayofWeek.Value)
                         ||
                         (x.dayofMonth.HasValue && y.dayofMonth.HasValue
                         && y.dayofMonth.Value == x.dayofMonth.Value)
                     )

                 &&
                     (
                         (y.startDateTime.TimeOfDay == x.startDateTime.TimeOfDay && y.endDateTime.TimeOfDay == x.endDateTime.TimeOfDay)
                         ||
                         (y.startDateTime.TimeOfDay > x.startDateTime.TimeOfDay && y.startDateTime.TimeOfDay < x.endDateTime.TimeOfDay)
                         ||
                         (y.startDateTime.TimeOfDay > x.startDateTime.TimeOfDay && y.endDateTime.TimeOfDay < x.endDateTime.TimeOfDay)
                         ||
                         (y.startDateTime.TimeOfDay < x.startDateTime.TimeOfDay && y.endDateTime.TimeOfDay > x.endDateTime.TimeOfDay)
                         ||
                         (y.endDateTime.TimeOfDay > x.startDateTime.TimeOfDay && y.endDateTime.TimeOfDay < x.endDateTime.TimeOfDay)
                     )

                 )
               ||
                 (
                     !y.dayofWeek.HasValue && !y.dayofMonth.HasValue && !x.dayofWeek.HasValue && !x.dayofMonth.HasValue
                     &&
                     (
                         (y.startDateTime == x.startDateTime && y.endDateTime == x.endDateTime)
                         ||
                         (y.startDateTime > x.startDateTime && y.startDateTime < x.endDateTime)
                         ||
                         (y.startDateTime > x.startDateTime && y.endDateTime < x.endDateTime)
                         ||
                         (y.startDateTime < x.startDateTime && y.endDateTime > x.endDateTime)
                         ||
                         (y.endDateTime > x.startDateTime && y.endDateTime < x.endDateTime)
                     )
                  )
                 )).ToList();

                if (timecardEmployeeScheduleOverride != null && timecardEmployeeScheduleOverride.Any())
                {
                    return BadRequest("Employee timecard schedule already exists");
                }
                foreach (var empSchedule in employeeSchedules)
                {
                    empSchedule.OrgAccountId = OrgAccountId;

                }
                _timecardContext.TimecardEmployeeScheduleOverrides.AddRange(employeeSchedules);
                await _timecardContext.SaveChangesAsync();
                return employeeSchedules;
            }

            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
        /// <summary>
        /// get calendar view of schedule for the employee with given date range
        /// </summary>
        /// <param name="employeeId"></param>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <returns></returns>
        [HttpGet("schedules/calendar-view/{employeeId}/{startDate}/{endDate}")]
        public async Task<ActionResult<List<TimecardEmployeeScheduleOverride>>> GetEmployeeSchedules(int employeeId, DateTime startDate, DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest("Start date can't be greater or equal to End date");
                }
                var employee = await _timecardContext.Employees.FindAsync(employeeId);
                if (employee == null)
                {
                    return BadRequest("Employees does not exists");
                }
                List<TimecardEmployeeScheduleOverride> responseList = new List<TimecardEmployeeScheduleOverride>();
                var employeeTimecardOverrideSlots = await _timecardContext.TimecardEmployeeScheduleOverrides.Where(z => z.employeeId == employeeId && ((!z.dayofWeek.HasValue && !z.dayofMonth.HasValue) && z.startDateTime >= startDate && z.endDateTime <= endDate)).ToListAsync();
                responseList.AddRange(employeeTimecardOverrideSlots);
                bool isAllDayNoSchedule = true;
                bool isLeaveExecutedfortheDay = false;

                var employeeTimecardOverrideSchedules = await _timecardContext.TimecardEmployeeScheduleOverrides.Include(x => x.Employee).Where(z => z.employeeId == employeeId && (((!z.dayofWeek.HasValue && !z.dayofMonth.HasValue) && z.startDateTime >= startDate && z.endDateTime <= endDate) || z.dayofWeek.HasValue || z.dayofMonth.HasValue)).ToListAsync();
                if (employeeTimecardOverrideSchedules != null && employeeTimecardOverrideSchedules.Count > 0 && employeeTimecardOverrideSchedules.Any(x => x.dayofWeek.HasValue || x.dayofMonth.HasValue))
                {
                    while (startDate <= endDate)
                    {
                        isLeaveExecutedfortheDay = false;
                        foreach (var schedule in employeeTimecardOverrideSchedules.ToList())
                        {
                            var response = new TimecardEmployeeScheduleOverride();
                            var matchingSchedules =
                             schedule.dayofWeek.HasValue && schedule.dayofWeek.Value == (int)startDate.DayOfWeek
                                 ? schedule
                                 : schedule.dayofMonth.HasValue && schedule.dayofMonth.Value == startDate.Day
                                     ? schedule
                                     : null;
                            if (matchingSchedules != null && (matchingSchedules.dayofWeek.HasValue || matchingSchedules.dayofMonth.HasValue))
                            {

                                response.id = schedule.id;
                                response.employeeId = schedule.employeeId;
                                response.dayofWeek = schedule.dayofWeek;
                                response.dayofMonth = schedule.dayofMonth;
                                response.createdDate = schedule.createdDate;
                                response.createdBy = schedule.createdBy;
                                response.modifiedDate = schedule.modifiedDate;
                                response.modifiedBy = schedule.modifiedBy;
                                response.startDateTime = startDate.Add(schedule.startDateTime.TimeOfDay);
                                response.endDateTime = startDate.Add(schedule.endDateTime.TimeOfDay);
                                response.Employee = schedule.Employee;

                                isAllDayNoSchedule = false;
                            }
                            //else if (!schedule.dayofWeek.HasValue && !schedule.dayofMonth.HasValue && schedule.startDateTime.Day == startDate.Day)
                            //{
                            //    response = schedule;
                            //}


                            if (response.id != 0)
                            {
                                responseList.Add(response);
                            }
                        }
                        startDate = startDate.AddDays(1);
                    }

                }
                return Ok(responseList);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
        private bool EmployeeDetailsExists(int EmpId, int id)
        {
            return _timecardContext.TimecardEmployeeDetails.Any(e => e.empId == EmpId && e.Id == id && e.OrgAccountId == OrgAccountId);
        }
        /// <summary>
        /// get all schedules of employee
        /// </summary>
        /// <param name="employeeId"></param>
        /// <returns></returns>
        [HttpGet("schedules")]
        public async Task<ActionResult<IEnumerable<TimecardEmployeeScheduleOverride>>> GeTimecardEmployeeSchedules(int employeeId)
        {
            try
            {
                var employeeSchedule = await _timecardContext.TimecardEmployeeScheduleOverrides.Where(x => x.employeeId == employeeId && x.OrgAccountId == OrgAccountId).ToListAsync();

                return Ok(employeeSchedule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
        /// <summary>
        /// get Get Timecard EmployeeSchedule By Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("schedules/{id}")]
        public async Task<ActionResult<IEnumerable<TimecardEmployeeScheduleOverride>>> GetTimecardEmployeeScheduleById(int id)
        {
            try
            {
                var employeeSchedule = await _timecardContext.TimecardEmployeeScheduleOverrides.FirstOrDefaultAsync(x => x.id == id);

                return Ok(employeeSchedule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        /// <summary>
        /// update a schedule for emplyee with id
        /// </summary>
        /// <param name="timecardEmployeeSchedules"></param>
        /// <returns></returns>
        [HttpPut("schedules")]
        public async Task<ActionResult<List<TimecardEmployeeScheduleOverride>>> EditTimecardEmployeeScheduleConfiguration([FromBody] List<TimecardEmployeeScheduleOverride> timecardEmployeeSchedules)
        {
            try
            {
                var isMultipleCalendarTypeRequest = timecardEmployeeSchedules.Any(obj =>
            (obj.dayofWeek.HasValue ? 1 : 0) + ((obj.dayofMonth.HasValue) ? 1 : 0) + ((obj.startDateTime.Date != DateTime.MinValue || obj.endDateTime.Date != DateTime.MinValue) ? 1 : 0) > 1);
                var isMinimumCalendarTypeRequest = timecardEmployeeSchedules.Any(obj =>
            (!obj.dayofWeek.HasValue ? 1 : 0) + (!obj.dayofMonth.HasValue ? 1 : 0) + ((obj.startDateTime.Date == DateTime.MinValue || obj.endDateTime.Date == DateTime.MinValue) ? 1 : 0) == 3);
                var outOfRangeValues = timecardEmployeeSchedules.Any(x => x.dayofWeek > 6 || x.dayofWeek < 0 || x.dayofMonth > 31 || x.dayofMonth < 1);
                if (outOfRangeValues || timecardEmployeeSchedules == null || timecardEmployeeSchedules.Count < 1 || timecardEmployeeSchedules.Any(x => x.employeeId <= 0) || timecardEmployeeSchedules.GroupBy(x => x.employeeId).Count() > 1 || isMinimumCalendarTypeRequest || isMultipleCalendarTypeRequest || timecardEmployeeSchedules.Any(x => x.startDateTime >= x.endDateTime))
                {
                    return BadRequest("Invalid request");
                }
                var employee = await _timecardContext.Employees.FirstOrDefaultAsync(x => x.id == timecardEmployeeSchedules.FirstOrDefault().employeeId);
                if (employee == null)
                {
                    return BadRequest("Employee does not exists");
                }
                var timecardEmployeeScheduleOverride = _timecardContext.TimecardEmployeeScheduleOverrides.AsEnumerable().Where(y => y.employeeId == timecardEmployeeSchedules.FirstOrDefault().employeeId
                 && timecardEmployeeSchedules.Any(x =>
                 (
                     (
                         (x.dayofWeek.HasValue && y.dayofWeek.HasValue
                         && y.dayofWeek.Value == x.dayofWeek.Value)
                         ||
                         (x.dayofMonth.HasValue && y.dayofMonth.HasValue
                         && y.dayofMonth.Value == x.dayofMonth.Value)
                     )

                 &&
                     (
                         (y.startDateTime.TimeOfDay == x.startDateTime.TimeOfDay && y.endDateTime.TimeOfDay == x.endDateTime.TimeOfDay)
                         ||
                         (y.startDateTime.TimeOfDay > x.startDateTime.TimeOfDay && y.startDateTime.TimeOfDay < x.endDateTime.TimeOfDay)
                         ||
                         (y.startDateTime.TimeOfDay > x.startDateTime.TimeOfDay && y.endDateTime.TimeOfDay < x.endDateTime.TimeOfDay)
                         ||
                         (y.startDateTime.TimeOfDay < x.startDateTime.TimeOfDay && y.endDateTime.TimeOfDay > x.endDateTime.TimeOfDay)
                         ||
                         (y.endDateTime.TimeOfDay > x.startDateTime.TimeOfDay && y.endDateTime.TimeOfDay < x.endDateTime.TimeOfDay)
                     )

                 )
               ||
                 (
                     !y.dayofWeek.HasValue && !y.dayofMonth.HasValue && !x.dayofWeek.HasValue && !x.dayofMonth.HasValue
                     &&
                     (
                         (y.startDateTime == x.startDateTime && y.endDateTime == x.endDateTime)
                         ||
                         (y.startDateTime > x.startDateTime && y.startDateTime < x.endDateTime)
                         ||
                         (y.startDateTime > x.startDateTime && y.endDateTime < x.endDateTime)
                         ||
                         (y.startDateTime < x.startDateTime && y.endDateTime > x.endDateTime)
                         ||
                         (y.endDateTime > x.startDateTime && y.endDateTime < x.endDateTime)
                     )
                  )
                 )).ToList();

                if (timecardEmployeeScheduleOverride != null && timecardEmployeeScheduleOverride.Any())
                {
                    return Conflict("Employee timecard schedule already exists");
                }
                foreach (var employeeSchedule in timecardEmployeeSchedules)
                {
                    var empScheduleRef = await _timecardContext.TimecardEmployeeScheduleOverrides.FindAsync(employeeSchedule.id);
                    if (empScheduleRef != null)
                    {
                        employeeSchedule.createdDate = empScheduleRef.createdDate;
                        employeeSchedule.createdBy = empScheduleRef.createdBy;
                        _timecardContext.TimecardEmployeeScheduleOverrides.Entry(empScheduleRef).State = EntityState.Detached;
                    }
                }
                _timecardContext.TimecardEmployeeScheduleOverrides.UpdateRange(timecardEmployeeSchedules);
                await _timecardContext.SaveChangesAsync();

                return timecardEmployeeSchedules;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
        /// <summary>
        /// delete a schedule for the employee by pk id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("Schedule/{id}")]
        public async Task<ActionResult<bool>> DeleteTimecardEmployeeScheduleConfiguration(int id)
        {
            try
            {
                var scheduleOverrideConfigurations = await _timecardContext.TimecardEmployeeScheduleOverrides.FindAsync(id);
                if (scheduleOverrideConfigurations == null)
                {
                    return BadRequest("Timecard employee schedule is not exist");
                }
                _timecardContext.TimecardEmployeeScheduleOverrides.Remove(scheduleOverrideConfigurations);

                await _timecardContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                return false;
            }
        }

        [Route("GroupNumber")]
        [HttpGet]
        public async Task<ActionResult<List<int>>> GetGroupNumbers()
        {
            try
            {
                return await _timecardContext.TimecardEmployeeDetails.Where(x => x.OrgAccountId == OrgAccountId).Select(x => x.groupNumber).Distinct().ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [Route("SupervisorGroupNumber")]
        [HttpGet]
        public async Task<ActionResult<List<int?>>> GetSupervisorGroupNumber()
        {
            try
            {
                return await _timecardContext.TimecardEmployeeDetails.Where(x => x.OrgAccountId == OrgAccountId && x.supervisorGroupNumber != null).Select(x => x.supervisorGroupNumber).Distinct().ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
        [HttpPost("EmpSchedule/post")]

        public async Task<ActionResult<TimecardEmpSchedule>> CreateTimecardEmpSchedule(TimecardEmpSchedule empSchedule)
        {
            try
            {
                if (empSchedule == null)
                {
                    return BadRequest("Employee Timecard schedule is not exist");
                }

                if (string.IsNullOrEmpty(empSchedule.timecardEmployeeScheduleName))
                {
                    return BadRequest($"Schedule name should not be empty");
                }

                var scheduleHeader = await _timecardContext.TimecardEmpSchedules
                    .FirstOrDefaultAsync(z => z.timecardEmployeeScheduleName == empSchedule.timecardEmployeeScheduleName
                    && z.employeeId == empSchedule.employeeId && z.ORG_ID == OrgAccountId);

                if (scheduleHeader != null)
                {
                    return BadRequest($"Employee schedule name already exist for same {empSchedule.timecardEmployeeScheduleName}");
                }
                empSchedule.ORG_ID = OrgAccountId;
                _timecardContext.TimecardEmpSchedules.Add(empSchedule);
                await _timecardContext.SaveChangesAsync();

                return empSchedule;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpGet("{empId}")]
        public async Task<ActionResult<List<TimecardEmpSchedule>>> GetTimecardEmpSchedules(int empId)
        {

            try
            {

                var empSchedule = await _timecardContext.TimecardEmpSchedules.Where(z => z.employeeId == empId && z.ORG_ID == OrgAccountId).ToListAsync();

                if (empSchedule == null)
                {
                    return BadRequest("Schedule not found for this employee");
                }

                return empSchedule;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [Route("ByScheduleId")]
        [HttpDelete]
        public async Task<ActionResult<ScheduleDto>> DeleteTimecardSchedulById(int empScheduleId)
        {
            try
            {
                

                var empScheduleOverride = await _timecardContext.TimecardEmployeeScheduleOverrides.Where(z => z.timecardEmployeeScheduleId == empScheduleId & z.OrgAccountId == OrgAccountId).ToListAsync();
                ScheduleDto scheduleDto = new ScheduleDto();

                _timecardContext.TimecardEmployeeScheduleOverrides.RemoveRange(empScheduleOverride);
                await _timecardContext.SaveChangesAsync();

                var empSchedule = await _timecardContext.TimecardEmpSchedules.FirstOrDefaultAsync(z => z.timecardEmployeeScheduleId == empScheduleId);
                _timecardContext.TimecardEmpSchedules.Remove(empSchedule);

                await _timecardContext.SaveChangesAsync();

                return scheduleDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message + ", " + ex.StackTrace);
                throw;
            }
        }

        [Route("ByScheduleId")]
        [HttpGet]
        public async Task<ActionResult<ScheduleDto>> GetTimecardSchedulById(int empScheduleId)
        {
            try
            {
                var empSchedule = await _timecardContext.TimecardEmployeeScheduleOverrides.Where(z => z.timecardEmployeeScheduleId == empScheduleId & z.OrgAccountId == OrgAccountId).ToListAsync();
                ScheduleDto scheduleDto = new ScheduleDto();
                if (empSchedule == null || empSchedule.Count == 0)
                {
                    return scheduleDto;
                }

                scheduleDto.StartDateTime = empSchedule.Max(e => e.startDateTime);
                scheduleDto.EndDateTime = empSchedule.Max(e => e.endDateTime);
                scheduleDto.jobId = empSchedule.Select(e => e.jobDescriptionId).FirstOrDefault();
                scheduleDto.ScheduleType = await _timecardContext.TimecardEmpSchedules.Where(z => z.timecardEmployeeScheduleId == empScheduleId & z.ORG_ID == OrgAccountId).Select(X => X.scheduleType).FirstOrDefaultAsync();
                if (scheduleDto.ScheduleType == 1)
                {
                    List<DayWeek> dayWeek = new List<DayWeek>();
                    foreach (var emp in empSchedule)
                    {
                        DayWeek day = new DayWeek();
                        day.Id = emp.dayofWeek.Value;
                        day.Text = ((DayOfWeek)emp.dayofWeek.Value).ToString();
                        dayWeek.Add(day);
                    }
                    scheduleDto.DayWeeks = dayWeek;

                }
                else
                {
                    scheduleDto.DayWeeks = [];
                }


                return scheduleDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpGet("EmployeeDetail")]
        public async Task<ActionResult<List<TimecardEmployeeDetails>>> GetEmployeeDetail()
        {
            try
            {
                var supervisor = await _timecardContext.TimecardEmployeeDetails
                    .Where(x => x.empId == MemberId && x.OrgAccountId == OrgAccountId)
                    .FirstOrDefaultAsync();
                if (supervisor == null)
                {
                    return Ok("Timecard_Member_Not_Found");
                }

                return Ok(supervisor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [Route("ByGroupNumber")]
        [HttpGet]
        public async Task<ActionResult> ByGroupNumber()
        {
            try
            {
                var timcardEmployee = await _timecardContext.TimecardEmployeeDetails.Where(x => x.empId == MemberId).FirstOrDefaultAsync();
                if (timcardEmployee == null)
                {
                    return Ok("Timecard_Member_Not_Found");
                }
                //Appointing Authority view their group only
                //var setting = await _timecardContext.SettingsValue.Where(x => x.settingsId == 94).Select(x => x.settingValue).FirstOrDefaultAsync();
                var empIds = TimecardCommon.GetSupervisorsEmployeeIds(DateTime.Today, MemberId, _timecardContext);

                var empList = await _timecardContext.TimecardEmployeeDetails.Include(x => x.Employee)
                    .Where(x => empIds.Contains(x.empId))
                    .Select(x => new
                    {
                        EmpId = x.empId,
                        FullName = x.Employee.lastName+", "+x.Employee.firstName,
                        x.isSupervisor,
                        x.IsPayrollSpecialist,
                        x.isTimecardSuppresed,
                        x.isRunPayrollEnabled,
                        x.supervisorGroupNumber
                    }).OrderBy(x => x.FullName)
                    .ToListAsync();

                return Ok(new { data = empList, Total = empList.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

    }
}

