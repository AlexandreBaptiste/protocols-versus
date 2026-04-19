namespace Application.DTOs;

/// <summary>
/// Data transfer object for Category.
/// </summary>
public sealed record CategoryDto(Guid Id, string Name, string Description);

/// <summary>
/// Data transfer object for Product.
/// </summary>
public sealed record ProductDto(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    string Currency,
    int StockQuantity,
    Guid CategoryId);

/// <summary>
/// Data transfer object for OrderItem.
/// </summary>
public sealed record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice);

/// <summary>
/// Data transfer object for Order.
/// </summary>
public sealed record OrderDto(
    Guid Id,
    string CustomerName,
    DateTime CreatedAt,
    List<OrderItemDto> Items,
    decimal TotalAmount);

/// <summary>
/// Request to create a new order.
/// </summary>
public sealed record CreateOrderRequest(string CustomerName, List<CreateOrderItemRequest> Items);

/// <summary>
/// Request to add an item to an order.
/// </summary>
public sealed record CreateOrderItemRequest(Guid ProductId, int Quantity);

/// <summary>
/// Request to search products with filters.
/// </summary>
public sealed record ProductSearchRequest(string? Name, decimal? MinPrice, decimal? MaxPrice);
