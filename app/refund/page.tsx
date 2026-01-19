import Header from "../components/Header";
import Footer from "../components/Footer";
import { RefreshCw, XCircle, AlertCircle, CheckCircle } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
            <RefreshCw className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Refund Policy</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">Refund Policy</h1>
          <p className="text-gray-400">Last updated: January 19, 2026</p>
        </div>

        <div className="space-y-8">
          {/* No Refunds Notice */}
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">No Refund Policy</h2>
                <p className="text-gray-300 mb-4">
                  Due to the digital nature of our service and instant delivery of XP Points, <strong className="text-white">all purchases are final and non-refundable</strong>.
                </p>
                <p className="text-gray-400">
                  Once XP Points are purchased and credited to your account, they cannot be refunded, exchanged, or transferred. 
                  This policy applies to all XP packages regardless of the purchase amount.
                </p>
              </div>
            </div>
          </div>

          {/* Why No Refunds */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Why We Don't Offer Refunds</h2>
                <div className="text-gray-400 space-y-3">
                  <p>Our no-refund policy exists because:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>XP Points are instantly delivered and can be used immediately</li>
                    <li>Digital services cannot be "returned" once accessed</li>
                    <li>We provide free XP (20 points) for testing before purchase</li>
                    <li>XP Points never expire, giving you unlimited time to use them</li>
                    <li>This policy protects against fraud and abuse</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Exceptions */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Exceptional Circumstances</h2>
                <div className="text-gray-400 space-y-3">
                  <p>We may consider refunds only in these rare cases:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-white">Duplicate Charges:</strong> If you were accidentally charged multiple times</li>
                    <li><strong className="text-white">Technical Errors:</strong> If XP Points were not credited due to a system error</li>
                    <li><strong className="text-white">Service Outage:</strong> If our service was unavailable for an extended period after purchase</li>
                  </ul>
                  <p className="mt-4">
                    To request a review, contact us at <a href="mailto:contact@xirevoa.com" className="text-yellow-400 hover:text-yellow-500 font-medium">contact@xirevoa.com</a> within 7 days of purchase with your transaction details.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Failed Generations */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Failed Generations</h2>
            <div className="text-gray-400 space-y-3">
              <p>
                If an image generation fails due to technical issues on our end, <strong className="text-white">the 3 XP will be automatically refunded to your account</strong>. 
                You don't need to contact support for generation failures.
              </p>
              <p>
                However, generations that fail due to inappropriate content, policy violations, or user error (e.g., uploading invalid images) will not be refunded.
              </p>
            </div>
          </section>

          {/* Before You Purchase */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Before You Purchase</h2>
            <div className="text-gray-400 space-y-3">
              <p>We recommend:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use your free 20 XP to test our service before purchasing</li>
                <li>Review our templates and features thoroughly</li>
                <li>Read our Terms of Service and Privacy Policy</li>
                <li>Start with a smaller package if you're unsure</li>
                <li>Remember that XP Points never expire</li>
              </ul>
            </div>
          </section>

          {/* Chargebacks */}
          <section className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">⚠️ Important: Chargebacks</h2>
            <p className="text-gray-400">
              Filing a chargeback instead of contacting us first may result in immediate account suspension. 
              If you have concerns about a charge, please reach out to our support team first. We're here to help resolve any issues.
            </p>
          </section>

          {/* Contact Support */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Questions or Concerns?</h2>
            <p className="text-gray-400 mb-4">
              If you have questions about this policy or believe you qualify for an exception, please contact us:
            </p>
            <a href="mailto:contact@xirevoa.com" className="text-yellow-400 hover:text-yellow-500 font-medium text-lg">
              contact@xirevoa.com
            </a>
          </section>
        </div>

        {/* Help Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <a 
            href="/faq"
            className="bg-zinc-900/50 border border-zinc-800 hover:border-yellow-500/50 rounded-xl p-6 transition-all duration-300 group"
          >
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400">Visit FAQ</h3>
            <p className="text-gray-400 text-sm">Get answers to common questions</p>
          </a>
          
          <a 
            href="/contact"
            className="bg-zinc-900/50 border border-zinc-800 hover:border-yellow-500/50 rounded-xl p-6 transition-all duration-300 group"
          >
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400">Contact Support</h3>
            <p className="text-gray-400 text-sm">Need help? We're here for you</p>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
