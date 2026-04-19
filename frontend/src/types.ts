export interface CategoryDto {
  id: string;
  name: string;
  description: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stockQuantity: number;
  categoryId: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  customerName: string;
  createdAt: string;
  items: OrderItemDto[];
  totalAmount: number;
}

export interface ProtocolBenchmarkDto {
  protocol: string;
  averageLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  medianLatencyMs: number;
  payloadSizeBytes: number;
  estimatedThroughputPerSecond: number;
}

export interface BenchmarkResultDto {
  iterations: number;
  timestamp: string;
  results: ProtocolBenchmarkDto[];
}

export type ProtocolName = 'REST' | 'gRPC' | 'GraphQL' | 'SignalR';

export interface ProtocolInfo {
  name: ProtocolName;
  color: string;
  description: string;
  philosophy: string;
  howItWorks: string;
  codeExample: string;
  realWorldAdoption: string[];
  bestFor: string[];
  limitations: string[];
  securityNotes: string[];
  dataFormat: string;
  transport: string;
}
