using GameLauncher.Api.Models;
using System.Diagnostics;

namespace GameLauncher.Api.Services;

public class LaunchService(ILogger<LaunchService> logger) : ILaunchService
{
    private static readonly HashSet<string> AllowedExtensions = [".exe", ".lnk", ".bat"];

    public Task<LaunchResult> LaunchAsync(Game game)
    {
        var validationError = ValidateLaunchPath(game.LaunchPath);
        if (validationError is not null)
        {
            logger.LogWarning("Launch validation failed for game {GameId}: {Error}", game.Id, validationError);
            return Task.FromResult(new LaunchResult(false, validationError));
        }

        try
        {
            var startInfo = BuildProcessStartInfo(game);
            using var process = Process.Start(startInfo);

            if (process is null)
            {
                logger.LogError("Failed to start process for game {GameId} at {LaunchPath}", game.Id, game.LaunchPath);
                return Task.FromResult(new LaunchResult(false, "Failed to start the process."));
            }

            logger.LogInformation("Launched game {GameId} ({GameName}) with PID {Pid}", game.Id, game.Name, process.Id);
            return Task.FromResult(new LaunchResult(true));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception launching game {GameId} at {LaunchPath}", game.Id, game.LaunchPath);
            return Task.FromResult(new LaunchResult(false, "An error occurred while launching the game."));
        }
    }

    private static string? ValidateLaunchPath(string launchPath)
    {
        if (string.IsNullOrWhiteSpace(launchPath))
            return "Launch path cannot be empty.";

        if (!Path.IsPathFullyQualified(launchPath))
            return "Launch path must be an absolute path.";

        var extension = Path.GetExtension(launchPath).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
            return $"File type '{extension}' is not allowed. Only .exe, .lnk, and .bat files are supported.";

        if (!File.Exists(launchPath))
            return $"Launch target does not exist: {launchPath}";

        return null;
    }

    private static ProcessStartInfo BuildProcessStartInfo(Game game)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = game.LaunchPath,
            UseShellExecute = true,
        };

        if (!string.IsNullOrWhiteSpace(game.Arguments))
            startInfo.Arguments = game.Arguments;

        if (!string.IsNullOrWhiteSpace(game.WorkingDirectory))
            startInfo.WorkingDirectory = game.WorkingDirectory;

        return startInfo;
    }
}
