using Microsoft.EntityFrameworkCore;
using ProductoSOA.Models;

namespace ProductoSOA.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<TipoProducto> TiposProducto { get; set; }
        public DbSet<Producto> Productos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de TipoProducto
            modelBuilder.Entity<TipoProducto>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Tipo).IsRequired().HasMaxLength(100);
            });

            // Configuración de Producto
            modelBuilder.Entity<Producto>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Descripcion).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Valor).HasPrecision(18, 2);
                entity.Property(e => e.Costo).HasPrecision(18, 2);

                // Relación con TipoProducto
                entity.HasOne(e => e.TipoProducto)
                    .WithMany()
                    .HasForeignKey(e => e.IdTipo)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Datos iniciales
            modelBuilder.Entity<TipoProducto>().HasData(
                new TipoProducto { Id = 1, Tipo = "Electrónica" },
                new TipoProducto { Id = 2, Tipo = "Ropa" },
                new TipoProducto { Id = 3, Tipo = "Alimentos" }
            );
        }
    }
}
