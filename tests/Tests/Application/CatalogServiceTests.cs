using Application.DTOs;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Domain.ValueObjects;

namespace Tests.Application;

public sealed class CatalogServiceTests
{
    private readonly ICatalogService _sut;
    private readonly TestProductRepository _productRepo;
    private readonly TestCategoryRepository _categoryRepo;

    public CatalogServiceTests()
    {
        _categoryRepo = new TestCategoryRepository();
        _productRepo = new TestProductRepository();
        _sut = new CatalogService(_categoryRepo, _productRepo);
    }

    [Fact(DisplayName = "GetProductsAsync returns all products as DTOs")]
    public async Task GetProductsAsync_ReturnsAllProducts()
    {
        var category = Category.Create("Electronics", "Gadgets");
        _categoryRepo.Seed(category);
        _productRepo.Seed(Product.Create("Phone", "Smartphone", Money.Create(999m), 10, category.Id));
        _productRepo.Seed(Product.Create("Laptop", "Notebook", Money.Create(1499m), 5, category.Id));

        var result = await _sut.GetProductsAsync();

        Assert.Equal(2, result.Count);
    }

    [Fact(DisplayName = "GetProductByIdAsync returns null for non-existent product")]
    public async Task GetProductByIdAsync_NonExistent_ReturnsNull()
    {
        var result = await _sut.GetProductByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact(DisplayName = "SearchProductsAsync filters by name")]
    public async Task SearchProductsAsync_ByName_FiltersCorrectly()
    {
        var catId = Guid.NewGuid();
        _productRepo.Seed(Product.Create("Phone Pro", "Flagship", Money.Create(999m), 10, catId));
        _productRepo.Seed(Product.Create("Laptop Ultra", "Notebook", Money.Create(1499m), 5, catId));

        var result = await _sut.SearchProductsAsync(new ProductSearchRequest("Phone", null, null));

        Assert.Single(result);
        Assert.Equal("Phone Pro", result[0].Name);
    }

    /// <summary>
    /// Simple in-memory test double for ICategoryRepository.
    /// </summary>
    private sealed class TestCategoryRepository : ICategoryRepository
    {
        private readonly List<Category> _data = [];

        public void Seed(Category category) => _data.Add(category);

        public Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<Category>>(_data);

        public Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(_data.FirstOrDefault(c => c.Id == id));

        public Task<Category> AddAsync(Category category, CancellationToken ct = default)
        {
            _data.Add(category);
            return Task.FromResult(category);
        }
    }

    /// <summary>
    /// Simple in-memory test double for IProductRepository.
    /// </summary>
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
}
