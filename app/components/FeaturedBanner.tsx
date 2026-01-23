"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Template {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
}

export default function FeaturedBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // Fetch featured templates
    fetch('/api/templates/featured')
      .then(res => res.json())
      .then(data => {
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          // Show banner after a short delay
          setTimeout(() => setIsVisible(true), 500);
        }
      })
      .catch(err => console.error('Failed to fetch featured templates:', err));
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Banner */}
      <div 
        className={`fixed top-0 left-0 right-0 bottom-0 sm:bottom-auto z-50 overflow-y-auto transition-transform duration-500 ease-out ${
          isClosing ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4 sm:py-6 min-h-screen sm:min-h-0 flex items-center">
          <div className="w-full bg-gradient-to-br from-yellow-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-2 border-yellow-500/30 rounded-3xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110"
              aria-label="Close banner"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-3 sm:mb-4 animate-pulse">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    New Featured Templates
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Transform Yourself Today!
                </h2>
                <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                  Check out our latest AI-powered transformations
                </p>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {templates.map((template, index) => (
                  <Link
                    key={template.id}
                    href={`/${template.slug}`}
                    onClick={handleClose}
                    className="group relative bg-gradient-to-br from-zinc-900/90 to-black/90 rounded-xl sm:rounded-2xl overflow-hidden border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] sm:aspect-[3/4] overflow-hidden">
                      <Image
                        src={template.image}
                        alt={template.title}
                        fill
                        className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-500 text-black font-bold rounded-full flex items-center gap-2 text-sm">
                          Try Now
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-black text-base sm:text-lg text-white mb-1 sm:mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {template.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
