"use client";

import { X, Zap, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface InsufficientXPModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredXP: number;
  currentXP: number;
}

export default function InsufficientXPModal({ isOpen, onClose, requiredXP, currentXP }: InsufficientXPModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handlePurchase = (plan: string) => {
    router.push('/pricing');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-2 border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Insufficient XP</h2>
              <p className="text-sm text-zinc-400">You need more XP to continue</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* XP Status */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Your XP</span>
              <span className="text-lg font-bold text-yellow-400">{currentXP} XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Required</span>
              <span className="text-lg font-bold text-white">{requiredXP} XP</span>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-400">Short by</span>
                <span className="text-lg font-bold text-red-400">{requiredXP - currentXP} XP</span>
              </div>
            </div>
          </div>

          {/* Recommended Plan */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Recommended Plan</h3>
            <div 
              onClick={() => handlePurchase('starter')}
              className="group relative bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 hover:border-yellow-500/50 rounded-xl p-4 cursor-pointer transition-all hover:scale-105"
            >
              <div className="absolute top-3 right-3">
                <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  RECOMMENDED
                </div>
              </div>
              <div className="mb-3">
                <h4 className="text-lg font-bold text-white mb-1">Starter Pack</h4>
                <p className="text-sm text-zinc-400">Perfect for getting started</p>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black text-yellow-400">₹99</span>
                <span className="text-zinc-400">/ 100 XP</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>33+ Image Generations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Never Expires</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>HD Quality Downloads</span>
                </div>
              </div>
            </div>
          </div>

          {/* View All Plans Button */}
          <button
            onClick={() => handlePurchase('all')}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-zinc-700 hover:border-zinc-600 text-white font-semibold rounded-xl transition-all"
          >
            View All Plans
          </button>
        </div>
      </div>
    </div>
  );
}
