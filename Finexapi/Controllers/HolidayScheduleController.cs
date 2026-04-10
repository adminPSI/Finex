using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.Payroll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using static System.Runtime.InteropServices.JavaScript.JSType;


namespace FinexAPI.Controllers
{
    [Authorize]
    public class HolidayScheduleController : BaseController
    {
        private readonly ILogger<HolidayScheduleController> _logger;
        private readonly FinexAppContext _context;

        public HolidayScheduleController(IHttpContextAccessor httpContextAccessor,
            FinexAppContext context, ILogger<HolidayScheduleController> logger) : base(httpContextAccessor)
        {
            _context = context;
            _logger = logger;
        }
        [Route("years")]
        [HttpGet]
        public async Task<ActionResult<List<int>>> GetHolidayScheduleYears()
        {
            try
            {
                var years = await _context.HolidayScheduleHeaders.Where(z => z.OrgAccountId == OrgAccountId).Select(z => z.year).Distinct().ToListAsync();

                return years;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HolidayScheduleHeader>> GetHolidayScheduleHeader(int id)
        {
            try
            {
                var holidayScheduleHeader = await _context.HolidayScheduleHeaders.FirstOrDefaultAsync(z => z.id == id && z.OrgAccountId == OrgAccountId);

                if (holidayScheduleHeader == null)
                {
                    return NotFound("HolidayScheduleHeader Id not found");
                }

                return holidayScheduleHeader;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [Route("ByYear")]
        [HttpGet]
        public async Task<ActionResult<List<HolidayScheduleHeader>>> GetHolidayScheduleHeaders(int year = 0)
        {
            try
            {
                var holidayScheduleHeader = await _context.HolidayScheduleHeaders.Where(z => (0 == year || z.year == year) & z.OrgAccountId == OrgAccountId).ToListAsync();

                return holidayScheduleHeader;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [HttpGet("Header/{id}/Date")]
        public async Task<ActionResult<List<HolidayScheduleDate>>> GetHolidayScheduleDates(int id, bool desc, string sortKey = "modifiedDate", string? holidayName = "", DateTime? date = null, string? search = "", int skip = 0, int take = 0)
        {
            try
            {
                var holidayScheduleHeader = await _context.HolidayScheduleHeaders.FirstOrDefaultAsync(z => z.id == id);
                if (holidayScheduleHeader == null)
                {
                    return BadRequest("HolidayScheduleHeader Id not found");
                }

                if (search == "")
                {
                    List<HolidayScheduleDate> list = new List<HolidayScheduleDate>();
                    if (date == null)
                    {
                        list = await _context.HolidayScheduleDates.Where(h =>
                        h.holidayScheduleId == id &&
                        h.holidayName.Contains(string.IsNullOrEmpty(holidayName) ? "" : holidayName)).OrderByCustom(sortKey, desc).ToListAsync();
                    }
                    else
                    {
                        DateTime dateTime = (DateTime)date;
                        list = await _context.HolidayScheduleDates.Where(h =>
                        h.holidayScheduleId == id &&
                        h.holidayName.Contains(string.IsNullOrEmpty(holidayName) ? "" : holidayName)
                        && h.date.Year == dateTime.Year
                        && h.date.Month == dateTime.Month
                        && h.date.Day == dateTime.Day
                        ).OrderByCustom(sortKey, desc).ToListAsync();
                    }
                    if (take == 0)
                    {
                        return Ok(new { data = list, total = list.Count });
                    }
                    else
                    {
                        return Ok(new { data = list.Skip(skip).Take(take).ToList(), total = list.Count });
                    }
                }

                else
                {
                    var list = await _context.HolidayScheduleDates.Where(h =>
                    h.holidayScheduleId == id &&
                                          h.holidayName.Contains(string.IsNullOrEmpty(search) ? "" : search)).OrderByCustom(sortKey, desc).ToListAsync();
                    if (take == 0)
                    {
                        return Ok(new { data = list, total = list.Count });
                    }
                    else
                    {
                        return Ok(new { data = list.Skip(skip).Take(take).ToList(), total = list.Count });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [HttpPost]
        public async Task<ActionResult<HolidayScheduleHeader>> CreateHolidaySchedule(HolidayScheduleHeader holidaySchedule)
        {
            try
            {
                if (holidaySchedule == null)
                {
                    return NotFound();
                }
                var scheduleHeader = await _context.HolidayScheduleHeaders
                    .FirstOrDefaultAsync(z => z.holidayScheduleName == holidaySchedule.holidayScheduleName
                    && z.year == holidaySchedule.year && z.OrgAccountId == OrgAccountId);

                if (scheduleHeader != null)
                {
                    return BadRequest("Holiday schedule header name already exists for the same year");
                }
                holidaySchedule.OrgAccountId = OrgAccountId;
                _context.HolidayScheduleHeaders.Add(holidaySchedule);
                await _context.SaveChangesAsync();

                return holidaySchedule;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [HttpPost("Date")]
        public async Task<ActionResult<HolidayScheduleDate>> CreateHolidayScheduleDate(HolidayScheduleDate holidayScheduleDate)
        {
            try
            {
                if (!HolidayScheduleHeaderExists(holidayScheduleDate.holidayScheduleId))
                {
                    return NotFound();
                }
                var scheduleHeader = await _context.HolidayScheduleHeaders
                    .FirstOrDefaultAsync(z => z.id == holidayScheduleDate.holidayScheduleId && z.OrgAccountId == OrgAccountId);

                if (scheduleHeader != null)
                {
                    //var holidayScheduleExist = _context.HolidayScheduleDates
                    //    .Any(z => z.date.Day == holidayScheduleDate.date.Day && scheduleHeader.year == holidayScheduleDate.date.Year);
                    var holidayScheduleExist = _context.HolidayScheduleDates
                       .Any(z => z.holidayScheduleId == holidayScheduleDate.holidayScheduleId && z.date.Day == holidayScheduleDate.date.Day && z.date.Month == holidayScheduleDate.date.Month && z.date.Year == holidayScheduleDate.date.Year);
                    if (holidayScheduleExist)
                    {
                        return BadRequest("Same day Holiday schedule already exists for the same year");
                    }
                }
                _context.HolidayScheduleDates.Add(holidayScheduleDate);
                await _context.SaveChangesAsync();

                return holidayScheduleDate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<HolidayScheduleHeader>> EditHolidaySchedule(int id, HolidayScheduleHeader holidaySchedule)
        {
            try
            {
                if (id != holidaySchedule.id)
                {
                    return BadRequest("Holiday schedule is mismatched");
                }
                if (!HolidayScheduleHeaderExists(holidaySchedule.id))
                {
                    return NotFound();
                }
                var scheduleHeader = await _context.HolidayScheduleHeaders.FirstOrDefaultAsync(z => z.holidayScheduleName == holidaySchedule.holidayScheduleName
                && z.year == holidaySchedule.year && z.id != holidaySchedule.id && z.OrgAccountId == OrgAccountId);

                if (scheduleHeader != null)
                {
                    return BadRequest("Holiday schedule header name already exists for the same year");
                }
                var holidayScheduleRef = await _context.HolidayScheduleHeaders.FindAsync(id);
                if (holidayScheduleRef == null)
                {
                    return BadRequest("holidaySchedule not found with id:" + id);
                }
                holidaySchedule.OrgAccountId = OrgAccountId;
                holidaySchedule.createdDate = holidayScheduleRef.createdDate;
                holidaySchedule.createdBy = holidayScheduleRef.createdBy;
                _context.HolidayScheduleHeaders.Entry(holidayScheduleRef).State = EntityState.Detached;
                _context.HolidayScheduleHeaders.Update(holidaySchedule);
                await _context.SaveChangesAsync();

                return holidaySchedule;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        [HttpPut("Date")]
        public async Task<ActionResult<HolidayScheduleDate>> EditHolidayScheduleDate(HolidayScheduleDate holidayScheduleDate)
        {
            try
            {
                if (!HolidayScheduleDateExists(holidayScheduleDate.id))
                {
                    return NotFound();
                }
                var scheduleHeader = await _context.HolidayScheduleHeaders.FirstOrDefaultAsync(z => z.id == holidayScheduleDate.holidayScheduleId && z.OrgAccountId == OrgAccountId);

                if (scheduleHeader != null)
                {
                    //var holidayScheduleExist = _context.HolidayScheduleDates.Any(z => z.date.Day == holidayScheduleDate.date.Day && scheduleHeader.year == holidayScheduleDate.date.Year);
                    var holidayScheduleExist = _context.HolidayScheduleDates.Any(z => z.id != holidayScheduleDate.id && z.holidayScheduleId == holidayScheduleDate.holidayScheduleId && z.date.Day == holidayScheduleDate.date.Day && z.date.Month == holidayScheduleDate.date.Month && z.date.Year == holidayScheduleDate.date.Year);
                    if (holidayScheduleExist)
                    {
                        return BadRequest("Same day Holiday schedule already exists for the same year");
                    }
                }
                var scheduleDateRef = await _context.HolidayScheduleDates.FindAsync(holidayScheduleDate.id);
                if (scheduleDateRef == null)
                {
                    return BadRequest("HolidaySchedule Date not found with the Id:" + holidayScheduleDate.id);
                }
                holidayScheduleDate.createdDate = scheduleDateRef.createdDate;
                holidayScheduleDate.createdBy = scheduleDateRef.createdBy;
                _context.HolidayScheduleDates.Entry(scheduleDateRef).State = EntityState.Deleted;
                _context.HolidayScheduleDates.Update(holidayScheduleDate);
                await _context.SaveChangesAsync();

                return holidayScheduleDate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult<HolidayScheduleHeader>> DeleteHolidayScheduleHeader(int id)
        {
            try
            {
                var holidaySchedule = await _context.HolidayScheduleHeaders.FirstOrDefaultAsync(x => x.id == id && x.OrgAccountId == OrgAccountId);
                if (holidaySchedule == null)
                {
                    return NotFound();
                }
                _context.HolidayScheduleHeaders.Remove(holidaySchedule);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                if(ex.InnerException!.Message.Contains("conflicted"))
                    return BadRequest("Holiday Schedule is in use, cannot be deleted.");
                throw;
            }
        }
        [HttpDelete("Date/{id}")]
        public async Task<ActionResult<HolidayScheduleDate>> DeleteHolidayScheduleDate(int id)
        {
            try
            {
                var holidayScheduleDate = await _context.HolidayScheduleDates.FindAsync(id);
                if (holidayScheduleDate == null)
                {
                    return NotFound();
                }

                _context.HolidayScheduleDates.Remove(holidayScheduleDate);
                await _context.SaveChangesAsync();

                return holidayScheduleDate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }


        [Route("clone")]
        [HttpPost]
        public async Task<ActionResult<string>> CloneSchedule(int holidayScheduleHeaderId, int toYear)
        {
            try
            {

                if (!HolidayScheduleHeaderExists(holidayScheduleHeaderId))
                {
                    return NotFound();
                }

                var holidayScheduleHeader = await _context.HolidayScheduleHeaders
                    .FirstOrDefaultAsync(z => z.id == holidayScheduleHeaderId && z.OrgAccountId == OrgAccountId);
                //create new header with new year

                var newHeader = new HolidayScheduleHeader()
                {
                    OrgAccountId = holidayScheduleHeader.OrgAccountId,
                    holidayScheduleName = holidayScheduleHeader.holidayScheduleName,
                    year = toYear
                };
                _context.HolidayScheduleHeaders.Add(newHeader);
                await _context.SaveChangesAsync();

                var holidayScheduleDates = await _context.HolidayScheduleDates.Where(z => z.holidayScheduleId == holidayScheduleHeaderId).ToListAsync();


                foreach (var holidayScheduleDate in holidayScheduleDates)
                {
                    _context.HolidayScheduleDates.Add(new HolidayScheduleDate()
                    {
                        holidayScheduleId = newHeader.id,
                        holidayName = holidayScheduleDate.holidayName,
                        calculateVacationSick = holidayScheduleDate.calculateVacationSick,
                        date = new DateTime(toYear, holidayScheduleDate.date.Month, holidayScheduleDate.date.Day)
                    });
                }

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw;
            }
        }

        private bool HolidayScheduleHeaderExists(int id)
        {
            return _context.HolidayScheduleHeaders.Any(e => e.id == id && e.OrgAccountId == OrgAccountId);
        }

        private bool HolidayScheduleDateExists(int id)
        {
            return _context.HolidayScheduleDates.Any(e => e.id == id);
        }
        /*

        [Route("Filter")]
        [HttpGet]
        public async Task<ActionResult> GetHolidayScheduleDates(string? name, DateTime? Date = null, string? search = "", int skip = 0, int take = 0)
        {
            if (search == "")
            {
                List<HolidayScheduleDate> list = new List<HolidayScheduleDate>();
                if (Date == null)
                {
                    list = await _context.HolidayScheduleDates.Where(h =>
                    h.holidayName.Contains(string.IsNullOrEmpty(name) ? "" : name)).ToListAsync();
                }
                else
                {
                    DateTime dateTime = (DateTime)Date;
                    list = await _context.HolidayScheduleDates.Where(h =>
                    h.holidayName.Contains(string.IsNullOrEmpty(name) ? "" : name)
                    && h.date.Year == dateTime.Year
                    && h.date.Month == dateTime.Month
                    && h.date.Day == dateTime.Day
                    ).ToListAsync();
                }
                if (take == 0)
                {
                    return Ok(new { data = list, total = list.Count });
                }
                else
                {
                    return Ok(new { data = list.Skip(skip).Take(take).ToList(), total = list.Count });
                }
            }

            else
            {
                var list = await _context.HolidayScheduleDates.Where(h =>
                                      h.holidayName.Contains(string.IsNullOrEmpty(name) ? "" : name)).ToListAsync();
                if (take == 0)
                {
                    return Ok(new { data = list, total = list.Count });
                }
                else
                {
                    return Ok(new { data = list.Skip(skip).Take(take).ToList(), total = list.Count });
                }
            }
        }*/
    }

}
