using Domain.Entities;
using Domain.ValueObjects;

namespace Infrastructure.Persistence;

/// <summary>
/// Seeds the in-memory database with realistic e-commerce demo data.
/// </summary>
public static class DatabaseSeeder
{
    /// <summary>
    /// Populates the database with categories, products, and sample orders.
    /// </summary>
    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.Categories.Any())
        {
            return;
        }

        var electronics = Category.Reconstitute(Guid.Parse("a1b2c3d4-0001-0000-0000-000000000001"), "Electronics", "Smartphones, laptops, and gadgets");
        var clothing = Category.Reconstitute(Guid.Parse("a1b2c3d4-0002-0000-0000-000000000002"), "Clothing", "Shirts, pants, and accessories");
        var books = Category.Reconstitute(Guid.Parse("a1b2c3d4-0003-0000-0000-000000000003"), "Books", "Fiction, non-fiction, and technical books");
        var home = Category.Reconstitute(Guid.Parse("a1b2c3d4-0004-0000-0000-000000000004"), "Home & Kitchen", "Furniture, appliances, and decor");
        var sports = Category.Reconstitute(Guid.Parse("a1b2c3d4-0005-0000-0000-000000000005"), "Sports & Outdoors", "Equipment, gear, and apparel");

        context.Categories.AddRange(electronics, clothing, books, home, sports);

        var products = new List<Product>
        {
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0001-0000-0000-000000000001"), "Smartphone Pro Max", "Latest flagship smartphone with 6.7\" OLED display", Money.Create(999.99m), 150, electronics.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0002-0000-0000-000000000002"), "Laptop UltraBook 15", "Lightweight 15\" laptop with M3 chip", Money.Create(1499.99m), 75, electronics.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0003-0000-0000-000000000003"), "Wireless Earbuds Elite", "Noise-cancelling bluetooth earbuds", Money.Create(249.99m), 300, electronics.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0004-0000-0000-000000000004"), "4K Monitor 27\"", "Professional-grade 4K IPS display", Money.Create(549.99m), 60, electronics.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0005-0000-0000-000000000005"), "Mechanical Keyboard RGB", "Cherry MX switches with RGB backlight", Money.Create(149.99m), 200, electronics.Id),

            Product.Reconstitute(Guid.Parse("b1b2c3d4-0006-0000-0000-000000000006"), "Classic Oxford Shirt", "Premium cotton formal shirt", Money.Create(79.99m), 400, clothing.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0007-0000-0000-000000000007"), "Slim Fit Jeans", "Stretch denim slim fit jeans", Money.Create(59.99m), 500, clothing.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0008-0000-0000-000000000008"), "Running Sneakers", "Lightweight breathable running shoes", Money.Create(129.99m), 250, clothing.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0009-0000-0000-000000000009"), "Wool Blend Coat", "Warm winter overcoat", Money.Create(299.99m), 80, clothing.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0010-0000-0000-000000000010"), "Leather Belt", "Genuine leather dress belt", Money.Create(39.99m), 600, clothing.Id),

            Product.Reconstitute(Guid.Parse("b1b2c3d4-0011-0000-0000-000000000011"), "Clean Code", "A Handbook of Agile Software Craftsmanship by Robert C. Martin", Money.Create(34.99m), 1000, books.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0012-0000-0000-000000000012"), "Designing Data-Intensive Applications", "The big ideas behind reliable and scalable systems", Money.Create(44.99m), 800, books.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0013-0000-0000-000000000013"), "The Pragmatic Programmer", "Your journey to mastery, 20th Anniversary Edition", Money.Create(39.99m), 700, books.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0014-0000-0000-000000000014"), "Domain-Driven Design", "Tackling complexity in the heart of software by Eric Evans", Money.Create(49.99m), 500, books.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0015-0000-0000-000000000015"), "System Design Interview", "An insider's guide, Volume 2", Money.Create(36.99m), 900, books.Id),

            Product.Reconstitute(Guid.Parse("b1b2c3d4-0016-0000-0000-000000000016"), "Espresso Machine", "Professional barista-quality espresso maker", Money.Create(699.99m), 45, home.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0017-0000-0000-000000000017"), "Standing Desk", "Electric height-adjustable desk 60\"", Money.Create(449.99m), 30, home.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0018-0000-0000-000000000018"), "Air Purifier HEPA", "Room air purifier with HEPA filter", Money.Create(199.99m), 120, home.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0019-0000-0000-000000000019"), "Cast Iron Skillet Set", "3-piece pre-seasoned cast iron set", Money.Create(89.99m), 200, home.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0020-0000-0000-000000000020"), "Smart LED Bulbs (4-pack)", "WiFi-enabled colour changing bulbs", Money.Create(49.99m), 350, home.Id),

            Product.Reconstitute(Guid.Parse("b1b2c3d4-0021-0000-0000-000000000021"), "Yoga Mat Premium", "Non-slip eco-friendly 6mm mat", Money.Create(44.99m), 400, sports.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0022-0000-0000-000000000022"), "Dumbbells Adjustable Set", "5-50 lbs adjustable dumbbell pair", Money.Create(349.99m), 50, sports.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0023-0000-0000-000000000023"), "Camping Tent 4-Person", "Waterproof family camping tent", Money.Create(189.99m), 90, sports.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0024-0000-0000-000000000024"), "Hiking Backpack 40L", "Lightweight trekking backpack", Money.Create(119.99m), 150, sports.Id),
            Product.Reconstitute(Guid.Parse("b1b2c3d4-0025-0000-0000-000000000025"), "Resistance Bands Set", "5 levels exercise band set", Money.Create(24.99m), 700, sports.Id),
        };

        context.Products.AddRange(products);

        // Generate bulk products to reach 100 000 total
        const int totalTarget = 100_000;
        const int namedCount = 25;
        const int bulkCount = totalTarget - namedCount;

        var categoryIds = new[] { electronics.Id, clothing.Id, books.Id, home.Id, sports.Id };
        var categoryNames = new[] { "Electronics", "Clothing", "Books", "Home", "Sports" };
        var rng = new Random(42);

        var bulk = new List<Product>(bulkCount);
        for (int i = 0; i < bulkCount; i++)
        {
            var catIndex = i % 5;
            var price = Math.Round((decimal)(rng.NextDouble() * 990 + 10), 2);
            var stock = rng.Next(10, 1_000);
            bulk.Add(Product.Create(
                $"{categoryNames[catIndex]} Item #{namedCount + i + 1}",
                $"Auto-generated {categoryNames[catIndex].ToLower()} product #{namedCount + i + 1}",
                Money.Create(price),
                stock,
                categoryIds[catIndex]));
        }

        context.Products.AddRange(bulk);

        var order1 = Order.Create("Alice Johnson");
        order1.AddItem(products[0].Id, products[0].Name, 1, products[0].Price);
        order1.AddItem(products[2].Id, products[2].Name, 2, products[2].Price);

        var order2 = Order.Create("Bob Smith");
        order2.AddItem(products[10].Id, products[10].Name, 1, products[10].Price);
        order2.AddItem(products[11].Id, products[11].Name, 1, products[11].Price);
        order2.AddItem(products[12].Id, products[12].Name, 1, products[12].Price);

        var order3 = Order.Create("Charlie Brown");
        order3.AddItem(products[15].Id, products[15].Name, 1, products[15].Price);
        order3.AddItem(products[20].Id, products[20].Name, 2, products[20].Price);

        context.Orders.AddRange(order1, order2, order3);

        await context.SaveChangesAsync();
    }
}
