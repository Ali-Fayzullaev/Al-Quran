// components/quran/MotivationalQuotes.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Heart, Star, Book } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

interface QuoteData {
  id: number;
  titleRu: string;
  titleEn: string;
  titleUz: string;
  textRu: string;
  textEn: string;
  textUz: string;
  sourceRu: string;
  sourceEn: string;
  sourceUz: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const quotes: QuoteData[] = [
  {
    id: 1,
    titleRu: "Внутреннее сияние",
    titleEn: "Inner Radiance",
    titleUz: "Ichki nur",
    textRu: "Поистине, этот Коран — пир от Аллаха. Принимайте же его пир, насколько можете. Ибо этот Коран — вервь Аллаха, ясный свет и полезное исцеление.",
    textEn: "Indeed, this Quran is a feast from Allah. Accept His feast as much as you can. For this Quran is Allah's rope, clear light, and beneficial healing.",
    textUz: "Albatta, bu Qur'on - Alloh tomonidan berilgan ziyofatdir. Uning ziyofatini imkoniyatingizcha qabul qiling. Chunki bu Qur'on - Allohning arqoni, ravshan nur va foydali shifodur.",
    sourceRu: "Хадис, аль-Хаким",
    sourceEn: "Hadith, al-Hakim",
    sourceUz: "Hadis, al-Hokim",
    icon: <Star className="w-6 h-6" />,
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  {
    id: 2,
    titleRu: "Достоинство перед другими",
    titleEn: "Excellence Above Others",
    titleUz: "Boshqalardan ustunlik",
    textRu: "Такому человеку, читающему Коран, [который делает это свободно,] будет двойное вознаграждение.",
    textEn: "Such a person who reads the Quran [who does so fluently] will have double reward.",
    textUz: "Qur'on o'qiydigan odamga [buni ravon qiladigan] ikki karra mukofot beriladi.",
    sourceRu: "Аль-Бухари, Муслим",
    sourceEn: "Al-Bukhari, Muslim",
    sourceUz: "Al-Buxoriy, Muslim",
    icon: <Heart className="w-6 h-6" />,
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  {
    id: 3,
    titleRu: "Признак богобоязненности",
    titleEn: "Sign of God-Consciousness",
    titleUz: "Taqvodorlik belgisi",
    textRu: "Верующий, который читает Коран, подобен сладкому лимону: у него приятный запах и вкус.",
    textEn: "The believer who reads the Quran is like a sweet lemon: it has a pleasant smell and taste.",
    textUz: "Qur'on o'qiydigan mo'min shirin limonga o'xshaydi: uning yoqimli hidi va ta'mi bor.",
    sourceRu: "Аль-Бухари, Муслим",
    sourceEn: "Al-Bukhari, Muslim",
    sourceUz: "Al-Buxoriy, Muslim",
    icon: <Book className="w-6 h-6" />,
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  {
    id: 4,
    titleRu: "Прощение грехов",
    titleEn: "Forgiveness of Sins",
    titleUz: "Gunohlarni kechirish",
    textRu: "Молитва и чтение Корана искупают грехи, как вода тушит огонь.",
    textEn: "Prayer and reading the Quran expiate sins, as water extinguishes fire.",
    textUz: "Namoz va Qur'on o'qish gunohlarni kechiradi, xuddi suv olovni o'chirganidek.",
    sourceRu: "Ат-Табарани, сахих",
    sourceEn: "At-Tabarani, sahih",
    sourceUz: "At-Tabaroniy, sahih",
    icon: <Quote className="w-6 h-6" />,
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  {
    id: 5,
    titleRu: "Лучшее из ремесел",
    titleEn: "The Best of Crafts",
    titleUz: "Eng yaxshi hunarmandchilik",
    textRu: "Неужели тот, кто поклоняется Аллаху в часы ночи, падая ниц и стоя, страшится Последней жизни и надеется на милость своего Господа, равен тому, кто не делает этого? Скажи: \"Не равны знающие и незнающие\".",
    textEn: "Is one who is devoutly obedient during periods of the night, prostrating and standing [in prayer], fearing the Hereafter and hoping for the mercy of his Lord, [like one who does not]? Say, \"Are those who know equal to those who do not know?\"",
    textUz: "Kechaning soatlarida sajda qilib va turgan holda ibodat qilib, oxirat hayotidan qo'rqadigan va Rabbisining rahmatini umid qiladigan kishi buni qilmaydiganga tenglashishi mumkinmi? Ayt: \"Biladigan va bilmaydiganlar tenglashadimi?\"",
    sourceRu: "Сура Аз-Зумар, 39:9",
    sourceEn: "Surah Az-Zumar, 39:9",
    sourceUz: "Az-Zumar surasi, 39:9",
    icon: <Star className="w-6 h-6" />,
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  {
    id: 6,
    titleRu: "Сердце, лишенное Корана — заброшенный дом",
    titleEn: "A Heart Without Quran is an Abandoned House",
    titleUz: "Qur'onsiz yurak - tashlab ketilgan uy",
    textRu: "Поистине, дом, в котором поминают Аллаха, и дом, в котором не поминают Аллаха, подобны живому и мертвому.",
    textEn: "Indeed, the house in which Allah is remembered and the house in which Allah is not remembered are like the living and the dead.",
    textUz: "Albatta, Alloh zikr qilinadigan uy va Alloh zikr qilinmaydigаn uy tirik va o'likka o'xshaydi.",
    sourceRu: "Муслим",
    sourceEn: "Muslim",
    sourceUz: "Muslim",
    icon: <Heart className="w-6 h-6" />,
    color: "#f97316",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
  },
  {
    id: 7,
    titleRu: "Легкость в поклонении",
    titleEn: "Ease in Worship",
    titleUz: "Ibodatda osonlik",
    textRu: "Тому, кто идет по пути получения знаний, Аллах облегчит путь в Рай.",
    textEn: "Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise.",
    textUz: "Ilm izlash yo'lida yurgan kishiga Alloh jannat yo'lini osonlashtiradi.",
    sourceRu: "Муслим",
    sourceEn: "Muslim",
    sourceUz: "Muslim",
    icon: <Book className="w-6 h-6" />,
    color: "#84cc16",
    gradient: "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)"
  },
  {
    id: 8,
    titleRu: "Награда, которая не исчезнет",
    titleEn: "Reward That Will Not Perish",
    titleUz: "Yo'qolmaydigan mukofot",
    textRu: "...уготована награда, которая не исчезнет.",
    textEn: "...is prepared a reward that will not perish.",
    textUz: "...yo'qolmaydigan mukofot tayyorlangan.",
    sourceRu: "Сура Фатыр, 35:29-30",
    sourceEn: "Surah Fatir, 35:29-30",
    sourceUz: "Fotir surasi, 35:29-30",
    icon: <Star className="w-6 h-6" />,
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  {
    id: 9,
    titleRu: "Спутник в Раю",
    titleEn: "Companion in Paradise",
    titleUz: "Jannatdagi hamroh",
    textRu: "Ты будешь с тем, кого полюбил. [Подразумевается Пророк (ﷺ) и праведники, чьей отличительной чертой был Коран]",
    textEn: "You will be with those whom you love. [Referring to the Prophet (ﷺ) and the righteous, whose distinguishing feature was the Quran]",
    textUz: "Sen sevgan kishilar bilan bo'lasan. [Paygambar (ﷺ) va solihlarni nazarda tutadi, ularning ajralib turuvchi xususiyati Qur'on edi]",
    sourceRu: "Аль-Бухари, Муслим",
    sourceEn: "Al-Bukhari, Muslim",
    sourceUz: "Al-Buxoriy, Muslim",
    icon: <Heart className="w-6 h-6" />,
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
  },
  {
    id: 10,
    titleRu: "Исцеление и милость",
    titleEn: "Healing and Mercy",
    titleUz: "Shifo va rahmat",
    textRu: "Мы ниспосылаем в Коране то, что является исцелением и милостью для верующих.",
    textEn: "We send down in the Quran that which is healing and mercy for the believers.",
    textUz: "Biz Qur'onda mo'minlar uchun shifo va rahmat bo'lgan narsalarni nozil qilamiz.",
    sourceRu: "Сура Аль-Исра, 17:82",
    sourceEn: "Surah Al-Isra, 17:82",
    sourceUz: "Al-Isro surasi, 17:82",
    icon: <Quote className="w-6 h-6" />,
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)"
  }
];

export default function MotivationalQuotes() {
  const { locale, t } = useLocale();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Автоматическая смена цитат
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
    setIsAutoPlay(false);
  };

  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + quotes.length) % quotes.length);
    setIsAutoPlay(false);
  };

  const currentQuoteData = quotes[currentQuote];

  // Функция для получения текста на нужном языке
  const getLocalizedText = (ru: string, en: string, uz: string) => {
    switch (locale) {
      case 'uz':
        return uz;
      case 'en':
        return en;
      default:
        return ru;
    }
  };

  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-4" 
            style={{ color: 'var(--fixed-text)' }}>
          {t('motivationToRead')}
        </h3>
        <h4 className="text-xl font-bold font-amiri mb-2" 
            dir="rtl" style={{ color: 'var(--color-primary)' }}>
          فضائل قراءة القرآن الكريم
        </h4>
        <p className="text-sm max-w-2xl mx-auto" style={{ color: 'var(--fixed-text-secondary)' }}>
          {t('motivationDescription')}
        </p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        {/* Main Quote Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative overflow-hidden rounded-3xl border-2 p-8 md:p-12"
              style={{
                backgroundColor: 'var(--verse-background)',
                borderColor: currentQuoteData.color,
                background: `${currentQuoteData.gradient}10`,
                boxShadow: `0 20px 60px ${currentQuoteData.color}20`
              }}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <div className="w-full h-full rounded-full border-8" 
                     style={{ borderColor: currentQuoteData.color }}></div>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: currentQuoteData.color }}>
                  <div className="text-white">{currentQuoteData.icon}</div>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-xl md:text-2xl font-bold text-center mb-6"
                  style={{ color: currentQuoteData.color }}>
                {getLocalizedText(currentQuoteData.titleRu, currentQuoteData.titleEn, currentQuoteData.titleUz)}
              </h4>

              {/* Quote Text */}
              <blockquote className="text-lg md:text-xl leading-relaxed text-center mb-6 relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 opacity-20"
                     style={{ color: currentQuoteData.color }}>
                  <Quote className="w-full h-full" />
                </div>
                
                <p className="relative z-10 font-medium" style={{ color: 'var(--fixed-text)' }}>
                  {getLocalizedText(currentQuoteData.textRu, currentQuoteData.textEn, currentQuoteData.textUz)}
                </p>
                
                <div className="absolute -bottom-4 -right-4 w-8 h-8 opacity-20 rotate-180"
                     style={{ color: currentQuoteData.color }}>
                  <Quote className="w-full h-full" />
                </div>
              </blockquote>

              {/* Source */}
              <div className="text-center">
                <p className="text-sm font-medium px-4 py-2 rounded-full inline-block"
                   style={{ 
                     backgroundColor: `${currentQuoteData.color}15`,
                     color: currentQuoteData.color 
                   }}>
                  {getLocalizedText(currentQuoteData.sourceRu, currentQuoteData.sourceEn, currentQuoteData.sourceUz)}
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full opacity-30"
                   style={{ backgroundColor: currentQuoteData.color }}></div>
              <div className="absolute top-4 left-8 w-1 h-1 rounded-full opacity-40"
                   style={{ backgroundColor: currentQuoteData.color }}></div>
              <div className="absolute bottom-8 right-8 w-3 h-3 rounded-full opacity-20"
                   style={{ backgroundColor: currentQuoteData.color }}></div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevQuote}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: 'var(--verse-background)',
              border: `2px solid ${currentQuoteData.color}`,
              color: currentQuoteData.color,
              boxShadow: `0 4px 20px ${currentQuoteData.color}30`
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextQuote}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: 'var(--verse-background)',
              border: `2px solid ${currentQuoteData.color}`,
              color: currentQuoteData.color,
              boxShadow: `0 4px 20px ${currentQuoteData.color}30`
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Quote Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {quotes.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentQuote(index);
                setIsAutoPlay(false);
              }}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentQuote ? "scale-125" : "scale-100 opacity-50"
              )}
              style={{
                backgroundColor: index === currentQuote ? currentQuoteData.color : 'var(--fixed-text-secondary)'
              }}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="text-center mt-4">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="text-xs px-3 py-1 rounded-full transition-colors"
            style={{
              backgroundColor: isAutoPlay ? `${currentQuoteData.color}20` : 'var(--color-muted)',
              color: isAutoPlay ? currentQuoteData.color : 'var(--fixed-text-secondary)'
            }}
          >
            {isAutoPlay ? t('autoPlayOn') : t('autoPlayOff')}
          </button>
        </div>
      </div>
    </div>
  );
}