using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace FinexAPI.Data
{
    public class PayrollDefaultsContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public PayrollDefaultsContext(DbContextOptions<PayrollDefaultsContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }

        public DbSet<Union> Unions { get; set; }
        public DbSet<Benefits> Benefits { set; get; }
        public DbSet<PayrollDefaultVacationrates> PayrollDefaultVacationrates { set; get; }
        public DbSet<PayrollDefaultValues> PayrollDefaultValues { set; get; }
        public DbSet<UnionPayrolldefaultsVacationRates> UnionPayrolldefaultsVacationRates { set; get; }
        public DbSet<BenefitPackageBenefitLink> BenefitPackageBenefitLinks { set; get; }
        public DbSet<BenefitPackage> BenefitPackages { set; get; }
        public DbSet<JobCodes> JobCodes { set; get; }
        public DbSet<PayrollJobDescription> PayrollJobDescriptions { set; get; }
        public DbSet<PayrollJobClassification> PayrollJobClassifications { set; get; }

        public DbSet<PayCodes> PayCodes { set; get; }
        public DbSet<PayrollRanges> PayrollRanges { set; get; }

        public DbSet<PayrollEmpYear> PayrollEmpYears { set; get; }

        public DbSet<BenefitType> BenefitTypes { set; get; }

        //public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        //{
        //    AuditInformation.ApplyAuditInformation(this, _appUser);
        //    return base.SaveChangesAsync(cancellationToken);
        //}
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Benefits>()
                .HasOne(a => a.BenefitType)
                .WithMany()
                .HasForeignKey(a => a.benefitsType);
            modelBuilder.Entity<JobCodes>()
                .HasOne(j => j.PayrollJobDescription)
                .WithMany()
                .HasForeignKey(j => j.jobId);

            
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<Union>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<Benefits>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<PayrollDefaultValues>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<UnionPayrolldefaultsVacationRates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<BenefitPackageBenefitLink>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<BenefitPackage>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<JobCodes>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<PayrollJobDescription>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<PayrollJobClassification>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<PayCodes>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<PayrollRanges>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<PayrollEmpYear>().HasQueryFilter(e => e.ORG_ID == orgid);

                    }
                }

           
        }

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
                        if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                        {
                            item.Property("OrgAccountId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
                        {
                            item.Property("ORG_ID").CurrentValue = orgid;
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
                        if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                        {
                            item.Property("OrgAccountId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
                        {
                            item.Property("ORG_ID").CurrentValue = orgid;
                        }
                    }
                }
            }
            AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChanges();
        }

    }
}
