using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : BaseController
    {
        private readonly FinexAppContext _context;

        public ProjectController(IHttpContextAccessor httpContextAccessor, FinexAppContext context) : base(httpContextAccessor)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            List<Project> responseData = new List<Project>();
            List<Project> projects = await _context.Projects.Where(p => p.isActive.Equals("Y") && p.OrgAccountId == OrgAccountId).ToListAsync();
            foreach (var project in projects)
            {
                /* var list = await _revenueContext.CountyRevenueBD.Where(x => x.ProjectID == project.Id).Select(x => x.rev_BD_Amount).SumAsync();
                decimal revenue = 0;
                foreach (var revenueBD in list)
                {
                    decimal bal = (decimal)await _revenueContext.CountyRevenue.Where(x => x.ID == revenueBD.Rev_ID).Select(x => x.rev_Amount).SumAsync();
                    revenue += bal;
                } */
                project.materialCost = (decimal)await _context.ProjectMaterials.Where(m => m.projectId == project.Id).Select(pm => pm.totalCost).SumAsync();
                project.equipmentCost = (decimal)await _context.ProjectEquipments.Where(e => e.projectId == project.Id).Select(pe => pe.totalCost).SumAsync();
                project.laborCost = (decimal)await _context.ProjectLabors.Where(l => l.projectId == project.Id).Select(pl => pl.totalCost).SumAsync();
                project.revenue = (decimal)await _context.CountyRevenueBD.Where(x => x.ProjectID == project.Id).Select(x => x.rev_BD_Amount).SumAsync();
                project.totalCost = project.materialCost + project.equipmentCost + project.laborCost;
                project.location = await _context.ProjectLocations.Where(pl => pl.Id == project.locationId).Select(pl => pl.location).FirstOrDefaultAsync();
                project.workType = await _context.ProjectWorkTypes.Where(pw => pw.Id == project.workTypeId).Select(pw => pw.type).FirstOrDefaultAsync();
                responseData.Add(project);
            }
            return responseData;
        }
        [Route("Organization")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsByOrgnization(int orgId)
        {
            return await _context.Projects.Where(p => p.OrgAccountId.Equals(orgId)).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (project == null)
            {
                return BadRequest("Project does not exist");
            }
            var list = await _context.CountyRevenueBD.Where(x => x.ProjectID == project.Id).ToListAsync();
            /*  decimal revenue = 0;
             foreach (var revenueBD in list)
             {
                 decimal bal = (decimal)await _revenueContext.CountyRevenue.Where(x => x.ID == revenueBD.Rev_ID).Select(x => x.rev_Amount).SumAsync();
                 revenue += bal;
             } */

            project.materialCost = (decimal)await _context.ProjectMaterials.Where(m => m.projectId == project.Id).Select(pm => pm.totalCost).SumAsync();
            project.equipmentCost = (decimal)await _context.ProjectEquipments.Where(e => e.projectId == project.Id).Select(pe => pe.totalCost).SumAsync();
            project.laborCost = (decimal)await _context.ProjectLabors.Where(l => l.projectId == project.Id).Select(pl => pl.totalCost).SumAsync();
            project.revenue = (decimal)await _context.CountyRevenueBD.Where(x => x.ProjectID == project.Id).Select(x => x.rev_BD_Amount).SumAsync();
            project.totalCost = project.materialCost + project.equipmentCost + project.laborCost;
            project.location = await _context.ProjectLocations.Where(pl => pl.Id == project.locationId).Select(pl => pl.location).FirstOrDefaultAsync();
            project.workType = await _context.ProjectWorkTypes.Where(pw => pw.Id == project.workTypeId).Select(pw => pw.type).FirstOrDefaultAsync();
            return Ok(project);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> PutProject(int id, Project project)
        {
            if (id != project.Id)
            {
                return BadRequest("Project does not match with id");
            }
            var projectRef = await _context.Projects.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (projectRef == null)
            {
                return BadRequest("Project does not exist");
            }
            project.createdBy = projectRef.createdBy;
            project.createdDate = projectRef.createdDate;
            project.OrgAccountId = OrgAccountId;
            _context.Projects.Entry(projectRef).State = EntityState.Detached;
            _context.Projects.Update(project);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                {
                    return BadRequest("BadRequest does not exist");
                }
                else
                {
                    throw; ;
                }
            }

            return CreatedAtAction("GetProject", new { id = project.Id }, project);
        }

        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(p => p.Id == id && p.OrgAccountId == OrgAccountId);
        }

        [HttpPost]
        public async Task<ActionResult<Project>> PostProject(Project project)
        {
            project.OrgAccountId = OrgAccountId;
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProject", new { id = project.Id }, project);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Project>> DeleteProject(int id)
        {
            var project = await _context.Projects.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (project == null)
            {
                return BadRequest("BadRequest does not exist");
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return project;
        }

        [Route("ProjectWorkTypes")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectWorkTypes>>> GetWorkTypes()
        {
            return await _context.ProjectWorkTypes.Where(p => p.OrgAccountId == OrgAccountId).ToListAsync();
        }

        [Route("ProjectWorkTypes/{id}")]
        [HttpGet]
        public async Task<ActionResult<ProjectWorkTypes>> GetProjectWorkType(int id)
        {
            var workType = await _context.ProjectWorkTypes.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (workType == null)
            {
                return BadRequest("WorkType does not exist");
            }
            return Ok(workType);
        }

        [Route("ProjectWorkTypes")]
        [HttpPost]
        public async Task<ActionResult<ProjectWorkTypes>> PostProjectWorkType(ProjectWorkTypes projectWorkType)
        {
            projectWorkType.OrgAccountId = OrgAccountId;
            _context.ProjectWorkTypes.Add(projectWorkType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProjectWorkType", new { id = projectWorkType.Id }, projectWorkType);
        }

        [Route("ProjectWorkTypes/{id}")]
        [HttpPut]
        public async Task<ActionResult<ProjectWorkTypes>> PutProjectTypes(int id, ProjectWorkTypes projectWorkType)
        {
            if (id != projectWorkType.Id)
            {
                return BadRequest("WorkType does not match with id");
            }
            var typeRef = await _context.ProjectWorkTypes.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (typeRef == null)
            {
                return BadRequest("WorkType does not exist");
            }
            projectWorkType.createdDate = typeRef.createdDate;
            projectWorkType.createdBy = typeRef.createdBy;
            projectWorkType.OrgAccountId = OrgAccountId;
            _context.ProjectWorkTypes.Entry(typeRef).State = EntityState.Detached;
            _context.ProjectWorkTypes.Update(projectWorkType);
            await _context.SaveChangesAsync();
            return Ok(projectWorkType);
        }

        [Route("ProjectWorkTypes/{id}")]
        [HttpDelete]
        public async Task<ActionResult<ProjectWorkTypes>> DeleteProjectWorkType(int id)
        {
            var workType = await _context.ProjectWorkTypes.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (workType == null)
            {
                return BadRequest("WorkType does not exist");
            }
            _context.ProjectWorkTypes.Remove(workType);
            await _context.SaveChangesAsync();
            return workType;
        }

        [Route("ProjectLocations")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectLocations>>> GetProjectLocations()
        {
            return await _context.ProjectLocations.Where(p => p.OrgAccountId == OrgAccountId).ToListAsync();
        }

        [Route("ProjectLocations/{id}")]
        [HttpGet]
        public async Task<ActionResult<ProjectLocations>> GetProjectLocation(int id)
        {
            var projectLocation = await _context.ProjectLocations.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectLocation == null)
            {
                return BadRequest("ProjectLocation does not exist");
            }
            return Ok(projectLocation);
        }

        [Route("ProjectLocations")]
        [HttpPost]
        public async Task<ActionResult<ProjectLocations>> PostProjectLocations(ProjectLocations projectLocations)
        {
            projectLocations.OrgAccountId = OrgAccountId;
            _context.ProjectLocations.Add(projectLocations);
            await _context.SaveChangesAsync();
            return projectLocations;

        }

        [Route("ProjectLocations/{id}")]
        [HttpPut]
        public async Task<ActionResult<ProjectLocations>> PutProjectLocations(int id, ProjectLocations projectLocations)
        {
            if (id != projectLocations.Id)
            {
                return BadRequest("ProjectLocation does not match with id");
            }
            var locationRef = await _context.ProjectLocations.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (locationRef == null)
            {
                return BadRequest("ProjectLocation does not exist");
            }
            projectLocations.createdBy = locationRef.createdBy;
            projectLocations.createdDate = locationRef.createdDate;
            projectLocations.OrgAccountId = OrgAccountId;
            _context.ProjectLocations.Entry(locationRef).State = EntityState.Detached;
            _context.ProjectLocations.Update(projectLocations);
            await _context.SaveChangesAsync();
            return Ok(projectLocations);
        }

        [Route("ProjectLocations/{id}")]
        [HttpDelete]
        public async Task<ActionResult<ProjectLocations>> DeleteProjectLocations(int id)
        {
            var location = await _context.ProjectLocations.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (location == null)
            {
                return BadRequest("ProjectLocation does not exist");
            }
            _context.ProjectLocations.Remove(location);
            await _context.SaveChangesAsync();
            return location;
        }

        [Route("ProjectEquipmentSetup")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectEquipmentSetup>>> GetProjectEquipmentSetups()
        {
            return await _context.ProjectEquipmentSetups.Where(p => p.OrgAccountId == OrgAccountId).ToListAsync();
        }
        [Route("ProjectEquipmentSetupWithFilter")]
        [HttpPost]
        public async Task<ActionResult> GetProjectEquipmentSetupsWithFilter(string? name = "", string? hourlyRate = "", string? search = "", int skip = 0, int take = 0)
        {
            if (search == "")
            {
                var list = await _context.ProjectEquipmentSetups.Where(s =>
                    s.name.Contains(string.IsNullOrEmpty(name) ? "" : name)
                    && s.hourlyRate.ToString().Contains(string.IsNullOrEmpty(hourlyRate) ? "" : hourlyRate)
                    && s.OrgAccountId == OrgAccountId
                    ).ToListAsync();

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
                var list = await _context.ProjectEquipmentSetups.Where(s =>
                (s.name.Contains(string.IsNullOrEmpty(search) ? "" : search)
                || s.hourlyRate.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search))
                && s.OrgAccountId == OrgAccountId
                ).ToListAsync();

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
        [Route("ProjectEquipmentSetup/{id}")]
        [HttpGet]
        public async Task<ActionResult<ProjectEquipmentSetup>> GetProjectEquipmentSetup(int id)
        {
            var projectEquipmentSetup = await _context.ProjectEquipmentSetups.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectEquipmentSetup == null) { return BadRequest("ProjectEquipmentSetup does not exist"); }
            return Ok(projectEquipmentSetup);
        }

        [Route("ProjectEquipmentSetup")]
        [HttpPost]
        public async Task<ActionResult<ProjectEquipmentSetup>> PostProjectEquipmentSetup(ProjectEquipmentSetup equipmentSetup)
        {
            if (equipmentSetup.hourlyRate < 0)
            {
                return BadRequest("Negative value does not allowed");
            }
            equipmentSetup.OrgAccountId = OrgAccountId;
            _context.ProjectEquipmentSetups.Add(equipmentSetup);
            await _context.SaveChangesAsync();
            return equipmentSetup;
        }

        [Route("ProjectEquipmentSetup/{id}")]
        [HttpPut]
        public async Task<ActionResult<ProjectEquipmentSetup>> PutProjectEquipmentSetup(int id, ProjectEquipmentSetup equipmentSetup)
        {
            if (equipmentSetup.hourlyRate < 0)
            {
                return BadRequest("Negative value does not allowed");
            }
            if (id != equipmentSetup.Id)
            {
                return BadRequest("ProjectEquipmentSetup does not match with id");
            }
            var projectEquipmentSetup = await _context.ProjectEquipmentSetups.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (projectEquipmentSetup == null)
            {
                return BadRequest("ProjectEquipmentSetup does not exist");
            }
            equipmentSetup.createdBy = projectEquipmentSetup.createdBy;
            equipmentSetup.createdDate = projectEquipmentSetup.createdDate;
            equipmentSetup.OrgAccountId = OrgAccountId;
            _context.ProjectEquipmentSetups.Entry(projectEquipmentSetup).State = EntityState.Detached;
            _context.ProjectEquipmentSetups.Update(equipmentSetup);
            await _context.SaveChangesAsync();
            return equipmentSetup;
        }
        [Route("ProjectEquipmentSetup/{id}")]
        [HttpDelete]
        public async Task<ActionResult<ProjectEquipmentSetup>> DeleteProjectEquipmentSetup(int id)
        {
            var projectEquipmentSetup = await _context.ProjectEquipmentSetups.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectEquipmentSetup == null)
            {
                return BadRequest("ProjectEquipmentSetup does not exist");
            }
            _context.ProjectEquipmentSetups.Remove(projectEquipmentSetup);
            await _context.SaveChangesAsync();
            return projectEquipmentSetup;
        }


        [Route("{projectId}/ProjectEquipment")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectEquipment>>> GetProjectEquipments(int projectId)
        {
            List<ProjectEquipment> projectEquipments = await _context.ProjectEquipments.Include(p => p.equipmentSetup).Include(p => p.workType).Where(p => p.projectId.Equals(projectId)).ToListAsync();
            return projectEquipments;
        }

        [Route("{projectId}/GetEquipmentWithFilter")]
        [HttpPost]
        public async Task<ActionResult> GetEquipmentWithFilter(int projectId, bool desc, string sortKey = "modifiedDate", string? equipmentName = "", string? hours = "", string? hourlyRate = "", string? totalCost = "", string? workType = "", string? search = "", int skip = 0, int take = 0)
        {
            if (search == "")
            {
                var list = await _context.ProjectEquipments.Include(p => p.equipmentSetup).Include(p => p.workType).Where(p =>
                p.projectId.Equals(projectId)
                && p.hours.ToString().Contains(string.IsNullOrEmpty(hours) ? "" : hours)
                && p.hourlyRate.ToString().Contains(string.IsNullOrEmpty(hourlyRate) ? "" : hourlyRate)
                && p.totalCost.ToString().Contains(string.IsNullOrEmpty(totalCost) ? "" : totalCost)
                && p.equipmentSetup.name.Contains(string.IsNullOrEmpty(equipmentName) ? "" : equipmentName)
                && (string.IsNullOrEmpty(workType) || p.workType.type.Contains(string.IsNullOrEmpty(workType) ? "" : workType))
                && p.OrgAccountId == OrgAccountId
                ).OrderByCustom(sortKey, desc).ToListAsync();

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
                var list = await _context.ProjectEquipments.Include(p => p.equipmentSetup).Include(p => p.workType).Where(p =>
                (p.hours.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                || p.hourlyRate.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                || p.totalCost.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                || p.equipmentSetup.name.Contains(string.IsNullOrEmpty(search) ? "" : search)
                || p.workType.type.Contains(string.IsNullOrEmpty(search) ? "" : search))
                && p.OrgAccountId == OrgAccountId && p.projectId.Equals(projectId)
                ).OrderByCustom(sortKey, desc).ToListAsync();

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

        [Route("ProjectEquipment/{id}")]
        [HttpGet]
        public async Task<ActionResult<ProjectEquipment>> GetProjectEquipment(int id)
        {
            var projectEquipment = await _context.ProjectEquipments.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectEquipment == null)
            {
                return BadRequest("ProjectEquipment does not exist");
            }
            return Ok(projectEquipment);
        }

        [Route("{projectId}/ProjectEquipment")]
        [HttpPost]
        public async Task<ActionResult<ProjectEquipment>> PostProjectEquipment(ProjectEquipment projectEquipment)
        {
            if (projectEquipment.hours < 0 || projectEquipment.hourlyRate < 0 || projectEquipment.totalCost < 0)
            {
                return BadRequest("Negative value does not allowed");
            }
            projectEquipment.OrgAccountId = OrgAccountId;
            _context.ProjectEquipments.Add(projectEquipment);
            await _context.SaveChangesAsync();
            return projectEquipment;
        }

        [Route("ProjectEquipment/{id}")]
        [HttpPut]
        public async Task<ActionResult<ProjectEquipment>> PutProjectEquipment(int id, ProjectEquipment projectEquipment)
        {
            if (projectEquipment.hours < 0 || projectEquipment.hourlyRate < 0 || projectEquipment.totalCost < 0)
            {
                return BadRequest("Negative value does not allowed");
            }
            if (id != projectEquipment.Id)
            {
                return BadRequest("ProjectEquipment does not match with id");
            }
            var equipmentRef = await _context.ProjectEquipments.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (equipmentRef == null)
            {
                return BadRequest("ProjectEquipment does not exist");
            }
            projectEquipment.createdBy = equipmentRef.createdBy;
            projectEquipment.createdDate = equipmentRef.createdDate;
            projectEquipment.OrgAccountId = OrgAccountId;
            _context.ProjectEquipments.Entry(equipmentRef).State = EntityState.Detached;
            _context.ProjectEquipments.Update(projectEquipment);
            await _context.SaveChangesAsync();
            return Ok(projectEquipment);
        }

        [Route("ProjectEquipment/{id}")]
        [HttpDelete]
        public async Task<ActionResult<ProjectEquipment>> DeleteProjectEquipment(int id)
        {
            var projectEquipment = await _context.ProjectEquipments.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectEquipment == null)
            {
                return BadRequest("ProjectEquipment does not exist");
            }
            _context.ProjectEquipments.Remove(projectEquipment);
            await _context.SaveChangesAsync();
            return Ok(projectEquipment);
        }

        [Route("{projectId}/ProjectLabor")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectLabor>>> GetProjectLabors(int projectId)
        {
            List<ProjectLabor> projectLabors = await _context.ProjectLabors.Include(pl => pl.WorkType)
                .Include(pl => pl.Employee)
                .Where(pl => pl.projectId.Equals(projectId) && pl.OrgAccountId == OrgAccountId).ToListAsync();

            return projectLabors;
        }
        [Route("{projectId}/GetLaborWithFilter")]
        [HttpPost]
        public async Task<ActionResult> GetLaborWithFilter(int projectId, bool desc, string sortKey = "modifiedDate", string? empName = "", string? hours = "", string? hourlyRate = "", string? totalCost = "", string? workType = "", string? search = "", int skip = 0, int take = 0)
        {
            if (search == "")
            {
                var list = await _context.ProjectLabors.Include(pl => pl.WorkType).Include(pl => pl.Employee).Where(p =>
                p.projectId.Equals(projectId)
                && p.hours.ToString().Contains(string.IsNullOrEmpty(hours) ? "" : hours)
                && p.hourlyRate.ToString().Contains(string.IsNullOrEmpty(hourlyRate) ? "" : hourlyRate)
                && p.totalCost.ToString().Contains(string.IsNullOrEmpty(totalCost) ? "" : totalCost)
                && (string.IsNullOrEmpty(workType) || p.WorkType.type.Contains(string.IsNullOrEmpty(workType) ? "" : workType))
                && p.Employee.firstName.Contains(string.IsNullOrEmpty(empName) ? "" : empName)
                && p.OrgAccountId == OrgAccountId
                ).OrderByCustom(sortKey, desc).ToListAsync();

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
                var list = await _context.ProjectLabors.Include(pl => pl.WorkType).Include(pl => pl.Employee).Where(p =>
                (p.hours.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                || p.hourlyRate.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                || p.totalCost.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                || p.WorkType.type.Contains(string.IsNullOrEmpty(search) ? "" : search)
                || p.Employee.firstName.Contains(string.IsNullOrEmpty(search) ? "" : search))
                && p.OrgAccountId == OrgAccountId && p.projectId.Equals(projectId)
                ).OrderByCustom(sortKey, desc).ToListAsync();

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

        [Route("ProjectLabor/{id}")]
        [HttpGet]
        public async Task<ActionResult<ProjectLabor>> GetProjectLabor(int id)
        {
            var projectLabor = await _context.ProjectLabors.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectLabor == null)
            {
                return BadRequest("ProjectLabor does not exist");
            }
            return Ok(projectLabor);
        }

        [Route("{projectId}/ProjectLabor")]
        [HttpPost]
        public async Task<ActionResult<ProjectLabor>> PostProjectLabor(ProjectLabor projectLabor)
        {
            if (projectLabor.hourlyRate < 0 || projectLabor.hours < 0 || projectLabor.totalCost < 0)
            {
                return BadRequest("Negative values does not allowed");
            }
            projectLabor.OrgAccountId = OrgAccountId;
            _context.ProjectLabors.Add(projectLabor);
            await _context.SaveChangesAsync();
            return projectLabor;
        }

        [Route("ProjectLabor/{id}")]
        [HttpPut]
        public async Task<ActionResult<ProjectLabor>> PutProjectLabor(int id, ProjectLabor projectLabor)
        {
            if (projectLabor.hourlyRate < 0 || projectLabor.hours < 0 || projectLabor.totalCost < 0)
            {
                return BadRequest("Negative values does not allowed");
            }
            if (id != projectLabor.Id)
            {
                return BadRequest("ProjectLabor does not match with id");
            }
            var labourRef = await _context.ProjectLabors.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (labourRef == null)
            {
                return BadRequest("ProjectLabor does not exist");
            }
            projectLabor.createdBy = labourRef.createdBy;
            projectLabor.createdDate = labourRef.createdDate;
            projectLabor.OrgAccountId = OrgAccountId;
            _context.ProjectLabors.Entry(labourRef).State = EntityState.Detached;
            _context.ProjectLabors.Update(projectLabor);
            await _context.SaveChangesAsync();
            return Ok(projectLabor);
        }

        [Route("ProjectLabor/{id}")]
        [HttpDelete]
        public async Task<ActionResult<ProjectLabor>> DeleteProjectLabor(int id)
        {
            var projectLabor = await _context.ProjectLabors.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectLabor == null)
            {
                return BadRequest("ProjectLabor does not exist");
            }
            _context.ProjectLabors.Remove(projectLabor);
            await _context.SaveChangesAsync();
            return Ok(projectLabor);
        }

        [Route("{projectId}/ProjectMaterial")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectMaterial>>> GetProjectMaterials(int projectId)
        {
            List<ProjectMaterial> projectMaterials = await _context.ProjectMaterials
                .Include(pm => pm.WorkType).Include(pm => pm.Vendor)
                .Where(pm => pm.projectId.Equals(projectId) && pm.OrgAccountId == OrgAccountId).ToListAsync();
            return Ok(projectMaterials);
        }

        [Route("{projectId}/GetMaterialWithFilter")]
        [HttpPost]
        public async Task<ActionResult> GetMaterialWithFilter(int projectId, bool desc, string sortKey = "modifiedDate", string? material = "", string? vendorName = "", string? quantity = "", string unitCost = "", string totalCost = "", string? notes = "", string? workType = "", string? search = "", int skip = 0, int take = 0)
        {
            List<ProjectMaterial> list = new List<ProjectMaterial>();
            if (search == "")
            {
                list = await _context.ProjectMaterials.Include(pm => pm.WorkType).Include(pm => pm.Vendor).Where(p =>
               p.projectId.Equals(projectId) && p.material.Contains(string.IsNullOrEmpty(material) ? "" : material)
              && p.quantity.ToString().Contains(string.IsNullOrEmpty(quantity) ? "" : quantity)
              && p.unitCost.ToString().Contains(string.IsNullOrEmpty(unitCost) ? "" : unitCost)
              && p.totalCost.ToString().Contains(string.IsNullOrEmpty(totalCost) ? "" : totalCost)
              && p.Vendor.name.Contains(string.IsNullOrEmpty(vendorName) ? "" : vendorName)
              && (string.IsNullOrEmpty(workType) || p.WorkType.type.Contains(string.IsNullOrEmpty(workType) ? "" : workType))
              && (string.IsNullOrEmpty(notes) || p.notes.Contains(string.IsNullOrEmpty(notes) ? "" : notes))
              && p.OrgAccountId == OrgAccountId
              ).OrderByCustom(sortKey, desc).ToListAsync();


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
                list = await _context.ProjectMaterials.Include(pm => pm.WorkType).Include(pm => pm.Vendor).Where(p =>
               (p.material.Contains(string.IsNullOrEmpty(search) ? "" : search)
               || p.quantity.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
               || p.unitCost.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
               || p.totalCost.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
               || p.Vendor.name.Contains(string.IsNullOrEmpty(search) ? "" : search)
               || p.WorkType.type.Contains(string.IsNullOrEmpty(search) ? "" : search)
               || p.notes.Contains(string.IsNullOrEmpty(search) ? "" : search))
               && p.OrgAccountId == OrgAccountId && p.projectId.Equals(projectId)
               ).OrderByCustom(sortKey, desc).ToListAsync();

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

        [Route("ProjectMaterial/{id}")]
        [HttpGet]
        public async Task<ActionResult<ProjectMaterial>> GetProjectMaterial(int id)
        {
            var projectMaterial = await _context.ProjectMaterials.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectMaterial == null)
            {
                return BadRequest("ProjectMaterial does not exist");
            }
            return Ok(projectMaterial);
        }

        [Route("{projectId}/ProjectMaterial")]
        [HttpPost]
        public async Task<ActionResult<ProjectMaterial>> PostProjectMaterial(ProjectMaterial material)
        {
            if (material.unitCost < 0 || material.totalCost < 0 || material.quantity < 0)
            {
                return BadRequest("Negative value does not allowed");
            }
            material.OrgAccountId = OrgAccountId;
            _context.ProjectMaterials.Add(material);
            await _context.SaveChangesAsync();
            return material;
        }

        [Route("ProjectMaterial/{id}")]
        [HttpPut]
        public async Task<ActionResult<ProjectMaterial>> PutProjectMaterial(int id, ProjectMaterial projectMaterial)
        {
            if (projectMaterial.unitCost < 0 || projectMaterial.totalCost < 0 || projectMaterial.quantity < 0)
            {
                return BadRequest("Negative value does not allowed");
            }
            if (id != projectMaterial.Id)
            {
                return BadRequest("ProjectMaterial does not match with id");
            }
            var material = await _context.ProjectMaterials.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (material == null)
            {
                return BadRequest("ProjectMaterial does not exist");
            }
            projectMaterial.createdBy = material.createdBy;
            projectMaterial.createdDate = material.createdDate;
            projectMaterial.OrgAccountId = OrgAccountId;
            _context.ProjectMaterials.Entry(material).State = EntityState.Detached;
            _context.ProjectMaterials.Update(projectMaterial);
            await _context.SaveChangesAsync();
            return Ok(projectMaterial);
        }

        [Route("ProjectMaterial/{id}")]
        [HttpDelete]
        public async Task<ActionResult<ProjectMaterial>> DeleteProjectMaterial(int id)
        {
            var projectMaterial = await _context.ProjectMaterials.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (projectMaterial == null)
            {
                return BadRequest("ProjectMaterial does not exist");
            }
            _context.ProjectMaterials.Remove(projectMaterial);
            await _context.SaveChangesAsync();
            return Ok(projectMaterial);
        }
    }
}
