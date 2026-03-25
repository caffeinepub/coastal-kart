import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Check, Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { OrderStatus, SenderRole } from "../../backend.d";
import { DeliveryTimeline } from "../../components/DeliveryTimeline";
import {
  ItemStatusBadge,
  OrderStatusBadge,
} from "../../components/StatusBadge";
import {
  useConfirmOrder,
  useConfirmOrderItem,
  useOrderById,
  useOrderChat,
  useRejectOrder,
  useRejectOrderItem,
  useSendAdminChatMessage,
  useUpdateOrderStatus,
} from "../../hooks/useQueries";

const statusOptions = [
  { value: OrderStatus.received, label: "Order Received" },
  { value: OrderStatus.checkingAvailability, label: "Checking Availability" },
  { value: OrderStatus.shoppingInProgress, label: "Shopping in Progress" },
  { value: OrderStatus.outForDelivery, label: "Out for Delivery" },
  { value: OrderStatus.delivered, label: "Delivered" },
  { value: OrderStatus.rejected, label: "Rejected" },
];

export function AdminOrderPage() {
  const { orderId } = useParams({ from: "/admin/orders/$orderId" });
  const orderIdNum = Number.parseInt(orderId, 10);
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrderById(orderIdNum);
  const { data: chat } = useOrderChat(orderIdNum);
  const sendAdminMsg = useSendAdminChatMessage();
  const confirmItem = useConfirmOrderItem();
  const rejectItem = useRejectOrderItem();
  const confirmOrder = useConfirmOrder();
  const rejectOrder = useRejectOrder();
  const updateStatus = useUpdateOrderStatus();

  const [chatMsg, setChatMsg] = useState("");
  const [finalTotal, setFinalTotal] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [itemPrices, setItemPrices] = useState<Record<number, string>>({});
  const [itemAlt, setItemAlt] = useState<Record<number, string>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on chat update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.length]);

  useEffect(() => {
    if (order) {
      const prices: Record<number, string> = {};
      order.items.forEach((item, idx) => {
        prices[idx] = String(item.confirmedPrice ?? item.estimatedPrice);
      });
      setItemPrices(prices);
    }
  }, [order]);

  const handleSendChat = async () => {
    const text = chatMsg.trim();
    if (!text) return;
    setChatMsg("");
    try {
      await sendAdminMsg.mutateAsync({ orderId: orderIdNum, message: text });
    } catch {
      toast.error("Failed to send message");
      setChatMsg(text);
    }
  };

  const handleConfirmItem = async (idx: number) => {
    const price = Number.parseFloat(itemPrices[idx] || "0");
    try {
      await confirmItem.mutateAsync({
        orderId: orderIdNum,
        itemIndex: idx,
        confirmedPrice: price,
      });
      toast.success("Item confirmed");
    } catch {
      toast.error("Failed to confirm item");
    }
  };

  const handleRejectItem = async (idx: number) => {
    try {
      await rejectItem.mutateAsync({
        orderId: orderIdNum,
        itemIndex: idx,
        alternativeSuggestion: itemAlt[idx] ?? "",
      });
      toast.success("Item marked unavailable");
    } catch {
      toast.error("Failed to reject item");
    }
  };

  const handleConfirmOrder = async () => {
    const total = Number.parseFloat(finalTotal);
    if (Number.isNaN(total) || total <= 0) {
      toast.error("Enter a valid final total");
      return;
    }
    try {
      await confirmOrder.mutateAsync({
        orderId: orderIdNum,
        finalTotal: total,
      });
      toast.success("Order confirmed!");
    } catch {
      toast.error("Failed to confirm order");
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectReason.trim()) {
      toast.error("Enter a rejection reason");
      return;
    }
    try {
      await rejectOrder.mutateAsync({
        orderId: orderIdNum,
        reason: rejectReason,
      });
      toast.success("Order rejected");
    } catch {
      toast.error("Failed to reject order");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus.mutateAsync({
        orderId: orderIdNum,
        status: status as OrderStatus,
      });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-6 space-y-4"
        data-ocid="admin_order.loading_state"
      >
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-8 text-center text-muted-foreground"
        data-ocid="admin_order.error_state"
      >
        Order not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-8">
      <button
        type="button"
        onClick={() => navigate({ to: "/admin" })}
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
        data-ocid="admin_order.back.button"
      >
        <ArrowLeft className="w-4 h-4" /> Admin Dashboard
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          Order #{order.id}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <Card className="shadow-card mb-4">
        <CardContent className="p-4">
          <DeliveryTimeline status={order.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Items */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-bold">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={item.itemName}
                  className="border border-border rounded-lg p-3"
                  data-ocid={`admin_order.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity.toString()}
                      </p>
                    </div>
                    <ItemStatusBadge status={item.status} />
                  </div>
                  <div className="flex gap-2 items-center mb-2">
                    <Input
                      type="number"
                      placeholder="Confirmed price"
                      value={itemPrices[idx] ?? ""}
                      onChange={(e) =>
                        setItemPrices((p) => ({ ...p, [idx]: e.target.value }))
                      }
                      className="flex-1 h-8 text-xs"
                      data-ocid={`admin_order.item.${idx + 1}.price.input`}
                    />
                    <Button
                      size="sm"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-8"
                      onClick={() => handleConfirmItem(idx)}
                      disabled={confirmItem.isPending}
                      data-ocid={`admin_order.item.${idx + 1}.confirm.button`}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-8"
                      onClick={() => handleRejectItem(idx)}
                      disabled={rejectItem.isPending}
                      data-ocid={`admin_order.item.${idx + 1}.reject.button`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Alternative suggestion (optional)"
                    value={itemAlt[idx] ?? ""}
                    onChange={(e) =>
                      setItemAlt((p) => ({ ...p, [idx]: e.target.value }))
                    }
                    className="h-8 text-xs"
                    data-ocid={`admin_order.item.${idx + 1}.alt.input`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Confirm/Reject Order */}
          <Card className="shadow-card">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-bold">Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Final total (₹)"
                  value={finalTotal}
                  onChange={(e) => setFinalTotal(e.target.value)}
                  className="flex-1"
                  data-ocid="admin_order.final_total.input"
                />
                <Button
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={handleConfirmOrder}
                  disabled={confirmOrder.isPending}
                  data-ocid="admin_order.confirm_order.button"
                >
                  {confirmOrder.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1"
                  data-ocid="admin_order.reject_reason.input"
                />
                <Button
                  variant="destructive"
                  onClick={handleRejectOrder}
                  disabled={rejectOrder.isPending}
                  data-ocid="admin_order.reject_order.button"
                >
                  {rejectOrder.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-1" /> Reject
                    </>
                  )}
                </Button>
              </div>

              {/* Status update */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Update Status
                </p>
                <Select value={order.status} onValueChange={handleStatusChange}>
                  <SelectTrigger data-ocid="admin_order.status.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat panel */}
        <Card className="shadow-card">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-bold">Customer Chat</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className="h-80 overflow-y-auto mb-3 space-y-1 border border-border rounded-lg p-3"
              data-ocid="admin_order.chat.panel"
            >
              {chat && chat.length > 0 ? (
                chat.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderRole === SenderRole.admin
                        ? "justify-end"
                        : "justify-start"
                    } mb-2`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        msg.senderRole === SenderRole.admin
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="text-[10px] opacity-60 mb-0.5">
                        {msg.senderRole === SenderRole.admin
                          ? "Admin"
                          : "Customer"}
                      </p>
                      {msg.message}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No messages yet
                </p>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2" data-ocid="admin_order.chat.input">
              <Textarea
                placeholder="Type a reply..."
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                className="flex-1 min-h-[40px] max-h-24 resize-none"
                rows={1}
                data-ocid="admin_order.chat.textarea"
              />
              <Button
                size="icon"
                className="bg-primary text-primary-foreground self-end"
                onClick={handleSendChat}
                disabled={sendAdminMsg.isPending || !chatMsg.trim()}
                data-ocid="admin_order.chat.send.button"
              >
                {sendAdminMsg.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
