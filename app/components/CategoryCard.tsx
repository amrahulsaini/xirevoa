"use client";

import Image from "next/image";
import { useState } from "react";
import { Info, X } from "lucide-react";
import Link from "next/link";

interface CategoryCardProps {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  comingSoon?: boolean;
}

export default function CategoryCard({
  id,
  title,
  slug,
  description,
  image,
  comingSoon,
}: CategoryCardProps) {
  const [imgSrc, setImgSrc] = useState(image);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleButtonClick = () => {
    // Placeholder for future functionality
    console.log(`Button clicked for: ${title}`);
  };

  return (
    <>
      <Link
        href={comingSoon ? "#" : `/${slug}`}
        onClick={(e) => {
          if (comingSoon) e.preventDefault();
        }}
        className="block group relative overflow-hidden rounded-2xl bg-zinc-900 cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 mb-4 border border-zinc-800/50 hover:border-yellow-500/50 min-h-[320px] sm:min-h-[380px]"
      >
        {/* Image Container - Natural aspect ratio */}
        <div className="relative w-full overflow-hidden bg-zinc-900 h-full">
          <Image
            src={imgSrc}
            alt={title}
            width={600}
            height={800}
            className="w-full h-auto object-contain"
            onLoadingComplete={() => {}}
            onError={() => {
              setImgSrc(
                `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2318181b;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2327272a;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='400' height='500'/%3E%3Ctext fill='%23fbbf24' font-family='Arial, sans-serif' font-size='24' font-weight='bold' x='50%25' y='45%25' text-anchor='middle' dy='.3em'%3E${encodeURIComponent(
                  title
                )}%3C/text%3E%3Ctext fill='%2371717a' font-family='Arial, sans-serif' font-size='16' x='50%25' y='60%25' text-anchor='middle'%3EComing Soon%3C/text%3E%3C/svg%3E`
              );
            }}
          />
          
          {/* Coming Soon Badge */}
          {comingSoon ? (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
              SOON
            </div>
          ) : null}

          {/* Info Icon - Top Left - Mobile always visible, desktop on hover */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowInfoModal(true);
            }}
            className="flex absolute top-3 left-3 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full items-center justify-center border border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500 transition-all group/info md:opacity-0 md:group-hover:opacity-100">
            <Info className="w-4 h-4 text-yellow-400 group-hover/info:text-yellow-300" />
          </button>

          {/* Action Button - Bottom - Desktop on hover only */}
          <div className="hidden md:block absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className={`block w-full px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-center ${
                comingSoon ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg hover:shadow-yellow-500/50'
              }`}
            >
              {comingSoon ? "Coming Soon" : "Use This Template →"}
            </div>
          </div>
        </div>
      </Link>

      {/* Info Modal */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <div 
            className="bg-zinc-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30 shadow-2xl shadow-yellow-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 sm:p-6 flex justify-between items-center z-10">
              <h3 className="text-lg sm:text-xl font-bold text-yellow-400">{title}</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content - Horizontal Layout */}
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Image */}
              {imgSrc && (
                <div className="md:w-1/2 bg-zinc-800/50">
                  <div className="p-4 sm:p-6">
                    <Image
                      src={imgSrc}
                      alt={title}
                      width={800}
                      height={1000}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Right Side - Details */}
              <div className="md:w-1/2">
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-3">Description</h4>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{description}</p>
                  </div>

                  {/* Use Template Button */}
                  <Link
                    href={comingSoon ? "#" : `/${slug}`}
                    className={`block w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-center ${
                      comingSoon ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg hover:shadow-yellow-500/50'
                    }`}
                    onClick={(e) => {
                      if (comingSoon) {
                        e.preventDefault();
                      } else {
                        setShowInfoModal(false);
                      }
                    }}
                  >
                    {comingSoon ? "Coming Soon" : "Use This Template →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

