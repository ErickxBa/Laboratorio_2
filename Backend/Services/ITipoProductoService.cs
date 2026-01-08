using CoreWCF;
using ProductoSOA.Models;

namespace ProductoSOA.Services
{
    [ServiceContract(Namespace = "http://tempuri.org/")]
    public interface ITipoProductoService
    {
        [OperationContract]
        Task<TipoProductoResponse> ObtenerTodos();

        [OperationContract]
        Task<TipoProducto?> ObtenerPorId(int id);

        [OperationContract]
        Task<int> Crear(TipoProducto tipoProducto);

        [OperationContract]
        Task<bool> Actualizar(TipoProducto tipoProducto);

        [OperationContract]
        Task<bool> Eliminar(int id);
    }
}
