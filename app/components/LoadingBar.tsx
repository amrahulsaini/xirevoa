"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

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

      {/* Full Screen Spinner */}
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-zinc-900 border-2 border-yellow-400 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl shadow-yellow-400/20">
          <Loader2 className="w-16 h-16 text-yellow-400 animate-spin" />
          <p className="text-white font-bold text-xl">Loading...</p>
        </div>
      </div>
    </>
  );
}
