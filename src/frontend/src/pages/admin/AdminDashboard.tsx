import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Package, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { OrderStatus } from "../../backend.d";
import { OrderStatusBadge } from "../../components/StatusBadge";
import { useAllOrders, useIsAdmin, useShops } from "../../hooks/useQueries";

function truncatePrincipal(p: { toString(): string }) {
  const s = p.toString();
  return s.length > 12 ? `${s.slice(0, 6)}...${s.slice(-4)}` : s;
}

const tabFilters: Record<string, OrderStatus[] | null> = {
  All: null,
  Pending: [OrderStatus.received, OrderStatus.checkingAvailability],
  Active: [OrderStatus.shoppingInProgress, OrderStatus.outForDelivery],
  Completed: [OrderStatus.delivered, OrderStatus.rejected],
};

const statConfigs = [
  { label: "Total Orders", key: "total", color: "text-primary" },
  { label: "Pending", key: "pending", color: "text-yellow-600" },
  { label: "Active", key: "active", color: "text-orange-600" },
] as const;

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: shops } = useShops();
  const [activeTab, setActiveTab] = useState("All");

  const getShopName = (shopId: number) =>
    shops?.find((s) => s.id === shopId)?.name ?? `Shop #${shopId}`;

  const filteredOrders =
    orders?.filter((o) => {
      const filter = tabFilters[activeTab];
      if (!filter) return true;
      return filter.includes(o.status);
    }) ?? [];

  const pendingCount =
    orders?.filter((o) =>
      [OrderStatus.received, OrderStatus.checkingAvailability].includes(
        o.status,
      ),
    ).length ?? 0;

  const activeCount =
    orders?.filter((o) =>
      [OrderStatus.shoppingInProgress, OrderStatus.outForDelivery].includes(
        o.status,
      ),
    ).length ?? 0;

  const statValues = {
    total: orders?.length ?? 0,
    pending: pendingCount,
    active: activeCount,
  };

  if (roleLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-8 space-y-4"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-16 text-center"
        data-ocid="admin.unauthorized"
      >
        <ShieldAlert className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          Admin Access Only
        </h2>
        <p className="text-sm text-muted-foreground">
          You don't have permission to view this page.
        </p>
        <Button
          className="mt-4 bg-primary text-primary-foreground"
          onClick={() => navigate({ to: "/" })}
        >
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-8">
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <ShieldAlert className="w-6 h-6 text-primary" />
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statConfigs.map((stat) => (
          <Card key={stat.key} className="shadow-card">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>
                {statValues[stat.key]}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order list with tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-ocid="admin.orders.tab"
      >
        <TabsList className="w-full mb-4">
          {Object.keys(tabFilters).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1"
              data-ocid={`admin.${tab.toLowerCase()}.tab`}
            >
              {tab}
              {tab === "Pending" && pendingCount > 0 && (
                <Badge className="ml-1 bg-yellow-500 text-white text-[10px] py-0 px-1">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(tabFilters).map((tab) => (
          <TabsContent key={tab} value={tab}>
            {ordersLoading ? (
              <div className="space-y-3" data-ocid="admin.orders.loading_state">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.orders.empty_state"
              >
                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No orders in this category</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`admin.order.item.${i + 1}`}
                  >
                    <Card
                      className="shadow-card cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        navigate({ to: `/admin/orders/${order.id}` })
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm">
                                Order #{order.id}
                              </span>
                              <OrderStatusBadge status={order.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {truncatePrincipal(order.customerId)} ·{" "}
                              {getShopName(order.shopId)} · {order.items.length}{" "}
                              items
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold">
                              {order.finalTotal
                                ? `₹${order.finalTotal}`
                                : `est. ₹${order.estimatedTotal}`}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
