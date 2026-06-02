using GameLauncher.Api.Contracts;
using GameLauncher.Api.Mapping;
using GameLauncher.Api.Repositories;
using GameLauncher.Api.Services;

namespace GameLauncher.Api.Endpoints;

public static class GameEndpoints
{
    public static void MapGameEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/games").WithTags("Games");

        group.MapGet("/", GetAllGames);
        group.MapGet("/{id:guid}", GetGameById);
        group.MapPost("/", CreateGame);
        group.MapPut("/{id:guid}", UpdateGame);
        group.MapDelete("/{id:guid}", DeleteGame);
        group.MapPost("/{id:guid}/launch", LaunchGame);
    }

    private static async Task<IResult> GetAllGames(IGameRepository repository)
    {
        var games = await repository.GetAllAsync();
        return Results.Ok(games.Select(g => g.ToResponse()));
    }

    private static async Task<IResult> GetGameById(Guid id, IGameRepository repository)
    {
        var game = await repository.GetByIdAsync(id);
        return game is null ? Results.NotFound() : Results.Ok(game.ToResponse());
    }

    private static async Task<IResult> CreateGame(CreateGameRequest request, IGameRepository repository)
    {
        var game = request.ToGame();
        var created = await repository.CreateAsync(game);
        return Results.Created($"/api/games/{created.Id}", created.ToResponse());
    }

    private static async Task<IResult> UpdateGame(Guid id, UpdateGameRequest request, IGameRepository repository)
    {
        var game = await repository.GetByIdAsync(id);
        if (game is null) return Results.NotFound();

        game.ApplyUpdate(request);
        var updated = await repository.UpdateAsync(game);
        return Results.Ok(updated.ToResponse());
    }

    private static async Task<IResult> DeleteGame(Guid id, IGameRepository repository)
    {
        var game = await repository.GetByIdAsync(id);
        if (game is null) return Results.NotFound();

        await repository.DeleteAsync(game);
        return Results.NoContent();
    }

    private static async Task<IResult> LaunchGame(Guid id, IGameRepository repository, ILaunchService launchService)
    {
        var game = await repository.GetByIdAsync(id);
        if (game is null) return Results.NotFound();

        var result = await launchService.LaunchAsync(game);
        if (!result.Success)
            return Results.Problem(result.Error, statusCode: StatusCodes.Status422UnprocessableEntity);

        game.LastPlayedAt = DateTime.UtcNow;
        game.PlayCount++;
        await repository.UpdateAsync(game);

        return Results.Ok(new { message = "Game launched successfully." });
    }
}
