import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // Asegúrate de que este puerto coincida con tu consola (http://localhost:5000)
  private url = 'http://localhost:5000/Services/ProductoService'; 

  constructor(private http: HttpClient) { }

  // --- MÉTODOS PÚBLICOS ---

  obtenerTodos(): Observable<Producto[]> {
    // 1. Definimos el cuerpo del XML (SOAP Envelope)
    const body = `
      <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
          <ObtenerTodos xmlns="http://tempuri.org/" />
        </s:Body>
      </s:Envelope>`;

    // 2. Enviamos la petición y transformamos el XML de respuesta a JSON
    return this.soapRequest(body, 'http://tempuri.org/IProductoService/ObtenerTodos').pipe(
      map(xmlDoc => {
        const productos: Producto[] = [];
        const listaNodos = xmlDoc.getElementsByTagName('Producto'); // Busca las etiquetas <Producto>
        
        for (let i = 0; i < listaNodos.length; i++) {
          const nodo = listaNodos[i];
          productos.push({
            id: this.getNodeValue(nodo, 'Id'), // Asegúrate que coincida con mayúsculas/minúsculas de tu Backend
            idTipo: this.getNodeValue(nodo, 'IdTipo'),
            descripcion: this.getNodeText(nodo, 'Descripcion'),
            valor: this.getNodeValue(nodo, 'Valor'),
            costo: this.getNodeValue(nodo, 'Costo')
          });
        }
        return productos;
      })
    );
  }

  crear(producto: Producto): Observable<number> {
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
        const resultado = xmlDoc.getElementsByTagName('CrearResult')[0];
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
        const resultado = xmlDoc.getElementsByTagName('ActualizarResult')[0];
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
        const resultado = xmlDoc.getElementsByTagName('EliminarResult')[0];
        return resultado ? resultado.textContent === 'true' : false;
      })
    );
  }

  // --- MÉTODOS PRIVADOS (CORE DE LA COMUNICACIÓN SOAP) ---

  private soapRequest(body: string, soapAction: string): Observable<XMLDocument> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': soapAction
    });

    // Enviamos request como texto (responseType: 'text') porque Angular espera JSON por defecto
    return this.http.post(this.url, body, { headers, responseType: 'text' }).pipe(
      map(responseString => {
        // Parseamos el string XML a un objeto DOM manipulable
        const parser = new DOMParser();
        return parser.parseFromString(responseString, 'text/xml');
      })
    );
  }

  // Ayudante para extraer valores numéricos del XML
  private getNodeValue(parent: Element, tagName: string): number {
    // Nota: A veces los tags vienen con prefijos (ej: a:Id), buscamos por nombre local o tag completo
    const node = parent.getElementsByTagName('*');
    for(let i=0; i<node.length; i++) {
        if (node[i].localName === tagName) {
            return parseFloat(node[i].textContent || '0');
        }
    }
    return 0;
  }

  // Ayudante para extraer texto del XML
  private getNodeText(parent: Element, tagName: string): string {
    const node = parent.getElementsByTagName('*');
    for(let i=0; i<node.length; i++) {
        if (node[i].localName === tagName) {
            return node[i].textContent || '';
        }
    }
    return '';
  }
}