'use client';
import { useState } from 'react';

export default function TestApiPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Список чтецов для тестирования
  const reciters = [
    'ar.husary',
    'ar.alafasy', 
    'ar.abdulbasitmurattal',
    'ar.abdurrahmaansudais',
    'ar.shaatree',
    'ar.mahermuaiqly',
    'ar.minshawi',
    // Новые чтецы
    'ar.ibrahimakhbar',
    'ar.hanirifai',
    'ar.abdullahawadallah',
    'ar.tablawi',
    'ar.parhizgar',
    'ar.saoodshuraym',
    'ar.muhammadayyoub'
  ];

  const testApiEditions = async () => {
    setLoading(true);
    try {
      // Получаем список всех аудио изданий
      const response = await fetch('http://api.alquran.cloud/v1/edition?format=audio');
      const data = await response.json();
      
      console.log('📋 All audio editions:', data);
      setResults(data);
    } catch (error) {
      console.error('❌ Error fetching editions:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  const testSpecificReciter = async (reciter: string) => {
    setLoading(true);
    try {
      // Тестируем конкретного чтеца - получаем первую суру
      const response = await fetch(`http://api.alquran.cloud/v1/surah/1/${reciter}`);
      const data = await response.json();
      
      console.log(`🎵 Testing reciter ${reciter}:`, data);
      
      if (data.data && data.data.ayahs && data.data.ayahs[0]) {
        const firstAyah = data.data.ayahs[0];
        console.log(`🔊 First ayah audio URL:`, firstAyah.audio);
        
        // Пробуем воспроизвести
        if (firstAyah.audio) {
          const audio = new Audio(firstAyah.audio);
          audio.crossOrigin = 'anonymous';
          
          audio.oncanplay = () => {
            console.log(`✅ ${reciter} - Audio can play`);
          };
          
          audio.onerror = (e) => {
            console.error(`❌ ${reciter} - Audio error:`, e);
          };
          
          audio.onloadstart = () => {
            console.log(`🔄 ${reciter} - Loading started`);
          };
          
          try {
            await audio.play();
            console.log(`🎶 ${reciter} - Playing successfully`);
            setTimeout(() => audio.pause(), 2000); // Останавливаем через 2 сек
          } catch (playError) {
            console.error(`❌ ${reciter} - Play error:`, playError);
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${reciter}:`, error);
    }
    setLoading(false);
  };

  const testAllReciters = async () => {
    for (const reciter of reciters) {
      await testSpecificReciter(reciter);
      // Небольшая пауза между тестами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🧪 API Testing Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testApiEditions}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : '📋 Get All Audio Editions'}
        </button>

        <button
          onClick={testAllReciters}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : '🎵 Test All Reciters'}
        </button>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
          {reciters.map(reciter => (
            <button
              key={reciter}
              onClick={() => testSpecificReciter(reciter)}
              disabled={loading}
              className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 disabled:opacity-50"
            >
              Test {reciter}
            </button>
          ))}
        </div>
      </div>

      {results && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <h3 className="font-semibold">💡 Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open DevTools (F12) and go to Console tab</li>
          <li>Click "Get All Audio Editions" to see all available audio editions</li>
          <li>Click "Test All Reciters" to test each reciter individually</li>
          <li>Or click individual reciter buttons to test specific ones</li>
          <li>Check console for detailed logs and any errors</li>
        </ol>
      </div>
    </div>
  );
}