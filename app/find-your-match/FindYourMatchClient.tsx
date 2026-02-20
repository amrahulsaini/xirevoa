'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface GeneratedImages {
  userImageUrl: string;
  partnerImageUrl: string;
  coupleImageUrl: string;
}

export default function FindYourMatchClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<'girl' | 'boy'>('girl');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'generating' | 'results'>('upload');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages | null>(null);
  const [enhancementPrompt, setEnhancementPrompt] = useState('');
  const [enhancing, setEnhancing] = useState<'user' | 'partner' | 'couple' | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleGenerate = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!selectedFile) return;

    setLoading(true);
    setStep('generating');

    try {
      // Upload user's photo
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('gender', gender);

      const response = await fetch('/api/find-match/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedImages(data);
      setStep('results');
    } catch (error: any) {
      alert(error.message || 'Failed to generate match');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancement = async (target: 'user' | 'partner' | 'couple', preset?: string) => {
    if (!generatedImages) return;

    setEnhancing(target);
    const prompt = preset || enhancementPrompt;

    try {
      const response = await fetch('/api/find-match/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: target === 'user' ? generatedImages.userImageUrl : 
                    target === 'partner' ? generatedImages.partnerImageUrl : 
                    generatedImages.coupleImageUrl,
          prompt,
          target,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Enhancement failed');
      }

      const data = await response.json();
      
      // Update the specific image
      setGeneratedImages({
        ...generatedImages,
        [target === 'user' ? 'userImageUrl' : 
         target === 'partner' ? 'partnerImageUrl' : 
         'coupleImageUrl']: data.enhancedImageUrl,
      });

      setEnhancementPrompt('');
    } catch (error: any) {
      alert(error.message || 'Failed to enhance image');
    } finally {
      setEnhancing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Find Your Perfect Match
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your photo and let AI generate your ideal partner, then see how you both look together!
          </p>
        </div>

        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            {/* Gender Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">I am a:</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender('girl')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
                    gender === 'girl'
                      ? 'bg-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👧 Girl
                </button>
                <button
                  onClick={() => setGender('boy')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
                    gender === 'boy'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👦 Boy
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">Upload Your Photo:</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  {previewUrl ? (
                    <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">📸</div>
                      <p className="text-gray-600">Click to upload your photo</p>
                      <p className="text-sm text-gray-400 mt-2">Clear, front-facing photos work best</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || loading}
              className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Your Match...' : '✨ Find My Perfect Match'}
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin text-6xl mb-6">💫</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Creating Your Perfect Match...</h2>
            <p className="text-gray-600">AI is analyzing your features and generating your ideal partner</p>
            <div className="mt-8 space-y-3 max-w-md mx-auto">
              <div className="bg-white rounded-lg p-3 shadow animate-pulse">
                <p className="text-sm text-gray-600">🔍 Analyzing your photo...</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow animate-pulse delay-100">
                <p className="text-sm text-gray-600">🎨 Generating your perfect match...</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow animate-pulse delay-200">
                <p className="text-sm text-gray-600">💑 Creating couple photo...</p>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && generatedImages && (
          <div className="space-y-8">
            {/* Results Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* User Image */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={generatedImages.userImageUrl}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-3">You</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleEnhancement('user', 'Make me more beautiful')}
                      disabled={enhancing === 'user'}
                      className="w-full bg-pink-100 text-pink-700 py-2 rounded-lg hover:bg-pink-200 transition disabled:opacity-50"
                    >
                      {enhancing === 'user' ? '✨ Enhancing...' : '✨ Make Me More Beautiful'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Partner Image */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={generatedImages.partnerImageUrl}
                    alt="Your Match"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-3">Your Perfect Match</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleEnhancement('partner', 'Make them more handsome/beautiful')}
                      disabled={enhancing === 'partner'}
                      className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
                    >
                      {enhancing === 'partner' ? '✨ Enhancing...' : '✨ Make Them More Attractive'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Couple Image */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={generatedImages.coupleImageUrl}
                    alt="Together"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-3">Together ❤️</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleEnhancement('couple', 'Make this couple photo more romantic')}
                      disabled={enhancing === 'couple'}
                      className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                    >
                      {enhancing === 'couple' ? '✨ Enhancing...' : '✨ Make More Romantic'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Enhancement */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
              <h3 className="font-bold text-lg mb-4">Custom Enhancement</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={enhancementPrompt}
                  onChange={(e) => setEnhancementPrompt(e.target.value)}
                  placeholder="Type your custom enhancement (e.g., 'Add smile', 'Better lighting')"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => {
                    if (!enhancementPrompt) return;
                    handleEnhancement('couple', enhancementPrompt);
                  }}
                  disabled={!enhancementPrompt || enhancing !== null}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Try Again Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setStep('upload');
                  setGeneratedImages(null);
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                🔄 Try Another Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
