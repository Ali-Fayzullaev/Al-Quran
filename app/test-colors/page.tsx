'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useQuranStore } from '@/lib/store'

export default function TestAllColors() {
  const { theme, setTheme } = useTheme()
  const { siteColorTheme, setSiteColorTheme } = useQuranStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const colors = [
    'blue', 'green', 'purple', 'amber', 'pink', 'sepia',
    'orange', 'teal', 'indigo', 'red', 'yellow', 'gray'
  ]

  const colorNames: Record<string, string> = {
    blue: 'Синий',
    green: 'Зеленый', 
    purple: 'Фиолетовый',
    amber: 'Янтарный',
    pink: 'Розовый',
    sepia: 'Сепия',
    orange: 'Оранжевый',
    teal: 'Бирюзовый',
    indigo: 'Индиго',
    red: 'Красный',
    yellow: 'Желтый',
    gray: 'Серый'
  }

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🎨 Тест всех цветовых схем</h1>
        
        <div className="grid gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Текущая тема:</h2>
            <div className="flex gap-4">
              <Button 
                onClick={() => setTheme('light')}
                variant={theme === 'light' ? 'default' : 'outline'}
              >
                ☀️ Светлая
              </Button>
              <Button 
                onClick={() => setTheme('dark')}
                variant={theme === 'dark' ? 'default' : 'outline'}
              >
                🌙 Темная
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Цветовые схемы:</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {colors.map((color) => (
                <Button
                  key={color}
                  onClick={() => setSiteColorTheme(color as any)}
                  variant={siteColorTheme === color ? 'default' : 'outline'}
                  className="h-20 flex flex-col gap-1"
                >
                  <div className={`w-6 h-6 rounded-full bg-${color}-500`}></div>
                  <span className="text-sm">{colorNames[color]}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Текущие настройки:</h3>
            <div className="space-y-2">
              <p><strong>Тема:</strong> {theme === 'light' ? '☀️ Светлая' : '🌙 Темная'}</p>
              <p><strong>Цвет:</strong> {colorNames[siteColorTheme]} ({siteColorTheme})</p>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-medium mb-4">Инструкция:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Выберите светлую или темную тему</li>
              <li>Выберите любую цветовую схему</li>
              <li>Откройте страницу <code>/mushaf</code></li>
              <li>Проверьте, что цвета применяются правильно</li>
              <li>Все цвета должны быть разными (не зелеными)!</li>
            </ol>
          </div>

          <div className="mt-8">
            <Button asChild>
              <a href="/mushaf" target="_blank" rel="noopener noreferrer">
                🚀 Открыть Mushaf для тестирования
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}