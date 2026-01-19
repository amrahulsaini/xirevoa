import Header from "../components/Header";
import { Sparkles, Droplet, Image as ImageIcon, Layers, Zap, Shield } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: "No Prompts Required",
      description: "Simply upload your photo and choose a template. Our intelligent AI handles everything automatically, eliminating the need for complex prompt engineering. Create stunning transformations in seconds without any technical knowledge or experience.",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Droplet,
      title: "No Watermarks, Ever",
      description: "Every image you create is 100% yours. No logos, no watermarks, no branding – just pure, professional-quality results. Download and use your creations anywhere, from social media to professional portfolios, without any restrictions or limitations.",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "Pure Ultra-Realistic Quality",
      description: "Powered by cutting-edge AI technology, our platform generates hyper-realistic images that are virtually indistinguishable from professional photography. Advanced facial recognition ensures your identity is preserved with stunning accuracy in every transformation.",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: ImageIcon,
      title: "High Definition 2K, 4K & 8K Quality",
      description: "Experience crystal-clear results with support for multiple resolution options. From social media-ready 2K to professional 4K and cinema-grade 8K quality, your images are rendered with exceptional detail, vibrant colors, and photorealistic textures that stand out.",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      icon: Layers,
      title: "500+ Creative Templates",
      description: "Explore an extensive library of over 500 professionally curated templates spanning countless categories – from fashion and hairstyles to artistic transformations and professional portraits. New templates added regularly to keep your creative options fresh and exciting.",
      gradient: "from-red-400 to-rose-500"
    },
    {
      icon: Shield,
      title: "Privacy & Security First",
      description: "Your images and data are protected with enterprise-grade encryption and secure processing. We never share, sell, or store your personal photos beyond the generation process. Complete privacy guaranteed with automatic deletion after download, giving you peace of mind.",
      gradient: "from-indigo-400 to-violet-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-blue-500/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Next-Generation AI Technology</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Powerful Features,
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
                Limitless Creativity
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Experience the future of AI-powered image transformation with professional-grade features 
              designed for creators, artists, and innovators. No limits, no compromises – just pure creative power.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>500+ Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>8K Resolution</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>No Watermarks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Zero Prompts Needed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              {/* Gradient glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className="relative mb-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Decorative element */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-yellow-500/5 to-transparent rounded-2xl"></div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl border border-yellow-500/20 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          
          <div className="relative space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Ready to Transform Your Images?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of creators using Xirevoa AI to bring their creative visions to life
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/"
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 hover:scale-105 transform"
              >
                Get Started Free
              </a>
              <a 
                href="/pricing"
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all duration-300 border border-zinc-700"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
