namespace Domain.Common;

/// <summary>
/// Base class for all domain entities providing identity equality.
/// </summary>
public abstract class Entity
{
    // private set allows EF Core to materialize the Id via reflection
    public Guid Id { get; private set; }

    protected Entity()
    {
        Id = Guid.NewGuid();
    }

    protected Entity(Guid id)
    {
        Id = id;
    }

    public override bool Equals(object? obj)
    {
        if (obj is not Entity other)
        {
            return false;
        }

        return Id == other.Id;
    }

    public override int GetHashCode() => Id.GetHashCode();
}
