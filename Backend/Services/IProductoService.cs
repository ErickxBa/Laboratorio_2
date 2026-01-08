using CoreWCF;
using ProductoSOA.Models;

namespace ProductoSOA.Services
{
    [ServiceContract(Namespace = "http://tempuri.org/")]
    public interface IProductoService
    {
        [OperationContract]
        Task<ProductoResponse> ObtenerTodos();

        [OperationContract]
        Task<Producto?> ObtenerPorId(int id);

        [OperationContract]
        Task<int> Crear(Producto producto);

        [OperationContract]
        Task<bool> Actualizar(Producto producto);

        [OperationContract]
        Task<bool> Eliminar(int id);
    }
}
