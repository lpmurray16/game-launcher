using GameLauncher.Api.Models;

namespace GameLauncher.Api.Repositories;

public interface IGameRepository
{
    Task<IReadOnlyList<Game>> GetAllAsync();
    Task<Game?> GetByIdAsync(Guid id);
    Task<Game> CreateAsync(Game game);
    Task<Game> UpdateAsync(Game game);
    Task DeleteAsync(Game game);
}
