// components/journey/JourneyMap.tsx
"use client";

import { useState, useEffect } from "react";
import { useJourneyStore, SURAHS_DATA } from "@/lib/journeyStore";
import { useQuranStore } from "@/lib/store";
import { useLocale } from "@/context/LocaleContext";
import SurahStation from "./SurahStation";
import {
  Map,
  Filter,
  Search,
  Grid3x3,
  Layers,
  BookOpen,
  Target,
  CheckCircle2,
  Lock,
  Sun,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  ayahs: number;
  revelation: "Meccan" | "Medinan";
  juz: number;
  meaningEn: string;
  meaningRu: string;
}

const ALL_SURAHS: Surah[] = [
  {
    number: 1,
    name: "Al-Fatihah",
    arabicName: "الفاتحة",
    ayahs: 7,
    revelation: "Meccan",
    juz: 1,
    meaningEn: "The Opening",
    meaningRu: "Открывающая",
  },
  {
    number: 2,
    name: "Al-Baqarah",
    arabicName: "البقرة",
    ayahs: 286,
    revelation: "Medinan",
    juz: 1,
    meaningEn: "The Cow",
    meaningRu: "Корова",
  },
  {
    number: 3,
    name: "Ali 'Imran",
    arabicName: "آل عمران",
    ayahs: 200,
    revelation: "Medinan",
    juz: 3,
    meaningEn: "Family of Imran",
    meaningRu: "Семейство Имрана",
  },
  {
    number: 4,
    name: "An-Nisa",
    arabicName: "النساء",
    ayahs: 176,
    revelation: "Medinan",
    juz: 4,
    meaningEn: "The Women",
    meaningRu: "Женщины",
  },
  {
    number: 5,
    name: "Al-Ma'idah",
    arabicName: "المائدة",
    ayahs: 120,
    revelation: "Medinan",
    juz: 6,
    meaningEn: "The Table",
    meaningRu: "Трапеза",
  },
  {
    number: 6,
    name: "Al-An'am",
    arabicName: "الأنعام",
    ayahs: 165,
    revelation: "Meccan",
    juz: 7,
    meaningEn: "The Cattle",
    meaningRu: "Скот",
  },
  {
    number: 7,
    name: "Al-A'raf",
    arabicName: "الأعراف",
    ayahs: 206,
    revelation: "Meccan",
    juz: 8,
    meaningEn: "The Heights",
    meaningRu: "Преграды",
  },
  {
    number: 8,
    name: "Al-Anfal",
    arabicName: "الأنفال",
    ayahs: 75,
    revelation: "Medinan",
    juz: 9,
    meaningEn: "The Spoils of War",
    meaningRu: "Трофеи",
  },
  {
    number: 9,
    name: "At-Tawbah",
    arabicName: "التوبة",
    ayahs: 129,
    revelation: "Medinan",
    juz: 10,
    meaningEn: "The Repentance",
    meaningRu: "Покаяние",
  },
  {
    number: 10,
    name: "Yunus",
    arabicName: "يونس",
    ayahs: 109,
    revelation: "Meccan",
    juz: 11,
    meaningEn: "Jonah",
    meaningRu: "Йунус",
  },
  {
    number: 11,
    name: "Hud",
    arabicName: "هود",
    ayahs: 123,
    revelation: "Meccan",
    juz: 11,
    meaningEn: "Hud",
    meaningRu: "Худ",
  },
  {
    number: 12,
    name: "Yusuf",
    arabicName: "يوسف",
    ayahs: 111,
    revelation: "Meccan",
    juz: 12,
    meaningEn: "Joseph",
    meaningRu: "Йусуф",
  },
  {
    number: 13,
    name: "Ar-Ra'd",
    arabicName: "الرعد",
    ayahs: 43,
    revelation: "Medinan",
    juz: 13,
    meaningEn: "The Thunder",
    meaningRu: "Гром",
  },
  {
    number: 14,
    name: "Ibrahim",
    arabicName: "إبراهيم",
    ayahs: 52,
    revelation: "Meccan",
    juz: 13,
    meaningEn: "Abraham",
    meaningRu: "Ибрахим",
  },
  {
    number: 15,
    name: "Al-Hijr",
    arabicName: "الحجر",
    ayahs: 99,
    revelation: "Meccan",
    juz: 14,
    meaningEn: "The Rocky Tract",
    meaningRu: "Хиджр",
  },
  {
    number: 16,
    name: "An-Nahl",
    arabicName: "النحل",
    ayahs: 128,
    revelation: "Meccan",
    juz: 14,
    meaningEn: "The Bee",
    meaningRu: "Пчелы",
  },
  {
    number: 17,
    name: "Al-Isra",
    arabicName: "الإسراء",
    ayahs: 111,
    revelation: "Meccan",
    juz: 15,
    meaningEn: "The Night Journey",
    meaningRu: "Ночной перенос",
  },
  {
    number: 18,
    name: "Al-Kahf",
    arabicName: "الكهف",
    ayahs: 110,
    revelation: "Meccan",
    juz: 15,
    meaningEn: "The Cave",
    meaningRu: "Пещера",
  },
  {
    number: 19,
    name: "Maryam",
    arabicName: "مريم",
    ayahs: 98,
    revelation: "Meccan",
    juz: 16,
    meaningEn: "Mary",
    meaningRu: "Марьям",
  },
  {
    number: 20,
    name: "Taha",
    arabicName: "طه",
    ayahs: 135,
    revelation: "Meccan",
    juz: 16,
    meaningEn: "Ta-Ha",
    meaningRu: "Та Ха",
  },
  {
    number: 21,
    name: "Al-Anbiya",
    arabicName: "الأنبياء",
    ayahs: 112,
    revelation: "Meccan",
    juz: 17,
    meaningEn: "The Prophets",
    meaningRu: "Пророки",
  },
  {
    number: 22,
    name: "Al-Hajj",
    arabicName: "الحج",
    ayahs: 78,
    revelation: "Medinan",
    juz: 17,
    meaningEn: "The Pilgrimage",
    meaningRu: "Паломничество",
  },
  {
    number: 23,
    name: "Al-Mu'minun",
    arabicName: "المؤمنون",
    ayahs: 118,
    revelation: "Meccan",
    juz: 18,
    meaningEn: "The Believers",
    meaningRu: "Верующие",
  },
  {
    number: 24,
    name: "An-Nur",
    arabicName: "النور",
    ayahs: 64,
    revelation: "Medinan",
    juz: 18,
    meaningEn: "The Light",
    meaningRu: "Свет",
  },
  {
    number: 25,
    name: "Al-Furqan",
    arabicName: "الفرقان",
    ayahs: 77,
    revelation: "Meccan",
    juz: 18,
    meaningEn: "The Criterion",
    meaningRu: "Различение",
  },
  {
    number: 26,
    name: "Ash-Shu'ara",
    arabicName: "الشعراء",
    ayahs: 227,
    revelation: "Meccan",
    juz: 19,
    meaningEn: "The Poets",
    meaningRu: "Поэты",
  },
  {
    number: 27,
    name: "An-Naml",
    arabicName: "النمل",
    ayahs: 93,
    revelation: "Meccan",
    juz: 19,
    meaningEn: "The Ant",
    meaningRu: "Муравьи",
  },
  {
    number: 28,
    name: "Al-Qasas",
    arabicName: "القصص",
    ayahs: 88,
    revelation: "Meccan",
    juz: 20,
    meaningEn: "The Stories",
    meaningRu: "Рассказ",
  },
  {
    number: 29,
    name: "Al-Ankabut",
    arabicName: "العنكبوت",
    ayahs: 69,
    revelation: "Meccan",
    juz: 20,
    meaningEn: "The Spider",
    meaningRu: "Паук",
  },
  {
    number: 30,
    name: "Ar-Rum",
    arabicName: "الروم",
    ayahs: 60,
    revelation: "Meccan",
    juz: 21,
    meaningEn: "The Romans",
    meaningRu: "Римляне",
  },
  {
    number: 31,
    name: "Luqman",
    arabicName: "لقمان",
    ayahs: 34,
    revelation: "Meccan",
    juz: 21,
    meaningEn: "Luqman",
    meaningRu: "Лукман",
  },
  {
    number: 32,
    name: "As-Sajdah",
    arabicName: "السجدة",
    ayahs: 30,
    revelation: "Meccan",
    juz: 21,
    meaningEn: "The Prostration",
    meaningRu: "Поклон",
  },
  {
    number: 33,
    name: "Al-Ahzab",
    arabicName: "الأحزاب",
    ayahs: 73,
    revelation: "Medinan",
    juz: 21,
    meaningEn: "The Combined Forces",
    meaningRu: "Союзники",
  },
  {
    number: 34,
    name: "Saba",
    arabicName: "سبإ",
    ayahs: 54,
    revelation: "Meccan",
    juz: 22,
    meaningEn: "Sheba",
    meaningRu: "Саба",
  },
  {
    number: 35,
    name: "Fatir",
    arabicName: "فاطر",
    ayahs: 45,
    revelation: "Meccan",
    juz: 22,
    meaningEn: "The Originator",
    meaningRu: "Творец",
  },
  {
    number: 36,
    name: "Ya-Sin",
    arabicName: "يس",
    ayahs: 83,
    revelation: "Meccan",
    juz: 22,
    meaningEn: "Ya Sin",
    meaningRu: "Йа Син",
  },
  {
    number: 37,
    name: "As-Saffat",
    arabicName: "الصافات",
    ayahs: 182,
    revelation: "Meccan",
    juz: 23,
    meaningEn: "Those who set the Ranks",
    meaningRu: "Выстроившиеся в ряды",
  },
  {
    number: 38,
    name: "Sad",
    arabicName: "ص",
    ayahs: 88,
    revelation: "Meccan",
    juz: 23,
    meaningEn: "The Letter Sad",
    meaningRu: "Сад",
  },
  {
    number: 39,
    name: "Az-Zumar",
    arabicName: "الزمر",
    ayahs: 75,
    revelation: "Meccan",
    juz: 23,
    meaningEn: "The Troops",
    meaningRu: "Толпы",
  },
  {
    number: 40,
    name: "Ghafir",
    arabicName: "غافر",
    ayahs: 85,
    revelation: "Meccan",
    juz: 24,
    meaningEn: "The Forgiver",
    meaningRu: "Прощающий",
  },
  {
    number: 41,
    name: "Fussilat",
    arabicName: "فصلت",
    ayahs: 54,
    revelation: "Meccan",
    juz: 24,
    meaningEn: "Explained in Detail",
    meaningRu: "Разъяснены",
  },
  {
    number: 42,
    name: "Ash-Shura",
    arabicName: "الشورى",
    ayahs: 53,
    revelation: "Meccan",
    juz: 25,
    meaningEn: "The Consultation",
    meaningRu: "Совет",
  },
  {
    number: 43,
    name: "Az-Zukhruf",
    arabicName: "الزخرف",
    ayahs: 89,
    revelation: "Meccan",
    juz: 25,
    meaningEn: "The Ornaments of Gold",
    meaningRu: "Украшения",
  },
  {
    number: 44,
    name: "Ad-Dukhan",
    arabicName: "الدخان",
    ayahs: 59,
    revelation: "Meccan",
    juz: 25,
    meaningEn: "The Smoke",
    meaningRu: "Дым",
  },
  {
    number: 45,
    name: "Al-Jathiyah",
    arabicName: "الجاثية",
    ayahs: 37,
    revelation: "Meccan",
    juz: 25,
    meaningEn: "The Crouching",
    meaningRu: "Коленопреклоненные",
  },
  {
    number: 46,
    name: "Al-Ahqaf",
    arabicName: "الأحقاف",
    ayahs: 35,
    revelation: "Meccan",
    juz: 26,
    meaningEn: "The Wind-Curved Sandhills",
    meaningRu: "Пески",
  },
  {
    number: 47,
    name: "Muhammad",
    arabicName: "محمد",
    ayahs: 38,
    revelation: "Medinan",
    juz: 26,
    meaningEn: "Muhammad",
    meaningRu: "Мухаммад",
  },
  {
    number: 48,
    name: "Al-Fath",
    arabicName: "الفتح",
    ayahs: 29,
    revelation: "Medinan",
    juz: 26,
    meaningEn: "The Victory",
    meaningRu: "Победа",
  },
  {
    number: 49,
    name: "Al-Hujurat",
    arabicName: "الحجرات",
    ayahs: 18,
    revelation: "Medinan",
    juz: 26,
    meaningEn: "The Rooms",
    meaningRu: "Комнаты",
  },
  {
    number: 50,
    name: "Qaf",
    arabicName: "ق",
    ayahs: 45,
    revelation: "Meccan",
    juz: 26,
    meaningEn: "The Letter Qaf",
    meaningRu: "Каф",
  },
  {
    number: 51,
    name: "Adh-Dhariyat",
    arabicName: "الذاريات",
    ayahs: 60,
    revelation: "Meccan",
    juz: 26,
    meaningEn: "The Winnowing Winds",
    meaningRu: "Рассеивающие",
  },
  {
    number: 52,
    name: "At-Tur",
    arabicName: "الطور",
    ayahs: 49,
    revelation: "Meccan",
    juz: 27,
    meaningEn: "The Mount",
    meaningRu: "Гора",
  },
  {
    number: 53,
    name: "An-Najm",
    arabicName: "النجم",
    ayahs: 62,
    revelation: "Meccan",
    juz: 27,
    meaningEn: "The Star",
    meaningRu: "Звезда",
  },
  {
    number: 54,
    name: "Al-Qamar",
    arabicName: "القمر",
    ayahs: 55,
    revelation: "Meccan",
    juz: 27,
    meaningEn: "The Moon",
    meaningRu: "Луна",
  },
  {
    number: 55,
    name: "Ar-Rahman",
    arabicName: "الرحمن",
    ayahs: 78,
    revelation: "Medinan",
    juz: 27,
    meaningEn: "The Beneficent",
    meaningRu: "Милосердный",
  },
  {
    number: 56,
    name: "Al-Waqi'ah",
    arabicName: "الواقعة",
    ayahs: 96,
    revelation: "Meccan",
    juz: 27,
    meaningEn: "The Inevitable",
    meaningRu: "Событие",
  },
  {
    number: 57,
    name: "Al-Hadid",
    arabicName: "الحديد",
    ayahs: 29,
    revelation: "Medinan",
    juz: 27,
    meaningEn: "The Iron",
    meaningRu: "Железо",
  },
  {
    number: 58,
    name: "Al-Mujadila",
    arabicName: "المجادلة",
    ayahs: 22,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "The Pleading Woman",
    meaningRu: "Препирающаяся",
  },
  {
    number: 59,
    name: "Al-Hashr",
    arabicName: "الحشر",
    ayahs: 24,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "The Exile",
    meaningRu: "Сбор",
  },
  {
    number: 60,
    name: "Al-Mumtahanah",
    arabicName: "الممتحنة",
    ayahs: 13,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "She that is to be examined",
    meaningRu: "Испытуемая",
  },
  {
    number: 61,
    name: "As-Saff",
    arabicName: "الصف",
    ayahs: 14,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "The Ranks",
    meaningRu: "Ряды",
  },
  {
    number: 62,
    name: "Al-Jumu'ah",
    arabicName: "الجمعة",
    ayahs: 11,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "The Congregation, Friday",
    meaningRu: "Собрание",
  },
  {
    number: 63,
    name: "Al-Munafiqun",
    arabicName: "المنافقون",
    ayahs: 11,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "The Hypocrites",
    meaningRu: "Лицемеры",
  },
  {
    number: 64,
    name: "At-Taghabun",
    arabicName: "التغابن",
    ayahs: 18,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "The Mutual Disillusion",
    meaningRu: "Взаимное обделение",
  },
  {
    number: 65,
    name: "At-Talaq",
    arabicName: "الطلاق",
    ayahs: 12,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "The Divorce",
    meaningRu: "Развод",
  },
  {
    number: 66,
    name: "At-Tahrim",
    arabicName: "التحريم",
    ayahs: 12,
    revelation: "Medinan",
    juz: 28,
    meaningEn: "The Prohibition",
    meaningRu: "Запрещение",
  },
  {
    number: 67,
    name: "Al-Mulk",
    arabicName: "الملك",
    ayahs: 30,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Sovereignty",
    meaningRu: "Власть",
  },
  {
    number: 68,
    name: "Al-Qalam",
    arabicName: "القلم",
    ayahs: 52,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Pen",
    meaningRu: "Письменная трость",
  },
  {
    number: 69,
    name: "Al-Haqqah",
    arabicName: "الحاقة",
    ayahs: 52,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Reality",
    meaningRu: "Неминуемое",
  },
  {
    number: 70,
    name: "Al-Ma'arij",
    arabicName: "المعارج",
    ayahs: 44,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Ascending Stairways",
    meaningRu: "Ступени",
  },
  {
    number: 71,
    name: "Nuh",
    arabicName: "نوح",
    ayahs: 28,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "Noah",
    meaningRu: "Нух",
  },
  {
    number: 72,
    name: "Al-Jinn",
    arabicName: "الجن",
    ayahs: 28,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Jinn",
    meaningRu: "Джинны",
  },
  {
    number: 73,
    name: "Al-Muzzammil",
    arabicName: "المزمل",
    ayahs: 20,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Enshrouded One",
    meaningRu: "Завернувшийся",
  },
  {
    number: 74,
    name: "Al-Muddathir",
    arabicName: "المدثر",
    ayahs: 56,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Cloaked One",
    meaningRu: "Закутавшийся",
  },
  {
    number: 75,
    name: "Al-Qiyamah",
    arabicName: "القيامة",
    ayahs: 40,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Resurrection",
    meaningRu: "Воскресение",
  },
  {
    number: 76,
    name: "Al-Insan",
    arabicName: "الانسان",
    ayahs: 31,
    revelation: "Medinan",
    juz: 29,
    meaningEn: "The Man",
    meaningRu: "Человек",
  },
  {
    number: 77,
    name: "Al-Mursalat",
    arabicName: "المرسلات",
    ayahs: 50,
    revelation: "Meccan",
    juz: 29,
    meaningEn: "The Emissaries",
    meaningRu: "Посылаемые",
  },
  {
    number: 78,
    name: "An-Naba",
    arabicName: "النبأ",
    ayahs: 40,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Tidings",
    meaningRu: "Весть",
  },
  {
    number: 79,
    name: "An-Nazi'at",
    arabicName: "النازعات",
    ayahs: 46,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "Those who drag forth",
    meaningRu: "Исторгающие",
  },
  {
    number: 80,
    name: "Abasa",
    arabicName: "عبس",
    ayahs: 42,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "He Frowned",
    meaningRu: "Нахмурился",
  },
  {
    number: 81,
    name: "At-Takwir",
    arabicName: "التكوير",
    ayahs: 29,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Overthrowing",
    meaningRu: "Скручивание",
  },
  {
    number: 82,
    name: "Al-Infitar",
    arabicName: "الإنفطار",
    ayahs: 19,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Cleaving",
    meaningRu: "Раскалывание",
  },
  {
    number: 83,
    name: "Al-Mutaffifin",
    arabicName: "المطففين",
    ayahs: 36,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Defrauding",
    meaningRu: "Обвешивающие",
  },
  {
    number: 84,
    name: "Al-Inshiqaq",
    arabicName: "الانشقاق",
    ayahs: 25,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Sundering",
    meaningRu: "Разверзнется",
  },
  {
    number: 85,
    name: "Al-Buruj",
    arabicName: "البروج",
    ayahs: 22,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Mansions of the Stars",
    meaningRu: "Созвездия",
  },
  {
    number: 86,
    name: "At-Tariq",
    arabicName: "الطارق",
    ayahs: 17,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Nightcommer",
    meaningRu: "Ночной путник",
  },
  {
    number: 87,
    name: "Al-A'la",
    arabicName: "الأعلى",
    ayahs: 19,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Most High",
    meaningRu: "Всевышний",
  },
  {
    number: 88,
    name: "Al-Ghashiyah",
    arabicName: "الغاشية",
    ayahs: 26,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Overwhelming",
    meaningRu: "Покрывающее",
  },
  {
    number: 89,
    name: "Al-Fajr",
    arabicName: "الفجر",
    ayahs: 30,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Dawn",
    meaningRu: "Заря",
  },
  {
    number: 90,
    name: "Al-Balad",
    arabicName: "البلد",
    ayahs: 20,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The City",
    meaningRu: "Город",
  },
  {
    number: 91,
    name: "Ash-Shams",
    arabicName: "الشمس",
    ayahs: 15,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Sun",
    meaningRu: "Солнце",
  },
  {
    number: 92,
    name: "Al-Layl",
    arabicName: "الليل",
    ayahs: 21,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Night",
    meaningRu: "Ночь",
  },
  {
    number: 93,
    name: "Ad-Duha",
    arabicName: "الضحى",
    ayahs: 11,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Morning Hours",
    meaningRu: "Утро",
  },
  {
    number: 94,
    name: "Ash-Sharh",
    arabicName: "الشرح",
    ayahs: 8,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Relief",
    meaningRu: "Раскрытие",
  },
  {
    number: 95,
    name: "At-Tin",
    arabicName: "التين",
    ayahs: 8,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Fig",
    meaningRu: "Смоковница",
  },
  {
    number: 96,
    name: "Al-Alaq",
    arabicName: "العلق",
    ayahs: 19,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Clot",
    meaningRu: "Сгусток",
  },
  {
    number: 97,
    name: "Al-Qadr",
    arabicName: "القدر",
    ayahs: 5,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Power",
    meaningRu: "Предопределение",
  },
  {
    number: 98,
    name: "Al-Bayyinah",
    arabicName: "البينة",
    ayahs: 8,
    revelation: "Medinan",
    juz: 30,
    meaningEn: "The Clear Proof",
    meaningRu: "Ясное знамение",
  },
  {
    number: 99,
    name: "Az-Zalzalah",
    arabicName: "الزلزلة",
    ayahs: 8,
    revelation: "Medinan",
    juz: 30,
    meaningEn: "The Earthquake",
    meaningRu: "Сотрясение",
  },
  {
    number: 100,
    name: "Al-Adiyat",
    arabicName: "العاديات",
    ayahs: 11,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Courser",
    meaningRu: "Скачущие",
  },
  {
    number: 101,
    name: "Al-Qari'ah",
    arabicName: "القارعة",
    ayahs: 11,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Calamity",
    meaningRu: "Великое бедствие",
  },
  {
    number: 102,
    name: "At-Takathur",
    arabicName: "التكاثر",
    ayahs: 8,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Rivalry in world increase",
    meaningRu: "Страсть к приумножению",
  },
  {
    number: 103,
    name: "Al-Asr",
    arabicName: "العصر",
    ayahs: 3,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Declining Day",
    meaningRu: "Предвечернее время",
  },
  {
    number: 104,
    name: "Al-Humazah",
    arabicName: "الهمزة",
    ayahs: 9,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Traducer",
    meaningRu: "Хулитель",
  },
  {
    number: 105,
    name: "Al-Fil",
    arabicName: "الفيل",
    ayahs: 5,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Elephant",
    meaningRu: "Слон",
  },
  {
    number: 106,
    name: "Quraysh",
    arabicName: "قريش",
    ayahs: 4,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "Quraysh",
    meaningRu: "Курайш",
  },
  {
    number: 107,
    name: "Al-Ma'un",
    arabicName: "الماعون",
    ayahs: 7,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Small kindnesses",
    meaningRu: "Мелочь",
  },
  {
    number: 108,
    name: "Al-Kawthar",
    arabicName: "الكوثر",
    ayahs: 3,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Abundance",
    meaningRu: "Изобилие",
  },
  {
    number: 109,
    name: "Al-Kafirun",
    arabicName: "الكافرون",
    ayahs: 6,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Disbelievers",
    meaningRu: "Неверующие",
  },
  {
    number: 110,
    name: "An-Nasr",
    arabicName: "النصر",
    ayahs: 3,
    revelation: "Medinan",
    juz: 30,
    meaningEn: "The Help",
    meaningRu: "Помощь",
  },
  {
    number: 111,
    name: "Al-Masad",
    arabicName: "المسد",
    ayahs: 5,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Palm Fiber",
    meaningRu: "Пальмовые волокна",
  },
  {
    number: 112,
    name: "Al-Ikhlas",
    arabicName: "الإخلاص",
    ayahs: 4,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Sincerity",
    meaningRu: "Искренность",
  },
  {
    number: 113,
    name: "Al-Falaq",
    arabicName: "الفلق",
    ayahs: 5,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "The Daybreak",
    meaningRu: "Рассвет",
  },
  {
    number: 114,
    name: "An-Nas",
    arabicName: "الناس",
    ayahs: 6,
    revelation: "Meccan",
    juz: 30,
    meaningEn: "Mankind",
    meaningRu: "Люди",
  },
];

