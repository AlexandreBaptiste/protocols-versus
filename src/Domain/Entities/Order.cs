using Domain.Common;
using Domain.ValueObjects;

namespace Domain.Entities;

/// <summary>
/// Represents a customer order (Aggregate Root).
/// </summary>
public sealed class Order : Entity
{
    private readonly List<OrderItem> _items = [];

    public string CustomerName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public IReadOnlyList<OrderItem> Items => _items.AsReadOnly();

    private Order(Guid id, string customerName, DateTime createdAt) : base(id)
    {
        CustomerName = customerName;
        CreatedAt = createdAt;
    }

    /// <summary>
    /// Creates a new Order.
    /// </summary>
    public static Order Create(string customerName)
    {
        if (string.IsNullOrWhiteSpace(customerName))
        {
            throw new ArgumentException("Customer name is required.", nameof(customerName));
        }

        return new Order(Guid.NewGuid(), customerName, DateTime.UtcNow);
    }

    /// <summary>
    /// Reconstitutes an Order from storage.
    /// </summary>
    public static Order Reconstitute(Guid id, string customerName, DateTime createdAt, List<OrderItem> items)
    {
        var order = new Order(id, customerName, createdAt);
        order._items.AddRange(items);
        return order;
    }

    /// <summary>
    /// Adds a line item to the order.
    /// Creates a fresh Money instance to prevent EF Core owned-type tracking conflicts
    /// when the same Money object is referenced by both a Product and an OrderItem.
    /// </summary>
    public void AddItem(Guid productId, string productName, int quantity, Money unitPrice)
    {
        // Create a new Money instance so EF Core doesn't track the same object
        // under both Product.Price and OrderItem.UnitPrice navigation paths
        var price = Money.Create(unitPrice.Amount, unitPrice.Currency);
        var item = OrderItem.Create(productId, productName, quantity, price);
        _items.Add(item);
    }

    /// <summary>
    /// Calculates the total cost of all items.
    /// </summary>
    public Money TotalAmount()
    {
        if (_items.Count == 0)
        {
            return Money.Create(0m);
        }

        return _items
            .Select(i => i.TotalPrice())
            .Aggregate((a, b) => a.Add(b));
    }
}
