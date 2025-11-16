// lib/whatsapp-config.ts
export const WHATSAPP_CONFIG = {
  api: {
    url: process.env.GREEN_API_URL || 'https://7107.api.green-api.com',
    idInstance: process.env.GREEN_API_ID_INSTANCE || '7107367218',
    token: process.env.GREEN_API_TOKEN || '69dc47a0bd194690af704944038bd257b7fce4e4f5754b72a8',
  },
  groups: {
    feedback: process.env.GREEN_API_FEEDBACK_CHAT_ID || '120363422929798374@g.us',    // Website edits
    questions: process.env.GREEN_API_QUESTIONS_CHAT_ID || '120363422929798374@g.us',  // Question
  },
} as const;