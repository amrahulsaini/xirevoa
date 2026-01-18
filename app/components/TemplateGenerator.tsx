"use client";

import { useState } from "react";
import { Upload, Wand2, Download, RefreshCw, Maximize2, X } from "lucide-react";
import Image from "next/image";
import RelatedTemplates from "./RelatedTemplates";

interface TemplateGeneratorProps {
  template: {
    id: number;
    title: string;
    description: string;
    image: string;
    aiPrompt: string;
  };
  isOutfit?: boolean;
  tags?: string;
}

export default function TemplateGenerator({ template, isOutfit = false, tags = '' }: TemplateGeneratorProps) {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    setUserImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!userImage) {
      alert('Please upload your photo first');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Upload user image
      setProgress(20);
      const formData = new FormData();
      formData.append('file', userImage);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await uploadRes.json();
      setProgress(40);

      // Generate AI image
      const generateFormData = new FormData();
      generateFormData.append('image', userImage);
      generateFormData.append('templateId', template.id.toString());
      generateFormData.append('isOutfit', isOutfit.toString());
      if (template.aiPrompt) {
        generateFormData.append('prompt', template.aiPrompt);
      }

      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        body: generateFormData,
      });

      setProgress(80);

      if (!generateRes.ok) {
        const error = await generateRes.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const result = await generateRes.json();
      console.log('Generate result:', result);
      setGeneratedImage(result.imageUrl);
      setProgress(100);
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(`Failed to generate: ${error.message}`);
      setGenerating(false);
      setProgress(0);
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleReset = () => {
    setUserImage(null);
    setUserImagePreview(null);
    setGeneratedImage(null);
    setProgress(0);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Template Info */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
          {template.title}
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{template.description}</p>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Template Card */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 lg:sticky lg:top-24">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">Template Preview</h3>
            <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-700">
              <img 
                src={template.image} 
                alt={template.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right: Generation Interface and Related Templates */}
        <div className="flex-1 space-y-6">
          {/* Generation Interface */}
          <div>
        {/* Upload Section */}
        {!generatedImage && !generating && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Upload Your Photo</h3>
            
            {userImagePreview ? (
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <div className="w-full h-full rounded-lg overflow-hidden border border-zinc-700">
                    <img src={userImagePreview} alt="Your photo" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => {
                      setUserImage(null);
                      setUserImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs hover:bg-red-700 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm mb-4">Your photo is ready to transform!</p>
                  <button
                    onClick={handleGenerate}
                    disabled={!userImage || generating}
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-5 h-5" />
                    Generate Magic ✨
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full py-16 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors">
                <Upload className="w-12 h-12 text-zinc-600 mb-4" />
                <span className="text-zinc-500 text-center px-4">
                  Click to upload your photo
                  <br />
                  <span className="text-xs">Max 10MB • JPG, PNG, WEBP</span>
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        )}

        {/* Generating State */}
        {generating && (
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 mb-6">
                {userImagePreview && (
                  <img 
                    src={userImagePreview} 
                    alt="Processing" 
                    className="w-full h-full object-cover rounded-lg blur-sm opacity-50" 
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="text-white font-bold text-xl mb-2">Creating Your Magic...</p>
              <p className="text-yellow-400 font-bold text-2xl mb-4">{progress}%</p>
              <div className="w-full max-w-md h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Result Section */}
        {generatedImage && !generating && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yellow-400">✨ You'll Love This!</h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Another
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border-2 border-zinc-700 group max-w-md mx-auto">
                <img src={generatedImage} alt="Generated" className="w-full h-auto" />
                <button
                  onClick={() => setShowFullScreen(true)}
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-lg text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-3 max-w-md mx-auto">
                <button
                  onClick={() => setShowFullScreen(true)}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-5 h-5" />
                  Full Screen Preview
                </button>
                <a
                  href={generatedImage}
                  download="xirevoa-generated.png"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>
            </div>
          </div>
        )}
          </div>

          {/* Related Templates - Desktop Only */}
          <div className="hidden lg:block">
            <RelatedTemplates currentTemplateId={template.id} tags={tags} />
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {showFullScreen && generatedImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullScreen(false)}
        >
          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={generatedImage} 
            alt="Generated Full Screen" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
