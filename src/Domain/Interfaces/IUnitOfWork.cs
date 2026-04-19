namespace Domain.Interfaces;

/// <summary>
/// Unit of Work interface for coordinating atomic persistence operations.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
