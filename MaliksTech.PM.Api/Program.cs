using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using MaliksTech.PM.Api.Data;
using MaliksTech.PM.Api.Services;
using MaliksTech.PM.Api.Services.Interfaces;
using MaliksTech.PM.Api.Services.Implementations;
using MaliksTech.PM.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Render (and most Postgres hosts) hand out DATABASE_URL as a postgres:// URI,
// which Npgsql's keyword=value parser can't read directly — convert it if needed.
static string NormalizeConnectionString(string? raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
    if (!raw.StartsWith("postgres://") && !raw.StartsWith("postgresql://")) return raw;

    var uri = new Uri(raw);
    var userInfo = uri.UserInfo.Split(':', 2);
    var csBuilder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        Database = uri.AbsolutePath.TrimStart('/'),
        SslMode = SslMode.Require
    };
    return csBuilder.ToString();
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(NormalizeConnectionString(builder.Configuration.GetConnectionString("DefaultConnection"))));

builder.Services.AddControllers()
    .AddJsonOptions(x =>
    {
        x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        x.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is missing. Set it via `dotnet user-secrets set \"Jwt:Key\" \"<value>\"`.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience
        };
    });

builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IAiAssistantService, AiAssistantService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var isDevelopment = app.Environment.IsDevelopment();

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        await context.Response.WriteAsJsonAsync(new
        {
            title = "حدث خطأ غير متوقع في الخادم.",
            status = 500,
            detail = isDevelopment ? feature?.Error.Message : null
        });
    });
});

app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
    if (!context.Users.Any())
    {
        context.Users.Add(new ApplicationUser
        {
            FullName = "Malik Sufian",
            Email = "malik@example.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Malik@123"),
            Role = UserRole.Admin
        });
        context.SaveChanges();
    }
}

app.Run();
