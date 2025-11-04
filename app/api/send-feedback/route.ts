// app/api/send-feedback/route.ts
export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return Response.json({ error: 'Сообщение обязательно' }, { status: 400 });
    }

    const greenApiUrl = process.env.GREEN_API_URL || 'https://7107.api.green-api.com';
    const idInstance = process.env.GREEN_API_ID_INSTANCE || '7107367218';
    const apiTokenInstance = process.env.GREEN_API_TOKEN || '69dc47a0bd194690af704944038bd257b7fce4e4f5754b72a8';
    const chatId = process.env.GREEN_API_FEEDBACK_CHAT_ID || '120363422831194293@g.us';  // Группа для обратной связи
    
    const formattedMessage = `📝 Обратная связь с сайта:\n\n${message}\n\n⏰ ${new Date().toLocaleString('ru-RU')}`;
    
    const response = await fetch(`${greenApiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: chatId,
        message: formattedMessage,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Green API error response:', errorText);
      throw new Error(`Ошибка отправки сообщения: ${response.status} ${response.statusText}`);
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