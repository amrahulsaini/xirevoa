"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Maximize2, X, Calendar, Zap, Image as ImageIcon, Trash2 } from "lucide-react";

interface Generation {
  id: number;
  template_id: number;
  template_title: string;
  original_image_url: string;
  generated_image_url: string;
  xp_cost: number;
  is_outfit: boolean;
  created_at: Date;
}

export default function GalleryClient({ generations }: { generations: Generation[] }) {
  const [selectedImage, setSelectedImage] = useState<Generation | null>(null);
  const [imageToDelete, setImageToDelete] = useState<Generation | null>(null);

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-700">
            <ImageIcon className="w-16 h-16 text-gray-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Creations Yet</h3>
        <p className="text-gray-400 mb-8 max-w-md">
          Start creating amazing AI-powered transformations and they'll appear here. Your creative journey awaits!
        </p>
        <a 
          href="/"
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 hover:scale-105 transform"
        >
          Explore Templates
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {generations.map((generation) => (
          <div 
            key={generation.id}
            className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Before & After Images */}
            <div className="relative aspect-square overflow-hidden bg-zinc-800">
              {generation.original_image_url && generation.original_image_url !== 'uploaded' ? (
                // Split view - Original on left, Generated on right
                <div className="flex h-full">
                  {/* Original Image - Left Half */}
                  <div className="w-1/2 relative border-r-2 border-yellow-400">
                    <Image
                      src={generation.original_image_url}
                      alt="Original"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                      quality={85}
                      priority={false}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-[10px] font-bold text-white z-10">
                      BEFORE
                    </div>
                  </div>
                  
                  {/* Generated Image - Right Half */}
                  <div className="w-1/2 relative">
                    <Image
                      src={generation.generated_image_url}
                      alt={generation.template_title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      quality={85}
                      priority={false}
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-[10px] font-bold text-yellow-400">
                      AFTER
                    </div>
                  </div>
                </div>
              ) : (
                // Old generations without original image - show only generated
                <div className="relative h-full">
                  <Image
                    src={generation.generated_image_url}
                    alt={generation.template_title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    quality={85}
                    priority={false}
                  />
                </div>
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <button
                  onClick={() => setSelectedImage(generation)}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
                  title="View Full Size"
                >
                  <Maximize2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleDownload(generation.generated_image_url, `xirevoa-${generation.id}.png`)}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* XP Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full border border-yellow-500/30">
                <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-black">XP</span>
                </div>
                <span className="text-xs font-bold text-yellow-400">{generation.xp_cost}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">
                  {generation.template_title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(generation.created_at)}</span>
                </div>
              </div>

              {/* Type Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  generation.is_outfit 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {generation.is_outfit ? 'Outfit' : 'Transformation'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col lg:flex-row gap-6" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <div className="relative w-full h-full min-h-[400px]">
                <Image
                  src={selectedImage.generated_image_url}
                  alt={selectedImage.template_title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-contain"
                  quality={95}
                  priority={true}
                />
              </div>
            </div>

            {/* Details Sidebar */}
            <div className="lg:w-80 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedImage.template_title}</h2>
                <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                  selectedImage.is_outfit 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {selectedImage.is_outfit ? 'Outfit Template' : 'Transformation'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-gray-400">Created</div>
                    <div className="text-white font-medium">{formatDate(selectedImage.created_at)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-gray-400">XP Cost</div>
                    <div className="text-white font-medium">{selectedImage.xp_cost} XP</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <ImageIcon className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <div className="text-gray-400">Template Used</div>
                    <a 
                      href={`/${selectedImage.template_title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                      className="text-yellow-400 hover:text-yellow-300 font-medium underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectedImage.template_title}
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(selectedImage.generated_image_url, `xirevoa-${selectedImage.id}.png`)}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Image
              </button>

              {/* Original Image Preview */}
              {selectedImage.original_image_url && selectedImage.original_image_url !== 'uploaded' && (
                <div className="pt-4 border-t border-zinc-800">
                  <div className="text-sm text-gray-400 mb-3">Original Photo</div>
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800">
                    <Image
                      src={selectedImage.original_image_url}
                      alt="Original"
                      fill
                      sizes="320px"
                      className="object-cover"
                      quality={85}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
