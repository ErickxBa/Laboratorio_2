import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- 1. IMPORTANTE: Importar FormsModule
import { ProductoService } from '../../services/producto.service';
import { TipoProductoService } from '../../services/tipo-producto.service';
import { Producto } from '../../models/producto.model';
import { TipoProducto } from '../../models/tipo-producto.model';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- 2. IMPORTANTE: Agregar FormsModule aquí
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];
  tiposProducto: TipoProducto[] = [];
  
  // Inicializamos el objeto vacío
  nuevoProducto: Producto = { id: 0, idTipo: 0, descripcion: '', valor: 0, costo: 0 };
  
  editando = false;
  productoEditando: Producto | null = null;
  mensaje: string = '';
  cargando = false;

  constructor(
    private productoService: ProductoService,
    private tipoProductoService: TipoProductoService
  ) { }

  ngOnInit(): void {
    this.cargarTiposProducto();
    this.cargarProductos();
  }

  cargarTiposProducto(): void {
    this.tipoProductoService.obtenerTodos().subscribe({
      next: (datos) => {
        this.tiposProducto = datos;
      },
      error: (error) => {
        console.error('Error al cargar tipos:', error);
        this.mensaje = 'Error al cargar los tipos de producto';
      }
    });
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.obtenerTodos().subscribe({
      next: (datos) => {
        this.productos = datos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.mensaje = 'Error al cargar los productos';
        this.cargando = false;
      }
    });
  }

  obtenerNombreTipo(idTipo: number): string {
    const tipo = this.tiposProducto.find(t => t.id === idTipo);
    return tipo ? tipo.tipo : 'Desconocido';
  }

  // NOTA: Se eliminaron las funciones 'actualizarTipo', 'actualizarDescripcion', etc.
  // porque [(ngModel)] en el HTML ya hace este trabajo automáticamente.

  guardar(): void {
    // Validaciones
    if (!this.nuevoProducto.descripcion.trim()) {
      this.mensaje = 'Por favor ingrese la descripción del producto';
      return;
    }

    if (this.nuevoProducto.idTipo === 0) {
      this.mensaje = 'Por favor seleccione un tipo de producto';
      return;
    }

    if (this.nuevoProducto.valor <= 0) {
      this.mensaje = 'El valor debe ser mayor a 0';
      return;
    }

    if (this.nuevoProducto.costo < 0) {
      this.mensaje = 'El costo no puede ser negativo';
      return;
    }

    // Lógica de Guardar o Actualizar
    if (this.editando && this.nuevoProducto.id > 0) {
      this.productoService.actualizar(this.nuevoProducto).subscribe({
        next: (resultado) => {
          if (resultado) {
            this.mensaje = 'Producto actualizado correctamente';
            this.cargarProductos();
            this.limpiarFormulario();
          }
        },
        error: (error) => {
          this.mensaje = 'Error al actualizar: ' + error.message;
        }
      });
    } else {
      this.productoService.crear(this.nuevoProducto).subscribe({
        next: (id) => {
          if (id > 0) {
            this.mensaje = 'Producto creado correctamente';
            this.cargarProductos();
            this.limpiarFormulario();
          }
        },
        error: (error) => {
          this.mensaje = 'Error al crear: ' + error.message;
        }
      });
    }
  }

  editar(producto: Producto): void {
    this.editando = true;
    this.productoEditando = { ...producto };
    // Usamos spread operator (...) para romper la referencia y no editar la tabla directamente
    this.nuevoProducto = { ...producto };
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.productoService.eliminar(id).subscribe({
        next: (resultado) => {
          if (resultado) {
            this.mensaje = 'Producto eliminado correctamente';
            this.cargarProductos();
          }
        },
        error: (error) => {
          this.mensaje = 'Error al eliminar: ' + error.message;
        }
      });
    }
  }

  limpiarFormulario(): void {
    this.nuevoProducto = { id: 0, idTipo: 0, descripcion: '', valor: 0, costo: 0 };
    this.editando = false;
    this.productoEditando = null;
    this.mensaje = '';
  }
}