'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Wand2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Template {
  id: number;
  title: string;
  description: string;
  image_url: string;
  ai_prompt: string | null;
  coming_soon: boolean;
}

export default function GenPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/templates');
      const data = await res.json();
      setTemplates(data.filter((t: Template) => t.ai_prompt && !t.coming_soon));
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !uploadedFile) return;

    setGenerating(true);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('templateId', selectedTemplate.id.toString());
      formData.append('prompt', selectedTemplate.ai_prompt || '');

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Generation failed');
      }

      const data = await res.json();
      setGeneratedImage(data.imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const resetGeneration = () => {
    setSelectedTemplate(null);
    setUploadedImage(null);
    setUploadedFile(null);
    setGeneratedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 rounded-2xl blur-xl opacity-50" />
                <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center font-black text-black text-2xl shadow-lg">
                  X
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  AI Generator
                </h1>
                <p className="text-xs text-zinc-500">Create Your Transformation</p>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {!selectedTemplate ? (
          // Template Selection
          <div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">Choose Your Transformation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="group cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-yellow-400 transition-all"
                >
                  <div className="relative h-64">
                    <Image
                      src={template.image_url}
                      alt={template.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{template.title}</h3>
                    <p className="text-zinc-400 text-sm">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Generation Interface
          <div>
            <button
              onClick={resetGeneration}
              className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors mb-8"
            >
              <ArrowLeft size={20} />
              Choose Different Template
            </button>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Upload & Preview */}
              <div className="space-y-6">
                <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                    {selectedTemplate.title}
                  </h3>
                  <p className="text-zinc-400 mb-6">{selectedTemplate.description}</p>

                  {/* Upload Area */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Upload Your Photo</label>
                    {!uploadedImage ? (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-yellow-400 transition-colors">
                        <Upload className="w-12 h-12 text-zinc-600 mb-2" />
                        <span className="text-zinc-500">Click to upload image</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    ) : (
                      <div className="relative h-64 rounded-xl overflow-hidden">
                        <Image src={uploadedImage} alt="Uploaded" fill className="object-cover" />
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setUploadedFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={!uploadedImage || generating}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Transformation
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right: Generated Result */}
              <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Generated Result</h3>
                {generating ? (
                  <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="w-16 h-16 animate-spin text-yellow-400 mb-4" />
                    <p className="text-zinc-400">Creating your transformation...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative h-96 rounded-xl overflow-hidden">
                      <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-4">
                      <a
                        href={generatedImage}
                        download
                        className="flex-1 bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors text-center"
                      >
                        Download Image
                      </a>
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedFile(null);
                          setGeneratedImage(null);
                        }}
                        className="flex-1 bg-zinc-700 font-bold py-3 rounded-xl hover:bg-zinc-600 transition-colors"
                      >
                        Generate Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
                    <Wand2 className="w-16 h-16 mb-4 opacity-50" />
                    <p>Your generated image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
