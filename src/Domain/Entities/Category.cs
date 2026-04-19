using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Represents a product category in the e-commerce catalog.
/// </summary>
public sealed class Category : Entity
{
    public string Name { get; private set; }
    public string Description { get; private set; }

    private Category(Guid id, string name, string description) : base(id)
    {
        Name = name;
        Description = description;
    }

    /// <summary>
    /// Creates a new Category.
    /// </summary>
    public static Category Create(string name, string description)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Category name is required.", nameof(name));
        }

        return new Category(Guid.NewGuid(), name, description ?? string.Empty);
    }

    /// <summary>
    /// Reconstitutes a Category from storage.
    /// </summary>
    public static Category Reconstitute(Guid id, string name, string description)
    {
        return new Category(id, name, description);
    }
}