// Генерация остальных сур (упрощенно для примера)
const generateAllSurahs = () => {
  const surahs = [...ALL_SURAHS];
  const existingNumbers = new Set(surahs.map(s => s.number));
  
  // Добавляем остальные суры с базовыми данными только если их еще нет
  for (let i = 1; i <= 114; i++) {
    if (!existingNumbers.has(i)) {
      surahs.push({
        number: i,
        name: `Surah ${i}`,
        arabicName: `سورة ${i}`,
        ayahs: Math.floor(Math.random() * 100) + 10,
        revelation: i % 2 === 0 ? ("Meccan" as const) : ("Medinan" as const),
        juz: Math.ceil(i / 4),
        meaningEn: `Meaning ${i}`,
        meaningRu: `Значение ${i}`,
      });
    }
  }
  return surahs.sort((a, b) => a.number - b.number);
};

const COMPLETE_SURAHS = generateAllSurahs();

type FilterType =
  | "all"
  | "available"
  | "completed"
  | "locked"
  | "meccan"
  | "medinan";
type ViewMode = "grid" | "list" | "juz";

interface JourneyMapProps {
  onStartQuiz: (surahNumber: number) => void;
}

export default function JourneyMap({ onStartQuiz }: JourneyMapProps) {
  const { locale, t } = useLocale();
  const { initializeJourney, getSurahStatus, stats, resetJourney } =
    useJourneyStore();

  // Функция для получения локализованного текста
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

  const [filter, setFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  const primaryColor = "var(--color-primary)";
  const filtersLabel = t('journey.filters');

  useEffect(() => {
    initializeJourney();
  }, [initializeJourney]);

  // Фильтрация сур
  const filteredSurahs = COMPLETE_SURAHS.filter((surah) => {
    const status = getSurahStatus(surah.number);

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        surah.name.toLowerCase().includes(query) ||
        surah.arabicName.includes(query) ||
        surah.number.toString().includes(query) ||
        (locale === "en" ? surah.meaningEn : surah.meaningRu)
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) return false;
    }

    // Фильтр по статусу
    switch (filter) {
      case "available":
        return status === "available";
      case "completed":
        return status === "completed" || status === "perfect";
      case "locked":
        return status === "locked";
      case "meccan":
        return surah.revelation === "Meccan";
      case "medinan":
        return surah.revelation === "Medinan";
      default:
        return true;
    }
  });

  // Группировка по джузам для режима "juz"
  const surahsByJuz = COMPLETE_SURAHS.reduce((acc, surah) => {
    if (!acc[surah.juz]) acc[surah.juz] = [];
    acc[surah.juz].push(surah);
    return acc;
  }, {} as Record<number, typeof COMPLETE_SURAHS>);

  const filterButtons: Array<{
    id: FilterType;
    labelKey: string;
    icon: LucideIcon;
  }> = [
    { id: "all", labelKey: "allSurahs", icon: BookOpen },
    { id: "available", labelKey: "availableSurahs", icon: Target },
    { id: "completed", labelKey: "completedSurahs", icon: CheckCircle2 },
    { id: "locked", labelKey: "lockedSurahs", icon: Lock },
    { id: "meccan", labelKey: "meccanSurahs", icon: Sun },
    { id: "medinan", labelKey: "medinanSurahs", icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      {/* Заголовок карты */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8" style={{ color: primaryColor }} />
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--fixed-text)" }}
              >
                {t('journey.quranJourney')}
              </h1>
              <p
                className="text-sm"
                style={{ color: "var(--fixed-text-secondary)" }}
              >
                {`${stats.completedSurahs}/114 ${t('surahs')} ${t('journey.completed')} • ${stats.totalProgress}% ${t('journey.progress')}`}
              </p>
            </div>
          </div>

          {/* Переключатели вида */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`gap-2 ${viewMode === "grid" ? "text-white bg-[var(--color-primary)]" : " border-2 border-[var(--color-primary)]"}`}
            >
              <Grid3x3 className="w-4 h-4" />
              {t('grid')}
            </Button>
            <Button
              size="sm"
              onClick={() => setViewMode("juz")}
              className={`gap-2 ${viewMode === "juz" ? "text-white bg-[var(--color-primary)]" : "border-2 border-[var(--color-primary)]"}`}
            >
              <Layers className="w-4 h-4" />
              {t('journey.byJuz')}
            </Button>
          </div>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: "var(--fixed-text-secondary)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('journey.searchSurahs')}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--fixed-background)",
              borderColor: "var(--color-border)",
              color: "var(--fixed-text)",
            }}
          />
        </div>

        {/* Фильтры */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter
              className="w-5 h-5"
              style={{ color: "var(--fixed-text-secondary)" }}
            />
            <span
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--fixed-text-secondary)" }}
            >
              {filtersLabel}
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max snap-x pb-1">
              {filterButtons.map(({ id, labelKey, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium snap-start",
                    filter === id ? "shadow-md" : "opacity-90 hover:opacity-100"
                  )}
                  style={{
                    backgroundColor:
                      filter === id
                        ? primaryColor
                        : "var(--fixed-background)",
                    borderColor:
                      filter === id ? primaryColor : "var(--color-border)",
                    color: filter === id ? "white" : "var(--fixed-text)",
                  }}
                  aria-pressed={filter === id}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t(`journey.${labelKey}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Карта сур */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSurahs.map((surah) => (
            <SurahStation
              key={surah.number}
              surahNumber={surah.number}
              name={surah.name}
              arabicName={surah.arabicName}
              ayahs={surah.ayahs}
              revelation={surah.revelation}
              meaningEn={surah.meaningEn}
              meaningRu={surah.meaningRu}
              onStart={onStartQuiz}
            />
          ))}
        </div>
      )}

      {/* Вид по Джузам */}
      {viewMode === "juz" && (
        <div className="space-y-6">
          {Object.entries(surahsByJuz).map(([juzNumber, surahs]) => {
            const juzProgress = surahs.filter((s) => {
              const status = getSurahStatus(s.number);
              return status === "completed" || status === "perfect";
            }).length;

            return (
              <div
                key={juzNumber}
                className="rounded-2xl border-2 overflow-hidden"
                style={{
                  backgroundColor: "var(--fixed-background)",
                  borderColor: "var(--color-border)",
                }}
              >
                {/* Заголовок Джуза */}
                <div
                  className="p-4 border-b-2 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    borderColor: "var(--color-border)",
                  }}
                  onClick={() =>
                    setSelectedJuz(
                      selectedJuz === Number(juzNumber)
                        ? null
                        : Number(juzNumber)
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: "var(--fixed-text)" }}
                    >
                      {locale === "en"
                        ? `Juz ${juzNumber}`
                        : `Джуз ${juzNumber}`}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span
                        className="text-sm"
                        style={{ color: "var(--fixed-text-secondary)" }}
                      >
                        {juzProgress}/{surahs.length}{" "}
                        {t('journey.completed')}
                      </span>
                      <div
                        className="w-24 h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--color-border)" }}
                      >
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(juzProgress / surahs.length) * 100}%`,
                            backgroundColor: primaryColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Суры в джузе */}
                {(selectedJuz === Number(juzNumber) ||
                  selectedJuz === null) && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {surahs.map((surah) => (
                      <SurahStation
                        key={surah.number}
                        surahNumber={surah.number}
                        name={surah.name}
                        arabicName={surah.arabicName}
                        ayahs={surah.ayahs}
                        revelation={surah.revelation}
                        meaningEn={surah.meaningEn}
                        meaningRu={surah.meaningRu}
                        onStart={onStartQuiz}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Пустое состояние */}
      {filteredSurahs.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--fixed-text)" }}
          >
            {t('journey.noSurahsFound')}
          </p>
          <p style={{ color: "var(--fixed-text-secondary)" }}>
            {t('journey.tryAdjustingFilters')}
          </p>
        </div>
      )}
    </div>
  );
}
