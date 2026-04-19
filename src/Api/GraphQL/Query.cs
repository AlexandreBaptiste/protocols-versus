using Application.DTOs;
using Application.Services;

namespace Api.GraphQL;

/// <summary>
/// GraphQL query resolvers for the catalog.
/// Demonstrates GraphQL's ability to let clients request exactly the fields they need.
/// </summary>
public sealed class Query
{
    /// <summary>
    /// Gets all categories.
    /// </summary>
    [GraphQLDescription("Retrieves all product categories.")]
    public async Task<IReadOnlyList<CategoryDto>> GetCategories(
        [Service] ICatalogService service,
        CancellationToken ct)
    {
        return await service.GetCategoriesAsync(ct);
    }

    /// <summary>
    /// Gets a category by its unique identifier.
    /// </summary>
    [GraphQLDescription("Retrieves a single category by ID.")]
    public async Task<CategoryDto?> GetCategory(
        Guid id,
        [Service] ICatalogService service,
        CancellationToken ct)
    {
        return await service.GetCategoryByIdAsync(id, ct);
    }

    /// <summary>
    /// Gets all products in the catalog.
    /// </summary>
    [GraphQLDescription("Retrieves all products. Supports field selection — request only the fields you need. Use 'limit' to cap the number of results.")]
    public async Task<IReadOnlyList<ProductDto>> GetProducts(
        [Service] ICatalogService service,
        CancellationToken ct,
        int? skip = null,
        int? limit = null)
    {
        return await service.GetProductsAsync(skip, limit, ct);
    }

    /// <summary>
    /// Gets a single product by ID.
    /// </summary>
    [GraphQLDescription("Retrieves a single product by ID.")]
    public async Task<ProductDto?> GetProduct(
        Guid id,
        [Service] ICatalogService service,
        CancellationToken ct)
    {
        return await service.GetProductByIdAsync(id, ct);
    }

    /// <summary>
    /// Gets products belonging to a specific category.
    /// </summary>
    [GraphQLDescription("Retrieves products filtered by category. Demonstrates GraphQL's filtering advantage over REST.")]
    public async Task<IReadOnlyList<ProductDto>> GetProductsByCategory(
        Guid categoryId,
        [Service] ICatalogService service,
        CancellationToken ct)
    {
        return await service.GetProductsByCategoryAsync(categoryId, ct);
    }

    /// <summary>
    /// Searches products with optional filters.
    /// </summary>
    [GraphQLDescription("Searches products by name, price range. Shows GraphQL's flexible querying capability.")]
    public async Task<IReadOnlyList<ProductDto>> SearchProducts(
        string? name,
        decimal? minPrice,
        decimal? maxPrice,
        [Service] ICatalogService service,
        CancellationToken ct)
    {
        return await service.SearchProductsAsync(new ProductSearchRequest(name, minPrice, maxPrice), ct);
    }

    /// <summary>
    /// Gets all orders with their items.
    /// </summary>
    [GraphQLDescription("Retrieves all orders with nested order items. Solves the N+1 problem with a single query.")]
    public async Task<IReadOnlyList<OrderDto>> GetOrders(
        [Service] IOrderService service,
        CancellationToken ct)
    {
        return await service.GetOrdersAsync(ct);
    }

    /// <summary>
    /// Gets a single order by ID.
    /// </summary>
    [GraphQLDescription("Retrieves a single order by ID.")]
    public async Task<OrderDto?> GetOrder(
        Guid id,
        [Service] IOrderService service,
        CancellationToken ct)
    {
        return await service.GetOrderByIdAsync(id, ct);
    }
}
