export async function GET() {
  try {
    const greenApiUrl = 'https://7107.api.green-api.com';
    const idInstance = '7107367218';
    const apiTokenInstance = '69dc47a0bd194690af704944038bd257b7fce4e4f5754b72a8';
    
    // Проверяем статус аккаунта
    const statusResponse = await fetch(`${greenApiUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`);
    const statusResult = await statusResponse.json();
    
    console.log('Статус Green API:', statusResult);
    
    return Response.json({
      status: 'OK',
      greenApiStatus: statusResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test API Error:', error);
    return Response.json({ 
      error: 'Ошибка при проверке API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}