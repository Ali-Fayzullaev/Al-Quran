"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef, useCallback } from "react"
import { useLocale } from "@/context/LocaleContext"

export function AnimatedThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { t } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [pendingTheme, setPendingTheme] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const animationRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Все useCallback должны быть до useEffect для соблюдения порядка хуков
  // Очистка всех анимаций
  const cleanup = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Очистка предыдущей анимации
  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.remove()
      animationRef.current = null
    }
  }, [])

  // Стабильный requestAnimationFrame
  const stableRequestAnimationFrame = useCallback((callback: () => void) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = requestAnimationFrame(callback)
  }, [])

  // Стабильный setTimeout
  const stableSetTimeout = useCallback((callback: () => void, delay: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callback()
      setIsAnimating(false)
      setPendingTheme(null)
    }, delay)
  }, [])

  const createCircleAnimation = useCallback((newTheme: string) => {
    if (!buttonRef.current) return Promise.resolve()

    return new Promise<void>((resolve) => {
      cleanupAnimation()

      const button = buttonRef.current!
      const rect = button.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Используем правильные цвета для темы
      const isDarkToLight = newTheme === 'light'
      const circleColor = isDarkToLight 
        ? 'hsl(0 0% 100%)' // светлая тема - белый
        : 'hsl(222.2 84% 4.9%)' // темная тема - темный

      // Создаем анимационный оверлей
      const overlay = document.createElement('div')
      overlay.className = 'theme-transition-overlay'
      animationRef.current = overlay
      
      // Вычисляем радиус для покрытия всего экрана
      const maxDistance = Math.sqrt(
        Math.pow(Math.max(centerX, window.innerWidth - centerX), 2) +
        Math.pow(Math.max(centerY, window.innerHeight - centerY), 2)
      )

      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${circleColor};
        clip-path: circle(0px at ${centerX}px ${centerY}px);
        z-index: 9999;
        pointer-events: none;
        will-change: clip-path;
        transition: clip-path 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      `

      document.body.appendChild(overlay)

      // Начинаем расширение круга
      stableRequestAnimationFrame(() => {
        if (overlay.parentNode) {
          overlay.style.clipPath = `circle(${maxDistance * 1.1}px at ${centerX}px ${centerY}px)`
          
          // Меняем тему в середине анимации
          setTimeout(() => {
            if (overlay.parentNode) {
              setTheme(newTheme)
            }
          }, 150)
        }
      })

      // Завершаем анимацию
      stableSetTimeout(() => {
        cleanupAnimation()
        resolve()
      }, 600)
    })
  }, [cleanupAnimation, setTheme, stableRequestAnimationFrame, stableSetTimeout])

  const toggleTheme = useCallback(async () => {
    if (isAnimating) return

    setIsAnimating(true)
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    setPendingTheme(newTheme)
    
    // Создаем анимацию круга с новой темой
    await createCircleAnimation(newTheme)
  }, [isAnimating, resolvedTheme, createCircleAnimation])

  // Все useEffect после всех useCallback
  useEffect(() => {
    setMounted(true)
  }, [])

  // Очистка при изменении состояния анимации
  useEffect(() => {
    if (!isAnimating) {
      cleanup()
    }
    return cleanup
  }, [isAnimating, cleanup])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      cleanup()
      cleanupAnimation()
    }
  }, [cleanup, cleanupAnimation])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10">
        <Sun className="w-5 h-5" />
        <span className="sr-only">{t("toggleTheme")}</span>
      </Button>
    )
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      disabled={isAnimating}
      className={`
        theme-toggle-button
        w-10 h-10 
        hover:bg-gray-100 dark:hover:bg-gray-800 
        ${isAnimating ? 'animating' : ''}
        hover:scale-105 active:scale-95
        relative overflow-hidden
        nav-transition
      `}
      aria-label={t("toggleTheme")}
    >
      <div className="relative z-10">
        {(pendingTheme === "light" || (!isAnimating && resolvedTheme === "dark")) ? (
          <Sun className={`
            theme-icon
            w-5 h-5 text-gray-700 dark:text-gray-300 
            ${isAnimating ? 'rotating sun-glow' : 'sun-glow'}
          `} />
        ) : (
          <Moon className={`
            theme-icon
            w-5 h-5 text-gray-700 dark:text-gray-300 
            ${isAnimating ? 'rotating moon-glow' : 'moon-glow'}
          `} />
        )}
      </div>
      
      {/* Внутренний эффект свечения */}
      <div className={`
        absolute inset-0 rounded-full
        transition-all duration-300 ease-in-out
        ${isAnimating 
          ? 'bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-blue-200 dark:to-purple-200 opacity-20' 
          : 'opacity-0'
        }
      `} />
      
      <span className="sr-only">{t("toggleTheme")}</span>
    </Button>
  )
}