import { TipoProducto } from './tipo-producto.model';

export interface Producto {
  id: number;
  idTipo: number;
  descripcion: string;
  valor: number;
  costo: number;
  tipoProducto?: TipoProducto;
}
