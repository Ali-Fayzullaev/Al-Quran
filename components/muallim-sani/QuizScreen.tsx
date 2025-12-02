'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MuallamSaniProfile, Quiz, Question, QuestionAnswer, AchievementNotification } from '@/types/muallim-sani';
import { muallamSaniStore } from '@/lib/muallamSaniStore';
import { Trophy, Target, Clock, CheckCircle, XCircle, Star, Zap, Award, FileText, Timer, Medal, BookOpen, ArrowLeft, Rocket } from 'lucide-react';
import AchievementNotificationPopup from './AchievementNotificationPopup';

interface QuizScreenProps {
  profile: MuallamSaniProfile;
  quizId: string;
  onScreenChange: (screen: string, data?: any) => void;
  onProfileUpdate: (profile: MuallamSaniProfile) => void;
  onQuizComplete?: (quizLevelId: string, passed: boolean) => void;
}

// Вопросы по уровням обучения
const LEVEL_QUESTIONS: Record<string, Question[]> = {
  'alifba': [
    {
      id: '1',
      type: 'true-false',
      text: 'Арабский алфавит состоит ровно из 28 букв.',
      options: ['Верно', 'Неверно'],
      correctAnswer: 'Верно',
      explanation: 'В арабском алфавите действительно 28 букв',
      difficulty: 1,
      points: 10
    },
    {
      id: '2',
      type: 'multiple-choice',
      text: 'Какая буква является первой буквой арабского алфавита?',
      options: ['ب', 'ث', 'ا', 'ن'],
      correctAnswer: 'ا',
      explanation: 'Алиф (ا) - первая буква арабского алфавита',
      difficulty: 1,
      points: 10
    },
    {
      id: '3',
      type: 'multiple-choice',
      text: 'Какая буква произносится как "та"?',
      options: ['ت', 'ح', 'خ', 'ص'],
      correctAnswer: 'ت',
      explanation: 'Буква ت произносится как "та"',
      difficulty: 1,
      points: 10
    },
    {
      id: '4',
      type: 'true-false',
      text: 'Буква "ق" произносится мягче, чем буква "ك".',
      options: ['Верно', 'Неверно'],
      correctAnswer: 'Неверно',
      explanation: 'Буква "ق" произносится глубже и тверже, чем "ك"',
      difficulty: 2,
      points: 10
    },
    {
      id: '5',
      type: 'multiple-choice',
      text: 'Какая буква произносится как "хо" (высокий хо)?',
      options: ['ح', 'ه', 'خ', 'غ'],
      correctAnswer: 'خ',
      explanation: 'Буква خ произносится как высокий звук "хо"',
      difficulty: 2,
      points: 10
    },
    {
      id: '6',
      type: 'multiple-choice',
      text: 'Какая буква обозначает звук [mim]?',
      options: ['ن', 'م', 'ل', 'ك'],
      correctAnswer: 'م',
      explanation: 'Буква م обозначает звук [mim]',
      difficulty: 1,
      points: 10
    },
    {
      id: '7',
      type: 'multiple-choice',
      text: 'Какая буква обозначает звук [qof] (глубокий qof)?',
      options: ['ك', 'ق', 'غ', 'ف'],
      correctAnswer: 'ق',
      explanation: 'Буква ق обозначает глубокий звук [qof]',
      difficulty: 2,
      points: 10
    },
    {
      id: '8',
      type: 'multiple-choice',
      text: 'Сколько букв в арабском алфавите?',
      options: ['26', '27', '28', '30'],
      correctAnswer: '28',
      explanation: 'В арабском алфавите 28 букв',
      difficulty: 1,
      points: 10
    },
    {
      id: '9',
      type: 'fill-blank',
      text: 'Напишите арабскую букву, которая произносится как "qof" (глубокий "к").',
      correctAnswer: 'ق',
      explanation: 'Буква ق произносится как глубокий звук "qof"',
      difficulty: 2,
      points: 10
    },
    {
      id: '10',
      type: 'fill-blank',
      text: 'Напишите арабскую букву, которая произносится как "ба".',
      correctAnswer: 'ب',
      explanation: 'Буква ب произносится как "ба"',
      difficulty: 1,
      points: 10
    }
  ],
  'all-letters': [
    {
      id: '1',
      type: 'multiple-choice',
      text: 'Как читается слово "كَتَبَ"?',
      options: ['катаба', 'китаба', 'кутубу', 'катбу'],
      correctAnswer: 'катаба',
      explanation: 'Слово "كَتَبَ" читается как "катаба" - он написал',
      difficulty: 1,
      points: 10
    },
    {
      id: '2',
      type: 'multiple-choice',
      text: 'Какой харакат стоит над буквой "س" в слове "سَمِعَ"?',
      options: ['а', 'и', 'у', 'сукун'],
      correctAnswer: 'а',
      explanation: 'Над буквой "س" в слове "سَمِعَ" стоит фатха (а)',
      difficulty: 2,
      points: 10
    },
    {
      id: '3',
      type: 'multiple-choice',
      text: 'Как читается слово "دَخَلَ"?',
      options: ['дахола', 'дихила', 'духула', 'дахил'],
      correctAnswer: 'дахола',
      explanation: 'Слово "دَخَلَ" читается как "дахола" - он вошел',
      difficulty: 2,
      points: 10
    },
    {
      id: '4',
      type: 'multiple-choice',
      text: 'Какой харакат стоит над буквой "ر" в слове "رَكِبَ"?',
      options: ['а', 'и', 'у', 'сукун'],
      correctAnswer: 'а',
      explanation: 'Над буквой "ر" в слове "رَكِبَ" стоит фатха (а)',
      difficulty: 2,
      points: 10
    },
    {
      id: '5',
      type: 'multiple-choice',
      text: 'Как читается слово "نَظَرَ"?',
      options: ['назора', 'низира', 'нузура', 'назир'],
      correctAnswer: 'назора',
      explanation: 'Слово "نَظَرَ" читается как "назора" - он посмотрел',
      difficulty: 2,
      points: 10
    },
    {
      id: '6',
      type: 'multiple-choice',
      text: 'Как читается слово "اِسْتَمَعَ" ?',
      options: ['истамаа', 'исътама', 'астама', 'астамаа'],
      correctAnswer: 'истамаа',
      explanation: 'Слово "اِسْتَمَعَ" читается как "истамаа" - он послушал',
      difficulty: 3,
      points: 10
    },
    {
      id: '7',
      type: 'multiple-choice',
      text: 'Какой харакат стоит над буквой "ف" в слове "فَعَلَ"?',
      options: ['а', 'и', 'у', 'сукун'],
      correctAnswer: 'а',
      explanation: 'Над буквой "ف" в слове "فَعَلَ" стоит фатха (а)',
      difficulty: 2,
      points: 10
    },
    {
      id: '8',
      type: 'multiple-choice',
      text: 'Как читается слово "اِسْتَقْبَلَ" ?',
      options: ['истакбала', 'истакбила', 'истекбала', 'астакбала'],
      correctAnswer: 'истакбала',
      explanation: 'Слово "اِسْتَقْبَلَ" читается как "истакбала" - он встретил',
      difficulty: 3,
      points: 10
    },
    {
      id: '9',
      type: 'multiple-choice',
      text: 'Как читается слово "ضَرَبَ"?',
      options: ['дароба', 'дириба', 'дуруба', 'дариб'],
      correctAnswer: 'дароба',
      explanation: 'Слово "ضَرَبَ" читается как "дароба" - он ударил',
      difficulty: 2,
      points: 10
    },
    {
      id: '10',
      type: 'true-false',
      text: 'В слове "صَدَقَ" буква "د" имеет фатху.',
      options: ['Верно', 'Неверно'],
      correctAnswer: 'Верно',
      explanation: 'В слове "صَدَقَ" буква "د" действительно имеет фатху',
      difficulty: 2,
      points: 10
    }
  ],
  'mad-tabii': [
    {
      id: '1',
      type: 'multiple-choice',
      text: 'Как читается слово "قَالَ"?',
      options: ['коола', 'килала', 'коля', 'колаа'],
      correctAnswer: 'коола',
      explanation: 'Слово "قَالَ" читается как "коола" с удлинением алифа',
      difficulty: 2,
      points: 10
    },
    {
      id: '2',
      type: 'multiple-choice',
      text: 'Как читается слово "نَجَا"?',
      options: ['наджаа', 'ниджа', 'наджуа', 'наажа'],
      correctAnswer: 'наджаа',
      explanation: 'Слово "نَجَا" читается как "наджаа" с удлинением алифа в конце',
      difficulty: 2,
      points: 10
    },
    {
      id: '3',
      type: 'multiple-choice',
      text: 'Как читается слово "أَخَافَ"?',
      options: ['ахоофа', 'ахааф', 'ахаафа', 'ахафаа'],
      correctAnswer: 'ахоофа',
      explanation: 'Слово "أَخَافَ" читается как "ахоофа" с удлинением вава',
      difficulty: 2,
      points: 10
    },
    {
      id: '4',
      type: 'multiple-choice',
      text: 'Как читается слово "يَقْرَأُ"?',
      options: ['якараа', 'якаръу', 'якириа', 'якаръа'],
      correctAnswer: 'якараа',
      explanation: 'Слово "يَقْرَأُ" читается как "якараа" с удлинением',
      difficulty: 3,
      points: 10
    },
    {
      id: '5',
      type: 'multiple-choice',
      text: 'Как читается слово "سَمِيعَ"?',
      options: ['самииа', 'саамия', 'самиуа', 'самиа'],
      correctAnswer: 'самииа',
      explanation: 'Слово "سَمِيعَ" читается как "самииа" с удлинением йа',
      difficulty: 2,
      points: 10
    },
    {
      id: '6',
      type: 'multiple-choice',
      text: 'Как читается слово "اِسْتَمَاعَ"?',
      options: ['истамааа', 'истемаа', 'исътамаа', 'астамаа'],
      correctAnswer: 'истамааа',
      explanation: 'Слово "اِسْتَمَاعَ" читается как "истамааа" с удлинением алифа',
      difficulty: 3,
      points: 10
    },
    {
      id: '7',
      type: 'multiple-choice',
      text: 'Как читается слово "اِسْتَقْبَلَ"?',
      options: ['истакбала', 'истекбала', 'астакбала', 'истакбила'],
      correctAnswer: 'истакбала',
      explanation: 'Слово "اِسْتَقْبَلَ" читается как "истакбала"',
      difficulty: 3,
      points: 10
    },
    {
      id: '8',
      type: 'multiple-choice',
      text: 'Как читается слово "اِسْتِعْمَالَ"?',
      options: ['истимаала', 'истамаала', 'истумала', 'астимаала'],
      correctAnswer: 'истимаала',
      explanation: 'Слово "اِسْتِعْمَالَ" читается как "истимаала" с удлинением алифа',
      difficulty: 3,
      points: 10
    },
    {
      id: '9',
      type: 'multiple-choice',
      text: 'Как читается слово "فَازَتْ"?',
      options: ['фаазат', 'фазат', 'фазаат', 'фуазат'],
      correctAnswer: 'фаазат',
      explanation: 'Слово "فَازَتْ" читается как "фаазат" с удлинением алифа',
      difficulty: 2,
      points: 10
    },
    {
      id: '10',
      type: 'multiple-choice',
      text: 'Как читается слово "يَقْرَأُونَ"?',
      options: ['якараауна', 'якаръууна', 'якаръауна', 'якаарууна'],
      correctAnswer: 'якараауна',
      explanation: 'Слово "يَقْرَأُونَ" читается как "якараауна" с удлинением',
      difficulty: 3,
      points: 10
    }
  ],
  'tanvin': [
    {
      id: '1',
      type: 'multiple-choice',
      text: 'Как читается слово "بَيْتٌ"?',
      options: ['байтун', 'байтин', 'байтан', 'байтуун'],
      correctAnswer: 'байтун',
      explanation: 'Слово "بَيْتٌ" читается как "байтун" с танвином дамм',
      difficulty: 1,
      points: 10
    },
    {
      id: '2',
      type: 'multiple-choice',
      text: 'Как читается слово "كِتَابٌ"?',
      options: ['китабун', 'китабин', 'китабан', 'китабу'],
      correctAnswer: 'китабун',
      explanation: 'Слово "كِتَابٌ" читается как "китабун" с танвином дамм',
      difficulty: 1,
      points: 10
    },
    {
      id: '3',
      type: 'true-false',
      text: 'Танвин "ـٌ" (дамматан) читается как "-un".',
      options: ['Верно', 'Неверно'],
      correctAnswer: 'Верно',
      explanation: 'Танвин дамматан (ٌ) действительно читается как "-un"',
      difficulty: 1,
      points: 10
    },
    {
      id: '4',
      type: 'multiple-choice',
      text: 'Как читается слово "مَدِينَةٌ"?',
      options: ['мадинатун', 'мадинатин', 'мадинатан', 'мадинатуун'],
      correctAnswer: 'мадинатун',
      explanation: 'Слово "مَدِينَةٌ" читается как "мадинатун" (город)',
      difficulty: 2,
      points: 10
    },
    {
      id: '5',
      type: 'multiple-choice',
      text: 'Как читается слово "وَلَدٌ"?',
      options: ['валадун', 'валид', 'валидан', 'валиду'],
      correctAnswer: 'валадун',
      explanation: 'Слово "وَلَدٌ" читается как "валадун" (мальчик)',
      difficulty: 1,
      points: 10
    },
    {
      id: '6',
      type: 'true-false',
      text: 'Слово "قَلَمٌ" читается как "qolamun".',
      options: ['Верно', 'Неверно'],
      correctAnswer: 'Верно',
      explanation: 'Слово "قَلَمٌ" действительно читается как "qolamun" (ручка)',
      difficulty: 1,
      points: 10
    },
    {
      id: '7',
      type: 'multiple-choice',
      text: 'Как читается слово "دَرْسٌ"?',
      options: ['дарсун', 'дарсин', 'дарсан', 'дарсу'],
      correctAnswer: 'дарсун',
      explanation: 'Слово "دَرْسٌ" читается как "дарсун" (урок)',
      difficulty: 1,
      points: 10
    },
    {
      id: '8',
      type: 'multiple-choice',
      text: 'Как читается слово "رَسُولٌ"?',
      options: ['росуулун', 'расулун', 'расуулан', 'расулу'],
      correctAnswer: 'росуулун',
      explanation: 'Слово "رَسُولٌ" читается как "росуулун" (посланник)',
      difficulty: 2,
      points: 10
    },
    {
      id: '9',
      type: 'multiple-choice',
      text: 'Как читается слово "مُهَنْدِسَاتٌ" (10 букв)?',
      options: ['мухандисатун', 'мухандисату', 'мухандисата', 'мухандисатум'],
      correctAnswer: 'мухандисатун',
      explanation: 'Слово "مُهَنْدِسَاتٌ" читается как "мухандисатун" (женщины-инженеры)',
      difficulty: 3,
      points: 10
    },
    {
      id: '10',
      type: 'multiple-choice',
      text: 'В слове "مُهَنْدِسَاتٌ" какая буква содержит танвин?',
      options: ['م', 'س', 'ت', 'ا'],
      correctAnswer: 'ت',
      explanation: 'В слове "مُهَنْدِسَاتٌ" танвин стоит на букве "ت"',
      difficulty: 2,
      points: 10
    }
  ],
  'tashdid': [
    {
      id: '1',
      type: 'multiple-choice',
      text: 'Как читается слово "مُدَرِّس"?',
      options: ['мударрис', 'мударис', 'мударрас', 'мударриса'],
      correctAnswer: 'мударрис',
      explanation: 'Слово "مُدَرِّس" читается как "мударрис" с удвоением буквы "ر"',
      difficulty: 2,
      points: 10
    },
    {
      id: '2',
      type: 'multiple-choice',
      text: 'В слове "مُدَرِّس" какая буква содержит шадди?',
      options: ['د', 'ر', 'س', 'م'],
      correctAnswer: 'ر',
      explanation: 'В слове "مُدَرِّس" шадди стоит над буквой "ر"',
      difficulty: 2,
      points: 10
    },
    {
      id: '3',
      type: 'multiple-choice',
      text: 'Как читается слово "مُهَنْدِّس"?',
      options: ['муханддисс', 'муханддис', 'мухандисс', 'мухандиса'],
      correctAnswer: 'муханддисс',
      explanation: 'Слово "مُهَنْدِّس" читается как "муханддисс" с удвоением "د"',
      difficulty: 2,
      points: 10
    },
    {
      id: '4',
      type: 'multiple-choice',
      text: 'Как читается слово "مُعَلِّم"?',
      options: ['муаллим', 'муъаллим', 'муаллимм', 'муааллим'],
      correctAnswer: 'муаллим',
      explanation: 'Слово "مُعَلِّم" читается как "муаллим" с удвоением "л"',
      difficulty: 2,
      points: 10
    },
    {
      id: '5',
      type: 'multiple-choice',
      text: 'Как читается слово "مُدَرِّسُون"?',
      options: ['мударрисун', 'мударрисуна', 'мударрисум', 'мударрису'],
      correctAnswer: 'мударрисун',
      explanation: 'Слово "مُدَرِّسُون" читается как "мударрисун" (учителя)',
      difficulty: 3,
      points: 10
    },
    {
      id: '6',
      type: 'multiple-choice',
      text: 'Как читается слово "مُشَكِّك"?',
      options: ['мушаккик', 'мушакккикк', 'мушакик', 'мушааккик'],
      correctAnswer: 'мушаккик',
      explanation: 'Слово "مُشَكِّك" читается как "мушаккик" с удвоением "к"',
      difficulty: 2,
      points: 10
    },
    {
      id: '7',
      type: 'multiple-choice',
      text: 'Как читается слово "مُهَنْدِّسُون"?',
      options: ['мухандисун', 'муханддиссун', 'мухандиссуна', 'мухандис'],
      correctAnswer: 'муханддиссун',
      explanation: 'Слово "مُهَنْدِّسُون" читается как "муханддиссун" (инженеры)',
      difficulty: 3,
      points: 10
    },
    {
      id: '8',
      type: 'multiple-choice',
      text: 'В слове "مُهَنْدِّسُون" шадди стоит над буквой:',
      options: ['ه', 'ن', 'د', 'س'],
      correctAnswer: 'د',
      explanation: 'В слове "مُهَنْدِّسُون" шадди стоит над буквой "د"',
      difficulty: 2,
      points: 10
    },
    {
      id: '9',
      type: 'multiple-choice',
      text: 'Как читается слово "مُدَرِّسَات"?',
      options: ['мударрисат', 'мударисат', 'мударрасат', 'мударрисаат'],
      correctAnswer: 'мударрисат',
      explanation: 'Слово "مُدَرِّسَات" читается как "мударрисат" (учительницы)',
      difficulty: 3,
      points: 10
    },
    {
      id: '10',
      type: 'multiple-choice',
      text: 'Как читается слово "حَدِيث"?',
      options: ['хадис', 'хаддис', 'хадисс', 'хаадис'],
      correctAnswer: 'хадис',
      explanation: 'Слово "حَدِيث" читается как "хадис" (хадис)',
      difficulty: 2,
      points: 10
    }
  ],
  'complete': [
    {
      id: '1',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمَدْرَسَةُ الْكَبِيرَةُ"?',
      options: ['аль-мадрасату аль-кабирату', 'аль-мадраса аль-кабиру', 'аль-мадраса аль-кабираа', 'аль-мадраса аль-кабиру'],
      correctAnswer: 'аль-мадрасату аль-кабирату',
      explanation: 'Фраза "الْمَدْرَسَةُ الْكَبِيرَةُ" читается как "аль-мадрасату аль-кабирату" (большая школа)',
      difficulty: 2,
      points: 10
    },
    {
      id: '2',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمُدَرِّسُونَ الْمَهْتَمُّونَ"?',
      options: ['аль-мударрисуна аль-мухтэммуна', 'аль-мударрисун аль-мухтэммуни', 'аль-мударрисун аль-мухтэммуну', 'аль-мударрисун аль-мухтэммунан'],
      correctAnswer: 'аль-мударрисуна аль-мухтэммуна',
      explanation: 'Фраза "الْمُدَرِّسُونَ الْمَهْتَمُّونَ" читается как "аль-мударрисуна аль-мухтэммуна" (внимательные учителя)',
      difficulty: 3,
      points: 10
    },
    {
      id: '3',
      type: 'multiple-choice',
      text: 'Как читается фраза "الطَّالِبَاتُ الْمُجْتَهِدَاتُ"?',
      options: ['аль-таалибату аль-муджтахидату', 'аль-таалибату аль-муджтахидат', 'аль-таалибату аль-муджтахидаа', 'аль-таалибату аль-муджтахида'],
      correctAnswer: 'аль-таалибату аль-муджтахидату',
      explanation: 'Фраза "الطَّالِبَاتُ الْمُجْتَهِدَاتُ" читается как "аль-таалибату аль-муджтахидату" (прилежные ученицы)',
      difficulty: 3,
      points: 10
    },
    {
      id: '4',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمَسَاجِدُ الْقَدِيمَةُ"?',
      options: ['аль-масаджиду аль-кадиму', 'аль-масаджид аль-кадима', 'аль-масаджиду аль-кадимун', 'аль-масаджиду аль-кадимаа'],
      correctAnswer: 'аль-масаджиду аль-кадиму',
      explanation: 'Фраза "الْمَسَاجِدُ الْقَدِيمَةُ" читается как "аль-масаджиду аль-кадиму" (старые мечети)',
      difficulty: 2,
      points: 10
    },
    {
      id: '5',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْكِتَابُ الْجَدِيدُ"?',
      options: ['аль-китабу аль-джадиду', 'аль-китаб аль-джадид', 'аль-китабу аль-джадидун', 'аль-китабу аль-джадида'],
      correctAnswer: 'аль-китабу аль-джадиду',
      explanation: 'Фраза "الْكِتَابُ الْجَدِيدُ" читается как "аль-китабу аль-джадиду" (новая книга)',
      difficulty: 2,
      points: 10
    },
    {
      id: '6',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمُهَنْدِسُونَ الْمُخْتَصُّونَ"?',
      options: ['аль-мухандисуна аль-мухтассуна', 'аль-мухандисун аль-мухтассуна', 'аль-мухандисун аль-мухтассунаа', 'аль-мухандисун аль-мухтассу'],
      correctAnswer: 'аль-мухандисуна аль-мухтассуна',
      explanation: 'Фраза "الْمُهَنْدِسُونَ الْمُخْتَصُّونَ" читается как "аль-мухандисуна аль-мухтассуна" (специализированные инженеры)',
      difficulty: 3,
      points: 10
    },
    {
      id: '7',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمَدِينَةُ الْقَدِيمَةُ"?',
      options: ['аль-мадинату аль-кадимату', 'аль-мадина аль-кадиму', 'аль-мадина аль-кадимаа', 'аль-мадина аль-кадим'],
      correctAnswer: 'аль-мадинату аль-кадимату',
      explanation: 'Фраза "الْمَدِينَةُ الْقَدِيمَةُ" читается как "аль-мадинату аль-кадимату" (старый город)',
      difficulty: 2,
      points: 10
    },
    {
      id: '8',
      type: 'multiple-choice',
      text: 'Как читается фраза "آمَنَ بِاللهِ"?',
      options: ['аамана биллаху', 'аамана биллахи', 'аамана би-ль-лахи', 'аамана билляхи'],
      correctAnswer: 'аамана биллахи',
      explanation: 'Фраза "آمَنَ بِاللهِ" читается как "аамана биллахи" (уверовал в Аллаха)',
      difficulty: 3,
      points: 10
    },
    {
      id: '9',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمُسْتَشْفَيَاتُ الْجَدِيدَةُ"?',
      options: ['аль-мусташфайяту аль-джадидату', 'аль-мусташфайят аль-джадид', 'аль-мусташфайят аль-джадиду', 'аль-мусташфайят аль-джадидаа'],
      correctAnswer: 'аль-мусташфайяту аль-джадидату',
      explanation: 'Фраза "الْمُسْتَشْفَيَاتُ الْجَدِيدَةُ" читается как "аль-мусташфайяту аль-джадидату" (новые больницы)',
      difficulty: 3,
      points: 10
    },
    {
      id: '10',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمَكْتَبَاتُ الْقَدِيمَةُ"?',
      options: ['аль-мактабату аль-кадимату', 'аль-мактабат аль-кадиму', 'аль-мактабат аль-кадимаа', 'аль-мактабат аль-кадим'],
      correctAnswer: 'аль-мактабату аль-кадимату',
      explanation: 'Фраза "الْمَكْتَبَاتُ الْقَدِيمَةُ" читается как "аль-мактабату аль-кадимату" (старые библиотеки)',
      difficulty: 2,
      points: 10
    },
    {
      id: '11',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمُعَلِّمُونَ الْمَهْتَمُّونَ"?',
      options: ['аль-муаллимуна аль-мухтаммуна', 'аль-муаллимуна аль-мухтэммуна', 'аль-муаллимуна аль-мухтэммуну', 'аль-муаллимуна аль-мухтэммунаа'],
      correctAnswer: 'аль-муаллимуна аль-мухтаммуна',
      explanation: 'Фраза "الْمُعَلِّمُونَ الْمَهْتَمُّونَ" читается как "аль-муаллимуна аль-мухтаммуна" (заботливые учителя)',
      difficulty: 3,
      points: 10
    },
    {
      id: '12',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمُدُنُ الْكَبِيرَةُ"?',
      options: ['аль-мудуну аль-кабирату', 'аль-мудун аль-кабиру', 'аль-мудун аль-кабираа', 'аль-мудун аль-кабиру'],
      correctAnswer: 'аль-мудуну аль-кабирату',
      explanation: 'Фраза "الْمُدُنُ الْكَبِيرَةُ" читается как "аль-мудуну аль-кабирату" (большие города)',
      difficulty: 2,
      points: 10
    },
    {
      id: '13',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْكُتُبُ الْمُفِيدَةُ"?',
      options: ['аль-кутубу аль-муфидату', 'аль-кутуб аль-муфиду', 'аль-кутуб аль-муфидаа', 'аль-кутуб аль-муфидау'],
      correctAnswer: 'аль-кутубу аль-муфидату',
      explanation: 'Фраза "الْكُتُبُ الْمُفِيدَةُ" читается как "аль-кутубу аль-муфидату" (полезные книги)',
      difficulty: 2,
      points: 10
    },
    {
      id: '14',
      type: 'multiple-choice',
      text: 'Как читается фраза "الطَّالِبَاتُ الْمُجْتَهِدَاتُ"?',
      options: ['аль-таалибату аль-муджтахидату', 'аль-таалибату аль-муджтахидат', 'аль-таалибату аль-муджтахидаа', 'аль-таалибату аль-муджтахида'],
      correctAnswer: 'аль-таалибату аль-муджтахидату',
      explanation: 'Фраза "الطَّالِبَاتُ الْمُجْتَهِدَاتُ" читается как "аль-таалибату аль-муджтахидату" (старательные ученицы)',
      difficulty: 3,
      points: 10
    },
    {
      id: '15',
      type: 'multiple-choice',
      text: 'Как читается фраза "الْمُسْتَشْفَيَاتُ الْقَدِيمَةُ"?',
      options: ['аль-мусташфайяту аль-кадима', 'аль-мусташфайят аль-кадиму', 'аль-мусташфайят аль-кадимаа', 'аль-мусташфайят аль-кадим'],
      correctAnswer: 'аль-мусташфайяту аль-кадима',
      explanation: 'Фраза "الْمُسْتَشْفَيَاتُ الْقَدِيمَةُ" читается как "аль-мусташфайяту аль-кадима" (старые больницы)',
      difficulty: 3,
      points: 10
    }
  ]
};



