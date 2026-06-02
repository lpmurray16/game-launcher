using FluentAssertions;
using GameLauncher.Api.Models;
using GameLauncher.Api.Services;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;

namespace GameLauncher.Api.Tests.Services;

[TestFixture]
public class LaunchServiceTests
{
    private LaunchService _sut = null!;

    [SetUp]
    public void SetUp()
    {
        var logger = new Mock<ILogger<LaunchService>>();
        _sut = new LaunchService(logger.Object);
    }

    [Test]
    public async Task ShouldReturnFailureIfLaunchPathIsEmpty()
    {
        var game = BuildGame(launchPath: string.Empty);

        var result = await _sut.LaunchAsync(game);

        result.Success.Should().BeFalse();
        result.Error.Should().NotBeNullOrWhiteSpace();
    }

    [Test]
    public async Task ShouldReturnFailureIfLaunchPathIsRelative()
    {
        var game = BuildGame(launchPath: "relative/path/game.exe");

        var result = await _sut.LaunchAsync(game);

        result.Success.Should().BeFalse();
        result.Error.Should().Contain("absolute");
    }

    [Test]
    public async Task ShouldReturnFailureIfExtensionIsNotAllowed()
    {
        var game = BuildGame(launchPath: @"C:\Games\game.ps1");

        var result = await _sut.LaunchAsync(game);

        result.Success.Should().BeFalse();
        result.Error.Should().Contain(".ps1");
    }

    [Test]
    public async Task ShouldReturnFailureIfFileDoesNotExist()
    {
        var game = BuildGame(launchPath: @"C:\Games\nonexistent_game_xyz.exe");

        var result = await _sut.LaunchAsync(game);

        result.Success.Should().BeFalse();
        result.Error.Should().Contain("does not exist");
    }

    private static Game BuildGame(string launchPath) => new()
    {
        Id = Guid.NewGuid(),
        Name = "Test Game",
        LaunchPath = launchPath,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };
}
