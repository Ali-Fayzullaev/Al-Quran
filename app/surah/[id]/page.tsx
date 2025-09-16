//app/surah/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Play } from "lucide-react";
import СhooseQari from "../../../components/surahs/СhooseQari";
import ChooseEdition from "../../../components/surahs/ChooseEdition";
import СhooseSurah from "../../../components/surahs/ChooseSurah";
import { Item } from "@radix-ui/react-select";
import ChooseQari from "../../../components/surahs/СhooseQari";
interface Ayah {
  numberInSurah: number;
  text: string;
}

interface Transl {
  numberInSurah: number;
  text: string;
}

interface QariList {
  audio: string;
  numberInSurah: number;
}

export default function Surah() {
  const params = useParams();
  const id = params.id;
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translation, setTranslation] = useState<Transl[]>([]);
  const [edition, setEdition] = useState("ru.kuliev");

  const [loading, setLoading] = useState(true);

  const [qariList, setQariList] = useState<QariList[]>([]);
  const [qari, setQari] = useState("ar.husary");

  useEffect(() => {
    async function loadSurah() {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}`);
        const data = await res.json();
        setAyahs(data.data.ayahs);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSurah();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem("edition");
    if (saved) setEdition(saved);
  }, []);

  useEffect(() => {
    async function loadTranslation() {
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${id}/${edition}`
        );

        const data = await res.json();
        setTranslation(data.data.ayahs);
      } catch (error) {
        console.error("Ошибка загрузки перевода:", error);
      }
    }
    loadTranslation();
  }, [id, edition]);

  useEffect(() => {
    const savedQari = localStorage.getItem("qari");
    if (savedQari) setQari(savedQari);
  }, []);

  useEffect(() => {
    async function loadQari() {
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${id}/${qari}`
        );

        const data = await res.json();
        setQariList(data.data.ayahs);
      } catch (error) {
        console.error("Ошибка загрузки перевода:", error);
      }
    }
    loadQari();
  }, [id, qari]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-[#13A895]" />
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-[#13A895]">📖 Сура {id}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Читать, слушать и изучать с тафсиром
        </p>
      </div>

      {/* Панель (аудио и тафсир) */}
      <div className="flex justify-between items-center mb-8 bg-gray-100 dark:bg-neutral-800 p-4 rounded-xl shadow">
        <ChooseQari
          value={qari}
          onChange={(val) => {
            setQari(val);
            localStorage.setItem("qari", val);
          }}
        />

        <СhooseSurah />
        <ChooseEdition  
          value={edition}
          onChange={(val) => {
            setEdition(val);
            localStorage.setItem("edition", val);
          }}
        />
      </div>

      {/* Аяты */}
      <div className="space-y-6">
        {ayahs.map((a) => {
          const transl = translation?.find(
            (t) => t.numberInSurah === a.numberInSurah
          );
          const audio = qariList?.find(
            (t) => t.numberInSurah === a.numberInSurah
          );

          return (
            <div
              key={a.numberInSurah}
              className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                {/* Номер аята */}
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#13A895]/20 text-[#13A895] font-bold">
                  {a.numberInSurah}
                </span>

                {/* Арабский текст */}
                <p className="text-right text-2xl leading-loose font-arabic flex-1 ml-4 text-gray-900 dark:text-gray-100">
                  {a.text}
                </p>
              </div>

              {/* Место для перевода (добавим позже) */}
              {/* Перевод */}
              {transl && (
                <p className="mt-4 text-gray-700 dark:text-gray-400 text-sm italic">
                  {transl.text}
                </p>
              )}

              <div className="flex justify-center items-center ">
                <audio controls src={audio?.audio}></audio>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
