import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface ProfileSetupProps {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [visibleName, setVisibleName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProfile = useMutation(api.userProfiles.createProfile);
  const generateUploadUrl = useMutation(api.userProfiles.generateUploadUrl);

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
      let profilePictureId = undefined;

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

      await createProfile({
        visibleName: visibleName.trim(),
        profilePicture: profilePictureId,
      });

      toast.success('Profile created successfully!');
      onComplete();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Complete Your Profile</h2>
      
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
            Profile Picture (Optional)
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
              Choose Image
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

        <button
          type="submit"
          disabled={isSubmitting || !visibleName.trim()}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
}
