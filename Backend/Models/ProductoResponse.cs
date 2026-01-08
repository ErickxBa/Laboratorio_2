using System.Runtime.Serialization;

namespace ProductoSOA.Models
{
    [DataContract]
    public class ProductoResponse
    {
        [DataMember]
        public List<Producto> Items { get; set; } = new List<Producto>();
    }
}