namespace GameLauncher.Api.Contracts;

public record GameResponse(
    Guid Id,
    string Name,
    string LaunchPath,
    string? Arguments,
    string? WorkingDirectory,
    string? CoverArtPath,
    List<string> Tags,
    bool IsFavorite,
    DateTime? LastPlayedAt,
    int PlayCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
