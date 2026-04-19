using Domain.Entities;
using Domain.ValueObjects;

namespace Tests.Domain;

public sealed class ProductTests
{
    [Fact(DisplayName = "Create with valid data returns product")]
    public void Create_ValidData_ReturnsProduct()
    {
        var product = Product.Create("Test Product", "Description", Money.Create(29.99m), 100, Guid.NewGuid());

        Assert.Equal("Test Product", product.Name);
        Assert.Equal(29.99m, product.Price.Amount);
        Assert.Equal(100, product.StockQuantity);
    }

    [Fact(DisplayName = "Create with empty name throws")]
    public void Create_EmptyName_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            Product.Create("", "Description", Money.Create(10m), 10, Guid.NewGuid()));
    }

    [Fact(DisplayName = "Create with negative stock throws")]
    public void Create_NegativeStock_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            Product.Create("Test", "Desc", Money.Create(10m), -1, Guid.NewGuid()));
    }

    [Fact(DisplayName = "ReduceStock with valid quantity reduces stock")]
    public void ReduceStock_ValidQuantity_ReducesStock()
    {
        var product = Product.Create("Test", "Desc", Money.Create(10m), 50, Guid.NewGuid());

        product.ReduceStock(10);

        Assert.Equal(40, product.StockQuantity);
    }

    [Fact(DisplayName = "ReduceStock with insufficient stock throws")]
    public void ReduceStock_InsufficientStock_ThrowsInvalidOperationException()
    {
        var product = Product.Create("Test", "Desc", Money.Create(10m), 5, Guid.NewGuid());

        Assert.Throws<InvalidOperationException>(() => product.ReduceStock(10));
    }

    [Fact(DisplayName = "ReduceStock with zero quantity throws")]
    public void ReduceStock_ZeroQuantity_ThrowsArgumentOutOfRangeException()
    {
        var product = Product.Create("Test", "Desc", Money.Create(10m), 10, Guid.NewGuid());

        Assert.Throws<ArgumentOutOfRangeException>(() => product.ReduceStock(0));
    }
}
