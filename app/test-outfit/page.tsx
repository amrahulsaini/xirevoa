"use client";

import { useState, useRef } from "react";
import { Upload, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";

export default function TestOutfitPage() {
  const [outfitImage, setOutfitImage] = useState<File | null>(null);
  const [outfitPreview, setOutfitPreview] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>('');
  
  const outfitInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);

  const handleOutfitSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOutfitImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOutfitPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFacePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!outfitImage || !faceImage) {
      alert('Please upload both images');
      return;
    }

    setGenerating(true);
    setLogs('');
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      formData.append('outfitImage', outfitImage);
      formData.append('faceImage', faceImage);

      const response = await fetch('/api/test-outfit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setLogs(data.logs || '');
        alert(data.error || 'Generation failed');
        return;
      }

      setGeneratedImage(data.imageUrl);
      setLogs(data.logs);
    } catch (error: any) {
      setLogs(`Error: ${error.message}`);
      alert('Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-2 text-center">🧪 Outfit Generation Test</h1>
        <p className="text-zinc-400 text-center mb-8">Testing Google's recommended pattern</p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Outfit Image */}
          <div>
            <h3 className="text-lg font-bold mb-3">1. Outfit/Template Image</h3>
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center">
              {outfitPreview ? (
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                  <Image src={outfitPreview} alt="Outfit" fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-square bg-zinc-900 rounded-lg mb-3 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-zinc-600" />
                </div>
              )}
              <input
                ref={outfitInputRef}
                type="file"
                accept="image/*"
                onChange={handleOutfitSelect}
                className="hidden"
              />
              <button
                onClick={() => outfitInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
              >
                Upload Outfit
              </button>
            </div>
          </div>

          {/* Face Image */}
          <div>
            <h3 className="text-lg font-bold mb-3">2. Face/Person Image</h3>
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center">
              {facePreview ? (
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                  <Image src={facePreview} alt="Face" fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-square bg-zinc-900 rounded-lg mb-3 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-zinc-600" />
                </div>
              )}
              <input
                ref={faceInputRef}
                type="file"
                accept="image/*"
                onChange={handleFaceSelect}
                className="hidden"
              />
              <button
                onClick={() => faceInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
              >
                Upload Face
              </button>
            </div>
          </div>

          {/* Generated Result */}
          <div>
            <h3 className="text-lg font-bold mb-3">3. Generated Result</h3>
            <div className="border-2 border-zinc-700 rounded-xl p-4 text-center">
              {generatedImage ? (
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                  <Image src={generatedImage} alt="Generated" fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-square bg-zinc-900 rounded-lg mb-3 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-zinc-600" />
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={generating || !outfitImage || !faceImage}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-zinc-700 disabled:to-zinc-700 rounded-lg font-bold"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Generate Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            📋 Generation Logs
          </h3>
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-black p-4 rounded-lg overflow-auto max-h-96">
            {logs || 'Logs will appear here after generation...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
