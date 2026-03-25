import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export function AppHeader() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: isAdmin } = useIsAdmin();

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-border shadow-xs"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}
      data-ocid="app_header"
    >
      <div className="max-w-[480px] mx-auto flex items-center justify-between px-4 h-14">
        <Link
          to="/"
          className="flex items-center gap-2"
          data-ocid="header.home.link"
        >
          <img
            src="/assets/generated/coastal-kart-logo-transparent.dim_120x120.png"
            alt="Coastal Kart"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-lg tracking-tight">
            Coastal <span className="text-primary">Kart</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link to="/admin" data-ocid="header.admin.link">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-accent font-semibold"
              >
                <ShieldCheck className="w-4 h-4 mr-1" />
                Admin
              </Button>
            </Link>
          )}
          {isInitializing ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              data-ocid="header.logout.button"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-4"
              data-ocid="header.login.button"
            >
              {loginStatus === "logging-in" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
