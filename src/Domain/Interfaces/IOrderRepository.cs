using Domain.Entities;

namespace Domain.Interfaces;

/// <summary>
/// Repository interface for Order aggregate.
/// </summary>
public interface IOrderRepository
{
    Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Order> AddAsync(Order order, CancellationToken cancellationToken = default);
}
