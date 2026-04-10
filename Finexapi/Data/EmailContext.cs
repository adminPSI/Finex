using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models.Email;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class EmailContext : DbContext
    {
        private readonly IAppUser _appUser;
        private readonly IHttpContextAccessor _context;
        public EmailContext(DbContextOptions<EmailContext> options, IAppUser appUser, IHttpContextAccessor context) : base(options)
        {
            _appUser = appUser;
            _context = context;
        }
        public DbSet<Message> messages { get; set; }
        public DbSet<MessageAttachment> messageAttachments { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Message>().HasKey(x => x.MessageID);
            modelBuilder.Entity<MessageAttachment>().HasKey(x => x.Id);


            modelBuilder.Entity<MessageAttachment>()
                .HasOne(x => x.Message)
                .WithMany()
                .HasForeignKey(x => x.MessageID);

        }

        //public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        //{
        //    var addEditEntities = ChangeTracker.Entries().Where(e => e.State == EntityState.Added).ToList();
        //    if (_context != null && _context.HttpContext != null)
        //    {
        //        var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
        //        foreach (var item in addEditEntities)
        //        {
        //            if (orgid > 0)
        //            {
        //                if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
        //                {
        //                    item.Property("OrgAccountId").CurrentValue = orgid;
        //                }
        //                else if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
        //                {
        //                    item.Property("ORG_ID").CurrentValue = orgid;
        //                }
        //            }
        //        }
        //    }
        //    AuditInformation.ApplyAuditInformation(this, _appUser);
        //    return base.SaveChangesAsync(cancellationToken);
        //}

        //public override int SaveChanges()
        //{
        //    var addEditEntities = ChangeTracker.Entries().Where(e => e.State == EntityState.Added).ToList();
        //    if (_context != null && _context.HttpContext != null)
        //    {
        //        var orgid = (int)_context.HttpContext.Items["OrgAccountId"]!;
        //        foreach (var item in addEditEntities)
        //        {
        //            if (orgid > 0)
        //            {
        //                if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
        //                {
        //                    item.Property("OrgAccountId").CurrentValue = orgid;
        //                }
        //                else if (item.Properties.Any(p => p.Metadata.Name == "ORG_ID"))
        //                {
        //                    item.Property("ORG_ID").CurrentValue = orgid;
        //                }
        //            }
        //        }
        //    }
        //    AuditInformation.ApplyAuditInformation(this, _appUser);
        //    return base.SaveChanges();
        //}

    }
}
