"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Monitor, Smartphone, MonitorSpeaker, Tv, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuranStore } from "@/lib/store";
import { MUSHAF_CONFIG, PageSizeType } from "@/lib/mushafTypes";
import { useLocale } from "@/context/LocaleContext";

interface PageSizeControlsProps {
  className?: string;
}

const getSizeIcon = (size: PageSizeType, isMobile = false) => {
  const iconClass = isMobile ? "w-3.5 h-3.5" : "w-4 h-4";
  
  switch (size) {
    case 'minimal': return <Minimize2 className={iconClass} />;
    case 'small': return <Smartphone className={iconClass} />;
    case 'medium': return <Monitor className={iconClass} />;
    case 'large': return <MonitorSpeaker className={iconClass} />;
    case 'maximum': return <Tv className={iconClass} />;
    default: return <Monitor className={iconClass} />;
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= MUSHAF_CONFIG.BREAKPOINTS.MOBILE);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

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
          className={cn(
            "rounded-full",
            isMobile ? "h-8 w-8 p-0" : "p-2"
          )}
          title="Показать элементы управления размером"
        >
          <Eye className={cn(isMobile ? "w-3.5 h-3.5" : "w-4 h-4")} />
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
        "flex items-center",
        isMobile 
          ? "gap-1" // Компактная мобильная версия
          : "gap-2 p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg", // Полная десктопная версия
        className
      )}
    >
      {/* Кнопка скрытия */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMushafShowSizeControls(false)}
        className={cn(
          "opacity-60 hover:opacity-100",
          isMobile ? "h-8 w-8 p-0 bg-white/90 rounded-full" : "p-1.5 h-auto"
        )}
        title="Скрыть элементы управления размером"
      >
        <EyeOff className={cn(isMobile ? "w-3 h-3" : "w-3 h-3")} />
      </Button>

      {!isMobile && <div className="w-px h-6 bg-border mx-1" />}

      {/* Кнопки размеров */}
      <div className={cn("flex items-center", isMobile ? "gap-0.5" : "gap-1")}>
        {sizeOptions.map(([sizeKey, sizeConfig]) => (
          <Button
            key={sizeKey}
            variant={mushafPageSize === sizeKey ? "default" : "ghost"}
            size="sm"
            onClick={() => setMushafPageSize(sizeKey)}
            className={cn(
              "relative group min-w-0",
              isMobile 
                ? "h-8 w-8 p-0 bg-white/90 rounded-full" 
                : "p-2 h-auto",
              mushafPageSize === sizeKey && (
                isMobile 
                  ? "bg-primary/90 text-primary-foreground shadow-md" 
                  : "bg-primary text-primary-foreground shadow-md"
              )
            )}
            title={sizeConfig.name}
          >
            {isMobile ? (
              // Мобильная версия - только иконка
              getSizeIcon(sizeKey, true)
            ) : (
              // Десктопная версия - иконка + процент
              <div className="flex items-center gap-1">
                <span className="text-sm" title={sizeConfig.icon}>
                  {getSizeIcon(sizeKey, false)}
                </span>
                <span className="text-xs font-medium">
                  {(sizeConfig.scale * 100).toFixed(0)}%
                </span>
              </div>
            )}
            
            {/* Tooltip - только для десктопа */}
            {!isMobile && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {sizeConfig.name}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </Button>
        ))}
      </div>

      {/* Индикатор текущего размера - только для десктопа */}
      {!isMobile && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
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
        </>
      )}
    </motion.div>
  );
}