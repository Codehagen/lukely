"use client";

import { useEffect, useRef } from "react";

interface AnalyticsTrackerProps {
  calendarId: string;
}

export function AnalyticsTracker({ calendarId }: AnalyticsTrackerProps) {
  const sessionId = useRef<string>();
  const startTime = useRef<number>();

  useEffect(() => {
    // Generate session ID
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    startTime.current = Date.now();

    // Track page view
    trackPageView();

    // Track session end on unmount
    return () => {
      if (startTime.current) {
        const duration = Math.floor((Date.now() - startTime.current) / 1000);
        trackSessionEnd(duration);
      }
    };
  }, [calendarId]);

  async function trackPageView() {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId,
          type: "page_view",
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          sessionId: sessionId.current,
        }),
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.error("Failed to track page view:", error);
    }
  }

  async function trackSessionEnd(duration: number) {
    try {
      // Use sendBeacon for reliable tracking on page unload
      const data = JSON.stringify({
        calendarId,
        type: "session_end",
        sessionId: sessionId.current,
        duration,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", data);
      } else {
        // Fallback for older browsers
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        });
      }
    } catch (error) {
      console.error("Failed to track session end:", error);
    }
  }

  // Component doesn't render anything
  return null;
}

// Hook for tracking door interactions
export function useTrackDoorInteraction(calendarId: string) {
  const sessionId = useRef<string>(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const trackDoorClick = async (doorId: string) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId,
          doorId,
          type: "door_click",
          sessionId: sessionId.current,
        }),
      });
    } catch (error) {
      console.error("Failed to track door click:", error);
    }
  };

  const trackDoorEntry = async (doorId: string) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId,
          doorId,
          type: "door_enter",
          sessionId: sessionId.current,
        }),
      });
    } catch (error) {
      console.error("Failed to track door entry:", error);
    }
  };

  return { trackDoorClick, trackDoorEntry };
}
