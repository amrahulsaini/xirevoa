import FindYourLookClient from '../components/FindYourLookClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Your Look - Men\'s Hairstyle Recommendations | Xirevoa',
  description: 'Upload your photo and let AI recommend the best hairstyles for your face shape. Get personalized men\'s hairstyle suggestions with AI.',
};

export default function FindYourLookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <FindYourLookClient />
    </div>
  );
}
