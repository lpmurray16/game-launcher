using GameLauncher.Api.Data;
using GameLauncher.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameLauncher.Api.Repositories;

public class GameRepository(GameLauncherDbContext db) : IGameRepository
{
    public async Task<IReadOnlyList<Game>> GetAllAsync() =>
        await db.Games.OrderBy(g => g.Name).ToListAsync();

    public async Task<Game?> GetByIdAsync(Guid id) =>
        await db.Games.FindAsync(id);

    public async Task<Game> CreateAsync(Game game)
    {
        db.Games.Add(game);
        await db.SaveChangesAsync();
        return game;
    }

    public async Task<Game> UpdateAsync(Game game)
    {
        db.Games.Update(game);
        await db.SaveChangesAsync();
        return game;
    }

    public async Task DeleteAsync(Game game)
    {
        db.Games.Remove(game);
        await db.SaveChangesAsync();
    }
}
