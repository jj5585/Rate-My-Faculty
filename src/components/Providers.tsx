"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // FIX #2: Stop /api/auth/session being called on every window focus event.
    // Previously every tab-switch triggered a new serverless invocation.
    // refetchInterval=300 means session is checked at most once per 5 minutes.
    // refetchOnWindowFocus=false is the critical change — eliminates the burst
    // of session calls visible in the logs whenever users switch tabs.
    <SessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}