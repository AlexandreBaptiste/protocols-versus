namespace Domain.ValueObjects;

/// <summary>
/// Represents a monetary amount with currency.
/// </summary>
public sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    /// <summary>
    /// Creates a new Money value object.
    /// </summary>
    public static Money Create(decimal amount, string currency = "USD")
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount cannot be negative.");
        }

        if (string.IsNullOrWhiteSpace(currency))
        {
            throw new ArgumentException("Currency is required.", nameof(currency));
        }

        return new Money(amount, currency.ToUpperInvariant());
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
        {
            throw new InvalidOperationException("Cannot add money with different currencies.");
        }

        return Create(Amount + other.Amount, Currency);
    }

    public Money Multiply(int quantity)
    {
        return Create(Amount * quantity, Currency);
    }

    public override string ToString() => $"{Amount:F2} {Currency}";
}
