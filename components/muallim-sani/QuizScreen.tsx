'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MuallamSaniProfile, Quiz, Question, QuestionAnswer } from '@/types/muallim-sani';
import { muallamSaniStore } from '@/lib/muallamSaniStore';

interface QuizScreenProps {
  profile: MuallamSaniProfile;
  quizId: string;
  onScreenChange: (screen: string, data?: any) => void;
  onProfileUpdate: (profile: MuallamSaniProfile) => void;
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
      text: 'Как читается слово "اِسْتَمَعَ" (7 букв)?',
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
      text: 'Как читается слово "اِسْتَقْبَلَ" (7 букв)?',
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
      options: ['дарба', 'дириба', 'дуруба', 'дариб'],
      correctAnswer: 'дарба',
      explanation: 'Слово "ضَرَبَ" читается как "дарба" - он ударил',
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



export default function QuizScreen({ profile, quizId, onScreenChange, onProfileUpdate }: QuizScreenProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  

  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Создаем квиз на основе ID уровня
    const questions = LEVEL_QUESTIONS[quizId] || LEVEL_QUESTIONS['alifba'];
    
    const mockQuiz: Quiz = {
      id: quizId,
      levelId: quizId,
      questions: questions,
      passingScore: 70,
      timeLimit: 10 // 10 минут
    };
    
    setQuiz(mockQuiz);
  }, [quizId]);

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

    // Сохранить результат и разблокировать следующий уровень
    muallamSaniStore.updateProgress(quiz.levelId, score, totalTime / 60);
    onProfileUpdate(muallamSaniStore.getProfile()!);

    setQuizCompleted(true);
    setShowResults(true);
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
        <div className="mb-8">
          <div className="text-8xl mb-4">
            {passed ? '🎉' : '😔'}
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            {passed ? 'Тест пройден!' : 'Нужно больше практики'}
          </h1>
          <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
            {getLevelName(quiz.levelId)}
          </p>
        </div>

        <div 
          className="rounded-xl p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: passed ? '#10B981' : '#EF4444' }}>
                {score}%
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Результат</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {correctAnswers}/{totalQuestions}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Правильных ответов</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {formatTime(quiz.timeLimit ? (quiz.timeLimit * 60 - timeLeft) : 0)}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Время</div>
            </div>
          </div>

          <div className="text-center">
            {passed ? (
              <div>
                <p className="text-lg mb-4" style={{ color: '#10B981' }}>
                  Отлично! Следующий уровень разблокирован.
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Минимальный балл: {quiz.passingScore}%
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-4" style={{ color: '#EF4444' }}>
                  Повторите материал и попробуйте еще раз.
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Нужно набрать минимум {quiz.passingScore}%
                </p>
              </div>
            )}
          </div>
        </div>

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
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            Тест: {getLevelName(quiz.levelId)}
          </h1>
          <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Проверьте свои знания по пройденному материалу
          </p>
        </div>

        <div 
          className="rounded-xl p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Вопросов
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                {quiz.questions.length}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Время
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                {quiz.timeLimit} минут
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
              Минимальный балл: <strong>{quiz.passingScore}%</strong>
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Типы вопросов: множественный выбор, верно/неверно, заполнить пропуск
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onScreenChange('dashboard')}
            className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}
          >
            ← Назад к урокам
          </button>
          
          <button
            onClick={handleStartQuiz}
            className="px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            🚀 Начать тест
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок и прогресс */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            🎯 {getLevelName(quiz.levelId)}
          </h1>
          <div className="text-lg font-semibold" style={{ 
            color: timeLeft < 60 ? '#EF4444' : 'var(--color-primary)' 
          }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Вопрос {currentQuestionIndex + 1} из {quiz.questions.length}
          </span>
          <span style={{ color: 'var(--color-primary)' }}>
            {Math.round(progressPercentage)}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--color-primary)'
            }}
          />
        </div>
      </div>

      {/* Вопрос */}
      <div 
        className="rounded-xl p-8 mb-8"
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
          
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            {currentQuestion.text}
          </h2>
        </div>

        {/* Варианты ответов */}
        <div className="space-y-4">
          {/* Множественный выбор */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:opacity-80`}
                  style={{ 
                    backgroundColor: selectedAnswer === option 
                      ? 'var(--color-primary)' 
                      : 'var(--color-background)',
                    color: selectedAnswer === option 
                      ? 'white' 
                      : 'var(--color-text)',
                    borderColor: selectedAnswer === option 
                      ? 'var(--color-primary)' 
                      : 'var(--color-border)'
                  }}
                >
                  {selectedAnswer === option ? '●' : '○'} {option}
                </button>
              ))}
            </div>
          )}

          {/* Верно/Неверно */}
          {currentQuestion.type === 'true-false' && (
            <div className="flex gap-4">
              {['Верно', 'Неверно'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all hover:opacity-80`}
                  style={{ 
                    backgroundColor: selectedAnswer === option 
                      ? (option === 'Верно' ? '#10B981' : '#EF4444')
                      : 'var(--color-background)',
                    color: selectedAnswer === option 
                      ? 'white' 
                      : 'var(--color-text)',
                    borderColor: selectedAnswer === option 
                      ? (option === 'Верно' ? '#10B981' : '#EF4444')
                      : 'var(--color-border)'
                  }}
                >
                  {option === 'Верно' ? '✅' : '❌'} {option}
                </button>
              ))}
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
      <div className="flex justify-between items-center">
        <button
          onClick={() => onScreenChange('dashboard')}
          className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            color: 'var(--color-text)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          ← Прервать тест
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer.trim()}
          className="px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
        >
          {currentQuestionIndex === quiz.questions.length - 1 ? 'Завершить тест' : 'Следующий вопрос'} →
        </button>
      </div>
    </div>
  );
}