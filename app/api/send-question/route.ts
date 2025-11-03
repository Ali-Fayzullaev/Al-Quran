export async function POST(request: Request) {
  try {
    const { contact, question } = await request.json();
    
    if (!contact || !question) {
      return Response.json({ error: 'Контакт и вопрос обязательны' }, { status: 400 });
    }

    const greenApiUrl = 'https://7107.api.green-api.com';
    const idInstance = '7107367218';
    const apiTokenInstance = '69dc47a0bd194690af704944038bd257b7fce4e4f5754b72a8';
    const chatId = '120363422929798374@g.us';
    
    const message = `📩 Новый вопрос от пользователя:

👤 Контакт: ${contact}

❓ Вопрос:
${question}

⏰ Время: ${new Date().toLocaleString('ru-RU')}`;

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
      throw new Error('Ошибка отправки сообщения');
    }

    const result = await response.json();
    
    return Response.json({ 
      success: true, 
      message: 'Вопрос успешно отправлен',
      messageId: result.idMessage 
    });
    
  } catch (error) {
    console.error('Green API Error:', error);
    return Response.json({ 
      error: 'Ошибка при отправке вопроса. Попробуйте позже.' 
    }, { status: 500 });
  }
}