namespace GameLauncher.Api.Contracts;

public record UpdateGameRequest(
    string Name,
    string LaunchPath,
    string? Arguments,
    string? WorkingDirectory,
    string? CoverArtPath,
    List<string>? Tags,
    bool IsFavorite
);
