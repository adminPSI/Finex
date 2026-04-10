using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class ProjectContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public ProjectContext(DbContextOptions<ProjectContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectEquipment> ProjectEquipments { get; set; }
        public DbSet<ProjectEquipmentSetup> ProjectEquipmentSetups { get; set; }
        public DbSet<ProjectLabor> ProjectLabors { get; set; }
        public DbSet<ProjectLocations> ProjectLocations { get; set; }
        public DbSet<ProjectMaterial> ProjectMaterials { get; set; }
        public DbSet<ProjectWorkTypes> ProjectWorkTypes { get; set; }


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
            modelBuilder.Entity<ProjectEquipment>()
                .HasOne(a => a.equipmentSetup)
                .WithMany()
                .HasForeignKey(a => a.equipmentId);

            modelBuilder.Entity<ProjectEquipment>()
                .HasOne(a => a.workType)
                .WithMany()
                .HasForeignKey(a => a.workTypeId);

            modelBuilder.Entity<ProjectLabor>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.empId);

            modelBuilder.Entity<ProjectLabor>()
                .HasOne(a => a.WorkType)
                .WithMany()
                .HasForeignKey(a => a.workTypeId);

            modelBuilder.Entity<ProjectMaterial>()
                .HasOne(a => a.Vendor)
                .WithMany()
                .HasForeignKey(a => a.vendorId);

            modelBuilder.Entity<ProjectMaterial>()
                .HasOne(a => a.WorkType)
                .WithMany()
                .HasForeignKey(a => a.workTypeId);

            
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<Project>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<ProjectEquipment>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<ProjectEquipmentSetup>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<ProjectLabor>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<ProjectLocations>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<ProjectMaterial>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<ProjectWorkTypes>().HasQueryFilter(e => e.ORG_ID == orgid);
                       
                    }
                }

          

        }
    }
}
