import { Metadata } from 'next';
import FindYourMatchClient from './FindYourMatchClient';

export const metadata: Metadata = {
  title: 'Find Your Perfect Match - AI Match Maker | Xirevoa',
  description: 'Upload your photo and let AI generate your perfect matching partner. See how you both look together!',
};

export default function FindYourMatchPage() {
  return <FindYourMatchClient />;
}
