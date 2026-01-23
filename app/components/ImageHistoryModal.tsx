"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Sparkles, History, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageHistoryModalProps {
  onSelectImage: (file: File | string) => void;
  onClose: () => void;
}

interface Generation {
  id: number;
  url: string;
  template: string;
  createdAt: string;
}

export default function ImageHistoryModal({ onSelectImage, onClose }: ImageHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "uploads" | "generations">("upload");
  const [uploads, setUploads] = useState<string[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch user history
    fetch('/api/user/history')
      .then(res => res.json())
      .then(data => {
        setUploads(data.uploads || []);
        setGenerations(data.generations || []);
      })
      .catch(err => console.error('Failed to fetch history:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onSelectImage(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectImage(file);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    // Convert URL to file or pass URL directly
    onSelectImage(imageUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-zinc-900 to-black border-2 border-yellow-500/30 rounded-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Select or Upload Image
          </h2>
          <p className="text-zinc-400">Choose from your history or upload a new image</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === "upload"
                ? "bg-yellow-500/10 text-yellow-400 border-b-2 border-yellow-500"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            Upload New
          </button>
          <button
            onClick={() => setActiveTab("uploads")}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === "uploads"
                ? "bg-yellow-500/10 text-yellow-400 border-b-2 border-yellow-500"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <ImageIcon className="w-5 h-5 inline-block mr-2" />
            Your Uploads ({uploads.length})
          </button>
          <button
            onClick={() => setActiveTab("generations")}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === "generations"
                ? "bg-yellow-500/10 text-yellow-400 border-b-2 border-yellow-500"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <Sparkles className="w-5 h-5 inline-block mr-2" />
            AI Generations ({generations.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                isDragging
                  ? "border-yellow-500 bg-yellow-500/10"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-zinc-500" />
              <h3 className="text-2xl font-bold text-white mb-2">Drop your image here</h3>
              <p className="text-zinc-400 mb-6">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all"
              >
                Choose Image
              </button>
            </div>
          )}

          {/* Uploads Tab */}
          {activeTab === "uploads" && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                </div>
              ) : uploads.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <p className="text-zinc-400">No uploads yet. Upload your first image!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uploads.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(url)}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-700 hover:border-yellow-500 transition-all group"
                    >
                      <Image
                        src={url}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generations Tab */}
          {activeTab === "generations" && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                </div>
              ) : generations.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <p className="text-zinc-400">No generations yet. Create your first AI image!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {generations.map((gen) => (
                    <button
                      key={gen.id}
                      onClick={() => handleImageClick(gen.url)}
                      className="relative group"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-700 hover:border-yellow-500 transition-all">
                        <Image
                          src={gen.url}
                          alt={gen.template}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all">
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white text-xs font-bold truncate">{gen.template}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
