using Application.DTOs;

namespace Application.Services;

/// <summary>
/// Application service interface for order operations.
/// </summary>
public interface IOrderService
{
    Task<IReadOnlyList<OrderDto>> GetOrdersAsync(CancellationToken ct = default);
    Task<OrderDto?> GetOrderByIdAsync(Guid id, CancellationToken ct = default);
    Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default);
}
