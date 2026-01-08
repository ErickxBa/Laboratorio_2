using ProductoSOA.Data;
using ProductoSOA.Models;
using Microsoft.EntityFrameworkCore;
using CoreWCF;

namespace ProductoSOA.Services
{
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class ProductoService : IProductoService
    {
        private readonly ApplicationDbContext _context;

        public ProductoService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProductoResponse> ObtenerTodos()
        {
            var items = await _context.Productos
                .Include(p => p.TipoProducto)
                .ToListAsync();
            return new ProductoResponse { Items = items };
        }

        public async Task<Producto?> ObtenerPorId(int id)
        {
            return await _context.Productos
                .Include(p => p.TipoProducto)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<int> Crear(Producto producto)
        {
            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();
            return producto.Id;
        }

        public async Task<bool> Actualizar(Producto producto)
        {
            var existente = await _context.Productos.FirstOrDefaultAsync(p => p.Id == producto.Id);
            if (existente == null)
                return false;

            existente.IdTipo = producto.IdTipo;
            existente.Descripcion = producto.Descripcion;
            existente.Valor = producto.Valor;
            existente.Costo = producto.Costo;

            _context.Productos.Update(existente);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Eliminar(int id)
        {
            var producto = await _context.Productos.FirstOrDefaultAsync(p => p.Id == id);
            if (producto == null)
                return false;

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
