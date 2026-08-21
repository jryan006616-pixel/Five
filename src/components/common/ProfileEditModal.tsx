import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Sparkles,
  Monitor,
  Laptop,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';

const HD_AVATAR_PRESETS = [
  { label: 'Executive Male 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=90' },
  { label: 'Executive Female 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=90' },
  { label: 'Executive Male 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=90' },
  { label: 'Executive Female 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=90' },
  { label: 'Executive Male 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=90' },
  { label: 'Executive Female 3', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=90' },
];

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentEmployee, updateCurrentUserProfile } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || currentEmployee?.profilePhoto || '');
  const [sourceType, setSourceType] = useState<'computer' | 'preset' | 'url'>('computer');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !currentUser || currentUser.role !== 'admin') return null;

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP, etc.)');
      return;
    }

    setFileName(file.name);
    setSourceType('computer');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      fullName: fullName.trim() || currentUser.fullName,
      avatar: avatar.trim() || currentUser.avatar,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#faf9f5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black text-[#d6f932]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-['Outfit']">
                Update Profile Information & Picture
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Upload from computer / downloaded files or pick an HD avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-black hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Current Avatar Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="relative group shrink-0">
              <img
                src={avatar || currentUser.avatar}
                alt="Profile Preview"
                className="w-24 h-24 rounded-2xl object-cover border-3 border-black shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Upload className="w-4 h-4 mb-0.5 text-[#d6f932]" />
                <span>Change</span>
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {fullName || currentUser.fullName}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                @{currentUser.username} {currentUser.employeeId ? `• ${currentUser.employeeId}` : ''}
              </p>
              {fileName && (
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center justify-center sm:justify-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {fileName}
                </p>
              )}
            </div>
          </div>

          {/* Source Tabs: Computer / Presets / URL */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              1. Choose Picture Source
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSourceType('computer')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  sourceType === 'computer'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Computer / PC</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('preset')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  sourceType === 'preset'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>HD Avatars</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  sourceType === 'url'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Web URL</span>
              </button>
            </div>

            {/* TAB 1: Computer Upload / File Drop Zone */}
            {sourceType === 'computer' && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 ${
                  isDragging
                    ? 'border-black bg-slate-100'
                    : 'border-slate-300 bg-[#faf9f5] hover:border-slate-400'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />

                <div className="w-12 h-12 mx-auto rounded-full bg-black text-[#d6f932] flex items-center justify-center shadow-xs">
                  <FolderOpen className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Upload Picture from Computer / Downloads
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Apne computer se downloaded picture ya photo browse karein
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Supports JPG, PNG, WEBP, GIF (High Quality)
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#d6f932]" />
                    <span>Choose File from Computer</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: HD Avatars Preset */}
            {sourceType === 'preset' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <p className="text-xs font-bold text-slate-700">Select HD Corporate Headshot:</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {HD_AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(preset.url);
                        setFileName(preset.label);
                      }}
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                        avatar === preset.url
                          ? 'border-black ring-2 ring-black/40 scale-105 shadow-md'
                          : 'border-transparent hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full aspect-square rounded-xl object-cover"
                      />
                      {avatar === preset.url && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#d6f932] stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Direct URL */}
            {sourceType === 'url' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600">
                  Direct Image URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => {
                    setAvatar(e.target.value);
                    setFileName(null);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-black font-mono"
                />
              </div>
            )}
          </div>

          {/* Full Name Edit */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              2. Full Legal / Display Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-[#d6f932]" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
