using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore;
using FinexAPI.Authorization;

namespace FinexAPI.Helper
{
    public class AuditInformation
    {
        public static void ApplyAuditInformation(DbContext dbContext, IAppUser _appUser)
        {
            foreach (var item in dbContext.ChangeTracker.Entries<Models.Common>())
            {
                switch (item.State)
                {
                    case EntityState.Added:
                        if(string.IsNullOrEmpty(item.Entity.createdBy))
                        item.Entity.createdBy = _appUser.LoginUserName ?? "System";
                        item.Entity.createdDate = DateTime.Now;
                        item.Entity.modifiedBy = _appUser.LoginUserName ?? "System";
                        item.Entity.modifiedDate = DateTime.Now;
                        break;
                    case EntityState.Modified:
                        item.Entity.modifiedBy = _appUser.LoginUserName ?? "System_Update";
                        item.Entity.modifiedDate = DateTime.Now;
                        break;
                }
            }
        }
    }
}
