import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  Check, 
  Download, 
  Copy, 
  Sparkles,
  Apple,
  FileCode,
  ShieldCheck
} from 'lucide-react';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicAppUrl: string;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({
  isOpen,
  onClose,
  publicAppUrl,
}) => {
  const [copiedIpaLink, setCopiedIpaLink] = useState(false);
  const [copiedWebLink, setCopiedWebLink] = useState(false);

  if (!isOpen) return null;

  const ipaDownloadUrl = `${publicAppUrl}/JE-Pink-Chat.ipa`;

  const copyText = (text: string, isIpa: boolean) => {
    navigator.clipboard.writeText(text);
    if (isIpa) {
      setCopiedIpaLink(true);
      setTimeout(() => setCopiedIpaLink(false), 2500);
    } else {
      setCopiedWebLink(true);
      setTimeout(() => setCopiedWebLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-pink-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-2xl">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">تطبيق الآيفون (ملف IPA) 📱</h2>
              <p className="text-[11px] text-pink-100">رابط تحميل حزمة JE-Pink-Chat.ipa وطريقة التثبيت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Main IPA Download Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50/50 to-white border-2 border-pink-300 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-500 text-white rounded-xl shadow-xs">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">حزمة التطبيق JE-Pink-Chat.ipa</h3>
                  <span className="text-[10px] text-pink-700 font-semibold">حجم الملف: 0.43 MB • إصدار iOS</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                جاهز للتحميل
              </span>
            </div>

            {/* Direct download button */}
            <a
              href="/JE-Pink-Chat.ipa"
              download="JE-Pink-Chat.ipa"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-300/40 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف JE-Pink-Chat.ipa مباشرة</span>
            </a>

            {/* Direct Link input & copy */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-700">رابط ملف الـ IPA المباشر:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={ipaDownloadUrl}
                  className="flex-1 bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-mono select-all focus:outline-hidden"
                />
                <button
                  onClick={() => copyText(ipaDownloadUrl, true)}
                  className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold flex items-center gap-1 transition-all shrink-0"
                >
                  {copiedIpaLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIpaLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              💡 يمكنك تثبيت هذا الملف عبر تطبيقات التثبيت المباشر على الآيفون: 
              <strong className="text-slate-700"> TrollStore / Scarlet / Sideloadly / AltStore / Esign</strong>.
            </p>
          </div>

          {/* Alternative: 1-Click Safari Install without PC or Certificates */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>طريقة التثبيت الأسرع على الآيفون (بدون كمبيوتر وبدون برامج):</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              افتح الرابط في متصفح <strong>Safari</strong> على الآيفون، اضغط على زر <strong>المشاركة ⎋</strong> ثم اختر <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong> ليظهر كتطبيق كامل على شاشتك بأيقونة J&E الوردية!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-pink-50/70 border-t border-pink-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-pink-700 font-medium">
            تطبيق شات J&E الوردي المخصص 🌸
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
