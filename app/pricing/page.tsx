"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { Check, Zap, Crown, Sparkles, TrendingUp, CheckCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    xpAdded: number;
    newBalance: number;
    planName: string;
    amount: number;
  } | null>(null);
  const plans = [
    {
      name: "Starter",
      xp: 100,
      price: 1,
      popular: false,
      features: [
        "100 XP Points",
        "~33 AI Image Generations",
        "Access to 500+ Templates",
        "HD Quality (2K Resolution)",
        "No Watermarks",
        "Instant Generation",
        "24/7 Support"
      ],
      gradient: "from-blue-500 to-cyan-500",
      icon: Zap
    },
    {
      name: "Professional",
      xp: 300,
      price: 249,
      popular: true,
      features: [
        "300 XP Points",
        "~100 AI Image Generations",
        "Access to 500+ Templates",
        "Ultra HD Quality (4K Resolution)",
        "No Watermarks",
        "Priority Processing",
        "Advanced Templates",
        "24/7 Priority Support",
        "Bulk Downloads"
      ],
      gradient: "from-yellow-400 to-orange-500",
      icon: Crown
    },
    {
      name: "Creator Pro",
      xp: 500,
      price: 400,
      popular: false,
      features: [
        "500 XP Points",
        "~166 AI Image Generations",
        "Access to 500+ Templates",
        "Maximum Quality (8K Resolution)",
        "No Watermarks",
        "Fastest Processing",
        "Exclusive Templates",
        "Early Access to New Features",
        "Bulk Downloads",
        "VIP Support"
      ],
      gradient: "from-purple-500 to-pink-500",
      icon: Sparkles
    }
  ];
  const handlePayment = async (plan: typeof plans[0]) => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "loading") return;

    setLoading(plan.name);

    try {
      // Create order
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          xp: plan.xp,
          planName: plan.name,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Xirevoa",
        description: `${plan.name} - ${plan.xp} XP Points`,
        image: "/logo.png", // Your logo
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                xp: plan.xp,
                planName: plan.name,
                amount: plan.price,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Send receipt email
              fetch("/api/razorpay/send-receipt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  planName: plan.name,
                  xpAdded: plan.xp,
                  amount: plan.price,
                  paymentId: response.razorpay_payment_id,
                  newBalance: verifyData.newBalance,
                }),
              }).catch((err) => console.error("Email error:", err));

              // Show success modal
              setSuccessData({
                xpAdded: plan.xp,
                newBalance: verifyData.newBalance,
                planName: plan.name,
                amount: plan.price,
              });
              setShowSuccessModal(true);
              setLoading(null);
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
            setLoading(null);
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#F59E0B", // Orange-500 to match your brand
        },
        modal: {
          ondismiss: function () {
            setLoading(null);
          },
        },
      };

      // Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-blue-500/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Choose Your
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
                Creative Power
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Get XP Points and unlock unlimited creative possibilities. No subscriptions, no hidden fees – 
              just straightforward pricing for exceptional AI transformations.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative group ${plan.popular ? 'md:-mt-4 md:scale-105' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`relative bg-zinc-900/70 backdrop-blur-sm border-2 ${plan.popular ? 'border-yellow-500/50' : 'border-zinc-800'} hover:border-zinc-700 rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden`}>
                {/* Gradient glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Plan Details */}
                <div className="relative space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-gray-400">one-time</span>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                      <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-black">XP</span>
                      </div>
                      <span className="text-yellow-400 font-bold">{plan.xp} XP Points</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button 
                    onClick={() => handlePayment(plan)}
                    disabled={loading === plan.name}
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg cursor-pointer ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-yellow-500/25' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    } disabled:opacity-60 disabled:cursor-wait`}
                  >
                    {loading === plan.name ? "Processing..." : "Buy Now"}
                  </button>
                  
                  <p className="text-center text-xs text-gray-500">
                    Secure payment via Razorpay
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Why Choose XP Points?</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            XP Points never expire and give you complete control over your creative budget. 
            Each image generation costs just 3 XP, making it affordable to experiment and create freely.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">3 XP</div>
              <div className="text-sm text-gray-400">Per Image Generation</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
              <div className="text-sm text-gray-400">Never Expires</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">0%</div>
              <div className="text-sm text-gray-400">No Hidden Fees</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-yellow-500/50 rounded-3xl max-w-md w-full p-8 relative animate-in fade-in duration-300">
            {/* Close button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                window.location.reload();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              Payment Successful! 🎉
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Your XP Points have been added
            </p>

            {/* Details */}
            <div className="bg-zinc-800/50 rounded-2xl p-6 space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Plan</span>
                <span className="text-white font-bold">{successData.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount Paid</span>
                <span className="text-white font-bold">₹{successData.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">XP Added</span>
                <span className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-black">XP</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-xl">+{successData.xpAdded}</span>
                </span>
              </div>
              <div className="border-t border-zinc-700 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">New Balance</span>
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-black">XP</span>
                    </div>
                    <span className="text-yellow-400 font-bold text-2xl">{successData.newBalance}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Email notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-400 text-sm text-center">
                📧 A receipt has been sent to your email
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                window.location.reload();
              }}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/25"
            >
              Start Creating
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
