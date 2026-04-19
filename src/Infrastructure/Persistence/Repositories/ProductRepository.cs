using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core implementation of IProductRepository.
/// </summary>
public sealed class ProductRepository(AppDbContext context) : IProductRepository
{
    public async Task<IReadOnlyList<Product>> GetAllAsync(int? skip = null, int? take = null, CancellationToken cancellationToken = default)
    {
        var query = context.Products.AsNoTracking().AsQueryable();

        if (skip.HasValue)
        {
            query = query.Skip(skip.Value);
        }

        if (take.HasValue)
        {
            query = query.Take(take.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await context.Products
            .AsNoTracking()
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync(cancellationToken);
    }

    public Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        context.Products.Add(product);
        return Task.FromResult(product);
    }

    public async Task<IReadOnlyList<Product>> SearchAsync(
        string? name,
        decimal? minPrice,
        decimal? maxPrice,
        CancellationToken cancellationToken = default)
    {
        var query = context.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(p => p.Name.Contains(name));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price.Amount >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price.Amount <= maxPrice.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }
}
