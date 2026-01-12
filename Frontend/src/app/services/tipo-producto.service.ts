import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TipoProducto } from '../models/tipo-producto.model';

@Injectable({
  providedIn: 'root'
})
export class TipoProductoService {
  // 1. URL Correcta (Puerto 5000 HTTP)
  private url = 'http://localhost:5000/Services/TipoProductoService';
  
  // 2. Namespace de tus Modelos (Debe coincidir con C#)
  private modelNs = 'http://schemas.datacontract.org/2004/07/ProductoSOA.Models';

  constructor(private http: HttpClient) { }

  // --- OBTENER TODOS ---
  obtenerTodos(): Observable<TipoProducto[]> {
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
          <ObtenerTodos xmlns="http://tempuri.org/" />
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/ITipoProductoService/ObtenerTodos').pipe(
      map(xmlDoc => {
        const tipos: TipoProducto[] = [];
        // Buscamos nodos ignorando el namespace para mayor seguridad
        const items = this.getElementsByTagNameLocal(xmlDoc, 'TipoProducto');
        
        for (let i = 0; i < items.length; i++) {
          const nodo = items[i];
          tipos.push({
            id: this.getNodeValue(nodo, 'Id'),
            tipo: this.getNodeText(nodo, 'Tipo')
          });
        }
        return tipos;
      }),
      catchError(err => {
        console.error('Error ObtenerTodos Tipos:', err);
        return of([]);
      })
    );
  }

  // --- OBTENER POR ID ---
  obtenerPorId(id: number): Observable<TipoProducto | null> {
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <s:Body>
          <tem:ObtenerPorId>
            <tem:id>${id}</tem:id>
          </tem:ObtenerPorId>
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/ITipoProductoService/ObtenerPorId').pipe(
      map(xmlDoc => {
        const resultNode = this.findNodeByLocalName(xmlDoc, 'ObtenerPorIdResult');
        if (resultNode && resultNode.childNodes.length > 0) {
          // Check if result is not nil
          const isNil = resultNode.getAttribute('i:nil') === 'true' || 
                        resultNode.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'nil') === 'true';
          if (isNil) {
            return null;
          }
          return {
            id: this.getNodeValue(resultNode, 'Id'),
            tipo: this.getNodeText(resultNode, 'Tipo')
          };
        }
        return null;
      }),
      catchError(err => {
        console.error('Error ObtenerPorId Tipo:', err);
        return of(null);
      })
    );
  }

  // --- CREAR ---
  crear(tipoProducto: TipoProducto): Observable<number> {
    // NOTA: 'tipoProducto' es el nombre del argumento en tu interfaz C#
    // 'a' es el prefijo para las propiedades del modelo (ProductoSOA.Models)
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:a="${this.modelNs}">
        <s:Body>
          <tem:Crear>
            <tem:tipoProducto>
              <a:Id>0</a:Id>
              <a:Tipo>${this.escapeXml(tipoProducto.tipo)}</a:Tipo>
            </tem:tipoProducto>
          </tem:Crear>
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/ITipoProductoService/Crear').pipe(
      map(xmlDoc => {
        const resultNode = this.findNodeByLocalName(xmlDoc, 'CrearResult');
        return resultNode ? parseInt(resultNode.textContent || '0', 10) : 0;
      })
    );
  }

  // --- ACTUALIZAR ---
  actualizar(tipoProducto: TipoProducto): Observable<boolean> {
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:a="${this.modelNs}">
        <s:Body>
          <tem:Actualizar>
            <tem:tipoProducto>
              <a:Id>${tipoProducto.id}</a:Id>
              <a:Tipo>${this.escapeXml(tipoProducto.tipo)}</a:Tipo>
            </tem:tipoProducto>
          </tem:Actualizar>
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/ITipoProductoService/Actualizar').pipe(
      map(xmlDoc => {
        const resultNode = this.findNodeByLocalName(xmlDoc, 'ActualizarResult');
        return resultNode ? resultNode.textContent === 'true' : false;
      })
    );
  }

  // --- ELIMINAR ---
  eliminar(id: number): Observable<boolean> {
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <s:Body>
          <tem:Eliminar>
            <tem:id>${id}</tem:id>
          </tem:Eliminar>
        </s:Body>
      </s:Envelope>`;

    return this.soapRequest(body, 'http://tempuri.org/ITipoProductoService/Eliminar').pipe(
      map(xmlDoc => {
        const resultNode = this.findNodeByLocalName(xmlDoc, 'EliminarResult');
        return resultNode ? resultNode.textContent === 'true' : false;
      })
    );
  }

  // --- HELPERS CORE ---

  private soapRequest(body: string, action: string): Observable<XMLDocument> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': action
    });

    return this.http.post(this.url, body, { headers, responseType: 'text' }).pipe(
      map(responseString => new DOMParser().parseFromString(responseString, 'text/xml'))
    );
  }

  // Busca elementos ignorando el prefijo del namespace (ej: encuentra a:Id buscando solo "Id")
  private findNodeByLocalName(parent: Document | Element, localName: string): Element | null {
    const all = parent.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === localName) return all[i];
    }
    return null;
  }

  private getElementsByTagNameLocal(parent: Document | Element, localName: string): Element[] {
    const result: Element[] = [];
    const all = parent.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === localName) result.push(all[i]);
    }
    return result;
  }

  private getNodeValue(parent: Element, tagName: string): number {
    const node = this.findNodeByLocalName(parent, tagName);
    return node ? parseFloat(node.textContent || '0') : 0;
  }

  private getNodeText(parent: Element, tagName: string): string {
    const node = this.findNodeByLocalName(parent, tagName);
    return node ? (node.textContent || '') : '';
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