export default function QuizScreen({ profile, quizId, onScreenChange, onProfileUpdate, onQuizComplete }: QuizScreenProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [achievementNotifications, setAchievementNotifications] = useState<AchievementNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<AchievementNotification | null>(null);
  

  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Мемоизируем создание квиза для оптимизации производительности
  const memoizedQuiz = useMemo(() => {
    const questions = LEVEL_QUESTIONS[quizId] || LEVEL_QUESTIONS['alifba'];
    
    return {
      id: quizId,
      levelId: quizId,
      questions: questions,
      passingScore: 70,
      timeLimit: 10 // 10 минут
    };
  }, [quizId]);

  useEffect(() => {
    setQuiz(memoizedQuiz);
  }, [memoizedQuiz]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (quizStarted && timeLeft === 0) {
      handleQuizSubmit();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [quizStarted, timeLeft]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };



  // Функция для показа уведомлений о достижениях
  const showAchievementNotification = (notification: AchievementNotification) => {
    setCurrentNotification(notification);
    // Скрываем уведомление через 3 секунды
    setTimeout(() => {
      setCurrentNotification(null);
    }, 3000);
  };

  const handleNextQuestion = () => {
    if (!quiz || !selectedAnswer.trim()) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const questionAnswer: QuestionAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent: 30
    };

    const newAnswers = [...answers, questionAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer('');
    setShowFeedback(false);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizSubmit(newAnswers);
    }
  };

  const handleQuizSubmit = (finalAnswers?: QuestionAnswer[]) => {
    if (!quiz) return;

    const answersToUse = finalAnswers || answers;
    const totalQuestions = quiz.questions.length;
    const correctAnswers = answersToUse.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const totalTime = quiz.timeLimit ? (quiz.timeLimit * 60 - timeLeft) : 0;
    const passed = score >= (quiz.passingScore || 70); // Минимальный проходной балл

    // Сохранить результат теста всегда (независимо от прохождения)
    muallamSaniStore.updateProgress(quiz.levelId, score, totalTime / 60);
    
    // Обновляем профиль с новой статистикой
    const updatedProfile = muallamSaniStore.getProfile()!;
    
    // Если тест пройден - разблокируем следующий уровень
    if (passed && updatedProfile.progress.unlockedLevels) {
      const allLevels = muallamSaniStore.getLearningLevels();
      const currentLevelIndex = allLevels.findIndex(l => l.id === quiz.levelId);
      
      if (currentLevelIndex >= 0 && currentLevelIndex < allLevels.length - 1) {
        const nextLevel = allLevels[currentLevelIndex + 1];
        if (!updatedProfile.progress.unlockedLevels.includes(nextLevel.id)) {
          updatedProfile.progress.unlockedLevels.push(nextLevel.id);
          muallamSaniStore.saveProfile(updatedProfile);
        }
      }
    }

    // Проверяем достижения после завершения теста
    const newAchievements = muallamSaniStore.checkAchievementsAfterCompletion(
      updatedProfile, 
      passed ? quiz.levelId : undefined, // Передаем levelId только если тест пройден
      score
    );

    // Показываем уведомления о достижениях
    if (newAchievements.length > 0) {
      // Добавим задержку для показа уведомлений
      setTimeout(() => {
        newAchievements.forEach((notification, index) => {
          setTimeout(() => {
            showAchievementNotification(notification);
          }, index * 1500); // Показываем каждое достижение с интервалом в 1.5 секунды
        });
      }, 2000); // Через 2 секунды после показа результатов
    }

    onProfileUpdate(updatedProfile);

    setQuizCompleted(true);
    setShowResults(true);

    // Показываем результаты 3 секунды, потом переходим на дашборд
    const delayTime = 3000 + (newAchievements.length * 1500); // Добавляем время для показа достижений
    setTimeout(() => {
      try {
        if (onQuizComplete) {
          onQuizComplete(quiz.levelId, passed);
        } else {
          // По умолчанию просто переходим на дашборд
          onScreenChange('dashboard');
        }
      } catch (error) {
        console.error('Error in quiz completion:', error);
        // В случае ошибки всегда переходим на дашборд
        onScreenChange('dashboard');
      }
    }, delayTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelName = (levelId: string): string => {
    const levelNames: Record<string, string> = {
      'alifba': 'Алифба (Алфавит)',
      'all-letters': 'Все буквы с харакатами',
      'mad-tabii': 'Мад табии (Удлинение)',
      'tanvin': 'Танвин (Нунация)',
      'tashdid': 'Ташдид (Удвоение)',
      'complete': 'Итоговый экзамен'
    };
    return levelNames[levelId] || 'Тест';
  };

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
             style={{ borderColor: 'var(--color-primary)' }}>
        </div>
        <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          Подготовка теста...
        </p>
      </div>
    );
  }

  if (showResults) {
    const totalQuestions = quiz.questions.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 animate-pulse" 
               style={{ backgroundColor: passed ? '#10B981' : '#EF4444' }}>
            {passed ? 
              <Trophy className="w-12 h-12 text-white animate-bounce" /> : 
              <Target className="w-12 h-12 text-white" />
            }
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {passed ? 'Великолепно!' : 'Почти получилось!'}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <p className="text-xl font-medium" style={{ color: 'var(--color-text)' }}>
              {getLevelName(quiz.levelId)}
            </p>
            <Star className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>

        <div 
          className="rounded-xl p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'var(--color-background)', border: '2px solid var(--color-border)' }}>
              <div className="flex items-center justify-center mb-3">
                {passed ? 
                  <Award className="w-8 h-8 text-green-500" /> : 
                  <Target className="w-8 h-8 text-red-500" />
                }
              </div>
              <div className="text-5xl font-bold mb-2" 
                   style={{ 
                     color: passed ? '#10B981' : '#EF4444',
                     textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                   }}>
                {score}%
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Результат теста
              </div>
            </div>
            
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'var(--color-background)', border: '2px solid var(--color-border)' }}>
              <div className="flex items-center justify-center mb-3">
                {correctAnswers === totalQuestions ? 
                  <CheckCircle className="w-8 h-8 text-green-500" /> :
                  <Zap className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                }
              </div>
              <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Правильных ответов
              </div>
            </div>
            
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'var(--color-background)', border: '2px solid var(--color-border)' }}>
              <div className="flex items-center justify-center mb-3">
                <Clock className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {formatTime(quiz.timeLimit ? (quiz.timeLimit * 60 - timeLeft) : 0)}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Время выполнения
              </div>
            </div>
          </div>

          <div className="text-center">
            {passed ? (
              <div>
                <p className="text-lg mb-4" style={{ color: '#10B981' }}>
                  Отлично! Тест пройден успешно.
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  ⏳ Переходим на главную страницу...
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-4" style={{ color: '#EF4444' }}>
                  Нужно больше практики. Попробуйте еще раз.
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  ⏳ Переходим на главную страницу...
                </p>
              </div>
            )}
          </div>
        </div>

        {!onQuizComplete && (
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onScreenChange('lesson', { lessonId: quiz.levelId })}
              className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-background-secondary)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}
            >
              📖 Повторить урок
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              🔄 Пройти заново
            </button>
            
            <button
              onClick={() => onScreenChange('dashboard')}
              className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              🏠 К урокам
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Главный заголовок с анимацией */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <Target className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-75"></div>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mr-3 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Тест: {getLevelName(quiz.levelId)}
            </h1>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl lg:text-2xl mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Проверьте свои знания по пройденному материалу
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm sm:text-base font-medium">
              <Star className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--color-primary)' }}>Готовы к испытанию?</span>
              <Star className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
        </div>

        {/* Информационные карточки */}
        <div 
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 sm:mb-12 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] border-2"
          style={{ 
            borderColor: 'var(--color-primary)',
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background) 100%)'
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
            {/* Карточка вопросов */}
            <div className="text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1" 
                 style={{ 
                   backgroundColor: 'var(--color-background)', 
                   border: '2px solid var(--color-border)' 
                 }}>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="font-bold text-lg sm:text-xl mb-2" style={{ color: 'var(--color-text)' }}>
                Вопросов
              </div>
              <div className="text-3xl sm:text-4xl font-black mb-2" 
                   style={{ 
                     color: 'var(--color-primary)',
                     textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                   }}>
                {quiz.questions.length}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Различной сложности
              </div>
            </div>
            
            {/* Карточка времени */}
            <div className="text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1" 
                 style={{ 
                   backgroundColor: 'var(--color-background)', 
                   border: '2px solid var(--color-border)' 
                 }}>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <Timer className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full"></div>
                </div>
              </div>
              <div className="font-bold text-lg sm:text-xl mb-2" style={{ color: 'var(--color-text)' }}>
                Время
              </div>
              <div className="text-3xl sm:text-4xl font-black mb-2" 
                   style={{ 
                     color: 'var(--color-primary)',
                     textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                   }}>
                {quiz.timeLimit}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Минут на тест
              </div>
            </div>

            {/* Карточка проходного балла */}
            <div className="text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 sm:col-span-2 lg:col-span-1" 
                 style={{ 
                   backgroundColor: 'var(--color-background)', 
                   border: '2px solid var(--color-border)' 
                 }}>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                </div>
              </div>
              <div className="font-bold text-lg sm:text-xl mb-2" style={{ color: 'var(--color-text)' }}>
                Проходной балл
              </div>
              <div className="text-3xl sm:text-4xl font-black mb-2" 
                   style={{ 
                     color: '#10B981',
                     textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                   }}>
                {quiz.passingScore}%
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Минимум для прохождения
              </div>
            </div>
          </div>
          
          {/* Дополнительная информация */}
          <div className="text-center p-6 rounded-2xl" 
               style={{ 
                 backgroundColor: 'var(--color-background)', 
                 border: '2px dashed var(--color-border)' 
               }}>
            <div className="flex items-center justify-center mb-4 space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-center mb-3">
              <div className="w-6 h-6 mr-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                Типы вопросов
              </h3>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <div className="flex items-center px-4 py-2 rounded-full text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-shadow duration-300"
                   style={{ 
                     backgroundColor: 'var(--color-primary)', 
                     color: 'white' 
                   }}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Множественный выбор
              </div>
              <div className="flex items-center px-4 py-2 rounded-full text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-shadow duration-300"
                   style={{ 
                     backgroundColor: '#10B981', 
                     color: 'white' 
                   }}>
                <Target className="w-4 h-4 mr-2" />
                Верно/неверно
              </div>
              <div className="flex items-center px-4 py-2 rounded-full text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-shadow duration-300"
                   style={{ 
                     backgroundColor: '#F59E0B', 
                     color: 'white' 
                   }}>
                <FileText className="w-4 h-4 mr-2" />
                Заполнить пропуск
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <button
            onClick={() => onScreenChange('dashboard')}
            className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-2xl font-bold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl border-2 order-2 sm:order-1"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Назад к урокам</span>
            </div>
          </button>
          
          <button
            onClick={handleStartQuiz}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 rounded-2xl font-bold text-lg sm:text-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-3xl relative overflow-hidden group order-1 sm:order-2"
            style={{ 
              color: 'white',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)'
            }}
          >
            {/* Мерцающий эффект */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-out"></div>
            
            <div className="flex items-center justify-center space-x-3 relative z-10">
              <Rocket className="w-6 h-6 text-white" />
              <span>Начать тест</span>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </button>
        </div>

        {/* Мотивационное сообщение */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full shadow-lg"
               style={{ 
                 backgroundColor: 'var(--color-background-secondary)',
                 border: '2px solid var(--color-primary)'
               }}>
            <Zap className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
              Удачи в прохождении теста! Вы справитесь! 💪
            </span>
            <Zap className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Заголовок и прогресс */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center sm:text-left" style={{ color: 'var(--color-primary)' }}>
            🎯 {getLevelName(quiz.levelId)}
          </h1>
          <div 
            className="flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-base sm:text-lg shadow-lg"
            style={{ 
              backgroundColor: timeLeft < 60 ? '#FEF2F2' : 'var(--color-background-secondary)',
              color: timeLeft < 60 ? '#EF4444' : 'var(--color-primary)',
              border: `2px solid ${timeLeft < 60 ? '#EF4444' : 'var(--color-primary)'}`
            }}
          >
            <Clock className="w-5 h-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm sm:text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Вопрос {currentQuestionIndex + 1} из {quiz.questions.length}
          </span>
          <span className="text-sm sm:text-base font-bold px-3 py-1 rounded-full" style={{ 
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-background-secondary)'
          }}>
            {Math.round(progressPercentage)}%
          </span>
        </div>

        <div className="w-full h-4 rounded-full overflow-hidden shadow-inner" style={{ backgroundColor: 'var(--color-border)' }}>
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--color-primary)'
            }}
          >
            {/* Мерцающая полоса */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Вопрос */}
      <div 
        className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px'
        }}
      >
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">
              {currentQuestion.type === 'multiple-choice' && '❓'}
              {currentQuestion.type === 'true-false' && '✅'}
              {currentQuestion.type === 'fill-blank' && '📝'}
            </div>
            <div className="text-sm px-3 py-1 rounded-full" 
                 style={{ 
                   backgroundColor: 'var(--color-primary)', 
                   color: 'white' 
                 }}>
              {currentQuestion.points} очков
            </div>
          </div>
          
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 leading-relaxed text-center" style={{ color: 'var(--color-text)' }}>
            {currentQuestion.text}
          </h2>
        </div>

        {/* Варианты ответов */}
        <div className="space-y-4 px-2 sm:px-0">
          {/* Множественный выбор */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl relative overflow-hidden group`}
                    style={{ 
                      backgroundColor: isSelected 
                        ? 'var(--color-primary)' 
                        : 'var(--color-background)',
                      color: isSelected 
                        ? 'white' 
                        : 'var(--color-text)',
                      borderColor: isSelected 
                        ? 'var(--color-primary)' 
                        : 'var(--color-border)',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    {/* Фоновый градиент при выборе */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20"></div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      {/* Красивая буква */}
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-300"
                        style={{
                          backgroundColor: isSelected 
                            ? 'rgba(255,255,255,0.2)' 
                            : 'var(--color-primary)',
                          color: isSelected 
                            ? 'white' 
                            : 'white',
                          boxShadow: isSelected 
                            ? '0 0 20px rgba(255,255,255,0.3)' 
                            : '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        {letters[index]}
                      </div>
                      
                      {/* Текст ответа */}
                      <div className="flex-1 text-base sm:text-lg font-medium leading-relaxed">
                        {option}
                      </div>
                      
                      {/* Иконка выбора */}
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                           style={{
                             borderColor: isSelected ? 'white' : 'var(--color-primary)',
                             backgroundColor: isSelected ? 'white' : 'transparent'
                           }}>
                        {isSelected && (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Мерцающие частицы при наведении */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Верно/Неверно */}
          {currentQuestion.type === 'true-false' && (
            <div className="flex flex-col sm:flex-row gap-4">
              {['Верно', 'Неверно'].map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === 'Верно';
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className="flex-1 p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl relative overflow-hidden group"
                    style={{ 
                      backgroundColor: isSelected 
                        ? (isCorrect ? '#10B981' : '#EF4444')
                        : 'var(--color-background)',
                      color: isSelected 
                        ? 'white' 
                        : 'var(--color-text)',
                      borderColor: isSelected 
                        ? (isCorrect ? '#10B981' : '#EF4444')
                        : 'var(--color-border)',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    {/* Фоновый градиент */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20"></div>
                    )}
                    
                    <div className="flex items-center justify-center space-x-3">
                      {/* Красивая иконка */}
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor: isSelected 
                            ? 'rgba(255,255,255,0.2)' 
                            : (isCorrect ? '#10B981' : '#EF4444'),
                          boxShadow: isSelected 
                            ? '0 0 20px rgba(255,255,255,0.3)' 
                            : '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        ) : (
                          <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        )}
                      </div>
                      
                      {/* Текст */}
                      <span className="text-lg sm:text-xl font-bold">{option}</span>
                      
                      {/* Индикатор выбора */}
                      <div 
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                        style={{
                          borderColor: isSelected ? 'white' : (isCorrect ? '#10B981' : '#EF4444'),
                          backgroundColor: isSelected ? 'white' : 'transparent'
                        }}
                      >
                        {isSelected && (
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                            style={{ backgroundColor: isCorrect ? '#10B981' : '#EF4444' }}
                          ></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Мерцающие частицы */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Заполнить пропуск */}
          {currentQuestion.type === 'fill-blank' && (
            <div>
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                className="w-full p-4 rounded-lg border-2 text-lg"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)'
                }}
                placeholder="Введите ваш ответ..."
              />
            </div>
          )}


        </div>
      </div>

      {/* Навигация */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
        <button
          onClick={() => onScreenChange('dashboard')}
          className="w-full sm:w-auto px-6 py-4 my-1 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg order-2 sm:order-1"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            color: 'var(--color-text)',
            borderColor: 'var(--color-border)',
            borderWidth: '2px'
          }}
        >
          ← Прервать тест
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer.trim()}
          className="w-full sm:w-auto px-8 py-4 my-1 rounded-xl font-bold text-lg hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl order-1 sm:order-2"
          style={{ 
            backgroundColor: !selectedAnswer.trim() ? '#94A3B8' : 'var(--color-primary)',
            color: 'white',
            boxShadow: !selectedAnswer.trim() ? 'none' : '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          {currentQuestionIndex === quiz.questions.length - 1 ? '🏆 Завершить тест' : 'Следующий вопрос →'}
        </button>
      </div>

      {/* Уведомления о достижениях */}
      {currentNotification && (
        <AchievementNotificationPopup
          notification={currentNotification}
          onClose={() => setCurrentNotification(null)}
        />
      )}
    </div>
  );
}