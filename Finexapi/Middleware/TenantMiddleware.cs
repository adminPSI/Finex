
using FinexAPI.Data;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Identity.Client;
using System.Security.Claims;

namespace FinexAPI.Middleware
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;
        //private readonly IDistributedCache _cache;
        private readonly IMemoryCache _memoryCache;
        private readonly UserLoginContext _employeeContext;

        /* public TenantMiddleware(RequestDelegate nest, IDistributedCache cache)
         {
             _next = nest;
             _cache = cache;
         }*/

        public TenantMiddleware(RequestDelegate next, IMemoryCache memoryCache)
        {
            _next = next;
            _memoryCache = memoryCache;
            //   _employeeContext = employeeContext;
        }

        public async Task Invoke(HttpContext context, UserLoginContext employeeContext )
        {
            try
            {


                //var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                var userId = context.User.Claims.Where(u => u.Type == ClaimTypes.NameIdentifier).FirstOrDefault()?.Value;
                var userRole = context.User.Claims.Where(u => u.Type == ClaimTypes.Role)?.Select(x => x.Value?.ToLower())?.ToList();
                if (userId != null)
                {

                    var orgAccountId = _memoryCache.TryGetValue($"OrgAccountId:{userId}", out var orgId);
                    var MemberId = _memoryCache.TryGetValue($"MemberId:{userId}", out var memberId);
                    if (!orgAccountId || !MemberId)
                    {
                        var userInfo = employeeContext.EmployeeUserMapping.FirstOrDefault(x => x.UserId == userId);
                        _memoryCache.Set($"OrgAccountId:{userId}", userInfo?.OrgAccountId, TimeSpan.FromHours(1));
                        _memoryCache.Set($"MemberId:{userId}", userInfo?.EmpId, TimeSpan.FromHours(1));
                    }
                    context.Items["OrgAccountId"] = _memoryCache.Get($"OrgAccountId:{userId}");
                    context.Items["MemberId"] = _memoryCache.Get($"MemberId:{userId}");

                }
                if (userRole is not null)
                {
                    var userRoles = _memoryCache.TryGetValue($"userRoles:{userId}", out var roles);
                    var wRoles = _memoryCache.TryGetValue($"workflowRoles:{userId}", out var wfRoles);
                    if (!userRoles || !wRoles)
                    {
                        var workflowRoles = employeeContext.IHPOWorkflowSteps.Where(x=>x.OrgAccountId.HasValue).ToList().Select(x => _memoryCache.Get($"OrgAccountId:{userId}") + "_" + x.stepRole.ToLower());
                        _memoryCache.Set($"userRoles:{userId}", userRole, TimeSpan.FromHours(1));
                        _memoryCache.Set($"workflowRoles:{userId}", workflowRoles.Intersect(userRole).ToList(), TimeSpan.FromHours(1));
                    }
                    context.Items["Roles"] = _memoryCache.Get($"userRoles:{userId}");
                    context.Items["WorkflowRoles"] = _memoryCache.Get($"workflowRoles:{userId}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex);
            }

            await _next(context);
        }
    }
}
