using Application.DTOs;
using Domain.Entities;

namespace Application.Mappers;

/// <summary>
/// Maps domain entities to DTOs.
/// </summary>
public static class DtoMapper
{
    public static CategoryDto ToDto(Category category)
    {
        return new CategoryDto(category.Id, category.Name, category.Description);
    }

    public static ProductDto ToDto(Product product)
    {
        return new ProductDto(
            product.Id,
            product.Name,
            product.Description,
            product.Price.Amount,
            product.Price.Currency,
            product.StockQuantity,
            product.CategoryId);
    }

    public static OrderItemDto ToDto(OrderItem item)
    {
        return new OrderItemDto(
            item.Id,
            item.ProductId,
            item.ProductName,
            item.Quantity,
            item.UnitPrice.Amount,
            item.TotalPrice().Amount);
    }

    public static OrderDto ToDto(Order order)
    {
        var items = order.Items.Select(ToDto).ToList();
        return new OrderDto(
            order.Id,
            order.CustomerName,
            order.CreatedAt,
            items,
            order.TotalAmount().Amount);
    }
}
