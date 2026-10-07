import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Check, User, Heart, Sparkles } from 'lucide-react';
import { UserProfile, PinkThemeId } from '../types';
import { AVATAR_PRESETS } from '../utils/themes';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [statusText, setStatusText] = useState(currentUser.statusText || 'شات J&E الوردي 🌸');
  const [role, setRole] = useState<'J' | 'E' | 'custom'>(currentUser.role);
  const [themeHue, setThemeHue] = useState<PinkThemeId>(currentUser.themeHue || 'rose');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle custom avatar upload
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectRole = (selectedRole: 'J' | 'E') => {
    setRole(selectedRole);
    setName(selectedRole);
    // Switch to default avatar for that role if using preset
    const preset = AVATAR_PRESETS.find((p) => p.id === `${selectedRole.toLowerCase()}-default`);
    if (preset) {
      setAvatar(preset.url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveProfile({
      ...currentUser,
      name: name.trim(),
      avatar,
      role,
      statusText: statusText.trim(),
      themeHue,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-pink-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-white text-white" />
            <h2 className="text-base font-bold">الملف الشخصي وصورة العرض</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Preview & Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-400 to-rose-400 shadow-md">
                <img
                  src={avatar}
                  alt="صورة العرض"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg border-2 border-white transition-transform active:scale-90"
                title="تحميل صورة من جهازك"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </div>
            <p className="text-[11px] text-pink-600 font-semibold mt-2">
              اضغط على الكاميرا لرفع صورة من جهازك 📷
            </p>
          </div>

          {/* Quick Avatar Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              أو اختر صورة رمزية لطيفة جاهزة:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setAvatar(preset.url)}
                  className={`relative rounded-full p-0.5 border-2 transition-all overflow-hidden ${
                    avatar === preset.url
                      ? 'border-pink-600 scale-105 shadow-md'
                      : 'border-transparent hover:border-pink-300'
                  }`}
                  title={preset.label}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {avatar === preset.url && (
                    <div className="absolute inset-0 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Role selector for J&E */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              من أنت في شات J&E؟
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole('J')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  role === 'J'
                    ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                    : 'bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100'
                }`}
              >
                🌸 أنا J
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('E')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  role === 'E'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                🎀 أنا E
              </button>
              <button
                type="button"
                onClick={() => setRole('custom')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  role === 'custom'
                    ? 'bg-fuchsia-500 text-white border-fuchsia-500 shadow-sm'
                    : 'bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100'
                }`}
              >
                ✨ اسم مخصص
              </button>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم العرض في المحادثة
            </label>
            <div className="relative">
              <User className="absolute right-3 top-2.5 w-4 h-4 text-pink-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك..."
                className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-pink-200 focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              />
            </div>
          </div>

          {/* Status / Bio input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الحالة / رسالة الحالة (Bio)
            </label>
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="مثال: أفضل صديق للأبد 💕"
              className="w-full px-3 py-2 text-sm rounded-xl border border-pink-200 focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 shadow-md shadow-pink-300/50 flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
