using GameLauncher.Api.Contracts;
using GameLauncher.Api.Models;

namespace GameLauncher.Api.Mapping;

public static class GameMapper
{
    public static GameResponse ToResponse(this Game game) => new(
        game.Id,
        game.Name,
        game.LaunchPath,
        game.Arguments,
        game.WorkingDirectory,
        game.CoverArtPath,
        game.Tags,
        game.IsFavorite,
        game.LastPlayedAt,
        game.PlayCount,
        game.CreatedAt,
        game.UpdatedAt
    );

    public static Game ToGame(this CreateGameRequest request) => new()
    {
        Id = Guid.NewGuid(),
        Name = request.Name,
        LaunchPath = request.LaunchPath,
        Arguments = request.Arguments,
        WorkingDirectory = request.WorkingDirectory,
        CoverArtPath = request.CoverArtPath,
        Tags = request.Tags ?? [],
        IsFavorite = request.IsFavorite,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    public static void ApplyUpdate(this Game game, UpdateGameRequest request)
    {
        game.Name = request.Name;
        game.LaunchPath = request.LaunchPath;
        game.Arguments = request.Arguments;
        game.WorkingDirectory = request.WorkingDirectory;
        game.CoverArtPath = request.CoverArtPath;
        game.Tags = request.Tags ?? [];
        game.IsFavorite = request.IsFavorite;
        game.UpdatedAt = DateTime.UtcNow;
    }
}
