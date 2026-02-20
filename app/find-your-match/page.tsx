import { Metadata } from 'next';
import FindYourMatchClient from './FindYourMatchClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TemplatesMasonry from '../components/TemplatesMasonry';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Find Your Perfect Match - AI Match Maker | Xirevoa',
  description: 'Upload your photo and let AI generate your perfect matching partner. See how you both look together!',
};

export default function FindYourMatchPage() {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <div className="h-16 sm:h-20"></div>
        
        <FindYourMatchClient />
        
        {/* All Templates */}
        <section className="w-full py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <TemplatesMasonry currentTemplateId={0} />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
