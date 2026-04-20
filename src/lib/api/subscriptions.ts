import apiClient from "./client";
import type { SubscriptionPlan } from "./plans";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";
export type BillingCycle = "FREE" | "MONTHLY" | "ANNUALLY";

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  autoRenew: boolean;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
}

export interface UsageSummary {
  featureKey: string;
  used: number;
  limit: number;
  periodType: "DAILY" | "WEEKLY" | "MONTHLY";
}

export async function getMySubscription(): Promise<Subscription> {
  return apiClient.get("/subscriptions/me");
}

export async function getMyUsage(): Promise<UsageSummary[]> {
  return apiClient.get("/subscriptions/me/usage");
}

export interface SubscribePayload {
  planId: string;
  billingCycle?: BillingCycle;
}

export async function subscribe(payload: SubscribePayload): Promise<Subscription> {
  return apiClient.post("/subscriptions", payload);
}

export interface ChangePlanPayload {
  newPlanId: string;
  billingCycle?: BillingCycle;
}

export async function changePlan(payload: ChangePlanPayload): Promise<Subscription> {
  return apiClient.post("/subscriptions/change-plan", payload);
}
