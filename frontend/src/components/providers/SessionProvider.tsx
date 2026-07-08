"use client";

import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function ProSyncer({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/sync-pro")
        .then((res) => res.json())
        .then((data) => {
          if (data.isPro) {
            localStorage.setItem("eromify_pro", "true");
            window.dispatchEvent(new Event("eromify_pro_updated"));
          } else {
            localStorage.removeItem("eromify_pro");
            window.dispatchEvent(new Event("eromify_pro_updated"));
          }
        })
        .catch(() => {});
    } else if (status === "unauthenticated") {
      localStorage.removeItem("eromify_pro");
      window.dispatchEvent(new Event("eromify_pro_updated"));
    }
  }, [status]);

  return <>{children}</>;
}

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
      refetchWhenOffline={false}
    >
      <ProSyncer>{children}</ProSyncer>
    </NextAuthSessionProvider>
  );
}
