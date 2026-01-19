import Header from "../components/Header";
import Footer from "../components/Footer";
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <Scale className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Terms of Service</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: January 19, 2026</p>
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-400">
                  By accessing and using Xirevoa AI, you accept and agree to be bound by the terms and provisions of this agreement. 
                  If you do not agree to these terms, please do not use our service.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">2. Use of Service</h2>
                <div className="text-gray-400 space-y-3">
                  <p>You agree to use Xirevoa AI only for lawful purposes. You must not:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Upload images containing illegal, offensive, or inappropriate content</li>
                    <li>Use the service to impersonate others or create deepfakes without consent</li>
                    <li>Attempt to reverse-engineer or exploit our AI technology</li>
                    <li>Share your account credentials with others</li>
                    <li>Use automated tools to scrape or abuse the service</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">3. XP Points & Payment</h2>
                <div className="text-gray-400 space-y-3">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>XP Points are virtual currency used within Xirevoa AI</li>
                    <li>Each AI image generation costs 3 XP Points</li>
                    <li>XP Points never expire once purchased</li>
                    <li>All purchases are final and non-refundable (see Refund Policy)</li>
                    <li>We reserve the right to adjust XP costs with prior notice</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <div className="text-gray-400 space-y-3">
              <p><strong className="text-white">Your Content:</strong> You retain all rights to images you upload. By using our service, you grant us a limited license to process your images for AI transformation purposes.</p>
              <p><strong className="text-white">Generated Images:</strong> Generated images are provided to you without watermarks. You may use them for personal and commercial purposes.</p>
              <p><strong className="text-white">Our Platform:</strong> All aspects of Xirevoa AI, including templates, designs, and technology, are protected by copyright and remain our property.</p>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">5. Prohibited Content</h2>
                <div className="text-gray-400 space-y-3">
                  <p>You may not upload or generate:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Images of minors without parental consent</li>
                    <li>Content that violates intellectual property rights</li>
                    <li>Offensive, violent, or adult content</li>
                    <li>Content intended to harass, defame, or harm others</li>
                    <li>Political propaganda or misinformation</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-400">
              Xirevoa AI is provided "as is" without warranties of any kind. We are not liable for any damages resulting from your use of the service, 
              including but not limited to data loss, service interruptions, or generated content issues.
            </p>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Account Termination</h2>
            <p className="text-gray-400">
              We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent activity, 
              or misuse the service. Unused XP Points may be forfeited upon termination for violations.
            </p>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
            <p className="text-gray-400">
              We may update these Terms of Service from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 mb-3">
              For questions about these Terms of Service:
            </p>
            <a href="mailto:contact@xirevoa.com" className="text-yellow-400 hover:text-yellow-500 font-medium">
              contact@xirevoa.com
            </a>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
