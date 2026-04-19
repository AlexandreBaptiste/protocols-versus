using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs;

/// <summary>
/// SignalR hub for real-time catalog updates.
/// Demonstrates WebSocket-based bidirectional communication for live data streaming.
/// </summary>
public sealed class CatalogHub(ICatalogService catalogService, IOrderService orderService) : Hub
{
    /// <summary>
    /// Client requests all products; server pushes them one by one over WebSocket.
    /// Demonstrates real-time streaming without polling.
    /// </summary>
    public async IAsyncEnumerable<ProductDto> StreamProducts(
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var products = await catalogService.GetProductsAsync(take: 50, ct: cancellationToken);

        foreach (var product in products)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                yield break;
            }

            yield return product;
            await Task.Delay(150, cancellationToken); // Simulate staggered real-time delivery
        }
    }

    /// <summary>
    /// Client requests all categories.
    /// </summary>
    public async Task<IReadOnlyList<CategoryDto>> GetCategories()
    {
        return await catalogService.GetCategoriesAsync(Context.ConnectionAborted);
    }

    /// <summary>
    /// Client requests all products (non-streaming).
    /// </summary>
    public async Task<IReadOnlyList<ProductDto>> GetProducts()
    {
        return await catalogService.GetProductsAsync(ct: Context.ConnectionAborted);
    }

    /// <summary>
    /// Client requests all orders.
    /// </summary>
    public async Task<IReadOnlyList<OrderDto>> GetOrders()
    {
        return await orderService.GetOrdersAsync(Context.ConnectionAborted);
    }

    /// <summary>
    /// Client creates an order; all connected clients get notified.
    /// Demonstrates real-time event broadcasting.
    /// </summary>
    public async Task<OrderDto> CreateOrder(CreateOrderRequest request)
    {
        var order = await orderService.CreateOrderAsync(request, Context.ConnectionAborted);

        // Broadcast to all connected clients that a new order was placed
        await Clients.Others.SendAsync("OrderCreated", order, Context.ConnectionAborted);

        return order;
    }

    /// <summary>
    /// Simulates price change notifications pushed to clients.
    /// </summary>
    public async Task SubscribeToPriceUpdates()
    {
        var products = await catalogService.GetProductsAsync(ct: Context.ConnectionAborted);

        for (var i = 0; i < 10; i++)
        {
            if (Context.ConnectionAborted.IsCancellationRequested)
            {
                break;
            }

            var product = products[Random.Shared.Next(products.Count)];
            var priceChange = new
            {
                product.Id,
                product.Name,
                OldPrice = product.Price,
                NewPrice = product.Price * (1 + (decimal)(Random.Shared.NextDouble() * 0.1 - 0.05)),
                Timestamp = DateTime.UtcNow
            };

            await Clients.Caller.SendAsync("PriceUpdate", priceChange, Context.ConnectionAborted);
            await Task.Delay(1000, Context.ConnectionAborted);
        }
    }
}
