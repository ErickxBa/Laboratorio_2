# Guía Rápida de Instalación

## ⚡ OPCIÓN 1: Con Docker Compose (Recomendado)

### Prerrequisitos
- Docker Desktop instalado ([descargar](https://www.docker.com/products/docker-desktop))
- Docker Compose incluido en Docker Desktop

### Paso 1: Iniciar los servicios
```bash
docker-compose up -d
```

### Paso 2: Verificar que PostgreSQL esté listo
```bash
docker-compose ps
```

Busca que el servicio `postgres` tenga estado `healthy` o `running`.

### Paso 3: Aplicar migraciones (crear tablas en la BD)
```powershell
cd Backend
dotnet ef database update
```

### Paso 4: Ejecutar el servidor
```powershell
dotnet run
```

El servidor estará en: `http://localhost:5000`

### Paso 5: Ejecutar el frontend
```bash
cd Frontend
npm install  # (si es la primera vez)
npm start
```

Accede a: `http://localhost:4200`

### ⚠️ Detener los servicios
```bash
docker-compose down
```

---

## 🔧 OPCIÓN 2: Instalación Manual (Sin Docker)

### 1️⃣ Preparar el Entorno Backend

### Paso 1: Abrir PowerShell/CMD en la carpeta Backend
```powershell
cd Backend
```

### Paso 2: Restaurar paquetes NuGet
```powershell
dotnet restore
```

### Paso 3: Aplicar migraciones (crear BD con PostgreSQL)
```powershell
dotnet ef database update
```

**Nota**: La aplicación se conectará a PostgreSQL en `localhost:5432` usando las credenciales del docker-compose.yml

### Paso 4: Ejecutar el servidor
```powershell
dotnet run
```

Verifica que el servidor esté corriendo en: `http://localhost:5000`

---

### 2️⃣ Preparar el Entorno Frontend

### Paso 1: Abrir terminal en la carpeta Frontend
```bash
cd Frontend
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Ejecutar Angular
```bash
npm start
```

Accede a: `http://localhost:4200`

---

## ✅ Verificación

### Docker (Opción 1)
- [ ] PostgreSQL inicia correctamente: `docker-compose ps` muestra "healthy"
- [ ] Migraciones se aplican sin errores: `dotnet ef database update`
- [ ] Base de datos creada en PostgreSQL (dentro del contenedor)
- [ ] Servicio disponible en `http://localhost:5000`

### Manual (Opción 2)
- [ ] Conexión a PostgreSQL establecida exitosamente
- [ ] Proyecto compila sin errores
- [ ] Base de datos creada en PostgreSQL
- [ ] Servicio disponible en `http://localhost:5000`

### Frontend (Ambas opciones)
- [ ] `npm install` completa exitosamente
- [ ] Servidor Angular inicia en puerto 4200
- [ ] UI carga correctamente y se conecta al backend

---

## 🔗 Variables de Conexión a PostgreSQL

Por defecto, el archivo `docker-compose.yml` configura:

| Variable | Valor |
|----------|-------|
| Host | localhost |
| Puerto | 5432 |
| Base de datos | producto_soa |
| Usuario | postgres |
| Contraseña | postgres123 |

**Para cambiar estas credenciales**, modifica el archivo `docker-compose.yml` y `appsettings.json` en la carpeta Backend.

### Integración
- [ ] Puedes crear tipos de producto desde UI
- [ ] Puedes crear productos
- [ ] Puedes editar registros
- [ ] Puedes eliminar registros

---

## 🐛 Troubleshooting

### Error: "Port already in use"
- Cambiar puerto en `Program.cs`: `.UseUrls("http://localhost:5001")`
- O en Angular: `ng serve --port 4201`

### Error: "Database connection failed"
- Verificar connectionstring en `appsettings.json`
- Verificar que SQL Server esté corriendo
- Ejecutar: `dotnet ef database update` nuevamente

### CORS Error
- Verificar que BackEnd está en puerto 5000
- Verificar que Frontend está en puerto 4200
- Los headers CORS están configurados en `Program.cs`

---

## 📞 URLs Útiles

- **Frontend**: http://localhost:4200
- **Backend (Swagger/Metadata)**: http://localhost:5000
- **TipoProducto SOAP**: http://localhost:5000/Services/TipoProductoService
- **Producto SOAP**: http://localhost:5000/Services/ProductoService

---

¡Listo! Tu aplicación SOA está lista para usar 🎉
