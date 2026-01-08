import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- 1. IMPORTAR ESTO
import { TipoProductoService } from '../../services/tipo-producto.service';
import { TipoProducto } from '../../models/tipo-producto.model';

@Component({
  selector: 'app-tipo-producto',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- 2. AGREGAR AQUÍ
  templateUrl: './tipo-producto.component.html',
  styleUrls: ['./tipo-producto.component.scss']
})
export class TipoProductoComponent implements OnInit {
  tiposProducto: TipoProducto[] = [];
  nuevoTipo: TipoProducto = { id: 0, tipo: '' };
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';

  constructor(private service: TipoProductoService) { }

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.cargando = true;
    this.service.obtenerTodos().subscribe({
      next: (datos) => {
        this.tiposProducto = datos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar tipos:', error);
        this.mensaje = 'Error al cargar los tipos de producto';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (!this.nuevoTipo.tipo.trim()) {
      this.mensaje = 'Por favor ingrese el tipo de producto';
      return;
    }

    if (this.editando && this.nuevoTipo.id > 0) {
      this.service.actualizar(this.nuevoTipo).subscribe({
        next: (resultado) => {
          if (resultado) {
            this.mensaje = 'Tipo de producto actualizado correctamente';
            this.cargarTipos();
            this.limpiarFormulario();
          }
        },
        error: (error) => {
          this.mensaje = 'Error al actualizar: ' + error.message;
        }
      });
    } else {
      this.service.crear(this.nuevoTipo).subscribe({
        next: (id) => {
          if (id > 0) {
            this.mensaje = 'Tipo de producto creado correctamente';
            this.cargarTipos();
            this.limpiarFormulario();
          }
        },
        error: (error) => {
          this.mensaje = 'Error al crear: ' + error.message;
        }
      });
    }
  }

  editar(tipo: TipoProducto): void {
    // Usamos spread operator para evitar modificar la tabla en tiempo real antes de guardar
    this.nuevoTipo = { ...tipo };
    this.editando = true;
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este tipo de producto?')) {
      this.service.eliminar(id).subscribe({
        next: (resultado) => {
          if (resultado) {
            this.mensaje = 'Tipo de producto eliminado correctamente';
            this.cargarTipos();
          }
        },
        error: (error) => {
          this.mensaje = 'Error al eliminar: ' + error.message;
        }
      });
    }
  }

  limpiarFormulario(): void {
    this.nuevoTipo = { id: 0, tipo: '' };
    this.editando = false;
    this.mensaje = '';
  }
}