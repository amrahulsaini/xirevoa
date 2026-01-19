"use client";

import { X, Zap, Check, Crown, Sparkles } from "lucide-react";
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

  const plans = [
    {
      name: "Starter",
      xp: 100,
      price: 99,
      popular: false,
      generations: "~33",
      features: ["100 XP Points", "Access to 500+ Templates", "HD Quality (2K)", "No Watermarks", "Instant Generation", "24/7 Support"],
      gradient: "from-blue-500 to-cyan-500",
      icon: Zap
    },
    {
      name: "Professional",
      xp: 300,
      price: 249,
      popular: true,
      generations: "~100",
      features: ["300 XP Points", "Access to 500+ Templates", "Ultra HD (4K)", "Priority Processing", "Advanced Templates", "24/7 Priority Support"],
      gradient: "from-yellow-400 to-orange-500",
      icon: Crown
    },
    {
      name: "Creator Pro",
      xp: 500,
      price: 400,
      popular: false,
      generations: "~166",
      features: ["500 XP Points", "Maximum Quality (8K)", "Fastest Processing", "Exclusive Templates", "Early Access Features", "VIP Support"],
      gradient: "from-purple-500 to-pink-500",
      icon: Sparkles
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Responsive horizontal layout */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-2 border-zinc-800 rounded-2xl w-full max-w-6xl overflow-y-auto max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Insufficient XP</h2>
              <p className="text-sm text-zinc-400">You need more XP to continue generating images</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* XP Status Banner */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-zinc-400 block mb-1">Your XP</span>
                  <span className="text-xl font-bold text-yellow-400">{currentXP} XP</span>
                </div>
                <div className="text-zinc-600">→</div>
                <div>
                  <span className="text-xs text-zinc-400 block mb-1">Required</span>
                  <span className="text-xl font-bold text-white">{requiredXP} XP</span>
                </div>
                <div className="hidden sm:block text-zinc-600">•</div>
                <div className="hidden sm:block">
                  <span className="text-xs text-red-400 block mb-1">Short by</span>
                  <span className="text-xl font-bold text-red-400">{requiredXP - currentXP} XP</span>
                </div>
              </div>
              <div className="bg-zinc-900/80 rounded-lg px-4 py-2 border border-zinc-700">
                <div className="text-xs text-zinc-400 mb-1">Cost per Image</div>
                <div className="text-lg font-bold text-yellow-400">3 XP</div>
              </div>
            </div>
          </div>

          {/* Pricing Plans - Horizontal on Desktop */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan, index) => (
                <div 
                  key={index}
                  onClick={() => handlePurchase(plan.name.toLowerCase())}
                  className={`group relative bg-zinc-800/50 border-2 ${plan.popular ? 'border-yellow-500/50' : 'border-zinc-700'} hover:border-yellow-500/70 rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02]`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${plan.gradient} rounded-lg flex items-center justify-center`}>
                      <plan.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{plan.name}</h4>
                      <p className="text-xs text-zinc-400">{plan.generations} Images</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4 pb-4 border-b border-zinc-700">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-yellow-400">₹{plan.price}</span>
                      <span className="text-xs text-zinc-400">one-time</span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/70 rounded-lg border border-zinc-700/50">
                      <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-black">XP</span>
                      </div>
                      <span className="text-yellow-400 font-bold text-sm">{plan.xp} XP</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-zinc-300 text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Button */}
                  <button
                    className={`w-full mt-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black' 
                        : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-green-400" />
                <span>XP Never Expires</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-green-400" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-green-400" />
                <span>Instant Activation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
