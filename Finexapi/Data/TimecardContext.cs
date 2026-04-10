using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models.Payroll;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace FinexAPI.Data
{
    public class TimecardContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public TimecardContext(DbContextOptions<TimecardContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }
        public DbSet<Employee> Employees { get; set; }

        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<LeaveRequest> LeaveRequest { get; set; }
        public DbSet<TimecardEmployeeDetails> TimecardEmployeeDetails { get; set; }

        public DbSet<TimecardEmployeeSchedule> TimecardEmployeeSchedules { get; set; }
        public DbSet<TimecardEmpSchedule> TimecardEmpSchedules { get; set; }
        public DbSet<TimecardEmployeeScheduleOverride> TimecardEmployeeScheduleOverrides { get; set; }

        public DbSet<HolidayScheduleHeader> HolidayScheduleHeaders { get; set; }
        public DbSet<HolidayScheduleDate> HolidayScheduleDates { get; set; }

        public DbSet<SupervisorSubSchedules> SupervisorSubSchedules { get; set; }
        public DbSet<TimeCardHeaders> TimeCardHeaders { get; set; }
        public DbSet<TimeCards> TimeCards { get; set; }

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
                        else if (item.Properties.Any(p => p.Metadata.Name == "organizationId"))
                        {
                            item.Property("organizationId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgAccId"))
                        {
                            item.Property("OrgAccId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                        {
                            item.Property("OrgAccountId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "ORG_ACCOUNT_ID"))
                        {
                            item.Property("ORG_ACCOUNT_ID").CurrentValue = orgid;
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
                        else if (item.Properties.Any(p => p.Metadata.Name == "organizationId"))
                        {
                            item.Property("organizationId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgAccId"))
                        {
                            item.Property("OrgAccId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                        {
                            item.Property("OrgAccountId").CurrentValue = orgid;
                        }
                        else if (item.Properties.Any(p => p.Metadata.Name == "ORG_ACCOUNT_ID"))
                        {
                            item.Property("ORG_ACCOUNT_ID").CurrentValue = orgid;
                        }
                    }
                }
            }
            AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChanges();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TimeCardHeaders>()
                .HasMany(x => x.TimeCards)
                .WithOne(h => h.TimeCardHeaders)
                .HasForeignKey(a => a.timeCardHeaderID);

            modelBuilder.Entity<SupervisorSubSchedules>()
            .HasKey(t => t.SupervisorSubScheduleId);
            modelBuilder.Entity<TimecardEmployeeSchedule>()
                .HasKey(x => x.id);

            modelBuilder.Entity<SupervisorSubSchedules>()
                .HasOne(a => a.supervisor)
                .WithMany()
                .HasForeignKey(a => a.supId);
            modelBuilder.Entity<SupervisorSubSchedules>()
                .HasOne(a => a.subSupervisor)
                .WithMany()
                .HasForeignKey(a => a.supSubId);
            modelBuilder.Entity<LeaveRequest>()
                .HasOne(a => a.employee)
                .WithMany()
                .HasForeignKey(a => a.empId);
            modelBuilder.Entity<TimecardEmployeeDetails>()
               .HasOne(a => a.Employee)
               .WithMany()
               .HasForeignKey(a => a.empId);
            modelBuilder.Entity<TimecardEmployeeScheduleOverride>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.employeeId);

            modelBuilder.Entity<LeaveRequest>()
                .HasOne(x => x.leaveType)
                .WithMany()
                .HasForeignKey(x => x.leaveTypeID);
            modelBuilder.Entity<TimeCards>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.empID);

            modelBuilder.Entity<LeaveRequest>()
              .HasOne(a => a.FMLAType)
              .WithMany()
              .HasForeignKey(a => a.FMLAID).IsRequired(false);

            modelBuilder.Entity<TimeCards>()
              .HasOne(a => a.FMLAType)
              .WithMany()
              .HasForeignKey(a => a.FMLAID).IsRequired(false);

            
                if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
                {
                    var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
                    if (orgid != 0)
                    {
                        modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<Employee>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<LeaveType>().HasQueryFilter(e => e.organizationId == orgid);
                        modelBuilder.Entity<LeaveRequest>().HasQueryFilter(e => e.OrgAccId == orgid);
                        modelBuilder.Entity<TimecardEmployeeDetails>().HasQueryFilter(e => e.OrgAccId == orgid);
                        modelBuilder.Entity<TimecardEmployeeSchedule>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<TimecardEmployeeScheduleOverride>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<HolidayScheduleHeader>().HasQueryFilter(e => e.organizationId == orgid);
                        modelBuilder.Entity<HolidayScheduleDate>().HasQueryFilter(e => e.ORG_ID == orgid);
                        modelBuilder.Entity<SupervisorSubSchedules>().HasQueryFilter(e => e.OrgAccountId == orgid);
                        modelBuilder.Entity<TimeCardHeaders>().HasQueryFilter(e => e.OrgAccId == orgid);
                        modelBuilder.Entity<TimeCards>().HasQueryFilter(e => e.ORG_ACCOUNT_ID == orgid);
                    }
                }

            

        }
    }


}
