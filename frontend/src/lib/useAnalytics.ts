"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to track analytics events.
 * 
 * Usage:
 * const { trackEvent } = useAnalytics("page_name");
 * 
 * trackEvent("cta_click", "try_now_button");
 */
export function useAnalytics(pageName: string) {
  const hasTrackedPageView = useRef(false);

  // Automatically track page view when the hook mounts
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      trackEvent("page_view");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName]);

  const trackEvent = (event: string, label?: string) => {
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          page: pageName,
          label,
        }),
        // Don't wait or block the UI
        keepalive: true, 
      }).catch(console.error); // Silent fail if analytics blocked
    } catch (e) {
      // Ignore errors (e.g., adblockers)
    }
  };

  return { trackEvent };
}
