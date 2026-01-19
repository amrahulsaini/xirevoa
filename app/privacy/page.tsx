import Header from "../components/Header";
import Footer from "../components/Footer";
import { Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Privacy Policy</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: January 19, 2026</p>
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Information We Collect</h2>
                <div className="text-gray-400 space-y-3">
                  <p>We collect information that you provide directly to us when using Xirevoa AI:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Account information (username, email, profile picture)</li>
                    <li>Images you upload for AI transformation</li>
                    <li>Usage data and preferences</li>
                    <li>XP transaction history</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">How We Use Your Information</h2>
                <div className="text-gray-400 space-y-3">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide and improve our AI transformation services</li>
                    <li>Process and generate your images</li>
                    <li>Manage your account and XP balance</li>
                    <li>Communicate with you about service updates</li>
                    <li>Ensure platform security and prevent fraud</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Data Security</h2>
                <div className="text-gray-400 space-y-3">
                  <p>Your data security is our priority:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Enterprise-grade encryption for all data transmission</li>
                    <li>Secure storage with industry-standard protocols</li>
                    <li>Regular security audits and updates</li>
                    <li>Uploaded images are processed and not permanently stored</li>
                    <li>Generated images are automatically deleted after 30 days</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Your Rights</h2>
                <div className="text-gray-400 space-y-3">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access your personal data</li>
                    <li>Request data correction or deletion</li>
                    <li>Export your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Close your account at any time</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="text-gray-400 mb-3">
              We use third-party services to provide our AI transformation features:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
              <li>Google AI for image generation</li>
              <li>Authentication providers (Google OAuth)</li>
              <li>Payment processors (when implemented)</li>
            </ul>
            <p className="text-gray-400 mt-3">
              These services have their own privacy policies and data handling practices.
            </p>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 mb-3">
              If you have any questions about this Privacy Policy, please contact us:
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
