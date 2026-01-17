"use client";

import { useState } from "react";
import { Upload, Wand2, Download, RefreshCw } from "lucide-react";
import Image from "next/image";

interface TemplateGeneratorProps {
  template: {
    id: number;
    title: string;
    description: string;
    image: string;
    aiPrompt: string;
  };
}

export default function TemplateGenerator({ template }: TemplateGeneratorProps) {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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
    <div className="max-w-6xl mx-auto">
      {/* Template Info */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
          {template.title}
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{template.description}</p>
      </div>

      {/* Generator Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Upload Section - Hidden during generation */}
        {!generating && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Upload Your Photo</h3>
            
            {userImagePreview ? (
              <div className="relative mb-4">
                <div className="aspect-square rounded-lg overflow-hidden border border-zinc-700">
                  <img src={userImagePreview} alt="Your photo" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => {
                    setUserImage(null);
                    setUserImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors">
                <Upload className="w-12 h-12 text-zinc-600 mb-4" />
                <span className="text-zinc-500 text-center px-4">
                  Click to upload your photo
                  <br />
                  <span className="text-xs">Max 10MB</span>
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}

            <button
              onClick={handleGenerate}
              disabled={!userImage || generating}
              className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Wand2 className="w-5 h-5" />
              Generate Image
            </button>
          </div>
        )}

        {/* Result Section - Full width during generation */}
        <div className={`bg-zinc-900 rounded-2xl p-6 border border-zinc-800 ${generating ? 'md:col-span-2' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-yellow-400">Generated Result</h3>
            {generatedImage && !generating && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Another
              </button>
            )}
          </div>
          
          <div className="aspect-square rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800/50 flex items-center justify-center relative">
            {generating ? (
              <div className="relative w-full h-full">
                {userImagePreview && (
                  <img 
                    src={userImagePreview} 
                    alt="Processing" 
                    className="w-full h-full object-cover blur-md opacity-50" 
                  />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                  <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white font-bold text-lg mb-2">Generating Magic...</p>
                  <p className="text-yellow-400 font-bold text-xl">{progress}%</p>
                  <div className="w-64 h-2 bg-zinc-700 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : generatedImage ? (
              <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-zinc-600">
                <Wand2 className="w-12 h-12 mx-auto mb-2" />
                <p>Your generated image will appear here</p>
              </div>
            )}
          </div>

          {generatedImage && !generating && (
            <a
              href={generatedImage}
              download="xirevoa-generated.png"
              className="w-full mt-4 px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Image
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
