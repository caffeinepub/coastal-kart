import { Badge } from "@/components/ui/badge";
import { OrderItemStatus, OrderStatus } from "../backend.d";

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  [OrderStatus.received]: {
    label: "Order Received",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [OrderStatus.checkingAvailability]: {
    label: "Checking Availability",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  [OrderStatus.shoppingInProgress]: {
    label: "Shopping in Progress",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  [OrderStatus.outForDelivery]: {
    label: "Out for Delivery",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  [OrderStatus.delivered]: {
    label: "Delivered",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  [OrderStatus.rejected]: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

const itemStatusConfig: Record<
  OrderItemStatus,
  { label: string; className: string }
> = {
  [OrderItemStatus.pending]: {
    label: "Pending",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  [OrderItemStatus.confirmed]: {
    label: "Confirmed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  [OrderItemStatus.unavailable]: {
    label: "Unavailable",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  [OrderItemStatus.substituted]: {
    label: "Substituted",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = orderStatusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

export function ItemStatusBadge({ status }: { status: OrderItemStatus }) {
  const config = itemStatusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
