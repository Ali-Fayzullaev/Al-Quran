// app/api/send-feedback/route.ts
export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return Response.json({ error: 'Сообщение обязательно' }, { status: 400 });
    }

    const greenApiUrl = 'https://7107.api.green-api.com';
    const idInstance = '7107367218';
    const apiTokenInstance = '69dc47a0bd194690af704944038bd257b7fce4e4f5754b72a8';
    const chatId = '120363422831194293@g.us';  // Используем новый ID чата
    
    const response = await fetch(`${greenApiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: chatId,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error('Ошибка отправки сообщения в WhatsApp');
    }

    const result = await response.json();
    
    return Response.json({ 
      success: true, 
      message: 'Обратная связь успешно отправлена',
      messageId: result.idMessage 
    });
    
  } catch (error) {
    console.error('Green API Error:', error);
    return Response.json({ 
      error: 'Ошибка при отправке обратной связи. Попробуйте позже.' 
    }, { status: 500 });
  }
}