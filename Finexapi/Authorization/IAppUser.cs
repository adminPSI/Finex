using System.Security.Claims;

namespace FinexAPI.Authorization
{
    public interface IAppUser
    {
        public string Name { get; set; }

        public string Role { get; set; }

        public int OrgAccountId { get; set; }

        public string LoginUserName { get; set; }

        public string UserId { get; set; }

        void AddClaims(IList<Claim> claims);

        void SetUserOrgID(int orgAccId, string userId);
    }
}
