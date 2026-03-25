import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppHeader } from "./components/AppHeader";
import { BottomNav } from "./components/BottomNav";
import { CartProvider } from "./context/CartContext";
import { usePhoneAuth } from "./hooks/usePhoneAuth";
import { CartPage } from "./pages/CartPage";
import { HomePage } from "./pages/HomePage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PhoneLoginPage } from "./pages/PhoneLoginPage";
import { ShopPage } from "./pages/ShopPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminOrderPage } from "./pages/admin/AdminOrderPage";

function RootLayout() {
  const { isLoggedIn } = usePhoneAuth();

  if (!isLoggedIn) {
    return (
      <>
        <PhoneLoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main>
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <Toaster />
    </CartProvider>
  );
}

// Root layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop/$shopId",
  component: ShopPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/$orderId",
  component: OrderDetailPage,
});

// Admin layout (no bottom nav)
const adminRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const adminOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/orders/$orderId",
  component: AdminOrderPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  shopRoute,
  cartRoute,
  ordersRoute,
  orderDetailRoute,
  adminRootRoute,
  adminOrderRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
