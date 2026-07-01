import type { 
  QuizConfig, 
  Question, 
  QuestionType,
  Difficulty,
  GuessSurahQuestion,
  ContinueAyahQuestion,
  MissingWordQuestion,
  SurahDescriptionQuestion,
  QuestionOption
} from './quizTypes';
import { getSurah, getSurahs, type ApiSurah, type ApiVerse } from './api';

// Difficulty point mapping
const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

// Famous surahs for easy difficulty
const EASY_SURAHS = [1, 112, 113, 114, 109, 110, 108, 107, 106, 105]; // Al-Fatiha and last surahs
const MEDIUM_SURAHS = [2, 3, 4, 18, 36, 55, 67, 73]; // Famous medium surahs
const HARD_SURAHS = [5, 6, 7, 9, 11, 17, 20, 21]; // Longer, challenging surahs

// Surah descriptions for quiz questions
const SURAH_DESCRIPTIONS: Record<number, { en: string; ar: string }> = {
  1: { en: 'The Opening', ar: 'السورة التي تبدأ بها كل صلاة' },
  2: { en: 'The longest surah in the Quran', ar: 'أطول سورة في القرآن' },
  36: { en: 'Known as the heart of the Quran', ar: 'قلب القرآن' },
  18: { en: 'Contains the story of the People of the Cave', ar: 'تحتوي على قصة أصحاب الكهف' },
  112: { en: 'Describes the Oneness of Allah', ar: 'تصف توحيد الله' },
  55: { en: 'The Surah of Mercy', ar: 'سورة الرحمن' },
  67: { en: 'The Dominion', ar: 'الملك' },
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random element from array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random elements from array
 */
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Get surah numbers based on difficulty
 */
function getSurahsByDifficulty(difficulty: Difficulty, specificSurahs?: number[]): number[] {
  // ИСПРАВЛЕНО: если указаны конкретные суры, используем только их
  if (specificSurahs && specificSurahs.length > 0) {
    console.log('Using specific surahs:', specificSurahs);
    return specificSurahs;
  }
  
  switch (difficulty) {
    case 'easy':
      return EASY_SURAHS;
    case 'medium':
      return MEDIUM_SURAHS;
    case 'hard':
      return HARD_SURAHS;
    default:
      return EASY_SURAHS;
  }
}

/**
 * Generate "Guess the Surah" question
 */
async function generateGuessSurahQuestion(
  difficulty: Difficulty,
  specificSurahs?: number[]
): Promise<GuessSurahQuestion> {
  const surahs = await getSurahs();
  const surahNumbers = getSurahsByDifficulty(difficulty, specificSurahs);
  const surahNumber = getRandomElement(surahNumbers);
  const surah = await getSurah(surahNumber);
  
  if (!surah.ayahs || surah.ayahs.length === 0) {
    throw new Error('No ayahs found');
  }
  
  // Select random ayah (avoid first ayah for non-Fatiha)
  const startIndex = surahNumber === 1 ? 0 : 1;
  const ayah = getRandomElement(surah.ayahs.slice(startIndex));
  
  // Get wrong options
  const wrongSurahs = getRandomElements(
    surahs.filter((s) => s.number !== surahNumber),
    3
  );
  
  const options: QuestionOption[] = shuffleArray([
    { id: String(surah.number), text: surah.englishName, isCorrect: true },
    ...wrongSurahs.map((s) => ({
      id: String(s.number),
      text: s.englishName,
      isCorrect: false,
    })),
  ]);
  
  return {
    id: `guess-surah-${Date.now()}-${Math.random()}`,
    type: 'guess-surah',
    difficulty,
    surahNumber: surah.number,
    surahName: surah.englishName,
    ayahText: ayah.text,
    ayahNumber: ayah.numberInSurah,
    options,
    correctAnswer: String(surah.number),
    explanation: `This ayah is from Surah ${surah.englishName} (${surah.name}), ayah ${ayah.numberInSurah}.`,
    verseReference: `${surah.englishName} ${ayah.numberInSurah}`,
    points: DIFFICULTY_POINTS[difficulty],
  };
}

/**
 * Generate "Continue the Ayah" question
 */
async function generateContinueAyahQuestion(
  difficulty: Difficulty,
  specificSurahs?: number[]
): Promise<ContinueAyahQuestion> {
  const surahNumbers = getSurahsByDifficulty(difficulty, specificSurahs);
  const surahNumber = getRandomElement(surahNumbers);
  const surah = await getSurah(surahNumber);
  
  if (!surah.ayahs || surah.ayahs.length < 2) {
    throw new Error('Surah too short');
  }
  
  // Select ayah with enough words
  const validAyahs = surah.ayahs.filter((a) => a.text.split(' ').length > 5);
  if (validAyahs.length === 0) {
    throw new Error('No valid ayahs');
  }
  
  const ayah = getRandomElement(validAyahs);
  const words = ayah.text.split(' ');
  
  // Split at 40-60% of the ayah
  const splitPoint = Math.floor(words.length * (0.4 + Math.random() * 0.2));
  const ayahStart = words.slice(0, splitPoint).join(' ');
  const correctContinuation = words.slice(splitPoint).join(' ');
  
  // Generate wrong options from other ayahs
  const wrongAyahs = getRandomElements(
    surah.ayahs.filter((a) => a.numberInSurah !== ayah.numberInSurah),
    3
  );
  
  const options: QuestionOption[] = shuffleArray([
    { id: '1', text: correctContinuation, isCorrect: true },
    ...wrongAyahs.map((a, i) => ({
      id: String(i + 2),
      text: a.text.split(' ').slice(0, 10).join(' ') + '...',
      isCorrect: false,
    })),
  ]);
  
  return {
    id: `continue-ayah-${Date.now()}-${Math.random()}`,
    type: 'continue-ayah',
    difficulty,
    surahNumber: surah.number,
    surahName: surah.englishName,
    ayahStart: ayahStart + '...',
    ayahNumber: ayah.numberInSurah,
    options,
    correctAnswer: '1',
    explanation: `The complete ayah is: ${ayah.text}`,
    verseReference: `${surah.englishName} ${ayah.numberInSurah}`,
    points: DIFFICULTY_POINTS[difficulty],
  };
}

/**
 * Generate "Missing Word" question
 */
async function generateMissingWordQuestion(
  difficulty: Difficulty,
  specificSurahs?: number[]
): Promise<MissingWordQuestion> {
  const surahNumbers = getSurahsByDifficulty(difficulty, specificSurahs);
  const surahNumber = getRandomElement(surahNumbers);
  const surah = await getSurah(surahNumber);
  
  if (!surah.ayahs || surah.ayahs.length === 0) {
    throw new Error('No ayahs found');
  }
  
  const validAyahs = surah.ayahs.filter((a) => a.text.split(' ').length > 5);
  const ayah = getRandomElement(validAyahs);
  const words = ayah.text.split(' ');
  
  // Choose important words (not common ones)
  const commonWords = ['و', 'في', 'من', 'إلى', 'على', 'ال', 'ان', 'الله'];
  const importantWords = words.filter((w) => !commonWords.includes(w) && w.length > 2);
  
  if (importantWords.length === 0) {
    throw new Error('No important words found');
  }
  
  const missingWord = getRandomElement(importantWords);
  // Скрываем ВСЕ вхождения слова, а не только первое (indexOf) — иначе,
  // если слово повторяется в аяте, ответ виден рядом с пропуском.
  const ayahWithBlank = words.map((w) => (w === missingWord ? '_____' : w));
  
  // Generate wrong options
  const wrongWords = getRandomElements(
    importantWords.filter((w) => w !== missingWord),
    3
  );
  
  const options: QuestionOption[] = shuffleArray([
    { id: '1', text: missingWord, isCorrect: true },
    ...wrongWords.map((w, i) => ({
      id: String(i + 2),
      text: w,
      isCorrect: false,
    })),
  ]);
  
  return {
    id: `missing-word-${Date.now()}-${Math.random()}`,
    type: 'missing-word',
    difficulty,
    surahNumber: surah.number,
    surahName: surah.englishName,
    ayahText: ayahWithBlank.join(' '),
    missingWord,
    ayahNumber: ayah.numberInSurah,
    options,
    correctAnswer: '1',
    explanation: `The complete ayah is: ${ayah.text}`,
    verseReference: `${surah.englishName} ${ayah.numberInSurah}`,
    points: DIFFICULTY_POINTS[difficulty],
  };
}

/**
 * Generate "Surah Description" question
 */
async function generateSurahDescriptionQuestion(
  difficulty: Difficulty,
  specificSurahs?: number[]
): Promise<SurahDescriptionQuestion> {
  const surahs = await getSurahs();
  const availableSurahs = Object.keys(SURAH_DESCRIPTIONS).map(Number);
  const surahNumbers = specificSurahs 
    ? availableSurahs.filter((s) => specificSurahs.includes(s))
    : availableSurahs;
  
  if (surahNumbers.length === 0) {
    throw new Error('No surahs with descriptions available');
  }
  
  const surahNumber = getRandomElement(surahNumbers);
  const surah = surahs.find((s) => s.number === surahNumber);
  
  if (!surah) {
    throw new Error('Surah not found');
  }
  
  const description = SURAH_DESCRIPTIONS[surahNumber];
  
  // Get wrong options
  const wrongSurahs = getRandomElements(
    surahs.filter((s) => s.number !== surahNumber),
    3
  );
  
  const options: QuestionOption[] = shuffleArray([
    { id: String(surah.number), text: surah.englishName, isCorrect: true },
    ...wrongSurahs.map((s) => ({
      id: String(s.number),
      text: s.englishName,
      isCorrect: false,
    })),
  ]);
  
  return {
    id: `surah-desc-${Date.now()}-${Math.random()}`,
    type: 'surah-description',
    difficulty,
    surahNumber: surah.number,
    surahName: surah.englishName,
    description: description.en,
    options,
    correctAnswer: String(surah.number),
    explanation: `${surah.englishName} (${surah.name}) - ${description.en}`,
    points: DIFFICULTY_POINTS[difficulty],
  };
}

/**
 * Generate a question based on type
 */
async function generateQuestion(
  type: QuestionType,
  difficulty: Difficulty,
  specificSurahs?: number[]
): Promise<Question> {
  switch (type) {
    case 'guess-surah':
      return generateGuessSurahQuestion(difficulty, specificSurahs);
    case 'continue-ayah':
      return generateContinueAyahQuestion(difficulty, specificSurahs);
    case 'missing-word':
      return generateMissingWordQuestion(difficulty, specificSurahs);
    case 'surah-description':
      return generateSurahDescriptionQuestion(difficulty, specificSurahs);
    default:
      throw new Error(`Unsupported question type: ${type}`);
  }
}

/**
 * Generate one question of `preferredType`, retrying a few times (each attempt
 * picks a fresh random surah/ayah internally) before falling back to the other
 * allowed types. `guess-surah` is only ever attempted when it's the preferred
 * type itself — it's never used as a silent substitute for a different type,
 * since that would change the delivered question type without the caller's intent.
 */
async function generateQuestionWithRetries(
  preferredType: QuestionType,
  allowedTypes: QuestionType[],
  difficulty: Difficulty,
  specificSurahs?: number[]
): Promise<Question> {
  const fallbackTypes = allowedTypes.filter((t) => t !== 'guess-surah' && t !== preferredType);
  const typesToTry = [preferredType, ...fallbackTypes];
  const attemptsPerType = 3;

  let lastError: unknown;

  for (const type of typesToTry) {
    for (let attempt = 0; attempt < attemptsPerType; attempt++) {
      try {
        return await generateQuestion(type, difficulty, specificSurahs);
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to generate a question after multiple attempts');
}

/**
 * Generate questions specifically for Journey Quiz - only continue-ayah and missing-word
 */
export async function generateJourneyQuizQuestions(
  surahNumbers: number[],
  questionCount: number,
  difficulty: Difficulty
): Promise<Question[]> {
  const questions: Question[] = [];
  const types: QuestionType[] = ['continue-ayah', 'missing-word'];

  const questionsPerType = Math.floor(questionCount / types.length);
  const remainder = questionCount % types.length;

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const count = questionsPerType + (i < remainder ? 1 : 0);

    for (let j = 0; j < count; j++) {
      try {
        const question = await generateQuestionWithRetries(type, types, difficulty, surahNumbers);
        questions.push(question);
      } catch (error) {
        console.error(`Failed to generate a "${type}" journey question after retries:`, error);
      }
    }
  }

  if (questions.length < questionCount) {
    throw new Error(
      `Could only generate ${questions.length} of ${questionCount} requested journey quiz questions`
    );
  }

  return shuffleArray(questions);
}

/**
 * Main function to generate quiz questions based on config
 */
export async function generateQuizQuestions(config: QuizConfig): Promise<Question[]> {
  const questions: Question[] = [];
  const { questionCount, difficulty, questionTypes, specificSurahs } = config;

  // Проверяем наличие questionTypes и устанавливаем значения по умолчанию
  const types: QuestionType[] = questionTypes && questionTypes.length > 0
    ? questionTypes
    : ['continue-ayah', 'missing-word'];

  // Distribute questions across types
  const typesCount = types.length;
  const questionsPerType = Math.floor(questionCount / typesCount);
  const remainder = questionCount % typesCount;

  for (let i = 0; i < typesCount; i++) {
    const type = types[i];
    const count = questionsPerType + (i < remainder ? 1 : 0);

    for (let j = 0; j < count; j++) {
      try {
        const question = await generateQuestionWithRetries(type, types, difficulty, specificSurahs);
        questions.push(question);
      } catch (error) {
        console.error(`Failed to generate a "${type}" question after retries:`, error);
      }
    }
  }

  if (questions.length < questionCount) {
    throw new Error(
      `Could only generate ${questions.length} of ${questionCount} requested quiz questions`
    );
  }

  return shuffleArray(questions);
}
