export default function TestSearch() {
  const testQueries = [
    'Allah',
    'Аллах',
    'الفاتحة', 
    'اللَّهُ',
    '1',
    'Al-Fatiha',
    'Открывающая'
  ];

  const testSearch = async (query: string) => {
    console.log('=== ТЕСТ ПОИСКА ===');
    console.log('Запрос:', query);
    
    const params = new URLSearchParams({
      q: query,
      mode: 'both',
      lang: 'both'
    });

    const url = `/api/search?${params.toString()}`;
    console.log('URL:', url);

    try {
      const response = await fetch(url);
      console.log('Статус ответа:', response.status);
      
      const data = await response.json();
      console.log('Данные ответа:', data);
      
      if (data.success && data.data?.matches) {
        console.log(`✅ Найдено ${data.data.matches.length} результатов`);
        data.data.matches.forEach((match: any, i: number) => {
          console.log(`${i+1}. Сура ${match.surah?.number}, аят ${match.numberInSurah}: ${match.text}`);
        });
      } else {
        console.log('❌ Результаты не найдены');
      }
    } catch (error) {
      console.error('❌ Ошибка запроса:', error);
    }
    console.log('==================');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔍 Тест поиска</h1>
      
      <div className="space-y-4">
        <p className="text-lg mb-4">Откройте консоль (F12) и нажмите на кнопки ниже для тестирования:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => testSearch(query)}
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Тест: "{query}"
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Инструкция:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Откройте консоль браузера (F12 → Console)</li>
            <li>Нажмите на любую кнопку выше</li>
            <li>Посмотрите результаты в консоли</li>
            <li>Сообщите мне, что показывает консоль</li>
          </ol>
        </div>

        <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
          <h3 className="font-bold mb-2">Ожидаемые результаты:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><code>"Allah"</code> → должен найти 6+ аятов</li>
            <li><code>"الفاتحة"</code> → должен найти суру Аль-Фатиха</li>
            <li><code>"1"</code> → должен найти все аяты из суры 1</li>
            <li><code>"Al-Fatiha"</code> → должен найти суру по английскому названию</li>
          </ul>
        </div>
      </div>
    </div>
  );
}