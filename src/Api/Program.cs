using Api.Benchmark;
using Api.GraphQL;
using Api.Grpc;
using Api.Hubs;
using Api.Rest;
using Infrastructure;
using Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Infrastructure: EF Core InMemory, repositories, application services
builder.Services.AddInfrastructure();

// gRPC
builder.Services.AddGrpc();

// GraphQL (HotChocolate)
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>();

// SignalR
builder.Services.AddSignalR();

// Global error handling with ProblemDetails (RFC 9457)
builder.Services.AddProblemDetails();

// CORS: allow the React frontend (origins from configuration)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Seed the in-memory database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DatabaseSeeder.SeedAsync(db);
}

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseCors();

// Enable gRPC-Web so browsers can call gRPC endpoints directly
app.UseGrpcWeb(new GrpcWebOptions { DefaultEnabled = true });

// REST endpoints
app.MapRestEndpoints();

// gRPC service — EnableGrpcWeb() allows browser clients via gRPC-Web protocol
app.MapGrpcService<CatalogGrpcServiceImpl>().EnableGrpcWeb();

// GraphQL endpoint
app.MapGraphQL("/graphql");

// SignalR hub
app.MapHub<CatalogHub>("/hub/catalog");

// Benchmark endpoints
app.MapBenchmarkEndpoints();

// Health check
app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }));

app.Run();

// Make Program accessible for integration tests
public partial class Program;

