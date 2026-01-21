"use client";

import { useState, useRef } from "react";
import { Upload, Sparkles, Download, RefreshCw, Loader2, Scissors } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HairstyleRecommendation {
  name: string;
  description: string;
  reason: string;
  templateId: number;
}

interface Template {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  tags: string;
  comingSoon?: boolean;
}

interface Props {
  hairstyleTemplates: Template[];
}

// Map template IDs to face shapes for smart recommendations
const TEMPLATE_FACE_SHAPES: Record<number, string[]> = {
  23: ["oval", "square", "rectangular"],
  24: ["round", "oval", "heart"],
  25: ["square", "round", "oval"],
  26: ["oval", "rectangular", "diamond"],
  27: ["oval", "square", "heart"],
};

export default function FindYourLookClient({ hairstyleTemplates }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<HairstyleRecommendation[]>([]);
  const [faceAnalysis, setFaceAnalysis] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRecommendations([]);
      setGeneratedImage(null);
      setFaceAnalysis('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRecommendations([]);
      setGeneratedImage(null);
      setFaceAnalysis('');
    }
  };

  const analyzeAndRecommend = async () => {
    if (!uploadedImage || !session) {
      router.push('/auth/login');
      return;
    }

    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      
      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setFaceAnalysis(data.faceShape);
      setRecommendations(data.recommendations);
    } catch (error: any) {
      alert(error.message || 'Failed to analyze face');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateWithTemplate = async (templateId: number) => {
    if (!uploadedImage || !session) return;
    
    setGenerating(true);
    setSelectedTemplate(templateId);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('templateId', templateId.toString());

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedImage(data.imageUrl);
    } catch (error: any) {
      alert(error.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setRecommendations([]);
    setFaceAnalysis('');
    setGeneratedImage(null);
    setSelectedHairstyle(null);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-6">
          <Scissors className="w-6 h-6 text-blue-400" />
          <span className="text-sm font-semibold text-blue-400">AI-Powered Recommendations</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Find Your Perfect Look
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          Upload your photo and let our AI analyze your face shape to recommend the most flattering hairstyles
        </p>
      </div>

      {/* Upload Section */}
      {!imagePreview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`max-w-2xl mx-auto border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-zinc-500" />
          <h3 className="text-2xl font-bold mb-2">Upload Your Photo</h3>
          <p className="text-zinc-400 mb-6">Drag and drop or click to select</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
          >
            Choose Photo
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Image Preview */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900">
              {generatedImage ? (
                <Image src={generatedImage} alt="Generated" fill className="object-cover" />
              ) : (
                <Image src={imagePreview} alt="Your photo" fill className="object-cover" />
              )}
            </div>
            
            {generatedImage ? (
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={generatedImage}
                  download="xirevoa-hairstyle.png"
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={reset}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Another
                </button>
              </div>
            ) : (
              <button
                onClick={analyzeAndRecommend}
                disabled={analyzing || recommendations.length > 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze & Recommend
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right: Recommendations */}
          <div className="space-y-6">
            {faceAnalysis && (
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Face Analysis
                </h3>
                <p className="text-zinc-300">{faceAnalysis}</p>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Recommended Styles</h3>
                {recommendations.map((rec) => (
                  <div
                    key={rec.templateId}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-white">{rec.name}</h4>
                        <p className="text-sm text-zinc-400">{rec.description}</p>
                      </div>
                    </div>
                    <p className="text-sm text-blue-400 mb-3">{rec.reason}</p>
                    <button
                      onClick={() => generateWithTemplate(rec.templateId)}
                      disabled={generating}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      {generating && selectedTemplate === rec.templateId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Try This Style (3 XP)
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!recommendations.length && !analyzing && (
              <div className="text-center py-12 text-zinc-500">
                <Scissors className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Upload a photo to get personalized recommendations</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Hairstyles Section */}
      {hairstyleTemplates.length > 0 && (
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">All Hairstyle Templates</h2>
            <p className="text-zinc-400">Explore our collection of AI-powered hairstyle transformations</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {hairstyleTemplates.map((template) => (
              <Link
                key={template.id}
                href={`/${template.id}`}
                className="group bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02]"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <Image
                    src={template.image}
                    alt={template.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-zinc-400 line-clamp-2">{template.description}</p>
                  {template.comingSoon && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
