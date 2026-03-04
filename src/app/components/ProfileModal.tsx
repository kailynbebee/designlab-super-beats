import { useState, useRef } from 'react';
import { X, Upload, User } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdateProfile: (file: File | null) => Promise<void>;
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  user,
  onUpdateProfile 
}: ProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.user_metadata?.profile_photo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  const userEmail = user.email || '';
  const userName = user.user_metadata?.name || '';
  const currentPhotoUrl = user.user_metadata?.profile_photo_url;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const file = fileInputRef.current?.files?.[0] || null;
      await onUpdateProfile(file);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[#18181b] border-2 border-[#3f3f47] rounded-[12px] p-[32px] w-full max-w-[500px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[16px] text-[#9f9fa9] hover:text-[#f1f5f9] transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[#f8fafc] text-[28px] mb-[24px]">
          Profile Settings
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center gap-[16px]">
            <div className="relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile" 
                  className="w-[120px] h-[120px] rounded-full object-cover border-2 border-[#3f3f47]"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-[#27272a] border-2 border-[#3f3f47] flex items-center justify-center">
                  <User size={48} className="text-[#9f9fa9]" />
                </div>
              )}
            </div>

            <div className="flex gap-[8px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#8200db] hover:bg-[#9500f5] text-[#f8fafc] font-['Geist:Medium',sans-serif] font-medium px-[16px] py-[8px] rounded-[8px] transition-colors flex items-center gap-[8px]"
              >
                <Upload size={16} />
                {previewUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="bg-[#27272a] hover:bg-[#3f3f47] text-[#f1f5f9] font-['Geist:Medium',sans-serif] font-medium px-[16px] py-[8px] rounded-[8px] transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-[12px] bg-[#27272a] border border-[#3f3f47] rounded-[8px] p-[16px]">
            <div className="flex flex-col gap-[4px]">
              <label className="font-['Inter:Medium',sans-serif] font-medium text-[#9f9fa9] text-[12px] uppercase tracking-wider">
                Name
              </label>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[#f1f5f9] text-[16px]">
                {userName || 'Not set'}
              </p>
            </div>
            
            <div className="flex flex-col gap-[4px]">
              <label className="font-['Inter:Medium',sans-serif] font-medium text-[#9f9fa9] text-[12px] uppercase tracking-wider">
                Email
              </label>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[#f1f5f9] text-[16px]">
                {userEmail}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-[14px] font-['Inter:Medium',sans-serif]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#8200db] hover:bg-[#9500f5] disabled:opacity-50 disabled:cursor-not-allowed text-[#f8fafc] font-['Geist:Medium',sans-serif] font-medium py-[12px] rounded-[8px] transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}