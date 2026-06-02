namespace GameLauncher.Api.Contracts;

public record CreateGameRequest(
    string Name,
    string LaunchPath,
    string? Arguments,
    string? WorkingDirectory,
    string? CoverArtPath,
    List<string>? Tags,
    bool IsFavorite
);
