"use client";

import { useState, useEffect } from "react";
import { Upload, Wand2, Download, RefreshCw, Maximize2, X, Edit3, Sparkles, ArrowRight, Settings, Check, Lightbulb } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import InsufficientXPModal from "./InsufficientXPModal";

interface Model {
  model_id: string;
  model_name: string;
  xp_cost: number;
  is_active: boolean;
}

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
  const { data: session } = useSession();
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Model selection
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash-exp');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  
  // AI Enhancement Suggestions
  const [enhancementSuggestions, setEnhancementSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('/api/models');
        const data = await res.json();
        setModels(data.models || []);
        setSelectedModel(data.userPreferredModel || 'gemini-2.0-flash-exp');
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoadingModels(false);
      }
    };
    
    if (session) {
      fetchModels();
    } else {
      setLoadingModels(false);
    }
  }, [session]);

  // Fetch AI enhancement suggestions
  const fetchEnhancementSuggestions = async (imageUrl: string) => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch('/api/enhancement-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setEnhancementSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 10MB');
      return;
    }

    setErrorMessage(null);
    setUserImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!userImage) {
      setErrorMessage('Please upload your photo first');
      return;
    }

    if (!session) {
      setShowXPModal(true);
      return;
    }

    // Get XP cost for selected model
    const modelData = models.find(m => m.model_id === selectedModel);
    const requiredXP = modelData?.xp_cost || 3;
    const currentXP = (session?.user as any)?.xpoints || 0;
    
    if (currentXP < requiredXP) {
      setShowXPModal(true);
      return;
    }

    setErrorMessage(null);
    setGenerating(true);
    setProgress(0);

    try {
      setProgress(10);

      // Save model preference if checkbox is checked
      if (saveAsDefault && selectedModel) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferredModel: selectedModel }),
        });
      }

      const generateFormData = new FormData();
      generateFormData.append('image', userImage);
      generateFormData.append('templateId', template.id.toString());
      generateFormData.append('isOutfit', isOutfit.toString());
      generateFormData.append('selectedModel', selectedModel);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 70) return prev + 10;
          return prev;
        });
      }, 800);

      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        body: generateFormData,
      });

      clearInterval(progressInterval);
      setProgress(90);

      if (!generateRes.ok) {
        const error = await generateRes.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const result = await generateRes.json();
      setGeneratedImage(result.imageUrl);
      setModelUsed(result.modelUsed || modelData?.model_name || 'Unknown');
      setProgress(100);
      
      // Fetch enhancement suggestions
      if (result.imageUrl) {
        fetchEnhancementSuggestions(result.imageUrl);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setErrorMessage(error.message || 'Failed to generate image');
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
    setModelUsed('');
    setCustomPrompt('');
    setShowPromptEditor(false);
    setEnhancementSuggestions([]);
  };

  const handleEditPrompt = async () => {
    if (!customPrompt.trim() || !generatedImage) {
      setErrorMessage('Please enter a prompt to refine your image');
      return;
    }

    if (!session) {
      setShowXPModal(true);
      return;
    }

    const currentXP = (session?.user as any)?.xpoints || 0;
    const requiredXP = 3;
    
    if (currentXP < requiredXP) {
      setShowXPModal(true);
      return;
    }

    setErrorMessage(null);
    setGenerating(true);
    setProgress(0);

    try {
      setProgress(10);

      // Convert the image URL to a file
      const imageRes = await fetch(generatedImage);
      const imageBlob = await imageRes.blob();
      const imageFile = new File([imageBlob], 'generated.png', { type: 'image/png' });

      const editFormData = new FormData();
      editFormData.append('image', imageFile);
      editFormData.append('customPrompt', customPrompt);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 70) return prev + 10;
          return prev;
        });
      }, 800);

      const editRes = await fetch('/api/edit-prompt', {
        method: 'POST',
        body: editFormData,
      });

      clearInterval(progressInterval);
      setProgress(90);

      if (!editRes.ok) {
        const error = await editRes.json();
        throw new Error(error.error || 'Failed to edit image');
      }

      const result = await editRes.json();
      setGeneratedImage(result.imageUrl);
      setModelUsed(result.modelUsed || modelUsed);
      setProgress(100);
      setShowPromptEditor(false);
      setCustomPrompt('');
      
      // Refresh suggestions
      if (result.imageUrl) {
        fetchEnhancementSuggestions(result.imageUrl);
      }
    } catch (error: any) {
      console.error('Edit error:', error);
      setErrorMessage(error.message || 'Failed to edit image');
      setGenerating(false);
      setProgress(0);
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const selectedModelData = models.find(m => m.model_id === selectedModel);

  return (
    <div className="max-w-7xl mx-auto overflow-x-hidden">
      {errorMessage && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
          {template.title}
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{template.description}</p>
      </div>

      {/* Model Selector */}
      {!generatedImage && !generating && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Choose AI Model</h3>
          </div>
          
          {loadingModels ? (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {models.map((model) => (
                  <button
                    key={model.model_id}
                    onClick={() => model.is_active && setSelectedModel(model.model_id)}
                    disabled={!model.is_active}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      selectedModel === model.model_id && model.is_active
                        ? 'border-purple-400 bg-purple-500/20'
                        : model.is_active
                        ? 'border-zinc-700 bg-zinc-800 hover:border-purple-400/50'
                        : 'border-zinc-800 bg-zinc-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {selectedModel === model.model_id && model.is_active && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-purple-400" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-bold text-white text-sm mb-1">{model.model_name}</p>
                      <p className="text-xs text-purple-400 font-bold">{model.xp_cost} XP</p>
                      {!model.is_active && (
                        <p className="text-xs text-zinc-500 mt-1">Coming Soon</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {session && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-300">Save as my default model</span>
                </label>
              )}
              
              <p className="text-xs text-zinc-500 mt-3">
                You can change your default model anytime from Settings
              </p>
            </>
          )}
        </div>
      )}

      {/* Main Generation Area */}
      {!generatedImage && !generating && (
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Upload Your Photo</h3>
          {userImagePreview ? (
            <div className="space-y-4">
              <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden border-2 border-zinc-700">
                <img src={userImagePreview} alt="Your photo" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setUserImage(null);
                    setUserImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full hover:bg-red-700 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!userImage || generating}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-lg"
              >
                <Wand2 className="w-6 h-6" />
                Generate with {selectedModelData?.model_name || 'AI'} ({selectedModelData?.xp_cost || 3} XP)
              </button>
            </div>
          ) : (
            <label className="block aspect-square max-w-md mx-auto border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-yellow-400 transition-colors">
              <div className="h-full flex flex-col items-center justify-center p-8">
                <Upload className="w-20 h-20 text-zinc-600 mb-4" />
                <span className="text-zinc-400 text-center font-bold text-lg mb-2">
                  Click to upload your photo
                </span>
                <span className="text-sm text-zinc-500">Max 10MB • JPG, PNG, WEBP</span>
              </div>
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

      {/* Generating */}
      {generating && (
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <div className="aspect-square max-w-md mx-auto flex flex-col items-center justify-center">
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
            <p className="text-white font-bold text-2xl mb-2">Creating Your Magic...</p>
            <p className="text-yellow-400 font-bold text-3xl mb-6">{progress}%</p>
            <div className="w-full max-w-md h-3 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Generated Result with Original Comparison */}
      {generatedImage && !generating && (
        <div className="space-y-6">
          {/* Before & After Comparison */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-2xl font-black text-yellow-400 mb-6 text-center">Your Transformation ✨</h3>
            
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
              {/* Original Image */}
              <div className="space-y-3">
                <p className="text-center text-sm font-bold text-zinc-400">Original Photo</p>
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-700">
                  <img src={userImagePreview || ''} alt="Original" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center md:block">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black w-12 h-12 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>

              {/* Generated Image */}
              <div className="space-y-3">
                <p className="text-center text-sm font-bold text-zinc-400">
                  Generated with {modelUsed}
                </p>
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-yellow-400 group">
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setShowFullScreen(true)}
                    className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-lg text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Enhancement Suggestions */}
          {(loadingSuggestions || enhancementSuggestions.length > 0) && (
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">AI Enhancement Ideas</h3>
              </div>
              
              {loadingSuggestions ? (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-zinc-400 mt-2">Analyzing your image...</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {enhancementSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCustomPrompt(suggestion);
                        setShowPromptEditor(true);
                      }}
                      className="p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-blue-400 rounded-xl text-left transition-all group"
                    >
                      <p className="text-sm text-zinc-300 group-hover:text-white">{suggestion}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Prompt Section */}
          {showPromptEditor ? (
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl p-6 space-y-4 shadow-lg shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-lg font-black text-white block">Refine Your Image</span>
                    <span className="text-xs text-purple-300">Use AI to enhance your result</span>
                  </div>
                  <span className="text-sm px-3 py-1.5 bg-purple-500 text-white rounded-full font-black shadow-lg">3 XP</span>
                </div>
                <button
                  onClick={() => {
                    setShowPromptEditor(false);
                    setCustomPrompt('');
                  }}
                  className="w-8 h-8 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Tell AI how to improve this image... Try: 'add dramatic cinematic lighting' or 'make background more vibrant'"
                className="w-full px-5 py-4 bg-black/30 border-2 border-purple-500/30 rounded-xl text-white placeholder-zinc-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[100px] resize-none font-medium"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleEditPrompt}
                  disabled={!customPrompt.trim() || generating}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-base"
                >
                  <Sparkles className="w-5 h-5" />
                  {generating ? 'Refining...' : 'Refine Image (3 XP)'}
                </button>
                <button
                  onClick={() => {
                    setShowPromptEditor(false);
                    setCustomPrompt('');
                  }}
                  className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowPromptEditor(true)}
                  className="px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60 hover:scale-[1.02] flex items-center justify-center gap-2 text-base"
                >
                  <Edit3 className="w-5 h-5" />
                  ✨ Refine Image
                </button>
                <a
                  href={generatedImage}
                  download="xirevoa-generated.png"
                  className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-green-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>
              
              {/* Secondary Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFullScreen(true)}
                  className="flex-1 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-4 h-4" />
                  Full Preview
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create New
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Screen Modal */}
      {showFullScreen && generatedImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullScreen(false)}
        >
          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={generatedImage || ''} 
            alt="Generated Full Screen" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Insufficient XP Modal */}
      <InsufficientXPModal
        isOpen={showXPModal}
        onClose={() => setShowXPModal(false)}
        requiredXP={selectedModelData?.xp_cost || 3}
        currentXP={(session?.user as any)?.xpoints || 0}
        isLoggedIn={!!session}
      />
    </div>
  );
}
