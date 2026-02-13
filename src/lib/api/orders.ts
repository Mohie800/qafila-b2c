import apiClient from "./client";
import type {
  CheckoutDto,
  MockPaymentDto,
  OrderResponse,
} from "@/types/order";


export async function checkout(dto: CheckoutDto): Promise<OrderResponse> {
  return apiClient.post("/orders/checkout", dto);
}

export async function mockPayment(
  orderId: string,
  dto: MockPaymentDto,
): Promise<OrderResponse> {
  return apiClient.post(`/orders/${orderId}/mock-payment`, dto);
}

export interface OrdersListResponse {
  data: OrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getMyOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}): Promise<OrdersListResponse> {
  return apiClient.get("/orders", { params });
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
  return apiClient.get(`/orders/${orderId}`);
}

export async function cancelOrder(
  orderId: string,
  reason: string,
  details?: string,
): Promise<OrderResponse> {
  return apiClient.put(`/orders/${orderId}/cancel`, { reason, details });
}

export async function cancelOrderItem(
  orderId: string,
  itemId: string,
  reason: string,
  details?: string,
): Promise<OrderResponse> {
  return apiClient.put(`/orders/${orderId}/items/${itemId}/cancel`, {
    reason,
    details,
  });
}
