namespace GameLauncher.Api.Endpoints;

public static class StatusEndpoints
{
    public static void MapStatusEndpoints(this WebApplication app)
    {
        app.MapGet("/api/status", () => Results.Ok(new
        {
            status = "ok",
            version = "1.0.0",
            timestamp = DateTime.UtcNow
        }))
        .WithTags("Status")
        .WithName("GetStatus");
    }
}
