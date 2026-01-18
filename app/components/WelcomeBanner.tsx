"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

export default function WelcomeBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('welcomeBannerDismissed');
    if (!dismissed) {
      // Show modal after a brief delay
      setTimeout(() => setIsOpen(true), 500);
    } else {
      setIsDismissed(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setIsDismissed(true);
    localStorage.setItem('welcomeBannerDismissed', 'true');
  };

  const handleReset = () => {
    setIsDismissed(false);
    localStorage.removeItem('welcomeBannerDismissed');
  };

  return (
    <>
      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl max-w-2xl w-full border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 animate-pulse"></div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors z-10 border border-zinc-700"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Content */}
            <div className="relative z-10 p-8 sm:p-12">
              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-6">
                Welcome to <span className="text-yellow-400">Xirevoa AI</span>
              </h2>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Just Upload Your Face</h3>
                    <p className="text-sm text-zinc-400">Simply upload your photo and explore all template styles instantly</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Gender Neutral Templates</h3>
                    <p className="text-sm text-zinc-400">All templates work perfectly for everyone, no restrictions</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-white font-bold mb-1">No Prompts Needed</h3>
                    <p className="text-sm text-zinc-400">Zero hassle, zero prompts. Just your face and instant magic</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleClose}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/50"
              >
                Let's Get Started →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Top Banner - Shows after dismissing modal */}
      {isDismissed && (
        <div className="fixed top-16 sm:top-20 left-0 right-0 bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 backdrop-blur-md border-b border-yellow-500/20 z-40 shadow-lg shadow-yellow-500/10">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span className="text-zinc-300">Upload Your Face</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-zinc-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span className="text-zinc-300">Gender Neutral</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-zinc-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span className="text-zinc-300">No Prompts Needed</span>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-zinc-500 hover:text-zinc-400 transition-colors flex-shrink-0"
                title="Show welcome message again"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
