import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Bike, Clock, MapPin, MessageCircle, Moon, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Shop } from "../backend.d";
import { useSeedData, useShops } from "../hooks/useQueries";

const CATEGORIES = [
  { emoji: "🥬", label: "Vegetables" },
  { emoji: "🍎", label: "Fruits" },
  { emoji: "🥛", label: "Dairy" },
  { emoji: "🍪", label: "Snacks" },
  { emoji: "🧴", label: "Personal Care" },
  { emoji: "🧹", label: "Household" },
];

const howItWorksItems = [
  { emoji: "🏪", title: "Pick a Shop", desc: "Choose your nearest local shop" },
  { emoji: "🛒", title: "Add Items", desc: "Browse or type custom items" },
  { emoji: "✅", title: "Real Check", desc: "Admin confirms availability" },
  { emoji: "🛵", title: "Fast Delivery", desc: "Delivered to your door" },
];

function ShopCard({ shop, index }: { shop: Shop; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      data-ocid={`shop.item.${index + 1}`}
    >
      <Card className="bg-white shadow-card border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-base text-foreground leading-tight">
                {shop.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {shop.address}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`ml-2 flex-shrink-0 text-xs font-semibold ${
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
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {shop.distanceKm.toFixed(1)} km
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {shop.openTime} – {shop.closeTime}
            </span>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl"
            size="sm"
            onClick={() => navigate({ to: `/shop/${shop.id}` })}
            data-ocid={`shop.item.${index + 1}.button`}
          >
            <Bike className="w-4 h-4 mr-1.5" />
            Shop Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: shops, isLoading } = useShops();
  const seedMutation = useSeedData();
  const isLateNight = new Date().getHours() >= 21;
  const [searchQuery, setSearchQuery] = useState("");

  const { mutate: doSeed, isPending: isSeedPending } = seedMutation;

  useEffect(() => {
    if (shops && shops.length === 0 && !isSeedPending) {
      doSeed();
    }
  }, [shops, isSeedPending, doSeed]);

  const displayedShops = useMemo(() => {
    if (!shops) return [];
    if (isLateNight) return shops.filter((s) => s.isOpen);
    return shops;
  }, [shops, isLateNight]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="pb-36">
      {/* Greeting Header */}
      <section className="bg-primary px-4 pt-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[480px] mx-auto"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-primary-foreground/80 text-sm font-medium">
              {greeting} 👋
            </p>
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
              <MapPin className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-medium">
                Mangalore, KA
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-white leading-snug">
            What would you like today?
          </h1>
        </motion.div>
      </section>

      {/* Search Bar */}
      <div className="bg-primary px-4 pb-5">
        <div className="max-w-[480px] mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10 pr-4 h-12 bg-white border-0 rounded-2xl shadow-card text-foreground placeholder:text-muted-foreground font-medium"
              placeholder="What do you need?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-ocid="home.search_input"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4">
        {/* Categories */}
        <section className="mt-5">
          <h2 className="text-sm font-bold text-foreground mb-3">Categories</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-2xl px-3 py-3 shadow-card border border-border min-w-[68px] hover:border-primary/40 hover:bg-accent transition-colors"
                data-ocid="home.category.button"
              >
                <span className="text-2xl leading-none">{cat.emoji}</span>
                <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Late Night Banner */}
        {isLateNight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3"
            data-ocid="late_night.banner"
          >
            <Moon className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                Late Night Delivery Available
              </p>
              <p className="text-xs text-amber-700">
                Showing only open shops right now
              </p>
            </div>
          </motion.div>
        )}

        {/* Nearby Shops */}
        <section className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Nearby Shops</h2>
            <span className="text-xs text-primary font-semibold">
              {displayedShops.length} available
            </span>
          </div>

          {isLoading || seedMutation.isPending ? (
            <div className="space-y-3" data-ocid="shops.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 w-full rounded-2xl" />
              ))}
            </div>
          ) : displayedShops.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground text-sm bg-white rounded-2xl shadow-card"
              data-ocid="shops.empty_state"
            >
              {isLateNight
                ? "No shops are open right now."
                : "No shops available."}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedShops.map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="mt-6 mb-4">
          <h2 className="text-sm font-bold text-foreground mb-3">
            How Coastal Kart Works
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {howItWorksItems.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-4 text-center border border-border shadow-card"
              >
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mx-auto mb-2 text-xl">
                  {card.emoji}
                </div>
                <p className="font-bold text-sm text-foreground">
                  {card.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border mt-4">
          © {new Date().getFullYear()} Bhuvanesh Brahmienaik
        </footer>
      </div>

      {/* Floating Chat to Order Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="fixed bottom-[68px] left-0 right-0 z-30 px-4"
      >
        <div className="max-w-[480px] mx-auto">
          <Button
            className="w-full bg-primary text-primary-foreground font-bold py-6 text-base rounded-2xl shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all"
            onClick={() => navigate({ to: "/orders" })}
            data-ocid="home.chat_to_order.button"
          >
            <MessageCircle className="w-5 h-5 mr-2" />💬 Chat to Order
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
