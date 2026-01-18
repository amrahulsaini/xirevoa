"use client";

interface AutoScrollBannerProps {
  children: React.ReactNode;
}

export default function AutoScrollBanner({ children }: AutoScrollBannerProps) {
  return (
    <div 
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {children}
    </div>
  );
}
