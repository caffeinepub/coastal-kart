import { useEffect, useState } from "react";

const STORAGE_KEY = "coastal_kart_auth";

interface PhoneAuth {
  phone: string;
  verified: boolean;
}

function getStoredAuth(): PhoneAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PhoneAuth;
  } catch {
    return null;
  }
}

export function usePhoneAuth() {
  const [auth, setAuth] = useState<PhoneAuth | null>(getStoredAuth);

  useEffect(() => {
    const handler = () => setAuth(getStoredAuth());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = (phone: string) => {
    const data: PhoneAuth = { phone, verified: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  };

  return {
    isLoggedIn: !!auth?.verified,
    phone: auth?.phone ?? "",
    login,
    logout,
  };
}
