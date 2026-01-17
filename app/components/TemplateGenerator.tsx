"use client";

import { useState } from "react";
import { Upload, Wand2, Download } from "lucide-react";
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

      const { generatedImageUrl } = await generateRes.json();
      setGeneratedImage(generatedImageUrl);
      setProgress(100);
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(`Failed to generate: ${error.message}`);
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 500);
    }
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
        {/* Upload Section */}
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
            {generating ? `Generating... ${progress}%` : 'Generate Image'}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Generated Result</h3>
          
          <div className="aspect-square rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800/50 flex items-center justify-center">
            {generatedImage ? (
              <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-zinc-600">
                <Wand2 className="w-12 h-12 mx-auto mb-2" />
                <p>Your generated image will appear here</p>
              </div>
            )}
          </div>

          {generatedImage && (
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
