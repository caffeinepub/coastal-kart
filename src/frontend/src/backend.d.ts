import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ShopId = number;
export type OrderItemIndex = number;
export type Time = bigint;
export interface OrderItem {
    status: OrderItemStatus;
    confirmedPrice?: number;
    estimatedPrice: number;
    alternativeSuggestion: string;
    itemName: string;
    quantity: bigint;
}
export interface Order {
    id: OrderId;
    status: OrderStatus;
    shopId: ShopId;
    deliveryFee: number;
    createdAt: Time;
    finalTotal?: number;
    updatedAt: Time;
    estimatedTotal: number;
    customerId: Principal;
    items: Array<OrderItem>;
    adminNotes: string;
}
export type MessageId = number;
export interface ChatMessage {
    id: MessageId;
    orderId: OrderId;
    message: string;
    timestamp: Time;
    senderRole: SenderRole;
    senderId: Principal;
}
export type ProductId = number;
export interface CartItem {
    estimatedPrice: number;
    productId?: ProductId;
    quantity: bigint;
    customItemName?: string;
}
export interface Shop {
    id: ShopId;
    closeTime: string;
    name: string;
    isOpen: boolean;
    distanceKm: number;
    address: string;
    phone: string;
    openTime: string;
}
export type OrderId = number;
export interface Product {
    id: ProductId;
    shopId: ShopId;
    estimatedPrice: number;
    name: string;
    isAvailable: boolean;
    category: string;
}
export enum OrderItemStatus {
    substituted = "substituted",
    pending = "pending",
    confirmed = "confirmed",
    unavailable = "unavailable"
}
export enum OrderStatus {
    outForDelivery = "outForDelivery",
    rejected = "rejected",
    delivered = "delivered",
    shoppingInProgress = "shoppingInProgress",
    received = "received",
    checkingAvailability = "checkingAvailability"
}
export enum SenderRole {
    admin = "admin",
    customer = "customer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(shopId: ShopId, name: string, category: string, estimatedPrice: number): Promise<ProductId>;
    addShop(name: string, distanceKm: number, openTime: string, closeTime: string, phone: string, address: string): Promise<ShopId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmOrder(orderId: OrderId, finalTotal: number): Promise<void>;
    confirmOrderItem(orderId: OrderId, itemIndex: OrderItemIndex, confirmedPrice: number): Promise<void>;
    createOrder(shopId: ShopId, items: Array<CartItem>): Promise<OrderId>;
    editOrderItemPrice(orderId: OrderId, itemIndex: OrderItemIndex, newPrice: number): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<Order>>;
    getOrderById(orderId: OrderId): Promise<Order | null>;
    getOrderChat(orderId: OrderId): Promise<Array<ChatMessage>>;
    getProductById(productId: ProductId): Promise<Product | null>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getProductsByShop(shopId: ShopId): Promise<Array<Product>>;
    getProductsByShopSortedByPrice(shopId: ShopId): Promise<Array<Product>>;
    getShopById(shopId: ShopId): Promise<Shop | null>;
    getShops(): Promise<Array<Shop>>;
    isCallerAdmin(): Promise<boolean>;
    rejectOrder(orderId: OrderId, reason: string): Promise<void>;
    rejectOrderItem(orderId: OrderId, itemIndex: OrderItemIndex, alternativeSuggestion: string): Promise<void>;
    seedData(): Promise<void>;
    sendAdminChatMessage(orderId: OrderId, message: string): Promise<void>;
    sendChatMessage(orderId: OrderId, message: string): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateShopStatus(shopId: ShopId, isOpen: boolean): Promise<void>;
}
