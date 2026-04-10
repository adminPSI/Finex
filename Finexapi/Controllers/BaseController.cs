using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[ProducesResponseType((int)HttpStatusCode.OK)]
    //[ProducesResponseType((int)HttpStatusCode.Forbidden)]
    //[ProducesResponseType((int)HttpStatusCode.Unauthorized)]
    //[ProducesResponseType((int)HttpStatusCode.NotFound)]
    //[ProducesResponseType((int)HttpStatusCode.BadRequest)]
    //[ProducesResponseType((int)HttpStatusCode.InternalServerError)]
    public abstract class BaseController : ControllerBase
    {
        private readonly IHttpContextAccessor _contextAccessor;
        protected int OrgAccountId { get; private set; }
        protected int MemberId { get; private set; }

        protected List<string> Roles { get; private set; }

        protected List<string> WorkFlowRoles { get; private set; }
        public BaseController(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
            if (_contextAccessor != null && _contextAccessor.HttpContext != null && _contextAccessor.HttpContext.Items.ContainsKey("OrgAccountId"))
                OrgAccountId = (int)_contextAccessor.HttpContext.Items["OrgAccountId"]!;
            if (_contextAccessor != null && _contextAccessor.HttpContext != null && _contextAccessor.HttpContext.Items.ContainsKey("MemberId"))
                MemberId = (int)_contextAccessor.HttpContext.Items["MemberId"]!;
            if (_contextAccessor != null && _contextAccessor.HttpContext != null && _contextAccessor.HttpContext.Items.ContainsKey("Roles"))
                Roles = (List<string>)_contextAccessor.HttpContext.Items["Roles"]!;
            if (_contextAccessor != null && _contextAccessor.HttpContext != null && _contextAccessor.HttpContext.Items.ContainsKey("WorkflowRoles"))
                WorkFlowRoles = (List<string>)_contextAccessor.HttpContext.Items["WorkflowRoles"]!;

        }
    }
}
