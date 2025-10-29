"use client";

import { useEffect, useCallback, useRef } from 'react';
import { 
  TouchGesture, 
  KeyboardShortcut, 
  MUSHAF_CONFIG 
} from '@/lib/mushafTypes';

interface GestureControlsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onPinchIn: () => void;
  onPinchOut: () => void;
  onDoubleTap: () => void;
  onKeyboardShortcut: (action: string) => void;
  isEnabled: boolean;
  sensitivity?: number;
}

// Клавиатурные команды
const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'ArrowLeft', action: 'prevPage', description: 'Previous page' },
  { key: 'ArrowRight', action: 'nextPage', description: 'Next page' },
  { key: 'ArrowUp', action: 'prevPage', description: 'Previous page' },
  { key: 'ArrowDown', action: 'nextPage', description: 'Next page' },
  { key: ' ', action: 'nextPage', description: 'Next page (Space)' },
  { key: 'Backspace', action: 'prevPage', description: 'Previous page' },
  { key: 'Home', action: 'firstPage', description: 'First page' },
  { key: 'End', action: 'lastPage', description: 'Last page' },
  { key: '=', ctrlKey: true, action: 'zoomIn', description: 'Zoom in' },
  { key: '-', ctrlKey: true, action: 'zoomOut', description: 'Zoom out' },
  { key: '0', ctrlKey: true, action: 'resetZoom', description: 'Reset zoom' },
  { key: 'f', action: 'toggleFullscreen', description: 'Toggle fullscreen' },
  { key: 'b', action: 'bookmark', description: 'Toggle bookmark' },
  { key: 'v', action: 'toggleView', description: 'Toggle view mode' },
  { key: 'Escape', action: 'exitMode', description: 'Exit current mode' }
];

