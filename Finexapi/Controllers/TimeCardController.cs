using FinexAPI.Data;
using FinexAPI.Formulas;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using FinexAPI.Rules;
using FinexAPI.Dtos;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class TimeCardController : BaseController
    {
        private readonly ILogger<TimeCardController> _logger;
        private readonly ILogger<TCEmployeeController> _tclogger;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly FinexAppContext _context;


        public TimeCardController(IHttpContextAccessor contextAccessor, FinexAppContext context
            , ILogger<TimeCardController> logger, ILogger<TCEmployeeController> tclogger) : base(contextAccessor)
        {
            _context = context;
            _logger = logger;
            _tclogger = tclogger;
            _contextAccessor = contextAccessor;

        }
        /// <summary>
        /// TimeCardReports
        /// </summary>
        /// <param name="empId"></param>
        /// <param name="startYear"></param>
        /// <param name="endYear"></param>
        /// <returns></returns>
        [HttpGet("filter")]
        public async Task<ActionResult<List<TimeCardHeaders>>> GetTimeCardReports(int? empId, int? startYear, int? endYear, bool desc, string sortKey = "modifiedDate", int? skip = 0, int? pageCount = 10)
        {
            try
            {
                if (empId.HasValue && !TimecardCommon.HasTimecardDataAccess(_context, MemberId, empId.Value))
                {
                    return Forbid();
                }

                if (empId == null)
                {
                    empId = MemberId;
                }
                if (!startYear.HasValue)
                {
                    startYear = DateTime.Now.Year - 1;
                }

                if (!endYear.HasValue)
                {
                    endYear = DateTime.Now.Year;
                }
                var employee = empId.HasValue ? await _context.TimecardEmployeeDetails.FirstOrDefaultAsync(x => empId.HasValue ? x.empId == empId.Value : true && x.OrgAccountId == OrgAccountId) : null;
                if (employee == null && empId.HasValue)
                {
                    return BadRequest("Employee Id does not exists in Employee Table");
                }
                var timecardHeader = await _context.TimeCardHeaders.Where(x => x.OrgAccountId == OrgAccountId
                                                    && (empId.HasValue && empId > 0 ? x.empID == empId.Value : true)
                                                    && (x.startDate.Year == startYear.Value)).OrderByCustom(sortKey, desc)
                .ToListAsync();

                var total = timecardHeader.Count();
                var records = timecardHeader.Skip(skip.Value).Take(pageCount.Value).ToList();

                foreach (var entry in timecardHeader)
                {
                    var timecardDetails = await _context.TimeCards.Where(a => a.timeCardHeaderID == entry.ID).ToListAsync();
                    foreach (var tentry in timecardDetails)
                    {
                        if (tentry.supApproved == null || !tentry.supApproved.Value)
                        {
                            entry.supApprovalDate = null;
                        }
                    }
                }

                return Ok(new { records, total });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }



        /// <summary>
        /// TimeCardReports CREATE
        /// </summary>
        /// <param name="timeCardHeader"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<bool>> CreateTimeCardHeader([FromBody] TimeCardHeaders timeCardHeader)
        {
            try
            {
                if (timeCardHeader == null)
                {
                    return BadRequest();
                }
                if (timeCardHeader.startDate >= timeCardHeader.endDate)
                {
                    return BadRequest("Start date can't be greater or equal to End date");
                }
                if (timeCardHeader.supApproved.HasValue || timeCardHeader.hRApproved.HasValue)
                {
                    return BadRequest("SupApproved/HRApproved cannot have a value while creating a Header");
                }
                if (timeCardHeader.empID <= 0)
                {
                    return BadRequest("Invalid EmpID");
                }
                var employee = await _context.TimecardEmployeeDetails.FirstOrDefaultAsync(x => x.empId == timeCardHeader.empID && x.OrgAccountId == OrgAccountId);
                if (employee == null)
                {
                    return BadRequest("Employees does not exists");
                }
                //var employeeLeaves = await _context.LeaveRequest.Where(x => x.BeginDate >= timeCardHeader.StartDate && x.EndDate <= timeCardHeader.EndDate && timeCardHeader.EmpID == x.EmpId).ToListAsync();
                //var holidaySchedule = await _context.HolidayScheduleHeaders.Where(x => timeCardHeader.OrgAccId == x.organizationId).ToListAsync();
                //List<HolidayScheduleDate> holidayScheduleDate = new List<HolidayScheduleDate>();

                //foreach (var holiday in holidaySchedule)
                //{
                //    var holidayScheduleDates = await _context.HolidayScheduleDates.Where(x => x.date >= timeCardHeader.StartDate && x.date <= timeCardHeader.EndDate && holiday.id == x.holidayScheduleId).ToListAsync();
                //    holidayScheduleDate.AddRange(holidayScheduleDates);
                //}
                //List<TimeCards> tcLRList= new List<TimeCards>();
                //foreach (var leave in employeeLeaves)
                //{
                //    TimeCards tc=new TimeCards();
                //    tc.StartDateTime = leave.BeginDate;
                //    tc.EndDateTime = leave.EndDate;
                //    tc.Hours = (tc.EndDateTime - tc.StartDateTime).Hours;
                //    tc.EmpID = timeCardHeader.EmpID;
                //    tc.TimeCardHeaderID = timeCardHeader.ID;
                //    tc.JobID = leave?.Job.Value;
                //    tc.LeaveTypeID = leave?.LeaveTypeID;
                //    tc.LeaveCodeID = leave?.LeaveCodeID;
                //    tc.SupervisorID = leave?.SupervisorID;
                //    tc.CreatedUser = "CurrentUser";
                //    tc.CreatedDate = DateTime.Now;
                //    tcLRList.Add(tc);
                //}
                //List<TimeCards> tcHList = new List<TimeCards>();
                //foreach (var holiday in holidayScheduleDate)
                //{
                //    TimeCards tc = new TimeCards();
                //    tc.StartDateTime = holiday.date.Date;
                //    tc.EndDateTime = holiday.date.Date.AddDays(1).AddMinutes(-1);
                //    tc.Hours = (tc.EndDateTime - tc.StartDateTime).Hours;
                //    tc.EmpID = timeCardHeader.EmpID;
                //    tc.TimeCardHeaderID = timeCardHeader.ID;
                //    tc.CreatedUser = "CurrentUser";
                //    tc.CreatedDate = DateTime.Now;
                //    tcHList.Add(tc);
                //}
                //_context.TimeCards.AddRange(tcHList);
                //_context.TimeCards.AddRange(tcLRList);
                timeCardHeader.OrgAccountId = OrgAccountId;
                _context.TimeCardHeaders.AddRange(timeCardHeader);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        /// <summary>
        /// add TimeCardHeader
        /// </summary>
        /// <param name="timeCardHeader"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<bool>> UpdateTimeCardHeader(int id, [FromBody] TimeCardHeaders timeCardHeader)
        {
            try
            {
                if (timeCardHeader.ID != id)
                {
                    return BadRequest();
                }
                if (timeCardHeader.startDate >= timeCardHeader.endDate)
                {
                    return BadRequest("Start date can't be greater or equal to End date");
                }
                var employee = await _context.TimecardEmployeeDetails.FirstOrDefaultAsync(x => x.empId == timeCardHeader.empID && x.OrgAccountId == OrgAccountId);
                if (employee == null)
                {
                    return BadRequest("Employee Id does not exists in Employees table");
                }
                var headerRef = await _context.TimeCardHeaders.FindAsync(id);
                if (headerRef == null)
                {
                    return BadRequest("Timecard Header not found with given id" + id);
                }
                timeCardHeader.OrgAccountId = OrgAccountId;
                timeCardHeader.createdBy = headerRef.createdBy;
                timeCardHeader.createdDate = headerRef.createdDate;
                _context.TimeCardHeaders.Entry(headerRef).State = EntityState.Detached;
                _context.TimeCardHeaders.Update(timeCardHeader);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }
        /// <summary>
        /// Get TimeCard By Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>

        [HttpGet("Detail/{id}")]
        public async Task<ActionResult<TimeCards>> GetTimeCardById(int id)
        {
            try
            {
                var timeCards = await _context.TimeCards.FirstOrDefaultAsync(x => x.ID == id);

                if (timeCards == null)
                {
                    return BadRequest("Timecard entry not found");
                }

                return Ok(timeCards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [HttpGet("GetVSP/{empId}")]
        public async Task<ActionResult<VSPDto>> GetVSP(int empId)
        {
            try
            {
                VSPDto vspData = LeaveBalanceCalculations.GetVSP(_context, empId);

                return Ok(vspData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        /// <summary>
        /// process the schedule of employee into timecard table
        /// </summary>
        /// <returns></returns>
        [HttpPost("time-card-schedule")]
        public async Task<ActionResult<bool>> CreateTimeCardByEmployeeSchedule(int empId, DateTime startDate, DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest("Start date can't be greater or equal to End date");
                }
                var employee = await _context.Employees.FirstOrDefaultAsync(x => x.id == empId && x.OrgAccountId == OrgAccountId);
                if (employee == null)
                {
                    return BadRequest("Employees does not exists");
                }

                TCEmployeeController TCEmployee = new TCEmployeeController(_contextAccessor, _context, _tclogger);
                var employeeTimecardOverrides = await TCEmployee.GetEmployeeSchedules(empId, startDate, endDate);
                List<TimeCards> timeCards = new List<TimeCards>();
                var schedule = (OkObjectResult)employeeTimecardOverrides.Result;
                var scheduleList = schedule.Value as IEnumerable<TimecardEmployeeScheduleOverride>;
                foreach (var item in scheduleList)
                {
                    if ((item.endDateTime - item.startDateTime).Hours > 0)
                    {
                        TimeCards timeCard = new TimeCards();
                        timeCard.startDateTime = item.startDateTime;
                        timeCard.endDateTime = item.endDateTime;
                        timeCard.empID = empId;
                        timeCard.OrgAccountId = employee.OrgAccountId;
                        timeCard.hours = (item.endDateTime - item.startDateTime).Hours;
                        timeCards.Add(timeCard);
                    }
                }

                _context.TimeCards.AddRange(timeCards);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }
        /// <summary>
        /// Get TimeCard By Employee Id
        /// </summary>
        /// <param name="empId"></param>
        /// <returns></returns>
        [HttpGet("{id}/Detail")]
        public async Task<ActionResult<IEnumerable<TimeCards>>> GetAllTimeCards(int? id, bool desc, string sortKey = "modifiedDate")
        {
            try
            {

                var timeCards = await _context.TimeCards.
                    Include(x => x.FMLAType)
                    .Where(x => id.HasValue ? x.timeCardHeaderID == id : true).ToListAsync();

                if (timeCards == null || !timeCards.Any())
                {
                    //return BadRequest($"Time card does not exist with TimeCardHeaderID {id}");
                    return Ok(new List<TimeCards>());
                }

                var highlightSupRow = id.HasValue;
                var empId = timeCards.FirstOrDefault()!.empID;
                Employee employee = null;
                foreach (var timeCard in timeCards)
                {
                    //var empJobInfo = await _payrollEmployeeContext.EmployeeJobInfos.FindAsync(timeCard.jobID);
                    timeCard.LeaveType = await _context.LeaveTypes.Where(x => x.id == timeCard.leaveTypeID).Select(x => x.description).FirstOrDefaultAsync();
                    if (timeCard.jobID.HasValue)
                    {
                        timeCard.Job = await _context.PayrollJobDescriptions.Where(x => x.Id == timeCard.jobID.Value).Select(x => x.empJobDescription).FirstOrDefaultAsync();
                    }
                    timeCard.HourlyType = await _context.CodeValues.Where(x => x.Id == timeCard.hourTypeID).Select(x => x.value).FirstOrDefaultAsync();
                    if (timeCard.FMLAType == null)
                    {
                        timeCard.FMLAType = new CodeValues();
                    }

                    if (highlightSupRow)
                    {
                        if (employee == null)
                            employee = await _context.Employees.FirstOrDefaultAsync(x => x.id == empId);

                        timeCard.AddedByOthers = employee.userName != timeCard.createdBy;
                    }
                }

                var propertyNames = sortKey.Split('.');
                var parameter = Expression.Parameter(typeof(TimeCards), "x");
                Expression property = parameter;
                foreach (var propertyName in propertyNames)
                {
                    property = Expression.PropertyOrField(property, propertyName);
                }
                var lamda = Expression.Lambda<Func<TimeCards, object>>(Expression.Convert(property, typeof(object)), parameter);
                return desc ? timeCards.AsQueryable().OrderByDescending(lamda).ToList() : timeCards.AsQueryable().OrderBy(lamda).ToList();

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }
        /// <summary>
        /// create timecard for employee
        /// </summary>
        /// <param name="timeCard"></param>
        /// <returns></returns>
        [HttpPost("Detail")]
        public async Task<ActionResult<TimeCards>> CreateTimeCard([FromBody] TimeCards timeCard)
        {
            try
            {
                timeCard.startDateTime = timeCard.startDateTime.AddSeconds(-1 * timeCard.startDateTime.Second);
                timeCard.endDateTime = timeCard.endDateTime.Value.AddSeconds(-1 * timeCard.endDateTime.Value.Second);
                _logger.LogError("1.----------Start & End DateTime----------");
                if (timeCard == null)
                {
                    return BadRequest();
                }
                if (timeCard.startDateTime >= timeCard.endDateTime)
                {
                    return BadRequest("Start time can't be greater or equal to End time");
                }
                if (!timeCard.timeCardHeaderID.HasValue)
                {
                    return BadRequest("TimeCardHeaderID is not provided");
                }

                DateTime startDateTimeToCheck = timeCard.startDateTime.AddMinutes(1);
                DateTime endDateTimeToCheck = timeCard.endDateTime.Value.AddMinutes(-1);

                var lastPaid = await _context.PayrollTotals.Where(x => x.OrgAccountId == OrgAccountId && x.empId == timeCard.empID).OrderByDescending(x => x.prDatePaid).FirstOrDefaultAsync();
                //#temp check for sunil we need to remove post date check later
                if (lastPaid != null && timeCard.startDateTime.Date < lastPaid.prDatePaid.Value.Date && lastPaid.postDate.HasValue)
                {
                    return BadRequest("Start Date must be greater than last paid.");
                }
                _logger.LogError("2.----------Start & End DateTime----------");

                var employee = await _context.TimecardEmployeeDetails.FirstOrDefaultAsync(x => x.empId == timeCard.empID && x.OrgAccountId == OrgAccountId);
                if (employee == null)
                {
                    return BadRequest("Employees does not exists");
                }
                _logger.LogError("3.----------Start & End DateTime----------");

                var hoursTypeHoliday = _context.CodeValues.Where(x => x.value == "Holiday" && x.CODE_TYPE_ID == 11).Select(h => h.Id).FirstOrDefault();
                var existingTimecard = _context.TimeCards.AsEnumerable()
                    .Where(y => y.empID == timeCard.empID && y.hourTypeID != hoursTypeHoliday
                    && y.startDateTime <= endDateTimeToCheck && startDateTimeToCheck <= y.endDateTime
                ).ToList();
                _logger.LogError("4.----------Start & End DateTime----------");
                if (existingTimecard != null && existingTimecard.Any())
                {
                    return Conflict("Employee timecard already exists");
                }

                var timeCardHeaders = await _context.TimeCardHeaders.FirstOrDefaultAsync(x => x.ID == timeCard.timeCardHeaderID.Value);
                if (!(timeCard.startDateTime.Date >= timeCardHeaders.startDate.Date && timeCard.endDateTime.Value.Date <= timeCardHeaders.endDate.Value.Date))
                {
                    return BadRequest("Timecard range does not exist between the time range of time card header");
                }
                _logger.LogError("5.----------Start & End DateTime----------");

                if (timeCard.leaveTypeID.HasValue)
                {
                    var dayOfWeekLeaveStart = (int)timeCard.startDateTime!.DayOfWeek;
                    List<Schedules> schedules = new List<Schedules>();
                    var startDaySchedule = _context.TimecardEmployeeScheduleOverrides.Where(x => x.employeeId == timeCard.empID && x.dayofWeek.Value == dayOfWeekLeaveStart).ToList();
                    var hasEmpSchedule = startDaySchedule.Any();
                    _logger.LogError("6.----------Start & End DateTime----------");
                    var tempLeaveStartDate = timeCard.startDateTime;
                    var tempLeaveEndDate = timeCard.endDateTime.Value;

                    while (tempLeaveStartDate.Date <= tempLeaveEndDate.Date)
                    {
                        int dayOfWeek = (int)tempLeaveStartDate.DayOfWeek;
                        if (hasEmpSchedule)
                        {
                            var scheduleData = _context.TimecardEmployeeScheduleOverrides.AsNoTracking()
                                .Where(x => x.employeeId == timeCard.empID && x.dayofWeek == dayOfWeek).ToList();
                            _logger.LogError("7.----------Start & End DateTime----------");
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
                                _logger.LogError("8.----------Start & End DateTime----------");
                            }
                        }

                        tempLeaveStartDate = tempLeaveStartDate.AddDays(1);
                    }

                    if (hasEmpSchedule)
                    {
                        _logger.LogError("9.----------Start & End DateTime----------");
                        var validBeginSchedule = schedules.Any(emp =>
                       timeCard.startDateTime >= emp.startDateTime &&
                       timeCard.startDateTime <= emp.endDateTime);

                        var validEndSchedule = schedules.Any(emp =>
                        timeCard.endDateTime >= emp.startDateTime &&
                        timeCard.endDateTime <= emp.endDateTime);
                        _logger.LogError("10.----------Start & End DateTime----------");
                        if (!validBeginSchedule || !validEndSchedule)
                        {
                            return BadRequest("Enter valid start/end time");
                        }

                        var leaveType = _context.LeaveTypes.FirstOrDefault(x => x.id == timeCard.leaveTypeID);
                        var requestedTotalHrs = Math.Round(Convert.ToDecimal((timeCard.endDateTime.Value - timeCard.startDateTime).TotalHours), 2);
                        _logger.LogError("11.----------Start & End DateTime----------");
                        var leaveTypeDesc = (leaveType?.description ?? "").ToLower();

                        if (leaveTypeDesc.Contains("sick")
                        || leaveTypeDesc.Contains("vacation")
                        || leaveTypeDesc.Contains("personal")
                        || leaveTypeDesc.Contains("comp")
                        || leaveTypeDesc.Contains("fed")
                        || leaveTypeDesc.Contains("emergency fmla")
                        )
                        {
                            var availableHrs = LeaveBalanceCalculations.GetLeaveBalanceByType(_context, timeCard.empID, leaveTypeDesc);
                            _logger.LogError("12.----------Start & End DateTime----------");
                            if (!(leaveTypeDesc.Contains("sick") || leaveTypeDesc.Contains("vacation")) && availableHrs != -1000 && availableHrs < requestedTotalHrs)
                                return BadRequest("Negative leave balance is not allowed");

                            var allowNegative = await _context.SettingsValue.Where(x => x.settingsId == 62).Select(x => x.settingValue).FirstOrDefaultAsync();
                            if (availableHrs != -1000 && availableHrs < requestedTotalHrs && !string.IsNullOrEmpty(allowNegative) && allowNegative == "1")
                                return BadRequest("Negative leave balance is not allowed");
                        }
                    }
                }

                DateTime entryStartTime = DateTime.Now;
                DateTime entryEndTime = DateTime.Now;
                _logger.LogError("13.----------Start & End DateTime----------");
                var enforce7MinRule = await _context.SettingsValue.Where(x => x.settingsId == 60).Select(x => x.settingValue).FirstOrDefaultAsync();
                if (enforce7MinRule != null && enforce7MinRule == "1")
                {
                    entryStartTime = LeaveBalanceCalculations.SevenMinuteRule(timeCard.startDateTime);
                    _logger.LogError("14.----------Start & End DateTime----------");
                    if (timeCard.endDateTime != null)
                    {
                        entryEndTime = LeaveBalanceCalculations.SevenMinuteRule(timeCard.endDateTime.Value);
                        timeCard.hours = (entryEndTime - entryStartTime).TotalHours;
                    }
                    _logger.LogError("15.----------Start & End DateTime----------");
                }
                else
                {
                    _logger.LogError("16.----------Start & End DateTime----------");
                    var enforce3MinRule = await _context.SettingsValue.Where(x => x.settingsId == 61).Select(x => x.settingValue).FirstOrDefaultAsync();
                    if (enforce3MinRule != null && enforce3MinRule == "1")
                    {
                        entryStartTime = LeaveBalanceCalculations.ThreeMinuteRule(timeCard.startDateTime);
                        _logger.LogError("17.----------Start & End DateTime----------");
                        if (timeCard.endDateTime != null)
                        {
                            entryEndTime = LeaveBalanceCalculations.ThreeMinuteRule(timeCard.endDateTime.Value);
                            timeCard.hours = (entryEndTime - entryStartTime).TotalHours;
                        }
                    }
                    _logger.LogError("18.----------Start & End DateTime----------");
                }

                timeCard.OrgAccountId = timeCardHeaders.OrgAccountId;
                //if i have a timecard for 40hr/week  and i have a OT of 5 hr then im eligible for 1.5 rule
                //else if i have a 40 hr/week time card and in that i have a 8 hr as leaverequest then im not elgible for 1.5 * rule               
                //if a an employee is off/break today then she is not allowed to choose OT as hour types, Rather she has to choose straight time according to labor rules
                //if a employee is on leave already for the duration which is mentioned in timecard  , what action has to be taken?
                //timeCard.StartDateTime = DateTime.Now;  //clock in should be current time and not taken by user/client
                _context.TimeCards.Add(timeCard);
                await _context.SaveChangesAsync();
                _logger.LogError("19.----------Start & End DateTime----------");
                var timeCardHeadersDetails = await _context.TimeCardHeaders.FirstOrDefaultAsync(x => x.ID == timeCard.timeCardHeaderID.Value);
                LeaveBalanceCalculations.GetTimeCardVacaSick(timeCardHeadersDetails.ID, OrgAccountId, timeCardHeadersDetails.empID, timeCardHeadersDetails.startDate, timeCardHeadersDetails.endDate, false, _context);
                _logger.LogError("20.----------Start & End DateTime----------");
                return timeCard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        /// <summary>
        /// edit time card for employee
        /// </summary>
        /// <param name="id"></param>
        /// <param name="timeCard"></param>
        /// <returns></returns>

        [HttpPut("Detail/{id}")]
        public async Task<ActionResult<TimeCards>> EditTimeCard(int id, TimeCards timeCard)
        {
            try
            {
                if (id != timeCard.ID)
                {
                    return BadRequest();
                }

                if (timeCard.startDateTime >= timeCard.endDateTime)
                {
                    return BadRequest("Start date should be less than End date time");
                }

                var timeCardEntity = await _context.TimeCards.FirstOrDefaultAsync(x => x.ID == id);

                if (timeCardEntity == null)
                {
                    return BadRequest("TimeCard entry not found");
                }
                if (!timeCard.timeCardHeaderID.HasValue)
                {
                    return BadRequest("TimeCardHeaderID is not provided");
                }

                DateTime startDateTimeToCheck = timeCard.startDateTime.AddMinutes(1);
                DateTime endDateTimeToCheck = timeCard.endDateTime.Value.AddMinutes(-1);

                var hoursTypeHoliday = _context.CodeValues.Where(x => x.value == "Holiday" && x.CODE_TYPE_ID == 11).Select(h => h.Id).FirstOrDefault();
                var existingTimecard = _context.TimeCards.AsEnumerable()
                    .Where(y => y.empID == timeCard.empID && y.ID != timeCard.ID && y.hourTypeID != hoursTypeHoliday
                    && y.startDateTime <= endDateTimeToCheck && startDateTimeToCheck <= y.endDateTime
                ).ToList();

                if (existingTimecard != null && existingTimecard.Any())
                {
                    return Conflict("Employee timecard already exists");
                }

                var timeCardHeaders = await _context.TimeCardHeaders.FirstOrDefaultAsync(x => x.ID == timeCard.timeCardHeaderID.Value);
                if (!(timeCard.startDateTime.Date >= timeCardHeaders.startDate.Date && timeCard.endDateTime.Value.Date <= timeCardHeaders.endDate.Value.Date))
                {
                    return BadRequest("Timecard range does not exist between the time range of time card header");
                }

                DateTime entryStartTime = DateTime.Now;
                DateTime entryEndTime = DateTime.Now;

                var enforce7MinRule = await _context.SettingsValue.Where(x => x.settingsId == 60).Select(x => x.settingValue).FirstOrDefaultAsync();
                if (enforce7MinRule != null && enforce7MinRule == "1")
                {
                    entryStartTime = LeaveBalanceCalculations.SevenMinuteRule(timeCard.startDateTime);
                    if (timeCard.endDateTime != null)
                    {
                        entryEndTime = LeaveBalanceCalculations.SevenMinuteRule(timeCard.endDateTime.Value);
                        timeCard.hours = (entryEndTime - entryStartTime).TotalHours;
                    }
                }
                else
                {
                    var enforce3MinRule = await _context.SettingsValue.Where(x => x.settingsId == 61).Select(x => x.settingValue).FirstOrDefaultAsync();
                    if (enforce3MinRule != null && enforce3MinRule == "1")
                    {
                        entryStartTime = LeaveBalanceCalculations.ThreeMinuteRule(timeCard.startDateTime);
                        if (timeCard.endDateTime != null)
                        {
                            entryEndTime = LeaveBalanceCalculations.ThreeMinuteRule(timeCard.endDateTime.Value);
                            timeCard.hours = (entryEndTime - entryStartTime).TotalHours;
                        }
                    }
                }

                _context.Entry(timeCardEntity).State = EntityState.Detached;
                timeCardEntity = timeCard;
                timeCardEntity.OrgAccountId = timeCardHeaders.OrgAccountId;
                _context.TimeCards.Update(timeCard);
                await _context.SaveChangesAsync();
                var timeCardHeadersDetails = await _context.TimeCardHeaders.FirstOrDefaultAsync(x => x.ID == timeCard.timeCardHeaderID.Value);
                LeaveBalanceCalculations.GetTimeCardVacaSick(timeCardHeadersDetails.ID, OrgAccountId, timeCardHeadersDetails.empID, timeCardHeadersDetails.startDate, timeCardHeadersDetails.endDate, false, _context);

                return timeCard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        /// <summary>
        /// delete a timecard by id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("Detail/{id}")]
        public async Task<ActionResult<bool>> DeleteTimeCard(int id)
        {
            try
            {
                var timeCard = await _context.TimeCards.FindAsync(id);
                if (timeCard == null)
                {
                    return BadRequest("Timecard entry not found");
                }

                _context.TimeCards.Remove(timeCard);
                await _context.SaveChangesAsync();
                var timeCardHeadersDetails = await _context.TimeCardHeaders.FirstOrDefaultAsync(x => x.ID == timeCard.timeCardHeaderID.Value);
                LeaveBalanceCalculations.GetTimeCardVacaSick(timeCardHeadersDetails.ID, OrgAccountId, timeCardHeadersDetails.empID, timeCardHeadersDetails.startDate, timeCardHeadersDetails.endDate, false, _context);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }
        /// <summary>
        /// Get Employee For Day
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("EmployeeeForDay")]
        public async Task<ActionResult<List<TimeCards>>> GetEmployeesForDay(int? groupId, int? supervisorGroupId, DateTime? date, bool desc, string sortKey = "modifiedDate")
        {
            try
            {
                if (!date.HasValue)
                {
                    date = DateTime.Now;
                }
                //TCEmployeeController TCEmployee = new TCEmployeeController(_contextAccessor, _context, _tclogger);
                List<TimeCards> timecardEmployeeSchedules = new List<TimeCards>();
                var timecardEmployees = await _context.TimecardEmployeeDetails.Where(x => x.OrgAccountId == OrgAccountId
                && groupId.HasValue ? x.groupNumber == groupId.Value : true
                && supervisorGroupId.HasValue ? x.supervisorGroupNumber == supervisorGroupId.Value : true).ToListAsync();
                foreach (var item in timecardEmployees)
                {
                    DateTime dateTime = (DateTime)date;

                    //TimeCards timeCard = await _context.TimeCards.Include(x => x.Employee).
                    //   Where(z => z.empID == item.empId && z.startDateTime.Year == dateTime.Year && z.startDateTime.Month == dateTime.Month && z.startDateTime.Day == dateTime.Day).FirstOrDefaultAsync();
                    TimeCards timeCard = await _context.TimeCards.Include(x => x.Employee).
                       Where(z => z.empID == item.empId && z.startDateTime.Date == dateTime.Date && (z.leaveTypeID == 0 || z.leaveTypeID == null)).FirstOrDefaultAsync();
                    if (timeCard != null)
                    {
                        timeCard.LeaveType = await _context.LeaveTypes.Where(x => x.id == timeCard.leaveTypeID).Select(x => x.description).FirstOrDefaultAsync();
                        timeCard.Job = await _context.PayrollJobDescriptions.Where(x => x.Id == timeCard.jobID).Select(x => x.empJobDescription).FirstOrDefaultAsync();
                        timeCard.HourlyType = await _context.CodeValues.Where(x => x.Id == timeCard.hourTypeID).Select(x => x.value).FirstOrDefaultAsync();
                        timecardEmployeeSchedules.Add(timeCard);
                    }

                }
                var propertyNames = sortKey.Split('.');
                var parameter = Expression.Parameter(typeof(TimeCards), "x");
                Expression property = parameter;
                foreach (var propertyName in propertyNames)
                {
                    property = Expression.PropertyOrField(property, propertyName);
                }
                var lamda = Expression.Lambda<Func<TimeCards, object>>(Expression.Convert(property, typeof(object)), parameter);
                return desc ? timecardEmployeeSchedules.AsQueryable().OrderByDescending(lamda).ToList() : timecardEmployeeSchedules.AsQueryable().OrderBy(lamda).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [Route("TimeCardStatus/{empId}")]
        [HttpGet]
        public async Task<ActionResult<TimecardStatus>> GetTimeCardStatus(int empId, int headerId)
        {
            if (!TimecardCommon.HasTimecardDataAccess(_context, MemberId, empId))
            {
                return Forbid();
            }

            TimecardStatus timecardStatus = new TimecardStatus();
            TimecardEmployeeDetails tcEmp = await _context.TimecardEmployeeDetails.Where(x => x.empId == empId && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (tcEmp == null)
            {
                return BadRequest("Employee Does not exist for the Employee" + empId);
            }

            timecardStatus.ShowButtons = !(tcEmp.isTimecardSuppresed && empId == MemberId);

            timecardStatus.IsTimecardHeaderActive = true;

            var timecardHeader = await _context.TimeCardHeaders.Where(x => x.ID == headerId).FirstOrDefaultAsync();

            if(timecardHeader==null || timecardHeader.endDate.Value.Date < DateTime.Today)
                timecardStatus.IsTimecardHeaderActive = false;

            //if (timecardHeader == null) { return BadRequest("Timecard Header Does not exist"); }
            var timecards = await _context.TimeCards.Where(x => x.timeCardHeaderID == headerId).ToListAsync();
            //var timecards = await _context.TimeCards.Where(x => x.timeCardHeaderID == timecardHeader.ID).ToListAsync();
            if (timecards == null)
            {
                return BadRequest("Timcards does exist for the employee" + empId);
            }

            timecardStatus.clockIn = !timecards.Any(x => !x.endDateTime.HasValue);

            return Ok(timecardStatus);
        }

        [Route("TimeCardClockIn")]
        [HttpPost]
        public async Task<ActionResult<TimeCards>> TimeCardClockIn(int empid, int headerId, int JobId, string? memo, int? hourTypeId)
        {
            try
            {
                TimeCards timeCard = new TimeCards();
                TimeCards timeCardRef = await _context.TimeCards.Where(x => x.empID == empid && x.endDateTime.Equals(null)).FirstOrDefaultAsync();
                if (timeCardRef != null)
                {
                    return BadRequest("Employee Didn't Clock out");
                }
                var employee = await _context.TimecardEmployeeDetails.FirstOrDefaultAsync(x => x.empId == empid && x.OrgAccountId == OrgAccountId);
                if (employee == null)
                {
                    return BadRequest("Employees does not exists");
                }

                var timeCardHeaders = await _context.TimeCardHeaders.FirstOrDefaultAsync(x => x.empID==empid && DateTime.Today >= x.startDate.Date && DateTime.Today <= x.endDate.Value.Date);
                if (timeCardHeaders==null)
                {
                    return BadRequest("Timecard range does not exist between the time range of time card header");
                }

                var hoursTypeRegular = _context.CodeValues.Where(x => x.value == "Regular").FirstOrDefault();

                //var timeCardHeaders = await _context.TimeCardHeaders.FirstOrDefaultAsync(x => x.ID == headerId && x.supApproved.HasValue && x.supApproved.Value && x.supApprovalDate != null);
                //if (timeCardHeaders != null)  //only supervisor should have this feature
                //{
                //    return BadRequest("TimeCardHeaders for the timecard is already approved by supervisor");
                //}
                //if i have a timecard for 40hr/week  and i have a OT of 5 hr then im eligible for 1.5 rule
                //else if i have a 40 hr/week time card and in that i have a 8 hr as leaverequest then im not elgible for 1.5 * rule               //if a an employee is off/break today then she is not allowed to choose OT as hour types, Rather she has to choose straight time according to labor rules
                //if a employee is on leave already for the duration which is mentioned in timecard  , what action has to be taken
                timeCard.startDateTime = DateTime.Now;
                timeCard.timeCardHeaderID = timeCardHeaders.ID;
                timeCard.jobID = JobId;
                timeCard.empID = empid;
                timeCard.hourTypeID = (hourTypeId == null || hourTypeId == 0) ? hoursTypeRegular!.Id : hourTypeId.Value;
                timeCard.memo = memo;
                timeCard.createdDate = DateTime.Now;
                timeCard.createdBy = "CreatedUser";
                timeCard.OrgAccountId = OrgAccountId;
                //timeCard.StartDateTime = DateTime.Now;  //clock in should be current time and not taken by user/client
                _context.TimeCards.Add(timeCard);
                await _context.SaveChangesAsync();

                return timeCard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [Route("TimeCardClockOut")]
        [HttpPost]
        public async Task<ActionResult<TimeCards>> TimeCardClockOut(int empId, int headerId)
        {
            try
            {

                TimeCards timeCardRef = await _context.TimeCards.Where(x => x.empID == empId && x.timeCardHeaderID == headerId && x.endDateTime.Equals(null)).FirstOrDefaultAsync();
                if (timeCardRef == null)
                {
                    return BadRequest("TimeCard Does Not Exist");
                }
                timeCardRef.endDateTime = DateTime.Now;

                DateTime entryStartTime = DateTime.Now;
                DateTime entryEndTime = DateTime.Now;

                var enforce7MinRule = await _context.SettingsValue.Where(x => x.settingsId == 60).Select(x => x.settingValue).FirstOrDefaultAsync();
                if (enforce7MinRule != null && enforce7MinRule == "1")
                {
                    entryStartTime = LeaveBalanceCalculations.SevenMinuteRule(timeCardRef.startDateTime);
                    entryEndTime = LeaveBalanceCalculations.SevenMinuteRule(timeCardRef.endDateTime.Value);
                }
                else
                {
                    var enforce3MinRule = await _context.SettingsValue.Where(x => x.settingsId == 61).Select(x => x.settingValue).FirstOrDefaultAsync();
                    if (enforce3MinRule != null && enforce3MinRule == "1")
                    {
                        entryStartTime = LeaveBalanceCalculations.ThreeMinuteRule(timeCardRef.startDateTime);
                        entryEndTime = LeaveBalanceCalculations.ThreeMinuteRule(timeCardRef.endDateTime.Value);
                    }
                }

                timeCardRef.hours = (timeCardRef.endDateTime.Value - timeCardRef.startDateTime).TotalHours;

                if (timeCardRef.hours <= 0)
                {
                    return BadRequest("TimeCard End time should be greater than start time");
                }
                timeCardRef.hours = (entryEndTime - entryStartTime).TotalHours;
                //if i have a timecard for 40hr/week  and i have a OT of 5 hr then im eligible for 1.5 rule
                //else if i have a 40 hr/week time card and in that i have a 8 hr as leaverequest then im not elgible for 1.5 * rule               //if a an employee is off/break today then she is not allowed to choose OT as hour types, Rather she has to choose straight time according to labor rules
                //if a employee is on leave already for the duration which is mentioned in timecard  , what action has to be taken?
                //timeCardRef.createdDate = DateTime.Now;
                //timeCardRef.createdBy = "CreatedUser";
                //timeCard.StartDateTime = DateTime.Now;  //clock in should be current time and not taken by user/client


                _context.TimeCards.Update(timeCardRef);
                await _context.SaveChangesAsync();

                return timeCardRef;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [Route("ApproveTimesheet")]
        [HttpPost]
        public async Task<ActionResult<string>> ApproveTimesheet(string approvedBy, int headerId, List<int>? ids = null)
        {
            var timcardEmployee = await _context.TimecardEmployeeDetails.Where(x => x.empId == MemberId).FirstOrDefaultAsync();
            if (timcardEmployee == null)
            {
                return BadRequest("Employee timecard is not found");
            }
            if (timcardEmployee.IsPayrollSpecialist)
            {
                if (ids == null || ids.Count <= 0)
                {
                    return BadRequest("Please select timecards to be approved");
                }
                var timcards = await _context.TimeCards.Where(x => ids.Contains(x.ID)).ToListAsync();
                foreach (var timcard in timcards)
                {
                    var endDate = timcard.endDateTime;
                    if (endDate == null)
                    {
                        return BadRequest("Timecard should have end date for approval");
                    }
                    timcard.HR_Approved = true;
                    timcard.HR_Approval_Date = DateTime.Now;
                    timcard.HR_Approved_ID = MemberId;
                    headerId = (int)timcard.timeCardHeaderID;
                }
                _context.TimeCards.UpdateRange(timcards);
                await _context.SaveChangesAsync();
                var timcardsRefs = await _context.TimeCards.Where(x => x.timeCardHeaderID == headerId).ToListAsync();
                if (timcardsRefs.All(x => x.supApproved == true))
                {
                    var header = await _context.TimeCardHeaders.FindAsync(headerId);
                    if (header != null)
                    {
                        header.payRollDate = DateTime.Now;
                        header.hRApproved = true;
                        header.hRApprovalDate = DateTime.Now;
                        header.hRApprovedID = MemberId;
                        header.hRTimeStamp = DateTime.Now;
                        _context.TimeCardHeaders.Update(header);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            if (approvedBy == "Supervisor")
            {
                if (ids == null || ids.Count <= 0)
                {
                    return BadRequest("Please select timecards to be approved");
                }
                var timcards = await _context.TimeCards.Where(x => ids.Contains(x.ID)).ToListAsync();
                foreach (var timcard in timcards)
                {
                    var endDate = timcard.endDateTime;
                    if (endDate == null)
                    {
                        return BadRequest("Timecard should have end date for approval");
                    }
                    timcard.supApproved = true;
                    timcard.supApprovedDate = DateTime.Now;
                    timcard.supervisorID = MemberId;
                    headerId = (int)timcard.timeCardHeaderID;
                }
                _context.TimeCards.UpdateRange(timcards);
                await _context.SaveChangesAsync();
                var timcardsRefs = await _context.TimeCards.Where(x => x.timeCardHeaderID == headerId).ToListAsync();
                if (timcardsRefs.All(x => x.supApproved == true))
                {
                    var header = await _context.TimeCardHeaders.FindAsync(headerId);
                    if (header != null)
                    {
                        header.supApproved = true;
                        header.supApprovalDate = DateTime.Now;
                        header.supApprovedID = MemberId;
                        header.supTimeStamp = DateTime.Now;
                        _context.TimeCardHeaders.Update(header);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            if (approvedBy == "Employee")
            {

                if (ids == null || ids.Count <= 0)
                {
                    return BadRequest("Please select timecards to be approved");
                }
                var timcards = await _context.TimeCards.Where(x => ids.Contains(x.ID)).ToListAsync();
                foreach (var timcard in timcards)
                {
                    var endDate = timcard.endDateTime;
                    if (endDate == null)
                    {
                        return BadRequest("Timecard should have end date for approval, Please clock out first!");
                    }
                }

                var header = await _context.TimeCardHeaders.FindAsync(headerId);
                if (header != null)
                {
                    header.empApproved = true;
                    header.empApprovalDate = DateTime.Now;
                    header.empTimeStamp = DateTime.Now;
                    _context.TimeCardHeaders.Update(header);
                    await _context.SaveChangesAsync();
                }
            }
            return "Approved";
        }
        [HttpGet]
        [Route("TestApi")]
        public async Task<ActionResult<TimeSpan>> TestSeventThreeMinuteRule(TimeSpan whatTime)
        {
            return whatTime;
        }
    }

}
