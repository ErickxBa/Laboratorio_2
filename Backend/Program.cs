using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;
using Microsoft.EntityFrameworkCore;
using ProductoSOA.Data;      // Namespace correcto de tus Datos
using ProductoSOA.Services;  // Namespace correcto de tus Servicios

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar CORS para Angular (Puerto 4200)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4201") // Tus puertos de Angular
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 2. Configurar Base de Datos PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=producto_soa;Username=postgres;Password=postgres123;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 3. Registrar los Servicios (Inyección de Dependencias)
builder.Services.AddScoped<ITipoProductoService, TipoProductoService>();
builder.Services.AddScoped<IProductoService, ProductoService>();

// 4. Agregar CoreWCF
builder.Services.AddServiceModelServices();
builder.Services.AddServiceModelMetadata();

var app = builder.Build();

// 5. Usar CORS
app.UseCors("AllowAngular");

// 6. Aplicar migraciones automáticamente (Opcional, pero útil)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// 7. Configurar los Endpoints SOAP
app.UseServiceModel(serviceBuilder =>
{
    var basicBinding = new BasicHttpBinding 
    { 
        MaxReceivedMessageSize = 2147483647 // Permitir mensajes grandes
    };

    // Configurar TipoProductoService
    serviceBuilder.AddService<TipoProductoService>()
        .AddServiceEndpoint<TipoProductoService, ITipoProductoService>(
            basicBinding,
            "/Services/TipoProductoService");

    // Configurar ProductoService
    serviceBuilder.AddService<ProductoService>()
        .AddServiceEndpoint<ProductoService, IProductoService>(
            basicBinding,
            "/Services/ProductoService");

    // Habilitar WSDL para ambos (Metadata)
    var serviceMetadataBehavior = app.Services.GetRequiredService<ServiceMetadataBehavior>();
    serviceMetadataBehavior.HttpGetEnabled = true;
});

// 8. FORZAR ejecución en puerto 5000 (HTTP)
app.Run("http://localhost:5000");