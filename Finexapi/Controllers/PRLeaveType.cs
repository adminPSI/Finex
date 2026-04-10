using FinexAPI.Data;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PRLeaveTypeController : ControllerBase
    {
        private readonly ILogger<PREmployeeController> _logger;
        //  private readonly PayrollContext _payrollContext;

        public PRLeaveTypeController(ILogger<PREmployeeController> logger)
        {
            // _payrollContext = payrollContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<string>>> GetLeaveTypes()
        {
            try
            {
                //TODO: Implement when Payroll Module is ready
                return new List<string>() { "Administrative Leave", "Bereavement", "Jury Duty", "Personal" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message+", "+ex.StackTrace);
                throw;
            }
        }
    }

}
