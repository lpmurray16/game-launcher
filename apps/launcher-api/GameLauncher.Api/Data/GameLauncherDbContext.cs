using GameLauncher.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;

namespace GameLauncher.Api.Data;

public class GameLauncherDbContext(DbContextOptions<GameLauncherDbContext> options) : DbContext(options)
{
    public DbSet<Game> Games => Set<Game>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var tagsConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
        );

        var tagsComparer = new ValueComparer<List<string>>(
            (a, b) => JsonSerializer.Serialize(a, (JsonSerializerOptions?)null) == JsonSerializer.Serialize(b, (JsonSerializerOptions?)null),
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null).GetHashCode(),
            v => JsonSerializer.Deserialize<List<string>>(JsonSerializer.Serialize(v, (JsonSerializerOptions?)null), (JsonSerializerOptions?)null) ?? new List<string>()
        );

        modelBuilder.Entity<Game>(entity =>
        {
            entity.HasKey(g => g.Id);
            entity.Property(g => g.Name).IsRequired().HasMaxLength(200);
            entity.Property(g => g.LaunchPath).IsRequired().HasMaxLength(1000);
            entity.Property(g => g.Arguments).HasMaxLength(2000);
            entity.Property(g => g.WorkingDirectory).HasMaxLength(1000);
            entity.Property(g => g.CoverArtPath).HasMaxLength(1000);
            entity.Property(g => g.Tags)
                .HasConversion(tagsConverter)
                .Metadata.SetValueComparer(tagsComparer);
        });
    }
}
