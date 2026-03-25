import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateOrder } from "../hooks/useQueries";

const DELIVERY_FEE = 30;

export function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    shopId,
    estimatedSubtotal,
    clearCart,
    toCartItems,
  } = useCart();
  const createOrder = useCreateOrder();
  const { identity, login } = useInternetIdentity();
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);

  const total = estimatedSubtotal + DELIVERY_FEE;

  const handlePlaceOrder = async () => {
    if (!identity) {
      toast.error("Please login to place an order");
      login();
      return;
    }
    if (!shopId || items.length === 0) return;
    try {
      const orderId = await createOrder.mutateAsync({
        shopId,
        items: toCartItems(),
      });
      setConfirmedOrderId(orderId);
      clearCart();
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (items.length === 0 && confirmedOrderId === null) {
    return (
      <div
        className="max-w-[480px] mx-auto px-4 py-20 flex flex-col items-center text-center"
        data-ocid="cart.empty_state"
      >
        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Add items from a local shop to get started
        </p>
        <Button
          className="bg-primary text-primary-foreground rounded-2xl px-8 font-semibold"
          onClick={() => navigate({ to: "/" })}
          data-ocid="cart.browse.button"
        >
          Browse Shops
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 py-4 pb-28">
      <h1 className="text-xl font-bold text-foreground mb-4">Your Cart</h1>

      <Card className="bg-white shadow-card rounded-2xl mb-4 border-border overflow-hidden">
        <CardContent className="p-0">
          {items.map((item, index) => (
            <motion.div
              key={`${item.itemName}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0"
              data-ocid={`cart.item.${index + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {item.itemName}
                </p>
                {item.customItemName && (
                  <span className="text-xs text-muted-foreground italic">
                    custom item
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  est. ₹{item.estimatedPrice} × {item.quantity} ={" "}
                  <span className="font-semibold text-foreground">
                    ₹{item.estimatedPrice * item.quantity}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 ml-3">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center bg-white hover:bg-accent transition-colors"
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  data-ocid={`cart.item.${index + 1}.delete_button`}
                >
                  {item.quantity === 1 ? (
                    <Trash2 className="w-3 h-3 text-destructive" />
                  ) : (
                    <Minus className="w-3 h-3 text-foreground" />
                  )}
                </button>
                <span className="text-sm font-bold w-5 text-center">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Price breakdown */}
      <Card className="bg-white shadow-card rounded-2xl mb-4 border-border">
        <CardContent className="p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated subtotal</span>
            <span className="font-semibold text-foreground">
              ₹{estimatedSubtotal}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery fee</span>
            <span className="font-semibold text-foreground">
              ₹{DELIVERY_FEE}
            </span>
          </div>
          <div className="border-t border-border pt-2.5 flex justify-between items-center">
            <span className="font-bold text-base text-foreground">
              Estimated Total
            </span>
            <span
              className="font-bold text-xl"
              style={{ color: "oklch(0.82 0.17 84)" }}
            >
              ₹{total}
            </span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            * Final price confirmed after admin checks item availability
          </p>
        </CardContent>
      </Card>

      <Button
        className="w-full bg-primary text-primary-foreground font-bold py-6 text-base rounded-2xl shadow-card hover:bg-primary/90 active:scale-[0.98] transition-all"
        onClick={handlePlaceOrder}
        disabled={createOrder.isPending || items.length === 0}
        data-ocid="cart.place_order.button"
      >
        {createOrder.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...
          </>
        ) : (
          "Place Order"
        )}
      </Button>

      {/* Success dialog */}
      <Dialog open={confirmedOrderId !== null}>
        <DialogContent data-ocid="cart.order_confirmation.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Order Placed!
            </DialogTitle>
            <DialogDescription>
              Order #{confirmedOrderId} has been received. Our team will check
              item availability and confirm shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-accent rounded-xl p-3 text-sm text-muted-foreground">
            <p>
              Status:{" "}
              <strong className="text-foreground">
                Waiting for confirmation
              </strong>
            </p>
            <p className="mt-1">
              You'll be able to chat with us in the order detail page.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => navigate({ to: "/orders" })}
              data-ocid="cart.view_orders.button"
            >
              View Orders
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground rounded-xl"
              onClick={() => {
                if (confirmedOrderId !== null) {
                  navigate({ to: `/orders/${confirmedOrderId}` });
                }
              }}
              data-ocid="cart.track_order.button"
            >
              Track Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
