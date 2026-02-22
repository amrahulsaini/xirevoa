"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Sparkles, Download, RefreshCw, Loader2, Scissors, Wand2, Zap, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ImageHistoryModal from "./ImageHistoryModal";

interface HairstyleRecommendation {
  name: string;
  description: string;
  reason: string;
  aiPrompt: string;
}

interface QuickSuggestion {
  title: string;
  prompt: string;
  icon: string;
}

export default function FindYourLookClient() {
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
  const [selectedHairstyle, setSelectedHairstyle] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showImageReveal, setShowImageReveal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState<QuickSuggestion[]>([]);

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

  const handleHistoryImageSelect = async (imageSource: File | string) => {
    if (imageSource instanceof File) {
      setUploadedImage(imageSource);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageSource);
    } else {
      try {
        const response = await fetch(imageSource);
        const blob = await response.blob();
        const file = new File([blob], 'selected-image.jpg', { type: blob.type });
        setUploadedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    }
    setRecommendations([]);
    setGeneratedImage(null);
    setFaceAnalysis('');
    setShowHistoryModal(false);
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
      
      // Generate quick suggestions
      const suggestions: QuickSuggestion[] = [
        { title: "Make my hair curly", prompt: "Transform this person's hairstyle to beautiful curly hair with natural curls, maintaining their facial features and expression. Professional photography, 8K quality.", icon: "✨" },
        { title: "Add highlights", prompt: "Add beautiful blonde highlights to this person's hair while keeping their natural base color, maintaining their facial features. Professional salon quality, 8K.", icon: "💫" },
        { title: "Short pixie cut", prompt: "Transform this person's hairstyle to a trendy short pixie cut, maintaining their facial features and natural beauty. Modern style, professional photography, 8K.", icon: "✂️" },
        { title: "Long wavy style", prompt: "Transform this person's hairstyle to long, flowing wavy hair with natural texture, maintaining their facial features. Professional photography, 8K quality.", icon: "🌊" }
      ];
      setQuickSuggestions(suggestions);
    } catch (error: any) {
      alert(error.message || 'Failed to analyze face');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateWithHairstyle = async (hairstyleName: string, aiPrompt: string) => {
    if (!uploadedImage || !session) return;
    
    setGenerating(true);
    setSelectedHairstyle(hairstyleName);
    setProgress(0);
    setShowImageReveal(false);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 85) return prev + Math.random() * 15;
        return prev;
      });
    }, 600);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('prompt', aiPrompt);
      formData.append('model', 'gemini-2.5-flash-image');
      formData.append('isUniversalHairstyle', 'true');

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      clearInterval(progressInterval);
      setProgress(100);
      
      // Delay for smooth reveal animation
      setTimeout(() => {
        setGeneratedImage(data.imageUrl);
        setShowImageReveal(true);
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      alert(error.message || 'Failed to generate');
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 800);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setRecommendations([]);
    setFaceAnalysis('');
    setGeneratedImage(null);
    setSelectedHairstyle(null);
    setShowImageReveal(false);
    setProgress(0);
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
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload New
            </button>
            {session && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex-1 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-5 h-5" />
                From Gallery
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Image Preview */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-visible bg-zinc-900 border-2 border-zinc-800">
                {generating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-md">
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                      {/* Animated background effects */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 bg-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute w-80 h-80 bg-purple-500/10 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
                        <div className="absolute w-96 h-96 bg-pink-500/5 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
                      </div>
                      
                      {/* Main card */}
                      <div className="relative z-10 w-full max-w-md">
                        <div className="bg-zinc-900/80 backdrop-blur-xl border-2 border-zinc-700/50 rounded-2xl p-8 shadow-2xl">
                          {/* Animated icon */}
                          <div className="mb-6 relative">
                            <div className="w-24 h-24 mx-auto relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl animate-pulse" />
                              <div className="absolute inset-0 border-4 border-zinc-700/50 rounded-2xl" />
                              <div className="absolute inset-0 border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-transparent rounded-2xl animate-spin" style={{ animationDuration: '2s' }} />
                              <Wand2 className="absolute inset-0 m-auto w-10 h-10 text-white animate-pulse" />
                            </div>
                          </div>
                          
                          {/* Title and subtitle */}
                          <h3 className="text-2xl font-black text-white mb-2 text-center">✨ Creating Magic...</h3>
                          <p className="text-zinc-400 text-center mb-6">Applying {selectedHairstyle}</p>
                          
                          {/* Large progress percentage */}
                          <div className="text-center mb-6">
                            <span className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          
                          {/* Enhanced progress bar */}
                          <div className="relative">
                            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                              >
                                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-zinc-500">
                              <span>Processing...</span>
                              <span>Almost there!</span>
                            </div>
                          </div>
                          
                          {/* Progress stages */}
                          <div className="mt-6 space-y-2">
                            <div className={`flex items-center gap-2 transition-opacity ${progress > 0 ? 'opacity-100' : 'opacity-30'}`}>
                              <div className={`w-2 h-2 rounded-full ${progress > 0 ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                              <span className="text-sm text-zinc-400">Analyzing your photo</span>
                            </div>
                            <div className={`flex items-center gap-2 transition-opacity ${progress > 30 ? 'opacity-100' : 'opacity-30'}`}>
                              <div className={`w-2 h-2 rounded-full ${progress > 30 ? 'bg-purple-500' : 'bg-zinc-700'}`} />
                              <span className="text-sm text-zinc-400">Generating hairstyle</span>
                            </div>
                            <div className={`flex items-center gap-2 transition-opacity ${progress > 70 ? 'opacity-100' : 'opacity-30'}`}>
                              <div className={`w-2 h-2 rounded-full ${progress > 70 ? 'bg-pink-500' : 'bg-zinc-700'}`} />
                              <span className="text-sm text-zinc-400">Finalizing details</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Floating decorative elements */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <Sparkles className="absolute top-[20%] left-[15%] w-5 h-5 text-blue-400 animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
                        <Sparkles className="absolute top-[30%] right-[20%] w-4 h-4 text-purple-400 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
                        <Sparkles className="absolute bottom-[35%] left-[25%] w-6 h-6 text-pink-400 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
                        <Zap className="absolute top-[50%] right-[30%] w-5 h-5 text-yellow-400 animate-ping" style={{ animationDelay: '0.2s' }} />
                        <Scissors className="absolute bottom-[25%] right-[15%] w-5 h-5 text-blue-300 animate-pulse" style={{ animationDelay: '0.8s' }} />
                      </div>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <div className={`relative w-full h-full ${showImageReveal ? 'animate-reveal' : ''}`}>
                    <Image src={generatedImage} alt="Generated" fill className="object-cover" />
                  </div>
                ) : (
                  <Image src={imagePreview} alt="Your photo" fill className="object-cover" />
                )}
              </div>
              
              {generatedImage ? (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={generatedImage}
                    download="xirevoa-hairstyle.png"
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button
                    onClick={reset}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
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

            {quickSuggestions.length > 0 && !recommendations.length && (
              <div className="space-y-3 mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Quick AI Suggestions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => generateWithHairstyle(suggestion.title, suggestion.prompt)}
                      disabled={generating}
                      className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all text-left disabled:opacity-50"
                    >
                      <div className="text-2xl mb-1">{suggestion.icon}</div>
                      <div className="text-sm font-semibold text-white">{suggestion.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Recommended Styles</h3>
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
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
                      onClick={() => generateWithHairstyle(rec.name, rec.aiPrompt)}
                      disabled={generating}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      {generating && selectedHairstyle === rec.name ? (
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
        </div>
      )}

      {/* Image History Modal */}
      {showHistoryModal && (
        <ImageHistoryModal
          onSelectImage={handleHistoryImageSelect}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
