import FindYourLookClient from '../components/FindYourLookClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TemplatesMasonry from '../components/TemplatesMasonry';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Find Your Look - AI Hairstyle Recommendations | Xirevoa',
  description: 'Upload your photo and let AI recommend the best hairstyles for your face shape. Get personalized hairstyle suggestions with AI.',
};

export default async function FindYourLookPage() {

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <div className="h-16 sm:h-20"></div>
        
        <FindYourLookClient />
        
        {/* All Templates */}
        <section className="w-full py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <TemplatesMasonry currentTemplateId={0} tags="" category="" />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
