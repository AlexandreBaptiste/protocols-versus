using Domain.Entities;

namespace Domain.Interfaces;

/// <summary>
/// Repository interface for Product aggregate.
/// </summary>
public interface IProductRepository
{
    Task<IReadOnlyList<Product>> GetAllAsync(int? skip = null, int? take = null, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> SearchAsync(string? name, decimal? minPrice, decimal? maxPrice, CancellationToken cancellationToken = default);
}
