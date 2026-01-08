using System.Runtime.Serialization;

namespace ProductoSOA.Models
{
    [DataContract]
    public class TipoProductoResponse
    {
        [DataMember]
        public List<TipoProducto> Items { get; set; } = new List<TipoProducto>();
    }
}