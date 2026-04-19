using Application.DTOs;
using Application.Services;

namespace Api.Rest;

/// <summary>
/// Registers REST API endpoints using Minimal APIs.
/// </summary>
public static class RestEndpoints
{
    /// <summary>
    /// Maps all REST API routes under /api/rest.
    /// </summary>
    public static void MapRestEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/rest").WithTags("REST");

        MapCategoryEndpoints(group);
        MapProductEndpoints(group);
        MapOrderEndpoints(group);
    }

    private static void MapCategoryEndpoints(RouteGroupBuilder group)
    {
        group.MapGet("/categories", async (ICatalogService service, CancellationToken ct) =>
            Results.Ok(await service.GetCategoriesAsync(ct)))
            .WithName("GetCategories")
            .Produces<IReadOnlyList<CategoryDto>>();

        group.MapGet("/categories/{id:guid}", async (Guid id, ICatalogService service, CancellationToken ct) =>
        {
            var category = await service.GetCategoryByIdAsync(id, ct);
            return category is null ? Results.NotFound() : Results.Ok(category);
        })
        .WithName("GetCategoryById")
        .Produces<CategoryDto>()
        .Produces(StatusCodes.Status404NotFound);
    }

    private static void MapProductEndpoints(RouteGroupBuilder group)
    {
        group.MapGet("/products", async (ICatalogService service, CancellationToken ct, int? skip, int? limit) =>
            Results.Ok(await service.GetProductsAsync(skip, limit, ct)))
            .WithName("GetProducts")
            .Produces<IReadOnlyList<ProductDto>>();

        group.MapGet("/products/{id:guid}", async (Guid id, ICatalogService service, CancellationToken ct) =>
        {
            var product = await service.GetProductByIdAsync(id, ct);
            return product is null ? Results.NotFound() : Results.Ok(product);
        })
        .WithName("GetProductById")
        .Produces<ProductDto>()
        .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/products/category/{categoryId:guid}", async (Guid categoryId, ICatalogService service, CancellationToken ct) =>
            Results.Ok(await service.GetProductsByCategoryAsync(categoryId, ct)))
            .WithName("GetProductsByCategory")
            .Produces<IReadOnlyList<ProductDto>>();

        group.MapGet("/products/search", async (string? name, decimal? minPrice, decimal? maxPrice, ICatalogService service, CancellationToken ct) =>
            Results.Ok(await service.SearchProductsAsync(new ProductSearchRequest(name, minPrice, maxPrice), ct)))
            .WithName("SearchProducts")
            .Produces<IReadOnlyList<ProductDto>>();
    }

    private static void MapOrderEndpoints(RouteGroupBuilder group)
    {
        group.MapGet("/orders", async (IOrderService service, CancellationToken ct) =>
            Results.Ok(await service.GetOrdersAsync(ct)))
            .WithName("GetOrders")
            .Produces<IReadOnlyList<OrderDto>>();

        group.MapGet("/orders/{id:guid}", async (Guid id, IOrderService service, CancellationToken ct) =>
        {
            var order = await service.GetOrderByIdAsync(id, ct);
            return order is null ? Results.NotFound() : Results.Ok(order);
        })
        .WithName("GetOrderById")
        .Produces<OrderDto>()
        .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/orders", async (CreateOrderRequest request, IOrderService service, CancellationToken ct) =>
        {
            var order = await service.CreateOrderAsync(request, ct);
            return Results.Created($"/api/rest/orders/{order.Id}", order);
        })
        .WithName("CreateOrder")
        .Produces<OrderDto>(StatusCodes.Status201Created);
    }
}
