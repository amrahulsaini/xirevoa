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
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-20">
        <FindYourLookClient />
        
        {/* All Templates */}
        <section className="w-full py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <TemplatesMasonry currentTemplateId={0} tags="hairstyle,hair,style" category="hairstyle" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
