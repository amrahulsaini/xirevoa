"use client";

import { useState } from 'react';
import { Camera, Sparkles, Calendar, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ProfileClientProps {
  user: {
    id: string;
    username: string;
    email: string;
    xpoints: number;
    profilePicture: string | null;
    createdAt: Date;
    totalGenerations: number;
  };
  isOwnProfile: boolean;
}

export default function ProfileClient({ user, isOwnProfile }: ProfileClientProps) {
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch('/api/profile/upload-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProfilePicture(data.profilePictureUrl);
        setShowUploadModal(false);
        // Reload page to update header
        window.location.reload();
      } else {
        alert(data.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8 sm:p-12 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-purple-500/50 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt={user.username}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Change Picture Button (Only for own profile) */}
              {isOwnProfile && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
                  title="Change profile picture"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                @{user.username}
              </h1>
              <p className="text-zinc-400 mb-4">{user.email}</p>
              
              <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-500">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* XP Card */}
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 rounded-2xl p-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-1">Total XPoints</p>
                <p className="text-4xl font-black text-white">{user.xpoints.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Generations Card */}
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 rounded-2xl p-4">
                <ImageIcon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-1">Total Generations</p>
                <p className="text-4xl font-black text-white">{user.totalGenerations.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Link */}
        {isOwnProfile && (
          <div className="bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-6 text-center">
            <a
              href="/gallery"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg"
            >
              <ImageIcon className="w-5 h-5" />
              <span>View My Gallery</span>
            </a>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-white mb-4">Change Profile Picture</h2>
            
            <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center mb-6 hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="profile-picture-input"
              />
              <label
                htmlFor="profile-picture-input"
                className="cursor-pointer block"
              >
                <Camera className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                <p className="text-white font-bold mb-1">
                  {uploading ? 'Uploading...' : 'Choose a photo'}
                </p>
                <p className="text-zinc-500 text-sm">Max size: 5MB</p>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
