/**
 * gRPC-Web client for CatalogGrpcService.
 *
 * Implements the gRPC-Web binary framing protocol directly using protobufjs for
 * message encoding/decoding. No protoc code generation required.
 *
 * gRPC-Web wire format:
 *   Request  → HTTP POST /{service}/{method}
 *              Content-Type: application/grpc-web+proto
 *              Body: [1-byte compressed flag (0)] + [4-byte big-endian length] + [proto bytes]
 *   Response → same 5-byte frame prefix per message, then a trailing-metadata frame
 *              (flag 0x80) which we skip.
 */

import protobuf from 'protobufjs';

// ---------------------------------------------------------------------------
// Proto schema — mirrors catalog.proto without needing codegen
// ---------------------------------------------------------------------------
const root = protobuf.Root.fromJSON({
  nested: {
    catalog: {
      nested: {
        GetProductsRequest: {
          fields: {
            limit: { type: 'int32', id: 1 },
          },
        },
        GetProductsReply: {
          fields: {
            products: { rule: 'repeated', type: 'ProductReply', id: 1 },
          },
        },
        ProductReply: {
          fields: {
            id:            { type: 'string', id: 1 },
            name:          { type: 'string', id: 2 },
            description:   { type: 'string', id: 3 },
            price:         { type: 'double', id: 4 },
            currency:      { type: 'string', id: 5 },
            stockQuantity: { type: 'int32',  id: 6 },
            categoryId:    { type: 'string', id: 7 },
          },
        },
      },
    },
  },
});

const GetProductsRequest = root.lookupType('catalog.GetProductsRequest');
const GetProductsReply   = root.lookupType('catalog.GetProductsReply');

// ---------------------------------------------------------------------------
// gRPC-Web framing helpers
// ---------------------------------------------------------------------------

/** Wrap a protobuf payload in a gRPC-Web 5-byte length-prefixed frame. */
function encodeGrpcFrame(payload: Uint8Array): Uint8Array {
  const frame = new Uint8Array(5 + payload.length);
  frame[0] = 0; // compression flag: 0 = not compressed
  const view = new DataView(frame.buffer);
  view.setUint32(1, payload.length, false); // big-endian message length
  frame.set(payload, 5);
  return frame;
}

/**
 * Parse all DATA frames from a gRPC-Web response body.
 * Skips trailer frames (flag bit 0x80).
 */
function decodeGrpcFrames(buffer: ArrayBuffer): Uint8Array[] {
  const view = new DataView(buffer);
  const messages: Uint8Array[] = [];
  let offset = 0;

  while (offset + 5 <= buffer.byteLength) {
    const flags = view.getUint8(offset);
    const length = view.getUint32(offset + 1, false); // big-endian
    offset += 5;

    if (offset + length > buffer.byteLength) break;

    const isTrailer = (flags & 0x80) !== 0;
    if (!isTrailer) {
      messages.push(new Uint8Array(buffer, offset, length));
    }
    offset += length;
  }

  return messages;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GrpcProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stockQuantity: number;
  categoryId: string;
}

export interface GrpcFetchResult {
  products: GrpcProduct[];
  latencyMs: number;
  payloadBytes: number;
}

export interface GrpcMultiResult {
  products: GrpcProduct[];
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  payloadBytes: number;
}

/**
 * Calls CatalogGrpcService.GetProducts via the gRPC-Web binary protocol.
 * Returns the decoded products along with measured latency and raw payload size.
 */
export async function fetchProductsGrpcWeb(limit = 100): Promise<GrpcFetchResult> {
  const requestPayload = GetProductsRequest.encode(
    GetProductsRequest.create({ limit }),
  ).finish();

  const body = encodeGrpcFrame(requestPayload) as unknown as BodyInit;

  const start = performance.now();

  const response = await fetch('/catalog.CatalogGrpcService/GetProducts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/grpc-web+proto',
      'X-Grpc-Web': '1',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`gRPC-Web request failed: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const latencyMs = Math.round((performance.now() - start) * 100) / 100;
  const payloadBytes = buffer.byteLength;

  const frames = decodeGrpcFrames(buffer);
  if (frames.length === 0) {
    throw new Error('gRPC-Web: no data frames in response');
  }

  const reply = GetProductsReply.decode(frames[0]) as unknown as {
    products: GrpcProduct[];
  };

  return { products: reply.products ?? [], latencyMs, payloadBytes };
}

/**
 * Runs fetchProductsGrpcWeb `iterations` times and returns averaged latency metrics.
 */
export async function fetchProductsGrpcWebMultiple(
  limit = 100,
  iterations = 5,
): Promise<GrpcMultiResult> {
  const latencies: number[] = [];
  let payloadBytes = 0;
  let products: GrpcProduct[] = [];

  for (let i = 0; i < iterations; i++) {
    const result = await fetchProductsGrpcWeb(limit);
    latencies.push(result.latencyMs);
    payloadBytes = result.payloadBytes;
    products = result.products;
  }

  const avgLatencyMs = Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 100) / 100;
  const minLatencyMs = Math.round(Math.min(...latencies) * 100) / 100;
  const maxLatencyMs = Math.round(Math.max(...latencies) * 100) / 100;

  return { products, avgLatencyMs, minLatencyMs, maxLatencyMs, payloadBytes };
}
