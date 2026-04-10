using FinexAPI.Common;
using FinexAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FinexAPI.Authorization
{
    public class UserPermissionHandler : IAuthorizationHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        private readonly IAppUser _appUser;
        private readonly UserLoginContext _employeeContext;

        public UserPermissionHandler(IHttpContextAccessor contextAccessor, IConfiguration configuration,
            ILogger<UserPermissionHandler> logger, IAppUser appUser, UserLoginContext employeeContext)
        {
            _httpContextAccessor = contextAccessor;
            _configuration = configuration;
            _logger = logger;
            _appUser = appUser;
            _employeeContext = employeeContext;
        }
        public Task HandleAsync(AuthorizationHandlerContext context)
        {
            string token = null;
            var claims = new List<Claim>();
            _logger.LogInformation("Inside Auth Handler");
            try
            {
                var requirements = context.Requirements.ToList();
                foreach (var requirement in requirements)
                {
                    if (_httpContextAccessor.HttpContext.Request.Headers.ContainsKey(Common.Constants.AuthHeader))
                    {
                        var authHeader = _httpContextAccessor.HttpContext.Request.Headers[Common.Constants.AuthHeader].First();
                        if (authHeader != null)
                        {
                            token = GetBearerToken(authHeader);
                        }
                    }

                    if (token != null)
                    {
                        _logger.LogInformation("token exist");
                        claims = ExtractClaimsFromToken(token);
                        _appUser.AddClaims(claims);
                        if (!string.IsNullOrEmpty(_appUser.UserId))
                        {
                            SetCurrentUserOrgMapping(_appUser.UserId);
                        }

                        _logger.LogInformation("Claims added to current user from token");
                        //Need to check policy based auth
                        if (!string.IsNullOrEmpty(_appUser.Role)) context.Succeed(requirement);
                        else context.Fail();
                    }
                    else
                    {
                        _logger.LogInformation("token is empty");
                        context.Fail();
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An exception has occured {@user}", _appUser);
                context.Fail();
            }
            return Task.CompletedTask;
        }

        private void AddClaimsFromToken()
        {
            var claimsIdentity = _httpContextAccessor.HttpContext?.User?.Identity as ClaimsIdentity;
            if (claimsIdentity != null && !claimsIdentity.Claims.Any())
                throw new Exception("No Claims Found.");

            _appUser.AddClaims(claimsIdentity!.Claims.ToList());
        }

        private string GetBearerToken(string header)
        {
            if (string.IsNullOrEmpty(header)) throw new ArgumentException("Invalid header");
            return header.Remove(0, header.IndexOf(' ') + 1);
        }

        private List<Claim> ExtractClaimsFromToken(string token)
        {
            var claims = new List<Claim>();
            if (string.IsNullOrEmpty(token)) return claims;

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

            foreach (var c in jwtToken.Claims)
            {
                claims.Add(new Claim(c.Type.ToLower(), c.Value));
            }
            return claims;
        }

        private void SetCurrentUserOrgMapping(string userId)
        {
            var userInfo = _employeeContext.EmployeeUserMapping.FirstOrDefault(x => x.UserId == userId);
            if (userInfo != null)
            {
                _appUser.SetUserOrgID(userInfo.OrgAccountId, userInfo.UserId);
            }
        }

    }
}
