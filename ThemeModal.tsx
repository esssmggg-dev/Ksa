import React from 'react';
import { X, Check, Palette, Sparkles } from 'lucide-react';
import { PinkThemeId } from '../types';
import { PINK_THEMES } from '../utils/themes';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: PinkThemeId;
  onSelectTheme: (id: PinkThemeId) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-pink-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-white" />
            <h2 className="text-sm font-bold">تخصيص درجة اللون الوردي 🌸</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Themes List */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500 mb-2">
            اختر درجة اللون الوردي المفضلة لك ولصديقك في المحادثة:
          </p>

          <div className="space-y-2">
            {Object.values(PINK_THEMES).map((theme) => {
              const isSelected = currentThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/80 shadow-xs'
                      : 'border-pink-100 hover:border-pink-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Color Swatch Circle */}
                    <div
                      className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center border-2 border-white"
                      style={{ backgroundColor: theme.primaryHex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{theme.nameAr}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{theme.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs">🌸</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                        مفعل
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
