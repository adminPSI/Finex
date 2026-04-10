using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;


namespace FinexAPI.Controllers
{
    [Authorize]
    public class LeaveTypeController : BaseController
    {
        private readonly ILogger<LeaveTypeController> _logger;
        private readonly FinexAppContext _context;

        public LeaveTypeController(IHttpContextAccessor httpContextAccessor, FinexAppContext context,
            ILogger<LeaveTypeController> logger) : base(httpContextAccessor)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LeaveType>> GetLeaveType(int id)
        {
            try
            {
                var leaveType = await _context.LeaveTypes.FirstOrDefaultAsync(x => x.id == id);

                if (leaveType == null)
                {
                    return BadRequest("Leave type is not exist");
                }

                return leaveType;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaveType>>> GetLeaveTypes(int? empId)
        {
            try
            {
                if (empId.HasValue && empId.Value == MemberId)
                    return await _context.LeaveTypes.Where(x=>x.allowEmployeeSelect).OrderBy(x => x.description)
                        .ToListAsync();

                return await _context.LeaveTypes.OrderBy(x => x.description)
                        .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpPost]
        public async Task<ActionResult<LeaveType>> CreateLeaveType(LeaveType leaveType)
        {
            try
            {
                var leaveTypes = await _context.LeaveTypes.FirstOrDefaultAsync(z => z.description == leaveType.description);

                if (leaveTypes != null)
                {
                    return BadRequest("Leave type already exists");

                }
                leaveType.OrgAccountId = OrgAccountId;
                _context.LeaveTypes.Add(leaveType);
                await _context.SaveChangesAsync();

                return leaveType;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<LeaveType>> EditLeaveType(int id, LeaveType leaveType)
        {
            try
            {
                if (id != leaveType.id)
                {
                    return BadRequest();
                }
                var leaveTypes = await _context.LeaveTypes.FirstOrDefaultAsync(z => z.description == leaveType.description
                && z.id != leaveType.id && z.allowEmployeeSelect == leaveType.allowEmployeeSelect
                && z.isReasonRequired == leaveType.isReasonRequired);

                if (leaveTypes != null)
                {
                    return BadRequest("Leave type already exists");

                }
                var leaveTypeRef = await _context.LeaveTypes.FindAsync(id);
                if (leaveTypeRef == null)
                {
                    return BadRequest("Leave type is not exist");
                }
                leaveType.OrgAccountId = OrgAccountId;
                leaveType.createdBy = leaveTypeRef.createdBy;
                leaveType.createdDate = leaveTypeRef.createdDate;
                _context.LeaveTypes.Entry(leaveTypeRef).State = EntityState.Detached;
                _context.LeaveTypes.Update(leaveType);

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)

                {
                    if (!LeaveTypeExists(id))
                    {
                        return BadRequest("Leave type is not exist");
                    }

                    else
                    {
                        throw;
                    }
                }


                return leaveType;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult<LeaveType>> DeleteLeaveType(int id)
        {
            try
            {
                var leaveType = await _context.LeaveTypes.FirstOrDefaultAsync(x => x.id == id);
                if (leaveType == null)
                {
                    return BadRequest("Leave type is not exist");
                }
                var leaveRequests = await _context.LeaveRequest.Where(x => x.leaveTypeID == id).ToListAsync();
                if (leaveRequests.Any())
                {
                    return BadRequest("Leave Type is associated with LeaveRequests");
                }
                _context.LeaveTypes.Remove(leaveType);
                await _context.SaveChangesAsync();

                return leaveType;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        private bool LeaveTypeExists(int id)
        {
            return _context.LeaveTypes.Any(e => e.id == id && e.OrgAccountId == OrgAccountId);
        }

        [Route("Filter")]
        [HttpGet]
        public async Task<ActionResult> Filter(bool desc, string? Description, string? Allowemptoselect, string? Requriereason, int? empId, string sortKey = "modifiedDate",  string? search = "", int skip = 0, int take = 0)
        {
            try
            {
                Allowemptoselect = empId == MemberId ? "true" : "";

                if (search == "")
                {
                    var leavetype = await _context.LeaveTypes.Where(l => ( (string.IsNullOrEmpty(Description) ?true : l.description.Contains( Description))
                    && (string.IsNullOrEmpty(Allowemptoselect) ? true : l.allowEmployeeSelect==Convert.ToBoolean(Allowemptoselect))
                    && (string.IsNullOrEmpty(Requriereason) ? true : l.isReasonRequired==Convert.ToBoolean(Requriereason)))
                    ).OrderByCustom(sortKey, desc).ToListAsync();

                    if (take == 0)
                    {
                        return Ok(new { data = leavetype, Total = leavetype.Count });
                    }
                    else
                    {
                        return Ok(new { data = leavetype.Skip(skip).Take(take).ToList(), Total = leavetype.Count });
                    }
                }
                else
                {
                    var leavetype = await _context.LeaveTypes.Where(l =>
                    (l.description.Contains(string.IsNullOrEmpty(search) ? "" : search)
                 || l.allowEmployeeSelect.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || l.isReasonRequired.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                    ) ).OrderByCustom(sortKey, desc).ToListAsync();


                    if (take == 0)
                    {
                        return Ok(new { data = leavetype, Total = leavetype.Count });
                    }
                    else
                    {
                        return Ok(new { data = leavetype.Skip(skip).Take(take).ToList(), Total = leavetype.Count });
                    }
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
    }

}
