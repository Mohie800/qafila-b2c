import apiClient from "./client";

export type AddressType = "HOME" | "WORK" | "OTHER";

export interface Address {
  id: string;
  type: AddressType;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  street: string;
  city: string;
  area: string;
  apartmentNo?: string;
  directions?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressListResponse {
  addresses: Address[];
  total: number;
  defaultAddress: Address | null;
}

export interface CreateAddressPayload {
  type?: AddressType;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  street: string;
  city: string;
  area: string;
  apartmentNo?: string;
  directions?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

export async function getAddresses(): Promise<AddressListResponse> {
  return apiClient.get("/addresses");
}

export async function getAddressById(id: string): Promise<Address> {
  return apiClient.get(`/addresses/${id}`);
}

export async function getDefaultAddress(): Promise<Address> {
  return apiClient.get("/addresses/default");
}

export async function createAddress(
  payload: CreateAddressPayload,
): Promise<Address> {
  return apiClient.post("/addresses", payload);
}

export async function updateAddress(
  id: string,
  payload: UpdateAddressPayload,
): Promise<Address> {
  return apiClient.put(`/addresses/${id}`, payload);
}

export async function deleteAddress(id: string): Promise<void> {
  return apiClient.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<Address> {
  return apiClient.put(`/addresses/${id}/set-default`);
}
