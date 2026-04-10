using FinexAPI.Data;
using FinexAPI.Models.Email;
using Microsoft.AspNetCore.Mvc;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : BaseController
    {
        private readonly EmailContext _emailContext;

        public EmailController(EmailContext emailContext, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _emailContext = emailContext;
        }

        [HttpPost]
        [Route("SendEmailMessage")]
        public  async Task<ActionResult> SendEmail([FromForm] Message message)
        {
            return null;
        }
    }
}
