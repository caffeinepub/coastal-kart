import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";
import { useProductsByShop, useShopById } from "../hooks/useQueries";

function ProductCard({
  product,
  shopId,
}: { product: Product; shopId: number }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartEntry = items.find((i) => i.productId === product.id);
  const qty = cartEntry?.quantity ?? 0;
  const entryIndex = items.findIndex((i) => i.productId === product.id);

  const handleAdd = () => {
    addItem(shopId, {
      productId: product.id,
      itemName: product.name,
      estimatedPrice: product.estimatedPrice,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleIncrease = () => updateQuantity(entryIndex, qty + 1);
  const handleDecrease = () => updateQuantity(entryIndex, qty - 1);

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          est. ₹{product.estimatedPrice}
        </p>
      </div>
      {qty === 0 ? (
        <Button
          size="sm"
          variant="outline"
          className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
          onClick={handleAdd}
          data-ocid="product.add.button"
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="w-7 h-7"
            onClick={handleDecrease}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-sm font-bold w-4 text-center">{qty}</span>
          <Button
            size="icon"
            variant="outline"
            className="w-7 h-7"
            onClick={handleIncrease}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ShopPage() {
  const { shopId } = useParams({ from: "/shop/$shopId" });
  const shopIdNum = Number.parseInt(shopId, 10);
  const navigate = useNavigate();
  const { data: shop, isLoading: shopLoading } = useShopById(shopIdNum);
  const { data: products, isLoading: productsLoading } =
    useProductsByShop(shopIdNum);
  const {
    addItem,
    totalItems,
    estimatedSubtotal,
    shopId: cartShopId,
  } = useCart();
  const [customItem, setCustomItem] = useState("");

  const isLoading = shopLoading || productsLoading;

  const categorized = useMemo(() => {
    if (!products) return {};
    return products.reduce<Record<string, Product[]>>((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});
  }, [products]);

  const handleAddCustom = () => {
    if (!customItem.trim()) return;
    addItem(shopIdNum, {
      customItemName: customItem.trim(),
      itemName: customItem.trim(),
      estimatedPrice: 0,
      quantity: 1,
    });
    toast.success(`"${customItem.trim()}" added to cart`);
    setCustomItem("");
  };

  if (isLoading) {
    return (
      <div
        className="max-w-[480px] mx-auto px-4 py-4 space-y-3"
        data-ocid="shop.loading_state"
      >
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div
        className="max-w-[480px] mx-auto px-4 py-8 text-center text-muted-foreground"
        data-ocid="shop.error_state"
      >
        Shop not found.
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Shop Header */}
      <div className="bg-accent px-4 py-4">
        <div className="max-w-[480px] mx-auto">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground transition-colors"
            data-ocid="shop.back.button"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{shop.name}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {shop.distanceKm.toFixed(1)} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {shop.openTime} –{" "}
                  {shop.closeTime}
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                shop.isOpen
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${
                  shop.isOpen ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {shop.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4 mt-4">
        {/* Custom Item */}
        <Card className="shadow-card mb-4">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Add Custom Item
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. milk, bread, 2 mangoes..."
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                className="flex-1"
                data-ocid="shop.custom_item.input"
              />
              <Button
                onClick={handleAddCustom}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                data-ocid="shop.custom_item.button"
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products by category */}
        {Object.entries(categorized).map(([category, prods]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="shadow-card">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-foreground mb-1 capitalize">
                  {category}
                </h3>
                {prods.map((p) => (
                  <ProductCard key={p.id} product={p} shopId={shopIdNum} />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {products && products.length === 0 && (
          <p
            className="text-center text-sm text-muted-foreground py-6"
            data-ocid="shop.products.empty_state"
          >
            No products listed. Use custom item above.
          </p>
        )}
      </div>

      {/* Floating cart */}
      <AnimatePresence>
        {totalItems > 0 && cartShopId === shopIdNum && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-40"
          >
            <Button
              className="w-full max-w-[440px] bg-primary text-primary-foreground shadow-lg font-semibold py-5"
              onClick={() => navigate({ to: "/cart" })}
              data-ocid="shop.cart.button"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {totalItems} item{totalItems !== 1 ? "s" : ""} · est. ₹
              {estimatedSubtotal}
              <span className="ml-2 opacity-80 text-sm">→ View Cart</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
