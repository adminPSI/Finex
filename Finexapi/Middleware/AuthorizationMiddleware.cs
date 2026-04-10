
using FinexAPI.Data;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Identity.Client;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using FinexAPI.Models.UserManagement;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.AspNetCore.SignalR;


namespace FinexAPI.Middleware
{
    public class CustomAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        //private readonly IDistributedCache _cache;
        private readonly IMemoryCache _memoryCache;
        private readonly FinexAppContext _employeeContext;


        /* public TenantMiddleware(RequestDelegate nest, IDistributedCache cache)
         {
             _next = nest;
             _cache = cache;
         }*/

        public CustomAuthorizationMiddleware(RequestDelegate next, IMemoryCache memoryCache)
        {
            _next = next;
            _memoryCache = memoryCache;
            //   _employeeContext = employeeContext;

        }


        public async Task InvokeAsync(HttpContext context, UserManagementContext userManagementContext)
        {
            try
            {
                UserManagementContext _userManagementContext = userManagementContext;
                var user = context.User;
                if (user.Identity.IsAuthenticated)
                {
                    var endpoint = context.GetEndpoint();
                    if (endpoint != null)
                    {
                        var userRoles = context.User.Claims.Where(u => u.Type == ClaimTypes.Role)?.Select(x => x.Value?.ToLower())?.ToList();
                        var httpMethods = endpoint.Metadata.GetMetadata<HttpMethodMetadata>()?.HttpMethods;
                        var httpMethodsString = httpMethods != null ? string.Join(", ", httpMethods) : "None";
                        var routePattern = (endpoint as RouteEndpoint)?.RoutePattern.RawText;
                        var roleIds = _userManagementContext.ROLE.Where(o => userRoles.Contains(o.ROLES_NAME)).Select(x => x.ROLE_ID).ToList();

                        //var resourceIds= (from ar in _userManagementContext.APIAUTHORIZATIONRESOURCES 
                        //                  where (ar.API_ENDPOINT.ToLower().Equals(routePattern.ToLower()))
                        //                  && (ar.API_METHOD.ToLower().Equals(httpMethodsString.ToLower()))
                        //                  select Convert.ToInt32(ar.RESOURCES_ID)).ToList();

                        var apiIds = (from fpr in _userManagementContext.FUNCTION_PRIVILEGE_ROLE
                                      join fr in _userManagementContext.FUNCTIONS_RESOURCES on fpr.FUNCTION_ID equals fr.FUNCTIONS_ID
                                      join r in _userManagementContext.RESOURCES on fr.RESOURCES_ID equals r.RESOURCES_ID
                                      join ar in _userManagementContext.APIAUTHORIZATIONRESOURCES on r.RESOURCES_ID equals ar.RESOURCES_ID
                                      where (roleIds.Contains(fpr.ROLE_ID)) && (ar.API_ENDPOINT.ToLower().Trim().Equals(routePattern.ToLower().Trim()))
                                      && (ar.API_METHOD.ToLower().Trim().Equals(httpMethodsString.ToLower().Trim()))
                                      select Convert.ToInt32(r.RESOURCES_ID)).ToList();

                        if (!apiIds.Any())
                        {
                            var hasDefaultAccess = _userManagementContext.APIAUTHORIZATIONRESOURCES.Any(x => x.RESOURCES_ID == -1 && x.API_ENDPOINT.ToLower().Trim().Equals(routePattern.ToLower().Trim()));

                            if (!hasDefaultAccess)
                            {
                                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                                await context.Response.WriteAsync("Forbidden");
                                return;
                            }
                        }

                    }
                }


            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex);
                throw;
            }

            await _next(context);
        }

        //public async Task InvokeAsync(HttpContext context,UserManagementContext userManagementContext)
        //{
        //    try
        //    {
        //        UserManagementContext _userManagementContext = userManagementContext;
        //        var user = context.User;
        //        if (user.Identity.IsAuthenticated)
        //        {
        //            var endpoint = context.GetEndpoint();
        //            if (endpoint != null)
        //            {
        //                var userRoles = context.User.Claims.Where(u => u.Type == ClaimTypes.Role)?.Select(x => x.Value?.ToLower())?.ToList();
        //                var httpMethods = endpoint.Metadata.GetMetadata<HttpMethodMetadata>()?.HttpMethods;
        //                var httpMethodsString = httpMethods != null ? string.Join(", ", httpMethods) : "None";
        //                var routePattern = (endpoint as RouteEndpoint)?.RoutePattern.RawText;


        //                var apiIds = await (from role in _userManagementContext.ROLE
        //                                    join roleResource in _userManagementContext.ROLE_RESOURCES on role.ROLE_ID equals roleResource.ROLE_ID
        //                                    join apiResource in _userManagementContext.APIAUTHORIZATIONRESOURCES on roleResource.RESOURCES_ID equals apiResource.RESOURCES_ID
        //                                    where userRoles.Contains(role.ROLES_NAME.ToLower()) &&
        //                                          apiResource.API_ENDPOINT.Equals(routePattern) &&
        //                                          apiResource.API_METHOD.Equals(httpMethodsString)
        //                                    select apiResource.RESOURCES_ID).ToListAsync();

        //                /* if (!apiIds.Any())
        //                 {
        //                     context.Response.StatusCode = StatusCodes.Status403Forbidden;
        //                     await context.Response.WriteAsync("Forbidden");
        //                     return;
        //                 }*/

        //            }
        //        }


        //    }
        //    catch (Exception ex)
        //    {
        //        System.Diagnostics.Debug.WriteLine(ex);
        //        throw ex;
        //    }

        //    await _next(context);
        //}
    }
}
