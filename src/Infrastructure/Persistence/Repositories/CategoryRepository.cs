using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core implementation of ICategoryRepository.
/// </summary>
public sealed class CategoryRepository(AppDbContext context) : ICategoryRepository
{
    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Categories.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public Task<Category> AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        context.Categories.Add(category);
        return Task.FromResult(category);
    }
}
