using ProductoSOA.Data;
using ProductoSOA.Models;
using Microsoft.EntityFrameworkCore;
using CoreWCF;

namespace ProductoSOA.Services
{
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class TipoProductoService : ITipoProductoService
    {
        private readonly ApplicationDbContext _context;

        public TipoProductoService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TipoProductoResponse> ObtenerTodos()
        {
            var items = await _context.TiposProducto.ToListAsync();
            return new TipoProductoResponse { Items = items };
        }

        public async Task<TipoProducto?> ObtenerPorId(int id)
        {
            return await _context.TiposProducto.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<int> Crear(TipoProducto tipoProducto)
        {
            _context.TiposProducto.Add(tipoProducto);
            await _context.SaveChangesAsync();
            return tipoProducto.Id;
        }

        public async Task<bool> Actualizar(TipoProducto tipoProducto)
        {
            var existente = await _context.TiposProducto.FirstOrDefaultAsync(t => t.Id == tipoProducto.Id);
            if (existente == null)
                return false;

            existente.Tipo = tipoProducto.Tipo;
            _context.TiposProducto.Update(existente);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Eliminar(int id)
        {
            var tipoProducto = await _context.TiposProducto.FirstOrDefaultAsync(t => t.Id == id);
            if (tipoProducto == null)
                return false;

            _context.TiposProducto.Remove(tipoProducto);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
