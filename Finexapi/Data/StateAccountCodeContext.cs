using FinexAPI.Models.SAC;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Data
{
    public class StateAccountCodeContext : DbContext
    {

        public StateAccountCodeContext(DbContextOptions<StateAccountCodeContext> options) : base(options)
        {

        }
       

        public DbSet<StateAccountCodeDetails> StateAccountCodeDetails { get; set; }
        
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

        }
    }
}