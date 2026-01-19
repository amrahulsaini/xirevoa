import Header from "../components/Header";
import Footer from "../components/Footer";
import { Check, Zap, Crown, Sparkles, TrendingUp } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      xp: 100,
      price: 99,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-blue-500/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Flexible Pricing Plans</span>
            </div>
            
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
                    disabled
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-yellow-500/25' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    } opacity-60 cursor-not-allowed`}
                  >
                    Coming Soon
                  </button>
                  
                  <p className="text-center text-xs text-gray-500">
                    Payment integration in progress
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

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Do XP Points expire?</h4>
              <p className="text-gray-400">No! Your XP Points never expire. Use them whenever you want, at your own pace.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Can I get a refund?</h4>
              <p className="text-gray-400">Due to the digital nature of our service, all purchases are final. However, we offer a satisfaction guarantee.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">How many images can I generate?</h4>
              <p className="text-gray-400">Each generation costs 3 XP. So with 100 XP, you can generate approximately 33 images, 300 XP gives you ~100 images, and 500 XP allows ~166 images.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-400">We'll support UPI, Credit/Debit Cards, Net Banking, and popular payment wallets once the payment system is integrated.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
