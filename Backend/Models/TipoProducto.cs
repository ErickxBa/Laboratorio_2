using System.Runtime.Serialization;

namespace ProductoSOA.Models
{
    [DataContract]
    public class TipoProducto
    {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public string Tipo { get; set; }
    }
}