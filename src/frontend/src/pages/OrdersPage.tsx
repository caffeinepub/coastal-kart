import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Package } from "lucide-react";
import { motion } from "motion/react";
import { OrderStatusBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders, useShops } from "../hooks/useQueries";

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: orders, isLoading } = useMyOrders();
  const { data: shops } = useShops();

  const getShopName = (shopId: number) =>
    shops?.find((s) => s.id === shopId)?.name ?? `Shop #${shopId}`;

  if (!identity) {
    return (
      <div
        className="max-w-[480px] mx-auto px-4 py-16 text-center"
        data-ocid="orders.login_required"
      >
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">
          Login to view orders
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Track your orders and chat with the shop
        </p>
        <Button
          className="bg-primary text-primary-foreground"
          onClick={login}
          data-ocid="orders.login.button"
        >
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 py-4 pb-24">
      <h1 className="text-xl font-bold text-foreground mb-4">My Orders</h1>

      {isLoading ? (
        <div className="space-y-3" data-ocid="orders.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="orders.empty_state"
        >
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`orders.item.${i + 1}`}
            >
              <Card
                className="shadow-card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate({ to: `/orders/${order.id}` })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground">
                          Order #{order.id}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getShopName(order.shopId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)} · {order.items.length}{" "}
                        items
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-right">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {order.finalTotal
                            ? `₹${order.finalTotal}`
                            : `est. ₹${order.estimatedTotal}`}
                        </p>
                        {!order.finalTotal && (
                          <p className="text-xs text-muted-foreground">
                            estimated
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
