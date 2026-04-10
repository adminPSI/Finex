using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.Payroll;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class PayrollContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public PayrollContext(DbContextOptions<PayrollContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Attendance> Attendances { set; get; }
        public DbSet<PayrollTotals> PayrollTotals { set; get; }
        public DbSet<PayrollTotalBenefitDistribution> payrollTotalBenefitDistributions { set; get; }
        public DbSet<PayrollTotalDistribution> payrollTotalDistributions { set; get; }

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
                        if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
                        {
                            item.Property("ORG_ID").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "orgAccountId"))
                        {
                            item.Property("orgAccountId").CurrentValue = orgid;
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
                        if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
                        {
                            item.Property("ORG_ID").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "orgAccountId"))
                        {
                            item.Property("orgAccountId").CurrentValue = orgid;
                        }
                    }
                }
            }
            AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChanges();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PayrollTotals>()
              .HasOne(a => a.employee)
              .WithMany()
              .HasForeignKey(a => a.empId).IsRequired(false);
            /*modelBuilder.Entity<PayrollTotalBenefitDistribution>()
                .HasOne(b => b.benefits)
                .WithMany()
                .HasForeignKey(b => b.benefitId);*/

            
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<Employee>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<Attendance>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<PayrollTotals>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<PayrollTotalBenefitDistribution>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<PayrollTotalDistribution>().HasQueryFilter(e => e.orgAccountId == orgid);
                       
                    }
                }

            

        }
    }
}
