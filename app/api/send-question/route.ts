// app/api/send-question/route.ts
export async function POST(request: Request) {
  try {
    const { contact, question } = await request.json();

    if (!contact || !question) {
      return Response.json(
        { error: "Контакт и вопрос обязательны" },
        { status: 400 }
      );
    }

    const greenApiUrl = process.env.GREEN_API_URL || "https://7107.api.green-api.com";
    const idInstance = process.env.GREEN_API_ID_INSTANCE || "7107367218";
    const apiTokenInstance = process.env.GREEN_API_TOKEN || "69dc47a0bd194690af704944038bd257b7fce4e4f5754b72a8";
    const chatId = process.env.GREEN_API_QUESTIONS_CHAT_ID || "120363422929798374@g.us"; // Группа для вопросов

    const message = `📩 Новый вопрос от пользователя:

👤 Контакт: ${contact}

❓ Вопрос:
${question}

⏰ Время: ${new Date().toLocaleString("ru-RU")}`;

    console.log("Отправляем вопрос в группу:", chatId);

    const response = await fetch(
      `${greenApiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chatId,
          message: message,
        }),
      }
    );

    console.log("Ответ от Green API:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Green API error response:", errorText);
      throw new Error(
        `Ошибка отправки сообщения: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("Результат от Green API:", result);

    return Response.json({
      success: true,
      message: "Вопрос успешно отправлен",
      messageId: result.idMessage,
    });
  } catch (error) {
    console.error("Green API Error:", error);
    return Response.json(
      {
        error: "Ошибка при отправке вопроса. Попробуйте позже.",
      },
      { status: 500 }
    );
  }
}