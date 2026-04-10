using FinexAPI.Models;
using FinexAPI.Models.PurchaseOrder;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class CommonContext : DbContext
    {
        public CommonContext(DbContextOptions<CommonContext> options) : base(options)
        {
        }

        public DbSet<CodeValues> CodeValues { get; set; }
        public DbSet<CodeTypes> CodeTypes { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<CodeTypes>().HasKey(x => x.Id);
            modelBuilder.Entity<CodeValues>().HasKey(x => x.Id);


            modelBuilder.Entity<CodeValues>()
                .HasOne(x => x.CodeTypes)
                .WithMany()
                .HasForeignKey(x => x.CODE_TYPE_ID);//.OnDelete(DeleteBehavior.Cascade);

        }
    }
}
