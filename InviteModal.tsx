import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Heart, 
  QrCode, 
  ExternalLink, 
  Smartphone,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicAppUrl: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  publicAppUrl,
}) => {
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedFriendRole, setCopiedFriendRole] = useState(false);

  if (!isOpen) return null;

  // Link that automatically configures friend as "E"
  const friendDirectUrl = `${publicAppUrl}?role=E`;

  // QR Code URL using quickchart API
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    friendDirectUrl
  )}&size=200&ecLevel=M&margin=1`;

  const copyToClipboard = (text: string, isRole: boolean) => {
    navigator.clipboard.writeText(text);
    if (isRole) {
      setCopiedFriendRole(true);
      setTimeout(() => setCopiedFriendRole(false), 2500);
    } else {
      setCopiedMain(true);
      setTimeout(() => setCopiedMain(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'شات J&E الوردي',
          text: 'تعال شات J&E الوردي نسولف ونرسل صور ومقاطع بنفس الوقت 🌸💖',
          url: friendDirectUrl,
        });
      } catch {}
    } else {
      copyToClipboard(friendDirectUrl, true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-pink-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-white text-white animate-pulse" />
            <div>
              <h2 className="text-sm font-bold">دعوة صديقك لشات J&E 💌</h2>
              <p className="text-[11px] text-pink-100">رابط الدخول المباشر المخصص لصديقك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Why friend couldn't enter explanation box */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-rose-700 text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>سبب عدم قدرة خويك على الدخول سابقاً:</span>
            </div>
            <p className="text-[11px] text-slate-700">
              رابط التطوير الداخلي (ais-dev) مخصص لك وحدك ويتطلب حساب جوجل الخاص بك، لذلك كان يظهر لخويك خطأ.
              <br />
              <strong>الرابط أدناه هو الرابط العام المشترك (Public Shared Link)</strong> ويعمل مع خويك مباشرة وبدون أي تسجيل دخول!
            </p>
          </div>

          {/* Quick QR Code and Share */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gradient-to-b from-pink-50 to-white border border-pink-200 text-center sm:text-right">
            <div className="w-32 h-32 rounded-2xl bg-white p-2 border-2 border-pink-200 shadow-sm shrink-0 flex items-center justify-center">
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center justify-center sm:justify-start gap-1">
                <span>امسح الكود بكاميرا الجوال 📷</span>
              </h3>
              <p className="text-[11px] text-slate-600">
                يمكن لخويك فتح كاميرا الآيفون أو أي جوال ومسح هذا الكود للدخول فوراً معك في المحادثة كـ <strong>E</strong>!
              </p>
              <button
                onClick={handleNativeShare}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>إرسال الرابط لخويي (واتساب / رسائل)</span>
              </button>
            </div>
          </div>

          {/* Link 1: Direct link for friend as 'E' */}
          <div className="p-3 bg-white rounded-2xl border border-pink-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-pink-700 text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                رابط مباشر لخويك يدخل كـ "E":
              </span>
              <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
                موصى به
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={friendDirectUrl}
                className="flex-1 bg-pink-50/50 border border-pink-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-mono select-all focus:outline-hidden"
              />
              <button
                onClick={() => copyToClipboard(friendDirectUrl, true)}
                className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold flex items-center gap-1 transition-all"
              >
                {copiedFriendRole ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedFriendRole ? 'تم النسخ!' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* Link 2: General Public link */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 text-xs block">
              الرابط العام المباشر:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicAppUrl}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-mono select-all focus:outline-hidden"
              />
              <button
                onClick={() => copyToClipboard(publicAppUrl, false)}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold flex items-center gap-1 transition-all"
              >
                {copiedMain ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedMain ? 'تم النسخ!' : 'نسخ'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-pink-50/70 border-t border-pink-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-pink-700 font-medium">
            تأكد أن خويك يفتح الرابط من جواله 📱
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
