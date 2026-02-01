"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && !anchor.target && !anchor.download) {
        const url = new URL(anchor.href);
        // Only show loading for internal navigation
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener("click", handleClick);
    
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <>
      {/* Top Loading Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-zinc-900">
        <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>

      {/* Full Screen Overlay with Dots */}
      <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-[bounce_1s_ease-in-out_infinite]"></div>
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-[bounce_1s_ease-in-out_0.1s_infinite]"></div>
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]"></div>
        </div>
      </div>
    </>
  );
}
