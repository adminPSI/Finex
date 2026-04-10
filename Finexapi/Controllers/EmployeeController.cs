using FinexAPI.Authorization;
using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.Net.WebSockets;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeeController : BaseController
    {
        private readonly FinexAppContext _employeeContext;
        ListResultController<Employee> _cmnCntrlr = new ListResultController<Employee>();
        private readonly IAppUser _appUser ;
        public EmployeeController(FinexAppContext employeeContext, IHttpContextAccessor httpContextAccessor, IAppUser appUser) : base(httpContextAccessor)
        {
            _employeeContext = employeeContext;
            _appUser = appUser;
        }

        /*EMPLOYEE DETAILS*/

        //Get All Employees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployee()
        {
            return await _employeeContext.Employees.Include(x=>x.employeeAddresses).ThenInclude(x=>x.County)
                .Where(p => p.activeInd=="Y").OrderBy(p => p.lastName).ThenBy(p=>p.firstName).ToListAsync();
        }

                //Employee Filter
        [Route("Filter")]
        [HttpPost]
        public async Task<ActionResult> Filter(bool desc, string sortKey = "modifiedDate", string? ActiveInd = "", string? FirstName = "", string? LastName = "", string? EmployeeNumber = "", string? phoneNumber = "", string? email = "", string? userName = "", string? search = "", int skip = 0, int take = 0)
        {
            var userRoles = HttpContext.User.Claims.Where(u => u.Type == ClaimTypes.Role)?.Select(x => x.Value?.ToLower())?.ToList();
            bool showAllEmployees = false;
            foreach (var role in userRoles)
            {
                if (role.ToString().ToLower().Contains("administrator") || role.ToString().ToLower().Contains("hr") || role.ToString().ToLower().Contains("fiscal") || role.ToString().ToLower().Contains("payroll") || role.ToString().ToLower().Contains("supervisor"))
                {
                    showAllEmployees = true;
                    break;
                }
            }

            if (search == "")
            {

                var emplist = await _employeeContext.Employees
                    .Where(p => p.firstName.Contains(string.IsNullOrEmpty(FirstName) ? "" : FirstName)
                && p.lastName.Contains(string.IsNullOrEmpty(LastName) ? "" : LastName)
                && (string.IsNullOrEmpty(EmployeeNumber) || p.employeeNumber.Contains(EmployeeNumber))
                && (string.IsNullOrEmpty(phoneNumber) || p.mobilePhoneNumber.Contains(phoneNumber))
                && (string.IsNullOrEmpty(email) || p.emailAddress.Contains(email))
                && p.activeInd.Contains(string.IsNullOrEmpty(ActiveInd) ? "" : ActiveInd)
                && (string.IsNullOrEmpty(userName) || p.userName.Contains(userName))
                && (showAllEmployees ? true : p.id == MemberId)
                ).OrderByCustom(sortKey, desc).ToListAsync();

                if (take == 0)
                {
                    return Ok(new { data = emplist, Total = emplist.Count });
                }
                else
                {
                    return Ok(new { data = emplist.Skip(skip).Take(take).ToList(), Total = emplist.Count });

                }
            }
            else
            {
                var List = await _employeeContext.Employees
                    .Where(p => (p.firstName.Contains(search) ||
                p.employeeNumber.Contains(search) ||
                p.mobilePhoneNumber.Contains(search) ||
                p.emailAddress.Contains(search) ||
                p.lastName.Contains(search))
                && p.activeInd.Contains(string.IsNullOrEmpty(ActiveInd) ? "" : ActiveInd)
                && (showAllEmployees ? true : p.id == MemberId)
                ).OrderByCustom(sortKey, desc).ToListAsync();

                if (take == 0)
                {
                    return Ok(new { data = List, Total = List.Count });
                }
                else
                {
                    return Ok(new { data = List.Skip(skip).Take(take).ToList(), Total = List.Count });

                }
            }
        }

        //Get Employee By Employee ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _employeeContext.Employees.Where(e => e.id == id).FirstOrDefaultAsync();
            if (employee == null)
            {
                return BadRequest("Employee does not exist");
            }
            return Ok(employee);
        }

        //Get Employee By Organization Id
        [Route("Organization")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesByOrgId()
        {
            return await _employeeContext.Employees.ToListAsync();
        }
        //Create new Employee

        [HttpPost]
        public async Task<ActionResult<Employee>> PostEmployee(Employee employee)
        {
            if (employee == null)
            {
                return BadRequest();
            }
            if (!string.IsNullOrEmpty(employee.emailAddress))
            {
                //email has to be unique across the system
                var empRef1 = await _employeeContext.Employees.Where(x => x.emailAddress == employee.emailAddress).FirstOrDefaultAsync();
                if (empRef1 != null)
                {
                    return BadRequest("Email can't be duplicate");
                }
            }
            if (!string.IsNullOrEmpty(employee.ssn))
            {
                var empRef2 = await _employeeContext.Employees.Where(x => x.ssn == employee.ssn ).FirstOrDefaultAsync();
                if (empRef2 != null)
                {
                    return BadRequest("SSN can't be duplicate");
                }
            }
            _employeeContext.Employees.Add(employee);
            await _employeeContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEmployee), new { id = employee.id }, employee);
        }
        // Update Employee
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmployee(int id, Employee employee)
        {
            if (id != employee.id)
            {
                return BadRequest("Employee does not match with id");
            }
            var empRef = await _employeeContext.Employees.FirstOrDefaultAsync(x => x.id == id);
            if (empRef == null)
            {
                return NotFound();
            }
            if (!empRef.emailAddress.Equals(employee.emailAddress))
            {
                //email must be unique across tenants
                var empRef1 = await _employeeContext.Employees.Where(x => x.emailAddress == employee.emailAddress).FirstOrDefaultAsync();
                if (empRef1 != null)
                {
                    return BadRequest("Email can't be duplicate");
                }
            }
            else if ((empRef.ssn is null || empRef.ssn == "") && employee.ssn is not null && employee.ssn != "")
            {
                var empRef2 = await _employeeContext.Employees.Where(x => x.ssn == employee.ssn).FirstOrDefaultAsync();
                if (empRef2 != null)
                {
                    return BadRequest("SSN can't be duplicate");
                }
            }
            else if (employee.ssn is not null && employee.ssn != "" && empRef.ssn is not null && empRef.ssn != "" && !empRef.ssn.Equals(employee.ssn))
            {
                var empRef3 = await _employeeContext.Employees.Where(x => x.ssn == employee.ssn).FirstOrDefaultAsync();
                if (empRef3 != null)
                {
                    return BadRequest("SSN can't be duplicate");
                }
            }

            employee.createdBy = empRef.createdBy;
            employee.createdDate = empRef.createdDate;
            _employeeContext.Employees.Entry(empRef).State = EntityState.Detached;
            try
            {
                _employeeContext.Update(employee);
                await _employeeContext.SaveChangesAsync();
            }
            catch (DBConcurrencyException)
            {
                if (!EmployeeExists(id))
                {
                    return BadRequest("Employee does not exist");
                }
                else { throw; }
            }
            catch(Exception ex)
            {

            }
            return CreatedAtAction(nameof(GetEmployee), new { id = employee.id }, employee);
        }
        private bool EmployeeExists(int id)
        {
            return _employeeContext.Employees.Any(x => x.id == id);
        }

        /*EMPLOYEE FAMILY MEMBERS*/

        //Get  Employee Family Members by Employee Id
        [Route("{employeeId}/Family")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeFamilyMember>>> GetFamily(int employeeId)
        {
            return await _employeeContext.EmployeesFamilyMember.Where(x => x.employeeId == employeeId).ToListAsync();
        }
        //Add New Family Members
        [Route("Family")]
        [HttpPost]
        public async Task<ActionResult<EmployeeFamilyMember>> PostFamily(EmployeeFamilyMember family)
        {
            if (family == null)
            {
                return BadRequest("Employee Family does not exist");
            }
            _employeeContext.EmployeesFamilyMember.Add(family);
            await _employeeContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFamilyById), new { id = family.Id }, family);
        }
        //Get Family Members By Id
        [Route("Family/{id}")]
        [HttpGet]
        public async Task<ActionResult<EmployeeFamilyMember>> GetFamilyById(int id)
        {
            var family = await _employeeContext.EmployeesFamilyMember.FindAsync(id);
            if (family == null)
            {
                return BadRequest("Employee Familyt does not exist");
            }
            return family;
        }
        //Update Family Members
        [Route("Family/{id}")]
        [HttpPut]
        public async Task<IActionResult> PutEmployeeFamily(int id, EmployeeFamilyMember family)
        {
            if (id != family.Id)
            {
                return BadRequest("Employee Family does not match with id");
            }
            var familyRef = await _employeeContext.EmployeesFamilyMember.FindAsync(id);
            if (familyRef == null)
            {
                return BadRequest("Employee does not exist");
            }
            family.createdBy = familyRef.createdBy;
            family.createdDate = familyRef.createdDate;
            _employeeContext.EmployeesFamilyMember.Entry(familyRef).State = EntityState.Detached;
            _employeeContext.EmployeesFamilyMember.Update(family);
            try
            {
                await _employeeContext.SaveChangesAsync();
            }
            catch (DBConcurrencyException)
            {
                if (!FamilyAvilable(id))
                {
                    return BadRequest("Employee Family does not exist");
                }
                else { throw; }
            }
            return CreatedAtAction(nameof(GetFamilyById), new { id = family.Id }, family);
        }
        private bool FamilyAvilable(int id)
        {
            return _employeeContext.EmployeesFamilyMember.Any(x => x.Id == id);
        }


        /*EMPLOYEE ADDRESS*/

        //Get Employee Address By Employee Id
        [Route("{EmployeeId}/Address")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeAddress>>> GetAddress(int EmployeeId, string activeind)
        {
            try
            {
                var data= await _employeeContext.EmployeesAddress.Include(x=>x.County).Where(x => x.employeeId == EmployeeId && x.activeInd == activeind).ToListAsync();
                return data;
            }
            catch (Exception ex) 
            {
                throw;
            }
        }
        //Get Address by ID
        [Route("Address/{id}")]
        [HttpGet]
        public async Task<ActionResult<EmployeeAddress>> GetAddressById(int id)
        {
            var address = await _employeeContext.EmployeesAddress.FindAsync(id);
            if (address == null)
            {
                return BadRequest("Employee Address does not exist");
            }
            return address;
        }
        //Add new Employee Address
        [Route("Address")]
        [HttpPost]
        public async Task<ActionResult<EmployeeAddress>> PostAddess(EmployeeAddress address)
        {
            if (address == null)
            {
                return NotFound();
            }
            _employeeContext.EmployeesAddress.Add(address);
            await _employeeContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAddressById), new { id = address.Id }, address);
        }
        //Update Employee Address
        [Route("Address/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateEmployeeAddress(int id, EmployeeAddress address)
        {
            if (id != address.Id)
            {
                return BadRequest("Employee Address does not match with id");
            }
            var addressRef = await _employeeContext.EmployeesAddress.FindAsync(id);
            if (addressRef == null)
            {
                return NotFound(id);
            }
            address.createdBy = addressRef.createdBy;
            address.createdDate = addressRef.createdDate;
            _employeeContext.EmployeesAddress.Entry(addressRef).State = EntityState.Detached;
            _employeeContext.EmployeesAddress.Update(address);
            try
            {
                await _employeeContext.SaveChangesAsync();
            }
            catch (DBConcurrencyException)
            {
                if (!AddressAvilable(id))
                {
                    return BadRequest("Employee Address does not exist");
                }
                else { throw; }
            }
            return CreatedAtAction(nameof(GetAddressById), new { id = address.Id }, address);
        }
        //Update Employee Address
        [Route("SetActive/{id}")]
        [HttpPut]
        public async Task<IActionResult> SetActive(int id)
        {
            var employeeRef = await _employeeContext.Employees.FindAsync(id);
            if (employeeRef == null)
            {
                return NotFound(id);
            }
            employeeRef.activeInd = "Y";
            employeeRef.modifiedDate = employeeRef.modifiedDate;
            employeeRef.modifiedBy = _appUser.LoginUserName ?? "System";

            _employeeContext.Employees.Update(employeeRef);
            try
            {
                await _employeeContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw; 
            }
            return Ok(employeeRef);
        }
        [Route("SetInactive/{id}")]
        [HttpPut]
        public async Task<IActionResult> SetInactive(int id)
        {
            var employeeRef = await _employeeContext.Employees.FindAsync(id);
            if (employeeRef == null)
            {
                return NotFound(id);
            }
            employeeRef.activeInd = "N";
            employeeRef.modifiedDate = employeeRef.modifiedDate;
            employeeRef.modifiedBy = _appUser.LoginUserName ?? "System";

            _employeeContext.Employees.Update(employeeRef);
            try
            {
                await _employeeContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
            return Ok(employeeRef);
        }
        private bool AddressAvilable(int id)
        {
            return _employeeContext.EmployeesAddress.Any(x => x.Id == id);
        }

        [Route("GroupNumber")]
        [HttpGet]
        public async Task<ActionResult> GetGroupNumber()
        {
            var data = await _employeeContext.Employees.Select(e => e.groupNumber).Distinct().ToListAsync();
            return Ok(data);
        }

    }

}