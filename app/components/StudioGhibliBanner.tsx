"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Template {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
}

export default function StudioGhibliBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // Fetch Studio Ghibli templates (IDs: 84, 86, 87, 88, 89)
    fetch('/api/templates/ghibli')
      .then(res => res.json())
      .then(data => {
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          // Show banner after a short delay
          setTimeout(() => setIsVisible(true), 500);
        }
      })
      .catch(err => console.error('Failed to fetch Studio Ghibli templates:', err));
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
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Banner */}
      <div 
        className={`fixed top-0 left-0 right-0 bottom-0 sm:bottom-auto z-50 overflow-y-auto transition-transform duration-500 ease-out ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4 sm:py-6 min-h-screen sm:min-h-0 flex items-center">
          <div className="w-full bg-gradient-to-br from-green-500/10 via-blue-500/10 to-teal-500/10 backdrop-blur-xl border-2 border-green-500/30 rounded-3xl shadow-2xl overflow-hidden relative">
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute w-72 h-72 bg-green-400/20 rounded-full blur-3xl -top-36 -left-36 animate-pulse" />
              <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl top-1/2 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute w-80 h-80 bg-teal-400/20 rounded-full blur-3xl -bottom-40 left-1/4 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110 hover:rotate-90 duration-300"
              aria-label="Close banner"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto relative">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-3 sm:mb-4 shadow-lg shadow-green-500/50">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    ✨ Studio Ghibli Magic ✨
                  </span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2">
                  <span className="bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                    Enter the World of Ghibli
                  </span>
                </h2>
                <p className="text-white/90 text-sm sm:text-base lg:text-lg font-medium">
                  Transform yourself into enchanting Studio Ghibli characters! 🌿✨
                </p>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {templates.map((template, index) => (
                  <Link
                    key={template.id}
                    href={`/${template.slug}`}
                    onClick={handleClose}
                    className="group relative bg-gradient-to-br from-zinc-900/90 to-black/90 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-green-500/30 hover:border-green-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'ghibliSlideUp 0.7s ease-out forwards'
                    }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={template.image}
                        alt={template.title}
                        fill
                        className="object-cover object-top group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                      
                      {/* Magical Overlay Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-teal-400/20 to-blue-400/20" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.3),transparent_50%)]" />
                      </div>

                      {/* Hover Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-full flex items-center gap-2 text-sm shadow-lg shadow-green-500/50 transform group-hover:scale-110 transition-transform">
                          <Sparkles className="w-4 h-4" />
                          Try Now
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-black text-base sm:text-lg text-white mb-1 sm:mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
                        {template.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 group-hover:text-zinc-300 transition-colors">
                        {template.description}
                      </p>
                    </div>

                    {/* Sparkle Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ghibliSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
