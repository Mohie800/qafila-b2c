"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import OneSignal from "react-onesignal";
import { useAuth } from "@/lib/auth-context";

interface OneSignalContextValue {
  isInitialized: boolean;
  promptForPush: () => void;
}

const OneSignalContext = createContext<OneSignalContextValue | null>(null);

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? "";

export function OneSignalProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const initCalledRef = useRef(false);

  // Initialize OneSignal SDK once on mount
  useEffect(() => {
    if (initCalledRef.current || !ONESIGNAL_APP_ID) return;
    initCalledRef.current = true;

    OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
    })
      .then(() => setIsInitialized(true))
      .catch(() => {
        // Ad blockers or network issues — degrade gracefully
        initCalledRef.current = false;
      });
  }, []);

  // React to auth state changes — login/logout from OneSignal
  useEffect(() => {
    if (!isInitialized) return;

    if (isLoggedIn && user?.id) {
      OneSignal.login(user.id).catch(() => {});
    } else {
      OneSignal.logout().catch(() => {});
    }
  }, [isInitialized, isLoggedIn, user?.id]);

  const promptForPush = useCallback(() => {
    if (!isInitialized) return;
    OneSignal.Slidedown.promptPush().catch(() => {});
  }, [isInitialized]);

  return (
    <OneSignalContext.Provider value={{ isInitialized, promptForPush }}>
      {children}
    </OneSignalContext.Provider>
  );
}

export function useOneSignal() {
  const ctx = useContext(OneSignalContext);
  if (!ctx)
    throw new Error("useOneSignal must be used within OneSignalProvider");
  return ctx;
}
