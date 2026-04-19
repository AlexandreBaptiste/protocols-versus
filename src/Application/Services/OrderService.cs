using Application.DTOs;
using Application.Mappers;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

/// <summary>
/// Application service for order operations.
/// </summary>
public sealed class OrderService(IOrderRepository orderRepository, IProductRepository productRepository, IUnitOfWork unitOfWork)
    : IOrderService
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<OrderDto>> GetOrdersAsync(CancellationToken ct = default)
    {
        var orders = await orderRepository.GetAllAsync(ct);
        return orders.Select(DtoMapper.ToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<OrderDto?> GetOrderByIdAsync(Guid id, CancellationToken ct = default)
    {
        var order = await orderRepository.GetByIdAsync(id, ct);
        return order is null ? null : DtoMapper.ToDto(order);
    }

    /// <inheritdoc />
    public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default)
    {
        if (request.Items is not { Count: > 0 })
        {
            throw new ArgumentException("At least one order item is required.", nameof(request));
        }

        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
            {
                throw new ArgumentException($"Quantity must be positive for product '{item.ProductId}'.", nameof(request));
            }
        }

        var order = Order.Create(request.CustomerName);

        foreach (var itemRequest in request.Items)
        {
            var product = await productRepository.GetByIdAsync(itemRequest.ProductId, ct);
            if (product is null)
            {
                throw new InvalidOperationException($"Product '{itemRequest.ProductId}' not found.");
            }

            product.ReduceStock(itemRequest.Quantity);
            order.AddItem(product.Id, product.Name, itemRequest.Quantity, product.Price);
        }

        await orderRepository.AddAsync(order, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return DtoMapper.ToDto(order);
    }
}
