using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;
using Microsoft.EntityFrameworkCore;
using ProductoSOA.Data;
using ProductoSOA.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4201")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Configurar base de datos PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=producto_soa;Username=postgres;Password=postgres123;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Agregar servicios
builder.Services.AddScoped<ITipoProductoService, TipoProductoService>();
builder.Services.AddScoped<IProductoService, ProductoService>();

// Configurar CoreWCF
builder.Services.AddServiceModelServices();

var app = builder.Build();

// Usar CORS
app.UseCors("AllowAngular");

// Aplicar migraciones automáticamente
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// Configurar los endpoints de CoreWCF
app.UseServiceModel(serviceBuilder =>
{
    var basicBinding = new BasicHttpBinding 
    { 
        MaxReceivedMessageSize = 2147483647
    };

    serviceBuilder.AddService<TipoProductoService>()
        .AddServiceEndpoint<TipoProductoService, ITipoProductoService>(
            basicBinding,
            "/Services/TipoProductoService");

    serviceBuilder.AddService<ProductoService>()
        .AddServiceEndpoint<ProductoService, IProductoService>(
            basicBinding,
            "/Services/ProductoService");
});

app.Run();
