using Domain.Common;
using Domain.ValueObjects;

namespace Domain.Entities;

/// <summary>
/// Represents a line item within an Order.
/// </summary>
public sealed class OrderItem : Entity
{
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; }
    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; }

    // Parameterless constructor required by EF Core for materialization.
    // EF Core cannot bind owned types (Money) via constructor parameters.
#pragma warning disable CS8618
    private OrderItem() { }
#pragma warning restore CS8618

    private OrderItem(Guid id, Guid productId, string productName, int quantity, Money unitPrice) : base(id)
    {
        ProductId = productId;
        ProductName = productName;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }

    /// <summary>
    /// Creates a new OrderItem.
    /// </summary>
    public static OrderItem Create(Guid productId, string productName, int quantity, Money unitPrice)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be positive.");
        }

        return new OrderItem(Guid.NewGuid(), productId, productName, quantity, unitPrice);
    }

    /// <summary>
    /// Calculates the total price for this line item.
    /// </summary>
    public Money TotalPrice() => UnitPrice.Multiply(Quantity);
}
