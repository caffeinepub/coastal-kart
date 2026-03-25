import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderStatus } from "../backend.d";
import type { CartItem } from "../backend.d";
import { useActor } from "./useActor";

export function useShops() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useShopById(shopId: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      if (!actor || shopId === null) return null;
      return actor.getShopById(shopId);
    },
    enabled: !!actor && !isFetching && shopId !== null,
  });
}

export function useProductsByShop(shopId: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", shopId],
    queryFn: async () => {
      if (!actor || shopId === null) return [];
      return actor.getProductsByShop(shopId);
    },
    enabled: !!actor && !isFetching && shopId !== null,
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrderById(orderId: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!actor || orderId === null) return null;
      return actor.getOrderById(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    refetchInterval: 5000,
  });
}

export function useOrderChat(orderId: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["chat", orderId],
    queryFn: async () => {
      if (!actor || orderId === null) return [];
      return actor.getOrderChat(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    refetchInterval: 3000,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      shopId,
      items,
    }: { shopId: number; items: CartItem[] }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrder(shopId, items);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useSendChatMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      message,
    }: { orderId: number; message: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendChatMessage(orderId, message);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["chat", vars.orderId] });
    },
  });
}

export function useSendAdminChatMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      message,
    }: { orderId: number; message: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendAdminChatMessage(orderId, message);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["chat", vars.orderId] });
    },
  });
}

export function useConfirmOrderItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      itemIndex,
      confirmedPrice,
    }: { orderId: number; itemIndex: number; confirmedPrice: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.confirmOrderItem(orderId, itemIndex, confirmedPrice);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useRejectOrderItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      itemIndex,
      alternativeSuggestion,
    }: {
      orderId: number;
      itemIndex: number;
      alternativeSuggestion: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectOrderItem(orderId, itemIndex, alternativeSuggestion);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useConfirmOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      finalTotal,
    }: { orderId: number; finalTotal: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.confirmOrder(orderId, finalTotal);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useRejectOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: { orderId: number; reason: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectOrder(orderId, reason);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: number; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useEditOrderItemPrice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      itemIndex,
      newPrice,
    }: { orderId: number; itemIndex: number; newPrice: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.editOrderItemPrice(orderId, itemIndex, newPrice);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
    },
  });
}

export function useUpdateShopStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      shopId,
      isOpen,
    }: { shopId: number; isOpen: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateShopStatus(shopId, isOpen);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shops"] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.seedData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shops"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
