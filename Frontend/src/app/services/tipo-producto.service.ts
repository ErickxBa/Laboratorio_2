import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TipoProducto } from '../models/tipo-producto.model';

@Injectable({
  providedIn: 'root'
})
export class TipoProductoService {
  // Asegúrate de que el puerto sea el correcto (5000)
  private soapEndpoint = 'http://localhost:5000/Services/TipoProductoService';
  
  // Namespace del Modelo en C# (Revisa que coincida con tu backend, carpeta Models)
  private modelNamespace = 'http://schemas.datacontract.org/2004/07/ProductoSOA.Models';

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<TipoProducto[]> {
    const body = `
      <tip:ObtenerTodos />
    `;

    return this.makeSoapRequest('ObtenerTodos', body).pipe(
      map(xmlDoc => {
        const tipos: TipoProducto[] = [];
        // Buscamos todas las etiquetas 'TipoProducto' independientemente del namespace
        const listaNodos = xmlDoc.getElementsByTagName('TipoProducto');
        
        for (let i = 0; i < listaNodos.length; i++) {
          const nodo = listaNodos[i];
          tipos.push({
            id: this.getNodeValue(nodo, 'Id'),
            tipo: this.getNodeText(nodo, 'Tipo')
          });
        }
        return tipos;
      }),
      catchError(error => {
        console.error('Error al obtener tipos:', error);
        return of([]);
      })
    );
  }

  obtenerPorId(id: number): Observable<TipoProducto | null> {
    const body = `<tip:id>${id}</tip:id>`;

    return this.makeSoapRequest('ObtenerPorId', body).pipe(
      map(xmlDoc => {
        const nodo = xmlDoc.getElementsByTagName('ObtenerPorIdResult')[0];
        if (nodo && nodo.childNodes.length > 0) {
           // A veces el resultado viene directo o dentro de un wrapper, buscamos hijos
           // Si el resultado es nulo, WCF suele enviar tag vacío o nil
           return {
             id: this.getNodeValue(xmlDoc.documentElement, 'Id'), // Buscamos en todo el doc por seguridad
             tipo: this.getNodeText(xmlDoc.documentElement, 'Tipo')
           };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  crear(tipoProducto: TipoProducto): Observable<number> {
    // IMPORTANTE: Definimos el objeto con el namespace 'a' (DataContract)
    const body = `
      <tip:tipoProducto xmlns:a="${this.modelNamespace}" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
        <a:Id>0</a:Id>
        <a:Tipo>${this.escapeXml(tipoProducto.tipo)}</a:Tipo>
      </tip:tipoProducto>
    `;

    return this.makeSoapRequest('Crear', body).pipe(
      map(xmlDoc => {
        const resultado = xmlDoc.getElementsByTagName('CrearResult')[0];
        return resultado ? parseInt(resultado.textContent || '0', 10) : 0;
      }),
      catchError(error => {
        console.error('Error al crear:', error);
        return of(0);
      })
    );
  }

  actualizar(tipoProducto: TipoProducto): Observable<boolean> {
    const body = `
      <tip:tipoProducto xmlns:a="${this.modelNamespace}" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
        <a:Id>${tipoProducto.id}</a:Id>
        <a:Tipo>${this.escapeXml(tipoProducto.tipo)}</a:Tipo>
      </tip:tipoProducto>
    `;

    return this.makeSoapRequest('Actualizar', body).pipe(
      map(xmlDoc => {
        const resultado = xmlDoc.getElementsByTagName('ActualizarResult')[0];
        return resultado ? resultado.textContent === 'true' : false;
      }),
      catchError(error => {
        console.error('Error al actualizar:', error);
        return of(false);
      })
    );
  }

  eliminar(id: number): Observable<boolean> {
    const body = `<tip:id>${id}</tip:id>`;

    return this.makeSoapRequest('Eliminar', body).pipe(
      map(xmlDoc => {
        const resultado = xmlDoc.getElementsByTagName('EliminarResult')[0];
        return resultado ? resultado.textContent === 'true' : false;
      }),
      catchError(error => {
        console.error('Error al eliminar:', error);
        return of(false);
      })
    );
  }

  // --- HELPERS PRIVADOS ---

  private makeSoapRequest(action: string, bodyContent: string): Observable<XMLDocument> {
    const soapEnvelope = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tip="http://tempuri.org/">
        <soap:Body>
          <tip:${action}>
            ${bodyContent}
          </tip:${action}>
        </soap:Body>
      </soap:Envelope>
    `;

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `http://tempuri.org/ITipoProductoService/${action}`
    });

    return this.http.post(this.soapEndpoint, soapEnvelope, { 
      headers, 
      responseType: 'text' 
    }).pipe(
      map(responseString => new DOMParser().parseFromString(responseString, 'text/xml'))
    );
  }

  private getNodeValue(parent: Element | Document, tagName: string): number {
    const elements = parent.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
      // Comparamos localName para ignorar prefijos como "a:Id" o "b:Id"
      if (elements[i].localName === tagName) {
        return parseInt(elements[i].textContent || '0', 10);
      }
    }
    return 0;
  }

  private getNodeText(parent: Element | Document, tagName: string): string {
    const elements = parent.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].localName === tagName) {
        return elements[i].textContent || '';
      }
    }
    return '';
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
      return c;
    });
  }
}