using Domain.ValueObjects;

namespace Tests.Domain;

public sealed class MoneyTests
{
    [Fact(DisplayName = "Create with valid amount returns Money")]
    public void Create_ValidAmount_ReturnsMoney()
    {
        var money = Money.Create(10.50m, "USD");

        Assert.Equal(10.50m, money.Amount);
        Assert.Equal("USD", money.Currency);
    }

    [Fact(DisplayName = "Create with negative amount throws")]
    public void Create_NegativeAmount_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => Money.Create(-1m));
    }

    [Fact(DisplayName = "Create with empty currency throws")]
    public void Create_EmptyCurrency_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => Money.Create(10m, ""));
    }

    [Fact(DisplayName = "Add same currency returns sum")]
    public void Add_SameCurrency_ReturnsSum()
    {
        var a = Money.Create(10m);
        var b = Money.Create(20m);

        var result = a.Add(b);

        Assert.Equal(30m, result.Amount);
    }

    [Fact(DisplayName = "Add different currency throws")]
    public void Add_DifferentCurrency_ThrowsInvalidOperationException()
    {
        var usd = Money.Create(10m, "USD");
        var eur = Money.Create(10m, "EUR");

        Assert.Throws<InvalidOperationException>(() => usd.Add(eur));
    }

    [Fact(DisplayName = "Multiply by quantity returns product")]
    public void Multiply_ByQuantity_ReturnsCorrectAmount()
    {
        var money = Money.Create(25m);

        var result = money.Multiply(3);

        Assert.Equal(75m, result.Amount);
    }
}
