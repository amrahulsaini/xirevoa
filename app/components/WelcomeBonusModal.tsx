"use client";

import { X, Zap, Sparkles, Gift } from "lucide-react";
import { useEffect, useState } from "react";

interface WelcomeBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonusXP: number;
}

export default function WelcomeBonusModal({ isOpen, onClose, bonusXP }: WelcomeBonusModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-2 border-yellow-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-orange-500/20 pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <Gift className="w-12 h-12 text-black animate-bounce" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Congratulations!
            </h2>
            <p className="text-zinc-400 text-lg">
              Welcome to Xirevoa AI
            </p>
          </div>

          {/* XP Badge */}
          <div className="inline-block bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-black text-black">XP</span>
              </div>
              <span className="text-5xl font-black text-yellow-400">{bonusXP}</span>
            </div>
            <p className="text-sm text-zinc-300 font-medium">Xirevoa Points (XP)</p>
          </div>

          {/* Description */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <p className="text-zinc-300 text-sm leading-relaxed">
              You've received <span className="text-yellow-400 font-bold">{bonusXP} XP</span> as a welcome bonus! 
              Use them to generate amazing AI-powered transformations. Each generation costs just 3 XP.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400 mb-1">6+</div>
              <div className="text-xs text-zinc-400">Free Generations</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">500+</div>
              <div className="text-xs text-zinc-400">Templates</div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 hover:scale-105 transform"
          >
            Start Creating
          </button>

          <p className="text-xs text-zinc-500">
            Your XP never expires. Use them whenever you want!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
