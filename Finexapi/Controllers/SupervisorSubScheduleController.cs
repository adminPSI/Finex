using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;


namespace FinexAPI.Controllers
{
    [Authorize]
    public class SupervisorSubScheduleController : BaseController
    {

        private readonly FinexAppContext _context;

        public SupervisorSubScheduleController(IHttpContextAccessor httpContextAccessor, FinexAppContext context) : base(httpContextAccessor)
        {
            _context = context;
        }

        /// <summary>
        /// get supervisorSubSchedules by date range
        /// </summary> 
        /// <param name="startDate "></param>
        /// <param name="endDate"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetSupervisorSubSchedules(bool desc, string sortKey = "modifiedDate", string? supervisor = "", string? subSupervisor = "", DateTime? startDate = null, DateTime? endDate = null, string? approved = "", string? search = "", int skip = 0, int take = 0)
        {
            if (search == "")
            {
                List<SupervisorSubSchedules> list = new List<SupervisorSubSchedules>();

                list = await _context.SupervisorSubSchedules
               .Include(ss => ss.supervisor)
               .Include(ss => ss.subSupervisor)
               .Where(x => x.supervisor.firstName.Contains(string.IsNullOrEmpty(supervisor) ? "" : supervisor)
                      && x.subSupervisor.firstName.Contains(string.IsNullOrEmpty(subSupervisor) ? "" : subSupervisor)
                      && x.IsApproved.ToString().Contains(string.IsNullOrEmpty(approved) ? "" : approved)
                      && x.OrgAccountId == OrgAccountId
                      && (startDate == null || x.startDate.Date == startDate.Value.Date)
                       && (endDate == null || x.endDate.Date == endDate.Value.Date))
               .OrderByCustom(sortKey, desc).ToListAsync();


                //if (startDate == null && endDate == null)
                //{
                //    list = await _context.SupervisorSubSchedules
                //    .Include(ss => ss.supervisor)
                //    .Include(ss => ss.subSupervisor)
                //    .Where(x => x.supervisor.firstName.Contains(string.IsNullOrEmpty(supervisor) ? "" : supervisor)
                //           && x.subSupervisor.firstName.Contains(string.IsNullOrEmpty(subSupervisor) ? "" : subSupervisor)
                //           && x.IsApproved.ToString().Contains(string.IsNullOrEmpty(approved) ? "" : approved)
                //           && x.OrgAccountId == OrgAccountId)
                //    .OrderByCustom(sortKey, desc).ToListAsync();
                //}
                //else if (startDate == null)
                //{
                //    DateTime date = (DateTime)endDate;
                //    list = await _context.SupervisorSubSchedules
                //    .Include(ss => ss.supervisor)
                //    .Include(ss => ss.subSupervisor)
                //    .Where(x => x.supervisor.firstName.Contains(string.IsNullOrEmpty(supervisor) ? "" : supervisor)
                //           && x.subSupervisor.firstName.Contains(string.IsNullOrEmpty(subSupervisor) ? "" : subSupervisor)
                //           && x.IsApproved.ToString().Contains(string.IsNullOrEmpty(approved) ? "" : approved)
                //           && x.endDate.Year == date.Year
                //           && x.endDate.Month == date.Month
                //           && x.endDate.Day == date.Day
                //           && x.OrgAccountId == OrgAccountId)
                //    .OrderByCustom(sortKey, desc).ToListAsync();
                //}
                //else
                //{
                //    DateTime date = (DateTime)startDate;
                //    list = await _context.SupervisorSubSchedules
                //    .Include(ss => ss.supervisor)
                //    .Include(ss => ss.subSupervisor)
                //    .Where(x => x.supervisor.firstName.Contains(string.IsNullOrEmpty(supervisor) ? "" : supervisor)
                //           && x.subSupervisor.firstName.Contains(string.IsNullOrEmpty(subSupervisor) ? "" : subSupervisor)
                //           && x.IsApproved.ToString().Contains(string.IsNullOrEmpty(approved) ? "" : approved)
                //           && x.startDate.Year == date.Year
                //           && x.startDate.Month == date.Month
                //           && x.startDate.Day == date.Day
                //           && x.OrgAccountId == OrgAccountId)
                //    .OrderByCustom(sortKey, desc).ToListAsync();
                //}

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
                var list = await _context.SupervisorSubSchedules
                    .Include(ss => ss.supervisor)
                    .Include(ss => ss.subSupervisor)
                    .Where(x => (x.supervisor.firstName.Contains(string.IsNullOrEmpty(search) ? "" : search)
                            || x.supervisor.lastName.Contains(string.IsNullOrEmpty(search) ? "" : search)
                            || x.subSupervisor.firstName.Contains(string.IsNullOrEmpty(search) ? "" : search)
                            || x.subSupervisor.lastName.Contains(string.IsNullOrEmpty(search) ? "" : search)
                            || x.IsApproved.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search))
                           && x.OrgAccountId == OrgAccountId)
                    .OrderByCustom(sortKey, desc).ToListAsync();

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


        /// <summary>
        /// get  supervisorSubSchedules by id
        /// </summary>
        /// <param name="supId"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<SupervisorSubSchedules>> GetSupervisorSubScheduleById(int id)
        {
            var supervisorSubSchedules = await _context.SupervisorSubSchedules
                .FirstOrDefaultAsync(x => x.SupervisorSubScheduleId == id && x.OrgAccountId == OrgAccountId);

            if (supervisorSubSchedules == null)
            {
                return BadRequest("Supervisor schedule is not found");
            }

            return supervisorSubSchedules;
        }
        /// <summary>
        /// update SupervisorSubSchedule by id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="supervisorSubSchedule"></param>
        /// <returns></returns>

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSupervisorSubSchedules(int id, SupervisorSubSchedules supervisorSubSchedule)
        {
            if ((id != supervisorSubSchedule.SupervisorSubScheduleId) || (supervisorSubSchedule.supSubId == supervisorSubSchedule.supId) || (supervisorSubSchedule.supId == 0 || supervisorSubSchedule.supSubId == 0))
            {
                return BadRequest("Invalid request");
            }
            var employee = await _context.Employees.FirstOrDefaultAsync(x => (x.id == supervisorSubSchedule.supId || x.id == supervisorSubSchedule.supSubId)
            && x.OrgAccountId == OrgAccountId);
            if (employee == null)
            {
                return BadRequest("Employees does not exists");
            }
            var supervisorSubScheduleEntity = await _context.SupervisorSubSchedules.FirstOrDefaultAsync(x => x.SupervisorSubScheduleId == id && x.OrgAccountId == OrgAccountId);
            if (supervisorSubScheduleEntity == null)
            {
                return BadRequest("Supervisor Sub Schedules config does not exists for the given id");
            }
            var supId = _context.SupervisorSubSchedules.Where(x => x.supId == supervisorSubSchedule.supId
            && ((supervisorSubSchedule.startDate >= x.startDate && supervisorSubSchedule.startDate <= x.endDate)
            || (supervisorSubSchedule.endDate >= x.startDate && supervisorSubSchedule.endDate <= x.endDate)) && x.SupervisorSubScheduleId != id).FirstOrDefault();

            if (supId != null)
            {
                return BadRequest($"Overlap detected. A substitute has already been scheduled for this supervisor from {supervisorSubSchedule.startDate.Date.ToString("MM/dd/yyyy")} to {supervisorSubSchedule.endDate.Date.ToString("MM/dd/yyyy")}");
            }
            supervisorSubSchedule.OrgAccountId = OrgAccountId;
            supervisorSubSchedule.createdBy = supervisorSubScheduleEntity.createdBy;
            supervisorSubSchedule.createdDate = supervisorSubScheduleEntity.createdDate;
            // Detach the existing entity from the context
            _context.Entry(supervisorSubScheduleEntity).State = EntityState.Detached;
            supervisorSubScheduleEntity = supervisorSubSchedule;
            supervisorSubScheduleEntity.OrgAccountId = OrgAccountId;

            // Attach the updated entity
            _context.SupervisorSubSchedules.Update(supervisorSubScheduleEntity);

            // Mark it as modified
            _context.Entry(supervisorSubScheduleEntity).State = EntityState.Modified;
            await _context.SaveChangesAsync();



            return CreatedAtAction("PutSupervisorSubSchedules", new { supId = supervisorSubSchedule.supId }, supervisorSubSchedule);
        }

        /// <summary>
        /// create a schedule 
        /// </summary>
        /// <param name="supervisorSubSchedules"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<SupervisorSubSchedules>> PostSupervisorSubSchedule([FromBody] SupervisorSubSchedules supervisorSubSchedules)
        {
            if ((supervisorSubSchedules.supId == supervisorSubSchedules.supSubId) || (supervisorSubSchedules.supId == 0 || supervisorSubSchedules.supSubId == 0))
            {
                return BadRequest("Invalid request");
            }
            var employee = await _context.Employees.FirstOrDefaultAsync(x => (x.id == supervisorSubSchedules.supId || x.id == supervisorSubSchedules.supSubId)
            && x.OrgAccountId == OrgAccountId);
            if (employee == null)
            {
                return BadRequest("Employees does not exists");
            }
            var supId = _context.SupervisorSubSchedules.Where(x => x.supId == supervisorSubSchedules.supId
            && ((supervisorSubSchedules.startDate >= x.startDate && supervisorSubSchedules.startDate <= x.endDate)
            || (supervisorSubSchedules.endDate >= x.startDate && supervisorSubSchedules.endDate <= x.endDate))).FirstOrDefault();

            if (supId != null)
            {
                return BadRequest($"Overlap detected. A substitute has already been scheduled for this supervisor from {supervisorSubSchedules.startDate.Date.ToString("MM/dd/yyyy")} to {supervisorSubSchedules.endDate.Date.ToString("MM/dd/yyyy")}");
            }

            supervisorSubSchedules.OrgAccountId = OrgAccountId;
            supervisorSubSchedules.createdBy = "dummy data";
            supervisorSubSchedules.createdDate = DateTime.Now;
            // Detach any tracked entities before adding a new one
            _context.Entry(employee).State = EntityState.Detached;
            _context.SupervisorSubSchedules.Add(supervisorSubSchedules);
            await _context.SaveChangesAsync();

            return CreatedAtAction("PostSupervisorSubSchedule", new { supId = supervisorSubSchedules.supId }, supervisorSubSchedules);
        }




        [HttpDelete("{id}")]
        public async Task<ActionResult<SupervisorSubSchedules>> DeleteSupervisorSubSchedule(int id)
        {
            var supervisorSubSchedules = await _context.SupervisorSubSchedules
                .FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.SupervisorSubScheduleId == id);
            if (supervisorSubSchedules == null)
            {
                return BadRequest("Supervisor Sub Schedules config does not exists");
            }

            _context.SupervisorSubSchedules.Remove(supervisorSubSchedules);
            await _context.SaveChangesAsync();

            return supervisorSubSchedules;
        }

    }

}
