using Application.DTOs;
using Application.Services;
using Grpc.Core;

namespace Api.Grpc;

/// <summary>
/// gRPC service implementation for catalog operations.
/// Demonstrates binary protocol efficiency with strongly-typed contracts.
/// </summary>
public sealed class CatalogGrpcServiceImpl(ICatalogService catalogService, IOrderService orderService)
    : CatalogGrpcService.CatalogGrpcServiceBase
{
    public override async Task<GetCategoriesReply> GetCategories(GetCategoriesRequest request, ServerCallContext context)
    {
        var categories = await catalogService.GetCategoriesAsync(context.CancellationToken);
        var reply = new GetCategoriesReply();
        reply.Categories.AddRange(categories.Select(MapCategory));
        return reply;
    }

    public override async Task<CategoryReply> GetCategory(GetCategoryRequest request, ServerCallContext context)
    {
        if (!Guid.TryParse(request.Id, out var id))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, $"Invalid GUID format: '{request.Id}'."));
        }

        var category = await catalogService.GetCategoryByIdAsync(id, context.CancellationToken);
        if (category is null)
        {
            throw new RpcException(new Status(StatusCode.NotFound, $"Category '{request.Id}' not found."));
        }

        return MapCategory(category);
    }

    public override async Task<GetProductsReply> GetProducts(GetProductsRequest request, ServerCallContext context)
    {
        var take = request.Limit > 0 ? request.Limit : (int?)null;
        var products = await catalogService.GetProductsAsync(take: take, ct: context.CancellationToken);
        var reply = new GetProductsReply();
        reply.Products.AddRange(products.Select(MapProduct));
        return reply;
    }

    public override async Task<ProductReply> GetProduct(GetProductRequest request, ServerCallContext context)
    {
        if (!Guid.TryParse(request.Id, out var id))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, $"Invalid GUID format: '{request.Id}'."));
        }

        var product = await catalogService.GetProductByIdAsync(id, context.CancellationToken);
        if (product is null)
        {
            throw new RpcException(new Status(StatusCode.NotFound, $"Product '{request.Id}' not found."));
        }

        return MapProduct(product);
    }

    public override async Task<GetProductsReply> SearchProducts(SearchProductsRequest request, ServerCallContext context)
    {
        var searchRequest = new ProductSearchRequest(
            string.IsNullOrEmpty(request.Name) ? null : request.Name,
            request.MinPrice > 0 ? (decimal)request.MinPrice : null,
            request.MaxPrice > 0 ? (decimal)request.MaxPrice : null);

        var products = await catalogService.SearchProductsAsync(searchRequest, context.CancellationToken);
        var reply = new GetProductsReply();
        reply.Products.AddRange(products.Select(MapProduct));
        return reply;
    }

    public override async Task<GetOrdersReply> GetOrders(GetOrdersRequest request, ServerCallContext context)
    {
        var orders = await orderService.GetOrdersAsync(context.CancellationToken);
        var reply = new GetOrdersReply();
        reply.Orders.AddRange(orders.Select(MapOrder));
        return reply;
    }

    public override async Task<OrderReply> GetOrder(GetOrderRequest request, ServerCallContext context)
    {
        if (!Guid.TryParse(request.Id, out var id))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, $"Invalid GUID format: '{request.Id}'."));
        }

        var order = await orderService.GetOrderByIdAsync(id, context.CancellationToken);
        if (order is null)
        {
            throw new RpcException(new Status(StatusCode.NotFound, $"Order '{request.Id}' not found."));
        }

        return MapOrder(order);
    }

    public override async Task<OrderReply> CreateOrder(CreateOrderRequest request, ServerCallContext context)
    {
        foreach (var item in request.Items)
        {
            if (!Guid.TryParse(item.ProductId, out _))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, $"Invalid GUID format for product: '{item.ProductId}'."));
            }
        }

        var createRequest = new Application.DTOs.CreateOrderRequest(
            request.CustomerName,
            request.Items.Select(i => new Application.DTOs.CreateOrderItemRequest(Guid.Parse(i.ProductId), i.Quantity)).ToList());

        var order = await orderService.CreateOrderAsync(createRequest, context.CancellationToken);
        return MapOrder(order);
    }

    /// <summary>
    /// Server-streaming RPC: streams all products one by one.
    /// Demonstrates gRPC's streaming capability.
    /// </summary>
    public override async Task StreamProducts(StreamProductsRequest request, IServerStreamWriter<ProductReply> responseStream, ServerCallContext context)
    {
        var products = await catalogService.GetProductsAsync(take: 100, ct: context.CancellationToken);

        foreach (var product in products)
        {
            if (context.CancellationToken.IsCancellationRequested)
            {
                break;
            }

            await responseStream.WriteAsync(MapProduct(product));
            await Task.Delay(100, context.CancellationToken); // Simulate staggered delivery
        }
    }

    private static CategoryReply MapCategory(CategoryDto dto) => new()
    {
        Id = dto.Id.ToString(),
        Name = dto.Name,
        Description = dto.Description
    };

    private static ProductReply MapProduct(ProductDto dto) => new()
    {
        Id = dto.Id.ToString(),
        Name = dto.Name,
        Description = dto.Description,
        Price = (double)dto.Price,
        Currency = dto.Currency,
        StockQuantity = dto.StockQuantity,
        CategoryId = dto.CategoryId.ToString()
    };

    private static OrderReply MapOrder(OrderDto dto)
    {
        var reply = new OrderReply
        {
            Id = dto.Id.ToString(),
            CustomerName = dto.CustomerName,
            CreatedAt = dto.CreatedAt.ToString("O"),
            TotalAmount = (double)dto.TotalAmount
        };
        reply.Items.AddRange(dto.Items.Select(MapOrderItem));
        return reply;
    }

    private static OrderItemReply MapOrderItem(OrderItemDto dto) => new()
    {
        Id = dto.Id.ToString(),
        ProductId = dto.ProductId.ToString(),
        ProductName = dto.ProductName,
        Quantity = dto.Quantity,
        UnitPrice = (double)dto.UnitPrice,
        TotalPrice = (double)dto.TotalPrice
    };
}
