using Application.DTOs;

namespace Application.Services;

/// <summary>
/// Application service interface for catalog operations.
/// </summary>
public interface ICatalogService
{
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default);
    Task<CategoryDto?> GetCategoryByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> GetProductsAsync(int? skip = null, int? take = null, CancellationToken ct = default);
    Task<ProductDto?> GetProductByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> GetProductsByCategoryAsync(Guid categoryId, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> SearchProductsAsync(ProductSearchRequest request, CancellationToken ct = default);
}
