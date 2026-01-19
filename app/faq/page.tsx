import Header from "../components/Header";
import Footer from "../components/Footer";
import { HelpCircle, ChevronRight } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is Xirevoa AI?",
          a: "Xirevoa AI is an advanced AI-powered platform that transforms your photos using over 500 creative templates. From hairstyles to outfits and artistic transformations, create stunning images without any technical knowledge or prompt engineering."
        },
        {
          q: "Do I need to write prompts?",
          a: "No! That's the beauty of Xirevoa AI. Simply upload your photo and choose a template. Our intelligent AI handles everything automatically, eliminating the need for complex prompt engineering."
        },
        {
          q: "Are there watermarks on generated images?",
          a: "Absolutely not. Every image you create is 100% yours with no logos, watermarks, or branding. Download and use your creations anywhere without restrictions."
        }
      ]
    },
    {
      category: "XP Points & Pricing",
      questions: [
        {
          q: "What are XP Points?",
          a: "XP Points are the virtual currency used within Xirevoa AI. Each AI image generation costs 3 XP. You can purchase XP packages that never expire."
        },
        {
          q: "How much do XP Points cost?",
          a: "We offer three packages: Starter (100 XP for ₹99), Professional (300 XP for ₹249), and Creator Pro (500 XP for ₹400). Payment integration coming soon!"
        },
        {
          q: "Do XP Points expire?",
          a: "No! Your XP Points never expire. Use them whenever you want, at your own pace. They remain in your account indefinitely."
        },
        {
          q: "How many images can I generate?",
          a: "Each generation costs 3 XP. With 100 XP you get ~33 images, 300 XP gives you ~100 images, and 500 XP allows ~166 images."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' and register using your email or Google account. You'll receive 20 free XP Points to get started!"
        },
        {
          q: "Is my data secure?",
          a: "Absolutely. We use enterprise-grade encryption, and your uploaded images are processed securely. Generated images are automatically deleted after 30 days, and we never share or sell your data."
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can delete your account anytime from Settings. All your data will be permanently removed."
        }
      ]
    },
    {
      category: "Image Generation",
      questions: [
        {
          q: "What image quality can I expect?",
          a: "We support 2K, 4K, and 8K resolution outputs depending on your plan. All images are ultra-realistic with exceptional detail and photorealistic textures."
        },
        {
          q: "How long does generation take?",
          a: "Most images are generated within 30-60 seconds. Professional and Creator Pro users get priority processing for faster results."
        },
        {
          q: "What file formats are supported?",
          a: "Generated images are provided in high-quality PNG format. You can upload JPG, PNG, or WEBP images for transformation."
        },
        {
          q: "Can I use generated images commercially?",
          a: "Yes! All generated images are provided without watermarks and can be used for both personal and commercial purposes."
        }
      ]
    },
    {
      category: "Templates & Features",
      questions: [
        {
          q: "How many templates are available?",
          a: "We offer 500+ professionally curated templates across multiple categories including hairstyles, outfits, artistic styles, cinematic scenes, and more."
        },
        {
          q: "Are new templates added regularly?",
          a: "Yes! We continuously add new templates to keep your creative options fresh and exciting."
        },
        {
          q: "Can I request specific templates?",
          a: "Absolutely! Contact us with your template ideas and we'll consider them for future updates."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "What if my generation fails?",
          a: "If a generation fails, your XP will be refunded automatically. Contact support if you experience persistent issues."
        },
        {
          q: "My image quality is poor, why?",
          a: "For best results, upload high-quality photos with good lighting and clear facial features. Avoid blurry or low-resolution images."
        },
        {
          q: "How do I report a bug?",
          a: "Email us at contact@xirevoa.com with details about the issue, and we'll investigate promptly."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Help Center</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about Xirevoa AI, XP Points, features, and more
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="space-y-4">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">{category.category}</h2>
              
              {category.questions.map((faq, qIndex) => (
                <div 
                  key={qIndex}
                  className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                      <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-blue-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Still Have Questions?</h3>
          <p className="text-gray-400 mb-6">
            Can't find what you're looking for? Our support team is here to help
          </p>
          <a 
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
