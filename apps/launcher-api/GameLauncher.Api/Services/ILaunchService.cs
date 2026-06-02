using GameLauncher.Api.Models;

namespace GameLauncher.Api.Services;

public interface ILaunchService
{
    Task<LaunchResult> LaunchAsync(Game game);
}

public record LaunchResult(bool Success, string? Error = null);
