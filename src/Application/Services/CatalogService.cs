using Application.DTOs;
using Application.Mappers;
using Domain.Interfaces;

namespace Application.Services;

/// <summary>
/// Application service for catalog queries.
/// </summary>
public sealed class CatalogService(ICategoryRepository categoryRepository, IProductRepository productRepository)
    : ICatalogService
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        var categories = await categoryRepository.GetAllAsync(ct);
        return categories.Select(DtoMapper.ToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<CategoryDto?> GetCategoryByIdAsync(Guid id, CancellationToken ct = default)
    {
        var category = await categoryRepository.GetByIdAsync(id, ct);
        return category is null ? null : DtoMapper.ToDto(category);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ProductDto>> GetProductsAsync(int? skip = null, int? take = null, CancellationToken ct = default)
    {
        var products = await productRepository.GetAllAsync(skip, take, ct);
        return products.Select(DtoMapper.ToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<ProductDto?> GetProductByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await productRepository.GetByIdAsync(id, ct);
        return product is null ? null : DtoMapper.ToDto(product);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ProductDto>> GetProductsByCategoryAsync(Guid categoryId, CancellationToken ct = default)
    {
        var products = await productRepository.GetByCategoryIdAsync(categoryId, ct);
        return products.Select(DtoMapper.ToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ProductDto>> SearchProductsAsync(ProductSearchRequest request, CancellationToken ct = default)
    {
        var products = await productRepository.SearchAsync(request.Name, request.MinPrice, request.MaxPrice, ct);
        return products.Select(DtoMapper.ToDto).ToList();
    }
}