export default function GestureControls({
  onSwipeLeft,
  onSwipeRight,
  onPinchIn,
  onPinchOut,
  onDoubleTap,
  onKeyboardShortcut,
  isEnabled,
  sensitivity = 1
}: GestureControlsProps) {
  const gestureStateRef = useRef({
    isTracking: false,
    startTouch: null as TouchGesture | null,
    lastTouch: null as TouchGesture | null,
    touchCount: 0,
    initialDistance: 0,
    lastTapTime: 0
  });

  // Обработка касаний
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isEnabled) return;

    const touches = Array.from(e.touches);
    const touch = touches[0];
    const now = Date.now();

    gestureStateRef.current.touchCount = touches.length;
    gestureStateRef.current.isTracking = true;

    const touchGesture: TouchGesture = {
      type: 'tap',
      position: { x: touch.clientX, y: touch.clientY },
      timestamp: now
    };

    gestureStateRef.current.startTouch = touchGesture;
    gestureStateRef.current.lastTouch = touchGesture;

    // Обработка пинча (два пальца)
    if (touches.length === 2) {
      const touch2 = touches[1];
      const distance = Math.hypot(
        touch.clientX - touch2.clientX,
        touch.clientY - touch2.clientY
      );
      gestureStateRef.current.initialDistance = distance;
    }
  }, [isEnabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isEnabled || !gestureStateRef.current.isTracking) return;

    const touches = Array.from(e.touches);
    
    if (touches.length === 2 && gestureStateRef.current.initialDistance > 0) {
      // Обработка пинча
      const touch1 = touches[0];
      const touch2 = touches[1];
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );

      const scale = currentDistance / gestureStateRef.current.initialDistance;
      
      if (scale > 1.2) {
        onPinchOut();
        gestureStateRef.current.initialDistance = currentDistance;
      } else if (scale < 0.8) {
        onPinchIn();
        gestureStateRef.current.initialDistance = currentDistance;
      }
    }

    const touch = touches[0];
    gestureStateRef.current.lastTouch = {
      type: 'tap',
      position: { x: touch.clientX, y: touch.clientY },
      timestamp: Date.now()
    };
  }, [isEnabled, onPinchIn, onPinchOut]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isEnabled || !gestureStateRef.current.startTouch || !gestureStateRef.current.lastTouch) {
      gestureStateRef.current.isTracking = false;
      return;
    }

    const { startTouch, lastTouch, lastTapTime } = gestureStateRef.current;
    const now = Date.now();
    const duration = now - startTouch.timestamp;
    const deltaX = lastTouch.position.x - startTouch.position.x;
    const deltaY = lastTouch.position.y - startTouch.position.y;
    const distance = Math.hypot(deltaX, deltaY);

    // Проверка на двойной тап
    const timeSinceLastTap = now - lastTapTime;
    if (duration < MUSHAF_CONFIG.TOUCH_THRESHOLDS.TAP_MAX_DURATION && 
        distance < 30 && 
        timeSinceLastTap < 300) {
      onDoubleTap();
      gestureStateRef.current.lastTapTime = 0; // Сбрасываем для предотвращения тройного тапа
    } else if (duration < MUSHAF_CONFIG.TOUCH_THRESHOLDS.TAP_MAX_DURATION && distance < 30) {
      gestureStateRef.current.lastTapTime = now;
    }

    // Проверка на свайп
    if (duration < 1000 && 
        distance > MUSHAF_CONFIG.TOUCH_THRESHOLDS.SWIPE_MIN_DISTANCE * sensitivity) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Горизонтальный свайп приоритетнее
      if (absX > absY) {
        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }
    }

    gestureStateRef.current.isTracking = false;
    gestureStateRef.current.startTouch = null;
    gestureStateRef.current.lastTouch = null;
  }, [isEnabled, onSwipeLeft, onSwipeRight, onDoubleTap, sensitivity]);

  // Обработка клавиатуры
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled) return;

    const shortcut = DEFAULT_SHORTCUTS.find(s => 
      s.key === e.key &&
      !!s.ctrlKey === e.ctrlKey &&
      !!s.shiftKey === e.shiftKey &&
      !!s.altKey === e.altKey
    );

    if (shortcut) {
      e.preventDefault();
      
      switch (shortcut.action) {
        case 'prevPage':
          onSwipeRight(); // Логически предыдущая страница = свайп вправо
          break;
        case 'nextPage':
          onSwipeLeft(); // Логически следующая страница = свайп влево
          break;
        case 'zoomIn':
          onPinchOut();
          break;
        case 'zoomOut':
          onPinchIn();
          break;
        default:
          onKeyboardShortcut(shortcut.action);
      }
    }
  }, [isEnabled, onSwipeLeft, onSwipeRight, onPinchIn, onPinchOut, onKeyboardShortcut]);

  // Обработка колесика мыши
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isEnabled) return;

    // Ctrl + колесико = зум
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        onPinchOut(); // Зум in
      } else {
        onPinchIn(); // Зум out
      }
    } else {
      // Обычное колесико = навигация по страницам
      if (Math.abs(e.deltaY) > 50) { // Порог для предотвращения случайных срабатываний
        e.preventDefault();
        if (e.deltaY < 0) {
          onSwipeRight(); // Вверх = предыдущая страница
        } else {
          onSwipeLeft(); // Вниз = следующая страница
        }
      }
    }
  }, [isEnabled, onSwipeLeft, onSwipeRight, onPinchIn, onPinchOut]);

  // Подключение обработчиков событий
  useEffect(() => {
    if (!isEnabled) return;

    const options: AddEventListenerOptions = { passive: false };

    // Touch события
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);

    // Клавиатурные события
    document.addEventListener('keydown', handleKeyDown);

    // Колесико мыши
    document.addEventListener('wheel', handleWheel, options);

    // Предотвращение контекстного меню на длительном нажатии
    const preventContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [
    isEnabled,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
    handleWheel
  ]);

  return null; // Этот компонент только обрабатывает события
}

// Хук для использования жестов
export function useGestureControls(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  onPinchIn: () => void,
  onPinchOut: () => void,
  onDoubleTap: () => void,
  onKeyboardShortcut: (action: string) => void,
  options: {
    isEnabled?: boolean;
    sensitivity?: number;
  } = {}
) {
  const { isEnabled = true, sensitivity = 1 } = options;

  return {
    GestureControls: () => (
      <GestureControls
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        onPinchIn={onPinchIn}
        onPinchOut={onPinchOut}
        onDoubleTap={onDoubleTap}
        onKeyboardShortcut={onKeyboardShortcut}
        isEnabled={isEnabled}
        sensitivity={sensitivity}
      />
    ),
    shortcuts: DEFAULT_SHORTCUTS
  };
}

// Компонент для отображения подсказок по горячим клавишам
export function KeyboardShortcutsHelp({ 
  shortcuts = DEFAULT_SHORTCUTS,
  isVisible = false,
  onClose
}: {
  shortcuts?: KeyboardShortcut[];
  isVisible?: boolean;
  onClose?: () => void;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">اختصارات لوحة المفاتيح</h3>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.ctrlKey && (
                  <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">Ctrl</kbd>
                )}
                {shortcut.shiftKey && (
                  <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">Shift</kbd>
                )}
                {shortcut.altKey && (
                  <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">Alt</kbd>
                )}
                <kbd className="px-2 py-1 text-xs bg-gray-200 rounded font-mono">
                  {shortcut.key === ' ' ? 'Space' : shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}