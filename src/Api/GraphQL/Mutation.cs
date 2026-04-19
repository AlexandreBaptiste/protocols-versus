using Application.DTOs;
using Application.Services;

namespace Api.GraphQL;

/// <summary>
/// GraphQL mutation resolvers.
/// Demonstrates how GraphQL handles write operations.
/// </summary>
public sealed class Mutation
{
    /// <summary>
    /// Creates a new order.
    /// </summary>
    [GraphQLDescription("Creates a new order. Returns the complete order with computed totals.")]
    public async Task<OrderDto> CreateOrder(
        CreateOrderInput input,
        [Service] IOrderService service,
        CancellationToken ct)
    {
        var request = new CreateOrderRequest(
            input.CustomerName,
            input.Items.Select(i => new CreateOrderItemRequest(i.ProductId, i.Quantity)).ToList());

        return await service.CreateOrderAsync(request, ct);
    }
}

/// <summary>
/// Input type for creating an order via GraphQL.
/// </summary>
public sealed record CreateOrderInput(string CustomerName, List<CreateOrderItemInput> Items);

/// <summary>
/// Input type for an order item in GraphQL mutations.
/// </summary>
public sealed record CreateOrderItemInput(Guid ProductId, int Quantity);
