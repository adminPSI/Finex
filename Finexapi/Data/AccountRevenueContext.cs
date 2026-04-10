using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.AccountRevenue;
using FinexAPI.Models.AccountRevenue;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using FinexAPI.Models.PurchaseOrder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace FinexAPI.Data
{
    public class AccountRevenueContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;

        public AccountRevenueContext(DbContextOptions<AccountRevenueContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }
        public DbSet<CountyRevenue> CountyRevenue { get; set; }
        public DbSet<CountyRevenueBD> CountyRevenueBD { get; set; }


        public DbSet<CountyRevenueContrib> CountyRevenueContrib { get; set; }

        public DbSet<CountyRevenueDetails> CountyRevenueDetails { get; set; }

        public DbSet<AccountReceivables> AccountReceivables { get; set; }
        public DbSet<AccountReceivableDesc> AccountReceivableDesc { get; set; }

        public DbSet<RevenueReceivableApproval> RevenueReceivableApproval { get; set; }

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
            modelBuilder.Entity<AccountReceivables>()
                .HasOne(x => x.CountyRevenueContrib)
                .WithMany()
                .HasForeignKey(x => x.vendorID);

            modelBuilder.Entity<AccountReceivableDesc>()
               .HasOne(x => x.CountyRevenueContrib)
               .WithOne()
               .HasForeignKey<AccountReceivableDesc>(x => x.customerID);

            modelBuilder.Entity<CountyRevenue>()
               .HasOne(x => x.CountyRevenueContrib)
               .WithMany()
               .HasForeignKey(x => x.rev_From);

            modelBuilder.Entity<CountyRevenueDetails>()
             .HasOne(x => x.CountyRevenue)
             .WithOne(x => x.CountyRevenueDetails)
             .HasForeignKey<CountyRevenueDetails>(x => x.countyRevenueId);

            modelBuilder.Entity<CountyRevenue>()
              .HasMany(x => x.CountyRevenueBD)
              .WithOne(x => x.CountyRevenue)
               .HasForeignKey(x => x.rev_ID);

            modelBuilder.Entity<AccountReceivables>()
             .HasMany(x => x.AccountReceivableDescs)
             .WithOne(x => x.AccountReceivable)
              .HasForeignKey(x => x.arID);

            modelBuilder.Entity<CountyRevenueBD>()
              .HasOne(x => x.CountyRevenueCode)
              .WithOne()
               .HasForeignKey<CountyRevenueBD>(x => x.rev_BD_CAC);

            modelBuilder.Entity<CountyRevenue>()
             .HasOne(x => x.RevenueReceivableApproval)
             .WithOne(x => x.CountyRevenue)
              .HasForeignKey<RevenueReceivableApproval>(x => x.refId);
            modelBuilder.Entity<AccountReceivables>()
            .HasOne(x => x.RevenueReceivableApproval)
            .WithOne(x => x.AccountReceivable)
             .HasForeignKey<RevenueReceivableApproval>(x => x.refId);

            modelBuilder.Entity<CountyRevenueBD>()
                .HasOne(x => x.AccountReceivables)
                .WithMany()
                .HasForeignKey(x => x.invoiceId);
            modelBuilder.Entity<CountyRevenue>()
                .HasOne(x => x.CodeValues).WithMany().HasForeignKey(x => x.status);

           
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<CountyRevenue>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<AccountReceivables>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<RevenueReceivableApproval>().HasQueryFilter(e => e.OrgId == orgid);

                    }
                }

            
        }
    }
}
