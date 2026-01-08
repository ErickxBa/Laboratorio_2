using System.Runtime.Serialization; // <--- NECESARIO

namespace ProductoSOA.Models
{
    [DataContract] // <--- NECESARIO
    public class Producto
    {
        [DataMember] // <--- NECESARIO EN CADA PROPIEDAD
        public int Id { get; set; }

        [DataMember]
        public int IdTipo { get; set; }

        [DataMember]
        public string Descripcion { get; set; }

        [DataMember]
        public decimal Valor { get; set; }

        [DataMember]
        public decimal Costo { get; set; }
        
        // La propiedad de navegación NO lleva DataMember para evitar ciclos infinitos
        public TipoProducto? TipoProducto { get; set; } 
    }
}