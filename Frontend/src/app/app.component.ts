import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoProductoComponent } from './components/tipo-producto/tipo-producto.component';
import { ProductoComponent } from './components/producto/producto.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TipoProductoComponent, ProductoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  componenteActivo: 'tipos' | 'productos' = 'tipos';

  cambiarComponente(componente: 'tipos' | 'productos'): void {
    this.componenteActivo = componente;
  }
}
