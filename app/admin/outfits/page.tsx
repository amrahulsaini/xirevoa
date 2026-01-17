'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface OutfitTemplate {
  id: number;
  name: string;
  description: string;
  outfit_image_url: string;
  category: string;
  ai_prompt: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function OutfitAdminPage() {
  const [outfits, setOutfits] = useState<OutfitTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOutfit, setEditingOutfit] = useState<OutfitTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    description: '',
    outfit_image_url: '',
    category: 'change-outfit',
    ai_prompt: 'Take the face from the user uploaded image and seamlessly place it onto the person wearing the outfit in the second image. Match the lighting, skin tone, and angle to make it look natural and realistic. Preserve all facial features from the user image while maintaining the outfit and pose from the template image.',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const res = await fetch('/api/admin/outfits');
      const data = await res.json();
      setOutfits(data);
    } catch (error) {
      console.error('Error fetching outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (outfit?: OutfitTemplate) => {
    if (outfit) {
      setFormData({
        id: outfit.id,
        name: outfit.name,
        description: outfit.description,
        outfit_image_url: outfit.outfit_image_url,
        category: outfit.category,
        ai_prompt: outfit.ai_prompt || '',
        display_order: outfit.display_order,
        is_active: outfit.is_active,
      });
      const previewUrl = outfit.outfit_image_url.startsWith('/cdn/') 
        ? outfit.outfit_image_url.replace('/cdn/', '/api/cdn/')
        : outfit.outfit_image_url;
      setImagePreview(previewUrl);
      setEditingOutfit(outfit);
    } else {
      setFormData({
        id: 0,
        name: '',
        description: '',
        outfit_image_url: '',
        category: 'change-outfit',
        ai_prompt: 'Take the face from the user uploaded image and seamlessly place it onto the person wearing the outfit in the second image. Match the lighting, skin tone, and angle to make it look natural and realistic. Preserve all facial features from the user image while maintaining the outfit and pose from the template image.',
        display_order: outfits.length + 1,
        is_active: true,
      });
      setImagePreview(null);
      setEditingOutfit(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOutfit(null);
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      setUploadProgress(20);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setUploadProgress(40);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      setUploadProgress(80);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      setFormData(prev => ({ ...prev, outfit_image_url: data.imageUrl }));
      setUploadProgress(100);
      
      console.log('Image uploaded successfully:', data.imageUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
      setImagePreview(null);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      alert('Please fill in name and description');
      return;
    }
    
    try {
      const method = editingOutfit ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/outfits', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Outfit saved successfully!');
        fetchOutfits();
        closeModal();
      } else {
        const errorData = await res.json();
        alert(`Failed to save outfit: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error saving outfit:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this outfit?')) return;

    try {
      const res = await fetch(`/api/admin/outfits?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchOutfits();
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-yellow-400 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-yellow-400" />
            </Link>
            <h1 className="text-4xl font-bold text-yellow-400">Outfit Templates Management</h1>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Outfit
          </button>
        </div>

        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outfits.map((outfit) => (
                <tr key={outfit.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-4 py-4">{outfit.id}</td>
                  <td className="px-4 py-4 font-semibold">{outfit.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-400 max-w-xs truncate">
                    {outfit.description}
                  </td>
                  <td className="px-4 py-4">
                    {outfit.outfit_image_url && (
                      <img src={outfit.outfit_image_url.startsWith('/cdn/') ? outfit.outfit_image_url.replace('/cdn/', '/api/cdn/') : outfit.outfit_image_url} alt={outfit.name} className="w-16 h-16 object-cover rounded" />
                    )}
                  </td>
                  <td className="px-4 py-4">{outfit.display_order}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        outfit.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                      }`}>
                        {outfit.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(outfit)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(outfit.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-bold text-yellow-400">
                {editingOutfit ? 'Edit Outfit' : 'Add New Outfit'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Outfit Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-400 h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Celebrity Outfit Image</label>
                {imagePreview ? (
                  <div className="relative mb-4">
                    <div className="relative h-48 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, outfit_image_url: '' });
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors relative overflow-hidden">
                  {uploading && (
                    <div 
                      className="absolute inset-0 bg-yellow-400/20 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <Upload className="w-8 h-8 text-zinc-600 mb-2" />
                    <span className="text-zinc-500 text-sm">
                      {uploading ? `Uploading... ${uploadProgress}%` : 'Click to upload outfit image'}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                {formData.outfit_image_url && (
                  <p className="text-xs text-green-500 mt-2">✓ Uploaded: {formData.outfit_image_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">AI Prompt</label>
                <textarea
                  value={formData.ai_prompt}
                  onChange={(e) => setFormData({ ...formData, ai_prompt: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-400 h-32"
                  placeholder="AI prompt for face swapping..."
                />
                <p className="text-xs text-zinc-500 mt-1">The AI will receive: 1st image = user's face, 2nd image = this outfit</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500"
                >
                  {editingOutfit ? 'Update Outfit' : 'Create Outfit'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-zinc-700 rounded-lg hover:bg-zinc-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
