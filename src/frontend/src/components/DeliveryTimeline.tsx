import {
  CheckCircle,
  Circle,
  Clock,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { OrderStatus } from "../backend.d";

const steps = [
  { key: OrderStatus.received, label: "Order Received", icon: Clock },
  {
    key: OrderStatus.checkingAvailability,
    label: "Checking Items",
    icon: Package,
  },
  {
    key: OrderStatus.shoppingInProgress,
    label: "Shopping",
    icon: ShoppingCart,
  },
  { key: OrderStatus.outForDelivery, label: "On the Way", icon: Truck },
  { key: OrderStatus.delivered, label: "Delivered", icon: CheckCircle },
];

const statusOrder: Record<OrderStatus, number> = {
  [OrderStatus.received]: 0,
  [OrderStatus.checkingAvailability]: 1,
  [OrderStatus.shoppingInProgress]: 2,
  [OrderStatus.outForDelivery]: 3,
  [OrderStatus.delivered]: 4,
  [OrderStatus.rejected]: -1,
};

export function DeliveryTimeline({ status }: { status: OrderStatus }) {
  const currentStep = statusOrder[status] ?? 0;
  const isRejected = status === OrderStatus.rejected;

  if (isRejected) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          <Circle className="w-4 h-4 fill-red-600" />
          <span className="text-sm font-medium">Order Rejected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between overflow-x-auto py-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div
            key={step.key}
            className="flex flex-col items-center flex-1 min-w-0"
          >
            <div className="flex items-center w-full">
              {idx > 0 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    done ? "bg-green-500" : "bg-border"
                  }`}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                  done
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    done ? "bg-green-500" : "bg-border"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-xs mt-1 text-center leading-tight ${
                active
                  ? "text-primary font-semibold"
                  : done
                    ? "text-green-600 font-medium"
                    : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
