import { Link, useLocation } from "@tanstack/react-router";
import { Home, Package, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const path = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-area-pb"
      style={{ boxShadow: "0 -2px 16px rgba(0,0,0,0.07)" }}
      data-ocid="bottom_nav"
    >
      <div className="max-w-[480px] mx-auto flex">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-3 gap-0.5 text-xs font-semibold transition-colors ${
            path === "/"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="nav.home.link"
        >
          <Home
            className={`w-5 h-5 transition-transform ${
              path === "/" ? "scale-110" : ""
            }`}
          />
          <span>Home</span>
        </Link>
        <Link
          to="/orders"
          className={`flex flex-col items-center justify-center flex-1 py-3 gap-0.5 text-xs font-semibold transition-colors ${
            path.startsWith("/orders")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="nav.orders.link"
        >
          <Package
            className={`w-5 h-5 transition-transform ${
              path.startsWith("/orders") ? "scale-110" : ""
            }`}
          />
          <span>My Orders</span>
        </Link>
        <Link
          to="/cart"
          className={`flex flex-col items-center justify-center flex-1 py-3 gap-0.5 text-xs font-semibold transition-colors relative ${
            path === "/cart"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="nav.cart.link"
        >
          <div className="relative">
            <ShoppingCart
              className={`w-5 h-5 transition-transform ${
                path === "/cart" ? "scale-110" : ""
              }`}
            />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </div>
          <span>Cart</span>
        </Link>
      </div>
    </nav>
  );
}
