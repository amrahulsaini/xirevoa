"use client";

import { useState, useEffect } from "react";
import { X, Cookie, Shield, Settings as SettingsIcon } from "lucide-react";

export default function CookieDisclaimer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookieConsent");
    if (!accepted) {
      setIsVisible(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 backdrop-blur-xl border-t border-yellow-500/30 shadow-2xl">
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Content Section */}
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 mt-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Cookie className="w-6 h-6 text-black" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  We Value Your Privacy
                  <Shield className="w-4 h-4 text-yellow-400" />
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
                  We use essential cookies and secure technologies to provide you with a seamless experience. 
                  This includes <span className="text-yellow-400 font-medium">secure authentication</span>, 
                  <span className="text-yellow-400 font-medium"> session management</span>, and 
                  <span className="text-yellow-400 font-medium"> personalized preferences</span> to enhance your creative journey. 
                  Your data security is our top priority.
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Secure & Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <SettingsIcon className="w-3 h-3" />
                    <span>Customizable Settings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full lg:w-auto lg:flex-shrink-0">
              <button
                onClick={handleDecline}
                className="flex-1 lg:flex-none px-6 py-3 text-sm font-medium text-gray-300 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl transition-all duration-300 border border-zinc-700/50 hover:border-zinc-600"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 lg:flex-none px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 hover:scale-105 transform"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
