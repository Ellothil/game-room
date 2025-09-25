import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAppStore } from '../stores/useAppStore';
import { toast } from 'sonner';

export function SettingsModal() {
  const profile = useQuery(api.userProfiles.getCurrentUserProfile);
  const updateProfile = useMutation(api.userProfiles.updateProfile);
  const generateUploadUrl = useMutation(api.userProfiles.generateUploadUrl);
  const { setShowSettings } = useAppStore();

  const [visibleName, setVisibleName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setVisibleName(profile.visibleName);
      setPreviewUrl(profile.profilePictureUrl);
    }
  }, [profile]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visibleName.trim()) {
      toast.error('Please enter a visible name');
      return;
    }

    setIsSubmitting(true);
    try {
      let profilePictureId = profile?.profilePicture;

      if (selectedImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': selectedImage.type },
          body: selectedImage,
        });

        if (!result.ok) {
          throw new Error('Failed to upload image');
        }

        const { storageId } = await result.json();
        profilePictureId = storageId;
      }

      await updateProfile({
        visibleName: visibleName.trim(),
        profilePicture: profilePictureId,
      });

      toast.success('Profile updated successfully!');
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visible Name
            </label>
            <input
              type="text"
              value={visibleName}
              onChange={(e) => setVisibleName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Enter your display name"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
              >
                Change Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !visibleName.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
