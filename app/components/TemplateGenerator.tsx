"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Wand2, Download, RefreshCw, Maximize2, X, Edit3, Sparkles, ArrowRight, Settings, Check } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [modelIdUsed, setModelIdUsed] = useState<string>(''); // Track model ID for refinement
  const [generationId, setGenerationId] = useState<number | null>(null); // Track generation ID
  const [viewedPrompt, setViewedPrompt] = useState<string | null>(null); // Store viewed prompt
  const [promptViewed, setPromptViewed] = useState(false); // Track if prompt was viewed
  const [showPromptPreview, setShowPromptPreview] = useState(false); // Show prompt before generation
  const [promptEdited, setPromptEdited] = useState(false); // Track if user edited the prompt
  const [editedPrompt, setEditedPrompt] = useState(''); // Store edited prompt
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [savingDefaultModel, setSavingDefaultModel] = useState(false);
  
  // Model selection
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash-exp');
  const [loadingModels, setLoadingModels] = useState(true);
  


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

  useEffect(() => {
    if (!showModelPicker) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModelPicker(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModelPicker]);

  const applyUserImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image size should be less than 10MB");
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    applyUserImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    applyUserImageFile(file);
  };

  const handleSaveDefaultModel = async () => {
    if (!session) {
      setShowXPModal(true);
      return;
    }

    if (!selectedModel) return;

    setSavingDefaultModel(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredModel: selectedModel }),
      });
    } finally {
      setSavingDefaultModel(false);
      setShowModelPicker(false);
    }
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

      const generateFormData = new FormData();
      generateFormData.append('image', userImage);
      generateFormData.append('templateId', template.id.toString());
      generateFormData.append('isOutfit', isOutfit.toString());
      generateFormData.append('selectedModel', selectedModel);
      
      // Add custom prompt if user edited it
      if (promptEdited && editedPrompt.trim()) {
        generateFormData.append('customPrompt', editedPrompt.trim());
      }

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
      setModelIdUsed(selectedModel); // Save the model ID for refinement
      setGenerationId(result.generationId || null); // Save generation ID
      setProgress(100);
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
    setShowModelPicker(false);
    setGenerationId(null);
    setViewedPrompt(null);
    setPromptViewed(false);
    setShowPromptPreview(false);
    setPromptEdited(false);
    setEditedPrompt('');
  };

  const handleViewPrompt = async () => {
    if (!generationId || !session) {
      setErrorMessage('Unable to view prompt');
      return;
    }

    setErrorMessage(null);

    try {
      const res = await fetch('/api/view-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to view prompt');
        return;
      }

      setViewedPrompt(data.prompt);
      setPromptViewed(true);
      setCustomPrompt(data.prompt); // Pre-fill for editing
    } catch (error) {
      console.error('View prompt error:', error);
      setErrorMessage('Failed to view prompt');
    }
  };

  const handleViewPromptPreview = async () => {
    if (!session) {
      setErrorMessage('Please login to view prompt');
      return;
    }

    const currentXP = (session?.user as any)?.xpoints || 0;
    if (currentXP < 1) {
      setShowXPModal(true);
      return;
    }

    try {
      // Deduct 1 XP for viewing
      const res = await fetch('/api/deduct-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1, reason: 'View AI prompt preview' }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes('Insufficient')) {
          setShowXPModal(true);
        } else {
          setErrorMessage(data.error || 'Failed to view prompt');
        }
        return;
      }

      setShowPromptPreview(true);
    } catch (error) {
      console.error('View prompt preview error:', error);
      setErrorMessage('Failed to view prompt');
    }
  };

  const handleSaveEditedPrompt = async () => {
    if (!editedPrompt.trim() || !session) {
      return;
    }

    const currentXP = (session?.user as any)?.xpoints || 0;
    if (currentXP < 1) {
      setShowXPModal(true);
      return;
    }

    try {
      // Deduct 1 XP for editing
      const res = await fetch('/api/deduct-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1, reason: 'Edit prompt before generation' }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes('Insufficient')) {
          setShowXPModal(true);
        } else {
          setErrorMessage(data.error || 'Failed to edit prompt');
        }
        return;
      }

      setPromptEdited(true);
      setShowPromptPreview(false);
    } catch (error) {
      console.error('Edit prompt error:', error);
      setErrorMessage('Failed to edit prompt');
    }
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
    const requiredXP = 1;
    
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
      editFormData.append('selectedModel', modelIdUsed); // Use same model as original generation

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
    <div className="w-full overflow-x-hidden">
      {errorMessage && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400 font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Compact top row: Template mini-card + Upload dropzone */}
      {!generating && !generatedImage && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-44 shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-800">
                <img src={template.image} alt={template.title} className="w-full h-full object-cover" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-zinc-300">Template</p>
                <p className="text-sm font-bold text-white line-clamp-2">{template.title}</p>
              </div>
            </div>

            <div
              className={`flex-1 rounded-2xl border bg-zinc-900 p-4 ${
                isDragging ? "border-yellow-400" : "border-zinc-800"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
            >
              {userImagePreview ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-800">
                    <img src={userImagePreview} alt="Your upload" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Photo selected</p>
                    <p className="text-xs text-zinc-400">Click to replace • or drag & drop</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserImage(null);
                        setUserImagePreview(null);
                      }}
                      className="mt-2 text-xs font-semibold text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[120px] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Upload your photo</p>
                    <p className="text-xs text-zinc-400">Drag & drop here, or click to choose (max 10MB)</p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Prompt Preview Section - BEFORE Generation */}
          {userImage && !generating && (
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-yellow-400" />
                  AI Prompt Preview
                </h3>
                <span className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full font-bold border border-green-500/30">
                  FREE VIEW
                </span>
              </div>
              
              {!showPromptPreview ? (
                <button
                  onClick={() => setShowPromptPreview(true)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
                >
                  View AI Prompt (Free)
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Fixed height card with scrolling */}
                  <div className="bg-zinc-800 rounded-xl p-4 h-32 overflow-y-auto border border-zinc-700">
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{template.aiPrompt}</p>
                  </div>
                  
                  <p className="text-xs text-zinc-400 text-center">
                    You can customize this prompt after generation for 1 XP
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setShowModelPicker(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Models
              {selectedModelData ? (
                <span className="text-xs text-zinc-400">({selectedModelData.model_name})</span>
              ) : null}
            </button>

            <button
              onClick={handleGenerate}
              disabled={!userImage || generating}
              className="w-full sm:flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <Wand2 className="w-5 h-5" />
              Generate ({selectedModelData?.xp_cost || 3} XP)
            </button>
          </div>
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

          {/* View Prompt Section - FREE after generation */}
          {viewedPrompt && (
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  AI Prompt Used
                </h3>
                <span className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full font-bold border border-green-500/30">
                  FREE VIEW
                </span>
              </div>
              
              {/* Fixed height card with scrolling */}
              <div className="bg-zinc-800 rounded-xl p-4 h-32 overflow-y-auto border border-zinc-700">
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{viewedPrompt}</p>
              </div>

              <button
                onClick={() => {
                  setShowPromptEditor(true);
                  setCustomPrompt(viewedPrompt);
                }}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit & Regenerate (1 XP)
              </button>
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
                  <span className="text-sm px-3 py-1.5 bg-purple-500 text-white rounded-full font-black shadow-lg">1 XP</span>
                </div>
                <button
                  onClick={() => {
                    setShowPromptEditor(false);
                    if (!promptViewed) setCustomPrompt('');
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
                  {generating ? 'Refining...' : 'Refine Image (1 XP)'}
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
                {!promptViewed && generationId && (
                  <button
                    onClick={handleViewPrompt}
                    className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/60 hover:scale-[1.02] flex items-center justify-center gap-2 text-base"
                  >
                    <Sparkles className="w-5 h-5" />
                    View Prompt (Free)
                  </button>
                )}
                <button
                  onClick={() => setShowPromptEditor(true)}
                  className="px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60 hover:scale-[1.02] flex items-center justify-center gap-2 text-base"
                >
                  <Edit3 className="w-5 h-5" />
                  {promptViewed ? 'Edit Prompt (1 XP)' : '✨ Refine Image (1 XP)'}
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

              {/* Models */}
              <button
                type="button"
                onClick={() => setShowModelPicker(true)}
                className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Models
                {selectedModelData ? (
                  <span className="text-xs text-zinc-400">({selectedModelData.model_name})</span>
                ) : null}
              </button>
              
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

      {/* Models dialog */}
      {showModelPicker && (
        <div
          className="fixed inset-0 z-50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowModelPicker(false);
          }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative mx-auto max-w-xl px-4 py-10">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg">Choose a model</p>
                    <p className="text-xs text-zinc-400">Pick once, save as default, and it will be used automatically.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModelPicker(false)}
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                {loadingModels ? (
                  <p className="text-sm text-zinc-400">Loading models…</p>
                ) : (
                  <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
                    {models.map((model) => {
                      const isSelected = selectedModel === model.model_id;
                      return (
                        <button
                          key={model.model_id}
                          type="button"
                          disabled={!model.is_active}
                          onClick={() => {
                            if (!model.is_active) return;
                            setSelectedModel(model.model_id);
                            if (generatedImage) setModelIdUsed(model.model_id);
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-colors ${
                            isSelected
                              ? "border-yellow-500 bg-zinc-900"
                              : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
                          } ${model.is_active ? "text-white" : "text-zinc-600"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold">{model.model_name}</p>
                              <p className="text-xs text-zinc-400">Cost: {model.xp_cost} XP</p>
                              {!model.is_active ? (
                                <p className="text-xs text-zinc-600 mt-1">Coming soon</p>
                              ) : null}
                            </div>
                            {isSelected ? (
                              <div className="w-7 h-7 rounded-full bg-yellow-500 text-black flex items-center justify-center">
                                <Check className="w-4 h-4" />
                              </div>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDefaultModel}
                    disabled={savingDefaultModel || !session}
                    className="flex-1 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black transition-colors disabled:opacity-60"
                  >
                    {savingDefaultModel ? "Saving…" : "Save as default"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModelPicker(false)}
                    className="px-5 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
                {!session ? (
                  <p className="text-xs text-zinc-500 mt-3">Sign in to save a default model.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
