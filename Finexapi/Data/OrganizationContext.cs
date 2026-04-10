using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models.Organization;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class OrganizationContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public OrganizationContext(DbContextOptions<OrganizationContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }

        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrgnizationLocation> orgnizationLocations { get; set; }
        public DbSet<OrgnizationAccount> orgnizationAccounts { get; set; }

        //public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        //{
        //    var addEditEntities = ChangeTracker.Entries().Where(e => e.State == EntityState.Added).ToList();
        //    if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
        //    {
        //        var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
        //        foreach (var item in addEditEntities)
        //        {
        //            if (orgid > 0)
        //            {
        //                if (item.Properties.Any(p => p.Metadata.Name == "orgId"))
        //                {
        //                    item.Property("orgId").CurrentValue = orgid;
        //                }
        //            }
        //        }
        //    }
        //    AuditInformation.ApplyAuditInformation(this, _appUser);
        //    return base.SaveChangesAsync(cancellationToken);
        //}

        //public override int SaveChanges()
        //{
        //    var addEditEntities = ChangeTracker.Entries().Where(e => e.State == EntityState.Added).ToList();
        //    if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
        //    {
        //        var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
        //        foreach (var item in addEditEntities)
        //        {
        //            if (orgid > 0)
        //            {
        //                if (item.Properties.Any(p => p.Metadata.Name == "orgId"))
        //                {
        //                    item.Property("orgId").CurrentValue = orgid;
        //                }
        //            }
        //        }
        //    }
        //    AuditInformation.ApplyAuditInformation(this, _appUser);
        //    return base.SaveChanges();
        //}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Organization>()
                .HasOne(x => x.OrgnizationAccount)
                .WithOne(x => x.Organization)
                .HasForeignKey<OrgnizationAccount>(x => x.orgId);
            modelBuilder.Entity<Organization>()
                .HasOne(x => x.OrgnizationLocation)
                .WithOne(x => x.Organization)
                .HasForeignKey<OrgnizationLocation>(x => x.orgId);

            
                //if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                //{
                //    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                //    if (orgid != 0)
                //    {
                //        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                //        modelBuilder.Entity<OrgnizationLocation>().HasQueryFilter(e => e.orgId == orgid);
                //        modelBuilder.Entity<OrgnizationAccount>().HasQueryFilter(e => e.orgId == orgid);
                //    }
                //}


        }

    }
}
