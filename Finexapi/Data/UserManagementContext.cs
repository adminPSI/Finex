using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using FinexAPI.Models.UserManagement;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace FinexAPI.Data
{
    public class UserManagementContext : IdentityDbContext<IdentityUser>
    {
        private readonly IHttpContextAccessor _context;
        public UserManagementContext(DbContextOptions<UserManagementContext> options, IHttpContextAccessor context) : base(options)
        {
            _context = context;
        }

        public DbSet<PRIVILEGES> PRIVILEGES { get; set; }
        public DbSet<RESOURCES> RESOURCES { get; set; }
        public DbSet<ROLE_RESOURCES> ROLE_RESOURCES { get; set; }
        public DbSet<ROLE> ROLE { get; set; }
        public DbSet<FUNCTIONS_GROUPS> FUNCTIONS_GROUPS { get; set; }
        public DbSet<FUNCTIONS_RESOURCES> FUNCTIONS_RESOURCES { get; set; }
        public DbSet<FUNCTIONS> FUNCTIONS { get; set; }
        public DbSet<FUNCTION_ALLOWED_PRIVILEGES> FUNCTION_ALLOWED_PRIVILEGES { get; set; }
        public DbSet<FUNCTION_PRIVILEGE_ROLE> FUNCTION_PRIVILEGE_ROLE { get; set; }
        public DbSet<FUNCTION_PRIVILEGE_ROLE_LOOKUP> FUNCTION_PRIVILEGE_ROLE_LOOKUP { get; set; }
        public DbSet<APIAUTHORIZATIONRESOURCES> APIAUTHORIZATIONRESOURCES { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            var addEditEntities = ChangeTracker.Entries().Where(e => e.State == EntityState.Added).ToList();
            if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
            {
                var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                foreach (var item in addEditEntities)
                {
                    if (orgid > 0)
                    {
                        if (item.Properties.Any(p => p.Metadata.Name == "ORG_ACCOUNT_ID"))
                        {
                            item.Property("ORG_ACCOUNT_ID").CurrentValue = orgid;
                        }
                    }
                }
            }
            //AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            var addEditEntities = ChangeTracker.Entries().Where(e => e.State == EntityState.Added).ToList();
            if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
            {
                var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                foreach (var item in addEditEntities)
                {
                    if (orgid > 0)
                    {
                        if (item.Properties.Any(p => p.Metadata.Name == "ORG_ACCOUNT_ID"))
                        {
                            item.Property("ORG_ACCOUNT_ID").CurrentValue = orgid;
                        }
                    }
                }
            }
            //AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChanges();
        }

    }
}
