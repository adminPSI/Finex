using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class CurrentUserContext : ICurrentUserContext
    {
        private readonly IHttpContextAccessor _contextAccessor;
        public CurrentUserContext(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public int OrgAccountId {
            get {
                return int.TryParse(_contextAccessor.HttpContext?.Items["OrgAccountId"].ToString(), out var id) ? id : 0;
            }
        }

        public int UserId
        {
            get
            {
                return int.TryParse(_contextAccessor.HttpContext?.Items["UserId"].ToString(), out var id) ? id : 0;
            }
        }
    }
}
