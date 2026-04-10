using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class IHACContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public IHACContext(DbContextOptions<IHACContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }

        public DbSet<IHACCode> IHACCodes { get; set; }
        public DbSet<IHCAccount> IHCAccounts { get; set; }
        public DbSet<IHCDepartment> IHCDepartments { get; set; }
        public DbSet<IHCSubAccount> IHCSubAccounts { get; set; }
        public DbSet<IHCProgram> IHCPrograms { get; set; }
        public DbSet<IHACExpenseAmount> IHACExpenseAmounts { get; set; }
        public DbSet<SecurityProgDept> securityProgDepts { get; set; }


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
                        if (item.Properties.Any(p => p.Metadata.Name == "orgAccountId"))
                        {
                            item.Property("orgAccountId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                        {
                            item.Property("OrgAccountId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgId"))
                        {
                            item.Property("OrgId").CurrentValue = orgid;
                        }
                    }
                }
            }
            AuditInformation.ApplyAuditInformation(this, _appUser);
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
                        if (item.Properties.Any(p => p.Metadata.Name == "orgAccountId"))
                        {
                            item.Property("orgAccountId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                        {
                            item.Property("OrgAccountId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgId"))
                        {
                            item.Property("OrgId").CurrentValue = orgid;
                        }
                    }
                }
            }
            AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChanges();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<IHACCode>()
                .HasOne(a => a.IHACProgram)
                .WithMany()
                .HasForeignKey(a => a.programAccountingCode);

            modelBuilder.Entity<IHACCode>()
                .HasOne(a => a.IHACDepartment)
                .WithMany()
                .HasForeignKey(a => a.departmentAccountingCode);

            modelBuilder.Entity<IHACCode>()
                .HasOne(a => a.IHACAccount)
                .WithMany()
                .HasForeignKey(a => a.ihcAccountCode);

            modelBuilder.Entity<IHACCode>()
               .HasOne(a => a.IHACSubAccount)
               .WithMany()
               .HasForeignKey(a => a.subAccountAccountingCode);

            modelBuilder.Entity<IHACCode>()
               .HasOne(a => a.AccountingCode)
               .WithMany()
               .HasForeignKey(a => a.countyAccountingCode);

            
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<IHACCode>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<IHCAccount>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<IHCDepartment>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<IHCSubAccount>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<IHCProgram>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<IHACExpenseAmount>().HasQueryFilter(e => e.OrgId == orgid);
                        modelBuilder.Entity<SecurityProgDept>().HasQueryFilter(e => e.OrgId == orgid);
                    }
                }

           

        }

    }
}
