"use client";

import { useEffect, useRef, useState } from "react";

interface AutoScrollBannerProps {
  children: React.ReactNode;
}

export default function AutoScrollBanner({ children }: AutoScrollBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    const scrollSpeed = 0.3; // Slower, smoother speed

    const autoScroll = () => {
      if (!isUserScrolling && scrollContainer) {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        
        // Check if we've reached the end (with small threshold)
        if (scrollContainer.scrollLeft >= maxScroll - 2) {
          // Pause at end before resetting
          if (!resetTimeoutRef.current) {
            resetTimeoutRef.current = setTimeout(() => {
              if (!isUserScrolling && scrollContainer) {
                scrollContainer.scrollLeft = 0;
              }
              resetTimeoutRef.current = null;
            }, 2000); // 2 second pause at end
          }
        } else {
          scrollContainer.scrollLeft += scrollSpeed;
          resetTimeoutRef.current = null;
        }
      }
      
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Only enable auto-scroll if content overflows
    const hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth;
    
    if (hasOverflow) {
      // Start auto-scroll after a brief delay
      const startDelay = setTimeout(() => {
        animationFrameId = requestAnimationFrame(autoScroll);
      }, 1000);

      return () => {
        clearTimeout(startDelay);
        cancelAnimationFrame(animationFrameId);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      };
    }

    // Detect manual scrolling
    const handleScroll = () => {
      setIsUserScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Resume auto-scroll after user stops scrolling for 3 seconds
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 3000);
    };

    const handleMouseEnter = () => {
      setIsUserScrolling(true);
    };

    const handleMouseLeave = () => {
      // Resume auto-scroll after leaving
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => setIsUserScrolling(false), 500);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);
    scrollContainer.addEventListener("touchstart", handleMouseEnter, { passive: true });
    scrollContainer.addEventListener("touchend", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      scrollContainer.removeEventListener("touchstart", handleMouseEnter);
      scrollContainer.removeEventListener("touchend", handleMouseLeave);
    };
  }, [isUserScrolling]);

  return (
    <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {children}
    </div>
  );
}
