import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // URL definida en tu Program.cs para HTTP puerto 5000
  private url = 'http://localhost:5000/Services/ProductoService';

  constructor(private http: HttpClient) { }

  // --- MÉTODOS PÚBLICOS ---

  obtenerTodos(): Observable<Producto[]> {
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
          <ObtenerTodos xmlns="http://tempuri.org/" />
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/IProductoService/ObtenerTodos').pipe(
      map(xmlDoc => {
        const productos: Producto[] = [];
        // CoreWCF suele devolver los items dentro de una estructura compleja
        // Buscamos cualquier etiqueta que se llame 'Producto' o 'ProductoSOA.Models:Producto'
        const listaNodos = xmlDoc.getElementsByTagNameNS('*', 'Producto'); 
        
        // Si no encuentra por namespace, intenta búsqueda general (fallback)
        const nodosFinales = listaNodos.length > 0 ? listaNodos : xmlDoc.getElementsByTagName('Producto');

        for (let i = 0; i < nodosFinales.length; i++) {
          const nodo = nodosFinales[i];
          productos.push({
            id: this.getNodeValue(nodo, 'Id'),
            idTipo: this.getNodeValue(nodo, 'IdTipo'),
            descripcion: this.getNodeText(nodo, 'Descripcion'),
            valor: this.getNodeValue(nodo, 'Valor'),
            costo: this.getNodeValue(nodo, 'Costo')
          });
        }
        return productos;
      }),
      catchError(err => {
        console.error('Error SOAP ObtenerTodos:', err);
        return of([]);
      })
    );
  }

  crear(producto: Producto): Observable<number> {
    // NOTA: El orden alfabético de las propiedades dentro de <producto> es importante en WCF
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
          <Crear xmlns="http://tempuri.org/">
            <producto xmlns:a="http://schemas.datacontract.org/2004/07/ProductoSOA.Models" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
              <a:Costo>${producto.costo}</a:Costo>
              <a:Descripcion>${producto.descripcion}</a:Descripcion>
              <a:Id>0</a:Id>
              <a:IdTipo>${producto.idTipo}</a:IdTipo>
              <a:Valor>${producto.valor}</a:Valor>
            </producto>
          </Crear>
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/IProductoService/Crear').pipe(
      map(xmlDoc => {
        // Buscamos la respuesta ignorando el namespace del tag (CrearResult)
        const resultado = this.findNodeByLocalName(xmlDoc, 'CrearResult');
        return resultado ? parseInt(resultado.textContent || '0', 10) : 0;
      })
    );
  }

  actualizar(producto: Producto): Observable<boolean> {
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
          <Actualizar xmlns="http://tempuri.org/">
            <producto xmlns:a="http://schemas.datacontract.org/2004/07/ProductoSOA.Models" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
              <a:Costo>${producto.costo}</a:Costo>
              <a:Descripcion>${producto.descripcion}</a:Descripcion>
              <a:Id>${producto.id}</a:Id>
              <a:IdTipo>${producto.idTipo}</a:IdTipo>
              <a:Valor>${producto.valor}</a:Valor>
            </producto>
          </Actualizar>
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/IProductoService/Actualizar').pipe(
      map(xmlDoc => {
        const resultado = this.findNodeByLocalName(xmlDoc, 'ActualizarResult');
        return resultado ? resultado.textContent === 'true' : false;
      })
    );
  }

  eliminar(id: number): Observable<boolean> {
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
          <Eliminar xmlns="http://tempuri.org/">
            <id>${id}</id>
          </Eliminar>
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/IProductoService/Eliminar').pipe(
      map(xmlDoc => {
        const resultado = this.findNodeByLocalName(xmlDoc, 'EliminarResult');
        return resultado ? resultado.textContent === 'true' : false;
      })
    );
  }

  // --- MÉTODOS PRIVADOS ---

  private soapRequest(body: string, soapAction: string): Observable<XMLDocument> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': soapAction
    });

    return this.http.post(this.url, body, { headers, responseType: 'text' }).pipe(
      map(responseString => {
        const parser = new DOMParser();
        return parser.parseFromString(responseString, 'text/xml');
      })
    );
  }

  // Busca un nodo ignorando el prefijo (ej: encuentra 'Id' aunque venga como 'a:Id')
  private findNodeByLocalName(parent: Document | Element, localName: string): Element | null {
    const allElements = parent.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      if (allElements[i].localName === localName) {
        return allElements[i];
      }
    }
    return null;
  }

  private getNodeValue(parent: Element, tagName: string): number {
    const node = this.findNodeByLocalName(parent, tagName);
    return node ? parseFloat(node.textContent || '0') : 0;
  }

  private getNodeText(parent: Element, tagName: string): string {
    const node = this.findNodeByLocalName(parent, tagName);
    return node ? (node.textContent || '') : '';
  }
}