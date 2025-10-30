"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, Monitor, Smartphone, Tablet, MonitorSpeaker, Tv, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuranStore } from "@/lib/store";
import { MUSHAF_CONFIG, PageSizeType } from "@/lib/mushafTypes";
import { useLocale } from "@/context/LocaleContext";

interface PageSizeControlsProps {
  className?: string;
}

const getSizeIcon = (size: PageSizeType) => {
  switch (size) {
    case 'minimal': return <Minimize2 className="w-4 h-4" />;
    case 'small': return <Smartphone className="w-4 h-4" />;
    case 'medium': return <Monitor className="w-4 h-4" />;
    case 'large': return <MonitorSpeaker className="w-4 h-4" />;
    case 'maximum': return <Tv className="w-4 h-4" />;
    default: return <Monitor className="w-4 h-4" />;
  }
};

export default function PageSizeControls({ className }: PageSizeControlsProps) {
  const { locale } = useLocale();
  const { 
    mushafPageSize, 
    mushafShowSizeControls, 
    setMushafPageSize, 
    setMushafShowSizeControls 
  } = useQuranStore();

  const sizeOptions = Object.entries(MUSHAF_CONFIG.PAGE_SIZES) as [PageSizeType, typeof MUSHAF_CONFIG.PAGE_SIZES.medium][];

  if (!mushafShowSizeControls) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("flex items-center", className)}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMushafShowSizeControls(true)}
          className="rounded-full p-2"
          title="Показать элементы управления размером"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg",
        className
      )}
    >
      {/* Кнопка скрытия */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMushafShowSizeControls(false)}
        className="p-1.5 h-auto opacity-60 hover:opacity-100"
        title="Скрыть элементы управления размером"
      >
        <EyeOff className="w-3 h-3" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Кнопки размеров */}
      <div className="flex items-center gap-1">
        {sizeOptions.map(([sizeKey, sizeConfig]) => (
          <Button
            key={sizeKey}
            variant={mushafPageSize === sizeKey ? "default" : "ghost"}
            size="sm"
            onClick={() => setMushafPageSize(sizeKey)}
            className={cn(
              "p-2 h-auto min-w-0 relative group",
              mushafPageSize === sizeKey && "bg-primary text-primary-foreground shadow-md"
            )}
            title={locale === 'ar' ? sizeConfig.nameArabic : sizeConfig.name}
          >
            <div className="flex items-center gap-1">
              <span className="text-sm" title={sizeConfig.icon}>
                {getSizeIcon(sizeKey)}
              </span>
              <span className="text-xs font-medium">
                {(sizeConfig.scale * 100).toFixed(0)}%
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              {locale === 'ar' ? sizeConfig.nameArabic : sizeConfig.name}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </Button>
        ))}
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Индикатор текущего размера */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-xs text-muted-foreground">
          {locale === 'ar' ? 'الحجم' : 'Размер'}:
        </span>
        <span className="text-sm font-medium text-primary">
          {locale === 'ar' 
            ? MUSHAF_CONFIG.PAGE_SIZES[mushafPageSize].nameArabic 
            : MUSHAF_CONFIG.PAGE_SIZES[mushafPageSize].name
          }
        </span>
        <span className="text-xs text-muted-foreground">
          ({(MUSHAF_CONFIG.PAGE_SIZES[mushafPageSize].scale * 100).toFixed(0)}%)
        </span>
      </div>
    </motion.div>
  );
}