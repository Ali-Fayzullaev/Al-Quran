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
  textRu: string;
  textEn: string;
  sourceRu: string;
  sourceEn: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const quotes: QuoteData[] = [
  {
    id: 1,
    titleRu: "Внутреннее сияние",
    titleEn: "Inner Radiance",
    textRu: "Поистине, этот Коран — пир от Аллаха. Принимайте же его пир, насколько можете. Ибо этот Коран — вервь Аллаха, ясный свет и полезное исцеление.",
    textEn: "Indeed, this Quran is a feast from Allah. Accept His feast as much as you can. For this Quran is Allah's rope, clear light, and beneficial healing.",
    sourceRu: "Хадис, аль-Хаким",
    sourceEn: "Hadith, al-Hakim",
    icon: <Star className="w-6 h-6" />,
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  {
    id: 2,
    titleRu: "Достоинство перед другими",
    titleEn: "Excellence Above Others",
    textRu: "Такому человеку, читающему Коран, [который делает это свободно,] будет двойное вознаграждение.",
    textEn: "Such a person who reads the Quran [who does so fluently] will have double reward.",
    sourceRu: "Аль-Бухари, Муслим",
    sourceEn: "Al-Bukhari, Muslim",
    icon: <Heart className="w-6 h-6" />,
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  {
    id: 3,
    titleRu: "Признак богобоязненности",
    titleEn: "Sign of God-Consciousness",
    textRu: "Верующий, который читает Коран, подобен сладкому лимону: у него приятный запах и вкус.",
    textEn: "The believer who reads the Quran is like a sweet lemon: it has a pleasant smell and taste.",
    sourceRu: "Аль-Бухари, Муслим",
    sourceEn: "Al-Bukhari, Muslim",
    icon: <Book className="w-6 h-6" />,
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  {
    id: 4,
    titleRu: "Прощение грехов",
    titleEn: "Forgiveness of Sins",
    textRu: "Молитва и чтение Корана искупают грехи, как вода тушит огонь.",
    textEn: "Prayer and reading the Quran expiate sins, as water extinguishes fire.",
    sourceRu: "Ат-Табарани, сахих",
    sourceEn: "At-Tabarani, sahih",
    icon: <Quote className="w-6 h-6" />,
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  {
    id: 5,
    titleRu: "Лучшее из ремесел",
    titleEn: "The Best of Crafts",
    textRu: "Неужели тот, кто поклоняется Аллаху в часы ночи, падая ниц и стоя, страшится Последней жизни и надеется на милость своего Господа, равен тому, кто не делает этого? Скажи: \"Не равны знающие и незнающие\".",
    textEn: "Is one who is devoutly obedient during periods of the night, prostrating and standing [in prayer], fearing the Hereafter and hoping for the mercy of his Lord, [like one who does not]? Say, \"Are those who know equal to those who do not know?\"",
    sourceRu: "Сура Аз-Зумар, 39:9",
    sourceEn: "Surah Az-Zumar, 39:9",
    icon: <Star className="w-6 h-6" />,
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  {
    id: 6,
    titleRu: "Сердце, лишенное Корана — заброшенный дом",
    titleEn: "A Heart Without Quran is an Abandoned House",
    textRu: "Поистине, дом, в котором поминают Аллаха, и дом, в котором не поминают Аллаха, подобны живому и мертвому.",
    textEn: "Indeed, the house in which Allah is remembered and the house in which Allah is not remembered are like the living and the dead.",
    sourceRu: "Муслим",
    sourceEn: "Muslim",
    icon: <Heart className="w-6 h-6" />,
    color: "#f97316",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
  },
  {
    id: 7,
    titleRu: "Легкость в поклонении",
    titleEn: "Ease in Worship",
    textRu: "Тому, кто идет по пути получения знаний, Аллах облегчит путь в Рай.",
    textEn: "Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise.",
    sourceRu: "Муслим",
    sourceEn: "Muslim",
    icon: <Book className="w-6 h-6" />,
    color: "#84cc16",
    gradient: "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)"
  },
  {
    id: 8,
    titleRu: "Награда, которая не исчезнет",
    titleEn: "Reward That Will Not Perish",
    textRu: "...уготована награда, которая не исчезнет.",
    textEn: "...is prepared a reward that will not perish.",
    sourceRu: "Сура Фатыр, 35:29-30",
    sourceEn: "Surah Fatir, 35:29-30",
    icon: <Star className="w-6 h-6" />,
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  {
    id: 9,
    titleRu: "Спутник в Раю",
    titleEn: "Companion in Paradise",
    textRu: "Ты будешь с тем, кого полюбил. [Подразумевается Пророк (ﷺ) и праведники, чьей отличительной чертой был Коран]",
    textEn: "You will be with those whom you love. [Referring to the Prophet (ﷺ) and the righteous, whose distinguishing feature was the Quran]",
    sourceRu: "Аль-Бухари, Муслим",
    sourceEn: "Al-Bukhari, Muslim",
    icon: <Heart className="w-6 h-6" />,
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
  },
  {
    id: 10,
    titleRu: "Исцеление и милость",
    titleEn: "Healing and Mercy",
    textRu: "Мы ниспосылаем в Коране то, что является исцелением и милостью для верующих.",
    textEn: "We send down in the Quran that which is healing and mercy for the believers.",
    sourceRu: "Сура Аль-Исра, 17:82",
    sourceEn: "Surah Al-Isra, 17:82",
    icon: <Quote className="w-6 h-6" />,
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)"
  }
];

export default function MotivationalQuotes() {
  const { locale } = useLocale();
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

  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-4" 
            style={{ color: 'var(--fixed-text)' }}>
          {locale === 'en' ? 'Motivation to Read' : 'Мотивация к чтению'}
        </h3>
        <h4 className="text-xl font-bold font-amiri mb-2" 
            dir="rtl" style={{ color: 'var(--color-primary)' }}>
          فضائل قراءة القرآن الكريم
        </h4>
        <p className="text-sm max-w-2xl mx-auto" style={{ color: 'var(--fixed-text-secondary)' }}>
          {locale === 'en' 
            ? 'Discover the beautiful rewards and benefits of reading the Holy Quran'
            : 'Откройте для себя прекрасные награды и пользу чтения Священного Корана'}
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
                {locale === 'en' ? currentQuoteData.titleEn : currentQuoteData.titleRu}
              </h4>

              {/* Quote Text */}
              <blockquote className="text-lg md:text-xl leading-relaxed text-center mb-6 relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 opacity-20"
                     style={{ color: currentQuoteData.color }}>
                  <Quote className="w-full h-full" />
                </div>
                
                <p className="relative z-10 font-medium" style={{ color: 'var(--fixed-text)' }}>
                  {locale === 'en' ? currentQuoteData.textEn : currentQuoteData.textRu}
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
                  {locale === 'en' ? currentQuoteData.sourceEn : currentQuoteData.sourceRu}
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
            {isAutoPlay 
              ? (locale === 'en' ? '⏸ Auto-play ON' : '⏸ Авто-смена ВКЛ')
              : (locale === 'en' ? '▶ Auto-play OFF' : '▶ Авто-смена ВЫКЛ')
            }
          </button>
        </div>
      </div>
    </div>
  );
}