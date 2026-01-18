"use client";

interface AutoScrollBannerProps {
  children: React.ReactNode;
}

export default function AutoScrollBanner({ children }: AutoScrollBannerProps) {
  return (
    <div 
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#eab308 #27272a',
      }}
    >
      {children}
    </div>
  );
}
