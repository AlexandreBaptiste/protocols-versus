using Domain.Common;
using Domain.ValueObjects;

namespace Domain.Entities;

/// <summary>
/// Represents a product in the e-commerce catalog (Aggregate Root).
/// </summary>
public sealed class Product : Entity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public Money Price { get; private set; }
    public int StockQuantity { get; private set; }
    public Guid CategoryId { get; private set; }

    // Parameterless constructor required by EF Core for materialization.
    // EF Core cannot bind owned types (Money) via constructor parameters.
#pragma warning disable CS8618
    private Product() { }
#pragma warning restore CS8618

    private Product(Guid id, string name, string description, Money price, int stockQuantity, Guid categoryId)
        : base(id)
    {
        Name = name;
        Description = description;
        Price = price;
        StockQuantity = stockQuantity;
        CategoryId = categoryId;
    }

    /// <summary>
    /// Creates a new Product.
    /// </summary>
    public static Product Create(string name, string description, Money price, int stockQuantity, Guid categoryId)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Product name is required.", nameof(name));
        }

        if (stockQuantity < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(stockQuantity), "Stock cannot be negative.");
        }

        return new Product(Guid.NewGuid(), name, description ?? string.Empty, price, stockQuantity, categoryId);
    }

    /// <summary>
    /// Reconstitutes a Product from storage.
    /// </summary>
    public static Product Reconstitute(Guid id, string name, string description, Money price, int stockQuantity, Guid categoryId)
    {
        return new Product(id, name, description, price, stockQuantity, categoryId);
    }

    /// <summary>
    /// Reduces stock when an order is placed.
    /// </summary>
    public void ReduceStock(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be positive.");
        }

        if (StockQuantity < quantity)
        {
            throw new InvalidOperationException($"Insufficient stock for product '{Name}'. Available: {StockQuantity}, Requested: {quantity}");
        }

        StockQuantity -= quantity;
    }
}
