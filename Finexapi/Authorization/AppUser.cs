using System.Security.Claims;

namespace FinexAPI.Authorization
{
    public class AppUser : IAppUser
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        private IHttpContextAccessor _httpContextAccessor;

        public AppUser(IHttpContextAccessor httpContextAccessor, ILogger<AppUser> logger, IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
            _logger = logger;
        }

        public string Name { get; set; }

        public string Role { get; set; }

        public string LoginUserName { get; set; }

        public int OrgAccountId { get; set; }

        public string UserId { get; set; }

        public void AddClaims(IList<Claim> claims)
        {
            if (claims.Any(x => x.Type.Equals(ClaimTypes.Name)))
                LoginUserName = Name = claims.First(x => x.Type.Equals(ClaimTypes.Name)).Value;

            if (claims.Any(x => x.Type.Equals(ClaimTypes.Role)))
                Role = claims.First(x => x.Type.Equals(ClaimTypes.Role)).Value;
        }

        public void SetUserOrgID(int orgAccId, string userId)
        {
            OrgAccountId = orgAccId;
            UserId = userId;
        }
    }
}
