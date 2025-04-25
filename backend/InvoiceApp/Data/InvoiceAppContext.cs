using InvoiceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoiceApp.Data
{
    public class InvoiceAppContext : DbContext
    {
        public InvoiceAppContext(DbContextOptions<InvoiceAppContext> options) : base(options)
        {

        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Invoice>()
                .HasMany(i => i.Items)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
