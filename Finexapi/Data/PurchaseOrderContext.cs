using FinexAPI.Models.Voucher;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models.PurchaseOrder;
using FinexAPI.Models.SAC;
using Microsoft.EntityFrameworkCore;
using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;

namespace FinexAPI.Data
{
    public class PurchaseOrderContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public PurchaseOrderContext(DbContextOptions<PurchaseOrderContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }

        public DbSet<CountyPO> CountyPO { get; set; }
        public DbSet<CountyPOLineItem> CountyPOLineItem { get; set; }
        public DbSet<CountyPODetails> CountyPODetails { get; set; }
        public DbSet<CountyPOPricing> CountyPOPricing { get; set; }
        public DbSet<POAttention> POAttention { get; set; }
        public DbSet<POLiquidate> POLiquidate { get; set; }
        public DbSet<PODirectInq> PODirectInq { get; set; }
        public DbSet<PODeputy> PODeputy { get; set; }
        public DbSet<IHPOLineItem> IHPOLineItem { get; set; }
        public DbSet<PODeliverTo> PODeliverTo { get; set; }
        public DbSet<VoucherBreakDown> VoucherBreakDowns { get; set; }
        public DbSet<VoucherInvoiceLineItem> VoucherInvoiceLineItems { get; set; }
        public DbSet<Voucher> vouchers { get; set; }
        public DbSet<VoucherBatch> VoucherBatchs { get; set; }
        public DbSet<VoucherBatchLink> voucherBatchLink { get; set; }

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
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgId"))
                        {
                            item.Property("OrgId").CurrentValue = orgid;
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

            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<CountyPO>().HasKey(x => x.Id);
            modelBuilder.Entity<CountyPODetails>().HasKey(x => x.Id);
            modelBuilder.Entity<CountyPOPricing>().HasKey(x => x.Id);

            modelBuilder.Entity<CountyPO>()
                .HasOne(x => x.CountyPODetails)
                .WithOne(x => x.CountyPO)
                .HasForeignKey<CountyPODetails>(x => x.poId);//.OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CountyPO>()
                .HasOne(x => x.CountyPOPricing)
                .WithOne(x => x.CountyPO)
                .HasForeignKey<CountyPOPricing>(x => x.poId);//.OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CountyPO>()
                .HasMany(x => x.CountyPOLineItem)
                .WithOne(x => x.CountyPO)
                .HasForeignKey(x => x.countyPOId);//.OnDelete(DeleteBehavior.Cascade);

            // 1 pO has many liquidate
            modelBuilder.Entity<POLiquidate>()
                .HasOne(x => x.CountyPO)
                .WithMany()
                .HasForeignKey(x => x.countyPOId);

            modelBuilder.Entity<CountyPODetails>()
               .HasOne(x => x.Vendor)
               .WithMany()
               .HasForeignKey(x => x.poVendorNo);


            modelBuilder.Entity<Voucher>()
               .HasOne(a => a.vendor)
               .WithMany()
               .HasForeignKey(a => a.vendorNo);
            modelBuilder.Entity<CountyPODetails>()
                .HasOne(x => x.AccountingCode)
                .WithMany()
                .HasForeignKey(x => x.pocacid);
            modelBuilder.Entity<Voucher>()
                .HasOne(x => x.CountyPO)
                .WithMany()
                .HasForeignKey(x => x.poId);
            modelBuilder.Entity<Voucher>()
                .HasOne(x => x.accountingCode)
                .WithMany()
                .HasForeignKey(x => x.poCACId);

                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<CountyPO>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<IHPOLineItem>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<VoucherBreakDown>().HasQueryFilter(e => e.OrgId == orgid);
                        modelBuilder.Entity<VoucherInvoiceLineItem>().HasQueryFilter(e => e.OrgId == orgid);
                        modelBuilder.Entity<Voucher>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<VoucherBatch>().HasQueryFilter(e => e.orgAccountId == orgid);
                        modelBuilder.Entity<VoucherBatchLink>().HasQueryFilter(e => e.orgAccountId == orgid);
                       
                    }
                }


        }
    }
}


