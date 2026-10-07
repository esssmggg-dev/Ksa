import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Image as ImageIcon, 
  Palette, 
  User, 
  Volume2, 
  VolumeX, 
  Share2, 
  Trash2, 
  Search,
  MoreVertical,
  Check,
  Users,
  Apple,
  Download
} from 'lucide-react';
import { UserProfile, ActiveUser, PinkTheme } from '../types';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentUser: UserProfile;
  activeUsers: ActiveUser[];
  isConnected: boolean;
  theme: PinkTheme;
  onOpenProfile: () => void;
  onOpenTheme: () => void;
  onOpenGallery: () => void;
  onOpenSearch: () => void;
  onOpenInvite: () => void;
  onOpenIosInstall: () => void;
  onClearChat: () => void;
  onSwitchUserQuick: (role: 'J' | 'E') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeUsers,
  isConnected,
  theme,
  onOpenProfile,
  onOpenTheme,
  onOpenGallery,
  onOpenSearch,
  onOpenInvite,
  onOpenIosInstall,
  onClearChat,
  onSwitchUserQuick,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [showMenu, setShowMenu] = useState(false);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Find friend presence
  const otherUsers = activeUsers.filter((u) => u.id !== currentUser.id);
  const isFriendOnline = otherUsers.length > 0;

  return (
    <header className="relative z-20 bg-white/85 backdrop-blur-md border-b border-pink-200/80 px-3.5 py-2.5 shadow-xs transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left / Start: Branding & Status */}
        <div className="flex items-center gap-2.5">
          {/* Main Logo & Avatar */}
          <div className="relative group cursor-pointer" onClick={onOpenProfile} title="تعديل الملف الشخصي">
            <div className="relative w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-500 shadow-sm flex items-center justify-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-[14px] object-cover"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                  isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={isConnected ? 'متصل بالسيرفر' : 'غير متصل'}
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent flex items-center gap-1 font-['Cairo']">
                J & E
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500 inline-block animate-pulse" />
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200/60">
                {currentUser.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-pink-900/70">
              {isFriendOnline ? (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  صديقك متصل الآن 💕
                </span>
              ) : (
                <span className="flex items-center gap-1 text-pink-500/80">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  شات الأصدقاء الخاص
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Quick Identity switcher between J & E */}
        <div className="hidden sm:flex items-center bg-pink-50 p-1 rounded-xl border border-pink-200/70">
          <button
            onClick={() => onSwitchUserQuick('J')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              currentUser.role === 'J'
                ? 'bg-white text-pink-600 shadow-xs scale-102'
                : 'text-pink-400 hover:text-pink-700'
            }`}
          >
            أنا J 🌸
          </button>
          <button
            onClick={() => onSwitchUserQuick('E')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              currentUser.role === 'E'
                ? 'bg-white text-rose-600 shadow-xs scale-102'
                : 'text-pink-400 hover:text-pink-700'
            }`}
          >
            أنا E 🎀
          </button>
        </div>

        {/* Right / Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* iOS / iPhone Install */}
          <button
            onClick={onOpenIosInstall}
            className="p-2 rounded-xl text-pink-600 hover:bg-pink-100/70 transition-all border border-pink-200/50 flex items-center gap-1"
            title="تثبيت التطبيق على الآيفون (iOS / IPA)"
          >
            <Apple className="w-4 h-4" />
            <span className="hidden md:inline text-[10px] font-bold">iOS / IPA</span>
          </button>

          {/* Share / Invite Friend */}
          <button
            onClick={onOpenInvite}
            className="p-2 rounded-xl text-pink-600 hover:bg-pink-100/70 transition-all border border-pink-200/50 flex items-center gap-1 bg-pink-50/60"
            title="دعوة صديقك للشات (رابط وكود QR)"
          >
            <Share2 className="w-4 h-4 text-pink-600" />
            <span className="hidden sm:inline text-[11px] font-bold text-pink-700">دعوة صديقي</span>
          </button>

          {/* Media Album */}
          <button
            onClick={onOpenGallery}
            className="p-2 rounded-xl text-pink-600 hover:bg-pink-100/70 transition-all border border-pink-200/50"
            title="ألبوم الصور والمقاطع"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-pink-600 hover:bg-pink-100/70 transition-all border border-pink-200/50"
            title="البحث في الرسائل"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-pink-600 hover:bg-pink-100/70 transition-all border border-pink-200/50"
            title={soundEnabled ? 'كتم الصوت' : 'تفعيل نغمات الشات'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-pink-400" />}
          </button>

          {/* Theme Palette */}
          <button
            onClick={onOpenTheme}
            className="p-2 rounded-xl text-pink-600 hover:bg-pink-100/70 transition-all border border-pink-200/50"
            title="تغيير درجة اللون الوردي"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Profile settings */}
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-xl text-pink-600 hover:bg-pink-100/70 transition-all border border-pink-200/50"
            title="الملف الشخصي وصورة العرض"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Extra options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl text-pink-600 hover:bg-pink-100/70 transition-all border border-pink-200/50"
              title="خيارات إضافية"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute left-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-pink-200/80 py-2 z-40 text-xs">
                  <div className="px-3 py-1.5 border-b border-pink-100 font-bold text-pink-800 flex items-center justify-between">
                    <span>إعدادات سريعة</span>
                    <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                  </div>

                  <div className="sm:hidden px-2 py-1">
                    <div className="text-[10px] text-pink-400 mb-1 px-1">التبديل بين الشخصيتين:</div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          onSwitchUserQuick('J');
                          setShowMenu(false);
                        }}
                        className="flex-1 py-1 rounded-lg text-center bg-pink-50 text-pink-700 font-bold hover:bg-pink-100"
                      >
                        أنا J 🌸
                      </button>
                      <button
                        onClick={() => {
                          onSwitchUserQuick('E');
                          setShowMenu(false);
                        }}
                        className="flex-1 py-1 rounded-lg text-center bg-rose-50 text-rose-700 font-bold hover:bg-rose-100"
                      >
                        أنا E 🎀
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenIosInstall();
                      setShowMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-slate-700 hover:bg-pink-50 flex items-center gap-2 font-semibold text-pink-800"
                  >
                    <Apple className="w-4 h-4 text-pink-600" />
                    <span>تثبيت على الآيفون (iOS / IPA)</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenInvite();
                      setShowMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-slate-700 hover:bg-pink-50 flex items-center gap-2 font-semibold"
                  >
                    <Share2 className="w-4 h-4 text-pink-500" />
                    <span>دعوة خويي (كود QR ورابط مباشر)</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenProfile();
                      setShowMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-slate-700 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-pink-500" />
                    <span>تعديل اسمي وصورة العرض</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenGallery();
                      setShowMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-slate-700 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>ألبوم وسائط J&E</span>
                  </button>

                  <a
                    href="/JE-Pink-Chat-Source.zip"
                    download="JE-Pink-Chat-Source.zip"
                    onClick={() => setShowMenu(false)}
                    className="w-full text-right px-3 py-2 text-slate-700 hover:bg-pink-50 flex items-center gap-2 font-medium"
                  >
                    <Download className="w-4 h-4 text-pink-500" />
                    <span>تحميل ملف الموقع كامل (ZIP)</span>
                  </a>

                  <div className="border-t border-pink-100 my-1"></div>

                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من مسح جميع رسائل المحادثة للطرفين؟')) {
                        onClearChat();
                      }
                      setShowMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>مسح سجل المحادثة</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
