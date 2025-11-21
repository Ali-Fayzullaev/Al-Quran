/**
 * Система сохранения дуа в закладки
 */

export interface SavedDua {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  latin?: string;
  notes?: string;
  benefits?: string;
  source?: string;
  category: string;
  createdAt: string;
  isFavorite?: boolean;
}

const STORAGE_KEY = 'saved-duas';

/**
 * Получить все сохраненные дуа
 */
export function getSavedDuas(): SavedDua[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Ошибка при загрузке сохраненных дуа:', error);
    return [];
  }
}

/**
 * Сохранить дуа в закладки
 */
export function saveDua(dua: Omit<SavedDua, 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const savedDuas = getSavedDuas();
    const newDua: SavedDua = {
      ...dua,
      createdAt: new Date().toISOString()
    };
    
    // Проверяем, не сохранено ли уже это дуа
    const existingIndex = savedDuas.findIndex(saved => saved.id === dua.id);
    
    if (existingIndex >= 0) {
      // Обновляем существующее
      savedDuas[existingIndex] = newDua;
    } else {
      // Добавляем новое
      savedDuas.push(newDua);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDuas));
  } catch (error) {
    console.error('Ошибка при сохранении дуа:', error);
  }
}

/**
 * Удалить дуа из закладок
 */
export function removeSavedDua(duaId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const savedDuas = getSavedDuas();
    const filteredDuas = savedDuas.filter(dua => dua.id !== duaId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDuas));
  } catch (error) {
    console.error('Ошибка при удалении дуа:', error);
  }
}

/**
 * Проверить, сохранено ли дуа
 */
export function isDuaSaved(duaId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const savedDuas = getSavedDuas();
  return savedDuas.some(dua => dua.id === duaId);
}

/**
 * Переключить статус сохранения дуа
 */
export function toggleDuaSaved(dua: Omit<SavedDua, 'createdAt'>): boolean {
  const isSaved = isDuaSaved(dua.id);
  
  if (isSaved) {
    removeSavedDua(dua.id);
    return false;
  } else {
    saveDua(dua);
    return true;
  }
}

/**
 * Получить сохраненные дуа по категории
 */
export function getSavedDuasByCategory(category: string): SavedDua[] {
  const savedDuas = getSavedDuas();
  return savedDuas.filter(dua => dua.category === category);
}

/**
 * Поиск в сохраненных дуа
 */
export function searchSavedDuas(query: string): SavedDua[] {
  const savedDuas = getSavedDuas();
  const searchQuery = query.toLowerCase();
  
  return savedDuas.filter(dua => 
    dua.title.toLowerCase().includes(searchQuery) ||
    dua.translation.toLowerCase().includes(searchQuery) ||
    dua.arabic.includes(searchQuery) ||
    (dua.latin && dua.latin.toLowerCase().includes(searchQuery)) ||
    (dua.notes && dua.notes.toLowerCase().includes(searchQuery))
  );
}

/**
 * Экспортировать сохраненные дуа в JSON
 */
export function exportSavedDuas(): string {
  const savedDuas = getSavedDuas();
  return JSON.stringify(savedDuas, null, 2);
}

/**
 * Импортировать сохраненные дуа из JSON
 */
export function importSavedDuas(jsonData: string): boolean {
  try {
    const duas = JSON.parse(jsonData);
    if (Array.isArray(duas)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(duas));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка при импорте дуа:', error);
    return false;
  }
}