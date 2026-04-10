using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using FinexAPI.Models.PurchaseOrder;
using FinexAPI.Models.Voucher;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class IHPOContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public IHPOContext(DbContextOptions<IHPOContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }

        public DbSet<IHPO> IHPO { get; set; }
        public DbSet<IHPODetails> IHPODetails { get; set; }
        public DbSet<IHPOPricing> IHPOPricing { get; set; }
        public DbSet<IHPOLineItem> IHPOLineItem { get; set; }
        public DbSet<IHPOApproval> IHPOApproval { get; set; }
        public DbSet<Vendor> Vendor { get; set; }
        public DbSet<IHPOWorkflowStep> IHPOWorkflowSteps { get; set; }
        public DbSet<Voucher> vouchers { get; set; }
        /*need to merge this into vouchercontext*/
        public DbSet<VoucherIHPO> VoucherIHPO { get; set; }

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
                    }
                }
            }
            AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChanges();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<IHPO>().HasKey(x => x.ID);
            modelBuilder.Entity<IHPODetails>().HasKey(x => x.ID);
            modelBuilder.Entity<IHPOApproval>().HasKey(x => x.ID);
            modelBuilder.Entity<IHPOPricing>().HasKey(x => x.ID);
            modelBuilder.Entity<IHPOLineItem>().HasKey(x => x.ID);


            modelBuilder.Entity<IHPO>()
               .HasOne(x => x.IHPODetails)
               .WithOne(x => x.IHPO)
               .HasForeignKey<IHPODetails>(x => x.reqID);

            modelBuilder.Entity<IHPO>()
               .HasMany(x => x.IHPOApproval)
               .WithOne(x => x.IHPO)
               .HasForeignKey(x => x.reqID);

            modelBuilder.Entity<IHPO>()
               .HasOne(x => x.IHPOPricing)
               .WithOne(x => x.IHPO)
               .HasForeignKey<IHPOPricing>(x => x.reqID);

            modelBuilder.Entity<IHPO>()
                  .HasMany(x => x.IHPOLineItem)
                  .WithOne(x => x.IHPO)
                  .HasForeignKey(x => x.reqID);

            modelBuilder.Entity<IHPODetails>()
               .HasOne(x => x.Vendor)
               .WithMany()
               .HasForeignKey(x => x.reqVendor);
            modelBuilder.Entity<IHPO>()
                .HasOne(x => x.countyPO)
                .WithMany()
                .HasForeignKey(x => x.reqPOid);

            
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<IHPO>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<IHPOPricing>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<IHPOLineItem>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<IHPOApproval>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<Vendor>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<IHPOWorkflowStep>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<Voucher>().HasQueryFilter(e => e.ORG_ID == orgid);

                    }
                }

           
        }
    }
}