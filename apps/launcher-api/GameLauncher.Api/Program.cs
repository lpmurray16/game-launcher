using GameLauncher.Api.Data;
using GameLauncher.Api.Endpoints;
using GameLauncher.Api.Repositories;
using GameLauncher.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Game Launcher API",
        Version = "v1",
        Description = "API for managing and launching games."
    });
});

var dbPath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
    "GameLauncher",
    "games.db"
);
Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);

builder.Services.AddDbContext<GameLauncherDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<ILaunchService, LaunchService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GameLauncherDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Game Launcher API v1");
    options.RoutePrefix = "swagger";
});

app.UseCors();

app.MapStatusEndpoints();
app.MapGameEndpoints();

app.Run();

public partial class Program { }
