"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  Copy, 
  Check,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface DuaData {
  title: string;
  arabic: string;
  latin?: string;
  translation: string;
  notes?: string;
  fawaid?: string;
  source?: string;
}

interface DuaCardProps {
  dua: DuaData;
  index: number;
  selectedLanguage: string;
}

export default function DuaCard({ dua, index, selectedLanguage }: DuaCardProps) {
  const { locale, t } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
    // Здесь будет логика для воспроизведения аудио
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)',
        borderWidth: '1px'
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/20 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Index Badge */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {index + 1}
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {dua.title}
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayAudio}
              className="w-8 h-8 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              ) : (
                <Play className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              )}
            </Button>
            
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => handleCopy(dua.arabic)}
              className="w-8 h-8 p-0 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              )}
            </Button>
          </div>
        </div>

        {/* Arabic Text */}
        <div className="mb-6 p-4 rounded-xl border" style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="text-right text-xl leading-loose font-arabic" style={{ color: 'var(--color-text)' }}>
            {dua.arabic}
          </div>
        </div>

        {/* Transliteration (if available) */}
        {dua.latin && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {t('DuaDhikr.transliteration')}
              </span>
            </div>
            <div className="text-sm italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {dua.latin}
            </div>
          </div>
        )}

        {/* Translation */}
        <div className="mb-4 p-4 rounded-xl border" style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              {t('DuaDhikr.translation')}
            </span>
          </div>
          <div className="leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {dua.translation}
          </div>
        </div>

        {/* Notes */}
        {dua.notes && (
          <div className="mb-4 p-3 rounded-lg border-l-4" style={{
            backgroundColor: 'var(--color-background)',
            borderLeftColor: 'var(--color-primary)'
          }}>
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                {t('DuaDhikr.recite')}
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {dua.notes}
            </div>
          </div>
        )}

        {/* Expandable Section - Benefits & Source */}
        {(dua.fawaid || dua.source) && (
          <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {t('DuaDhikr.benefits')} & {t('DuaDhikr.source')}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              )}
            </Button>

            {isExpanded && (
              <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
                {dua.fawaid && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                    <h4 className="font-medium mb-2 text-green-700 dark:text-green-400">
                      {t('DuaDhikr.benefits')}:
                    </h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {dua.fawaid}
                    </p>
                  </div>
                )}
                
                {dua.source && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                    <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-400">
                      {t('DuaDhikr.source')}:
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {dua.source}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              РУС
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Heart className="w-3 h-3" />
              <span className="text-xs">Сохранить</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}