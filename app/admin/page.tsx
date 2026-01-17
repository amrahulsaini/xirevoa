'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus, Upload } from 'lucide-react';

interface Template {
  id: number;
  title: string;
  description: string;
  image_url: string;
  ai_prompt: string | null;
  coming_soon: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    description: '',
    image_url: '',
    ai_prompt: '',
    coming_soon: false,
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/templates');
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (template?: Template) => {
    if (template) {
      setFormData({
        id: template.id,
        title: template.title,
        description: template.description,
        image_url: template.image_url,
        ai_prompt: template.ai_prompt || '',
        coming_soon: template.coming_soon,
        display_order: template.display_order,
        is_active: template.is_active,
      });
      // Convert old /cdn/ URLs to /api/cdn/ URLs for preview
      const previewUrl = template.image_url.startsWith('/cdn/') 
        ? template.image_url.replace('/cdn/', '/api/cdn/')
        : template.image_url;
      setImagePreview(previewUrl);
      setEditingTemplate(template);
    } else {
      setFormData({
        id: 0,
        title: '',
        description: '',
        image_url: '',
        ai_prompt: '',
        coming_soon: false,
        display_order: templates.length + 1,
        is_active: true,
      });
      setImagePreview(null);
      setEditingTemplate(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create preview
      setUploadProgress(20);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
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
      setFormData(prev => ({ ...prev, image_url: data.imageUrl }));
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
    
    try {
      const method = editingTemplate ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchTemplates();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/admin/templates?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
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
          <h1 className="text-4xl font-bold text-yellow-400">Template Management</h1>
          <button
            onClick={() => openModal()}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Template
          </button>
        </div>

        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Image URL</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-4 py-4">{template.id}</td>
                  <td className="px-4 py-4 font-semibold">{template.title}</td>
                  <td className="px-4 py-4 text-sm text-gray-400 max-w-xs truncate">
                    {template.description}
                  </td>
                  <td className="px-4 py-4 text-sm text-blue-400 truncate max-w-xs">
                    {template.image_url}
                  </td>
                  <td className="px-4 py-4">{template.display_order}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      template.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {template.coming_soon && (
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-yellow-900 text-yellow-400">
                        Coming Soon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(template)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
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
                {editingTemplate ? 'Edit Template' : 'Add New Template'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <label className="block text-sm font-semibold mb-2">Template Image</label>
                {imagePreview ? (
                  <div className="relative mb-4">
                    <div className="relative h-48 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image_url: '' });
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
                      {uploading ? `Uploading... ${uploadProgress}%` : 'Click to upload image'}
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
                {formData.image_url && (
                  <p className="text-xs text-green-500 mt-2">✓ Uploaded: {formData.image_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">AI Prompt</label>
                <textarea
                  value={formData.ai_prompt}
                  onChange={(e) => setFormData({ ...formData, ai_prompt: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-400 h-32"
                  placeholder="Enter the AI generation prompt for this template..."
                />
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
                      checked={formData.coming_soon}
                      onChange={(e) => setFormData({ ...formData, coming_soon: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Coming Soon</span>
                  </label>
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
                  {editingTemplate ? 'Update Template' : 'Create Template'}
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
