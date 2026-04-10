using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class FundContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public FundContext(DbContextOptions<FundContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }

        public DbSet<Fund> Funds { get; set; }
        public DbSet<CashBalance> CashBalances { get; set; }
        public DbSet<AccountingCode> AccountingCodes { get; set; }
        public DbSet<BudgetAmount> BudgetAmounts { get; set; }
        public DbSet<Settings> Settings { get; set; }
        public DbSet<SettingsValue> SettingsValue { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<PreYearBalance> PreYearBalances { set; get; }
        public DbSet<PreYearBalanceRevenue> PreYearBalanceRevenues { set; get; }

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
                        if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
                        {
                            item.Property("ORG_ID").CurrentValue = orgid;
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
            modelBuilder.Entity<AccountingCode>()
                .HasOne(a => a.Fund)
                .WithMany()
                .HasForeignKey(a => a.FundId);
            modelBuilder.Entity<PreYearBalance>()
                .HasOne(p => p.AccountingCode)
                .WithMany()
                .HasForeignKey(p => p.balCACID);
            modelBuilder.Entity<PreYearBalanceRevenue>()
                .HasOne(p => p.accountingCode)
                .WithMany()
                .HasForeignKey(p => p.cACID);

            
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<Fund>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<CashBalance>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<AccountingCode>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<SettingsValue>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<Category>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<PreYearBalance>().HasQueryFilter(e => e.OrgId == orgid);
                       
                    }
                }

           


        }
    }

}
