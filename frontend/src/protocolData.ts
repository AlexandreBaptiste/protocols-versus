import type { ProtocolInfo, ProtocolName } from './types';

/** Canonical protocol color map — import this instead of duplicating colors */
export const PROTOCOL_COLORS: Record<string, string> = {
  REST: '#3b82f6',
  GraphQL: '#e11d48',
  gRPC: '#10b981',
  SignalR: '#f59e0b',
} as const;

export function getProtocolColor(name: ProtocolName | string): string {
  return PROTOCOL_COLORS[name] ?? '#6b7280';
}

export const protocols: ProtocolInfo[] = [
  {
    name: 'REST',
    color: '#3b82f6',
    description:
      'Representational State Transfer (REST) is an architectural style for distributed hypermedia systems, first defined by Roy Fielding in his 2000 doctoral dissertation. It uses standard HTTP methods (GET, POST, PUT, PATCH, DELETE) to perform operations on resources identified by URIs. REST is not a protocol itself but a set of architectural constraints that, when followed, produce scalable and loosely-coupled systems.',
    philosophy:
      'Resource-oriented: every piece of data is a resource with a unique URI. Communication is stateless — each request carries all the information needed for the server to process it. REST defines six architectural constraints: client-server separation, statelessness, cacheability, uniform interface, layered system, and optional code-on-demand. HATEOAS (Hypermedia As The Engine Of Application State) is technically required for a "truly RESTful" API, though in practice most APIs implement a pragmatic subset often called "REST-like" or "HTTP APIs."',
    howItWorks:
      'The client sends an HTTP request to a resource URL (e.g. GET /api/products/42). The server processes the request, interacts with its data store, and returns an HTTP response with a status code (200 OK, 404 Not Found, etc.) and typically a JSON body. Each request is independent — the server holds no session state between calls. Responses can include caching headers (ETag, Cache-Control) enabling clients and intermediaries to cache results and reduce redundant network traffic.',
    codeExample:
`// GET request
fetch('/api/products?limit=10')
  .then(res => res.json())
  .then(products => console.log(products));

// POST request
fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'Alice',
    items: [{ productId: '...', quantity: 2 }]
  })
});`,
    realWorldAdoption: [
      'GitHub API — one of the most well-known public REST APIs',
      'Stripe — payment processing with resource-oriented design',
      'Twitter/X API v2 — migrated from v1 REST to v2 REST with cleaner resource modeling',
      'Shopify, Twilio, Slack — all expose primary APIs via REST',
    ],
    bestFor: [
      'CRUD operations on well-defined resources',
      'Public APIs that need broad client support (browsers, mobile, CLI)',
      'Cacheable read-heavy workloads (leverages HTTP caching natively)',
      'Simple request/response patterns with well-understood semantics',
      'APIs where discoverability and documentation matter (OpenAPI/Swagger)',
    ],
    limitations: [
      'Over-fetching: always returns the full resource representation, even when the client needs only a few fields',
      'Under-fetching: related data often requires multiple round trips (e.g. /orders then /orders/1/items)',
      'No built-in real-time or streaming support — requires polling or a separate WebSocket layer',
      'No standard for API versioning — teams must choose between URL-based (/v2/), header-based, or query param approaches',
      'Error response formats vary widely across implementations (RFC 9457 ProblemDetails helps but adoption is gradual)',
    ],
    securityNotes: [
      'Typically secured with OAuth 2.0 Bearer tokens or API keys in headers',
      'Supports standard HTTP security headers (CORS, CSP, HSTS)',
      'Rate limiting is straightforward since each request is independent',
      'Sensitive data can leak in URL query parameters — prefer POST/body for secrets',
    ],
    dataFormat: 'JSON (text-based)',
    transport: 'HTTP/1.1 or HTTP/2',
  },
  {
    name: 'gRPC',
    color: '#10b981',
    description:
      'gRPC (gRPC Remote Procedure Call) is a high-performance, open-source RPC framework originally developed at Google and open-sourced in 2015. It uses Protocol Buffers (protobuf) as its interface definition language and binary serialization format, and HTTP/2 as its transport layer. This combination enables compact payloads, multiplexed streams, and efficient binary communication between services.',
    philosophy:
      'Contract-first: a .proto file defines the entire API surface — services, methods, and message shapes. Both client and server code are auto-generated from this contract, enforcing strong typing across language boundaries. gRPC supports four communication patterns: Unary (single request → single response), Server Streaming (single request → stream of responses), Client Streaming (stream of requests → single response), and Bidirectional Streaming (two interleaved streams). This makes it far more flexible than simple request-response protocols.',
    howItWorks:
      'The developer writes a .proto file defining services and messages. A protoc compiler generates client stubs and server base classes in the target language. At runtime, the client calls a method on the stub as if it were a local function. The stub serializes the request into compact protobuf binary, frames it with a 5-byte gRPC header, and sends it over an HTTP/2 connection. The server deserializes, executes the handler, and returns a protobuf response. HTTP/2 multiplexing allows many concurrent RPCs over a single TCP connection, eliminating the head-of-line blocking found in HTTP/1.1.',
    codeExample:
`// catalog.proto
service CatalogGrpcService {
  rpc GetProducts (GetProductsRequest)
    returns (GetProductsReply);
  rpc StreamProducts (StreamProductsRequest)
    returns (stream ProductReply);
}

// C# server implementation
public override async Task<GetProductsReply> GetProducts(
    GetProductsRequest request,
    ServerCallContext context)
{
    var products = await catalogService
      .GetProductsAsync(ct: context.CancellationToken);
    var reply = new GetProductsReply();
    reply.Products.AddRange(products.Select(MapProduct));
    return reply;
}`,
    realWorldAdoption: [
      'Google Cloud APIs — nearly all Google Cloud services use gRPC',
      'Netflix — adopted gRPC for inter-service communication',
      'Dropbox — migrated from legacy RPC to gRPC for its microservices',
      'Square (Block) — uses gRPC for internal service mesh',
      'Kubernetes — etcd and many internal components communicate via gRPC',
    ],
    bestFor: [
      'Microservice-to-microservice communication (east-west traffic)',
      'Low-latency, high-throughput scenarios where binary efficiency matters',
      'Streaming use cases — server push, client upload streams, or real-time bidirectional channels',
      'Polyglot environments — auto-generate clients in Go, Java, C#, Python, Rust, etc. from one .proto',
      'Mobile and IoT where bandwidth is constrained and payloads must be compact',
    ],
    limitations: [
      'Not natively supported in browsers — requires gRPC-Web proxy layer that doesn\'t support client or bidi streaming',
      'Proto files require compilation tooling (protoc) and a build step; not as "pick up and call" as REST',
      'Binary payloads are not human-readable — harder to debug with curl or browser DevTools',
      'Load balancing is trickier — persistent HTTP/2 connections can cause uneven distribution without L7/service mesh awareness',
      'Breaking .proto changes (renaming fields, changing types) require careful backwards-compatibility planning',
    ],
    securityNotes: [
      'Uses TLS (mTLS is common in service meshes) for encrypted transport',
      'Authentication typically via metadata headers — supports token-based, certificate-based, or custom auth interceptors',
      'Request/response size limits configurable to prevent resource exhaustion',
      'Binary payloads are harder to inspect at network gateways — ensure proper logging at the application layer',
    ],
    dataFormat: 'Protocol Buffers (binary)',
    transport: 'HTTP/2',
  },
  {
    name: 'GraphQL',
    color: '#e11d48',
    description:
      'GraphQL is a query language and specification for APIs, originally developed internally at Facebook (Meta) in 2012 and open-sourced in 2015. It is not tied to any specific transport or database — the specification defines a type system, a query language, and execution semantics. Clients describe the exact shape of the data they need, and the server returns precisely that — no over-fetching, no under-fetching.',
    philosophy:
      'Client-driven and schema-first: the server publishes a strongly-typed schema that describes all available types, queries, mutations (writes), and subscriptions (real-time). Clients send queries specifying fields, nesting, arguments, and aliases. A single POST to /graphql replaces dozens of REST endpoints. The schema is introspectable — tools like GraphiQL and Apollo Studio can auto-discover the full API surface without external documentation. This inverts the traditional model: the frontend drives data requirements, and the backend fulfils them.',
    howItWorks:
      'The client sends an HTTP POST to /graphql with a JSON body containing a query string and optional variables. The server parses the query, validates it against the schema, and resolves each field by calling resolver functions. Resolvers can fetch data from databases, microservices, or any other source. The server assembles the exact requested shape and returns a JSON response with a "data" key. Because the client declares what it needs, a mobile app can request {id, name, price} while a dashboard requests the full object — from the same endpoint.',
    codeExample:
`// Query with variables (avoids string interpolation)
const query = \`
  query GetProducts($limit: Int) {
    products(limit: $limit) {
      id
      name
      price
    }
  }
\`;

fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
    variables: { limit: 10 }
  }),
});`,
    realWorldAdoption: [
      'Meta (Facebook, Instagram) — GraphQL powers their mobile and web apps',
      'GitHub API v4 — one of the most prominent public GraphQL APIs',
      'Shopify Storefront API — merchants use GraphQL for custom storefronts',
      'Airbnb, Pinterest, Twitter — adopted GraphQL for frontend flexibility',
      'The New York Times — uses GraphQL to aggregate content from multiple backends',
    ],
    bestFor: [
      'Complex, nested data relationships that would require many REST round trips',
      'Mobile apps where bandwidth is limited and field-level precision matters',
      'Aggregating data from multiple backend services into a single response (BFF pattern)',
      'Rapid frontend iteration — add new fields to queries without backend deployments',
      'API exploration — schema introspection enables powerful developer tooling',
    ],
    limitations: [
      'HTTP caching is complex — all requests are POST to a single endpoint, so standard GET caching doesn\'t apply without persisted queries or GET-based reads',
      'N+1 query problem: naive resolvers fetch related data one record at a time unless DataLoader-style batching is implemented',
      'Query complexity is hard to predict — malicious or careless clients can request deeply nested queries that exhaust server resources',
      'File uploads are not covered by the spec — workarounds like multipart-formdata extensions or separate REST endpoints are needed',
      'Subscriptions (real-time) require a separate transport (WebSocket or SSE) which adds deployment complexity',
    ],
    securityNotes: [
      'Must implement query depth limiting and cost analysis to prevent denial-of-service via expensive queries',
      'Introspection should be disabled in production to avoid exposing the full schema to attackers',
      'Field-level authorization is critical — just because a field exists in the schema doesn\'t mean every user should access it',
      'Use persisted queries in production to ensure only pre-approved operations can be executed',
    ],
    dataFormat: 'JSON (text-based)',
    transport: 'HTTP POST (single endpoint)',
  },
  {
    name: 'SignalR',
    color: '#f59e0b',
    description:
      'SignalR is a Microsoft library for ASP.NET that provides an abstraction over real-time, bidirectional communication between server and connected clients. It uses WebSockets as the primary transport and automatically falls back to Server-Sent Events (SSE) or long-polling when WebSockets aren\'t available. Unlike raw WebSockets, SignalR handles connection management, automatic reconnection, and group broadcasting out of the box.',
    philosophy:
      'Event-driven, push-based: instead of the client polling for updates, the server pushes data to clients the instant it becomes available. SignalR uses a "Hub" programming model — a Hub is a high-level pipeline that allows the server to call methods on connected clients (and vice versa) as if they were local function calls. Clients can be organized into groups for targeted broadcasting (e.g. all users viewing a specific dashboard). The transport is abstracted — your code works identically whether the underlying connection is WebSocket, SSE, or long-polling.',
    howItWorks:
      'The client library (JavaScript, .NET, Java) initiates a negotiation request to discover the best available transport. If WebSockets are supported, a persistent bidirectional connection is established. The client can then invoke Hub methods on the server ("invoke" pattern), and the server can push messages to individual clients, groups, or all connected users. SignalR also supports streaming — the server can yield items one at a time via IAsyncEnumerable, and the client receives them as they arrive. For horizontal scaling, a backplane (Redis, Azure SignalR Service, or SQL Server) synchronizes messages across multiple server instances.',
    codeExample:
`// Client: connect and receive events
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hub/catalog')
  .withAutomaticReconnect()
  .build();

await connection.start();

// Invoke a server method
const orders = await connection.invoke('GetOrders');

// Subscribe to server-pushed events
connection.on('OrderCreated', (order) => {
  console.log('New order:', order);
});

// Stream products one by one
connection.stream('StreamProducts')
  .subscribe({
    next: (product) => console.log(product),
    complete: () => console.log('Stream ended'),
  });`,
    realWorldAdoption: [
      'Microsoft Teams — real-time messaging and presence indicators',
      'Stack Overflow — live question updates and notifications',
      'Visual Studio Live Share — collaborative editing sessions',
      'Azure DevOps — pipeline status and live log streaming',
      'DocuSign — real-time envelope status tracking',
    ],
    bestFor: [
      'Real-time dashboards, notifications, and live activity feeds',
      'Chat applications with typing indicators, read receipts, and presence',
      'Collaborative editing — shared documents, whiteboards, design tools',
      'Live streaming of data changes — stock tickers, sports scores, IoT sensor data',
      'Any scenario where the server needs to initiate communication (push model)',
    ],
    limitations: [
      'Stateful connections consume server memory and file descriptors — each connected client holds a persistent connection',
      'Horizontal scaling requires a backplane (Redis, Azure SignalR Service) to synchronize messages across server instances',
      'Not ideal for simple request/response patterns — the overhead of maintaining a connection isn\'t justified for one-off queries',
      'WebSocket support varies across corporate proxies, load balancers, and older infrastructure — SSE/long-polling fallbacks are slower',
      'No offline support — if the connection drops and reconnection fails, events during the outage are lost (no message queue)',
    ],
    securityNotes: [
      'Authentication is handled during the initial HTTP negotiation — JWT tokens or cookies are validated before the WebSocket is upgraded',
      'Authorization can be applied per Hub method or per group for fine-grained access control',
      'Connection tokens prevent a user from hijacking another user\'s connection',
      'Consider message size limits and rate limiting to prevent abuse from persistent connections',
    ],
    dataFormat: 'JSON or MessagePack (binary)',
    transport: 'WebSocket (with SSE / long-polling fallback)',
  },
];
