using FinexAPI.Data;
using FinexAPI.Models;
using FinexAPI.Models.Payroll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PREmployeeController : ControllerBase
    {
        private readonly ILogger<PREmployeeController> _logger;
        private readonly FinexAppContext _payrollContext;

        public PREmployeeController(FinexAppContext payrollContext, ILogger<PREmployeeController> logger)
        {
            _payrollContext = payrollContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<List<Employee>> GetEmployees()
        {
            try
            {
                var employees = await _payrollContext.Employees.ToListAsync();
                return employees;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpGet("counties")]
        public async Task<List<FinexAPI.Models.PayrollEmployee.County>> GetCounties()
        {
            try
            {
                var counties = await _payrollContext.Counties.ToListAsync();
                return counties;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        [HttpGet("groups")]
        public async Task<ActionResult<List<int>>> GetGroupNumbers()
        {
            try
            {
                return new List<int>() { 1, 2, 3, 4, 5 }; //TODO: implement when Payroll module is created
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }

        //private bool EmployeeExists(int id)
        //{
        //    return _payrollContext.Employees.Any(e => e.id == id);
        //}*/
    }

}
