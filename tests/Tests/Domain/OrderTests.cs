using Domain.Entities;
using Domain.ValueObjects;

namespace Tests.Domain;

public sealed class OrderTests
{
    [Fact(DisplayName = "Create with valid customer name returns order")]
    public void Create_ValidCustomerName_ReturnsOrder()
    {
        var order = Order.Create("John Doe");

        Assert.Equal("John Doe", order.CustomerName);
        Assert.Empty(order.Items);
    }

    [Fact(DisplayName = "Create with empty customer name throws")]
    public void Create_EmptyCustomerName_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => Order.Create(""));
    }

    [Fact(DisplayName = "AddItem adds item to order")]
    public void AddItem_ValidItem_AddsToItemsList()
    {
        var order = Order.Create("Jane Doe");
        var productId = Guid.NewGuid();

        order.AddItem(productId, "Widget", 2, Money.Create(9.99m));

        Assert.Single(order.Items);
        Assert.Equal("Widget", order.Items[0].ProductName);
        Assert.Equal(2, order.Items[0].Quantity);
    }

    [Fact(DisplayName = "TotalAmount returns correct sum")]
    public void TotalAmount_MultipleItems_ReturnsCorrectSum()
    {
        var order = Order.Create("Alice");
        order.AddItem(Guid.NewGuid(), "Item A", 2, Money.Create(10m));
        order.AddItem(Guid.NewGuid(), "Item B", 1, Money.Create(25m));

        var total = order.TotalAmount();

        Assert.Equal(45m, total.Amount);
    }

    [Fact(DisplayName = "TotalAmount with no items returns zero")]
    public void TotalAmount_NoItems_ReturnsZero()
    {
        var order = Order.Create("Bob");

        var total = order.TotalAmount();

        Assert.Equal(0m, total.Amount);
    }
}
