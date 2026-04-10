using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class PayrollEmployeeContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public PayrollEmployeeContext(DbContextOptions<PayrollEmployeeContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }
        public DbSet<County> Counties { set; get; }
        public DbSet<Salaries> Salaries { set; get; }
        public DbSet<SignificantRates> SignificantRates { set; get; }
        public DbSet<SignificantDates> SignificantDates { set; get; }
        public DbSet<PreYearStartingBalance> PreYearStartingBalances { set; get; }
        public DbSet<PayrollDistribution> PayrollDistributions { set; get; }
        public DbSet<EmployeeDepartment> EmployeeDepartments { set; get; }
        //public DbSet<EmployeeJobInfo> EmployeeJobInfos { set; get; }
        public DbSet<EmployeePayrollBenefit> EmployeePayrollBenefits { set; get; }
        public DbSet<EmployeePayrollSetup> EmployeePayrollSetups { set; get; }
        public DbSet<EEOJobDescription> EEOJobDescriptions { set; get; }
        public DbSet<Union> Unions { set; get; }
        public DbSet<BenefitIHACDistribution> benefitIHACDistributions { set; get; }

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
                        else if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
                        {
                            item.Property("ORG_ID").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                        {
                            item.Property("OrgAccountId").CurrentValue = orgid;
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
                        else if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
                        {
                            item.Property("ORG_ID").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                        {
                            item.Property("OrgAccountId").CurrentValue = orgid;
                        }
                    }
                }
            }
            AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChanges();
        }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //modelBuilder.Entity<EmployeeJobInfo>()
            //    .HasOne(a => a.JobDescription)
            //    .WithMany()
            //    .HasForeignKey(a => a.jobDescripId);

            modelBuilder.Entity<Salaries>()
                .HasOne(a => a.JobDescription)
                .WithMany()
                .HasForeignKey(a => a.jobDescId);

            modelBuilder.Entity<EmployeePayrollBenefit>()
                .HasOne(b => b.benefit)
                .WithMany()
                .HasForeignKey(b => b.benefitId);
            modelBuilder.Entity<EmployeePayrollSetup>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(x => x.empId);
            modelBuilder.Entity<EmployeePayrollBenefit>()
                .HasOne(x => x.benefitIHACDistribution)
                .WithOne(x => x.EmployeePayrollBenefit)
                .HasForeignKey<BenefitIHACDistribution>(x => x.benId);

           
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<County>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<Salaries>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<SignificantRates>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<SignificantDates>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<PreYearStartingBalance>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<PayrollDistribution>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<EmployeePayrollBenefit>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<EmployeePayrollSetup>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<EEOJobDescription>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<Union>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<BenefitIHACDistribution>().HasQueryFilter(e => e.orgAccountId == orgid);

                    }
                }

            


        }
    }
}
