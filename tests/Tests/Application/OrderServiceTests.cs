using Application.DTOs;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Domain.ValueObjects;

namespace Tests.Application;

public sealed class OrderServiceTests
{
    private readonly OrderService _sut;
    private readonly TestProductRepository _productRepo;
    private readonly TestOrderRepository _orderRepo;
    private readonly TestUnitOfWork _unitOfWork;

    public OrderServiceTests()
    {
        _productRepo = new TestProductRepository();
        _orderRepo = new TestOrderRepository();
        _unitOfWork = new TestUnitOfWork();
        _sut = new OrderService(_orderRepo, _productRepo, _unitOfWork);
    }

    [Fact(DisplayName = "CreateOrderAsync with valid request creates order")]
    public async Task CreateOrderAsync_ValidRequest_ReturnsOrder()
    {
        var product = Product.Create("Widget", "A widget", Money.Create(25m), 100, Guid.NewGuid());
        _productRepo.Seed(product);

        var request = new CreateOrderRequest("Alice", [new CreateOrderItemRequest(product.Id, 2)]);

        var result = await _sut.CreateOrderAsync(request);

        Assert.Equal("Alice", result.CustomerName);
        Assert.Single(result.Items);
        Assert.Equal(50m, result.TotalAmount);
        Assert.True(_unitOfWork.SavedChanges);
    }

    [Fact(DisplayName = "CreateOrderAsync reduces product stock")]
    public async Task CreateOrderAsync_ValidRequest_ReducesStock()
    {
        var product = Product.Create("Widget", "A widget", Money.Create(10m), 50, Guid.NewGuid());
        _productRepo.Seed(product);

        var request = new CreateOrderRequest("Bob", [new CreateOrderItemRequest(product.Id, 10)]);

        await _sut.CreateOrderAsync(request);

        Assert.Equal(40, product.StockQuantity);
    }

    [Fact(DisplayName = "CreateOrderAsync with unknown product throws")]
    public async Task CreateOrderAsync_UnknownProduct_ThrowsInvalidOperationException()
    {
        var request = new CreateOrderRequest("Charlie", [new CreateOrderItemRequest(Guid.NewGuid(), 1)]);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateOrderAsync(request));
    }

    [Fact(DisplayName = "CreateOrderAsync with empty items throws")]
    public async Task CreateOrderAsync_EmptyItems_ThrowsArgumentException()
    {
        var request = new CreateOrderRequest("Dave", []);

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CreateOrderAsync(request));
    }

    [Fact(DisplayName = "CreateOrderAsync with non-positive quantity throws")]
    public async Task CreateOrderAsync_NonPositiveQuantity_ThrowsArgumentException()
    {
        var product = Product.Create("Widget", "A widget", Money.Create(10m), 50, Guid.NewGuid());
        _productRepo.Seed(product);

        var request = new CreateOrderRequest("Eve", [new CreateOrderItemRequest(product.Id, 0)]);

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CreateOrderAsync(request));
    }

    [Fact(DisplayName = "CreateOrderAsync with insufficient stock throws")]
    public async Task CreateOrderAsync_InsufficientStock_ThrowsInvalidOperationException()
    {
        var product = Product.Create("Widget", "A widget", Money.Create(10m), 5, Guid.NewGuid());
        _productRepo.Seed(product);

        var request = new CreateOrderRequest("Frank", [new CreateOrderItemRequest(product.Id, 10)]);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateOrderAsync(request));
    }

    [Fact(DisplayName = "GetOrdersAsync returns all orders")]
    public async Task GetOrdersAsync_WithOrders_ReturnsAll()
    {
        var order = Order.Create("Grace");
        order.AddItem(Guid.NewGuid(), "Item", 1, Money.Create(10m));
        _orderRepo.Seed(order);

        var result = await _sut.GetOrdersAsync();

        Assert.Single(result);
        Assert.Equal("Grace", result[0].CustomerName);
    }

    [Fact(DisplayName = "GetOrderByIdAsync with unknown id returns null")]
    public async Task GetOrderByIdAsync_UnknownId_ReturnsNull()
    {
        var result = await _sut.GetOrderByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    private sealed class TestProductRepository : IProductRepository
    {
        private readonly List<Product> _data = [];

        public void Seed(Product product) => _data.Add(product);

        public Task<IReadOnlyList<Product>> GetAllAsync(int? skip = null, int? take = null, CancellationToken ct = default)
        {
            IEnumerable<Product> query = _data;
            if (skip.HasValue) query = query.Skip(skip.Value);
            if (take.HasValue) query = query.Take(take.Value);
            return Task.FromResult<IReadOnlyList<Product>>(query.ToList());
        }

        public Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(_data.FirstOrDefault(p => p.Id == id));

        public Task<IReadOnlyList<Product>> GetByCategoryIdAsync(Guid categoryId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<Product>>(_data.Where(p => p.CategoryId == categoryId).ToList());

        public Task<Product> AddAsync(Product product, CancellationToken ct = default)
        {
            _data.Add(product);
            return Task.FromResult(product);
        }

        public Task<IReadOnlyList<Product>> SearchAsync(string? name, decimal? minPrice, decimal? maxPrice, CancellationToken ct = default)
        {
            var query = _data.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(p => p.Name.Contains(name, StringComparison.OrdinalIgnoreCase));
            if (minPrice.HasValue)
                query = query.Where(p => p.Price.Amount >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(p => p.Price.Amount <= maxPrice.Value);
            return Task.FromResult<IReadOnlyList<Product>>(query.ToList());
        }
    }

    private sealed class TestOrderRepository : IOrderRepository
    {
        private readonly List<Order> _data = [];

        public void Seed(Order order) => _data.Add(order);

        public Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<Order>>(_data);

        public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(_data.FirstOrDefault(o => o.Id == id));

        public Task<Order> AddAsync(Order order, CancellationToken ct = default)
        {
            _data.Add(order);
            return Task.FromResult(order);
        }
    }

    private sealed class TestUnitOfWork : IUnitOfWork
    {
        public bool SavedChanges { get; private set; }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SavedChanges = true;
            return Task.FromResult(1);
        }
    }
}
